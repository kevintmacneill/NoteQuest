"""Exercise the layered artwork in the actual game and its fallback."""
import asyncio
import functools
import http.server
from pathlib import Path
import threading

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


async def run(url):
    async with async_playwright() as pw:
        async def enter(width, height, reduced=False, failure=None, foreground_ready=None):
            browser = await pw.chromium.launch()
            page = await browser.new_page(viewport={"width": width, "height": height},
                                          has_touch=width < 600,
                                          reduced_motion="reduce" if reduced else "no-preference")
            await page.route("https://fonts.googleapis.com/**", lambda route: route.fulfill(body=""))
            if failure == "missing":
                await page.route("**/nq-overlook-city-v2.webp", lambda route: route.abort())
            if failure == "mismatched":
                await page.route("**/nq-overlook-city-v2.webp", lambda route: route.fulfill(
                    path=ROOT / "assets/nq-city-overlook-v1.avif", content_type="image/avif"))
            if foreground_ready:
                async def hold_foreground(route):
                    await foreground_ready.wait()
                    await route.continue_()
                await page.route("**/nq-overlook-foreground-v2.webp", hold_foreground)
            errors = []
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            await page.goto(url)
            await page.locator(".nq-launch-start").click()
            await page.get_by_role("dialog", name="Welcome to NoteQuest").wait_for(state="detached")
            await page.evaluate("""() => {
              NQ.profiles.create('Overlook tester','🐱');
              NQ.pets.init();
              NQ.pets.chooseStarter('kitten', 'Chip');
              go('menu');
            }""")
            return browser, page, errors

        for width, height in [(390, 844), (820, 1180), (1280, 720), (1366, 900), (2560, 1440)]:
            browser, page, errors = await enter(width, height)
            art = page.locator(".nq-parallax-active")
            await expect(art.locator("img")).to_have_count(4)
            geometry = await page.evaluate("""() => {
              const view=document.querySelector('.nq-city-viewport');
              const track=document.querySelector('.nq-city-track').getBoundingClientRect();
              const city=document.querySelector('.nq-parallax-city').getBoundingClientRect();
              const gate=document.querySelector('.nq-city-hotspots [data-building="gate"]').getBoundingClientRect();
              const sky=document.querySelector('.nq-parallax-sky');
              return {track:track.width, height:track.height, city:city.width,
                offset:city.left-track.left, gate:[(gate.left-track.left)/track.width,(gate.top-track.top)/track.height,
                  (gate.right-track.left)/track.width,(gate.bottom-track.top)/track.height],
                sky:sky.getBoundingClientRect().width, skySource:sky.naturalWidth,
                scroll:view.scrollLeft, max:view.scrollWidth-view.clientWidth};
            }""")
            assert abs(geometry["track"] / geometry["height"] - 3) < .01, geometry
            assert geometry["city"] == geometry["track"] and abs(geometry["offset"]) < 1, geometry
            # The Adventure Gate's traced shape sits exactly on the painted gate (city layer pixels).
            expected = [908 / 2172, 40 / 724, 1258 / 2172, 455 / 724]
            assert all(abs(a - b) < .003 for a, b in zip(geometry["gate"], expected)), geometry
            assert geometry["sky"] <= geometry["skySource"], geometry
            assert abs(geometry["scroll"] - geometry["max"] / 2) < 2, geometry
            assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            await expect(page.locator(".nq-village-continue")).to_be_in_viewport(ratio=.9)
            if geometry["max"] > 0:
                await page.locator(".nq-city-viewport").press("ArrowRight")
                await page.wait_for_function("""start =>
                    document.querySelector('.nq-city-viewport').scrollLeft > start""", arg=geometry["scroll"])
                await page.get_by_role("button", name="Learning district").click()
            # Tap-a-building (M5): the first tap previews; a second tap (or Visit) enters.
            gate = page.get_by_role("button", name="Adventure Gate", exact=True)
            if width < 600:
                await gate.tap()
                await expect(page.get_by_role("region", name="Adventure Gate")).to_be_visible()
                await gate.tap()
            else:
                await gate.click()
                await expect(page.get_by_role("region", name="Adventure Gate")).to_be_visible()
                await page.get_by_role("button", name="Visit Adventure Gate").click()
            await expect(page.get_by_role("heading", name="Meet the piano", exact=True)).to_be_visible()
            assert not errors, errors
            await browser.close()
            print(f"PASS {width}×{height}: all four layers, pinned geometry and real gate navigation")

        browser, page, errors = await enter(390, 844, reduced=True)
        await expect(page.locator(".nq-parallax-active")).to_be_visible()
        await page.locator(".nq-city-viewport").press("ArrowRight")
        assert await page.locator(".nq-parallax-sky").evaluate(
            "el => getComputedStyle(el).animationName === 'none' && getComputedStyle(el).transform === 'none'")
        assert not errors, errors
        await browser.close()
        print("PASS reduced motion keeps the painted sky still while the village remains pannable")

        ready = asyncio.Event()
        browser, page, errors = await enter(390, 844, foreground_ready=ready)
        await expect(page.locator(".nq-village-art")).to_be_visible()
        await expect(page.locator(".nq-parallax-active")).to_have_count(0)
        viewport = page.locator(".nq-city-viewport")
        await viewport.evaluate("v => { v.scrollLeft = (v.scrollWidth - v.clientWidth) * .75; }")
        ready.set()
        await expect(page.locator(".nq-parallax-active")).to_be_visible()
        assert await viewport.evaluate("v => Math.abs(v.scrollLeft / (v.scrollWidth - v.clientWidth) - .75) < .01")
        assert not errors, errors
        await browser.close()
        print("PASS slow foreground keeps fallback visible and preserves the player's pan position")

        for failure in ("missing", "mismatched"):
            browser, page, errors = await enter(390, 844, failure=failure)
            await expect(page.locator(".nq-parallax-scene")).to_have_count(0)
            await expect(page.locator(".nq-village-art")).to_be_visible()
            # Without the layers the building shapes are off; the labels still preview and enter.
            await expect(page.locator(".nq-city-hotspots")).to_be_hidden()
            await page.get_by_role("button", name="Adventure Gate", exact=True).tap()
            await page.get_by_role("button", name="Visit Adventure Gate").tap()
            await expect(page.get_by_role("heading", name="Meet the piano", exact=True)).to_be_visible()
            assert not errors, errors
            await browser.close()
            print(f"PASS {failure} layer uses static fallback with working navigation")


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT)
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(run(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
