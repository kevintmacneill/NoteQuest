"""Standalone launch/menu browser regression. Run: python tests/browser/launch_menu_test.py
Requires playwright and Chromium; does not modify learner data on disk.
"""
import asyncio, functools, http.server, os, threading
from playwright.async_api import async_playwright
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
SERVER=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT))
threading.Thread(target=SERVER.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{SERVER.server_address[1]}/'

async def run():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch()
  try:
   for width,height in [(390,844),(820,1180),(1280,800)]:
    ctx=await browser.new_context(viewport={'width':width,'height':height})
    page=await ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(BASE+'index.html')
    start=page.get_by_role('button',name='▶ Click to Play')
    await start.wait_for()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    assert await page.evaluate('document.activeElement.classList.contains("nq-launch-start")')
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow before start: {width}'
    await start.click()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==0
    assert await page.get_by_text('Who’s playing today?').count()==1
    assert await page.get_by_role('button',name='New player').count()==1
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow in menu: {width}'
    assert not errors,f'page errors: {errors}'
    # Main navigation must be visible and usable without scrolling through the pet pen.
    await page.evaluate("()=>{NQ.profiles.create('Tester','🐰');NQ.pets.init();NQ.pets.chooseStarter('puppy','Pip');go('menu')}")
    await page.locator('#nq-menu-title').wait_for()
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    assert await page.locator('.nq-menu-primary[data-go="nqwHub"]').is_visible()
    assert await page.locator('.nq-menu-card[data-go="games"]').is_visible()
    assert await page.locator('.nq-menu-card[data-go="home"]').is_visible()
    assert await page.locator('a[href="./reference.html"]').count()>=1
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow in main hub: {width}'
    await page.locator('.nq-menu-card[data-go="games"]').click()
    assert await page.get_by_role('heading',name='🎮 Games').count()==1
    await page.locator('.back[data-go="menu"]').click()
    await page.locator('.nq-menu-card[data-go="home"]').click()
    assert await page.locator('#hab').count()==1
    await page.locator('.back[data-go="menu"]').click()
    await page.locator('.nq-menu-primary[data-go="nqwHub"]').click()
    assert await page.get_by_role('heading',name='🧭 Music Journey').count()==1
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('#nq-menu-title').is_visible()
    # Magical Village is the hub. The interim plate is the plaza, not the loading-screen painting.
    assert await page.locator('.nq-village').count()==1
    assert await page.locator('.nq-village-art').is_visible()
    assert 'nq-menu-village-plaza.webp' in await page.locator('.nq-village-art').get_attribute('src')
    assert 'nq-painted-village' not in await page.content()
    await page.wait_for_function("() => {const img=document.querySelector('.nq-village-art'); return img&&img.complete&&img.naturalWidth>=1280}")
    assert await page.locator('.nq-village-profile').is_visible()
    assert 'Tester' in await page.locator('.nq-village-profile').inner_text()
    assert 'Pip' in await page.locator('#nq-menu-pet').inner_text()
    assert await page.locator('#coinBadge').inner_text()==str(await page.evaluate('NQ.coins.balance()'))
    assert await page.locator('.nq-village-continue[data-go="nqwHub"]').is_visible()
    for target in ['.nq-village-library','.nq-village-journey','.nq-village-practice','.nq-village-lessons']:
     assert await page.locator(target).is_visible(),f'Missing village destination: {target}'
    assert await page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),f'village overflow: {width}'
    await page.locator('.nq-village-continue').click()
    assert await page.get_by_role('heading',name='🧭 Music Journey').count()==1
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('#nq-menu-title').is_visible()
    # Progress -> Back returns to the village and never opens explorer setup (#75).
    assert await page.evaluate("()=>!NQ.wild.state().explorer")
    progress=page.locator('.nq-village-actions [data-go="progress"]')
    assert await progress.get_attribute('data-go')=='progress'
    await progress.click()
    assert await page.get_by_role('heading',name='📊 My Music Progress').count()==1
    assert 'Tester' in await page.locator('#nq-progress-title').inner_text()
    assert await page.get_by_text('Practice rounds').count()==1
    assert await page.get_by_role('heading',name='📔 Field Journal').count()==0
    assert await page.get_by_role('heading',name='🧭 Your Explorer').count()==0
    assert await page.locator('.back[data-go="menu"]').count()==1
    assert await page.locator('.back[data-go="map"]').count()==0
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('.nq-village').count()==1
    assert await page.get_by_role('heading',name='🧭 Your Explorer').count()==0
    assert await page.get_by_role('heading',name='📔 Field Journal').count()==0
    assert await page.get_by_role('heading',name='🗺️ Expeditions').count()==0
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    # Settings stays behind the existing 3-second grown-up hold (#74).
    await page.locator('.nq-village-actions [data-go="parentGate"]').click()
    assert await page.get_by_role('heading',name='🔒 Grown-up Settings').count()==1
    assert await page.locator('#hold').is_visible()
    assert await page.get_by_text('Grown-ups · hold for 3 seconds').count()==1
    assert await page.locator('#rst').count()==0
    assert await page.locator('#del').count()==0
    assert await page.get_by_text('Unlock all planets').count()==0
    assert await page.get_by_text('Paste a save code').count()==0
    if width==820:
     await page.locator('#hold').dispatch_event('pointerdown')
     await page.wait_for_timeout(400)
     await page.locator('#hold').dispatch_event('pointerup')
     await page.wait_for_timeout(2800)
     assert await page.get_by_role('heading',name='🔒 Grown-up Settings').count()==1
     assert await page.locator('#rst').count()==0
     assert await page.get_by_role('heading',name='🔒 Grown-ups',exact=True).count()==0
     await page.locator('.back[data-go="menu"]').click()
    elif width==390:
     await page.locator('#hold').dispatch_event('pointerdown')
     await page.get_by_role('heading',name='🔒 Grown-ups',exact=True).wait_for(timeout=6500)
     assert await page.locator('#rst').count()==1
     assert await page.locator('#del').count()==1
     assert await page.locator('.back[data-go="menu"]').count()==1
     assert await page.locator('.back[data-go="profiles"]').count()==0
     await page.locator('.back[data-go="menu"]').click()
    else:
     await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('.nq-village').count()==1
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    # Lessons is distinct from the generic journey hub; it opens Harbor's world map.
    await page.locator('.nq-village-lessons').click()
    assert await page.get_by_role('heading',name='🗺️ World Map').count()==1
    await page.locator('.back[data-go="nqwHub"]').click()
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('.nq-village').count()==1
    # Issue #60: Sticker Book's Back must return to where it was opened.
    await page.locator('.nq-menu-tools [data-go="stickers|menu"]').click()
    assert await page.get_by_role('heading',name='📒 Sticker Book').count()==1
    assert await page.locator('.back[data-go="menu"]').count()==1
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('#nq-menu-title').is_visible()
    await page.locator('.nq-menu-card[data-go="games"]').click()
    await page.locator('.tile[data-go="stickers"]').click()
    assert await page.get_by_role('heading',name='📒 Sticker Book').count()==1
    assert await page.locator('.back[data-go="games"]').count()==1
    await page.locator('.back[data-go="games"]').click()
    assert await page.get_by_role('heading',name='🎮 Games').count()==1
    await page.locator('.back[data-go="menu"]').click()
    assert not errors,f'page errors on sticker navigation: {errors}'
    # Select through the real picker to persist this learner as the returning player.
    await page.locator('.nq-menu-tools [data-go="profiles"]').click()
    assert await page.get_by_text('Who’s playing today?').count()==1
    await page.locator('.pcard').filter(has_text='Tester').click()
    await page.reload()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    assert await page.locator('.nq-launch-start').is_visible()
    await page.get_by_role('button',name='▶ Click to Play').click()
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    assert await page.evaluate("document.activeElement.classList.contains('nq-village-continue')"), 'Start should focus Continue Adventure, not learner switch'
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    # Last selection is respected even if multiple learner profiles exist.
    second=await page.evaluate("""()=>{const p=NQ.profiles.create('Second','🐱');NQ.pets.init();NQ.pets.chooseStarter('kitten','Kit');return p.id}""")
    await page.evaluate("()=>go('profiles')")
    await page.locator(f'.pcard[data-pid="{second}"]').click()
    await page.reload()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    await page.get_by_role('button',name='▶ Click to Play').click()
    assert 'Second' in await page.locator('#nq-menu-title').inner_text()
    # Removed profile pointers must not leave a player stuck in the wrong menu.
    await page.evaluate("()=>{const id=NQ.profiles.current().id;NQ.profiles.remove(id)}")
    await page.reload()
    await page.get_by_role('button',name='▶ Click to Play').click()
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    assert not errors,f'page errors on reload: {errors}'
    await ctx.close()
   # A first-time learner must still get profile creation and starter-pet onboarding.
   ctx=await browser.new_context(viewport={'width':390,'height':844})
   page=await ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'index.html')
   await page.get_by_role('button',name='▶ Click to Play').click()
   assert await page.get_by_text('Who’s playing today?').count()==1
   await page.get_by_role('button',name='New player').click()
   await page.locator('#pname').fill('New Adventurer')
   await page.locator('#mk').click()
   assert await page.get_by_role('heading',name='Pick your first pet!').count()==1
   await page.locator('[data-st="puppy"]').click()
   await page.locator('#pn').fill('Scout')
   await page.locator('[data-r="ok"]').click()
   assert await page.locator('#hab').count()==1
   assert '🥚' in await page.locator('#hab').inner_text()
   await page.locator('.back[data-go="menu"]').click()
   assert 'New Adventurer' in await page.locator('#nq-menu-title').inner_text()
   await page.reload()
   await page.get_by_role('button',name='▶ Click to Play').click()
   assert 'New Adventurer' in await page.locator('#nq-menu-title').inner_text()
   assert not errors,f'page errors on first-time flow: {errors}'
   await ctx.close()
   # Wide layout: hotspot centers sit on the plaza buildings, not the old overlook.
   wide=await browser.new_context(viewport={'width':1440,'height':900})
   page=await wide.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'index.html')
   await page.get_by_role('button',name='▶ Click to Play').click()
   await page.evaluate("()=>{NQ.profiles.create('Wide','🐰');NQ.pets.init();NQ.pets.chooseStarter('puppy','Pip');go('menu')}")
   await page.locator('.nq-village-art').wait_for()
   await page.wait_for_function("()=>{const img=document.querySelector('.nq-village-art');return img&&img.complete&&img.naturalWidth>=1280}")
   spots=await page.evaluate("""()=>{
     const art=document.querySelector('.nq-village-art').getBoundingClientRect();
     const pct=sel=>{const el=document.querySelector(sel).getBoundingClientRect();
       return {cx:(el.left+el.width/2-art.left)/art.width, cy:(el.top+el.height/2-art.top)/art.height}};
     return {library:pct('.nq-village-library'),journey:pct('.nq-village-journey'),practice:pct('.nq-village-practice'),lessons:pct('.nq-village-lessons'),continue:pct('.nq-village-continue'),companion:pct('.nq-village-companion')};
   }""")
   def over(name,box,x0,x1,y0,y1):
    assert x0<=box['cx']<=x1 and y0<=box['cy']<=y1, f'{name} at {box} is not over its building'
   over('library',spots['library'],0.16,0.26,0.30,0.42)
   over('journey',spots['journey'],0.36,0.50,0.26,0.40)
   over('practice',spots['practice'],0.62,0.74,0.34,0.48)
   over('lessons',spots['lessons'],0.80,0.94,0.32,0.46)
   over('continue',spots['continue'],0.40,0.60,0.72,0.88)
   over('companion',spots['companion'],0.78,0.96,0.60,0.82)
   assert not errors,f'page errors on wide village: {errors}'
   await wide.close()
   print('PASS: magical village scene and destinations, returning profiles, onboarding, navigation at phone, tablet and desktop widths')
  finally:await browser.close();SERVER.shutdown()
if __name__=='__main__':asyncio.run(run())
