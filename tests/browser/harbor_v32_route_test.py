"""Verify exact engine routing through Harbor with a v3.2 engine checkout."""
import asyncio
import datetime
import functools
import http.server
import threading

from harbor_lessons_test import OBSERVE_QUESTIONS, QuietHandler, ROOT
from playwright.async_api import async_playwright, expect

PLAY_ROUND = """([id, mode]) => {
  const round = NQ.learn.start(id, mode);
  if (!round.ok) throw Error(id + ': ' + round.reason);
  let q = round.question;
  for (let i = 0; i < round.total; i++) {
    const v = {
      keyGroup: () => q.position ? {left: 61, right: 63, middle: 68}[q.position] : q.group === 2 ? 61 : 66,
      highLow: () => (q.ask === 'lower' ? q.a < q.b : q.a > q.b) ? 'a' : 'b',
      keyboardSide: () => q.ask === 'low' ? 'left' : 'right',
      durationCompare: () => ((q.a.seconds > q.b.seconds) === (q.ask === 'longer') ? 'a' : 'b'),
      rhythmTap: () => ({start: 0, presses: q.onsets.map((o, j) => [
        o * 60 / q.bpm, (o + q.flat[j] - .05) * 60 / q.bpm
      ])}),
      self: () => true,
      caregiver: () => true
    }[q.type]();
    const reply = NQ.learn.answer(round.roundId, v);
    if (!reply.ok || !reply.correct) throw Error(id + ': ' + JSON.stringify(reply));
    q = reply.next;
    if (reply.done) return reply.result.pass;
  }
  return false;
}"""


async def play(url):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844}, has_touch=True,
                                      reduced_motion="reduce")
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        button = lambda name: page.get_by_role("button", name=name, exact=True)
        start = datetime.datetime(2026, 11, 23, 10, tzinfo=datetime.timezone.utc)
        await page.clock.install(time=start)
        await page.goto(url)
        assert await page.evaluate("NQ.learn.curriculum().id") == "3.2", "Run with the v3.2 engine"
        await button("Tap to Play").click()
        await page.locator('[data-go="newProfile"]').click()
        await page.locator("#pname").fill("Harbor Test")
        await page.locator("#mk").click()
        await page.get_by_role("button", name="Keep Melody").click()
        await page.evaluate(OBSERVE_QUESTIONS)

        async def black_key_round(mode):
            skill = await page.evaluate("NQ.learn.skill('NQ-00-U01-S01').title.child")
            await button(f"{mode} {skill}").tap()
            first = await page.evaluate("window.lastQuestion")
            if mode == "Practice":
                wrong = "F sharp" if first["group"] == 2 else "C sharp"
                await page.get_by_role("button", name=wrong, exact=False).tap()
                await expect(page.get_by_text("Not quite. Give it another try.")).to_be_visible()
                assert await page.evaluate("window.lastQuestion.index") == 0
            for index in range(first["total"]):
                question = await page.evaluate("window.lastQuestion")
                assert question["index"] == index
                key = "C sharp" if question["group"] == 2 else "F sharp"
                await page.get_by_role("button", name=key, exact=False).tap()
            heading = "Practice finished" if mode == "Practice" else "Skill check passed"
            await expect(page.get_by_role("heading", name=heading)).to_be_visible()
            await button("Back to lesson").last.tap()

        for index in range(1, 7):
            stop = f"NQ-00-U{index:02}"
            status = await page.evaluate("id => NQ.learn.stopStatus(id)", stop)
            assert status["unlocked"], status
            assert await page.evaluate("NQ.learn.currentStop()") == stop
            await button("▶ Continue Adventure").click()
            await expect(page.get_by_role("heading", name=status["title"]["child"], exact=True).first).to_be_visible()
            await button("I've explored it").click()
            deferred = sum(not skill["playable"] for skill in status["skills"])
            await expect(page.get_by_text("This activity is coming soon.")).to_have_count(deferred)
            for skill in status["skills"]:
                if not skill["playable"]:
                    continue
                skill_id = skill["id"]
                if skill_id == "NQ-00-U01-S01":
                    await black_key_round("Practice")
                    await black_key_round("Check")
                else:
                    assert await page.evaluate(PLAY_ROUND, [skill_id, "practice"])
                    assert await page.evaluate(PLAY_ROUND, [skill_id, "check"])
            assert not await page.evaluate("id => NQ.learn.stopStatus(id).complete", stop)
            await page.clock.set_system_time(start + datetime.timedelta(days=index))
            for skill in status["skills"]:
                if skill["id"] == "NQ-00-U01-S01":
                    await black_key_round("Check")
                    print("PASS touch practice, wrong-answer retry and two-day checks for black-key groups", flush=True)
                elif skill["playable"]:
                    assert await page.evaluate(PLAY_ROUND, [skill["id"], "check"])
            assert await page.evaluate("id => NQ.learn.stopStatus(id).complete", stop)
            await button("Back to Village").first.click()
            print(f"PASS Continue, Learn and real two-day scoring for {stop}", flush=True)

        await button("▶ Continue Adventure").click()
        await expect(page.get_by_role("heading", name="Journey Readiness", exact=False).first).to_be_visible()
        await expect(page.locator(".nqh-readiness-card").get_by_role("button")).to_have_count(3)
        assert not await page.evaluate("NQ.learn.stopStatus('NQ-01-U01').unlocked")
        print("PASS Harbor graduation leads to Journey Readiness with World 2 still locked", flush=True)

        await page.reload()
        await button("Tap to Play").click()
        await expect(button("▶ Continue Adventure")).to_be_visible()
        assert await page.evaluate("""NQ.learn.stops('NQ-00')
            .every(id => NQ.learn.stopStatus(id).complete)""")
        await button("▶ Continue Adventure").click()
        await expect(page.get_by_role("heading", name="Journey Readiness", exact=False).first).to_be_visible()
        assert not errors, errors
        print("PASS returning learner resumes at Journey Readiness after refresh", flush=True)
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
