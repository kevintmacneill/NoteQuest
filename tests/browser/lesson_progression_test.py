"""Browser regression for practice progression and per-learner persistence on PR #112."""
import asyncio
import functools
import http.server
from datetime import datetime, timezone
from pathlib import Path
import threading

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


async def play(url):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 390, "height": 844}, has_touch=True, reduced_motion="reduce"
        )
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        async def open_game():
            await page.get_by_role("button", name="Tap to Play").click()
            await expect(page.get_by_role("dialog", name="Welcome to NoteQuest")).to_have_count(0)

        async def continue_lesson():
            await page.locator(".nq-village-continue").click()
            await expect(page.get_by_role("heading", name="Music Lesson", exact=True)).to_be_visible()

        async def observe_engine():
            # Observe public question data and call the original engine methods.
            await page.evaluate("""() => {
              const {start, answer, cancel} = NQ.learn;
              window.lastRound = null;
              NQ.learn.start = (...args) => {
                const reply = start(...args);
                window.lastRound = {skill: args[0], mode: args[1], ...reply};
                return reply;
              };
              NQ.learn.answer = (...args) => {
                const reply = answer(...args);
                window.lastRound.question = reply.next;
                return reply;
              };
              NQ.learn.cancel = roundId => {
                window.cancelledRound = roundId;
                return cancel(roundId);
              };
            }""")

        async def start_round(skill, mode):
            await page.locator("#nq109-start").click()
            current = await page.evaluate("window.lastRound")
            assert (current["skill"], current["mode"]) == (skill, mode), current
            return current

        async def finish_round(skill, mode):
            current = await start_round(skill, mode)
            for _ in range(current["total"]):
                q = await page.evaluate("window.lastRound.question")
                if q["type"] == "symbol":
                    answer = q["show"].removeprefix("key-")
                else:
                    assert q["type"] == "highLow", q
                    await page.locator("#nq109-play-a").click()
                    await page.locator("#nq109-play-b").click()
                    answer = "a" if q["a"] > q["b"] else "b"
                await page.locator(f'[data-nq109-answer="{answer}"]').click()
            await expect(page.get_by_role("heading", name="Round finished", exact=True)).to_be_visible()
            await page.locator("#nq109-next").click()

        await page.clock.set_fixed_time(datetime(2026, 11, 23, 18, tzinfo=timezone.utc))
        await page.goto(url)
        await open_game()
        await page.evaluate("""() => {
          for (const name of ['Learner A', 'Learner B']) {
            NQ.profiles.create(name, '🐰');
            NQ.pets.init();
            NQ.pets.chooseStarter('puppy', 'Pip');
          }
          go('profiles');
        }""")
        await page.locator(".pcard").filter(has_text="Learner A").click()
        await observe_engine()
        await continue_lesson()
        await page.locator("#nq109-learn").click()
        await finish_round("k-blackwhite", "practice")
        await finish_round("e-highlow", "practice")
        assert await page.evaluate("NQ.learn.stopStatus('NQ-00-S1').step") == "check"
        print("PASS both practice skills advance to check")

        await finish_round("k-blackwhite", "check")
        await finish_round("e-highlow", "check")
        assert await page.evaluate("NQ.learn.stopStatus('NQ-00-S1').complete") is False
        print("PASS both checks can be done on day one without granting mastery")

        unfinished = await start_round("k-blackwhite", "check")
        await page.get_by_role("button", name="Back to Village", exact=True).click()
        assert await page.evaluate("window.cancelledRound") == unfinished["roundId"]
        await page.locator(".nq-village-profile").click()
        await page.locator(".pcard").filter(has_text="Learner B").click()
        await continue_lesson()
        await expect(page.locator("#nq109-learn")).to_be_visible()
        assert await page.evaluate("NQ.learn.skillState('k-blackwhite').passDays") == 0
        print("PASS leaving cancels the round and a second learner starts fresh")

        await page.get_by_role("button", name="Back to Village", exact=True).click()
        await page.locator(".nq-village-profile").click()
        await page.locator(".pcard").filter(has_text="Learner A").click()
        await page.reload()
        await open_game()
        assert "Learner A" in await page.locator("#nq-menu-title").inner_text()
        await observe_engine()
        await continue_lesson()
        assert await page.evaluate("NQ.learn.skillState('e-highlow').passDays") == 1
        print("PASS learner selection and completed check persist on reload")

        await page.clock.set_fixed_time(datetime(2026, 11, 24, 18, tzinfo=timezone.utc))
        await finish_round("k-blackwhite", "check")
        await finish_round("e-highlow", "check")
        await expect(page.get_by_role("heading", name="Lesson complete", exact=True)).to_be_visible()
        assert await page.evaluate("NQ.learn.stopStatus('NQ-00-S1').complete") is True
        assert await page.evaluate("NQ.learn.currentStop()") == "NQ-00-S2"
        print("PASS second check day saves both skills and unlocks the next engine stop")
        await page.get_by_role("button", name="Continue Adventure", exact=True).click()
        await expect(page.get_by_role("heading", name="🧭 Music Journey", exact=True)).to_be_visible()
        assert await page.evaluate("NQ.learn.stopStatus('NQ-00-S2').step") == "learn"
        print("PASS unsupported next stop falls back without recording progress")
        assert not errors, errors
        await browser.close()


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT)
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(play(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
