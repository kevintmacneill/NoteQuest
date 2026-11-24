"""Exercise the shared v3.2 controls with public questions from the real engine."""
import asyncio
import functools
import http.server
import os
import threading
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


async def run(url):
    async with async_playwright() as browser_api:
        browser = await browser_api.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844}, has_touch=True)
        await page.goto(url)
        await page.evaluate("""() => {
          const {start, stop} = OscillatorNode.prototype;
          const starts = new WeakMap();
          window.sampleDurations = [];
          OscillatorNode.prototype.start = function (when) {
            starts.set(this, when);
            return start.call(this, when);
          };
          OscillatorNode.prototype.stop = function (when) {
            window.sampleDurations.push({at: starts.get(this), duration: when - starts.get(this)});
            return stop.call(this, when);
          };
          window.showActivity = content => {
            window.stopActivity?.();
            const question = content.type === 'teacher' ? content :
              NQ.learn.sample(content, {count: 1, seed: 5}).questions[0];
            window.activityAnswers = [];
            const board = document.createElement('section');
            board.className = 'nqh-question';
            document.body.replaceChildren(board);
            window.stopActivity = NoteQuestActivity.showQuestion(
              board, question, value => activityAnswers.push(value), () => {
                throw Error('unexpected unsupported activity: ' + content.type);
              });
            return question;
          };
        }""")
        curriculum = await page.evaluate("""async () => {
          const r = await fetch('coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json');
          return (await r.json()).skills.filter(skill => skill.id.startsWith('NQ-00-'));
        }""")
        by_id = {skill["id"]: skill for skill in curriculum}
        assert len(curriculum) == 18
        unavailable = await page.evaluate(
            "skills => skills.filter(skill => !NoteQuestActivity.supports(skill)).map(skill => skill.id)",
            curriculum,
        )
        assert unavailable == ["NQ-00-U03-S03", "NQ-00-U05-S03"], unavailable

        keyboard = page.get_by_role("group", name="One octave with five black keys")
        for group, name, expected_midi in [(2, "C sharp", 61), (3, "F sharp", 66)]:
            content = {**by_id["NQ-00-U01-S01"]["content"], "group": group}
            await page.evaluate("showActivity", content)
            await expect(keyboard.get_by_role("button")).to_have_count(5)
            await keyboard.get_by_role("button", name=name, exact=False).tap()
            assert await page.evaluate("activityAnswers") == [expected_midi]
        print("PASS two- and three-key prompts send matching MIDI at phone width")

        for side in ("left", "right"):
            content = {**by_id["NQ-00-U01-S03"]["content"], "targets": [side]}
            await page.evaluate("showActivity", content)
            await page.get_by_role("button", name=f"{side.capitalize()} side", exact=False).tap()
            assert await page.evaluate("activityAnswers") == [side]
        print("PASS low and high keyboard-side prompts submit the engine's side choices")

        question = await page.evaluate("showActivity", by_id["NQ-00-U04-S02"]["content"])
        first = page.get_by_role("button", name="First sound", exact=True)
        await expect(first).to_be_disabled()
        await page.get_by_role("button", name="Listen", exact=False).tap()
        await expect(first).to_be_enabled()
        durations = await page.evaluate("sampleDurations")
        assert len(durations) == 2, durations
        for audio, note in zip(durations, [question["a"], question["b"]]):
            assert abs(audio["duration"] - note["seconds"] - .01) < .01
        assert durations[1]["at"] - durations[0]["at"] > question["a"]["seconds"]
        await first.tap()
        assert await page.evaluate("activityAnswers") == ["a"]
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        print("PASS duration question schedules engine-supplied lengths and gates answers on listening")
        print("PASS all 18 Harbor activity definitions audited, with echo and conceptChoice unavailable")

        await page.clock.install()
        await page.evaluate("showActivity", {
            "type": "teacher", "prompt": "Let your wrists relax.", "checklist": ["Wrists loose"],
        })
        control = page.get_by_role("button", name="Grown-up: I observed this (hold for three seconds)")
        await expect(page.get_by_text("Wrists loose")).to_be_visible()
        await control.focus()
        await page.keyboard.down("Space")
        await page.clock.run_for(500)
        await page.keyboard.up("Space")
        await page.clock.run_for(3000)
        assert await page.evaluate("activityAnswers") == []
        await page.keyboard.down("Space")
        await page.clock.run_for(3050)
        await page.keyboard.up("Space")
        assert await page.evaluate("activityAnswers") == [True]
        print("PASS grown-up check requires a full hold and accepts keyboard input")

        if await page.evaluate("NQ.learn.curriculum().id === '3.2'"):
            question = await page.evaluate("showActivity", {"type": "letterFind", "letters": ["F"]})
            assert question["letter"] == "F"
            piano = page.get_by_role("group", name="Piano keyboard")
            await expect(piano.get_by_role("button")).to_have_count(7)
            await expect(page.get_by_label("Keyboard octave")).to_have_count(0)
            await piano.locator(".nqh-mini-black-key").first.tap()
            assert await page.evaluate("activityAnswers") == []
            f_key = piano.get_by_role("button", name="White key 4 from the left")
            await f_key.focus()
            await page.keyboard.press("Enter")
            assert await page.evaluate("activityAnswers") == [65]
            print("PASS letter identification sends a white-key MIDI answer by keyboard")

            question = await page.evaluate("""() => {
              NQ.profiles.create('Keyboard learner', '🎹');
              NQ.learn.place('NQ-01-U03');
              const round = NQ.learn.start('NQ-01-U03-S01', 'practice');
              if (!round.ok) throw Error(round.reason);
              const board = document.createElement('section');
              board.className = 'nqh-question';
              document.body.replaceChildren(board);
              window.keyboardResults = [];
              NoteQuestActivity.showQuestion(board, round.question, value => {
                const reply = NQ.learn.answer(round.roundId, value);
                keyboardResults.push({ok: reply.ok, correct: reply.correct});
              }, () => { throw Error('unexpected unavailable landmark keyboard'); });
              return round.question;
            }""")
            assert question["note"][0] == "C" and question["staff"] == "none", question
            if directory := os.environ.get("NQ_SCREENSHOTS"):
                output = Path(directory)
                output.mkdir(parents=True, exist_ok=True)
                await page.screenshot(path=output / "amazon-keyboard-landmark-mobile.png", full_page=True)
            octave = page.get_by_label("Keyboard octave")
            c_key = piano.get_by_role("button", name="White key 1 from the left")
            await octave.select_option("3" if question["note"][1] != "3" else "4")
            await c_key.tap()
            await octave.select_option(question["note"][1])
            await c_key.tap()
            assert await page.evaluate("keyboardResults") == [
                {"ok": True, "correct": False}, {"ok": True, "correct": True},
            ]
            assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            print("PASS a real Amazon landmark round checks the exact octave and supports retry")

            assert await page.evaluate("""() => {
              const skill = {content: {type:'noteFind', staff:'treble', notes:['C4']}};
              if (NoteQuestActivity.supports(skill)) return false;
              const box = document.createElement('section');
              let declined = false;
              NoteQuestActivity.showQuestion(box, {type:'noteFind', staff:'treble', note:'C4'},
                () => { throw Error('unsupported note submitted'); }, () => { declined = true; });
              return declined && !box.querySelector('button');
            }""")
            print("PASS staff-based note questions fail safely without answer controls")
        await browser.close()


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Handler, directory=ROOT)
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(run(f"http://127.0.0.1:{server.server_port}/index.html"))
    finally:
        server.shutdown()
