"""Verify the readiness UI against the real engine. Run with Playwright Chromium."""
import asyncio
import functools
import http.server
import os
from pathlib import Path
import threading

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


async def play(base):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844}, has_touch=True)
        page.set_default_timeout(12000)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        passed = 0

        def check(label, condition):
            nonlocal passed
            assert condition, label
            passed += 1
            print("PASS " + label)

        def button(name):
            return page.get_by_role("button", name=name, exact=True)

        async def open_gate():
            await page.evaluate("() => go('nqwWorld', 'NQ-00')")
            await button("Prepare for the journey").click()
            await expect(page.get_by_role("heading", name="Ready for the Journey?")).to_be_visible()

        async def observe():
            await page.evaluate("""() => {
              for (const name of ['start', 'answer', 'confirm']) {
                const original = NQ.journey[name];
                NQ.journey[name] = (...args) => {
                  const response = original(...args);
                  window.lastQuestion = response.question || response.next;
                  return response;
                };
              }
            }""")

        async def rhythm(question):
            await button("▶ Start count-in").click()
            period = 60000 / question["bpm"]
            await page.clock.run_for(round(4 * period))
            pad = button("TAP THE BEAT")
            for length in question["flat"]:
                await pad.dispatch_event("keydown", {"code": "Space"})
                await page.clock.run_for(round(length * period - 45))
                await pad.dispatch_event("keyup", {"code": "Space"})
                await page.clock.run_for(45)
            await button("Finish my rhythm").click()

        async def answer(correct=True):
            question = await page.evaluate("window.lastQuestion")
            if question["type"] == "symbol":
                choose_black = (question["show"] == "key-black") == correct
                await button("Black key" if choose_black else "White key").click()
            elif question["type"] == "highLow":
                await button("▶ Listen").click()
                choose_first = (question["a"] > question["b"]) == correct
                await button("First sound" if choose_first else "Second sound").click()
            elif question["type"] == "rhythmTap":
                await rhythm(question)
            else:
                assert question["grownUp"], question
                hold = page.get_by_role("button", name="Grown-up: I observed this (hold for three seconds)")
                await hold.focus()
                await page.keyboard.down("Space")
                await page.clock.run_for(3100)
                await page.keyboard.up("Space")

        await page.clock.install()
        await page.goto(base)
        await page.locator(".nq-launch-start").click()
        await page.evaluate("""() => {
          const profile = NQ.profiles.create('Journey Tester', '🎹');
          NQ.pets.init();
          NQ.pets.chooseStarter('puppy', 'Scout');
          rememberPlayer(profile.id);
        }""")
        await observe()
        await open_gate()
        await page.locator(".nqh-journey-dragon").wait_for()
        await page.wait_for_function("document.querySelector('.nqh-journey-dragon').naturalWidth === 256")
        check("Readiness shows the canonical 256px dragon and J3 early-placement warning",
              'reference-v1.webp' in await page.locator(".nqh-journey-dragon").get_attribute("src")
              and await page.get_by_text("If you pass all three early", exact=False).is_visible())
        evidence = os.environ.get("NQ_SCREENSHOTS")
        if evidence:
            await page.screenshot(path=str(Path(evidence) / "harbor-readiness-mobile.png"), full_page=True)
        coins = await page.evaluate("NQ.coins.balance()")

        await button("Begin Challenge").click()
        await answer()
        await button("Leave challenge").click()
        check("Leaving after one answer saves no partial pass",
              not await page.evaluate("NQ.journey.status('NQ-00').parts.navigation.passed"))
        await button("Begin Challenge").click()
        for _ in range(5):
            await answer(correct=False)
        check("Five wrong answers show the real result and retain lock",
              await page.get_by_text("0 of 5 correct on the first try.").is_visible()
              and not await page.evaluate("NQ.journey.status('NQ-00').unlocked"))
        await button("Back to travel preparation").click()

        await button("Begin Challenge").click()
        for index in range(5):
            await answer(correct=index != 0)
        check("Exactly four first-try correct answers pass a challenge",
              await page.get_by_text("4 of 5 correct on the first try.").is_visible()
              and await page.evaluate("NQ.journey.status('NQ-00').parts.navigation.passed"))

        await page.reload()
        await page.locator(".nq-launch-start").click()
        await observe()
        await open_gate()
        check("Passed navigation survives refresh and cannot be restarted",
              not await button("Start Find the Notes").is_visible())
        await button("Start Play Your Song").click()
        hold = page.get_by_role("button", name="Grown-up: I observed this (hold for three seconds)")
        await hold.click()
        check("A tap cannot submit caregiver evidence", (await page.evaluate("window.lastQuestion.index")) == 0)
        await button("Not ready yet").click()
        check("Returning without a grown-up records no caregiver pass",
              not await page.evaluate("NQ.journey.status('NQ-00').parts.performance.passed"))
        await button("Start Play Your Song").click()
        for _ in range(5):
            await answer()
        check("Genuine hold interaction leaves only caregiver evidence",
              await page.evaluate("NQ.journey.status('NQ-00').parts.performance.evidence.join()") == "caregiver")
        await button("Back to travel preparation").click()
        await button("Start Keep the Beat").click()
        for _ in range(5):
            await answer()
        check("Third part unlocks World 2 through engine J3 placement",
              await page.get_by_text("Your next destination is ready.").is_visible()
              and await page.evaluate("NQ.journey.status('NQ-00').placed && "
                                      "NQ.learn.stopStatus('NQ-01-S1').unlocked"))
        check("Readiness awards no coins",
              await page.evaluate("NQ.coins.balance()") == coins)
        await button("Back to travel preparation").click()
        await button("Visit Amazon Rainforest").click()
        check("Unlocked destination route opens the correct world's map",
              await page.get_by_role("heading", name="Your path through Amazon Rainforest").is_visible())
        await open_gate()
        await button("Back to Village").click()
        check("Village return preserves the learner and verified unlock",
              await page.evaluate("NQ.profiles.current().name === 'Journey Tester' && "
                                  "NQ.journey.status('NQ-00').unlocked"))
        check("No page errors or phone overflow", not errors and
              await page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        await browser.close()
        print(f"{passed} passed, 0 failed")


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT)
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(play(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
