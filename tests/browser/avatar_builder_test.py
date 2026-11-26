"""Draft flow test. The paint adapter is synthetic here; production artwork is owner-reviewed separately."""

import asyncio
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.async_api import async_playwright, expect


class QuietServer(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

ROOT = Path(__file__).resolve().parents[2]
NO_PAINT = """window.NoteQuestAvatarArt = {
    ready: () => true,
    draw: async (target, look) => {
      if (look.accessory === 'acc-goggles') await new Promise(r => { window.nqReleaseGoggles = r });
      target.dataset.assembled = look.accessory;
      window.nqPaintedForTest = look.accessory;
    }, swatch: () => {}, silhouette: () => {}
}"""


async def swipe_left(page, cdp):
    stage = page.locator('.nq-avatar-stage')
    await stage.scroll_into_view_if_needed()
    bounds = await stage.bounding_box()
    x = int(bounds['x'] + bounds['width'] * .7)
    y = int(bounds['y'] + bounds['height'] / 2)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x - 45, 'y': y + 1}]})
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def run(browser, url, width, height):
    page = await browser.new_page(viewport={'width': width, 'height': height}, reduced_motion='reduce', has_touch=True)
    cdp = await page.context.new_cdp_session(page)
    await page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(url) else route.abort())
    await page.add_init_script(NO_PAINT)
    errors = []
    missing = []
    page.on('response', lambda response: missing.append(response.url) if response.status == 404 else None)
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.goto(url)
    button = lambda label: page.get_by_role('button', name=label, exact=True)
    category = lambda label: page.get_by_role('navigation', name='Avatar parts').get_by_role('button', name=label, exact=True)
    choice = lambda field, label: page.get_by_role('group', name=field, exact=True).get_by_role('button', name=label, exact=True)
    await button('Tap to Play').click()
    await button('New player').click()
    await page.get_by_label('Player name').fill('Harbor Learner')
    await button('Continue').click()
    await expect(page.get_by_role('heading', name='Create Your Avatar')).to_be_focused()
    assert await page.evaluate('NQ.profiles.list().length') == 0
    if (width, height) == (390, 844):
        assert await page.locator('.nq-avatar-preview').evaluate(
            '(preview) => preview.getBoundingClientRect().bottom <= innerHeight'
        )
    await category('Hair Color').click()
    palette = page.get_by_role('group', name='Hair Color', exact=True).get_by_role('button')
    assert [await tile.get_attribute('aria-label') for tile in await palette.all()] == [
        'Black', 'Dark brown', 'Brown', 'Light brown', 'Auburn', 'Ginger', 'Blonde', 'Light blonde'
    ]
    await choice('Hair Color', 'Light brown').click()
    await expect(choice('Hair Color', 'Light brown')).to_have_attribute('aria-pressed', 'true')
    await category('Body').click()
    await choice('Body', 'Girl').click()
    await category('Hair').click()
    await expect(page.get_by_role('group', name='Hair', exact=True).get_by_role('button')).to_have_count(6)
    await choice('Hair', 'Braids').click()
    await category('Body').click()
    await choice('Body', 'Boy').click()
    await category('Hair').click()
    await expect(choice('Hair', 'Curly')).to_have_attribute('aria-pressed', 'true')
    await category('Accessories').click()
    accessory_choices = page.get_by_role('group', name='Accessories', exact=True).get_by_role('button')
    assert [await tile.get_attribute('aria-label') for tile in await accessory_choices.all()] == [
        'None', 'Goggles', 'Backpack', 'Hat', 'Round glasses', 'Headphones', 'Neck scarf', 'Music-note pin'
    ]
    await expect(button('Previous choice')).to_be_disabled()
    await button('Next choice').click()
    await button('Next choice').click()
    await expect(choice('Accessories', 'Backpack')).to_have_attribute('aria-pressed', 'true')
    await page.evaluate("window.nqReleaseGoggles()")
    await page.wait_for_function("window.nqPaintedForTest === 'acc-goggles'")
    await expect(page.locator('.nq-avatar-painting:not(.pending)')).to_have_attribute('data-assembled', 'acc-backpack')
    await swipe_left(page, cdp)
    await expect(choice('Accessories', 'Hat')).to_have_attribute('aria-pressed', 'true')
    await page.get_by_role('group', name='Accessories carousel').press('ArrowRight')
    await expect(choice('Accessories', 'Round glasses')).to_have_attribute('aria-pressed', 'true')
    await choice('Accessories', 'Music-note pin').click()
    await expect(button('Next choice')).to_be_disabled()
    for field in ['Body', 'Hair', 'Skin', 'Hair Color', 'Outfit', 'Accessories']:
        await category(field).click()
        options = page.get_by_role('group', name=field, exact=True).get_by_role('button')
        await options.first.click()
        await swipe_left(page, cdp)
        await expect(options.nth(1)).to_have_attribute('aria-pressed', 'true')
    await button('Surprise Me').click()
    await button('Back').click()
    await expect(page.get_by_label('Player name')).to_have_value('Harbor Learner')
    assert await page.evaluate('NQ.profiles.list().length') == 0

    await button('Continue').click()
    await choice('Body', 'Girl').click()
    await category('Outfit').click()
    outfits = page.get_by_role('group', name='Outfit', exact=True).get_by_role('button')
    assert [await tile.get_attribute('aria-label') for tile in await outfits.all()] == [
        'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Teal', 'Pink', 'Black'
    ]
    await choice('Outfit', 'Pink').click()
    await category('Accessories').click()
    await choice('Accessories', 'Neck scarf').click()
    await button('Done').click()
    await expect(page.get_by_role('heading', name='Meet your kitten')).to_be_visible()
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).body") == 'girl'
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).outfit") == 'of-pink'
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).accessory") == 'acc-scarf'
    await button('Keep Melody').click()
    await button('Edit my avatar').click()
    await expect(choice('Body', 'Girl')).to_have_attribute('aria-pressed', 'true')
    await choice('Body', 'Boy').click()
    await button('Back').click()
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).body") == 'girl'

    await page.evaluate("""() => {
      const old = NQ.profiles.create('Legacy learner','🐰');
      NQ.pets.startKitten('Clover',old.id);
      NQ.coins.add(41);
    }""")
    await page.get_by_role('button', name='Switch learner. Current player: Harbor Learner').click()
    await button('Legacy learner').click()
    await button('Back').click()
    await button('Legacy learner').click()
    await expect(page.get_by_role('heading', name='Create Your Avatar')).to_be_visible()
    balance = await page.evaluate('NQ.coins.balance()')
    await button('Done').click()
    await expect(button('Edit my avatar')).to_be_visible()
    assert await page.evaluate('NQ.coins.balance()') == balance
    assert await page.evaluate('NQ.profiles.current().pets[0].name') == 'Clover'
    await page.get_by_role('button', name='Switch learner. Current player: Legacy learner').click()
    await button('Legacy learner').click()
    await expect(button('Edit my avatar')).to_be_visible()
    await page.get_by_role('button', name='Grown-up Settings, hold required').click()
    await page.locator('#hold').focus()
    await page.keyboard.down('Space')
    await expect(button('Edit avatar')).to_be_visible(timeout=6500)
    await page.keyboard.up('Space')
    await button('Edit avatar').click()
    await choice('Body', 'Girl').click()
    await category('Outfit').click()
    await choice('Outfit', 'Black').click()
    await button('Done').click()
    await expect(button('Edit avatar')).to_be_visible()
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).body") == 'girl'
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).outfit") == 'of-black'
    assert not errors, errors
    assert not missing, missing
    await page.close()


async def main():
    handler = partial(QuietServer, directory=ROOT)
    with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
        Thread(target=server.serve_forever, daemon=True).start()
        url = f'http://127.0.0.1:{server.server_port}/'
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch()
            for width, height in [(390, 844), (844, 390), (820, 1180), (1180, 820), (1280, 800)]:
                await run(browser, url, width, height)
                print(f'PASS {width}×{height}: carousel touch, keyboard and avatar save flows', flush=True)
            await browser.close()


if __name__ == '__main__':
    asyncio.run(main())
