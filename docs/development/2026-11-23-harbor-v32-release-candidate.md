# Melody Harbor v3.2 integration candidate

This review branch combines the Harbor UI candidate (`c419b3fb`, issue #109) and the save-isolated v3.2 engine candidate (`523d05a6`, PR #118). The combined checkout lets a reviewer run the engine, lessons, and Journey Readiness together. Both items still require approval on GitHub. The superseding no-import decision is in main at `acb97a1`.

## Changes made for integration

- Resolve the browser-test conflict using fresh v3.2 profiles and one browser origin, where the original game's saved records are also present. Retain the optional offline font override.
- Select the v3.2 six-stop browser test when the embedded curriculum is 3.2. The sample retains its four-stop regression.
- Match Harbor Readiness instructions to the v3.2 tasks. Browser tests answer key-group, keyboard-side and note-duration questions through the real controls, along with rhythm and grown-up observation.

## Reproduction and evidence

Local Linux with Python Playwright and Chromium 153 headless. The Harbor and Readiness suites used a 390 × 844 touch viewport.

| Command | Results |
| --- | --- |
| `sh tests/run_engine_tests.sh` | Exit 0. The v3.2 curriculum and save suite passed 73/73. Sample and v3.2 engine fuzz runs completed 1,500 and 3,000 actions with zero failures. |
| `python tests/browser/harbor_v32_route_test.py` | Exit 0, 9/9. Continue reached all six exact lesson IDs, two-day scoring completed each stop, and reload returned the learner to the still-locked Readiness gate. The first black-key skill uses the actual touch controls for practice, a wrong-answer retry and both check days. Other lesson round responses use the public engine API. |
| `python tests/browser/harbor_v32_activities_test.py` | Exit 0, 5/5. Mobile key group and keyboard side, engine-provided audio durations, unavailable activities, and grown-up holds. |
| `python tests/browser/journey_readiness_test.py` | Exit 0, 14/14 on v3.2 and 14/14 on the sample baseline. The browser uses actual controls for failed and successful attempts, tests the 4/5 threshold and refresh, and verifies the grown-up hold and engine-owned World 2 unlock. |
| `python tests/browser/full_game_test.py` | Exit 0, 51/51, including original-save isolation and v3.2 save transfers. |
| `python tests/browser/pets_flow_test.py` | Exit 0, 33/33. |
| `python tests/browser/music_reference_test.py` | Exit 0, 8/8. The exact authoritative engine lesson survives a visit to the Music Reference. |
| `bash tools/preview/test_build_site.sh` | Exit 0. Publish allowlist, separate preview save slots and failure propagation passed. |

Next is independent review of the #118 engine change and the #109 integration, followed by CI at the proposed release head. The Rainforest map is reachable after the verified unlock. Its lessons, physical piano and Android hardware, and production cloud service are outside this verification. The painted village artwork remains a separate review in #115.

## Exact engine update

The engine owner incorporated the save-isolation patch into PR #118 at `4bcc5f5a2d3bddc68309272e2baddd2cf60b5d8a`. The Git tree matches the originally tested save-isolation tree at `523d05a6` byte for byte. This checkpoint also incorporates main at `833de5f`, which adds the current coordination decisions and messages. No game files changed from the previously tested Harbor candidate at `0ee3ec6`.

Re-ran the engine suite (73/73 on v3.2 plus 4,500 fuzz actions, exit 0), Harbor route (9/9), Journey Readiness (14/14) and Pages build tests (exit 0) on this combined checkout. The Harbor and Readiness results include the authoritative engine route, completion and refresh, and a failed challenge preserving the World 2 lock. GitHub CI and independent approval are tracked on PR #118. This branch is for review.

## Review follow-ups

Claude independently verified the playable Harbor candidate and found no blocker in the existing learner flow. See #109 for the all-controls playthrough and #118 for the save review. GitHub Actions 45317479344 passed at the incorporated engine commit.

Two review-only changes can be incorporated independently:

- #121, Music Reference browser test. Wait for the game URL and destination view after the browser's asynchronous history return. Three consecutive Chromium runs each passed 8/8. An additional run with browser history deliberately delayed 400 ms also passed 8/8.
- Pages preview build guard. Require all three v3.2 preview save locations to be isolated. The build fixture with a failing cloud substitution now withholds the affected preview. `bash tools/preview/test_build_site.sh` passed.

These changes do not alter the game runtime. Engine follow-ups #119 and #120 remain with the engine owner.

## Combined draft against main

The draft is based on `main` after engine PR #118 merged at `f174532`. It brings the reviewed Harbor work and follow-ups together instead of landing the earlier preview stack separately. The title still uses the existing artwork and four-second transition. The default village uses the existing tracked panorama. With the four prototype WebP layers copied into `assets/` locally, `index.html?layered-overlook` shows the layered option for visual review. The prototype binaries are outside this draft. Final artwork acceptance and exact-head independent review remain required.

The combined checkout passed local engine suites including 73/73 v3.2 checks and 4,500 fuzz actions, Harbor 9/9, Readiness 14/14, Music Reference 8/8, layered panorama 8/8 at 390 through 2560 CSS pixels, and the preview-build allowlist and save isolation tests. Runtime art acceptance requires phone and desktop inspection. The draft commit requests Tests without dispatching a Pages rebuild from that run.
