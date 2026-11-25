"""Exhaustive walkthrough of NoteQuest at phone size (390x844).
Usage: python3 crawl.py <served-url> <out-dir> <label>
Phase 1: fresh device -> Tap to Play -> whatever onboarding shows (new player path).
Phase 2: returning player (reload with saved learner).
Phase 3: BFS over every screen reachable by clicking; every visible option on every screen is clicked from a
         fresh copy of that screen (state restored from storage, screen re-entered with go(view,arg)).
Writes report.json and one screenshot per distinct screen."""
import asyncio, json, sys, os, re
from playwright.async_api import async_playwright
URL, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
SKIP = re.compile(r'delete|reset|remove|erase|forget|start over', re.I)
CLICKABLE = "button:visible, [data-go]:visible, a[href]:visible, [role=button]:visible, .tile:visible"
report = {"label": LABEL, "onboarding": [], "returning": [], "screens": {}, "edges": [], "errors": [], "skipped": []}

async def view(pg):
    try: return await asyncio.wait_for(pg.evaluate("(typeof curView!=='undefined'?curView:'?')+'|'+(typeof curViewArg!=='undefined'&&curViewArg!=null?curViewArg:'')"), 10)
    except Exception: return '?|'

async def describe(pg):
    return await asyncio.wait_for(pg.evaluate("""()=>{const h=document.querySelector('h1,h2');const old=!!document.querySelector('#app > .top, .top .back, .tiles .tile');
      return {title:(h?h.innerText:'').trim().slice(0,80), oldStyle:old, text:document.body.innerText.slice(0,400)}}"""), 15)

async def options(pg):
    return await asyncio.wait_for(_options(pg), 15)

async def _options(pg):
    return await pg.evaluate("""(sel)=>{const out=[];const seen=new Set();document.querySelectorAll('button, [data-go], a[href], [role=button], .tile').forEach((e,i)=>{
      const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||r.height<4||cs.visibility==='hidden'||cs.display==='none'||e.disabled)return;
      if(r.bottom<0||r.top>5000)return;const key=(e.dataset.go||'')+'#'+(e.innerText||e.getAttribute('aria-label')||e.title||'').trim().slice(0,40)+'#'+e.tagName;
      if(seen.has(key))return;seen.add(key);e.setAttribute('data-crawl',String(out.length));
      const hold=/hold/i.test(e.className+' '+(e.getAttribute('aria-label')||'')+' '+(e.innerText||''));
      out.push({i:out.length,key,label:(e.innerText||e.getAttribute('aria-label')||e.title||'').trim().replace(/\\s+/g,' ').slice(0,50),go:e.dataset.go||'',hold,h:Math.round(r.height),w:Math.round(r.width)})});return out}""", CLICKABLE)

async def shot(pg, name):
    fn = re.sub(r'[^A-Za-z0-9_.-]', '_', name)[:80] + '.png'
    p = os.path.join(OUT, fn)
    if not os.path.exists(p):
        try: await asyncio.wait_for(pg.screenshot(path=p, timeout=10000, animations='disabled', caret='initial'), 15)
        except BaseException as e: print('screenshot timeout', name, flush=True)
    return fn

async def new_page(b, storage=None):
    ctx = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True)
    await ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body=''))
    await ctx.route('https://fonts.gstatic.com/**', lambda r: r.fulfill(body=''))
    if storage is not None:
        await ctx.add_init_script("(()=>{const s=%s;if(!sessionStorage.getItem('crawlSeeded')){localStorage.clear();for(const [k,v] of Object.entries(s))localStorage.setItem(k,v);sessionStorage.setItem('crawlSeeded','1')}})()" % json.dumps(storage))
    pg = await ctx.new_page()
    pg.set_default_timeout(8000)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
    return ctx, pg, errs

async def tap_to_play(pg):
    btn = pg.get_by_role('button', name='Tap to Play', exact=True)
    try:
        await btn.wait_for(state='visible', timeout=20000); await btn.click(); await pg.wait_for_timeout(1500); return True
    except Exception:
        return False

async def click_opt(pg, o):
    return await asyncio.wait_for(_click_opt(pg, o), 20)

async def _click_opt(pg, o):
    el = pg.locator(f'[data-crawl="{o["i"]}"]')
    if o['hold']:
        box = await el.bounding_box()
        if box:
            await pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2); await pg.mouse.down(); await pg.wait_for_timeout(3600); await pg.mouse.up()
    else:
        await el.click(timeout=3000)
    await pg.wait_for_timeout(700)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- phase 1: new player, fresh device ----
        ctx, pg, errs = await new_page(b)
        await pg.goto(URL); await pg.evaluate("localStorage.clear()"); await pg.reload()
        report['onboarding'].append({'step': 'title', 'shot': await shot(pg, '00_title')})
        ok = await tap_to_play(pg)
        steps = 0
        while ok and steps < 12:
            print('onb loop', steps, flush=True)
            v = await view(pg); d = await describe(pg); opts = await options(pg)
            report['onboarding'].append({'step': steps, 'view': v, 'title': d['title'], 'oldStyle': d['oldStyle'], 'options': [o['label'] for o in opts][:12], 'shot': await shot(pg, f'01_onb_{steps}_{v}')})
            if v.startswith('menu'): break
            if sum(1 for x in report['onboarding'] if x.get('view')==v)>1:
                report['onboarding'][-1]['note']='stuck: jumped to village'; await pg.evaluate("go('menu')"); await pg.wait_for_timeout(800); continue
            # follow the "new player" path: fill text inputs, then the most forward-looking button
            for inp in await pg.locator('input:visible:not([type=checkbox]):not([type=radio]):not([type=range])').all():
                try: await inp.fill('Zoe')
                except Exception: pass
            pick = None
            for want in ['Let’s go', "Let's go", 'Done', 'Continue', 'Start', 'Next', 'Create', 'New player', 'Enter', 'OK', 'Kitten', 'Adopt']:
                pick = next((o for o in opts if want.lower() in o['label'].lower() and not SKIP.search(o['label']) and not re.search(r'back|switch|who|change player|⬅', o['label'], re.I)), None)
                if pick: break
            if not pick:
                pick = next((o for o in opts if o['go'] and o['go'] not in ('profiles',) and o['label'] not in ('⬅','Skip')), None) or next((o for o in opts if o['label'] not in ('⬅',)), None)
            if not pick: break
            report['onboarding'][-1]['clicked'] = pick['label']
            try: await click_opt(pg, pick)
            except BaseException as e: report['errors'].append(f'onboarding click {pick["label"]}: {e}'[:200]); break
            steps += 1
            print('onboarding step', steps, v, flush=True)
        report['errors'] += [f'onboarding: {e}' for e in errs]
        storage = await pg.evaluate("Object.fromEntries(Object.entries(localStorage))")
        await ctx.close()
        # ---- phase 2: returning player ----
        ctx, pg, errs = await new_page(b, storage)
        await pg.goto(URL)
        report['returning'].append({'step': 'title', 'shot': await shot(pg, '02_ret_title')})
        if await tap_to_play(pg):
            for s in range(4):
                v = await view(pg); d = await describe(pg); opts = await options(pg)
                report['returning'].append({'step': s, 'view': v, 'title': d['title'], 'oldStyle': d['oldStyle'], 'options': [o['label'] for o in opts][:12], 'shot': await shot(pg, f'02_ret_{s}_{v}')})
                if v.startswith('menu'): break
                pick = next((o for o in opts if 'Zoe' in o['label']), None)
                if not pick: break
                report['returning'][-1]['clicked'] = pick['label']; await click_opt(pg, pick)
        report['errors'] += [f'returning: {e}' for e in errs]
        await ctx.close()
        # ---- phase 3: every option on every screen ----
        ctx, pg, errs = await new_page(b, storage)
        await pg.goto(URL); await tap_to_play(pg)
        start = await view(pg)
        queue, seen, clicks = [start], set(), 0
        while queue and clicks < 320:
            vv = queue.pop(0)
            if vv in seen: continue
            seen.add(vv); name, arg = vv.split('|', 1)
            async def enter():
                await pg.evaluate("s=>{localStorage.clear();for(const [k,v] of Object.entries(s))localStorage.setItem(k,v)}", storage)
                await pg.goto(URL); await tap_to_play(pg)
                await pg.evaluate("([v,a])=>{try{go(v,a||undefined)}catch(e){window.__crawlErr=String(e)}}", [name, arg]); await pg.wait_for_timeout(900)
            errs.clear(); await enter()
            d = await describe(pg); opts = await options(pg)
            report['screens'][vv] = {'title': d['title'], 'oldStyle': d['oldStyle'], 'shot': await shot(pg, f'10_{vv}'), 'options': [{'label': o['label'], 'go': o['go'], 'hold': o['hold'], 'h': o['h'], 'w': o['w']} for o in opts], 'errorsOnEnter': list(errs)}
            for o in opts[:22]:
                if SKIP.search(o['label']):
                    report['skipped'].append(f'{vv}: {o["label"]}'); continue
                if o['i'] > 0 or clicks > 0:
                    errs.clear(); await enter(); opts2 = await options(pg)
                    o2 = next((x for x in opts2 if x['key'] == o['key']), None)
                    if not o2: report['edges'].append({'from': vv, 'option': o['label'], 'to': 'NOT FOUND AFTER RELOAD'}); continue
                    o = dict(o2, label=o['label'])
                try:
                    await click_opt(pg, o); clicks += 1
                except BaseException as e:
                    report['edges'].append({'from': vv, 'option': o['label'], 'to': 'CLICK FAILED', 'why': str(e)[:120]}); continue
                if not pg.url.startswith(URL.split('index.html')[0]) or 'index.html' not in pg.url:
                    report['edges'].append({'from': vv, 'option': o['label'], 'to': 'PAGE '+pg.url.split('/')[-1]}); continue
                to = await view(pg)
                edge = {'from': vv, 'option': o['label'], 'to': to, 'errors': list(errs)}
                if to != vv:
                    d2 = await describe(pg); edge['toTitle'] = d2['title']; edge['toOld'] = d2['oldStyle']
                    if to not in seen and to not in queue: queue.append(to)
                report['edges'].append(edge)
                print('click', clicks, vv, '->', to, flush=True)
                json.dump(report, open(os.path.join(OUT, 'report.json'), 'w'), indent=1)
        await ctx.close(); await b.close()
    json.dump(report, open(os.path.join(OUT, 'report.json'), 'w'), indent=1)
    pass
    print(LABEL, 'screens', len(report['screens']), 'clicks', clicks, 'errors', len(report['errors']) + sum(len(e.get('errors', [])) for e in report['edges']))

asyncio.run(main())
