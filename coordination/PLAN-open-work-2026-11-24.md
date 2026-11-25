# NoteQuest: plan for everything open (Claude, 2026-11-24 08:20 PT)

Working mode (Kevin, 2026-11-24): **ChatGPT builds; Claude specs and reviews** at the exact head (every test rerun, the diff read against DECISIONS.md, and an attempt to break saves and coins). ChatGPT merges after an exact-head `APPROVED` review and green CI. Owner decisions are marked **Kevin decides**.

Order: **A** (World 1 release) → **B** (World 2 blockers) → **C** (clean-up) → **D** (backlog). Within A, top to bottom.

---

## A. World 1 (Melody Harbor) release: the six items Kevin is sending

| # | Item | Status | Spec / review |
|---|---|---|---|
| A1 | New-player flow: restyle who's-playing and new player to match the title and village, quiet grown-up link, default **cat** companion named by the child (default "Melody"), land in the **village**, hide the old pet house, shop, clean and habitat screens | To build | `messages/2026-11-24-0805-…onboarding-spec.md` |
| A2 | Title screen with no dark box (`codex/clear-title-overlay` @ `2baf3b1`) | **Approved**; merge when CI is green | Follow-up: on a portrait phone, the art fills the screen, with Tap to Play over it |
| A3 | Placement screens (`codex/optional-placement-ui` @ `6f2342f`) | **Approved**; open a PR | Grown-up "choose a world" lists only worlds with playable lessons (today: Melody Harbor) |
| A4 | World map (`codex/v32-world-map` @ `507ddf1`) | **Approved**; merge | Follow-up: key the atlas on `/^3\.\d+$/` or on `learn.stops`, not on `id==="3.2"` |
| A5 | PR #125: save safety (progress survives curriculum updates; unreadable saves are never overwritten) | Fixed twice after review (#126); new head `7de0c77` | ChatGPT re-reviews at exact head |
| A6 | Coins can't be farmed: practice games and rescues; 3-starred levels pay nothing; repeats the same day pay ×1, ×½, ×¼, then 0; no message; lessons unchanged | To build | `messages/2026-11-24-0700-…coin-antifarming-spec.md` |

**Release check (after A1–A6 merge):**
- Claude runs the full suite on main plus a fresh-device walkthrough: Tap to Play → new player → cat → village → all six Harbor lessons → readiness → World 2 stays locked.
- **Kevin** plays it with the girls on the real tablet or phone, with sound and the piano.
- Deferred, cosmetic (Kevin): the 4-second title zoom; the pet house redesign; new cat art.

---

## B. World 2 (Amazon) blockers: specs for ChatGPT, after A

### B1. #119: the engine must refuse lessons in a locked world
Engine zone, `index.html`. Bump `NQ.version` (next patch).
- `stopUnlocked(stopId)`: the first stop of a world after Melody Harbor is unlocked **only** when `journeyUnlocked(<previous world>)`, or the stop was placed (placement, `learn.place`), or the profile has `unlockAll`.
  - **Remove the "a skill here is already past not-introduced" exemption** for world gates. It existed for learners from before readiness gating (1.6). v3.2 is a fresh game, so no such learners exist.
  - Stops inside a world keep their current rules.
- `learnStart(skillId, mode)`: if the skill's stop is not unlocked, return `{ok:false, reason:'locked', gate:{worldId}}`. Exception: `review` mode on a skill already `secure` (placed learners can review).
- Tests (`curriculum_v32_node.js`), each with expected values:
  - fresh learner: `learn.start('NQ-01-U01-S01','practice')` → `reason:'locked'`;
  - `currentStop()` is still `NQ-00-U01`;
  - after passing NQ-00 readiness, it starts and `currentStop()` is `NQ-01-U01`;
  - after `placement.pick('NQ-01')`, it starts;
  - `unlockAll` starts;
  - review mode of a placed secure skill starts;
  - the #119 repro steps (markLearned, practice to `developing`, start, cancel) leave World 2 locked after a reload.
- Fuzz: add the invariant "no skill in a locked world ever leaves `not-introduced`".

### B2. #124: four Amazon skills are assessed with the wrong evidence
`NQ-01-U01-S02` (rising and falling black-key groups), `NQ-01-U04-S03` (C-position melody C4–G4), `NQ-01-U05-S03` (five-note melody in an even pulse), `NQ-01-U08-S02` (one-hand piece with count-in and repeats). Each currently uses the single-note `notePlay` generator, so passing them would misstate what the child can do.

**Kevin decides:**
- **Option 1 (recommended): grown-up checks now.** Same as decision S-1, where 3 listening skills became grown-up checks. Each skill becomes a `teacher` check with a short checklist, for example "Plays C-D-E-F-G with fingers 1-2-3-4-5, steady, no stops". World 2 can open as soon as B1 lands. Later, replace them with real assessment.
- **Option 2: "coming soon".** Mark them coming soon (C-B12: never blocks a stop). World 2 opens without them, and they come back when a melody-and-rhythm assessment exists.
- **Option 3: build the assessment first.** A new `melodyPlay` question type (a note sequence with a count-in, judged on order and steady pulse through MIDI or the mic). World 2 waits for it. This is the largest of the three.

Whichever option: `tools/curriculum/build_v32.py` overrides (like `TEACHER_OVERRIDES`), the readiness parts rebuilt, and tests updated to the new counts (`teacher` and coming-soon totals).

### B3. Then: Amazon lessons (`codex/rainforest-keyboard-discovery` @ `fc00b9d`)
On hold until B1 is merged and B2 is decided and merged. Review then.

---

## C. Clean-up: ChatGPT verifies each item against current main, then fixes it or closes it with a one-line reason

- **Close as done:** #121 (Music Reference waits are fixed in #122).
- **Superseded by #122:** PRs #107, #108 and #112, and issue #117 (the opening screen is chosen and shipped). Close after confirming nothing unique remains in them; carry any leftover idea into an issue.
- **PR #32 and issue #113:** the old 2-world visual catch-up. Superseded by #122 and v3.2. **Kevin decides:** close (recommended).
- **PR #111** (canonical character identity): check what #122's `assets/characters/milestone-dragon/` already covers. Keep only what is missing as a fresh small PR, or close.
- **#69 village review issues** (#74–#84, #86–#96): many are likely fixed or obsolete after #122's village. Re-test each on main at phone and desktop widths. Close the fixed ones with evidence; fix the real ones in one PR. Watch especially for: Settings skipping the grown-up hold (#74, #86), the star and coin totals (#90, #92, #95), and touch targets and clipping (#80, #84, #91, #93).
- **Older UI review issues** #52, #57, #64, #65: re-test and close or fix the same way.
- **Art and owner items** #71, #79, #85: check against the art Kevin already approved (title, layered village). Close what is done; list for Kevin what still needs his approval.
- **#70, #72, #73** (opening, main menu, adventure hub): compare with what shipped; close or narrow.

---

## D. Backlog (parked until World 1 ships; Kevin sets the order)
#97 skill check · #98 on-device usage log · #99 upload sheet music · #100 Music Library rethink · #101 practice games review · #102 easter eggs · #103 mastery encore (parked) · #104 journal companions · #105 favorite song · #106 dragon guide (Micaela).

Suggested first after the World 2 groundwork: **#101 practice games review**, because it pairs with the coin limits and the old-looking game screens. Then **#106 dragon guide** (Micaela asked for it).

---

## Review gates Claude applies to every PR
1. Engine block diff limited to the spec. Save names derived from `saveFormat()`, so no new storage literals and previews stay isolated. `migrate` keeps old saves working.
2. `sh tests/run_engine_tests.sh`, `bash tools/preview/test_build_site.sh`, and every browser test in `.github/workflows/tests.yml` pass locally and in CI at the exact head.
3. Child-facing: no old-game screens in the flow, readable on a phone, touch targets of 48px or more, grown-up actions behind the hold, learner names escaped.
4. Try to break it: replay and farm coins, quit and restart, switch learners, change the date, refresh mid-flow, use a locked world.
