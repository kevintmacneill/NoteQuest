"""World 1 Sanctuary UI. Only fixture preparation writes save data directly."""
import asyncio
import functools
import http.server
from pathlib import Path
import threading

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


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
    # Fixture-only state for the sick kitten and three dirty-pen spots. All navigation and care are real clicks.
    await page.evaluate("""()=>{
      const p=NQ.profiles.current(), pet=p.pets[0], now=Date.now();
      delete pet.egg;
      Object.assign(pet,{h:1,hT:now,j:1,jT:now,c:1,cT:now,lowSince:now-48*3600e3});
      p.sanctuary.pen.messT=now;
      p.sanctuary.pen.mess=Array.from({length:3},(_,i)=>({id:'fixture-'+i,type:'leaves',i:'🍂',zone:pet.hab,x:30,y:50}));
      p.supplies.bags=3;
      NQ.save();
    }""")
    await page.get_by_role('button', name='Companion Sanctuary').click()
    await expect(page.get_by_role('heading', name='Companion Sanctuary')).to_be_focused()
    await expect(page.get_by_role('heading', name='Shared Pen')).to_be_visible()
    assert await page.evaluate("NQ.sanctuary.state().issues.filter(i=>i.observed).length===0")
    await page.get_by_role('button', name='I see what needs care').click()
    assert await page.evaluate("NQ.sanctuary.state().issues.some(i=>i.kind==='dirty-pen'&&i.observed)")
    await page.get_by_role('button', name='Clean spot 1').click()
    await expect(page.get_by_text('Cleaning bags: 2')).to_be_visible()
    assert await page.evaluate("!NQ.sanctuary.state().issues.some(i=>i.kind==='dirty-pen')")
    await page.get_by_role('button', name='Hospital Bay').click()
    await expect(page.get_by_role('heading', name='Clover')).to_be_visible()
    assert await page.evaluate("!NQ.sanctuary.state().issues.find(i=>i.kind==='sick').observed")
    await page.get_by_role('button', name='I see what needs care').click()
    assert await page.evaluate("NQ.sanctuary.state().issues.find(i=>i.kind==='sick').observed")
    await page.get_by_role('button', name='Bathe Clover').click()
    await expect(page.get_by_role('heading', name='Bath Time')).to_be_visible()
    await page.locator('button.back[data-go="sanctuary"]').click()
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
                for width,height in [(390,844),(820,1180),(1280,800)]:
                    await exercise(browser,url,width,height)
                    print(f'PASS {width}×{height}: village entry, explicit issue acknowledgment, cleaning, hospital and return')
                await browser.close()
        finally:
            server.shutdown()


if __name__=='__main__':
    asyncio.run(main())
