"""Regression test for the engine split: plays every screen on the new index.html,
and checks that saves made by the old version load in the new one."""
import asyncio, json, sys, http.server, threading, functools, os
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
from playwright.async_api import async_playwright

ROOT = WWW
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT, ))
http.server.SimpleHTTPRequestHandler.log_message = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8765/'
fails, passes = [], 0
def check(name, cond):
    global passes
    if cond: passes += 1
    else: fails.append(name); print('FAIL', name)

HOOK = """()=>{const a=NQ.items.pickWeighted,b=NQ.items.pickRandom,c=NQ.rhythm.beatsQuestion;
NQ.items.pickWeighted=(...x)=>window.__last=a(...x);NQ.items.pickRandom=(...x)=>window.__last=b(...x);NQ.rhythm.beatsQuestion=(...x)=>window.__beat=c(...x)}"""

async def main():
    async with async_playwright() as pw:
        br = await pw.chromium.launch()
        # ---------- 1. old version makes a save ----------
        ctx = await br.new_context(viewport={'width': 1000, 'height': 1300})
        pg = await ctx.new_page()
        await pg.goto(BASE + 'old.html'); await pg.wait_for_timeout(500)
        old = await pg.evaluate("""()=>{const pr=newProfile('Micaela','🦄');S.profiles.push(pr);curId=pr.id;petInit(pr);wildInit(pr);
          pr.starterDone=true;pr.habs=['home','magic'];pr.curHab='home';pr.coins=365;pr.stars={'L1:name':3,'L1:find':3};pr.stickers=['🐶'];
          pr.pets.push(newPet('puppy','Biscuit','home'),newPet('unicorn','Sparkle','magic'));pr.wild.sup={bandage:1};pr.wild.explorer={hat:'cap'};pr.best={L1:12};
          Store.save();return {code:'NQ1:'+btoa(unescape(encodeURIComponent(JSON.stringify(S)))),ls:localStorage.getItem('noteQuest.v1')}}""")
        await ctx.close()

        # ---------- 2. new version opens the old save ----------
        ctx = await br.new_context(viewport={'width': 1000, 'height': 1300})
        await ctx.add_init_script(f"localStorage.setItem('noteQuest.v1', {json.dumps(old['ls'])})")
        pg = await ctx.new_page()
        errors = []
        pg.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
        await pg.goto(BASE + 'new.html'); await pg.wait_for_timeout(600)
        check('old profile shows', 'Micaela' in await pg.inner_text('#app'))
        check('engine is separate', await pg.evaluate("()=>typeof NQ==='object'&&typeof S==='undefined'&&typeof Store==='undefined'"))
        await pg.click('[data-pid]'); await pg.wait_for_timeout(400)
        await pg.evaluate("()=>NQ.pets.setNight&&NQ.pets.setNight('00:00','00:00')")
        txt = await pg.inner_text('#app')
        check('old coins kept', '365' in txt)
        check('old pet kept', 'Biscuit' in txt)
        await pg.evaluate(HOOK)

        # ---------- Name It: 10 right ----------
        await pg.evaluate("()=>go('drill','L1:name')"); await pg.wait_for_timeout(300)
        for i in range(10):
            l = await pg.evaluate("()=>window.__last.note[0]")
            await pg.click(f'.lb[data-l="{l}"]'); await pg.wait_for_timeout(1050)
        res = await pg.inner_text('.ovc')
        check('name it 3 stars', 'Amazing' in res and '10 of 10' in res)
        check('name it coins shown', '+12' in res or '+20' in res or 'coins' in res)
        c1 = await pg.evaluate("()=>NQ.coins.balance()")
        check('name it coins added', c1 == 365 + 10 + 10)
        await pg.click('[data-r="done"]'); await pg.wait_for_timeout(300)

        # ---------- Find It: wrong twice then right ----------
        await pg.evaluate("()=>go('drill','L2:find')"); await pg.wait_for_timeout(300)
        n = await pg.evaluate("()=>window.__last.note")
        m = await pg.evaluate(f"()=>NQ.music.midiOf('{n}')")
        # a different WHITE key: m+2 from E4 is F#4, which has no .wk element
        wrong = next(x for x in (m + 2, m + 1, m - 2, m - 1) if x % 12 in (0, 2, 4, 5, 7, 9, 11))
        await pg.click(f'.wk[data-midi="{wrong}"]', force=True); await pg.wait_for_timeout(200)
        await pg.click(f'.wk[data-midi="{wrong}"]', force=True); await pg.wait_for_timeout(200)
        check('reveal after 2 misses', await pg.evaluate(f"()=>!!document.querySelector('.kb [data-midi=\"{m}\"].hint')"))
        await pg.click(f'.wk[data-midi="{m}"]', force=True); await pg.wait_for_timeout(1050)
        check('miss recorded', await pg.evaluate(f"()=>NQ.progress.stat(NQ.music.noteKey('{n}',window.__last.staff)).w>=1"))

        # ---------- Meteor: start, one wrong, run ----------
        await pg.evaluate("()=>go('meteor','L1:meteor')"); await pg.wait_for_timeout(300)
        await pg.click('#go'); await pg.wait_for_timeout(1500)
        check('meteor spawned', await pg.evaluate("()=>document.querySelectorAll('.met').length>=1"))
        await pg.evaluate("()=>{const p=NQ.profiles.current()}")
        await pg.evaluate("()=>go('meteor','L1:endless')"); await pg.wait_for_timeout(300)
        check('endless shows best', 'Your best: 12' in await pg.inner_text('#app'))

        # ---------- Unicorn: win ----------
        await pg.evaluate("()=>go('unicorn')"); await pg.wait_for_timeout(300)
        await pg.click('[data-m="letters"]'); await pg.click('#go'); await pg.wait_for_timeout(200)
        for i in range(12):
            if await pg.query_selector('.ovc'): break
            l = await pg.evaluate("()=>window.__last.note[0]")
            await pg.click(f'.lb[data-l="{l}"]', force=True); await pg.wait_for_timeout(650)
        await pg.wait_for_timeout(1800)
        check('unicorn saved', 'saved the unicorn' in (await pg.inner_text('body')))
        check('uniMode saved', await pg.evaluate("()=>NQ.profiles.current().uniMode==='letters'"))

        # ---------- How many beats ----------
        await pg.evaluate("()=>go('beats')"); await pg.wait_for_timeout(300)
        for i in range(8):
            b = await pg.evaluate("()=>window.__beat")
            await pg.click(f'[data-b="{b}"]'); await pg.wait_for_timeout(2200)
        check('beats 3 stars', 'Beat buddy' in await pg.inner_text('body') and '8 of 8' in await pg.inner_text('body'))

        # ---------- Tap along: one pattern, no presses ----------
        await pg.evaluate("()=>go('tap')"); await pg.wait_for_timeout(300)
        await pg.click('#startB'); seen = False
        for _ in range(60):
            await pg.wait_for_timeout(300)
            if '❌' in await pg.inner_text('#ct'): seen = True; break
        check('tap judged', seen)

        # ---------- Song: play Hot Cross Buns ----------
        await pg.evaluate("()=>go('song','hcb')"); await pg.wait_for_timeout(300)
        await pg.click('#playB')
        seq = await pg.evaluate("()=>NQ.songs.get('hcb').seq.map(n=>NQ.music.midiOf(n.note))")
        for m in seq:
            await pg.click(f'.kb [data-midi="{m}"]', force=True); await pg.wait_for_timeout(60)
        await pg.wait_for_timeout(400)
        check('song finished', 'You played Hot Cross Buns' in await pg.inner_text('body'))

        # ---------- Shop ----------
        await pg.evaluate("()=>go('shop','food')"); await pg.wait_for_timeout(300)
        c0 = await pg.evaluate("()=>NQ.coins.balance()")
        await pg.click('[data-buy="food|kibble"]'); await pg.wait_for_timeout(200)
        check('buy food', await pg.evaluate("()=>NQ.coins.balance()") == c0 - 6)
        await pg.click('[data-t="tools"]'); await pg.click('[data-buy="tool|toy"]'); await pg.wait_for_timeout(200)
        check('buy toy', await pg.evaluate("()=>NQ.profiles.current().tools.includes('toy')"))
        await pg.click('[data-t="decor"]'); await pg.click('[data-buy="decor|🪨"]'); await pg.wait_for_timeout(200)
        check('buy decor', '1' in await pg.inner_text('.shop-grid'))
        await pg.click('[data-t="pets"]'); await pg.click('[data-buy="pet|kitten"]'); await pg.wait_for_timeout(200)
        await pg.fill('#pn', 'Mittens'); await pg.click('[data-r="ok"]'); await pg.wait_for_timeout(500)
        check('adopt kitten', 'Mittens' in await pg.inner_text('#app'))

        # ---------- Home: pet sheet, mess, decorate ----------
        await pg.evaluate("()=>{const p=NQ.profiles.current();p.sanctuary.pen.messT=Date.now()-6*3600e3;go('home')}"); await pg.wait_for_timeout(400)
        nm = await pg.evaluate("()=>document.querySelectorAll('.mess').length")
        check('mess appears', nm > 0)
        # dispatch on the element itself: a forced click lands on whatever is on top, and a wandering pet can cover the mess
        await pg.eval_on_selector('.mess', 'e=>e.click()'); await pg.wait_for_timeout(400)
        check('mess cleaned', await pg.evaluate("()=>document.querySelectorAll('.mess').length") == nm - 1)
        await pg.eval_on_selector('.pet[data-sp="puppy"]', 'e=>e.click()'); await pg.wait_for_timeout(300)
        await pg.click('[data-a="feed"]'); await pg.wait_for_timeout(150)
        k0 = await pg.evaluate("()=>NQ.profiles.current().inv.kibble")
        await pg.click('[data-f="kibble"]'); await pg.wait_for_timeout(300)
        check('feed', await pg.evaluate("()=>NQ.profiles.current().inv.kibble") == k0 - 1 and 'favorite' in await pg.inner_text('#sMsg'))
        await pg.click('[data-a="clean"]'); await pg.wait_for_timeout(200)
        check('clean needs shampoo', 'shampoo' in await pg.inner_text('#sMsg'))
        await pg.click('[data-a="pet"]'); await pg.wait_for_timeout(200)
        check('pat', 'loves you' in await pg.inner_text('#sMsg'))
        await pg.click('[data-a="rn"]'); await pg.fill('#pn', 'Biscuit Jr'); await pg.click('[data-r="ok"]'); await pg.wait_for_timeout(200)
        check('rename pet', 'Biscuit Jr' in await pg.inner_text('.sheet'))
        await pg.click('[data-a="play"]'); await pg.wait_for_timeout(600)
        check('play starts', await pg.evaluate("()=>!!document.querySelector('.toyball')"))
        await pg.click('#decoB'); await pg.wait_for_timeout(200)
        await pg.click('[data-ti="🪨"]'); await pg.wait_for_timeout(200)
        check('decor placed', await pg.evaluate("()=>NQ.profiles.current().decor.length===1&&!!document.querySelector('.deco')"))
        box = await (await pg.query_selector('.deco')).bounding_box()
        await pg.mouse.move(box['x'] + 10, box['y'] + 10); await pg.mouse.down(); await pg.mouse.up(); await pg.wait_for_timeout(200)
        check('decor removed', await pg.evaluate("()=>NQ.profiles.current().decor.length===0&&NQ.profiles.current().decorInv['🪨']===1"))
        await pg.click('[data-h="magic"]'); await pg.wait_for_timeout(300)
        check('switch habitat', 'Sparkle' in await pg.inner_text('#app'))

        # ---------- Expedition: tracks, chest, rescue ----------
        await pg.evaluate("()=>go('map')"); await pg.wait_for_timeout(300)
        check('map opens', await pg.evaluate("()=>!!document.querySelector('.pin')"))
        await pg.evaluate("()=>go('region','rain')"); await pg.wait_for_timeout(300)
        for round_ in range(3):
            if await pg.query_selector('[data-rescue="sloth"]'): break
            await pg.click('[data-track="sloth"]'); await pg.wait_for_timeout(300)
            for i in range(10):
                l = await pg.evaluate("()=>window.__last.note[0]")
                if not await pg.query_selector(f'.lb[data-l="{l}"]'):
                    await pg.screenshot(path='/home/claude/test/dbg_tracks.png'); print('DBG', l, await pg.inner_text('#app'))
                await pg.click(f'.lb[data-l="{l}"]', force=True); await pg.wait_for_timeout(1000)
            await pg.click('#ch'); await pg.wait_for_timeout(900)
            btn = await pg.query_selector('[data-r="ok"]')
            await btn.click(); await pg.wait_for_timeout(400)
        check('sloth ready', await pg.query_selector('[data-rescue="sloth"]') is not None)
        c0 = await pg.evaluate("()=>NQ.coins.balance()")
        await pg.click('[data-rescue="sloth"]'); await pg.wait_for_timeout(300)
        while await pg.query_selector('#rt [data-i]'):
            await pg.click('#rt [data-i]'); await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(1000)
        check('rescued', 'rescued the sloth' in await pg.inner_text('#rp') and await pg.evaluate("()=>NQ.coins.balance()") == c0 + 5)
        await pg.click('#stay'); await pg.fill('#pn', 'Slowpoke'); await pg.click('[data-r="ok"]'); await pg.wait_for_timeout(500)
        check('sanctuary', 'Slowpoke' in await pg.inner_text('#app'))
        # issue #2: rescue screen opened without supplies cannot heal
        # earlier rounds can award random supplies; make sure none of the jaguar's are held, or the tap would heal
        await pg.evaluate("()=>{const s=NQ.wild.state().sup;NQ.wild.mission('jaguar').need.forEach(id=>{s[id]=0})}")
        await pg.evaluate("()=>go('rescue','jaguar')"); await pg.wait_for_timeout(300)
        jc = await pg.evaluate("()=>NQ.coins.balance()")
        # dispatch on the track itself (a toast still on screen can cover it) and wait for the message
        await pg.eval_on_selector('#rt [data-i]', 'e=>e.click()')
        try: await pg.wait_for_function("()=>(document.querySelector('#toast')||{}).innerText?.includes('Follow the tracks')", timeout=4000)
        except Exception: pass
        check('no heal without supplies', 'Follow the tracks' in await pg.inner_text('#toast') and await pg.evaluate("()=>NQ.coins.balance()") == jc and not await pg.query_selector('#stay'))
        check('invite blocked in engine', await pg.evaluate("()=>NQ.wild.invite('jaguar','x').reason")=='not-rescued')
        await pg.evaluate("()=>go('journal')"); await pg.wait_for_timeout(300)
        check('journal', 'Rescued 1 time' in await pg.inner_text('#app'))

        # ---------- Grown-ups ----------
        await pg.evaluate("()=>go('profiles')"); await pg.wait_for_timeout(300)
        hb = await (await pg.query_selector('#hold')).bounding_box()
        await pg.mouse.move(hb['x'] + 20, hb['y'] + 20); await pg.mouse.down(); await pg.wait_for_timeout(3200); await pg.mouse.up(); await pg.wait_for_timeout(300)
        check('parent view', 'at a glance' in await pg.inner_text('#app'))
        c0 = await pg.evaluate("()=>NQ.profiles.list()[0].coins")
        await pg.click('[data-give="10"]'); await pg.wait_for_timeout(300)
        check('give coins', await pg.evaluate("()=>NQ.profiles.list()[0].coins") == c0 + 10)
        await pg.click('[data-h="never"]'); await pg.wait_for_timeout(200)
        await pg.click('[data-u="1"]'); await pg.wait_for_timeout(200)
        check('settings', await pg.evaluate("()=>{const p=NQ.profiles.list()[0];return p.hints==='never'&&p.unlockAll}"))
        await pg.click('[data-lat="0.1"]'); await pg.click('[data-s="0"]'); await pg.wait_for_timeout(300)
        check('app settings', await pg.evaluate("()=>NQ.settings.get('latAdj')===0.1&&NQ.settings.get('sound')===false"))
        await pg.click('#ren'); await pg.fill('#rn', 'Mica'); await pg.click('[data-r="yes"]'); await pg.wait_for_timeout(300)
        check('rename player', 'Mica' in await pg.inner_text('#app'))
        await pg.click('#cpy'); await pg.wait_for_timeout(300)
        newcode = await pg.input_value('#codeArea textarea')
        check('export code', newcode.startswith('NQ1:'))
        # import the OLD version's code
        await pg.click('#pst'); await pg.fill('#inCode', old['code']); await pg.click('#loadCode'); await pg.wait_for_timeout(200)
        await pg.click('[data-r="yes"]'); await pg.wait_for_timeout(400)
        check('old code imports', await pg.evaluate("()=>NQ.profiles.list()[0].name==='Micaela'&&NQ.profiles.list()[0].coins===365"))
        # new player flow + starter
        await pg.evaluate("()=>go('newProfile')"); await pg.wait_for_timeout(200)
        await pg.fill('#pname', 'Zoe'); await pg.click('#mk'); await pg.wait_for_timeout(400)
        check('starter screen', 'Pick your first pet' in await pg.inner_text('#app'))
        await pg.click('[data-st="isopod"]'); await pg.fill('#pn', 'Rolly'); await pg.click('[data-r="ok"]'); await pg.wait_for_timeout(400)
        check('starter chosen', 'Rolly' in await pg.inner_text('#app') and await pg.evaluate("()=>NQ.coins.balance()===20"))
        check('profiles separate', await pg.evaluate("()=>NQ.profiles.list().length===2&&NQ.profiles.list()[0].pets.length===2"))
        await pg.evaluate("()=>go('parent')"); await pg.wait_for_timeout(300)
        await pg.click('[data-p]:nth-child(2)'); await pg.wait_for_timeout(300)
        await pg.click('#del'); await pg.click('[data-r="yes"]'); await pg.wait_for_timeout(300)
        check('delete player', await pg.evaluate("()=>NQ.profiles.list().length===1"))
        # reload: everything persisted
        await pg.reload(); await pg.wait_for_timeout(500)
        check('persisted after reload', await pg.evaluate("()=>JSON.parse(localStorage.getItem('noteQuest.v1')).profiles[0].name==='Micaela'"))
        await pg.screenshot(path=os.path.join(WWW,'split_final.png'))
        check('no page errors', not errors)
        for e in errors[:10]: print(e)
        await br.close()
    print(f'{passes} passed, {len(fails)} failed')
    srv.shutdown()
    sys.exit(1 if fails else 0)

asyncio.run(main())
