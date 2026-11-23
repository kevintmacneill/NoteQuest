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
    start=page.get_by_role('button',name='Tap to Play')
    await start.wait_for()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    assert await page.evaluate('document.activeElement.classList.contains("nq-launch-start")')
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow before start: {width}'
    await start.click()
    await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
    assert await page.get_by_text('Who’s playing today?').count()==1
    assert await page.get_by_role('button',name='New player').count()==1
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow in menu: {width}'
    assert not errors,f'page errors: {errors}'
    # Main navigation must be visible and usable without scrolling through the pet pen.
    await page.evaluate("()=>{NQ.profiles.create('Tester','🐰');NQ.pets.init();NQ.pets.chooseStarter('puppy','Pip');go('menu')}")
    await page.locator('#nq-menu-title').wait_for()
    assert 'Tester' in await page.locator('#nq-menu-title').inner_text()
    assert await page.locator('.nq-city-learning [data-go="continueAdventure"]').is_visible()
    assert await page.locator('.nq-menu-card[data-go="games"]').is_visible()
    assert await page.locator('.nq-city-utility [data-go="home"]').is_visible()
    assert await page.locator('a[href="./reference.html"]').count()>=1
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow in main hub: {width}'
    await page.locator('.nq-menu-card[data-go="games"]').click()
    assert await page.get_by_role('heading',name='🎮 Games').count()==1
    await page.locator('.back[data-go="menu"]').click()
    await page.locator('.nq-city-utility [data-go="home"]').click()
    assert await page.locator('#hab').count()==1
    await page.locator('.back[data-go="menu"]').click()
    await page.locator('.nq-city-learning [data-go="nqwHub"]').click()
    assert await page.get_by_role('heading',name='🧭 Music Journey').count()==1
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('#nq-menu-title').is_visible()
    # City panorama is distinct from the title scene and scrolls horizontally.
    assert await page.locator('.nq-village').count()==1
    assert await page.locator('.nq-village-art').is_visible()
    assert 'nq-city-overlook-v1.avif' in await page.locator('.nq-village-art').get_attribute('src')
    assert 'nq-painted-village' not in await page.content()
    await page.wait_for_function("() => {const img=document.querySelector('.nq-village-art'); return img&&img.complete&&img.naturalWidth>=600}")
    assert await page.locator('.nq-village-profile').is_visible()
    assert 'Tester' in await page.locator('.nq-village-profile').inner_text()
    assert 'Pip' in await page.locator('#nq-menu-pet').inner_text()
    assert await page.locator('#coinBadge').inner_text()==str(await page.evaluate('NQ.coins.balance()'))
    assert await page.locator('.nq-village-continue[data-go="continueAdventure"]').is_visible()
    for target in ['.nq-city-library','.nq-city-gate','.nq-city-practice','.nq-city-academy']:
     assert await page.locator(target).is_visible(),f'Missing village destination: {target}'
    assert await page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),f'village overflow: {width}'
    # #109: Continue opens the engine-authorized lesson, not a preview map.
    real_next=await page.evaluate('NQ.learn.currentStop()')
    assert real_next and real_next.startswith('NQ-00-'),real_next
    await page.locator('.nq-village-continue').click()
    assert await page.get_by_role('heading',name='🎹 Lesson').count()==1
    assert await page.locator('#nq109-learn').count()==1
    assert await page.get_by_role('heading',name='🎹 Lesson stop').count()==0
    # A preview-only ID must never be accepted as an engine lesson.
    await page.evaluate("""()=>{window.__savedCurrentStop=NQ.learn.currentStop;NQ.learn.currentStop=()=> 'NQ-00-U01';go('menu')}""")
    await page.locator('.nq-village-continue').click()
    assert await page.get_by_role('heading',name='🎹 Lesson').count()==0
    assert await page.get_by_role('heading',name='🎹 Lesson stop').count()==0
    await page.evaluate("""()=>{NQ.learn.currentStop=window.__savedCurrentStop;delete window.__savedCurrentStop;go('menu')}""")
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
    await page.locator('.nq-city-learning [data-go="lessonIndex"]').click()
    assert await page.get_by_role('heading',name='🗺️ World Map').count()==1
    await page.locator('.back[data-go="nqwHub"]').click()
    await page.locator('.back[data-go="menu"]').click()
    assert await page.locator('.nq-village').count()==1
    # Issue #60: Sticker Book's Back must return to where it was opened.
    await page.locator('.nq-city-trophies').click()
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
    # Last selection is respected even if multiple learner profiles exist.
    second=await page.evaluate("""()=>{const p=NQ.profiles.create('Second','🐱');NQ.pets.init();NQ.pets.chooseStarter('kitten','Kit');return p.id}""")
    await page.evaluate("()=>go('profiles')")
    await page.locator(f'.pcard[data-pid="{second}"]').click()
    await page.reload()
    assert await page.get_by_role('dialog',name='Welcome to NoteQuest').count()==1
    await page.get_by_role('button',name='Tap to Play').click()
    await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
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
   ctx=await browser.new_context(viewport={'width':390,'height':844})
   page=await ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'index.html')
   await page.get_by_role('button',name='Tap to Play').click()
   await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
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
   await page.get_by_role('button',name='Tap to Play').click()
   await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
   assert 'New Adventurer' in await page.locator('#nq-menu-title').inner_text()
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
   await page.locator('.nq-village-art').wait_for()
   await page.wait_for_function("()=>{const img=document.querySelector('.nq-village-art');return img&&img.complete&&img.naturalWidth>=600}")
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
   for name in ['Continue Adventure','My Journey','Lessons','Practice Games','Music Library']:
    assert await page.locator('.nq-city-learning').get_by_text(name,exact=False).count()>=1,name
   assert await page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
   assert not errors,f'page errors on wide village: {errors}'
   await wide.close()
   print('PASS: magical village scene and destinations, returning profiles, onboarding, navigation at phone, tablet and desktop widths')
  finally:await browser.close();SERVER.shutdown()
if __name__=='__main__':asyncio.run(run())
