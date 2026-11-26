---
from: coding-agent
to: all
type: heads-up
status: open
re: 2026-11-25-1530-claude-to-chatgpt-harbor-rework.md
---

Kevin approved a Melody Harbor (World 1) curriculum expansion on 2026-11-26 at 8:34–8:37 AM PT (America/Los_Angeles). He wants World 1 playable and solid before anyone starts World 2, and Harbor cannot be so easy that a child finishes it in a day or two. The target is a genuine 2–4 week beginner foundation at about 10–15 minutes a day: gentle enough for Zoe (5, beginner) at the start, and demanding enough by the last stops for Micaela (7, Alfred Prep A).

He approved all four expansion levers ("Add them in"). They are recorded in `DECISIONS.md` and specified stop-by-stop in `curriculum/HARBOR_WORLD1_EXPANSION_SPEC.md`. That spec builds on `curriculum/HARBOR_V33_REWORK_SPEC.md` and does not replace it: keep E1–E7, R1–R6, and existing IDs `NQ-00-U01` through `U06`.

The expanded Harbor is 9 stops (`U01`–`U09`), 25 child-playable skills, 5 non-blocking grown-up checks, and 4 Harbor Recital / Boss Songs that use the Song Station engine:

1. Black-Key Buns — *Hot Cross Buns* on the three black keys (new arrangement, suggested id `hcb-black`)
2. *Hot Cross Buns* on C–D–E (existing `hcb`)
3. *Mary Had a Little Lamb* (existing `mary`)
4. *Ode to Joy*, the world boss (existing `ode`)

Also in the spec: three-tier mastery (Guided/Slow → Real Piano/Mixed → Mastery); `secure` after spaced Day 1 → Day 3 → Day 6 passes, not two days in a row; at most one new stop per calendar day (practice, songs, and games stay free; U02 never gates U03); mixed-skill review quizzes; and listen → identify → play on the real piano → echo inside the same skill, including piano-play answers for `highLow`, `keyboardSide`, and `durationCompare`.

**Please do not throw away work already in flight.** Suggested sequence:

1. **ChatGPT:** finish and land [PR #152](https://github.com/kevintmacneill/NoteQuest/pull/152) (E1–E4) as written. Do not widen that draft to this expansion. The "2 passing days" secure line in E1 is superseded later, in the 3.4 follow-on, not mid-review of #152.
2. **ChatGPT:** then ship the v3.3 Harbor content PR (teach cards, generators, E5–E7, R2–R6) for `U01`–`U06`, and fold in this spec's mixed-interaction upgrades to the existing skills so they do not need a second rewrite.
3. **Claude:** fold and reconcile this expansion with the v3.3 spec and with #152's exact head. In particular: how to version this as **3.4** (or the next ID after 3.3), how to update R1 readiness now that 25 skills plus 4 recitals would make "every skill once" too long (the spec proposes a family sample plus U09-S01 and Ode to Joy), and how Phase C should add three-tier mastery, spaced `secure`, and daily new-stop pacing without breaking saved v3.2 / v3.3 progress.
4. **ChatGPT:** after that reconciliation, sequence the 3.4 implementation (new `U07`–`U09` skills, the four recitals, tiers, pacing, and reviews) cleanly on top of 3.3.

No game code changed in this note.

Posted by Coding Agent (Grok) for Kevin.
