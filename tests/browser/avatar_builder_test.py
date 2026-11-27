"""Avatar learner flows and manifest loading, with synthetic artwork served over HTTP."""

import asyncio
import base64
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.async_api import async_playwright, expect

from harbor_lessons_test import OBSERVE_QUESTIONS


class QuietServer(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

ROOT = Path(__file__).resolve().parents[2]
NO_PAINT = """window.NoteQuestAvatarArt = {
    ready: () => true,
    draw: async (target, look) => {
      const worn = (look.accessories || []).join('+') || 'acc-none';
      if (worn === 'acc-goggles' && window.nqHoldGoggles) {
        await new Promise(r => { window.nqReleaseGoggles = r });
      }
      if (look.accessory === window.nqFailAccessory) throw new Error('preview unavailable');
      target.dataset.assembled = worn;
      window.nqPaintedForTest = worn;
      window.nqTestLook = look;
    }, swatch: () => {}, silhouette: target => { target.dataset.silhouette = 'true' }
}"""
DEFAULT_PARTS = {
    'v': 1, 'skin': 'skin-2', 'hairColor': 'hc-lightbrown', 'outfit': 'of-teal', 'accessory': 'acc-none', 'accessories': [],
    'eyeColor': 'ec-brown'   # engine 1.10.0: brown, painted into the bases
}
# The default girl is the girl in the approved Melody Harbor mockup (owner 2026-11-26).
GIRL_DEFAULT = {'v': 1, 'body': 'girl', 'hair': 'girl-ponytail', 'skin': 'skin-2', 'hairColor': 'hc-brown',
                'outfit': 'of-pink', 'accessory': 'acc-backpack', 'accessories': ['acc-backpack', 'acc-glasses'],
                'eyeColor': 'ec-brown'}


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
    await expect(page.get_by_role('heading', name='What’s your name?')).to_be_visible()
    await page.get_by_role('radio', name='Boy').check()
    await page.evaluate("window.nqRandom = Math.random; Math.random = () => .75")
    await button('Continue').click()
    await expect(page.get_by_role('heading', name='Create Your Avatar')).to_be_focused()
    await expect(button('Done')).to_be_enabled()
    await page.evaluate('Math.random = window.nqRandom')
    assert await page.evaluate('window.nqTestLook') == {**DEFAULT_PARTS, 'body': 'boy', 'hair': 'boy-short'}
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
    # Eye color has its own Eyes tab (owner 2026-11-27), after Skin; brown is the default.
    tabs = page.get_by_role('navigation', name='Avatar parts').get_by_role('button')
    assert [await t.inner_text() for t in await tabs.all()] == ['Body', 'Hair', 'Skin', 'Eyes', 'Hair Color', 'Outfit', 'Accessories']
    tab_rows = await tabs.evaluate_all('els => new Set(els.map(e => Math.round(e.getBoundingClientRect().top))).size')
    assert tab_rows == (2 if width <= 600 else 1), tab_rows
    await category('Eyes').click()
    eyes = page.get_by_role('group', name='Eyes', exact=True).get_by_role('button')
    assert [await tile.get_attribute('aria-label') for tile in await eyes.all()] == [
        'Dark brown', 'Brown', 'Hazel', 'Amber', 'Green', 'Blue', 'Gray', 'Blue-green'
    ]
    await expect(choice('Eyes', 'Brown')).to_have_attribute('aria-pressed', 'true')
    await expect(page.locator('.nq-avatar-position')).to_contain_text('Brown · 2 of 8 · Selected')
    await choice('Eyes', 'Hazel').click()
    await expect(choice('Eyes', 'Hazel')).to_have_attribute('aria-pressed', 'true')
    assert (await page.evaluate('window.nqTestLook'))['eyeColor'] == 'ec-hazel'
    await choice('Eyes', 'Brown').click()
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
    # Engine 1.9.0: more than one accessory, one per spot. Arrows and swipes browse; a tap
    # puts the accessory on or takes it off; one in the same spot swaps; None clears all.
    position = page.locator('.nq-avatar-position')
    await choice('Accessories', 'None').click()
    await expect(button('Previous choice')).to_be_disabled()
    await button('Next choice').click()
    await expect(position).to_have_text('Goggles · 2 of 8 · Tap to wear')
    await expect(choice('Accessories', 'None')).to_have_attribute('aria-pressed', 'true')
    await page.evaluate('window.nqHoldGoggles = true')
    await page.locator('.nq-avatar-card[aria-pressed]').filter(has=page.locator('xpath=self::*[@aria-label="Goggles"]')).click()
    await expect(choice('Accessories', 'Goggles')).to_have_attribute('aria-pressed', 'true')
    await choice('Accessories', 'Backpack').click()              # added while the goggles still paint
    await expect(choice('Accessories', 'Backpack')).to_have_attribute('aria-pressed', 'true')
    await expect(choice('Accessories', 'Goggles')).to_have_attribute('aria-pressed', 'true')
    await page.evaluate("window.nqHoldGoggles = false; window.nqReleaseGoggles()")
    await page.wait_for_function("window.nqPaintedForTest === 'acc-goggles'")
    await expect(page.locator('.nq-avatar-painting:not(.pending)')).to_have_attribute('data-assembled', 'acc-goggles+acc-backpack')
    await swipe_left(page, cdp)
    await expect(position).to_have_text('Hat · 4 of 8 · Tap to wear')
    await page.get_by_role('group', name='Accessories carousel').press('ArrowRight')
    await expect(position).to_have_text('Round glasses · 5 of 8 · Tap to wear')
    await choice('Accessories', 'Round glasses').click()         # same spot as goggles: swaps
    await expect(choice('Accessories', 'Goggles')).to_have_attribute('aria-pressed', 'false')
    await expect(position).to_have_text('Round glasses · 5 of 8 · Wearing')
    await choice('Accessories', 'Music-note pin').click()
    await expect(button('Next choice')).to_be_disabled()
    await expect(page.locator('.nq-avatar-painting:not(.pending)')).to_have_attribute('data-assembled', 'acc-backpack+acc-glasses+acc-music-pin')
    await choice('Accessories', 'Music-note pin').click()         # tap again: off
    await expect(choice('Accessories', 'Music-note pin')).to_have_attribute('aria-pressed', 'false')
    await expect(choice('Accessories', 'None')).to_have_attribute('aria-pressed', 'false')
    await choice('Accessories', 'None').click()                   # None takes everything off
    await expect(choice('Accessories', 'None')).to_be_focused()
    await expect(choice('Accessories', 'None')).to_have_attribute('aria-pressed', 'true')
    await expect(page.locator('.nq-avatar-painting:not(.pending)')).to_have_attribute('data-assembled', 'acc-none')
    for field in ['Body', 'Hair', 'Skin', 'Hair Color', 'Outfit', 'Accessories']:
        await category(field).click()
        options = page.get_by_role('group', name=field, exact=True).get_by_role('button')
        await options.first.click()
        await swipe_left(page, cdp)
        if field == 'Accessories':                # a swipe browses accessories; a tap wears one
            await expect(position).to_have_text('Goggles · 2 of 8 · Tap to wear')
        else:
            await expect(options.nth(1)).to_have_attribute('aria-pressed', 'true')
    await page.evaluate('Math.random = () => .99')
    await button('Surprise Me').click()
    await expect(button('Done')).to_be_enabled()
    await page.evaluate('Math.random = window.nqRandom')
    assert await page.evaluate("window.nqTestLook.accessories") == []
    await category('Accessories').click()
    await choice('Accessories', 'None').click()
    await page.evaluate("window.nqFailAccessory = 'acc-music-pin'")
    await choice('Accessories', 'Music-note pin').click()
    await expect(page.get_by_text('That option couldn’t load. Your last look is selected.')).to_be_visible()
    await expect(choice('Accessories', 'None')).to_have_attribute('aria-pressed', 'true')
    await expect(page.locator('.nq-avatar-painting:not(.pending)')).to_have_attribute('data-assembled', 'acc-none')
    await expect(button('Done')).to_be_enabled()
    await button('Back').click()
    await expect(page.get_by_label('Player name')).to_have_value('Harbor Learner')
    await expect(page.get_by_role('radio', name='Boy')).to_be_checked()
    assert await page.evaluate('NQ.profiles.list().length') == 0

    await page.get_by_role('radio', name='Girl').check()
    await page.evaluate("window.nqFailAccessory = 'acc-backpack'")
    await button('Continue').click()
    await expect(page.get_by_text('This look did not load. Try another option or tap Back.')).to_be_visible()
    await expect(button('Done')).to_be_disabled()
    await expect(page.locator('[data-silhouette]')).to_be_visible()
    await button('Back').click()
    await expect(page.get_by_role('radio', name='Girl')).to_be_checked()
    assert await page.evaluate('NQ.profiles.list().length') == 0
    await page.evaluate('delete window.nqFailAccessory')
    await page.evaluate('Math.random = () => .99')
    await button('Continue').click()
    await expect(choice('Body', 'Girl')).to_have_attribute('aria-pressed', 'true')
    await expect(button('Done')).to_be_enabled()
    await page.evaluate('Math.random = window.nqRandom')
    assert await page.evaluate('window.nqTestLook') == GIRL_DEFAULT
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
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).accessories") == ['acc-backpack', 'acc-glasses', 'acc-scarf']
    await button('Keep Melody').click()
    await page.reload()
    await button('Tap to Play').click()
    await expect(button('New player')).to_be_visible()
    await button('Harbor Learner').click()
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
    await category('Eyes').click()
    await choice('Eyes', 'Green').click()
    await button('Done').click()
    await expect(button('Edit avatar')).to_be_visible()
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).body") == 'girl'
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).outfit") == 'of-black'
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id).eyeColor") == 'ec-green'
    assert not errors, errors
    assert not missing, missing
    await page.close()


async def run_manifest_loader(browser, url):
    context = await browser.new_context(reduced_motion='reduce')
    page = await context.new_page()
    catalog = await fetch_test_catalog(page, url)
    layer_path = 'assets/avatars/layers/test-layer.webp'
    swatch_path = 'assets/avatars/swatches/test-swatch.webp'
    rgba_webps = {}
    hold_portrait = asyncio.Event()
    hold_portrait.set()
    for path, size in ((layer_path, 512), (swatch_path, 256)):
        encoded = await page.evaluate("""size => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#c07a3d';
          ctx.fillRect(size / 4, size / 4, size / 2, size / 2);
          return canvas.toDataURL('image/webp').split(',')[1];
        }""", size)
        rgba_webps[path] = base64.b64decode(encoded)

    choices = lambda ids, value: dict.fromkeys(ids, value)
    plane = {'back': None, 'front': layer_path}
    bodies = {
        body: {
            'skin': choices(catalog['skin'], layer_path),
            'outfit': choices(catalog['outfit'], layer_path),
            'hair': {hair: choices(catalog['hairColor'], plane) for hair in catalog['hair'][body]},
            'accessory': choices(catalog['accessory'][1:], plane),
            'eyes': choices([e for e in catalog['eyeColor'] if e != catalog['eyeColorBase']], layer_path),
        }
        for body in catalog['body']
    }
    manifest = {
        'status': 'draft', 'approvedBy': 'Browser test fixture', 'catalogVersion': catalog['v'],
        'width': 512, 'height': 512, 'silhouette': layer_path,
        'portrait': {'x': 96, 'y': 96, 'width': 320, 'height': 320},
        'poses': {pose: {'bodies': bodies} for pose in ['front', 'wave', 'walk']},
        'swatches': {
            **{field: choices(catalog[field], swatch_path) for field in ['body', 'skin', 'eyeColor', 'hairColor', 'outfit', 'accessory']},
            'hair': {body: choices(catalog['hair'][body], swatch_path) for body in catalog['body']},
        },
    }

    data_url = url + 'assets/avatars/avatar-art-manifest.json'
    async def serve_layer(route):
        path = route.request.url.removeprefix(url)
        if path == layer_path:
            await hold_portrait.wait()
        await route.fulfill(content_type='image/webp', body=rgba_webps[path])

    for path in rgba_webps:
        await page.route(url + path, serve_layer)

    mode = 'missing'

    async def serve_manifest(route):
        if mode == 'missing':
            await route.fulfill(status=404)
        else:
            await route.fulfill(json=manifest)

    await page.route(data_url, serve_manifest)
    button = lambda label: page.get_by_role('button', name=label, exact=True)
    for state, approver in (('missing', ''), ('draft', 'Browser test fixture'), ('approved', '')):
        mode = state
        manifest.update(status=state, approvedBy=approver)
        await page.goto(url)
        await button('Tap to Play').click()
        await button('New player').click()
        await expect(page.get_by_role('group', name='Choose your picture')).to_be_visible()
        assert not await page.evaluate('Boolean(window.NoteQuestAvatarArt)')

    mode = 'approved'
    manifest.update(status='approved', approvedBy='Browser test fixture')
    manifest['swatches']['skin'].pop('skin-2')
    await page.goto(url)
    await button('Tap to Play').click()
    await button('New player').click()
    await expect(page.get_by_role('group', name='Choose your picture')).to_be_visible()

    manifest['swatches']['skin']['skin-2'] = swatch_path
    await page.goto(url)
    await button('Tap to Play').click()
    await button('New player').click()
    await page.get_by_label('Player name').fill('Painted Learner')
    await page.get_by_role('radio', name='Girl').check()
    await button('Continue').click()
    await expect(page.locator('.nq-avatar-painting canvas')).to_be_visible()
    assert await page.locator('.nq-avatar-painting canvas').evaluate(
        'canvas => canvas.getContext("2d").getImageData(256, 256, 1, 1).data[3]'
    ) == 255
    await expect(page.locator('.nq-avatar-stage img').first).to_be_visible()
    await button('Done').click()
    await page.get_by_label('Kitten name').fill('Clover')
    await button('Go to the village').click()
    await expect(page.locator('.nq-village-avatar canvas')).to_be_visible()
    assert await page.evaluate("NQ.companions.get().companion.name") == 'Clover'
    assert not await page.locator('.nq-village-avatar').inner_text()
    await expect(button('Edit my avatar').locator('canvas')).to_have_attribute('width', '320')
    hold_portrait.clear()
    await page.reload(wait_until='domcontentloaded')
    await button('Tap to Play').click()
    learner = button('Painted Learner')
    await expect(learner.locator('.nq-avatar-portrait')).to_have_text('')
    assert not await learner.locator('canvas').count()
    hold_portrait.set()
    await expect(learner.locator('canvas')).to_be_visible()
    await learner.click()
    await button('▶ Continue Adventure').click()
    await expect(page.locator('.top .nq-avatar-portrait canvas')).to_have_attribute('width', '320')
    await page.evaluate(OBSERVE_QUESTIONS)
    await button("I've explored it").click()
    skill = await page.evaluate("NQ.learn.skill('NQ-00-U01-S01').title.child")
    await button(f'Practice {skill}').click()
    first = await page.evaluate('window.lastQuestion')
    for _ in range(first['total']):
        question = await page.evaluate('window.lastQuestion')
        key = 'C sharp' if question['group'] == 2 else 'F sharp'
        await page.get_by_role('button', name=key, exact=False).click()
    await expect(page.get_by_role('heading', name='Practice finished')).to_be_visible()
    await expect(page.locator('[data-avatar-pose="wave"] canvas')).to_have_attribute('width', '512')
    await context.close()


async def run_partial_manifest(browser, url, width, height):
    """Partial rollout (owner decision 2026-11-26): only the approved default looks are painted.
    New learners get the builder with every other choice greyed out as coming soon; existing
    learners keep their original picture and are not sent to the builder."""
    context = await browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    catalog = await fetch_test_catalog(page, url)
    await page.evaluate("NQ.profiles.create('Legacy Zoe', '🐱')")
    webps = {}
    for size in (512, 256):
        encoded = await page.evaluate("""size => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#3b8f8a';
          ctx.fillRect(size / 4, size / 8, size / 2, size * 3 / 4);
          return canvas.toDataURL('image/webp').split(',')[1];
        }""", size)
        webps[size] = base64.b64decode(encoded)
    layer = lambda name: f'assets/avatars/layers/partial-{name}.webp'
    default_hair = {'boy': 'boy-short', 'girl': 'girl-ponytail'}
    bodies = {
        body: {
            'skin': {'skin-2': layer(body + '-skin')},
            'outfit': {'of-teal': layer(body + '-teal')},
            'hair': {default_hair[body]: {'hc-lightbrown': {'back': None, 'front': layer(body + '-hair')}}},
        }
        for body in catalog['body']
    }
    approved_swatches = {a: f'assets/avatars/swatches/{a}-256.webp'
                         for a in ('acc-glasses', 'acc-headphones', 'acc-scarf', 'acc-music-pin')}
    manifest = {
        'status': 'approved', 'scope': 'partial', 'approvedBy': 'Browser test fixture',
        'catalogVersion': catalog['v'], 'width': 512, 'height': 512,
        'portrait': {'x': 128, 'y': 16, 'width': 256, 'height': 256},
        'poses': {pose: {'bodies': bodies} for pose in ['front', 'wave', 'walk']},
        'swatches': {'accessory': approved_swatches},
    }
    served = []

    async def serve_layer(route):
        served.append(route.request.url)
        await route.fulfill(content_type='image/webp', body=webps[512])
    await page.route(url + 'assets/avatars/layers/**', serve_layer)
    await page.route(url + 'assets/avatars/avatar-art-manifest.json', lambda route: route.fulfill(json=manifest))
    button = lambda label: page.get_by_role('button', name=label, exact=True)
    category = lambda label: page.get_by_role('navigation', name='Avatar parts').get_by_role('button', name=label, exact=True)
    group = lambda field: page.get_by_role('group', name=field, exact=True)

    await page.goto(url)
    await button('Tap to Play').click()
    assert await page.evaluate('window.NoteQuestAvatarArt.partial') is True
    legacy = button('Legacy Zoe')
    await expect(legacy).to_contain_text('🐱')
    assert not await legacy.locator('.nq-avatar-portrait').count()
    await button('New player').click()
    await page.get_by_label('Player name').fill('Painted Mia')
    await page.get_by_role('radio', name='Girl').check()
    await button('Continue').click()
    await expect(page.get_by_role('heading', name='Create Your Avatar')).to_be_focused()
    await expect(page.locator('.nq-avatar-painting canvas')).to_be_visible()
    await expect(button('Done')).to_be_enabled()

    await category('Hair').click()
    hair = group('Hair')
    await expect(hair.get_by_role('button', name='Ponytail', exact=True)).to_have_attribute('aria-pressed', 'true')
    soon = hair.locator('.nq-avatar-soon')
    assert await soon.count() == len(catalog['hair']['girl']) - 1
    assert all(label.endswith(', coming soon') for label in
               [await tile.get_attribute('aria-label') for tile in await soon.all()])
    await expect(soon.first).to_contain_text('Coming soon')
    await expect(page.locator('.nq-avatar-position')).to_contain_text(
        f"Ponytail · Selected · {len(catalog['hair']['girl']) - 1} more coming soon")
    await expect(button('Next choice')).to_be_disabled()
    await expect(button('Previous choice')).to_be_disabled()
    await soon.first.click(force=True)  # aria-disabled: Playwright won't click it unforced
    await expect(page.locator('.nq-avatar-status')).to_contain_text('coming soon')
    assert await page.evaluate("NQ.profiles.list().length") == 1

    # No eye colors painted yet: brown (painted into the bases) is ready, the rest are coming soon.
    await category('Eyes').click()
    eyes = group('Eyes')
    await expect(eyes.get_by_role('button', name='Brown', exact=True)).to_have_attribute('aria-pressed', 'true')
    assert await eyes.locator('.nq-avatar-soon').count() == len(catalog['eyeColor']) - 1
    await expect(page.locator('.nq-avatar-position')).to_contain_text(
        f"Brown · Selected · {len(catalog['eyeColor']) - 1} more coming soon")
    await eyes.get_by_role('button', name='Green, coming soon', exact=True).click(force=True)
    await expect(page.locator('.nq-avatar-status')).to_contain_text('Green is coming soon')

    await category('Accessories').click()
    acc = group('Accessories')
    await expect(acc.get_by_role('button', name='None', exact=True)).to_have_attribute('aria-pressed', 'true')
    await expect(acc.get_by_role('button', name='Round glasses, coming soon', exact=True).locator('img')).to_be_visible()

    await category('Body').click()
    await group('Body').get_by_role('button', name='Boy', exact=True).click()
    await expect(button('Done')).to_be_enabled()
    await group('Body').get_by_role('button', name='Girl', exact=True).click()
    await expect(button('Done')).to_be_enabled()
    await button('Surprise Me').click()
    await expect(button('Done')).to_be_enabled()
    await button('Done').click()
    await page.get_by_label('Kitten name').fill('Clover')
    await button('Go to the village').click()
    await expect(page.locator('.nq-village-avatar canvas')).to_be_visible()
    mia = await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id)")
    assert mia == {'v': catalog['v'], 'body': 'girl', 'hair': 'girl-ponytail', 'skin': 'skin-2',
                   'hairColor': 'hc-lightbrown', 'outfit': 'of-teal', 'accessory': 'acc-none', 'accessories': [],
                   'eyeColor': 'ec-brown'}, mia
    await expect(button('Edit my avatar')).to_be_visible()

    # The existing learner goes straight to her village with her original picture.
    await page.get_by_role('button', name='Switch learner. Current player: Painted Mia').click()
    await button('Legacy Zoe').click()
    await page.get_by_label('Kitten name').fill('Mochi')        # her first visit: the usual kitten step
    await button('Go to the village').click()
    await expect(page.locator('#nq-village-player')).to_contain_text('🐱')
    await expect(page.get_by_role('heading', name='Create Your Avatar')).to_have_count(0)
    await expect(button('Edit my avatar')).to_have_count(0)
    assert not await page.locator('.nq-village-avatar').count()
    assert await page.evaluate("NQ.profiles.displayLook(NQ.profiles.current().id)") is None
    assert not errors, errors
    await context.close()


async def fetch_test_catalog(page, url):
    await page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(url) else route.abort())
    await page.route(url + 'assets/avatars/avatar-art-manifest.json', lambda route: route.fulfill(status=404))
    await page.goto(url)
    catalog = await page.evaluate('NQ.profiles.avatarCatalog')
    await page.unroute(url + 'assets/avatars/avatar-art-manifest.json')
    return catalog


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
            await run_manifest_loader(browser, url)
            print("PASS HTTP manifest gate, painted canvas, header portrait, preserved kitten and lesson results", flush=True)
            for width, height in [(390, 844), (844, 390), (820, 1180), (1180, 820)]:
                await run_partial_manifest(browser, url, width, height)
                print(f'PASS {width}×{height}: partial manifest, coming soon choices, existing learner keeps picture',
                      flush=True)
            await browser.close()


if __name__ == '__main__':
    asyncio.run(main())
