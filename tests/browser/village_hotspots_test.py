"""Tap-a-building village (M5, owner decision 2026-11-26).

The first tap on a building previews it; Visit or a second tap enters; tapping away or Esc
dismisses. Live: Adventure Gate, Music Academy, Music Library, Companion Sanctuary (with a
Hospital Bay door). Coming soon: Practice Hall, Sticker & Trophy House, Marketplace and
Explorer's Outpost. The old Practice Games and Sticker Book entry points stay hidden.
"""
import asyncio
import functools
import http.server
import threading
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
LIVE = {'Adventure Gate': ['Visit Adventure Gate'], 'Music Academy': ['Visit Music Academy'],
        'Music Library': ['Visit Music Library'], 'Companion Sanctuary': ['Visit the pen', 'Visit Hospital Bay']}
SOON = ['Practice Hall', 'Sticker & Trophy House', 'Marketplace', "Explorer's Outpost"]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


async def village(browser, url, width, height, touch):
    ctx = await browser.new_context(viewport={'width': width, 'height': height}, has_touch=touch,
                                    reduced_motion='reduce')
    page = await ctx.new_page()
    await page.route('**/assets/avatars/avatar-art-manifest.json',
                     lambda route: route.fulfill(json={'status': 'draft', 'approvedBy': None}))
    errors, missing = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: missing.append(r.url) if r.status == 404 else None)
    await page.goto(url)
    await page.locator('.nq-launch-start').wait_for(state='visible')
    await page.get_by_role('button', name='Tap to Play').click()
    await page.get_by_role('dialog', name='Welcome to NoteQuest').wait_for(state='detached')
    await page.evaluate("()=>{NQ.profiles.create('Zoe','🐰');NQ.pets.init();NQ.pets.chooseStarter('kitten','Mochi');go('menu')}")
    await page.locator('#nq-menu-title').wait_for()
    await expect(page.locator('.nq-parallax-active')).to_be_visible()
    return ctx, page, errors, missing


async def run(browser, url, width, height, touch):
    ctx, page, errors, missing = await village(browser, url, width, height, touch)
    tap = (lambda loc: loc.tap()) if touch else (lambda loc: loc.click())
    pin = lambda name: page.locator('.nq-city-track').get_by_role('button', name=name, exact=True)
    preview = page.locator('.nq-city-preview')

    # Old screens stay hidden; the building labels are there.
    assert await page.locator('.nq-city [data-go="games"],.nq-city [data-go^="stickers"]').count() == 0
    for name in [*LIVE, *SOON]:
        assert await pin(name).count() == 1, name

    # Every building previews; live ones offer their doors, coming soon ones none.
    async def close():                                       # a child closes the card before the next building
        if await preview.is_visible():
            await tap(page.get_by_role('button', name='Close'))
            await expect(preview).to_be_hidden()
    for name, doors in LIVE.items():
        await close()
        await pin(name).scroll_into_view_if_needed()
        await tap(pin(name))
        region = page.get_by_role('region', name=name)
        await expect(region).to_be_visible()
        await expect(pin(name)).to_have_attribute('aria-expanded', 'true')
        assert [await d.inner_text() for d in await region.locator('.nq-city-door').all()] == doors, name
    for name in SOON:
        await close()
        await pin(name).scroll_into_view_if_needed()
        await tap(pin(name))
        region = page.get_by_role('region', name=name)
        await expect(region.get_by_text('Coming soon! This building is still being built.')).to_be_visible()
        assert await region.locator('.nq-city-door').count() == 0
        await tap(pin(name))                                  # a second tap never enters
        await expect(region).to_be_visible()
    await expect(page.locator('.nq-city-hotspots polygon.nq-city-selected')).to_have_count(1)
    # Tapping a different building switches the preview directly.
    await close()
    await tap(pin('Music Academy'))
    await tap(pin('Adventure Gate'))
    await expect(page.get_by_role('region', name='Adventure Gate')).to_be_visible()
    await expect(pin('Music Academy')).to_have_attribute('aria-expanded', 'false')

    # Library's door is the reference page link.
    await close()
    await pin('Music Library').scroll_into_view_if_needed()
    await tap(pin('Music Library'))
    assert await page.get_by_role('link', name='Visit Music Library').get_attribute('href') == './reference.html'

    # Tapping the sky dismisses.
    await close()
    await page.get_by_role('button', name='Learning district').click()
    await page.wait_for_timeout(300)
    box = await page.locator('.nq-city-viewport').bounding_box()
    await tap(pin('Music Academy'))
    await expect(preview).to_be_visible()
    if touch:
        await page.touchscreen.tap(box['x'] + box['width'] / 2, box['y'] + 8)
    else:
        await page.mouse.click(box['x'] + box['width'] / 2, box['y'] + 8)
    await expect(preview).to_be_hidden()
    await expect(pin('Music Academy')).to_have_attribute('aria-expanded', 'false')

    # The painted building itself is tappable (its traced shape), not only the label.
    track = await page.locator('.nq-city-track').bounding_box()
    shape_point = (track['x'] + track['width'] * 1075 / 2172, track['y'] + track['height'] * 200 / 724)   # clock face
    if touch:
        await page.touchscreen.tap(*shape_point)
    else:
        await page.mouse.click(*shape_point)
    await expect(page.get_by_role('region', name='Adventure Gate')).to_be_visible()

    # Esc dismisses and returns focus to the building's label.
    await pin('Music Academy').focus()
    await page.keyboard.press('Enter')
    await expect(page.get_by_role('region', name='Music Academy')).to_be_visible()
    await page.keyboard.press('Escape')
    await expect(preview).to_be_hidden()
    await expect(pin('Music Academy')).to_be_focused()

    # A mouse drag to explore doesn't open a building.
    if not touch:
        x, y = shape_point
        await page.mouse.move(x - 200, y)
        await page.mouse.down()
        await page.mouse.move(x, y, steps=6)
        await page.mouse.up()
        await expect(preview).to_be_hidden()

    # All places lists every building; choosing one previews it and focuses its first door.
    await page.locator('.nq-city-places summary').click()
    places = page.locator('.nq-city-places')
    await expect(places.get_by_role('button')).to_have_count(8)
    await places.get_by_role('button', name='Companion Sanctuary').click()
    await expect(page.get_by_role('button', name='Visit the pen')).to_be_focused()
    await page.get_by_role('button', name='Visit Hospital Bay').click()
    await expect(page.get_by_role('heading', name='Hospital Bay')).to_be_visible()
    await page.get_by_role('button', name='Back to Village').click()

    # A second tap on a live building enters it.
    await page.get_by_role('button', name='Learning district').click()
    await page.wait_for_timeout(300)
    await tap(pin('Music Academy'))
    await tap(pin('Music Academy'))
    await expect(page.locator('.nq-village')).to_have_count(0)
    await page.evaluate("go('menu')")
    await page.locator('#nq-menu-title').wait_for()

    # And Visit enters.
    await tap(pin('Adventure Gate'))
    await tap(page.get_by_role('button', name='Visit Adventure Gate'))
    await expect(page.locator('.nq-village')).to_have_count(0)

    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
    assert not errors, errors
    assert not missing, missing
    await ctx.close()


async def main():
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/index.html'
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        try:
            for width, height, touch in [(390, 844, True), (844, 390, True), (820, 1180, True), (1180, 820, False)]:
                await run(browser, url, width, height, touch)
                print(f'PASS {width}×{height}: building previews, live doors, coming soon, shape taps, '
                      f'dismiss, Esc, drag, All places, Hospital Bay, second tap and Visit enter', flush=True)
        finally:
            await browser.close()
            server.shutdown()


if __name__ == '__main__':
    asyncio.run(main())
