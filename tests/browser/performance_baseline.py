"""WP-1.2: cold-start measurement only; no timing threshold until calibrated.
Run from repository root: python tests/browser/performance_baseline.py
Requires Playwright Chromium. No real learner data, network services or application edits.
"""
import asyncio
import functools
import http.server
import json
import os
from pathlib import Path
import subprocess
import threading
import time
from urllib.parse import urlsplit
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get("NQ_PERF_OUT", str(ROOT / "_www_performance_baseline")))
VIEWS = [("phone-portrait",390,844,True),("phone-landscape",844,390,True),
         ("tablet-portrait",820,1180,True),("tablet-landscape",1180,820,True),
         ("desktop",1280,800,False)]
# Documented fixed conditions, not an approximation of any named physical device.
NETWORK = {"offline":False,"latency":40,"downloadThroughput":2_000_000,
           "uploadThroughput":750_000,"connectionType":"wifi"}

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

def category(url, kind):
    ext = Path(urlsplit(url).path).suffix.lower()
    if kind == "Document" or ext == ".html": return "html"
    if kind == "Script" or ext in (".js",".mjs"): return "js"
    if kind == "Stylesheet" or ext == ".css": return "css"
    if kind == "Image" or ext in (".png",".jpg",".jpeg",".webp",".avif",".svg",".gif",".ico"): return "images"
    if ext in (".wav",".mp3",".ogg",".m4a",".aac",".flac") or kind == "Media": return "audio"
    return "other"

async def measure(browser, origin, viewport):
    name,w,h,touch=viewport
    ctx=await browser.new_context(viewport={"width":w,"height":h},has_touch=touch,
                                  device_scale_factor=1,service_workers="block")
    page=await ctx.new_page()
    session=await ctx.new_cdp_session(page)
    records,errors,external=[],[],[]
    active={}
    def response(event):
        r=event["response"]
        if r["url"].startswith(origin):
            active[event["requestId"]]={"url":r["url"],"type":event["type"],"status":r["status"]}
    def finished(event):
        r=active.pop(event["requestId"],None)
        if r is not None:
            r["encoded_bytes"]=int(event.get("encodedDataLength",0))
            records.append(r)
    async def local_only(route):
        if route.request.url.startswith(origin):
            await route.continue_()
        else:
            external.append(route.request.url)
            await route.abort()
    await ctx.route("**/*",local_only)
    page.on("pageerror",lambda e:errors.append(str(e)))
    session.on("Network.responseReceived",response)
    session.on("Network.loadingFinished",finished)
    try:
        await session.send("Network.enable")
        await session.send("Network.setCacheDisabled",{"cacheDisabled":True})
        await session.send("Network.emulateNetworkConditions",NETWORK)
        started=time.perf_counter()
        await page.goto(origin+"index.html",wait_until="domcontentloaded",timeout=45000)
        await page.get_by_role("button",name="Tap to Play",exact=True).wait_for(state="visible",timeout=45000)
        ready=round((time.perf_counter()-started)*1000)
        # Measure a defined one-second post-ready window, not indefinite background activity.
        await page.wait_for_timeout(1000)
        counts={key:0 for key in ("html","js","css","images","audio","other")}
        for r in records:
            counts[category(r["url"],r["type"])]+=r["encoded_bytes"]
        report={"viewport":name,"width":w,"height":h,"touch":touch,
                "time_to_tap_to_play_ms":ready,"encoded_transfer_bytes":counts,
                "total_encoded_bytes":sum(counts.values()),"responses":records,
                "unfinished_requests":list(active.values()),"blocked_external_urls":sorted(set(external)),
                "page_errors":errors,"http_errors":[r for r in records if r["status"]>=400]}
        await page.screenshot(path=str(OUT/(name+".png")),animations="disabled")
        return report
    finally:
        await ctx.close()

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    origin=f"http://127.0.0.1:{server.server_address[1]}/"
    sha=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    report={"schema":1,"commit":sha,"cache":"disabled; fresh context for each viewport",
            "network":NETWORK,"measurement_window":"navigation start to visible Tap to Play; bytes through 1s post-ready",
            "metric":"CDP Network.loadingFinished encodedDataLength, same-origin completed responses",
            "external_network":"blocked","samples":[],"measurement_errors":[]}
    try:
        async with async_playwright() as p:
            browser=await p.chromium.launch()
            try:
                for viewport in VIEWS:
                    try:
                        sample=await measure(browser,origin,viewport)
                        report["samples"].append(sample)
                        print(viewport[0],sample["time_to_tap_to_play_ms"],"ms",sample["total_encoded_bytes"],"bytes",flush=True)
                    except Exception as e:
                        report["measurement_errors"].append({"viewport":viewport[0],"error":str(e)})
                        print("MEASUREMENT ERROR",viewport[0],str(e),flush=True)
                    finally:
                        (OUT/"report.json").write_text(json.dumps(report,indent=2),encoding="utf8")
            finally:
                await browser.close()
    finally:
        server.shutdown()
    # No performance threshold. Instrumentation errors must not be presented as valid samples.
    if report["measurement_errors"] or len(report["samples"])!=len(VIEWS):
        raise SystemExit(1)

if __name__=="__main__":
    asyncio.run(main())
