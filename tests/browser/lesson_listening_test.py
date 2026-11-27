"""Lessons listen to the piano (WP-0.10 Stage 1, engine 1.9.4; Kevin 2026-11-26).

A fake microphone (an oscillator stream the test controls) plays exact notes into the real lesson screen:
- the first time, a grown-up turns listening on; afterwards it starts by itself on this device;
- a played note answers black-key and keyboard-side questions (the engine gets source 'mic'); a wrong note is wrong;
- very high notes say "too high", never a wrong answer; a note near the middle of the keyboard asks for a clearer side;
- a held, ringing note answers once, not again on the next question;
- the on-screen keys always still work; leaving the lesson stops the microphone;
- "Not now", a blocked microphone and the grown-up "Off" setting all leave the keys working.
"""
import asyncio
import functools
import http.server
import threading

from harbor_lessons_test import OBSERVE_QUESTIONS, QuietHandler, ROOT
from playwright.async_api import async_playwright, expect

FAKE_MIC = """() => {
  window.micCalls = 0; window.micDeny = false; window.micConstraints = null;
  navigator.mediaDevices.getUserMedia = async constraints => {
    window.micCalls++; window.micConstraints = constraints;
    if (window.micDeny) throw new DOMException('Permission denied', 'NotAllowedError');
    const ctx = new AudioContext();
    const osc = ctx.createOscillator(), gain = ctx.createGain(), dest = ctx.createMediaStreamDestination();
    gain.gain.value = 0; osc.connect(gain); gain.connect(dest); osc.start();
    window.play = (midi, ms = 900) => {
      osc.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + ms / 1000);
    };
    return dest.stream;
  };
}"""

RECORD_OPTS = """() => {
  const answer = NQ.learn.answer;
  window.answerOpts = [];
  NQ.learn.answer = (...args) => { window.answerOpts.push(args[2] || null); return answer(...args); };
}"""


async def run(url):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        errors, foreign = [], []

        async def fresh(width=390, height=844):
            ctx = await browser.new_context(viewport={"width": width, "height": height}, has_touch=True,
                                            reduced_motion="reduce")
            page = await ctx.new_page()
            page.on("pageerror", lambda err: errors.append(str(err)))
            # the page's optional font stylesheet is a page asset, not listening; anything else outside, or any upload, fails
            page.on("request", lambda r: foreign.append(r.url) if (r.method != "GET" or (
                not r.url.startswith(url.rsplit("/", 1)[0]) and not r.url.startswith("https://fonts.googleapis.com/")
                and not r.url.startswith("blob:") and not r.url.startswith("data:"))) else None)
            await page.route("https://fonts.googleapis.com/**",
                             lambda route: route.fulfill(status=200, content_type="text/css", body=""))
            await page.goto(url)
            await page.evaluate(FAKE_MIC)
            await page.get_by_role("button", name="Tap to Play", exact=True).click()
            return ctx, page

        async def new_player(page, name):
            await page.locator('[data-go="newProfile"]').click()
            await page.locator("#pname").fill(name)
            await page.locator("#mk").click()
            await page.get_by_role("button", name="Keep Melody").click()

        async def open_practice(page, skill_id, stop_title=None):
            await page.evaluate(OBSERVE_QUESTIONS)
            await page.evaluate(RECORD_OPTS)
            stop = await page.evaluate("id => NQ.learn.skill(id).stop", skill_id)
            await page.evaluate("stop => go('engineLesson', stop)", stop)
            explored = page.get_by_role("button", name="I've explored it")
            if await explored.count():
                await explored.click()
            title = await page.evaluate("id => NQ.learn.skill(id).title.child", skill_id)
            await page.get_by_role("button", name=f"Practice {title}", exact=True).tap()

        def key_for(q, correct=True):
            if q["type"] == "keyGroup":
                if not correct:
                    return 66 if q["group"] == 2 else 61
                return {"left": 61, "right": 63, "middle": 68}.get(q.get("position"), 61 if q["group"] == 2 else 66)
            low = q["ask"] == "low"
            return (48 if low else 76) if correct else (76 if low else 48)

        async def index(page):
            return await page.evaluate("window.lastQuestion ? window.lastQuestion.index : null")

        async def wait_index(page, want, timeout=5000):
            waited = 0
            while waited < timeout:
                if await index(page) == want:
                    return
                await page.wait_for_timeout(100)
                waited += 100
            raise AssertionError(f"question index stayed {await index(page)}, wanted {want}")

        # ---------- first time: a grown-up turns listening on ----------
        ctx, page = await fresh()
        await new_player(page, "Listen Test")
        await open_practice(page, "NQ-00-U01-S01")
        await expect(page.get_by_text("Grown-ups: NoteQuest can listen to your piano in lessons", exact=False)).to_be_visible()
        turn_on = page.get_by_role("button", name="Turn on piano listening")
        not_now = page.get_by_role("button", name="Not now")
        for control in (turn_on, not_now):
            box = await control.bounding_box()
            assert box["height"] >= 48 and box["width"] >= 48, box
        assert await page.evaluate("window.micCalls") == 0, "nothing listens before a grown-up says yes"
        await turn_on.tap()
        await expect(page.get_by_text("Play it on your piano. I'm listening.")).to_be_visible()
        await expect(page.get_by_text("No piano right now? Use the keys.")).to_be_visible()
        constraints = await page.evaluate("window.micConstraints.audio")
        assert constraints == {"echoCancellation": False, "noiseSuppression": False, "autoGainControl": False}, constraints
        assert await page.evaluate("NQ.settings.get('lessonListen')") == "on"
        print("PASS a grown-up turns listening on once; raw audio requested; keys offered", flush=True)

        # ---------- a played note answers; a wrong note is wrong ----------
        q = await page.evaluate("window.lastQuestion")
        await page.evaluate("m => play(m)", key_for(q))
        await wait_index(page, 1, 5000)
        assert (await page.evaluate("answerOpts.at(-1)")) == {"source": "mic"}
        await expect(page.get_by_text("Good work!")).to_be_visible()
        await page.wait_for_timeout(700)
        q = await page.evaluate("window.lastQuestion")
        await page.evaluate("m => play(m)", key_for(q, correct=False))
        await expect(page.get_by_text("Not quite. Give it another try.")).to_be_visible(timeout=5000)
        assert await index(page) == 1
        print("PASS a played note answers the question; a wrong note counts as wrong", flush=True)

        # ---------- very high: "too high", never an answer ----------
        await page.wait_for_timeout(900)
        before = await page.evaluate("answerOpts.length")
        await page.evaluate("play(103, 900)")
        await expect(page.get_by_text("too high for me to hear clearly", exact=False)).to_be_visible(timeout=5000)
        assert await page.evaluate("answerOpts.length") == before and await index(page) == 1
        print("PASS a very high note says it is too high and is never an answer", flush=True)

        # ---------- the on-screen keys still work ----------
        await page.wait_for_timeout(900)
        q = await page.evaluate("window.lastQuestion")
        name = {61: "C sharp", 63: "D sharp", 66: "F sharp", 68: "G sharp"}[key_for(q)]
        await page.get_by_role("button", name=name, exact=False).tap()
        await wait_index(page, 2, 3000)
        assert (await page.evaluate("answerOpts.at(-1)")) is None, "a tapped key is not microphone evidence"
        print("PASS the on-screen keys still answer", flush=True)

        # ---------- a held, ringing note answers once ----------
        q = await page.evaluate("window.lastQuestion")
        start = await page.evaluate("answerOpts.length")
        await page.evaluate("m => play(m, 2500)", key_for(q))
        await page.wait_for_timeout(3000)
        assert await page.evaluate("answerOpts.length") == start + 1, "one held note answers exactly one question"
        assert await index(page) == 3
        print("PASS a held note answers once, not again on the next question", flush=True)

        # ---------- leaving the lesson stops the microphone ----------
        await page.evaluate("go('menu')")
        await page.wait_for_timeout(700)
        assert not await page.evaluate("NQ.mic.isOn()")
        print("PASS leaving the lesson stops the microphone", flush=True)

        # ---------- keyboard sides: low and high; the middle asks for a clearer side ----------
        await page.evaluate("NQ.learn.place('NQ-00-U02')")   # unlock the keyboard-sides skill (prerequisites done)
        await open_practice(page, "NQ-00-U01-S03")
        await expect(page.get_by_text("Play it on your piano. I'm listening.")).to_be_visible()
        q = await page.evaluate("window.lastQuestion")
        await page.evaluate("play(60)")
        await expect(page.get_by_text("That note is near the middle", exact=False)).to_be_visible(timeout=5000)
        assert await index(page) == 0
        await page.wait_for_timeout(900)
        await page.evaluate("m => play(m)", key_for(q))
        await wait_index(page, 1, 5000)
        print("PASS keyboard sides: a low or high note answers; the middle asks for a clearer side", flush=True)

        # ---------- next launch: no question for the grown-up, listening starts by itself ----------
        await page.reload()
        await page.evaluate(FAKE_MIC)
        await page.get_by_role("button", name="Tap to Play", exact=True).click()
        await open_practice(page, "NQ-00-U01-S01")
        await expect(page.get_by_text("Play it on your piano. I'm listening.")).to_be_visible()
        assert not await page.get_by_role("button", name="Turn on piano listening").count()
        assert await page.evaluate("window.micCalls") == 1
        print("PASS on the next launch listening starts by itself", flush=True)

        # ---------- the grown-up "Off" setting ----------
        await page.evaluate("go('menu'); NQ.settings.set('lessonListen', 'off')")
        await page.wait_for_timeout(600)
        await open_practice(page, "NQ-00-U01-S01")
        await expect(page.get_by_role("button", name="C sharp", exact=False)).to_be_visible()
        await page.wait_for_timeout(500)
        assert not await page.get_by_text("I'm listening").count() and not await page.evaluate("NQ.mic.isOn()")
        print("PASS the grown-up Off setting keeps the microphone off", flush=True)
        await ctx.close()

        # ---------- "Not now": keys only, asked again next launch ----------
        ctx, page = await fresh()
        await new_player(page, "Not Now Test")
        await open_practice(page, "NQ-00-U01-S01")
        await page.get_by_role("button", name="Not now").tap()
        await expect(page.get_by_role("button", name="Turn on piano listening")).to_have_count(0)
        q = await page.evaluate("window.lastQuestion")
        name = "C sharp" if q["group"] == 2 else "F sharp"
        await page.get_by_role("button", name=name, exact=False).tap()
        await wait_index(page, 1, 3000)
        assert not await page.get_by_role("button", name="Turn on piano listening").count(), "not asked again this launch"
        assert await page.evaluate("window.micCalls") == 0
        assert await page.evaluate("NQ.settings.get('lessonListen')") in (None, "ask")
        await page.reload()
        await page.evaluate(FAKE_MIC)
        await page.get_by_role("button", name="Tap to Play", exact=True).click()
        await open_practice(page, "NQ-00-U01-S01")
        await expect(page.get_by_role("button", name="Turn on piano listening")).to_be_visible()
        print("PASS Not now leaves the keys and asks again next launch", flush=True)
        await ctx.close()

        # ---------- blocked microphone: a calm line, keys still work ----------
        ctx, page = await fresh(1180, 820)
        await new_player(page, "Blocked Test")
        await page.evaluate("window.micDeny = true")
        await open_practice(page, "NQ-00-U01-S01")
        await page.get_by_role("button", name="Turn on piano listening").tap()
        await expect(page.get_by_text("Piano listening isn't allowed on this device right now", exact=False)).to_be_visible()
        assert await page.evaluate("NQ.settings.get('lessonListen')") != "on"
        q = await page.evaluate("window.lastQuestion")
        name = "C sharp" if q["group"] == 2 else "F sharp"
        await page.get_by_role("button", name=name, exact=False).tap()
        await wait_index(page, 1, 3000)
        print("PASS a blocked microphone shows a calm line and the keys still work", flush=True)
        await ctx.close()

        assert not errors, errors
        assert not foreign, "listening makes no network requests: " + str(foreign[:5])
        print("PASS no page errors and no outside or non-GET requests", flush=True)
        await browser.close()


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(run(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
