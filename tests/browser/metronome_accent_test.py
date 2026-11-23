"""Issue #20: 6/8 accents click 1 and click 4. Not wired into CI: tests.yml is
edited by open PR #32, so the node suite is what GitHub runs. Run locally with:
python3 tests/browser/metronome_accent_test.py
"""
import asyncio, functools, http.server, os, threading
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
PORT=8771
srv=http.server.ThreadingHTTPServer(('127.0.0.1',PORT),functools.partial(http.server.SimpleHTTPRequestHandler,directory=REPO))
http.server.SimpleHTTPRequestHandler.log_message=lambda *a:None
threading.Thread(target=srv.serve_forever,daemon=True).start()

async def accents(page):
    return await page.locator('#beatDots .beat-dot').evaluate_all("els=>els.map(e=>e.dataset.accent)")

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch()
        page=await browser.new_page(viewport={'width':390,'height':844})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.goto(f'http://127.0.0.1:{PORT}/reference.html')
        await page.get_by_role('tab',name='Metronome').click()
        await page.select_option('#timeSignature','4')
        assert await accents(page)==['primary','normal','normal','normal'], await accents(page)
        await page.select_option('#timeSignature','6')
        assert await accents(page)==['primary','normal','normal','secondary','normal','normal'], await accents(page)
        await page.evaluate("""()=>{
          window.__freqs=[];
          const orig=AudioContext.prototype.createOscillator;
          AudioContext.prototype.createOscillator=function(){
            const osc=orig.apply(this,arguments);
            const set=osc.frequency.setValueAtTime.bind(osc.frequency);
            osc.frequency.setValueAtTime=function(v,t){window.__freqs.push(v);return set(v,t)};
            return osc;
          };
        }""")
        await page.fill('#tempoNumber','240')
        await page.locator('#tempoNumber').dispatch_event('change')
        await page.locator('#metToggle').click()
        await page.wait_for_timeout(1700)
        freqs=await page.evaluate('window.__freqs')
        assert len(freqs)>=6, freqs
        assert freqs[:6]==[1450,900,900,1175,900,900], freqs[:8]
        status=await page.locator('#metStatus').inner_text()
        assert 'click 4 is lighter' in status, status
        assert not errors, errors
        await browser.close()
    print('PASS: 6/8 secondary accent on click 4 at phone width')
    srv.shutdown()

if __name__=='__main__':
    asyncio.run(main())
