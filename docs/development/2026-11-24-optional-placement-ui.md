# Optional learner placement

November 24, 2026 · Codex implementation checkpoint

## Starting state

PR [#123](https://github.com/kevintmacneill/NoteQuest/pull/123) introduced the engine 1.8.1 pending flag and merged at `d87c41b80bba6c865ea2863723c40eda43d790d2`. Claude [independently approved the exact engine PR head](https://github.com/kevintmacneill/NoteQuest/pull/123#pullrequestreview-6041017730), and [its CI passed](https://github.com/kevintmacneill/NoteQuest/actions/runs/45412782035). The approved tree equals that merge commit's tree. The classic release was canceled by Kevin on November 24. This UI branch targets the merged engine. Its implementation has separate review and release gates.

## Implementation

- `assets/nq-city-overlook.js` offers placement in the village for a pending profile, or resume for an in-progress profile. The ordinary Continue Adventure remains available.
- `index.html` uses the placement contract in `coordination/ENGINE_API.md`. A learner can try the readiness challenges, skip, or ask a grown-up to pick an authoritative world ID via the existing three-second hold. Results and progress come from the active profile and engine. Later checks without supported activity renderers offer an explicit finish action that preserves progress.
- `assets/nq-journey.mjs` reuses the approved readiness UI and dragon asset and provides a placement-specific return path. The ordinary readiness flow keeps its existing navigation.
- `tests/browser/placement_test.py` tests profile creation, skip and resume, an incomplete attempt, five wrong answers, the grown-up hold, successful assessment progression, later unsupported checks, and profile isolation. `.github/workflows/tests.yml` adds the regression and uploads phone-width screenshots with the test artifact.

The implementation calls the existing engine APIs for starting checks, scoring, changes to placement state and saved progress. The placement contract assigns skip and world choice to a grown-up. Both skip and finish use the same three-second hold as world choice. The regression checks that a tap or cancel preserves the pending prompt. Engine rules, save format, artwork, and release workflow remain as before.

## Verification

Local Debian 13, Node 24.22.3, Python 3.12.14, headless Chromium 153.0.8010.0. Playwright used the environment's Chromium executable via a local executable-path shim. Touch and keyboard were exercised on a 390 × 844 viewport.

| Command | Exit | Passed | Failed |
| --- | ---: | ---: | ---: |
| `python -u tests/browser/placement_test.py` | 0 | 7 | 0 |
| `python -u tests/browser/journey_readiness_test.py` | 0 | 14 | 0 |
| `python -u tests/browser/harbor_v32_route_test.py` | 0 | 9 | 0 |
| `sh tests/run_engine_tests.sh` | 0 | 5,612 across 16 suites | 0 |
| `bash tools/preview/test_build_site.sh` | 0 | 34 | 0 |
| `git diff --check` | 0 | — | — |

Screenshots `placement-choices-mobile.png` and `placement-check-mobile.png` were captured and visually inspected. Set `NQ_SCREENSHOTS` to capture them locally. The GitHub workflow captures them under `_www_placement_test` and uploads them with `test-results-<commit>`.

## Handoff

Implementation and local tests are complete for the branch. Physical Android and acoustic-piano testing remain unverified. Amazon Rainforest placement checks and later-world lessons still require independently supported curriculum activities. They are deferred safely. Request independent review of the placement UI commit, including the use of the grown-up gate and engine-owned locks. Confirm branch CI before merge. An open pull request will be picked up by the existing public Pages preview workflow.

### Grown-up world choices

Claude independently approved head `6f2342f` and flagged a player usability issue before children use it. The world selector now enables Melody Harbor and labels the other worlds coming soon until their routes are playable. The chosen ID is checked again on submit. The Chromium placement regression again passed 7/7 with the grown-up hold, disabled Amazon option, real pick, and immediate Harbor lesson entry. This change needs its own exact-head sign-off.

### Reconciliation after #127 and #125 (2026-11-25)

Preserved approved onboarding, shared-device learner picker and save-safety engine byte-for-byte. Placement-only UI and journey changes transferred onto current main; placement regression uses kitten naming and explicitly selects the learner after multi-profile reload. The old pet house and sanctuary links are not restored. Runtime verification pending on this exact head.
