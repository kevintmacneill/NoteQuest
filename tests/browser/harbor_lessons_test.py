"""Exercise Harbor's real UI and engine. Run python tests/browser/harbor_lessons_test.py."""
import asyncio
import datetime
import functools
import http.server
import os
from pathlib import Path
import threading

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


# Observe only public question payloads so randomized browser rounds can be answered.
OBSERVE_QUESTIONS = """() => {
  const {start, answer, cancel} = NQ.learn;
  NQ.learn.start = (...args) => {
    const result = start(...args);
    window.lastQuestion = result.question;
    window.roundId = result.roundId;
    return result;
  };
  NQ.learn.answer = (...args) => {
    const result = answer(...args);
    window.lastQuestion = result.next;
    return result;
  };
  NQ.learn.cancel = (...args) => {
    window.cancelled = args[0];
    return cancel(...args);
  };
}"""


async def play(base):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844}, has_touch=True,
                                      reduced_motion="reduce")
        errors = []
        page.set_default_timeout(10000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        passed = 0

        async def check(label, condition):
            nonlocal passed
            assert condition, label
            passed += 1
            print("PASS " + label)

        def button(name):
            return page.get_by_role("button", name=name, exact=True)

        async def enter():
            await button("Tap to Play").click()
            await expect(page.get_by_role("dialog", name="Welcome to NoteQuest")).to_have_count(0)

        async def create_player(name):
            await page.locator('[data-go="newProfile"]').click()
            await page.locator("#pname").fill(name)
            await page.locator("#mk").click()
            await page.locator('[data-st="puppy"]').click()
            await page.locator("#pn").fill("Scout")
            await page.locator('[data-r="ok"]').click()
            await page.locator('.back[data-go="menu"]').click()

        async def continue_lesson(name):
            await button("▶ Continue Adventure").click()
            await expect(page.get_by_role("heading", name=name, exact=True)).to_be_visible()

        async def beat(question):
            pad = button("TAP THE BEAT")
            await button("▶ Start count-in").click()
            period = 60000 / question["bpm"]
            await page.clock.run_for(round(4 * period))
            for length in question["flat"]:
                # Dispatch the same keyboard events as the learner. The UI owns timestamps.
                await pad.dispatch_event("keydown", {"code": "Space"})
                await page.clock.run_for(round(length * period - 45))
                await pad.dispatch_event("keyup", {"code": "Space"})
                await page.clock.run_for(45)
            await button("Finish my rhythm").click()

        async def answer_question(question, correct=True):
            kind = question["type"]
            if kind == "rhythmTap":
                await beat(question)
                return
            if kind == "caregiver":
                if not correct:
                    await button("Not ready yet").click()
                    return
                hold = page.get_by_role("button", name="Grown-up: I observed this (hold for three seconds)")
                await hold.click()
                await expect(hold).to_be_visible()
                await hold.focus()
                await page.keyboard.down("Space")
                await page.clock.run_for(3050)
                await page.keyboard.up("Space")
                return
            if kind == "self":
                await button("I tried this on my piano" if correct else "Not ready yet").click()
                return
            if kind == "symbol":
                black = (question["show"] == "key-black") == correct
                await button("Black key" if black else "White key").click()
                return
            first = button("▶ Listen")
            await first.click()
            if kind == "highLow":
                higher_first = (question["a"] > question["b"]) == correct
                label = "First sound" if higher_first else "Second sound"
            elif kind == "contour":
                label = "↑ Up" if question["a"] < question["b"] else (
                    "↓ Down" if question["a"] > question["b"] else "→ Same")
            else:
                assert kind == "loudSoft", question
                label = "Loud" if question["volume"] > .15 else "Soft"
            await button(label).click()

        async def round_for(title, mode, first_miss=False):
            await button(mode + " " + title).click()
            first = await page.evaluate("window.lastQuestion")
            if first_miss:
                await answer_question(first, correct=False)
                await expect(page.get_by_role("status").filter(has_text="Not quite")).to_be_visible()
                assert (await page.evaluate("window.lastQuestion")).get("index") == 0
            for i in range(first["total"]):
                question = await page.evaluate("window.lastQuestion")
                assert question["index"] == i
                await answer_question(question)
            await expect(page.get_by_role("heading", name={
                "Practice": "Practice finished", "Check": "Skill check passed"
            }[mode], exact=True)).to_be_visible()
            await button("Back to lesson").last.click()

        start_date = datetime.datetime(2026, 11, 22, 12, tzinfo=datetime.timezone.utc)
        await page.clock.install(time=start_date)
        await page.goto(base)
        await enter()
        await create_player("Harbor Learner")
        await page.evaluate(OBSERVE_QUESTIONS)
        await page.locator('.nq-city-learning [data-go="lessonIndex"]').click()
        await check("Academy shows locked stops without a launch action",
                    await button("Open Sit like a pianist").count() == 0)
        await button("Back to Village").click()
        await continue_lesson("Meet the piano")
        await check("Continue opens exact engine lesson and viewing grants no credit",
                    await page.evaluate("NQ.learn.stopStatus('NQ-00-S1').step") == "learn")
        await button("I've explored it").click()
        await round_for("Black keys and white keys", "Practice", first_miss=True)
        await check("Wrong answer retries the same prompt and practice state persists",
                    await page.evaluate("NQ.learn.skillState('k-blackwhite').state") == "developing")
        await button("Practice Black keys and white keys").click()
        await button("Back to Village").click()
        await check("Village exit cancels the incomplete round",
                    await page.evaluate("window.cancelled === window.roundId"))
        await page.reload()
        await enter()
        await page.evaluate(OBSERVE_QUESTIONS)
        await continue_lesson("Meet the piano")
        await check("Refresh restores same learner and saved skill stage",
                    await page.evaluate("NQ.profiles.current().name === 'Harbor Learner' && "
                                        "NQ.learn.skillState('k-blackwhite').state === 'developing'"))

        # An unknown public question must cancel through the engine and never render an answer.
        await page.evaluate("""() => {
          const start = NQ.learn.start;
          NQ.learn.start = (...args) => {
            const result = start(...args);
            return {...result, question: {...result.question, type: 'not-renderable'}};
          };
        }""")
        await button("Practice Black keys and white keys").click()
        await check("Unsupported question cancels before evidence is submitted",
                    await page.get_by_text("This activity is coming soon.", exact=False).is_visible()
                    and await page.evaluate("window.cancelled === window.roundId"))
        await button("Back to lesson").click()
        await page.reload()
        await enter()
        await page.evaluate(OBSERVE_QUESTIONS)

        # Full world across two simulated calendar days per stop. Engine check rules stay intact.
        stops = [
            ("NQ-00-S1", "Meet the piano", ["Black keys and white keys", "High or low?"]),
            ("NQ-00-S2", "Sit like a pianist", ["Sit tall at the piano", "Bubble hands"]),
            ("NQ-00-S3", "Hear and echo", ["Up, down or same?", "Tap the steady beat"]),
            ("NQ-00-S4", "Loud and soft", ["Loud or soft?"]),
        ]
        for i, (stop_id, title, skills) in enumerate(stops):
            await continue_lesson(title)
            if i:
                await button("I've explored it").click()
            for skill in skills:
                if skill != "Black keys and white keys":
                    await round_for(skill, "Practice")
                await round_for(skill, "Check")
            assert not await page.evaluate("id => NQ.learn.stopStatus(id).complete", stop_id)
            start_date += datetime.timedelta(days=1)
            await page.clock.set_system_time(start_date)
            for skill in skills:
                await round_for(skill, "Check")
            await check(title + " masters only after real checks on two dates",
                        await page.evaluate("id => NQ.learn.stopStatus(id).complete", stop_id))
            await button("Back to Village").click()

        await button("▶ Continue Adventure").click()
        await check("World 2 remains gated on Journey Readiness after all Harbor lessons",
                    await page.evaluate("NQ.learn.currentStop() === 'NQ-01-S1' && "
                                        "!NQ.learn.stopStatus('NQ-01-S1').unlocked"))
        await page.locator('.back[data-go="nqwWorld|NQ-00"]').click()
        await page.get_by_role("button", name="All nine worlds", exact=False).click()
        await page.locator('.back[data-go="menu"]').click()
        await page.locator(".nq-village-profile").click()
        await create_player("Second Learner")
        await continue_lesson("Meet the piano")
        await check("Separate learner starts with empty engine progress",
                    await page.evaluate("NQ.learn.skillState('k-blackwhite').state === 'not-introduced'"))

        evidence = os.environ.get("NQ_SCREENSHOTS")
        if evidence:
            await page.screenshot(path=str(Path(evidence) / "harbor-lesson-mobile.png"), full_page=True)
        await check("Lesson fits phone and reports no runtime errors",
                    not errors and await page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        await browser.close()
        print(f"{passed} passed, 0 failed")


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT)
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(play(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
