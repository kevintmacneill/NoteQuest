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
        await pg.locator('.nq-launch-start').click()
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
        # Soap: run out, buy supplies, cancel without charge, then finish a bath.
        await pg.evaluate("()=>{const p=NQ.profiles.current();p.supplies.soap=0;const pet=p.pets[0];pet.c=10;pet.cT=Date.now();go('home')}");await pg.wait_for_timeout(300)
        await pg.click('.pet',force=True);await pg.wait_for_timeout(300);await pg.click('[data-a="clean"]');await pg.wait_for_timeout(200)
        await pg.click('[data-care="start"]')
        check('out of soap message','Out of soap' in await pg.inner_text('.care-feedback'))
        await pg.evaluate("()=>NQ.profiles.giveCoins(NQ.profiles.current().id,20)")
        await pg.get_by_role('button',name='Get soap').click()
        check('soap pack in Supplies tab','Soap ×3' in await pg.inner_text('.shop-grid'))
        await pg.click('[data-buy="supply|soap"]');await pg.wait_for_timeout(200)
        check('soap bought',await pg.evaluate("()=>NQ.pets.supplies().soap")==3)
        await pg.evaluate("()=>go('home')");await pg.wait_for_timeout(300);await pg.click('.pet',force=True);await pg.wait_for_timeout(300);await pg.click('[data-a="clean"]');await pg.wait_for_timeout(300)
        coins=await pg.evaluate("NQ.coins.balance()")
        await pg.click('[data-care="start"]')
        await pg.click('[data-care="cancel"]')
        check('cancel does not use soap',await pg.evaluate("NQ.pets.supplies().soap")==3)
        await pg.click('[data-care="start"]')
        await pg.locator('.back[data-go="home"]').click()
        check('leaving a bath cancels it without consuming soap',
              await pg.evaluate("NQ.pets.supplies().soap===3 && !NQ.profiles.current().pets[0].bath"))
        await pg.eval_on_selector('.pet','e=>e.click()')
        await pg.click('[data-a="clean"]')
        for action in ['start','wash','rinse','finish']:
            await pg.click(f'[data-care="{action}"]')
        check('bath works and uses soap','Sparkly clean' in await pg.inner_text('.care-feedback') and await pg.evaluate("NQ.pets.supplies().soap")==2)
        check('bath awards no coins',await pg.evaluate("NQ.coins.balance()")==coins)
        await pg.locator('.back[data-go="home"]').click()
        # bags: mess with no bags
        await pg.evaluate("()=>{const p=NQ.profiles.current();p.supplies.bags=0;p.sanctuary.pen.messT=Date.now()-6*3600e3;go('home')}");await pg.wait_for_timeout(300)
        await pg.eval_on_selector('.mess','e=>e.click()');await pg.wait_for_timeout(300)
        check('out of bags toast','Out of cleaning bags' in await pg.inner_text('#toast'))
        await pg.evaluate("()=>{NQ.profiles.current().supplies.bags=3;go('home')}");await pg.wait_for_timeout(300)
        nm=await pg.evaluate("()=>document.querySelectorAll('.mess').length");await pg.eval_on_selector('.mess','e=>e.click()');await pg.wait_for_timeout(400)
        check('scoop uses a bag',await pg.evaluate("()=>NQ.pets.supplies().bags")==2 and await pg.evaluate("()=>document.querySelectorAll('.mess').length")==nm-1)
        # sleeping + wake
        await pg.evaluate("()=>{NQ.profiles.giveCoins(NQ.profiles.current().id,100);NQ.shop.buy('tool','toy');NQ.pets.setNight('00:00','23:59');go('home')}");await pg.wait_for_timeout(300)
        await pg.eval_on_selector('.pet','e=>e.click()')
        await pg.click('[data-a="play"]')
        check('sleeping blocks play','sleeping' in await pg.inner_text('#sMsg'))
        await pg.click('[data-a="clean"]')
        await pg.click('[data-care="start"]')
        check('sleeping blocks bath','sleeping' in await pg.inner_text('.care-feedback'))
        await pg.locator('.back[data-go="home"]').click()
        await pg.eval_on_selector('.pet','e=>e.click()')
        await pg.click('[data-a="pet"]');await pg.wait_for_timeout(200)
        check('pet wakes','woke up' in await pg.inner_text('#sMsg'))
        await pg.evaluate("""()=>{const p=NQ.profiles.current();p.habs.push('magic');
          p.sanctuary.pen.messT=Date.now();p.supplies.bags=3;
          p.sanctuary.pen.mess=[
            {id:'care-home',type:'poop',i:'💩',x:20,y:68,zone:'home'},
            {id:'care-magic-a',type:'poop',i:'💩',x:50,y:78,zone:'magic'},
            {id:'care-magic-b',type:'poop',i:'💩',x:79,y:82,zone:'magic'}];
          go('home')}""")
        await pg.locator('[data-go="cleanPen"]').click()
        check('shared pen shows messes across habitat zones',await pg.locator('.care-mess').count()==3)
        check('rendering a dirty pen does not observe it',
              not await pg.evaluate("NQ.sanctuary.state().issues.find(x=>x.kind==='dirty-pen').observed"))
        await pg.locator('#noticePen').click()
        check('explicit acknowledgement informs the learner and observes the dirty pen',
              await pg.evaluate("NQ.sanctuary.state().issues.find(x=>x.kind==='dirty-pen').observed"))
        await pg.locator('[data-clean="care-magic-a"]').click()
        check('cleaning another zone spends one bag and clears neglect risk',
              await pg.evaluate("NQ.pets.supplies().bags===2 && !NQ.sanctuary.state().issues.some(x=>x.kind==='dirty-pen')"))
        await pg.locator('.back[data-go="home"]').click()
        await pg.locator('[data-go="companions"]').click()
        await pg.locator('[data-companion]').click()
        check('one active companion is selected with no sidekick',
              await pg.evaluate("NQ.companions.get().companion.name==='Biscuit' && NQ.companions.get().sidekick===null"))
        check('no page errors',not errs)
        for e in errs[:5]:print(e)
        # Issue #7: Name It letters stay on one row at a phone width, and stay large on a tablet.
        async def letter_row(pg,label,expected,min_width):
            tops=await pg.locator('.letters .lb').evaluate_all('els=>els.map(e=>Math.round(e.getBoundingClientRect().top))')
            widths=await pg.locator('.letters .lb').evaluate_all('els=>els.map(e=>e.getBoundingClientRect().width)')
            heights=await pg.locator('.letters .lb').evaluate_all('els=>els.map(e=>e.getBoundingClientRect().height)')
            check(label+' count',len(tops)==expected)
            check(label+' one row',len(set(tops))==1)
            check(label+' tappable',bool(widths) and min(widths)>=min_width and min(heights)>=56)
            check(label+' no sideways scroll',await pg.evaluate('()=>document.documentElement.scrollWidth<=window.innerWidth+1'))
        phone=await br.new_page(viewport={'width':390,'height':844})
        await phone.goto('http://127.0.0.1:8766/new.html');await phone.wait_for_timeout(300)
        await phone.evaluate("()=>{NQ.profiles.create('Ada','🐰');go('drill','L1:name')}");await phone.wait_for_timeout(200)
        await letter_row(phone,'phone L1',5,60)
        await phone.evaluate("()=>go('drill','L4:name')");await phone.wait_for_timeout(200)
        await letter_row(phone,'phone L4',7,44)
        tablet=await br.new_page(viewport={'width':800,'height':1280})
        await tablet.goto('http://127.0.0.1:8766/new.html');await tablet.wait_for_timeout(300)
        await tablet.evaluate("()=>{NQ.profiles.create('Ada','🐰');go('drill','L1:name')}");await tablet.wait_for_timeout(200)
        await letter_row(tablet,'tablet L1',5,70)
        await br.close()
    print(f'{n-len(fails)} passed, {len(fails)} failed');sys.exit(1 if fails else 0)
asyncio.run(main())
