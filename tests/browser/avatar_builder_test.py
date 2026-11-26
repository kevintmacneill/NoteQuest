"""Draft flow test. The paint adapter is inert here; production artwork is owner-reviewed separately."""

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
    ready: () => true, draw: () => {}, swatch: () => {}, silhouette: () => {}
}"""


async def run(browser, url, width, height):
    page = await browser.new_page(viewport={'width': width, 'height': height}, reduced_motion='reduce')
    await page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(url) else route.abort())
    await page.add_init_script(NO_PAINT)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.goto(url)
    button = lambda label: page.get_by_role('button', name=label, exact=True)
    await button('Tap to Play').click()
    await button('New player').click()
    await page.get_by_label('Player name').fill('Harbor Learner')
    await button('Continue').click()
    await expect(page.get_by_role('heading', name='Choose your avatar')).to_be_focused()
    assert await page.evaluate('NQ.profiles.list().length') == 0
    if (width, height) == (390, 844):
        assert await page.locator('.nq-avatar-preview').evaluate(
            '(preview) => preview.getBoundingClientRect().bottom <= innerHeight'
        )
    await button('Girl').click()
    await button('Hair').click()
    await expect(page.get_by_role('group', name='Hair').get_by_role('button')).to_have_count(6)
    await button('Braids').click()
    await button('Body').click()
    await button('Boy').click()
    await button('Hair').click()
    await expect(button('Short')).to_have_attribute('aria-pressed', 'true')
    await button('Surprise me').click()
    await button('Back').click()
    await expect(page.get_by_label('Player name')).to_have_value('Harbor Learner')
    assert await page.evaluate('NQ.profiles.list().length') == 0

    await button('Continue').click()
    await button('Girl').click()
    await button('Done').click()
    await expect(page.get_by_role('heading', name='Meet your kitten')).to_be_visible()
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).body") == 'girl'
    await button('Keep Melody').click()
    await button('Edit my avatar').click()
    await expect(button('Girl')).to_have_attribute('aria-pressed', 'true')
    await button('Boy').click()
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
    await expect(page.get_by_role('heading', name='Choose your avatar')).to_be_visible()
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
    await button('Girl').click()
    await button('Done').click()
    await expect(button('Edit avatar')).to_be_visible()
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).body") == 'girl'
    assert not errors, errors
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
                print(f'PASS {width}×{height}: new, interrupted, migrated and editable avatars', flush=True)
            await browser.close()


if __name__ == '__main__':
    asyncio.run(main())
