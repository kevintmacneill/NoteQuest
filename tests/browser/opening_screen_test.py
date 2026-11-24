"""Loading vista, Tap to Play, then the menu. Run: python tests/browser/opening_screen_test.py
Requires playwright and Chromium. Does not modify learner data on disk.
"""
import asyncio, functools, http.server, os, threading
from playwright.async_api import async_playwright
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
SERVER=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT))
threading.Thread(target=SERVER.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{SERVER.server_address[1]}/'

def learner_words(text):
    lowered=text.lower()
    for bad in ('click to play','asset','fallback','developer','percent','undefined','null'):
        if bad in lowered: return bad
    return ''

async def hold_picture(page):
    started=asyncio.Event(); release=asyncio.Event()
    async def handle(route):
        if 'nq-opening-' in route.request.url:
            started.set()
            await release.wait()
        await route.continue_()
    await page.route('**/*', handle)
    return started, release

async def run():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch()
  try:
   # Progress stays unfinished until the picture bytes actually arrive.
   ctx=await browser.new_context(viewport={'width':390,'height':844})
   page=await ctx.new_page(); errors=[]
   page.on('pageerror', lambda e: errors.append(str(e)))
   started, release=await hold_picture(page)
   await page.goto(BASE+'index.html')
   await started.wait()
   assert await page.get_by_text('Loading Your Adventure…').is_visible()
   assert await page.get_by_role('button', name='Tap to Play').count()==0
   bad=learner_words(await page.locator('.nq-launch').inner_text())
   assert not bad, bad
   await page.keyboard.press('Escape')
   assert await page.get_by_role('dialog', name='Welcome to NoteQuest').count()==1
   await page.wait_for_timeout(500)
   assert await page.get_by_role('button', name='Tap to Play').count()==0
   value=await page.locator('.nq-launch-meter').get_attribute('aria-valuenow')
   assert value is None or int(value)<100, value
   release.set()
   play=page.get_by_role('button', name='Tap to Play')
   await play.wait_for()
   assert await page.locator('.nq-launch-meter').count()==0 or not await page.locator('.nq-launch-meter').is_visible()
   assert 'nq-launch-has-art' in await page.locator('.nq-launch').get_attribute('class')
   clipped=await page.evaluate("""()=>{const s=getComputedStyle(document.querySelector('.nq-launch-brand'));return s.position==='absolute'&&parseFloat(s.height)<=2}""")
   assert clipped
   box=await play.bounding_box()
   assert box['height']>=64 and box['width']>=160
   assert box['y']>=0 and box['y']+box['height']<=844+1
   assert await page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
   assert await page.evaluate('document.activeElement.classList.contains("nq-launch-start")')
   await page.keyboard.press('Tab')
   assert await page.evaluate('document.activeElement.classList.contains("nq-launch-start")')
   await page.keyboard.press('Enter')
   await page.get_by_role('dialog', name='Welcome to NoteQuest').wait_for(state='detached')
   assert await page.get_by_text('Who’s playing today?').count()==1
   assert not errors, errors
   await ctx.close()

   # A missing picture still offers Tap to Play on the plain background.
   ctx=await browser.new_context(viewport={'width':820,'height':1180})
   page=await ctx.new_page(); errors=[]
   page.on('pageerror', lambda e: errors.append(str(e)))
   async def abort_picture(route):
    if 'nq-opening-' in route.request.url: await route.abort()
    else: await route.continue_()
   await page.route('**/*', abort_picture)
   await page.goto(BASE+'index.html')
   play=page.get_by_role('button', name='Tap to Play')
   await play.wait_for()
   assert await page.locator('.nq-launch-logo').is_visible()
   assert await page.locator('.nq-launch-title').is_visible()
   box=await page.locator('.nq-launch-title').bounding_box()
   assert box and box['height']>20
   assert 'nq-launch-has-art' not in (await page.locator('.nq-launch').get_attribute('class') or '')
   bad=learner_words(await page.locator('.nq-launch').inner_text())
   assert not bad, bad
   await play.click()
   await page.get_by_role('dialog', name='Welcome to NoteQuest').wait_for(state='detached')
   assert await page.get_by_text('Who’s playing today?').count()==1
   assert not errors, errors
   await ctx.close()

   # Phone landscape and tablet: touch, then a remembered learner reaches the menu.
   for width,height,touch in ((844,390,True),(820,1180,True),(1280,800,False)):
    ctx=await browser.new_context(viewport={'width':width,'height':height}, has_touch=touch)
    page=await ctx.new_page(); errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.goto(BASE+'index.html')
    play=page.get_by_role('button', name='Tap to Play')
    await play.wait_for()
    box=await play.bounding_box()
    assert box['height']>=64 and box['width']>=160, (width, box)
    assert 0<=box['x'] and box['x']+box['width']<=width+1
    assert 0<=box['y'] and box['y']+box['height']<=height+1
    assert await page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'), width
    if touch:
     await page.touchscreen.tap(box['x']+box['width']/2, box['y']+box['height']/2)
    else:
     await play.click()
    await page.get_by_role('dialog', name='Welcome to NoteQuest').wait_for(state='detached')
    assert await page.get_by_text('Who’s playing today?').count()==1
    await page.evaluate("()=>{NQ.profiles.create('Ada','🐰');NQ.pets.init();NQ.pets.chooseStarter('kitten','Mist');go('menu')}")
    await page.locator('#nq-menu-title').wait_for()
    await page.reload()
    await page.get_by_role('button', name='Tap to Play').wait_for()
    await page.get_by_role('button', name='Tap to Play').click()
    await page.get_by_role('dialog', name='Welcome to NoteQuest').wait_for(state='detached')
    assert 'Ada' in await page.locator('#nq-menu-title').inner_text()
    assert not errors, (width, errors)
    await ctx.close()

   # Reduced motion skips the zoom. Ordinary motion keeps a timed crossfade, and Skip ends it.
   ctx=await browser.new_context(viewport={'width':1280,'height':800})
   page=await ctx.new_page()
   await page.emulate_media(reduced_motion='reduce')
   await page.goto(BASE+'index.html')
   await page.get_by_role('button', name='Tap to Play').wait_for()
   # Reduced motion bypasses the scene completely, regardless of CSS.
   duration=await page.evaluate("()=>getComputedStyle(document.querySelector('.nq-launch-fade')).animationDuration")
   assert duration=='0s', duration
   await page.get_by_role('button', name='Tap to Play').click()
   await page.get_by_role('dialog', name='Welcome to NoteQuest').wait_for(state='detached', timeout=2000)
   await ctx.close()

   ctx=await browser.new_context(viewport={'width':1280,'height':800})
   page=await ctx.new_page(); errors=[]
   page.on('pageerror', lambda e: errors.append(str(e)))
   await page.goto(BASE+'index.html')
   await page.get_by_role('button', name='Tap to Play').wait_for()
   # Normal motion holds the view, then pushes, then fades: four seconds.
   await page.get_by_role('button', name='Tap to Play').click()
   await page.locator('.nq-launch.is-leaving').wait_for()
   timing=await page.evaluate("""()=>{
      const vista=getComputedStyle(document.querySelector('.nq-launch-vista'));
      const fade=getComputedStyle(document.querySelector('.nq-launch-fade'));
      return [vista.animationName,vista.animationDuration,
              fade.animationName,fade.animationDuration];
   }""")
   assert timing==['nq-vista-push','4s','nq-village-reveal','4s'],timing
   await page.wait_for_timeout(700)
   # During the first second the camera and visible title remain still.
   hold=await page.evaluate("""()=>{
     const v=document.querySelector('.nq-launch-vista');
     const f=document.querySelector('.nq-launch-fade');
     return [getComputedStyle(v).transform,getComputedStyle(f).opacity];
   }""")
   assert hold[0]=='matrix(1, 0, 0, 1, 0, 0)' and float(hold[1])>0.99,hold
   await page.get_by_role('button', name='Skip').click()
   await page.get_by_role('dialog', name='Welcome to NoteQuest').wait_for(state='detached')
   assert await page.get_by_text('Who’s playing today?').count()==1
   assert not errors, errors
   await ctx.close()

   # On a large desktop the cover stays a fraction of the picture, wider than the button.
   ctx=await browser.new_context(viewport={'width':1920,'height':1080}, device_scale_factor=1)
   page=await ctx.new_page()
   await page.goto(BASE+'index.html')
   await page.get_by_role('button', name='Tap to Play').wait_for()
   cover=await page.evaluate("""()=>{
     const c=document.querySelector('.nq-launch-cover');
     const v=document.querySelector('.nq-launch-vista');
     const cr=c.getBoundingClientRect(), vr=v.getBoundingClientRect();
     return {display:getComputedStyle(c).display, w:cr.width, vw:vr.width, h:cr.height, vh:vr.height};
   }""")
   assert cover['display']=='block', cover
   assert cover['w']>cover['vw']*0.45 and cover['h']>cover['vh']*0.12, cover
   assert await page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
   await ctx.close()

   # A stalled picture must never trap a learner on the loading screen.
   ctx=await browser.new_context(viewport={'width':390,'height':844})
   page=await ctx.new_page()
   await page.clock.install()
   started,release=await hold_picture(page)
   await page.goto(BASE+'index.html',wait_until='domcontentloaded')
   await asyncio.wait_for(started.wait(),timeout=5)
   await page.clock.run_for(8100)
   await page.get_by_role('button',name='Tap to Play').wait_for(timeout=2500)
   assert await page.locator('.nq-launch-vista').is_hidden()
   await page.get_by_role('button',name='Tap to Play').click()
   await page.get_by_role('dialog',name='Welcome to NoteQuest').wait_for(state='detached')
   assert await page.get_by_text('Who’s playing today?').is_visible()
   release.set()
   await ctx.close()

   # The picture width follows the on-screen size.
   expects=((640,360,'nq-opening-640.webp'),(900,506,'nq-opening-1024.webp'),(1280,800,'nq-opening-1672.webp'))
   for width,height,name in expects:
    ctx=await browser.new_context(viewport={'width':width,'height':height}, device_scale_factor=1)
    page=await ctx.new_page()
    seen=[]
    page.on('request', lambda req, seen=seen: seen.append(req.url))
    await page.goto(BASE+'index.html')
    await page.get_by_role('button', name='Tap to Play').wait_for()
    assert any(name in url for url in seen), (name, [u for u in seen if 'nq-opening' in u])
    await ctx.close()
   print('PASS: loading, Tap to Play, menu, keyboard, touch, missing and stalled picture, reduced motion, widths')
  finally:
   await browser.close(); SERVER.shutdown()
if __name__=='__main__':asyncio.run(run())
