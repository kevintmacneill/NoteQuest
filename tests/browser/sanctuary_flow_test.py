"""World 1 Sanctuary UI. Only fixture preparation writes save data directly."""
import asyncio
import functools
import http.server
import os
from pathlib import Path
import threading

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get('NQ_WWW', str(ROOT / '_www_sanctuary_flow_test')))
OUT.mkdir(parents=True, exist_ok=True)


async def exercise(browser, url, width, height):
    ctx = await browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce', service_workers='block')
    await ctx.route('**/*', lambda route: route.continue_() if route.request.url.startswith(url) else route.abort())
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.goto(url)
    await page.get_by_role('button', name='Tap to Play').click()
    await expect(page.get_by_role('dialog', name='Welcome to NoteQuest')).to_have_count(0)
    await page.get_by_role('button', name='New player').click()
    await page.get_by_label('Player name').fill('Sanctuary tester')
    await page.get_by_role('button', name='Continue', exact=True).click()
    await page.get_by_label('Kitten name').fill('Clover')
    await page.get_by_role('button', name='Go to the village').click()
    # Fixture-only state for a mixed roster, two patients and three dirty-pen spots. All navigation and care are real clicks.
    await page.evaluate("""()=>{
      const p=NQ.profiles.current(), pet=p.pets[0], now=Date.now();
      delete pet.egg;
      Object.assign(pet,{h:1,hT:now,j:1,jT:now,c:1,cT:now,lowSince:now-48*3600e3});
      for(const [id,sp,name,sick] of [
        ['capy','capybara','Maple',true],['bunny','bunny','Juniper',false],
        ['pup','puppy','Birch',false],['owl','owl','Wren',false],
        ['mouse','mouse','Hazel',false],['turtle','turtle','Pebble',false],
        ['cat','cat','Poppy',false]
      ]){
        const {hab,fav}=NQ.content.SPECIES_BY_ID[sp];
        const need=sick?1:90;
        p.pets.push({id,sp,name,hab,h:need,j:need,c:need,hT:now,jT:now,cT:now,gT:now,grow:10,
          lowSince:sick?now-48*3600e3:undefined});
        p.inv[fav]=3;
      }
      p.sanctuary.pen.messT=now;
      p.sanctuary.pen.mess=Array.from({length:3},(_,i)=>({id:'fixture-'+i,type:'leaves',i:'🍂',zone:pet.hab,x:30,y:50}));
      p.supplies.bags=3;
      p.tools.push('toy');
      p.petPrefs.nightStart=p.petPrefs.nightEnd='00:00';
      p.pets.find(a=>a.id==='pup').j=50;
      NQ.save();
    }""")
    await page.get_by_role('button', name='Companion Sanctuary').click()
    await expect(page.get_by_role('heading', name='Companion Sanctuary')).to_be_focused()
    await expect(page.get_by_role('heading', name='Shared Pen')).to_be_visible()
    await expect(page.get_by_role('button', name='I see what needs care')).to_have_count(0)
    await page.wait_for_function("NQ.sanctuary.state().issues.some(i=>i.kind==='dirty-pen'&&i.observed)")
    await page.screenshot(path=str(OUT / f'sanctuary-pen-{width}.png'), full_page=True)
    portraits = page.get_by_role('group', name='Animal portraits')
    await expect(portraits.get_by_role('button')).to_have_count(6)
    await portraits.get_by_role('button', name='Select Poppy').click()
    await expect(portraits.get_by_role('button', name='Select Poppy')).to_have_attribute('aria-pressed', 'true')
    await expect(page.get_by_role('button', name='Bathe Poppy')).to_be_visible()
    await expect(page.get_by_role('button', name='Bathe Birch')).to_have_count(0)
    await page.get_by_role('button', name='Visit Birch').click()
    await expect(portraits.get_by_role('button', name='Select Birch')).to_have_attribute('aria-pressed', 'true')
    await expect(page.get_by_role('button', name='Bathe Birch')).to_be_visible()
    assert await page.evaluate("!NQ.sanctuary.state().issues.some(i=>i.kind==='sick'&&i.observed)")
    await page.get_by_role('button', name='Play with Birch').click()
    assert await page.evaluate("NQ.pets.byId('pup').plays.length===1 && !NQ.pets.byId('cat').plays?.length")
    await expect(page.get_by_text('Restless',exact=True)).to_be_visible()
    await expect(page.locator('.nq-sanctuary')).to_have_attribute('data-world','NQ-00')
    await page.get_by_role('button', name='Clean spot 1').click()
    await expect(page.get_by_text('Cleaning bags: 2')).to_be_visible()
    await expect(page.get_by_text('Content',exact=True)).to_be_visible()
    assert await page.evaluate("!NQ.sanctuary.state().issues.some(i=>i.kind==='dirty-pen')")
    await page.get_by_role('button', name='Hospital Bay').click()
    await page.wait_for_function("NQ.sanctuary.state().issues.filter(i=>i.kind==='sick'&&i.observed).length===2")
    await expect(page.get_by_role('heading', name='Clover')).to_be_visible()
    await expect(page.get_by_role('group', name='Recovery bays').get_by_role('button')).to_have_count(2)
    patients = page.get_by_role('group', name='Patient portraits')
    await patients.get_by_role('button', name='Select Maple').click()
    await expect(page.get_by_role('button', name='Bathe Maple')).to_be_visible()
    await expect(page.get_by_role('button', name='Bathe Clover')).to_have_count(0)
    assert await page.evaluate("NQ.pets.byId('capy').meals||0")==0
    await page.get_by_role('button', name='Feed Maple', exact=False).click()
    assert await page.evaluate("NQ.pets.byId('capy').meals")==1
    assert await page.evaluate("NQ.profiles.current().pets.find(p=>p.name==='Clover').meals")==0
    await patients.get_by_role('button', name='Select Clover').click()
    await page.screenshot(path=str(OUT / f'sanctuary-hospital-{width}.png'), full_page=True)
    await page.get_by_role('button', name='Bathe Clover').click()
    await expect(page.get_by_role('heading', name='Bath Time')).to_be_visible()
    await page.screenshot(path=str(OUT / f'sanctuary-bath-{width}.png'), full_page=True)
    await expect(page.locator('#app > .top')).to_have_count(0)
    await page.get_by_role('button', name='Back to Sanctuary', exact=True).click()
    await expect(page.get_by_role('button', name='Hospital Bay')).to_have_attribute('aria-pressed','true')
    await expect(page.get_by_role('button', name='Select Clover')).to_have_attribute('aria-pressed','true')
    # Advance the recovery fixture without changing the game's real care thresholds.
    await page.evaluate("""()=>{
      const pet=NQ.pets.byId('capy'), now=Date.now();
      Object.assign(pet,{h:90,j:90,c:90,hT:now,jT:now,cT:now});
      NQ.sanctuary.state();
    }""")
    await expect(page.get_by_role('group', name='Recovery bays').get_by_role('button')).to_have_count(1)
    await page.get_by_role('button', name='Shared Pen').click()
    await expect(page.get_by_role('group', name='Animal portraits').get_by_role('button')).to_have_count(7)
    await expect(page.get_by_role('button', name='Select Maple')).to_be_visible()
    await expect(page.get_by_role('heading', name='Companion Sanctuary')).to_be_visible()
    await page.get_by_role('button', name='Back to Village').click()
    await expect(page.get_by_role('button', name='Companion Sanctuary')).to_be_visible()
    assert not errors, errors
    assert await page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
    await ctx.close()


async def main():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT))
    with http.server.ThreadingHTTPServer(('127.0.0.1',0),handler) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f'http://127.0.0.1:{server.server_port}/'
        try:
            async with async_playwright() as playwright:
                browser=await playwright.chromium.launch()
                for width,height in [(390,844),(844,390),(820,1180),(1280,800)]:
                    await exercise(browser,url,width,height)
                    print(f'PASS {width}×{height}: village entry, discovery on entry without scrolling, cleaning, hospital and return')
                await browser.close()
        finally:
            server.shutdown()


if __name__=='__main__':
    asyncio.run(main())
