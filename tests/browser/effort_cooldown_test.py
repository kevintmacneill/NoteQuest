"""Effort & Retention Cool-Down on the real Harbor screens (engine 1.9.5; Kevin 2026-11-27).

- answers from the lesson screen carry the answer time (ms) to the engine;
- after three first-try misses in five, opening a new stop shows the warm cool-down message instead of doing nothing;
- practice on a started skill stays open.
"""
import asyncio
import functools
import http.server
import threading

from harbor_lessons_test import OBSERVE_QUESTIONS, QuietHandler, ROOT
from playwright.async_api import async_playwright, expect

RECORD = """() => {
  const answer = NQ.learn.answer;
  window.answerOpts = [];
  NQ.learn.answer = (...args) => { window.answerOpts.push(args[2] || null); return answer(...args); };
}"""


async def run(url):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        errors = []
        for width, height in [(390, 844), (1180, 820)]:
            ctx = await browser.new_context(viewport={"width": width, "height": height}, has_touch=True, reduced_motion="reduce")
            page = await ctx.new_page()
            page.on("pageerror", lambda err: errors.append(str(err)))
            await page.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
            await page.goto(url)
            await page.evaluate("NQ.settings.set('lessonListen', 'off')")
            await page.get_by_role("button", name="Tap to Play", exact=True).click()
            await page.locator('[data-go="newProfile"]').click()
            await page.locator("#pname").fill("Cooldown")
            await page.locator("#mk").click()
            await page.get_by_role("button", name="Keep Melody").click()
            await page.evaluate(OBSERVE_QUESTIONS)
            await page.evaluate(RECORD)

            # practice the first skill from the lesson screen: taps carry an answer time
            await page.evaluate("go('engineLesson', 'NQ-00-U01')")
            await page.get_by_role("button", name="I've explored it").click()
            title = await page.evaluate("NQ.learn.skill('NQ-00-U01-S01').title.child")
            await page.get_by_role("button", name=f"Practice {title}", exact=True).tap()
            q = await page.evaluate("window.lastQuestion")
            await page.wait_for_timeout(400)
            await page.get_by_role("button", name="C sharp" if q["group"] == 2 else "F sharp", exact=False).tap()
            opts = await page.evaluate("answerOpts.at(-1)")
            assert opts and isinstance(opts.get("ms"), int) and 300 <= opts["ms"] < 20000, opts
            print(f"PASS {width}x{height} a tapped answer sends its answer time ({opts['ms']} ms)", flush=True)

            # three first-try misses in five start a cool-down
            for _ in range(3):
                q = await page.evaluate("window.lastQuestion")
                wrong = "F sharp" if q["group"] == 2 else "C sharp"
                right = "C sharp" if q["group"] == 2 else "F sharp"
                await page.get_by_role("button", name=wrong, exact=False).tap()
                await page.get_by_role("button", name=right, exact=False).tap()
            cooldown = await page.evaluate("NQ.learn.cooldown()")
            assert cooldown and cooldown["reason"] == "retention", cooldown

            # a new stop is paused with a warm message; practice stays open
            await page.evaluate("NQ.learn.place('NQ-00-U03')")   # test setup: placement is never paused; U03 becomes the next stop to open
            await page.evaluate("go('engineLesson', 'NQ-00-U03')")
            await page.get_by_role("button", name="I've explored it").click()
            await expect(page.get_by_text("Your brain worked hard and is locking those notes in!", exact=False)).to_be_visible()
            assert not await page.evaluate("Boolean(NQ.state().profiles.at(-1).learn.learned['NQ-00-U03'])"), "the stop stayed closed"
            await page.evaluate("go('engineLesson', 'NQ-00-U01')")
            await page.get_by_role("button", name=f"Practice {title}", exact=True).tap()
            await expect(page.get_by_text("Question 1 of", exact=False)).to_be_visible()
            print(f"PASS {width}x{height} a paused new stop shows the cool-down message; practice stays open", flush=True)
            await ctx.close()
        assert not errors, errors
        print("PASS no page errors", flush=True)
        await browser.close()


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(run(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
