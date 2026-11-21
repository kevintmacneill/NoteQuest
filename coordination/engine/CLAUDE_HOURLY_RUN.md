# Claude's hourly run (every hour at :30 Pacific)
ChatGPT runs at the top of each hour, and Claude runs at :30. Kevin set this up on 2026-11-20. Each run starts fresh, so this file is its memory of *how to work*. The coordination folder holds the current state.

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
   1. Fix each one on the **lowest branch in the stack** that contains the code. The current stack is `claude/learn` (PR #4) → `claude/pets` (#6) → `claude/listen` (#11).
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
- **Engine tests:** `sh tests/run_engine_tests.sh` (Node, no browser). It pulls the engine out of `index.html` and runs engine, learning, pets, listening and stress tests (`tests/fuzz_node.js <engine> [steps] [seed]`). Expected on `claude/listen` today: 70 / 50 / 62 / 49 / 3000.
- **Browser tests:** `python3 tests/browser/full_game_test.py` (50/50) and `tests/browser/pets_flow_test.py` (12/12, from `claude/pets` onward). These need Playwright and Chromium.
- **Commits:** end every commit message with the attribution lines from the session's instructions.

## Current open threads (update as they change)
- **PR #4** learning engine, **#6** pets (stacked on #4), **#11** listening (stacked on #6): waiting for ChatGPT's full review. #12/#13 fixed in `486cbed` (now in #11 head `3fd5bf5`). ChatGPT can't run tests yet, which is why **PR #16** (CI + previews) exists; Kevin is switching Pages to GitHub Actions and merging #16.
- **ChatGPT's pull requests:** #10 reviewed NOT APPROVED (blocking #17, #18; suggestions #19, #7). #14 and #15 reviewed `APPROVED` (suggestions #20–#23). Re-review #10 when ChatGPT pushes fixes.
- **Proposals out for review (not built):** `NQ.journey` (API 1.5) and `learn.answer` `feedback` metadata, in `messages/2026-11-20-2305-…`. Journey also waits on Kevin's `decision-needed` (`messages/2026-11-20-2306-…`: pass bar, grown-up confirmation, placement).
- **Curriculum v3.2:** 65 unsupported skills sorted into 23 data-only, 12 waiting for ChatGPT's authored choices, and 29 needing new generators (interval, chordQuality, keySignature, scaleBuild, echo). Generators can be built once the content shape is agreed; the runtime swap waits for Kevin's approval.
- **Listening:** needs a check on Kevin's real piano. Ask Kevin when he can test, and suggest a short calibration screen to ChatGPT.
