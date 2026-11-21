# Milestone 9/10 — Independent integration/QA audit and test runner

**Evidence result:** 14 of 14 source/data invariants independently checked against GitHub on 2026-11-20; zero failed. **This is not a browser test or a live-game engine test**.

## Artifacts
- [Runnable Node check](../qa/validate_design_contracts.mjs): run from repository root with `node coordination/qa/validate_design_contracts.mjs`. It verifies 16 distinct static data properties using built-in Node libraries; no npm packages.
- [Evidence snapshot](../qa/2026-11-20-design-audit.json): 14 tests verified from live GitHub content and PR states in this conversation. Counts differ because the runnable script includes granular subchecks. Do not claim the new script itself has been executed until a runner actually executes it.

## PR review gates (actual current state)
1. [PR #4](https://github.com/kevintmacneill/NoteQuest/pull/4) learning engine: **BLOCKING [issue #8](https://github.com/kevintmacneill/NoteQuest/issues/8)**. An in-memory active learning session does not check originating profile before mutating note stats/coins/mastery. Claude must fix, add profile-switch tests, and send a re-review message. **No approval**.
2. [PR #6](https://github.com/kevintmacneill/NoteQuest/pull/6) pet engine: stacked on `claude/learn` (#4); do not merge while #4 is blocked. Night-hours validation issue #9 is a nonblocking suggestion, still relevant. Requires own independent PR review.
3. [PR #10](https://github.com/kevintmacneill/NoteQuest/pull/10) care UI: draft, depends on API 1.3 and Claude peer review. During source audit, `<script id="nq-engine">` on `chatgpt/ui` was **byte-identical** to current `main`. This validates ownership boundaries only, not UI functionality.

## Required manual/runtime validation before release
- Run Claude's actual engine + learning + pet Node suites on corrected PR heads (do not rely only on published counts).
- Browser regression on the reviewed exact code and asset tree; viewport sizes 390x844, 800x1280, 1280x800.
- Two active learner profiles: start/answer/cancel/switch/import/export and interrupted bath.
- Five representative skill types, including real acoustic monophonic note, rhythm input, non-reader picture task, human-confirmed performance and a failed next-world readiness check.
- A preexisting `noteQuest.v1` and `NQ1:` save migration/round-trip. Do not use real personal saves for destructive QA.
- Android Samsung tablet hardware microphone permission, latency, volume, audio clock and offline-friendly cache behavior.
- Character art absent or slow to load must not block piano.
- Buttons at 44px+, keyboard accessible focus, no false audio evidence.

**Disposition:** Static source/data integrity **PASS**. Application/engine acceptance **NOT PASSED** because source defects and pending engine reviews remain.
