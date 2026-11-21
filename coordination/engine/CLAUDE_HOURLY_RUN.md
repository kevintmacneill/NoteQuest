# Claude's hourly run (every hour at :30 Pacific)

## Head freeze: LIFTED 2026-11-21 12:10 PT
The whole engine stack (#4 → #6 → #11 → #24 → #25 → #26 → #28 → #31) was approved by ChatGPT after its own CI reruns at the exact heads, and merged into `main` bottom-up, pinned to those heads. Main is engine **1.6.0**. New engine work goes on new branches off `main`, one PR each, with no more stacking unless it's unavoidable.

## Kevin's rules for these runs
- **Do:** answer ChatGPT's messages, fix review issues on Claude's pull requests, review ChatGPT's pull requests, then **keep building** the next engine work.
- **Merge** a Claude pull request once ChatGPT has posted an `APPROVED` review on its **current head** and no open `blocking` issue for it remains. This follows the cross-review rule: the author merges.
- **Decisions only Kevin can make** (curriculum approval, new behavior choices, anything with real trade-offs): write a `decision-needed` message to Kevin in `coordination/messages/`, then continue other work. Never guess.
- **Kevin's standing preference** is not to build until there's about 95% confidence in what to build. When unsure, ask in a message instead of building.

## Order of work each run
1. **Sync.** `git fetch`, then pull `main`. Read, in this order:
   - `coordination/README.md`, `PLAN.md`, `DECISIONS.md` (Kevin's decisions)
   - `STATUS.md`, `ENGINE_API.md`
   - every file in `coordination/messages/` with `to: claude` (or `all`) and `status: open`
   - open GitHub issues and pull requests: `gh api repos/kevintmacneill/NoteQuest/issues?state=open`
2. **Review issues on Claude's pull requests** (title `PR #n: …`, label `review`):
   1. Fix each one on the **lowest branch in the stack** that contains the code. The current stack is `claude/learn` (PR #4) → `claude/pets` (#6) → `claude/listen` (#11) → `claude/theory` (#24) → `claude/generators` (#25) → `claude/harmony` (#26) → `claude/early-types` (#28) → `claude/journey` (#31).
   2. Merge the fix upward through the stack.
   3. Run the tests (below).
   4. Push, then comment `Fixed in <sha>` with what changed and which tests ran.
   5. Leave closing the issue to the reviewer.
3. **Merge approved pull requests.** Check the review is `APPROVED`, it's on the current head SHA, nothing `blocking` is open, and `mergeable_state` is clean. Then:
   1. Merge via `gh api -X PUT repos/kevintmacneill/NoteQuest/pulls/<n>/merge -f merge_method=merge -f sha=<head>`.
   2. Retarget the next stacked pull request to `main`: `gh api -X PATCH .../pulls/<m> -f base=main`.
   3. Merge `main` into its branch and push.
   4. Update the "Status" line in `ENGINE_API.md`.
4. **Review ChatGPT's pull requests.**
   1. Read the diff. The engine zone should be unchanged unless that was agreed.
   2. Check out the branch and run the browser tests against it.
   3. File **one GitHub issue per finding**, titled `PR #n: …`, labeled `review`, plus `blocking` if it must be fixed before merge.
   4. When nothing blocking is left, post a pull-request review (event `COMMENT`) whose first line is `APPROVED`. List what was checked and the limits of the evidence.
5. **Answer messages** addressed to Claude. Create reply files as `YYYY-MM-DD-HHMM-claude-to-<who>-<topic>.md`, and set the original's `status: done`.
6. **Build**, if time remains: take the next item from Claude's "Next" line in `STATUS.md` that needs no new decision from Kevin.
   - Work on a new `claude/<topic>` branch, with tests.
   - Open a pull request (body ending with the attribution lines), and post a `request` message asking ChatGPT to review it.
   - **Never change the UI zone** beyond minimal changes the engine rules require, and say so in the pull request.
7. **Finish.**
   - Update Claude's section of `STATUS.md`.
   - Commit coordination edits straight to `main` (`coord: …`).
   - If anything happened (a fix, merge, review, new pull request or decision for Kevin), end with a 3–6 line summary for Kevin. If nothing changed, say so in one line.

## Seeing and running each other's work (after PR #16 merges and Pages is set to GitHub Actions)
- Every push runs the **`Tests`** workflow. Read results with `gh api repos/kevintmacneill/NoteQuest/actions/runs?branch=<branch>`; the run's Summary has the text.
- **Previews:** `https://kevintmacneill.github.io/NoteQuest/preview/` links every open pull request's playable build, its `tests.html?autorun` (add `&fuzz` for the stress test) and `test-results.txt`. Previews use their own save slot.
- When reviewing ChatGPT's pull requests, cite the CI run and preview you checked, not just a source read.
- After PR #16 merges, merge `main` into `claude/learn`, `claude/pets` and `claude/listen` so CI runs on them too.

## How the code is laid out
- `index.html` has `<script id="nq-engine">` (Claude: rules, data, saving, mic; no drawing) and `<script id="nq-ui">` (ChatGPT). Edit the engine block directly.
- **Never break saves:** the `noteQuest.v1` key, `NQ1:` codes, and the save upgrade in `migrate()` (currently v2).
- **Engine tests:** `sh tests/run_engine_tests.sh` (Node, no browser). It pulls the engine out of `index.html` and runs engine, learning, pets, listening and stress tests (`tests/fuzz_node.js <engine> [steps] [seed]`). Expected on `claude/listen` today: 70 / 50 / 62 / 49 / 3000. On `claude/theory` the theory suite (`tests/theory_node.js`) adds 114, run after listening; on `claude/generators`, `tests/generators_node.js` adds 230 after theory (267 on `claude/harmony` and later); on `claude/early-types`, `tests/early_types_node.js` adds 113 after generators. `full_game_test.py` sometimes times out waiting for `.wk[data-midi="66"]` on every branch: rerun before treating it as a failure.
- **Browser tests:** `python3 tests/browser/full_game_test.py` (50/50) and `tests/browser/pets_flow_test.py` (12/12, from `claude/pets` onward). These need Playwright and Chromium.
- **Commits:** end every commit message with the attribution lines from the session's instructions.

## Current open threads (update as they change)
- **PR #16 is merged** (`8b975f1`) and **Pages is live** (GitHub Actions source set; first green deploy was run 44917118889). `tests.html` runs all suites. Add new suite files to its `SUITES` list (and data files to `DATA_FILES`). **Any new file that must be on the site has to be added to the `build_site.sh` allowlist.** Several Claude sessions may push to the stack between runs: always fetch first, check the remote head right before pushing, and never force-push. When merging a fix up the stack, resolve conflicts hunk by hunk: `git checkout --theirs` replaces the whole file and drops the upper branch's own changes.
- **PR #4** learning engine, **#6** pets (stacked on #4), **#11** listening (stacked on #6): waiting for ChatGPT's full review. #12/#13 fixed in `486cbed` (now in #11 head `3fd5bf5`). Previews are live now, so ChatGPT can run them. Current heads (10:50): #4 `ddddcc3` · #6 `ac04d8b` · #11 `342bdda` · #24 `13093de` · #25 `ec16425` · #26 `f73836e` · #28 `1733b85` · #31 `6a4a675`. ChatGPT can't clone or open previews, but it **can rerun `Tests` jobs** on exact heads (its route since 11:45; all 8 attempt-2 reruns green). Kevin kept the execute-it-yourself rule.
- **ChatGPT's pull requests:** #10 reviewed NOT APPROVED (blocking #17, #18; suggestions #19, #7). #14 and #15 reviewed `APPROVED` (suggestions #20–#23). Re-review #10 when ChatGPT pushes fixes.
- **`NQ.journey` (engine 1.6.0) is PR #31** on `claude/journey`, stacked on #28, built under Kevin's J1–J3 (DECISIONS.md). `learn.answer` `feedback` metadata is still a proposal (`messages/2026-11-20-2305-…`).
- **The live site can't be fetched from these runs** (the proxy blocks `github.io`). To check a deployment, read the Pages job log (it lists every published file) or rebuild locally with `NQ_PR_LIST=<tsv> bash tools/preview/build_site.sh _site` and serve `_site`.
- **PR #24** theory helpers (API 1.4.1, stacked on #11): waiting for ChatGPT's review. Generators build on it once ChatGPT confirms the shapes and type fixes in `messages/2026-11-20-2350-…`.
- **PR #25** theory generators (API 1.5, stacked on #24): waiting for ChatGPT's review. Open asks to ChatGPT: author the split NQ-05-U04 triad skill; define the question for NQ-06-U05-S01 (secondary dominant recognition) and NQ-06-U05-S02 (cadence classification).
- **PR #26** cadence classification + secondary-dominant recognition (API 1.5.1, stacked on #25): ChatGPT's NQ-06-U05 shapes from `messages/2026-11-21-0055-…`. ChatGPT confirmed authentic/half and major keys only. #27 fixed in `8b0092f` and closed by ChatGPT; waiting for an executable `APPROVED` on that head. NQ-05-U04-S04 (triad) must NOT be built until ChatGPT's curriculum revision lands.
- **PR #28** first-steps types `keyboardSide`, `durationCompare`, `contourRead` (API 1.5.2, stacked on #26): ChatGPT source-checked it and answered the UI questions (region tap sends left/right; same pitch for A/B). Waiting for an executable `APPROVED`. Left out on purpose: `teacher` (20 skills, all NQ-05+, waiting on how teacher confirmation should count; ask Kevin before the runtime swap) and `echo` (needs listening).
- **Curriculum v3.2:** 65 unsupported skills sorted into 23 data-only, 12 waiting for ChatGPT's authored choices, and 29 needing new generators (interval, chordQuality, keySignature, scaleBuild, echo). Generators can be built once the content shape is agreed; the runtime swap waits for Kevin's approval.
- **Companions:** the contract is `engine/COMPANION_SANCTUARY_CONTRACT_v0.5.md` (supersedes v0.3/v0.4), not built. Only S2 is open (Kevin, `messages/2026-11-21-1150-claude-to-kevin-…`). Older notes: Kevin's 09:31 and 09:34 answers (to ChatGPT) conflict with C-B3/C-B4 (to Claude, 09:23). Waiting on Kevin's confirmation and neglect Q1–Q4 (`messages/2026-11-21-0940-claude-to-kevin-…`) and on ChatGPT's review. Build growth only after approval; nothing lowers friendship until Kevin answers.
- **Listening:** needs a check on Kevin's real piano. Ask Kevin when he can test, and suggest a short calibration screen to ChatGPT.
