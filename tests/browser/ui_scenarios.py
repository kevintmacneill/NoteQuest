"""WP-1.1 initial real-click scenario harness. No direct go() or engine mutations.
This is the first scenario tranche, NOT exhaustive traversal. Baseline capture is
unapproved until exact-run artifacts have been reviewed.
"""
import asyncio, functools, http.server, json, os, re, subprocess, threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(os.environ.get("NQ_CRAWL_OUT",str(ROOT/"_www_ui_scenarios")))
BASELINE=ROOT/"tests/browser/baseline/legacy-routes.json"
VIEWS=[("phone-portrait",390,844,True),("phone-landscape",844,390,True),
       ("tablet-portrait",820,1180,True),("tablet-landscape",1180,820,True),
       ("desktop",1280,800,False)]
# Explicitly obsolete destinations; new view with old styling is a separate observation.
LEGACY={"starter","home","shop","map","games","stickers","parent","bathTime","cleanPen","companions"}
DESTRUCTIVE=re.compile(r"delete|reset|erase|remove|forget|start over",re.I)

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

async def state(page):
    return await page.evaluate("""() => {
      const p=window.NQ?.profiles?.current();
      const current=typeof curView==='undefined'?'unknown':curView;
      const arg=typeof curViewArg==='undefined'?null:curViewArg??null;
      return {view:current,arg,learner:p?.name||null,
        onboarding:p?(p.starterDone?'complete':'pending'):'none',
        modal:!!document.querySelector('.ov'), placement:p?NQ.placement?.status()?.pending??null:null,
        oldStyle:!!document.querySelector('#app > .top,.top .back,.tiles .tile'),
        title:(document.querySelector('#app h1,#app h2')?.innerText||'').slice(0,120),
        path:location.pathname};
    }""")

async def inventory(page):
    return await page.evaluate("""() => [...document.querySelectorAll('#app button,#app a[href],#app [role=button],#app input,#app select,.ov button,.ov input')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'}).map((e,i)=>({index:i,label:(e.getAttribute('aria-label')||e.innerText||e.labels?.[0]?.innerText||e.id||'').trim(),route:e.dataset.go||null,href:e.getAttribute('href'),disabled:!!e.disabled||e.getAttribute('aria-disabled')==='true'}))""")

async def snapshot(page, result, label):
    s=await state(page)
    s["step"]=label
    # Old onboarding templates are detected by visible content, not route name alone.
    s["legacy"]=s["view"] in LEGACY or (s["view"] in {"profiles","newProfile"} and s["oldStyle"])
    if s["view"]=="profiles" and await page.locator(".big-title").count():
        s["legacy"]=True
    s["controls"]=await inventory(page)
    result["states"].append(s)
    await page.screenshot(path=str(OUT/(result["viewport"]+"-"+label+".png")),animations="disabled")
    return s

async def tap_play(page):
    await page.get_by_role("button",name="Tap to Play",exact=True).click(timeout=30000)
    # Ensure the intro is finished rather than selecting a control under its overlay.
    await page.get_by_role("dialog",name="Welcome to NoteQuest").wait_for(state="detached",timeout=15000)
    await page.wait_for_function("typeof curView !== 'undefined' && !!curView")

async def click_route(page, route):
    target=page.locator('[data-go="'+route+'"]:visible').first
    await target.click(timeout=7000)

async def create_player(page,result):
    await click_route(page,"newProfile")
    await snapshot(page,result,"new-player")
    await page.locator("#pname").fill("Learner A")
    await page.locator("#mk").click()
    s=await snapshot(page,result,"after-name")
    if s["view"]=="starter":
        # Deliberately follow the actual legacy entry point to establish the known failure.
        await page.locator('[data-st="kitten"]').click()
        await page.locator("#pn").fill("Fixture kitten")
        await page.locator(".ov [data-r=ok]").click()
        s=await snapshot(page,result,"after-legacy-starter")
    elif s["view"]=="nameCompanion":
        await page.locator("#companion-name").fill("Fixture kitten")
        await page.get_by_role("button",name="Go to the village").click()
        s=await snapshot(page,result,"after-kitten")
    if s["view"]=="home":
        await click_route(page,"menu")
        s=await snapshot(page,result,"leave-legacy-home")
    assert s["view"]=="menu", f"new player did not reach village: {s}"
    assert await page.evaluate("NQ.profiles.list().length===1 && NQ.profiles.current()?.name==='Learner A'")
    assert await page.evaluate("(NQ.profiles.current()?.pets||[]).length===1")
    return s

async def run_view(browser,origin,viewport):
    name,w,h,touch=viewport
    result={"viewport":name,"states":[],"errors":[],"controls":[],"unexplored":[]}
    ctx=await browser.new_context(viewport={"width":w,"height":h},has_touch=touch,service_workers="block")
    async def local_only(route):
        if route.request.url.startswith(origin): await route.continue_()
        else: await route.abort()
    await ctx.route("**/*",local_only)
    page=await ctx.new_page()
    page.on("pageerror",lambda e:result["errors"].append(str(e)))
    page.on("dialog",lambda dialog:asyncio.ensure_future(dialog.dismiss()))
    try:
        await page.goto(origin+"index.html")
        await tap_play(page)
        await snapshot(page,result,"picker")
        await create_player(page,result)
        await snapshot(page,result,"village-new")
        # Returning learner: same isolated storage, actual reload and title click.
        await page.reload()
        await tap_play(page)
        s=await snapshot(page,result,"returning")
        if s["view"]=="profiles":
            await page.get_by_role("button",name=re.compile("Learner A")).click()
            s=await snapshot(page,result,"returning-selected")
        assert s["view"]=="menu",s
        assert s["learner"]=="Learner A",s
        assert await page.evaluate("(NQ.profiles.current()?.pets||[]).length===1")
        # Record visible navigation inventory; only verified controls count as exercised.
        controls=await inventory(page)
        for entry in controls:
            entry["disposition"]="intentionally unavailable" if entry["disabled"] else "unexplored"
            if DESTRUCTIVE.search(entry["label"]): entry["disposition"]="unexplored destructive control"
            result["controls"].append(entry)
        # First-world Continue Adventure: real click, exact public engine stop.
        expected=await page.evaluate("NQ.learn.currentStop()")
        await page.locator(".nq-village-continue:visible").first.click()
        s=await snapshot(page,result,"continue-adventure")
        assert s["view"]=="engineLesson" and s["arg"]==expected, (s,expected)
        for entry in result["controls"]:
            if entry["route"]=="continueAdventure" and "Continue Adventure" in entry["label"]:
                entry["disposition"]="exercised"
        await page.get_by_role("button",name="Back to Village").click()
        assert (await snapshot(page,result,"lesson-back"))["view"]=="menu"
        # Reference is an external page in the same local game, not a go() call.
        link=page.locator('a[href="./reference.html"]:visible').first
        if await link.count():
            await link.click()
            await page.wait_for_url("**/reference.html")
            await page.screenshot(path=str(OUT/(name+"-reference.png")),animations="disabled")
            await page.go_back(wait_until="domcontentloaded")
            if await page.get_by_role("button",name="Tap to Play").count():
                await tap_play(page)
            s=await snapshot(page,result,"reference-return")
            if s["view"]=="menu" and s["learner"]=="Learner A":
                # Browser Back only; reference page's own Back remains an untested path.
                result["reference_browser_back"]="verified"
            else:
                raise AssertionError(f"reference browser Back did not restore learner: {s}")
        # Create a second learner, interrupt naming by reload, then resume via the picker.
        # Neither progress nor companion data may cross profiles.
        await page.locator("#nq-village-player").click()
        assert (await snapshot(page,result,"switch-picker"))["view"]=="profiles"
        await click_route(page,"newProfile")
        await page.locator("#pname").fill("Learner B")
        await page.locator("#mk").click()
        assert (await snapshot(page,result,"interrupted-kitten"))["view"]=="nameCompanion"
        await page.reload()
        await tap_play(page)
        s=await snapshot(page,result,"shared-device-picker")
        assert s["view"]=="profiles" and s["learner"] is None,s
        await page.get_by_role("button",name="Learner B",exact=True).click()
        assert (await snapshot(page,result,"resume-kitten"))["view"]=="nameCompanion"
        await page.get_by_role("button",name="Keep Melody").click()
        s=await snapshot(page,result,"second-village")
        assert s["view"]=="menu" and s["learner"]=="Learner B",s
        assert await page.evaluate("NQ.profiles.current().pets.length===1 && NQ.profiles.current().pets[0].name==='Melody'")
        await page.locator("#nq-village-player").click()
        await page.get_by_role("button",name="Learner A",exact=True).click()
        s=await snapshot(page,result,"first-learner-restored")
        assert s["view"]=="menu" and s["learner"]=="Learner A",s
        assert await page.evaluate("NQ.profiles.current().pets.length===1 && NQ.profiles.current().pets[0].name==='Fixture kitten'")
        # Grown-up hold: short tap must not grant access. No destructive actions exercised.
        await click_route(page,"parentGate")
        await snapshot(page,result,"grown-up-gate")
        await page.locator("#hold").click()
        assert (await snapshot(page,result,"grown-up-short-tap"))["view"]=="parentGate"
        await page.locator('.back[data-go="menu"]').click()
        assert (await snapshot(page,result,"grown-up-cancel"))["view"]=="menu"
        for entry in result["controls"]:
            if entry["route"]=="profiles" or entry["route"]=="parentGate":
                entry["disposition"]="exercised"
        
        # Traverse village branches using actual buttons and each destination's Back.
        branches=[
            ("lessonIndex","harborLessons","academy"),
            ("progress","progress","progress"),
            ("games","games","practice-hall"),
            ("stickers|menu","stickers","sticker-house"),
        ]
        for route,view,label in branches:
            targets=page.locator(f'#app [data-go="{route}"]:visible')
            for i in range(await targets.count()):
                await targets.nth(i).click()
                assert (await snapshot(page,result,f"{label}-{i}"))["view"]==view
                await page.locator('#app .back[data-go="menu"]:visible').click()
                assert (await state(page))["view"]=="menu"
            for entry in result["controls"]:
                if entry["route"]==route:
                    entry["disposition"]="exercised"

        await click_route(page,"nqwHub")
        assert (await snapshot(page,result,"journey-map"))["view"]=="nqwHub"
        await page.get_by_role("button",name=re.compile(r"Explore .*Amazon")).click()
        s=await snapshot(page,result,"amazon-map")
        assert s["view"]=="nqwWorld" and s["arg"]=="NQ-01",s
        assert not await page.get_by_role("button",name="Play Melody Harbor lessons").count()
        await page.get_by_role("button",name="View skills",exact=True).first.click()
        assert (await snapshot(page,result,"amazon-stop-preview"))["view"]=="nqwStop"
        assert not await page.get_by_role("button",name=re.compile(r"^(Play|Start|Open|Continue) lesson",re.I)).count()
        await page.get_by_role("button",name=re.compile(r"Practice existing games")).click()
        assert (await snapshot(page,result,"amazon-preview-legacy-games"))["view"]=="games"
        await page.locator('#app .back[data-go="menu"]:visible').click()
        assert (await state(page))["view"]=="menu"
        for entry in result["controls"]:
            if entry["route"]=="nqwHub":
                entry["disposition"]="exercised"

        # Confirm the full keyboard hold and its destination without taking destructive actions.
        await click_route(page,"parentGate")
        await page.locator("#hold").focus()
        await page.keyboard.down("Space")
        try:
            await page.wait_for_function("curView==='parent'",timeout=6000)
        finally:
            await page.keyboard.up("Space")
        await snapshot(page,result,"grown-up-open")
        await page.locator('#app .back[data-go="menu"]:visible').click()
        assert (await state(page))["view"]=="menu"

        result["unexplored"]=[x for x in result["controls"] if x["disposition"].startswith("unexplored")]
        assert not result["errors"],result["errors"]
    except Exception as e:
        result["errors"].append(str(e))
        print(name, "SCENARIO ERROR", repr(e), flush=True)
    finally:
        await ctx.close()
    return result

def unexpected_legacy(observations, baseline):
    fields=("scenario","viewport","route")
    allowed={tuple(row[field] for field in fields) for row in baseline}
    return [row for row in observations if tuple(row[field] for field in fields) not in allowed]

def verify_baseline_policy():
    existing={"scenario":"known","viewport":"phone-portrait","route":"games"}
    unexpected={"scenario":"injected","viewport":"phone-portrait","route":"home"}
    assert unexpected_legacy([existing],[existing])==[]
    assert unexpected_legacy([existing,unexpected],[existing])==[unexpected]

async def main():
    verify_baseline_policy()
    OUT.mkdir(parents=True,exist_ok=True)
    sha=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    origin=f"http://127.0.0.1:{server.server_address[1]}/"
    report={"schema":1,"commit":sha,"scope":"initial scenarios only; incomplete control coverage","samples":[]}
    try:
        async with async_playwright() as p:
            browser=await p.chromium.launch()
            try:
                for viewport in VIEWS:
                    result=await run_view(browser,origin,viewport)
                    report["samples"].append(result)
                    print(viewport[0],len(result["states"]),"states",len(result["errors"]),"errors",flush=True)
                    (OUT/"report.json").write_text(json.dumps(report,indent=2),encoding="utf8")
            finally: await browser.close()
    finally: server.shutdown()
    observations=[{"scenario":s["step"],"viewport":r["viewport"],"route":s["view"]} for r in report["samples"] for s in r["states"] if s["legacy"]]
    (OUT/"legacy-routes-candidate.json").write_text(json.dumps({"schema":1,"commit":sha,"observations":observations},indent=2),encoding="utf8")
    if BASELINE.exists():
        pinned=json.loads(BASELINE.read_text(encoding="utf8"))
        assert pinned["schema"]==1 and pinned["observations"], "invalid candidate baseline"
        print("Legacy route observations:",len(observations),"pinned:",len(pinned["observations"]),flush=True)
        new=unexpected_legacy(observations,pinned["observations"])
        if new:
            print("NEW LEGACY ROUTES",json.dumps(new)); raise SystemExit(1)
    else:
        print("BASELINE UNAPPROVED: candidate only; no legacy-free claim")
    if any(r["errors"] for r in report["samples"]): raise SystemExit(1)
    # Complete coverage is required for the future M3 gate, not claimed in this draft.
    print("Initial scenario tranche executed; unvisited controls remain explicitly reported")

if __name__=="__main__": asyncio.run(main())
