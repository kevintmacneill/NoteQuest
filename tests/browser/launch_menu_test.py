"""Standalone launch/menu browser regression. Run: python tests/browser/launch_menu_test.py
Requires playwright and Chromium; does not modify learner data on disk.
"""
import asyncio, functools, http.server, os, threading
from playwright.async_api import async_playwright
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
SERVER=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT))
threading.Thread(target=SERVER.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{SERVER.server_address[1]}/'

async def screenshot(page, file):
 directory = os.environ.get('NQ_SCREENSHOTS') or os.environ.get('NQ_WWW')
 if directory:
  os.makedirs(directory, exist_ok=True)
  await page.screenshot(path=os.path.join(directory, file))

async def run():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch()
  try:
   for width,height in [(390,844),(820,1180),(1280,800)]:
    ctx=await browser.new_context(viewport={'width':width,'height':height})
    page=await ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(BASE+'index.html')
    start=page.get_by_role('button',name='Tap to Play')
    await start.wait_for()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    assert await page.evaluate('document.activeElement.classList.contains("nq-launch-start")')
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow before start: {width}'
    await start.click()
    await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
    assert await page.get_by_text('Who’s playing today?').count()==1
    assert await page.get_by_role('button',name='New player').count()==1
    assert await page.locator('.nq-onboard img[src$="notequest-logo-icon.svg"]').count()==0
    await screenshot(page,f'onboarding-picker-{width}.png')
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow in menu: {width}'
    assert not errors,f'page errors: {errors}'
    # Main navigation must be visible and usable without scrolling through the pet pen.
    await page.evaluate("()=>{NQ.profiles.create('Tester','🐰');NQ.pets.init();NQ.pets.chooseStarter('puppy','Pip');go('menu')}")
    await page.locator('#nq-menu-title').wait_for()
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    assert await page.locator('.nq-city-learning [data-go="continueAdventure"]').is_visible()
    # Owner 2026-11-25/26: the old Practice Games and Sticker Book entry points are hidden;
    # Practice Hall and Sticker & Trophy House are Coming soon buildings.
    assert await page.locator('.nq-city [data-go="games"],.nq-city [data-go^="stickers"]').count()==0
    assert await page.locator('.nq-city [data-go="home"],.nq-city [data-go="shop"],.nq-city [data-go="map"],.nq-city [data-go="cleanPen"]').count()==0
    assert await page.locator('a[href="./reference.html"]').count()>=1
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow in main hub: {width}'
    await page.evaluate("go('games')")                        # the old screen still works if reached
    assert await page.get_by_role('heading',name='🎮 Games').count()==1
    await page.locator('.back[data-go="menu"]').click()
    await page.locator('.nq-city-learning [data-go="nqwHub"]').click()
    assert await page.get_by_role('heading',name='🧭 Music Journey').count()==1
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('#nq-menu-title').is_visible()
    # City panorama is distinct from the title scene and scrolls horizontally.
    assert await page.locator('.nq-village').count()==1
    await page.locator('.nq-parallax-active').wait_for()
    assert await page.locator('.nq-parallax-active img').count()==4
    assert 'nq-city-overlook-v1.avif' in await page.locator('.nq-village-art').get_attribute('src')
    assert 'nq-painted-village' not in await page.content()
    await page.wait_for_function("() => {const img=document.querySelector('.nq-village-art'); return img&&img.complete&&img.naturalWidth>=600}")
    assert await page.locator('.nq-village-profile').is_visible()
    assert 'Tester' in await page.locator('.nq-village-profile').inner_text()
    assert await page.locator('#coinBadge').inner_text()==str(await page.evaluate('NQ.coins.balance()'))
    assert await page.locator('.nq-village-continue[data-go="continueAdventure"]').is_visible()
    for target in ['.nq-city-library','.nq-city-gate','.nq-city-practice','.nq-city-academy']:
     assert await page.locator(target).is_visible(),f'Missing village destination: {target}'
    assert await page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),f'village overflow: {width}'
    # Continue must launch the real engine stop, not align preview IDs.
    real_next=await page.evaluate('NQ.learn.currentStop()')
    expected=await page.evaluate("NQ.learn.curriculum().id === '3.2' ? 'NQ-00-U01' : 'NQ-00-S1'")
    assert real_next==expected,real_next
    await page.locator('.nq-village-continue').click()
    assert await page.get_by_role('heading',name='Meet the piano',exact=True).count()==1
    assert await page.get_by_role('heading',name='Learn',exact=True).count()==1
    assert await page.evaluate("id => curView === 'engineLesson' && curViewArg === id && "
                               "NQ.learn.stopStatus(id).step === 'learn'",real_next)
    await page.get_by_role('button',name='Back to Village').click()
    assert await page.locator('#nq-menu-title').is_visible()
    # Progress -> Back returns to the village and never opens explorer setup (#75).
    assert await page.evaluate("()=>!NQ.wild.state().explorer")
    progress=page.locator('.nq-city-utility [data-go="progress"]')
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
    await page.locator('.nq-city-account [data-go="parentGate"]').click()
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
     await page.locator('#hold').focus()
     await page.keyboard.press('Space')
     assert await page.locator('#rst').count()==0
     await page.keyboard.down('Space')
     await page.get_by_role('heading',name='🔒 Grown-ups',exact=True).wait_for(timeout=6500)
     await page.keyboard.up('Space')
     assert await page.locator('#rst').count()==1
     assert await page.locator('#del').count()==1
     assert await page.locator('.back[data-go="menu"]').count()==1
     assert await page.locator('.back[data-go="profiles"]').count()==0
     await page.locator('.back[data-go="menu"]').click()
    else:
     await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('.nq-village').count()==1
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    # The Academy lists engine-backed Harbor stops including prerequisites.
    await page.locator('.nq-city-learning [data-go="lessonIndex"]').click()
    assert await page.get_by_role('heading',name='⚓ Melody Harbor').count()==1
    assert await page.get_by_role('button',name='Open Meet the piano').count()==1
    assert await page.get_by_role('button',name='Open Sit like a pianist').count()==0
    await page.get_by_role('button',name='Back to Village').click()
    assert await page.locator('.nq-village').count()==1
    # Tap-a-building: Sticker & Trophy House previews as Coming soon and doesn't enter.
    await page.locator('.nq-city-pin.nq-city-trophies').click()
    preview=page.get_by_role('region',name='Sticker & Trophy House')
    await preview.get_by_text('Coming soon! This building is still being built.').wait_for()
    assert await preview.locator('.nq-city-door').count()==0
    await page.locator('.nq-city-pin.nq-city-trophies').click()       # a second tap still doesn't enter
    assert await page.locator('#nq-menu-title').is_visible()
    await page.keyboard.press('Escape')
    assert await page.locator('.nq-city-preview').is_hidden()
    # Issue #60: Sticker Book's Back must return to where it was opened (reached from Games).
    await page.evaluate("go('games')")
    await page.locator('.tile[data-go="stickers"]').click()
    assert await page.get_by_role('heading',name='📒 Sticker Book').count()==1
    assert await page.locator('.back[data-go="games"]').count()==1
    await page.locator('.back[data-go="games"]').click()
    assert await page.get_by_role('heading',name='🎮 Games').count()==1
    await page.locator('.back[data-go="menu"]').click()
    assert not errors,f'page errors on sticker navigation: {errors}'
    # Select through the real picker to persist this learner as the returning player.
    await page.locator('.nq-village-profile').click()
    assert await page.get_by_text('Who’s playing today?').count()==1
    await page.locator('.pcard').filter(has_text='Tester').click()
    await page.reload()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    await page.locator('.nq-launch-start').wait_for(state='visible')
    await page.get_by_role('button',name='Tap to Play').click()
    await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    # The title overlay can detach a microtask before focus restoration finishes.
    # Wait for the observable focus state, rather than racing DOM removal.
    await page.wait_for_function("()=>document.activeElement?.classList.contains('nq-village-continue')",timeout=2500)
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    # K1: shared devices always ask which learner is playing.
    second=await page.evaluate("""()=>{const p=NQ.profiles.create('Second','🐱');NQ.pets.init();NQ.pets.chooseStarter('kitten','Kit');return p.id}""")
    await page.evaluate("()=>go('profiles')")
    await page.locator(f'.pcard[data-pid="{second}"]').click()
    await page.reload()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    await page.get_by_role('button',name='Tap to Play').click()
    await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
    await page.get_by_role('heading',name='Who’s playing today?').wait_for()
    assert await page.evaluate('NQ.profiles.current()===null')
    await page.get_by_role('button',name='Second',exact=True).click()
    assert 'Second' in await page.locator('#nq-menu-title').inner_text()
    # Removed profile pointers must not leave a player stuck in the wrong menu.
    await page.evaluate("()=>{const id=NQ.profiles.current().id;NQ.profiles.remove(id)}")
    await page.reload()
    await page.get_by_role('button',name='Tap to Play').click()
    await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    assert not errors,f'page errors on reload: {errors}'
    await ctx.close()
   # A first-time learner must still get profile creation and starter-pet onboarding.
   ctx=await browser.new_context(viewport={'width':390,'height':844},has_touch=True)
   page=await ctx.new_page();errors=[]
   await page.clock.install()
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'index.html')
   await page.get_by_role('button',name='Tap to Play').click()
   await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
   assert await page.get_by_text('Who’s playing today?').count()==1
   gate=page.get_by_role('button',name='Grown-ups · hold for 3 seconds')
   dimensions=await gate.bounding_box()
   assert dimensions['width'] < 150, dimensions
   await gate.click()
   assert await page.get_by_text('Who’s playing today?').is_visible()
   await gate.focus()
   await page.keyboard.down('Space')
   await page.clock.run_for(3100)
   await page.keyboard.up('Space')
   await page.get_by_role('heading',name='No players yet',exact=True).wait_for()
   await page.locator('.back[data-go="profiles"]').click()
   await page.get_by_role('button',name='New player').click()
   visible_grid=await page.locator('.av-grid').evaluate("""grid=>{
       const bounds=grid.getBoundingClientRect();
       return [...grid.querySelectorAll('.avb')].every(button=>{
           const box=button.getBoundingClientRect();
           return box.left>=bounds.left-1 && box.right<=bounds.right+1 && box.width>=48 && box.height>=48;
       });
   }""")
   assert visible_grid, 'all avatar columns must fit at 390px and remain tappable'
   last_avatar=page.locator('.avb').last
   await last_avatar.tap()
   assert await last_avatar.get_attribute('aria-pressed')=='true'
   await page.locator('#pname').fill('New Adventurer')
   await page.locator('#mk').click()
   await page.get_by_role('heading',name='Meet your kitten').wait_for()
   await screenshot(page,'onboarding-kitten-390.png')
   await page.get_by_label('Kitten name').fill('Scout')
   await page.get_by_role('button',name='Go to the village').click()
   assert await page.evaluate("NQ.profiles.current().pets.length === 1 && NQ.profiles.current().pets[0].sp === 'kitten' && NQ.profiles.current().pets[0].name === 'Scout' && !NQ.profiles.current().pets[0].egg && NQ.companions.get().primary === NQ.profiles.current().pets[0] && NQ.profiles.current().starterDone")
   assert await page.locator('#hab,[data-st]').count()==0
   assert 'New Adventurer' in await page.locator('#nq-menu-title').inner_text()
   await page.locator('#nq-village-player').click()
   await page.get_by_role('button',name='New Adventurer',exact=True).click()
   assert await page.evaluate("NQ.profiles.current().pets.length === 1")
   await page.reload()
   await page.get_by_role('button',name='Tap to Play').click()
   await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
   assert 'New Adventurer' in await page.locator('#nq-menu-title').inner_text()
   # Create another learner using real clicks; interrupt kitten naming by reloading.
   await page.locator('#nq-village-player').click()
   await page.get_by_role('button',name='New player').click()
   await page.locator('#pname').fill('Learner B')
   await page.locator('#mk').click()
   await page.get_by_role('heading',name='Meet your kitten').wait_for()
   await page.reload()
   await page.get_by_role('button',name='Tap to Play').click()
   await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
   await page.get_by_role('heading',name='Who’s playing today?').wait_for()
   await page.get_by_role('button',name='Learner B',exact=True).click()
   await page.get_by_role('heading',name='Meet your kitten').wait_for()
   assert await page.locator('#hab,[data-st]').count()==0
   # Exercise the asynchronous remote callback boundary without contacting cloud services.
   await page.evaluate('onRemote()')
   await page.get_by_role('heading',name='Meet your kitten').wait_for()
   await page.get_by_role('button',name='Keep Melody').click()
   assert 'Learner B' in await page.locator('#nq-menu-title').inner_text()
   assert await page.evaluate("NQ.profiles.current().pets.length===1 && NQ.profiles.current().pets[0].name==='Melody' && !NQ.profiles.current().pets[0].egg")
   await page.locator('#nq-village-player').click()
   await page.get_by_role('button',name='New Adventurer',exact=True).click()
   assert await page.evaluate("NQ.profiles.current().pets.length===1 && NQ.profiles.current().pets[0].name==='Scout'")
   assert not errors,f'page errors on first-time flow: {errors}'
   await ctx.close()
   # Wide layout pans between side districts; primary piano controls stay accessible.
   wide=await browser.new_context(viewport={'width':1440,'height':900})
   page=await wide.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'index.html')
   await page.get_by_role('button',name='Tap to Play').click()
   await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
   await page.evaluate("()=>{NQ.profiles.create('Wide','🐰');NQ.pets.init();NQ.pets.chooseStarter('puppy','Pip');go('menu')}")
   await page.locator('.nq-parallax-active').wait_for()
   viewport=page.locator('.nq-city-viewport')
   await page.wait_for_function("()=>{const v=document.querySelector('.nq-city-viewport');return v&&v.scrollLeft>0}")
   before=await viewport.evaluate('(v)=>v.scrollLeft')
   await page.get_by_role('button',name='Explore right →').click()
   await page.wait_for_timeout(800)
   after=await viewport.evaluate('(v)=>v.scrollLeft')
   assert after>before,(before,after)
   await page.get_by_role('button',name='Learning district').click()
   await page.wait_for_timeout(800)
   center=await viewport.evaluate('(v)=>v.scrollLeft')
   assert abs(center-before)<8,(before,center)
   for name in ['Continue Adventure','My Journey','Lessons','Music Library']:
    assert await page.locator('.nq-city-learning').get_by_text(name,exact=False).count()>=1,name
   assert await page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
   assert not errors,f'page errors on wide village: {errors}'
   await wide.close()
   print('PASS: magical village scene and destinations, returning profiles, onboarding, navigation at phone, tablet and desktop widths')
  finally:await browser.close();SERVER.shutdown()
if __name__=='__main__':asyncio.run(run())
