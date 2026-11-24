# NoteQuest first-world sprint · November 22, 2026 (Pacific)

## Review entry point

The integrated branch is [codex/first-world-sprint](https://github.com/kevintmacneill/NoteQuest/tree/codex/first-world-sprint). The tested source snapshot was local commit `061c23f9241357d4ef701ec73e841f22ebaaa480` (Git tree `3a7cd91720f1b948f48b96155c38cfdbc8a0f917`, before this report and evidence). Separate branches below let reviewers evaluate changes in smaller units. GitHub tree verification compares the uploaded content with the tested local tree including this report and evidence.

The sprint is **implemented and locally tested**. Independent exact-head code review, GitHub Actions on the new branches, owner review of the provisional screens, merge, and deployment remain pending. Current GitHub Pages automatically builds every open PR, including drafts. This sprint uses review branches and skips deploy-triggering CI on publication to comply with the restriction on public deployment. Open PRs once their automatic public previews are authorized, or use a review path that keeps previews private.

## Starting authority

- NoteQuest `main` started at `e30a3e5a5e5160f2485e76ff18f24d1a87d0e353`. The owner release gate is [finish Melody Harbor first](../../coordination/messages/2026-11-21-1725-kevin-to-all-melody-harbor-release-gate.md). The [coordination rules](../../coordination/README.md), [owner decisions](../../coordination/DECISIONS.md), [engine API](../../coordination/ENGINE_API.md), and [v3.2 data swap plan](../../coordination/engine/CURRICULUM_V32_SWAP_PLAN_v0.1.md) govern the implementation.
- Issue [#109](https://github.com/kevintmacneill/NoteQuest/issues/109) tracked the mismatch between runtime sample stop IDs `NQ-00-S1…S4` and approved curriculum preview IDs `NQ-00-U01…U06`. No ID translation or save migration is performed here.
- The four given commits are ancestors of [draft PR #112](https://github.com/kevintmacneill/NoteQuest/pull/112), not main. `ea258ad0` adds route tests. `a4706bbc` wires the route guard. `003786c5` adds tests for unavailable methods and missing stops. `1d91e15c` adjusts the guard to engine-shaped skill status objects and was the exact starting head. [Actions 45125148123](https://github.com/kevintmacneill/NoteQuest/actions/runs/45125148123) failed at that head. The older title-only success at `1676707e` applies to that older head.
- [PR #32](https://github.com/kevintmacneill/NoteQuest/pull/32) remained open and conflicting at `941e039b`. Its earlier review at `b8d6766` does not cover the current head. This sprint reuses Harbor assessment interaction patterns and learning styles in a smaller World 1 lane. Dedicated care adapts [PR #10](https://github.com/kevintmacneill/NoteQuest/pull/10) at `02ed465b` and addresses its integration conflict [#18](https://github.com/kevintmacneill/NoteQuest/issues/18). The canonical dragon rendering contract is from [PR #110](https://github.com/kevintmacneill/NoteQuest/pull/110) at `0468a164`.

## Implementation and review map

| Review lane | Scope and source | Main files |
| --- | --- | --- |
| [Melody Harbor](https://github.com/kevintmacneill/NoteQuest/commit/f5847273a7353869ee762e2f49b3c4e10f9b8c6f) | Continue opens the exact available engine stop. Academy and atlas reach the lesson path. Four sample stops, seven skills, actual Learn, Practice, and Check actions, prerequisites, retries, cancellation, and persisted profile-specific progress. The integrated branch adds unscored listening demonstrations and village mastery totals. | `index.html`, `assets/nq-harbor.js`, `assets/nq-activity.js`, `assets/nq-learning.css`, `assets/nq-worlds-v0.1.js`, route and Harbor browser tests |
| [Journey Readiness](https://github.com/kevintmacneill/NoteQuest/commit/a0118b11681a9b7957c04006d1063ed2dd07339f) | Three real engine challenges with first-try results, retry and cancellation, deliberate grown-up hold, and persisted pass/unlock. The canonical dragon appears in readiness and after the verified graduation event. The combined build routes Practice First to Harbor. | `assets/nq-journey.mjs`, `assets/nq-journey.css`, shared activity and rhythm controls, `tests/browser/journey_readiness_test.py` |
| [Music Reference](https://github.com/kevintmacneill/NoteQuest/commit/4e4e74b338ec6355b2f39035237260838abc30cc) | Existing glossary, scales, chords, and metronome are retained. Keyboard tab navigation is supported. The metronome handles navigation during asynchronous audio start. Return restores the active learner and the originating view, including the exact lesson on the combined branch. | `reference.html`, `assets/music-reference-v0.1.js`, `assets/nq-launch-menu.js`, `index.html`, reference browser tests |
| [Companion Care](https://github.com/kevintmacneill/NoteQuest/commit/c3b3b8c36e9c02d3010c7c0db55b8a08cb0caa9f) | Keeps existing habitat tap-to-scoop, egg and sleeping messages, and pat-to-wake. Adds dedicated bath, shared-pen cleaning, supplies, and single-companion selection using engine 1.7. Dirty-pen observation requires a visible acknowledgement. | `index.html`, `assets/notequest-care-studio-v0.1.css`, `tests/browser/full_game_test.py`, `tests/browser/pets_flow_test.py` |
| [Full integration](https://github.com/kevintmacneill/NoteQuest/tree/codex/first-world-sprint) | Uses the existing four-second title transition. A stalled picture falls back after eight seconds. Keyboard activation requires the same three-second grown-up hold. Browser regression coverage is added to the existing Actions test list. | `assets/nq-launch-menu.js`, `assets/nq-rhythm-v0.1.js`, `index.html`, `.github/workflows/tests.yml`, browser suites |

The engine script SHA-256 on the starting `main` and integrated source is `7e1a319f37dde9c3f83c95a41ac8f37b183193298b630a02589e18e86e0957db`. The dragon thumbnail and original asset matched the manifest SHA-256 values. No gameplay rule, mastery, score, save schema, or engine migration was changed.

## Defects reproduced and corrected

- The launch integration previously opened a world preview or a simulated exact-match path. Those tests now enter a real `NQ-00-S1` lesson and separately cover failed routing and unsupported question cancellation.
- The route fixtures used arrays of strings where the engine returns objects, and overwrote merged mock statuses. The corrected suite passed 16 assertions.
- A refactor initially omitted the shared key-picture export. Its browser regression caught the Learn panel failing early. The export and usage were repaired and all affected browsers rerun.
- The full game exercised successfully but failed its console check on two external stylesheet requests in this environment. The test now supplies the empty stylesheet response and verifies the shipped font fallback while retaining application console error checks. Companion integration also updated the old pet-sheet cleaning checks to exercise real Bath Time.
- The test container blocked the stock Chromium process and Playwright's CDN returned HTTP 403. Local headless Chromium from the npm browser distribution ran the actual browser suites with Playwright without replacing app APIs. One initial test launch in single-process mode crashed as tests switched browser contexts. The final browser runs used multiprocess mode.
- The startup and reference regressions originally queried buttons before the asset-backed title was ready. Final tests wait for the actual readiness/settled DOM signals. The companion fixture now has a toy when checking the engine's sleeping refusal.

## Verification and evidence

Tested in Linux with Node 24.22.3, Python 3.12.14, Playwright 1.62.0, and headless Chromium 153.0.8010.0. The local browser wrapper pointed Playwright at the npm headless shell with `--no-zygote --disable-gpu`. All browser suites served the tested files only on loopback. Engine day changes and rhythm timestamps were simulated in Chromium for speed. The game still used the original scoring and save path. The viewport tests emulate phones, tablets, and desktops. Acoustic piano, Android hardware, screen-reader speech, and caregiver identity are not verified by these tests.

| Exact command from tested checkout | Exit | Results |
| --- | ---: | --- |
| `sh tests/run_engine_tests.sh` | 0 | 4,037 passed, 0 failed across 14 suites |
| `node tests/lesson_route_test.cjs` | 0 | 16 assertions passed, 0 failed |
| `bash tools/preview/test_build_site.sh` | 0 | 29 allowlist and failure-gate assertions passed, 0 failed, local fixture only |
| `python -u tests/browser/harbor_lessons_test.py` | 0 | 15 passed, 0 failed. Fresh profile and saved progress, wrong answers, cancellation, unsupported type, all four stops, gated next world, progress dashboard, second profile |
| `python -u tests/browser/journey_readiness_test.py` | 0 | 14 passed, 0 failed. Cancel, fail, 4/5 pass, reload, caregiver hold, cadence, next-world unlock, next-world fallback |
| `python -u tests/browser/music_reference_test.py` | 0 | 8 passed, 0 failed. Glossary, keyboard tabs, chords, tempo, village/game/lesson return, standalone path |
| `python -u tests/browser/opening_screen_test.py` | 0 | Pass. Actual load, missing/stalled picture, four-second motion, Skip, reduced motion, touch and viewport coverage. Script emits a suite result only. |
| `python -u tests/browser/metronome_accent_test.py` | 0 | Pass. Existing six-click meter verified through the Web Audio schedule. Script emits a suite result only. |
| `python -u tests/browser/launch_menu_test.py` | 0 | Pass. Village destinations and focus at phone, tablet and desktop widths. Short pointer and keyboard input stay locked. Sustained keyboard hold opens grown-up settings. Script emits a suite result only. |
| `python -u tests/browser/pets_flow_test.py` | 0 | 33 passed, 0 failed. Bath, soap, shared pen, supply shortage and acknowledgement, sleeping states, single companion, and note-row responsiveness. |
| `python -u tests/browser/full_game_test.py` | 0 | 51 passed, 0 failed. Includes legacy save, game routes, and companion actions. |

Each browser invocation also used `PLAYWRIGHT_BROWSERS_PATH=/tmp/nq-playwright NQ_SCREENSHOTS=/tmp/nqsprint NQ_WWW=/tmp/nqsprint/final-<test-name>-www timeout 320`. These environment variables select the local browser and test output location.

- [Mobile lesson capture](evidence/2026-11-22-first-world/harbor-lesson-mobile.jpg)
- [Mobile readiness capture](evidence/2026-11-22-first-world/harbor-readiness-mobile.jpg)
- [Test output and exit statuses](evidence/2026-11-22-first-world/test-results.txt)

## Remaining acceptance gates

1. Engine-owner integration of approved v3.2 data and save migration remains the release blocker for [#109](https://github.com/kevintmacneill/NoteQuest/issues/109). UI calls the exact runtime IDs it receives. The approved six-stop Harbor curriculum, C-B12 coming-soon semantics, C-B13 teacher evidence, and migration of old mastery still need the engine contract and test fixtures described in the swap plan. No approval is inferred from the sample run.
2. Review the four implementation branches and the combined run independently at their verified GitHub heads. Leave the existing PRs and review issues open. No author branch was overwritten.
3. Use the owner-approved canonical dragon and [readiness layout](../../coordination/design/JOURNEY_READINESS_APPROVED_SCREEN_v1.0.md) as reference for the separate polished visual pass. Production gate background, panorama, and title art still require their own acceptance. No new art was created in this sprint.
4. Complete the dedicated sanctuary hospital experience and real Android/tablet testing. Care Studio covers the existing bath/pen/companion flows. Acknowledge sick pets only in a reviewed hospital UI with the need shown. Test rhythm timing, audio loudness, and caregiver usability on the physical tablet.
5. Release Melody Harbor before expanding World 2. After graduation, Continue opens the authoritative next-world preview. The integrated branch does not claim World 2 lesson coverage.
