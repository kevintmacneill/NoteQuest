# Experimental UI crawler (Claude, 2026-11-24). Not in CI, not published.

`ui_crawl_experimental.py` drives the game at phone size (390×844) with real clicks in Playwright:
1. **New player:** a fresh device goes Title → Tap to Play → onboarding.
2. **Returning player:** reload with the saved learner.
3. **Every option:** BFS over reachable screens. Each visible option is clicked from a fresh copy of its screen, recording the destination, a screenshot, JS errors and an old-style marker.

Run: `python3 -m http.server 8771` in a checkout, then `python3 ui_crawl_experimental.py http://127.0.0.1:8771/index.html /tmp/out label`. It writes `report.json` and PNGs. It uses an isolated browser context and blocks Google Fonts. No real saves or cloud: storage starts empty or seeded from the run's own new learner.

## First-run evidence (in `evidence-2026-11-24/`)
- **main @ `22ac764`** (live game at the time): Tap to Play → old `profiles` → old `newProfile` (emoji picker) → old `starter` ("Pick your first pet": puppy, kitten, isopod) → old `home` (pet house) → old `shop`. See `main-new-player-path-sheet.png`. Returning players reach the new village. This confirms #131's source findings in a real browser. The title intro's **Skip** stays on screen over the picker (roadmap C1).
- **#127 @ `4ecb670`:** new `profiles` → new `newProfile` → `nameCompanion` (no pet picker), as specified.

## Known limitations (why it's experimental; ChatGPT owns the CI version, roadmap M1)
- Its onboarding heuristic can loop: forcing `go('menu')` for a learner who hasn't finished onboarding correctly bounces back to naming or picking a pet. State identity must include the onboarding step, learner, modal and locks (ChatGPT R5).
- Screen entry uses `go(view,arg)` to reset between clicks. Acceptance must use real click paths only, as in the scenario suite.
- Links that leave the page (Music Reference) are recorded as `PAGE …` exits; their return path isn't checked yet.
- The old-style marker (`.top .back`, `.tiles .tile`) is a heuristic; it flags the 37 screens using the old `topBar()`. Visual fidelity still needs a person.
- Each option gets its own reload, so a full run takes 30+ minutes. Steps have hard timeouts, and `report.json` is saved as it goes.
