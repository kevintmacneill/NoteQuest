"""NoteQuest UI catch-up smoke: real Chromium navigation, artwork and safe engine bindings."""
import asyncio, functools, http.server, os, threading
from playwright.async_api import async_playwright
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),"../.."))
PORT=18769
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",PORT),functools.partial(Quiet,directory=ROOT))
threading.Thread(target=server.serve_forever,daemon=True).start()
async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":900})
        errors=[]
        page.on("pageerror",lambda err: errors.append(str(err)))
        await page.goto(f"http://127.0.0.1:{PORT}/index.html")
        await page.evaluate("""() => {NQ.profiles.create('UI Test','🎹');go('nqwHub')}""")
        await page.wait_for_timeout(250)
        assert await page.locator(".nqw-world-card").count()==9,"nine world cards"
        assert await page.locator(".nqw-painted-map").count()>=9,"world art images"
        assert await page.locator(".nqw-painted-map").first.evaluate("(x)=>x.complete&&x.naturalWidth>0"),"art loads"
        await page.evaluate("()=>go('nqwWorld','NQ-00')")
        assert await page.get_by_text("Begin your Melody Harbor lessons").count()>0
        await page.evaluate("()=>go('nqhHarbor')")
        assert await page.locator(".nqh-harbor-hero").count()==1
        assert await page.locator(".nqh-stop").count()>0
        assert await page.locator(".nqh-progress").count()==1
        before=await page.evaluate("()=>NQ.learn.stopStatus('NQ-00-S1').step")
        await page.evaluate("()=>go('nqwReadiness','NQ-00')")
        assert await page.locator(".nqh-readiness-card").count()==3
        after=await page.evaluate("()=>NQ.learn.stopStatus('NQ-00-S1').step")
        assert before==after,"viewing screens does not grant progress"
        await page.set_viewport_size({"width":390,"height":844})
        await page.evaluate("()=>go('nqhHarbor')")
        assert await page.locator(".nqh-harbor-hero").is_visible()
        assert not errors,"browser errors: "+repr(errors)
        await browser.close()
        print("UI catch-up Chromium smoke PASS: atlas, images, Harbor, readiness, mobile, no fake progress")
asyncio.run(main())
server.shutdown()
