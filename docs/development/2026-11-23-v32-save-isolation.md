# NoteQuest v3.2 save isolation

PR #118 at `0acb00c31c749a7bf70166ab1c8fb12d549e9d17` carried original-game data into v3.2. Kevin's superseding S-3 decision requires a new game with no imports. This patch is based on that PR head and is submitted separately for the engine owner and independent reviewer.

- v3.2 reads and writes its own device save, cloud document and last learner key. The original game's keys and cloud document are left where they are.
- v3.2 transfer codes use `NQ32:`. The parser and direct apply both require the v3.2 game marker and profiles. The old `NQ1:` prefix is rejected and the UI explains which game accepts it.
- Placement remains optional for new learners and takes no information from original saves. Scoring and curriculum are unchanged.

## Verification

- `sh tests/run_engine_tests.sh` checks the two curriculum variants, the no-import cases, and the sample and v3.2 fuzz runs.
- `python tests/browser/full_game_test.py` checks two game versions on the same origin, including rejection of the old code and resumed play using a v3.2 code.
- The Harbor route suite (`python tests/browser/harbor_v32_route_test.py` on the Harbor UI branch) passed all eight checks in local Linux headless Chromium 153 at 390×844 using the save-isolated engine. Continue reached all six lessons; two successful check days were required; World 2 stayed locked until Readiness; refresh returned the learner to the gate. Round responses use the public engine API. Physical Android and live cloud service were not tested. Cloud namespace behavior is tested with a stub.

No review approval or release is implied by the candidate branch.
