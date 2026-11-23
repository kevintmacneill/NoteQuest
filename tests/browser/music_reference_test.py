"""Verify the music library and its return path in Chromium."""
import asyncio
import functools
import http.server
from pathlib import Path
import threading

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


async def play(base):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844}, has_touch=True)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        passed = 0

        def check(label, condition):
            nonlocal passed
            assert condition, label
            passed += 1
            print("PASS " + label)

        await page.goto(base + "index.html")
        await page.locator(".nq-launch-start").click()
        await expect(page.get_by_role("dialog", name="Welcome to NoteQuest")).to_have_count(0)
        await page.evaluate("""() => {
          const p = NQ.profiles.create('Reference Learner', '🐱');
          NQ.pets.init();
          NQ.pets.chooseStarter('kitten', 'Kit');
          rememberPlayer(p.id);
          go('menu');
        }""")
        game_before = await page.evaluate("NQ.saveCode.export()")
        await page.locator('a[href="./reference.html"]').first.click()
        await expect(page.get_by_role("heading", name="Music Reference")).to_be_visible()

        await page.locator("#glossarySearch").fill("crescendo")
        check("Glossary can filter terms at phone width",
              await page.get_by_role("heading", name="Crescendo", exact=True).is_visible()
              and not await page.get_by_role("heading", name="Octave", exact=True).is_visible())

        glossary = page.get_by_role("tab", name="Glossary")
        await glossary.focus()
        await page.keyboard.press("ArrowRight")
        scales = page.locator('[data-tab="scales"]')
        await expect(scales).to_be_focused()
        await expect(scales).to_have_attribute("aria-selected", "true")
        await page.locator("#scaleRoot").select_option("C")
        await page.locator("#scaleMode").select_option("major")
        check("Keyboard reaches scales and C major renders seven diatonic chords",
              "C major" in await page.locator("#scaleTitle").inner_text()
              and await page.locator("#chordBody tr").count() == 7)
        await scales.focus()
        await page.keyboard.press("End")
        await expect(page.get_by_role("tab", name="Music Basics")).to_be_focused()
        await page.keyboard.press("ArrowLeft")
        await expect(page.get_by_role("tab", name="Metronome")).to_be_focused()
        await page.locator("#tempoNumber").fill("137")
        await page.locator("#tempoNumber").dispatch_event("change")
        await page.locator("#timeSignature").select_option("6")
        await page.locator("#metToggle").click()
        await expect(page.locator("#metToggle")).to_have_attribute("aria-pressed", "true")
        check("Metronome accepts exact BPM and six-click meter",
              await page.locator("#tempoNumber").input_value() == "137"
              and await page.locator("#beatDots .beat-dot").count() == 6)

        await page.get_by_role("link", name="Return to NoteQuest").click()
        await expect(page.locator(".nq-launch-start")).to_have_count(0)
        check("Reference returns directly to the village without changing learner save",
              await page.evaluate("NQ.profiles.current().name === 'Reference Learner'")
              and await page.evaluate("NQ.saveCode.export()") == game_before)

        await page.evaluate("() => go('games')")
        await page.locator('a[href="./reference.html"]').click()
        await page.get_by_role("link", name="Return to NoteQuest").click()
        check("Reference returns to the originating practice screen",
              await page.get_by_role("heading", name="🎮 Games").is_visible())

        if await page.evaluate("Boolean(window.NoteQuestHarbor)"):
            await page.evaluate("() => go('engineLesson', 'NQ-00-S1')")
            await page.get_by_role("link", name="Music Reference").click()
            await page.get_by_role("link", name="Return to NoteQuest").click()
            check("Reference returns to the exact engine lesson",
                  await page.get_by_role("heading", name="Meet the piano", exact=True).is_visible()
                  and await page.evaluate("NQ.profiles.current().name === 'Reference Learner'"))

        stand_alone = await browser.new_page()
        await stand_alone.goto(base + "reference.html")
        await stand_alone.get_by_role("link", name="Return to NoteQuest").click()
        await expect(stand_alone.locator(".nq-launch-start")).to_be_visible()
        check("Standalone Reference has a regular game link",
              await stand_alone.locator(".nq-launch-start").is_visible())
        check("No page errors or phone overflow", not errors and
              await page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        await browser.close()
        print(f"{passed} passed, 0 failed")


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT)
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(play(f"http://127.0.0.1:{server.server_port}/"))
    finally:
        server.shutdown()
