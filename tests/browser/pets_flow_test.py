import asyncio,sys,http.server,threading,functools,os
import os, sys, subprocess, tempfile
HERE=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(HERE,'..','..'))
NQ_INDEX=os.environ.get('NQ_INDEX',os.path.join(REPO,'index.html'))
WWW=os.environ.get('NQ_WWW') or tempfile.mkdtemp(prefix='nqwww-')
def prep():
    os.makedirs(WWW,exist_ok=True)
    subprocess.run(['cp',NQ_INDEX,os.path.join(WWW,'new.html')],check=True)
    if os.path.isdir(os.path.join(os.path.dirname(NQ_INDEX),'assets')): subprocess.run(['cp','-r',os.path.join(os.path.dirname(NQ_INDEX),'assets'),WWW])
    old=subprocess.run(['git','-C',REPO,'show','109db36:index.html'],capture_output=True,text=True).stdout
    open(os.path.join(WWW,'old.html'),'w',encoding='utf-8').write(old)
prep()
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8766),functools.partial(http.server.SimpleHTTPRequestHandler,directory=WWW))
http.server.SimpleHTTPRequestHandler.log_message=lambda *a:None
threading.Thread(target=srv.serve_forever,daemon=True).start()
from playwright.async_api import async_playwright
fails=[];n=0
def check(name,c):
    global n
    n+=1
    if not c: fails.append(name); print('FAIL',name)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch();pg=await br.new_page(viewport={'width':1000,'height':1300});errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://127.0.0.1:8766/new.html');await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{NQ.profiles.create('Zoe','🐰');NQ.pets.init();NQ.pets.setNight('00:00','00:00');go('home')}");await pg.wait_for_timeout(300)
        await pg.click('[data-st="puppy"]');await pg.fill('#pn','Biscuit');await pg.click('[data-r="ok"]');await pg.wait_for_timeout(400)
        check('egg shown at home','🥚' in await pg.inner_text('#hab'))
        await pg.click('.pet',force=True);await pg.wait_for_timeout(300)
        check('sheet says hatches after 3 rounds','hatches after 3 more music rounds' in await pg.inner_text('.sheet'))
        await pg.click('[data-a="close"]')
        # play 3 Name It rounds
        await pg.evaluate("""()=>{const a=NQ.items.pickWeighted;NQ.items.pickWeighted=(...x)=>window.__last=a(...x)}""")
        for k in range(3):
            await pg.evaluate("()=>go('drill','L1:name')");await pg.wait_for_timeout(250)
            for i in range(10):
                l=await pg.evaluate("()=>window.__last.note[0]");await pg.click(f'.lb[data-l="{l}"]');await pg.wait_for_timeout(1000)
            await pg.click('[data-r="done"]');await pg.wait_for_timeout(200)
        await pg.evaluate("()=>go('home')");await pg.wait_for_timeout(400)
        check('hatched after 3 Name It games','🥚' not in await pg.inner_text('#hab') and await pg.evaluate("()=>NQ.pets.display(NQ.companions.get().primary.id).stage")=='baby')
        # soap: run out then buy
        await pg.evaluate("()=>{const p=NQ.profiles.current();p.supplies.soap=0;const pet=p.pets[0];pet.c=10;pet.cT=Date.now();go('home')}");await pg.wait_for_timeout(300)
        await pg.click('.pet',force=True);await pg.wait_for_timeout(300);await pg.click('[data-a="clean"]');await pg.wait_for_timeout(200)
        check('out of soap message','Out of soap' in await pg.inner_text('#sMsg'))
        await pg.click('[data-a="close"]');await pg.evaluate("()=>{NQ.profiles.giveCoins(NQ.profiles.current().id,20);go('shop','tools')}");await pg.wait_for_timeout(300)
        check('soap pack in Care tab','Soap ×3' in await pg.inner_text('.shop-grid'))
        await pg.click('[data-buy="supply|soap"]');await pg.wait_for_timeout(200)
        check('soap bought',await pg.evaluate("()=>NQ.pets.supplies().soap")==3)
        await pg.evaluate("()=>go('home')");await pg.wait_for_timeout(300);await pg.click('.pet',force=True);await pg.wait_for_timeout(300);await pg.click('[data-a="clean"]');await pg.wait_for_timeout(300)
        check('bath works and uses soap','Squeaky' in await pg.inner_text('#sMsg') and await pg.evaluate("()=>NQ.pets.supplies().soap")==2)
        await pg.click('[data-a="close"]')
        # bags: mess with no bags
        await pg.evaluate("()=>{const p=NQ.profiles.current();p.supplies.bags=0;p.messT.home=Date.now()-6*3600e3;go('home')}");await pg.wait_for_timeout(300)
        await pg.click('.mess',force=True);await pg.wait_for_timeout(300)
        check('out of bags toast','Out of cleaning bags' in await pg.inner_text('#toast'))
        await pg.evaluate("()=>{NQ.profiles.current().supplies.bags=3;go('home')}");await pg.wait_for_timeout(300)
        nm=await pg.evaluate("()=>document.querySelectorAll('.mess').length");await pg.click('.mess',force=True);await pg.wait_for_timeout(400)
        check('scoop uses a bag',await pg.evaluate("()=>NQ.pets.supplies().bags")==2 and await pg.evaluate("()=>document.querySelectorAll('.mess').length")==nm-1)
        # sleeping + wake
        await pg.evaluate("()=>{NQ.pets.setNight('00:00','23:59');go('home')}");await pg.wait_for_timeout(300)
        await pg.click('.pet',force=True);await pg.wait_for_timeout(300);await pg.click('[data-a="clean"]');await pg.wait_for_timeout(200)
        check('sleeping blocks bath','sleeping' in await pg.inner_text('#sMsg'))
        await pg.click('[data-a="pet"]');await pg.wait_for_timeout(200)
        check('pet wakes','woke up' in await pg.inner_text('#sMsg'))
        check('no page errors',not errs)
        for e in errs[:5]:print(e)
        await br.close()
    print(f'{n-len(fails)} passed, {len(fails)} failed');sys.exit(1 if fails else 0)
asyncio.run(main())
