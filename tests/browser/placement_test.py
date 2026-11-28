"""Exercise optional placement through the player UI and the engine."""
import asyncio
import functools
import http.server
import os
import threading
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass



def key_for(q, correct):
    """The on-screen black key to tap for a keyGroup question (a named key when the question has a position)."""
    named = {"left": "C sharp", "right": "D sharp", "middle": "G sharp"}
    if correct:
        return named[q["position"]] if q.get("position") else ("C sharp" if q["group"] == 2 else "F sharp")
    return "F sharp" if q["group"] == 2 else "C sharp"

async def play(url):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844},
                                      has_touch=True, reduced_motion="reduce")
        errors = []
        page.set_default_timeout(6000)
        page.on("pageerror", lambda err: errors.append(str(err)))
        button = lambda label: page.get_by_role("button", name=label, exact=True)
        heading = lambda title: page.get_by_role("heading", name=title, exact=True)
        await page.clock.install()
        await page.goto(url)
        await page.locator(".nq-launch-start").tap()

        async def onboard(name):
            await page.locator('[data-go="newProfile"]').tap()
            await page.locator("#pname").fill(name)
            await page.locator("#mk").tap()
            await expect(heading("Meet your kitten")).to_be_visible()
            await page.get_by_label("Kitten name").fill("Scout")
            await button("Go to the village").tap()
            await button("Choose where to start").tap()
            await expect(heading("Find your starting point")).to_be_visible()

        async def hold_for_grown_up(hold):
            await hold.focus()
            await page.keyboard.down("Space")
            await page.clock.run_for(3100)
            await page.keyboard.up("Space")

        async def observe_questions():
            await page.evaluate("""() => {
              for (const name of ['start', 'answer', 'confirm']) {
                const fn = NQ.journey[name];
                NQ.journey[name] = (...args) => {
                  const result = fn(...args);
                  window.question = result.question || result.next;
                  return result;
                };
              }
            }""")

        async def answer(correct):
            q = await page.evaluate("window.question")
            kind = q["type"]
            if kind == "keyGroup":
                key = key_for(q, correct)
                await page.get_by_role("button", name=key, exact=False).tap()
            elif kind == "keyboardSide":
                await button("← Left side" if (q["ask"] == "low") == correct else "Right side →").tap()
            elif kind in ("highLow", "durationCompare"):
                await button("▶ Listen").tap()
                first = (q["a"] < q["b"] if q.get("ask") == "lower" else q["a"] > q["b"]) if kind == "highLow" else (
                    (q["a"]["seconds"] > q["b"]["seconds"]) == (q["ask"] == "longer"))
                await button("First sound" if first == correct else "Second sound").tap()
            elif kind == "rhythmTap":
                assert correct, q
                await button("▶ Start count-in").tap()
                period = 60000 / q["bpm"]
                await page.clock.run_for(round(4 * period))
                pad = button("TAP THE BEAT")
                for length in q["flat"]:
                    await pad.dispatch_event("keydown", {"code": "Space"})
                    await page.clock.run_for(round(length * period - 45))
                    await pad.dispatch_event("keyup", {"code": "Space"})
                    await page.clock.run_for(45)
                await button("Finish my rhythm").tap()
            else:
                assert q["grownUp"] and correct, q
                await hold_for_grown_up(button("Grown-up: I observed this (hold for three seconds)"))

        async def screenshot(name):
            if directory := os.environ.get("NQ_SCREENSHOTS") or os.environ.get("NQ_WWW"):
                output = Path(directory)
                output.mkdir(parents=True, exist_ok=True)
                await page.screenshot(path=output / name, full_page=True, timeout=6000)

        await onboard("Start at Harbor")
        await screenshot("placement-choices-mobile.png")
        await button("Skip placement").tap()
        await button("Hold for 3 seconds").tap()
        assert await page.evaluate("NQ.placement.status().pending")
        await button("Cancel").tap()
        await expect(heading("Find your starting point")).to_be_visible()
        assert await page.evaluate("NQ.placement.status().pending")
        await button("Skip placement").tap()
        await hold_for_grown_up(button("Hold for 3 seconds"))
        await expect(button("Choose where to start")).to_have_count(0)
        assert await page.evaluate("NQ.placement.status().how") == "skipped"
        await page.reload()
        await page.locator(".nq-launch-start").tap()
        await expect(page.locator("#nq-menu-title")).to_contain_text("Start at Harbor")
        await expect(button("Choose where to start")).to_have_count(0)
        await page.locator(".nq-village-continue").tap()
        await expect(heading("Meet the piano")).to_be_visible()
        print("PASS grown-up hold skips placement; cancel, short tap and reload preserve the correct state")

        await page.locator('.back[data-go="menu"]').tap()
        await page.locator("#nq-village-player").tap()
        await onboard("Grown-up choice")
        await button("Ask a grown-up to choose").tap()
        hold = button("Hold for 3 seconds")
        await hold.tap()
        await expect(page.get_by_label("Starting world")).to_have_count(0)
        await hold_for_grown_up(hold)
        worlds = page.get_by_label("Starting world")
        await expect(worlds.locator('option[value="NQ-01"]')).to_be_disabled()
        await expect(worlds.locator('option[value="NQ-01"]')).to_have_text("Amazon Rainforest (coming soon)")
        await worlds.select_option("NQ-00")
        await button("Set starting world").tap()
        await expect(heading("Your starting point")).to_be_visible()
        assert await page.evaluate("NQ.placement.status().how") == "grown-up"
        assert await page.evaluate("NQ.learn.currentStop()") == "NQ-00-U01"
        await button("Continue Adventure").tap()
        await expect(heading("Meet the piano")).to_be_visible()
        print("PASS grown-up world choice offers playable Harbor and disables coming-soon worlds")

        await page.evaluate("go('profiles')")
        await onboard("Try placement")
        await button("Show what you know").tap()
        await expect(heading("Show what you know")).to_be_visible()
        await observe_questions()
        await button("Begin Challenge").tap()
        await answer(correct=True)
        await button("Leave challenge").tap()
        assert not await page.evaluate("NQ.journey.status('NQ-00').parts.navigation.passed")
        await button("Back to Village").tap()
        await page.reload()
        await page.locator(".nq-launch-start").tap()
        await expect(heading("Who’s playing today?")).to_be_visible()
        await button("Try placement").tap()
        await button("Resume placement").tap()  # Village
        await button("Resume placement").tap()  # Placement prompt
        await expect(heading("Show what you know")).to_be_visible()
        print("PASS an unfinished placement can be resumed after refresh")

        await observe_questions()
        await button("Begin Challenge").tap()
        for _ in range(5):
            await answer(correct=False)
        await expect(heading("Practice and try again")).to_be_visible()
        await button("Back to placement").tap()
        await expect(heading("Your starting point")).to_be_visible()
        assert await page.evaluate("NQ.placement.status().how") == "checks"
        assert await page.evaluate("NQ.learn.currentStop()") == "NQ-00-U01"
        assert await page.evaluate("!NQ.learn.stopStatus('NQ-01-U01').unlocked")
        await button("Continue Adventure").tap()
        await expect(heading("Meet the piano")).to_be_visible()
        print("PASS an unsuccessful placement check routes to Harbor and keeps World 2 locked")

        await page.evaluate("go('profiles')")
        await page.locator(".pcard").filter(has_text="Start at Harbor").tap()
        assert await page.evaluate("NQ.placement.status().how") == "skipped"
        assert not errors, errors
        print("PASS placement choices stay with each learner")

        await page.evaluate("go('profiles')")
        await onboard("Ready to travel")
        await button("Show what you know").tap()
        await screenshot("placement-check-mobile.png")
        for index in range(3):
            await button("Begin Challenge").tap()
            for _ in range(5):
                await answer(correct=True)
            await expect(heading("Challenge passed")).to_be_visible()
            await button("Back to placement").tap()
            if index < 2:
                await button("Resume placement").tap()
        assert await page.evaluate("NQ.learn.currentStop()") == "NQ-01-U01"
        assert await page.evaluate("NQ.journey.status('NQ-00').placed")
        assert not await page.evaluate("NQ.learn.stopStatus('NQ-02-U01').unlocked")
        print("PASS three engine-scored placement challenges open the correct next world")

        await expect(button("Resume placement")).to_have_count(0)
        await expect(page.get_by_text("Placement challenges for Amazon Rainforest are coming soon.", exact=False)).to_be_visible()
        await button("Finish placement").tap()
        await hold_for_grown_up(button("Hold for 3 seconds"))
        await button("Continue Adventure").tap()
        await expect(heading("Your path through Amazon Rainforest")).to_be_visible()
        assert not errors, errors
        print("PASS unsupported challenges fail safely and completing placement keeps the earned destination")
        await browser.close()
        print("7 passed, 0 failed")


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(play(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
