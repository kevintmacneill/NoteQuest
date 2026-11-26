# Melody Harbor (World 1) expansion spec (Coding Agent, 2026-11-26)

**Status:** owner-approved direction (DECISIONS.md, 2026-11-26 08:34–08:37 PT). This document is the concrete World 1 target. It **builds on** `HARBOR_V33_REWORK_SPEC.md` and does **not** replace it. Keep E1–E7, R1–R6, and existing skill IDs `NQ-00-U01-S01` through `NQ-00-U06-S03` for save compatibility.

**Audience and pacing goal:** Harbor stays gentle enough for **Zoe (5, beginner)** at the start and becomes demanding enough by the last stops to challenge **Micaela (7, Alfred Prep A)**. At about 10–15 minutes a day, a motivated learner should need a genuine **2–4 weeks**, not a day or two, to finish World 1. World 2 (Amazon) waits until Harbor is playable and solid.

## Why this expansion
The v3.3 rework (13 child-playable skills, one generator per skill, `secure` after 2 passing days, no real songs, pitch and rhythm never combined) is still clearable in a weekend. Kevin asked for a first world that is a real beginner piano foundation, and approved all four levers below ("Add them in").

## Owner requirements (Kevin, 2026-11-26)
1. **Expanded musical depth and Harbor Recitals.** Keep Zoe's gentle start (groups of 2 and 3 black keys, high and low, a steady beat, and up / down / same by ear). Then add **black-key mini-tunes**; expand rhythm to **quarter rests and whole notes**; expand keys to **both hands around Middle C** (right-hand C–D–E and left-hand C–B–A, then 5-finger C–D–E–F–G); **combine pitch and rhythm in time** (4–8 note melodies with a count-in); and place a **Harbor Recital / Boss Song** at the end of every 1–2 units, played with the real-piano Song Station engine.
2. **Three-tier skill mastery.** Guided / Slow (Tier 1) → Real Piano / Mixed (Tier 2) → Mastery (Tier 3: tighter intervals, tempo, no visual hints, mixed prompts). No one-and-done flat check.
3. **Real pacing and retention.** `secure` uses spaced passing days (**Day 1 → Day 3 → Day 6**, not two days in a row). Gentle **daily new-stop pacing** so World 1 cannot be speedrun in 48 hours, while practice, song replays, and games stay free. **Mixed-skill review quizzes** pull from earlier Harbor stops.
4. **Mixed interactions inside each skill and quiz.** Blend **listen → identify → play on the real piano → echo back** in the same stop. `highLow`, `keyboardSide`, and `durationCompare` include real-piano play answers, with on-screen keys as the fallback, not only A/B buttons.

v3.3 lesson-shape rules still stand: teach first; varied questions; mistakes matter (E1–E2); piano first (E7); grown-up checks never block the child (E4), including at the end-of-world gate; 9 of the first 10 first-try answers to pass a scored check.

## How this sits with v3.3 and PR #152
Do not throw away work already in flight.

| Phase | What | Version | Notes |
|---|---|---|---|
| **A** | Engine E1–E4 already in draft [PR #152](https://github.com/kevintmacneill/NoteQuest/pull/152) (9/10 pass, extra question after a miss, no consecutive repeats, non-blocking grown-up checks) | Curriculum **3.3+** gate, as in the PR | **Finish and land #152 as written.** Do not widen its scope to this expansion. E1's current line "Secure still needs 2 passing days" is superseded later, in Phase C, not by rewriting #152 mid-review. |
| **B** | v3.3 Harbor content: teach cards, guided attempts (R3), generators and variety rules (E5–E7, R2, R4, R5), IDs `U01`–`U06` | Curriculum **3.3** | Ship U01–U06 so Harbor is honestly playable. While doing this, apply this spec's **mixed-interaction** upgrades to the existing skills (`highLow`, `keyboardSide`, `durationCompare`, and the listen / identify / play / echo blend) so those skills do not need a second rewrite. |
| **C** | This expansion: new skills and stops, recitals, three-tier mastery, spaced `secure`, daily new-stop pacing, mixed reviews | Curriculum **3.4** (or the next ID after 3.3 lands) | Add new IDs cleanly. Keep every `NQ-00-U01`–`U06` skill ID. Preserve earned v3.2 / v3.3 state the same way R6 already does (`recheck: true` where a skill got materially stronger; never lower an earned state). |

Claude should fold and reconcile this document with the v3.3 spec and with #152's exact head. ChatGPT should sequence A → B → C so nothing in flight is reworked twice.

**Amazon note:** v3.2 placed *Hot Cross Buns* as a late Amazon performance skill. After this expansion it is a Harbor Recital. When Amazon is eventually reworked, treat that song as review or as a richer arrangement, not as a first-time song.

## World 1 at a glance
- **9 stops:** `NQ-00-U01` through `NQ-00-U09`.
- **25 child-playable skills** plus **5 non-blocking grown-up checks** plus **4 Harbor Recital Boss Songs**.
- **Recitals** are the last child-playable skill of U03, U06, U08, and U09. They appear as a special recital badge on that stop, not as extra map stops.
- **Song Station songs used:** a new black-key arrangement of *Hot Cross Buns*; then the existing catalog songs `hcb` (*Hot Cross Buns*), `mary` (*Mary Had a Little Lamb*), and `ode` (*Ode to Joy*) from `index.html`. *Au Clair de la Lune* (`clair`) and *Lightly Row* (`row`) stay free-play songs in Song Station once their notes have been introduced. No need to invent new public-domain pieces except the black-key arrangement.

| Stop | Child-facing title | Child-playable skills | Grown-up checks | Recital |
|---|---|---|---|---|
| U01 | Meet the piano | S01–S03 (existing IDs) | — | — |
| U02 | Sit comfortably | — | S01–S03 (existing IDs; never block) | — |
| U03 | Listen and play | S01–S03 (existing) + **S04** black-key mini-tunes | — | **S05 Recital 1: Black-Key Buns** |
| U04 | Loud, soft, short, and long | S02 (existing; mixed piano answers) | S01, S03 (existing) | — |
| U05 | Fingers and Middle C | S01–S03 (existing) + **S04** mixed review | — | — |
| U06 | C, D, and E | S01–S03 (existing; S03 adds whole notes and quarter rests) | — | **S04 Recital 2: Hot Cross Buns** |
| U07 | The left hand | **S01–S03** (new) | — | — |
| U08 | Five-finger songs and playing in time | **S01–S04** (new) | — | **S05 Recital 3: Mary Had a Little Lamb** |
| U09 | Harbor review | **S01–S03** (new) | — | **S04 Recital 4: Ode to Joy** (world boss) |

## Three-tier mastery
Every child-playable skill, including recitals and mixed reviews, uses three scored tiers. Teach-then-guided-practice (R3) still happens before Tier 1. Acknowledging a teach card is never evidence.

| Tier | Child-facing name | What it feels like | Pass bar |
|---|---|---|---|
| **1 Guided / Slow** | "Let's try it slowly" | Slow tempo, 2–3 guided unscored tries first, a highlight *after* a miss (never before the first try is scored). Shorter patterns. On-screen keys are a comfortable fallback. | E1: 9 of the first 10, first try |
| **2 Real Piano / Mixed** | "Now on your piano" | Real piano first (E7). Mixed prompts in the same round: listen, identify, play, and echo. Standard beginner tempo. Fewer hints. | E1 |
| **3 Mastery** | "Show what you know" | Tighter ear intervals or tempo, **no visual hints**, mixed prompts (including a few from a nearby related skill). Recitals: performance tempo, count-in, pitch and rhythm both judged. | E1 |

**Progression.** Tier 2 unlocks after a Tier 1 pass; Tier 3 after a Tier 2 pass. A learner may climb more than one tier in the same session. Tiers never spend the daily new-stop budget.

**States (mapped onto the existing engine, no new learner-facing jargon).**
- First Tier 1 pass → `developing` (practice at ≥ 60% can still set `developing` as it does today).
- First Tier 3 pass → records **Day 1** of spaced mastery evidence (the skill is "learned," but not yet `secure`).
- Spaced Day 3 and Day 6 passes at Tier 3 (or a mixed review that covers that skill at mastery level) → `secure`.

## Spaced retention and daily pacing
These rules apply to **Melody Harbor (World 1)** first. Later worlds should follow the same model once Harbor is the template, but this spec does not reopen Amazon.

### Secure (supersedes E1's "2 passing days" for Harbor, in Phase C)
A child-playable skill becomes `secure` after **three passing checks on spaced calendar days**:
- The first Tier 3 pass is **Day 1** for that skill.
- The second passing check counts only on or after **Day 3** (at least one full calendar day after Day 1).
- The third counts only on or after **Day 6** (at least two full calendar days after the second, or five after the first, whichever the learner reaches later).

Missed days do not reset the window; the next eligible day simply waits. Day-3 and Day-6 reviews should be mixed-prompt mastery items, not a repeat of the exact same 10 questions. A **mixed-skill review quiz** that covers the skill at mastery level may satisfy a due Day 3 or Day 6 pass, so the child is not buried in separate reviews.

Grown-up checks are unchanged: they never block, never pay coins, and are not part of `secure`.

### Daily new-stop pacing
- At most **one new Harbor stop** unlocks per local calendar day.
- **U02 does not use that budget and never gates U03.** The three comfortable-setup checks stay visible as "for a grown-up" items. After U01, the next child stop is U03 on the following day.
- A Harbor Recital is part of its unit. Once that unit's earlier child-playable skills have a Tier 1 pass, the recital may be started the same day. The **next** unit unlocks on the following calendar day after a Tier 1 pass on the recital (or, for units with no recital, after a Tier 1 pass on every child-playable skill in the stop).
- **Never locked by the daily cap:** replaying practice on any unlocked skill, climbing tiers, taking due reviews, replaying any unlocked recital or Song Station song, playing the practice games, caring for pets, and exploring the village.

Together with 9 stops and Day 6 `secure`, a 10–15 minute daily habit naturally fills **about 2–4 weeks**. A determined child still cannot clear World 1 in 48 hours. A younger beginner can linger on Tier 1 and 2, replay songs, and play games without being pushed off the map.

### Mixed-skill review quizzes
- **U05-S04 "Mix it up"** reviews U01–U04 (black keys, high/low, sides, contour, beat, echo, short and long).
- **U09-S01 "Harbor mix-up"** reviews the whole world (both hands, 5-finger notes, rhythm with rests and whole notes, and short in-time phrases).

Each review is a mixed-interaction 10-item check (listen, identify, play, echo) that follows the same three tiers. Categories from earlier generators must appear; no consecutive duplicate signatures (R4).

## Mixed interaction matrix
Every child-playable skill's scored rounds should draw from more than one of these moves, not ten copies of the same prompt:

| Move | Child-facing idea | Typical evidence |
|---|---|---|
| **Listen** | "Listen…" | Ear-only: higher/lower, up/down/same, short/long, a short rhythm or tune |
| **Identify** | "Which one?" / "What is this?" | Choose a picture, side, finger, letter, or note value |
| **Play** | "Play it on your piano" | Real piano first; on-screen keys as fallback (E7, R5) |
| **Echo** | "I'll play, then you play it back" | 2–5 notes, or a short rhythm, judged in order (timing judged only when the skill is a rhythm or recital skill; R5) |

Required upgrades to existing v3.3 types (Phase B, so they stick):

- **`highLow` (U01-S02):** mix "Which is higher / lower?", "Play a high note" / "Play a low note", and "Play a note higher (or lower) than this one." Do not leave play items as every third question only.
- **`keyboardSide` (U01-S03):** keep the v3.3 spatial items (R2) and make **playing** on the real piano a first-class category: "Play a note on the left side," "Play a note on the right side," and "Play one on the left, then one on the right."
- **`durationCompare` (U04-S02):** mix "Which is longer / shorter?" with **play** answers: "Play a short note," "Play a long note and hold it," "Play a note that lasts longer than this one."

Missing or denied mic permission switches to on-screen keys with a notice (R5). Never self-confirmation.

## Stop by stop
IDs in **bold** are new. All other Harbor IDs are the v3.3 IDs, with stronger content where noted. Every playable skill gets a teach card. Teach `say` lines are at most two short sentences, warm, and free of developer wording. "Piano" means the real piano, with keys as the fallback.

### U01 Meet the piano (Zoe's start) — existing IDs
| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Find groups of two and three black keys | "Black keys come in groups of 2 and 3. Like twins and triplets!" | Keep `keyGroup` v2 and R2 (group vs place). Mix find, play, and a short "play two keys from this group" echo. Keyboard spans ≥ 2 octaves. |
| **S02** High and low ends | "Right is high like a bird; left is low like a bear." | `highLow` with the mixed matrix above. The listening gap still narrows across the round (v3.3: 12 down to 5 semitones; tighter still at Tier 3). |
| **S03** Left and right sides | "Going right, the sounds go up." | `keyboardSide` as in R2, with real-piano play answers as a full category. |

### U02 Sit comfortably (grown-up checks; never block) — existing IDs
Keep the v3.3 checklists and child teach cards:
- **S01** Bench distance (elbows a little in front, feet flat, sit near the front of the bench).
- **S02** Relaxed arms and wrists (shoulders down, wrists level, five notes without stiffening).
- **S03** Curved fingers and stopping if it hurts (round "bubble" hand, fingertips, tell a grown-up if anything hurts).

### U03 Listen and play — existing S01–S03, plus new S04 and Recital 1
| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Up, down or same | "Listen: do the notes climb up, slide down, or stay the same?" | `contourListen`, 2–3 notes. Mix listen-and-identify with "play a little tune that goes up" (or down, or stays the same) and a short echo. Steps get smaller across the round; tighter at Tier 3. |
| **S02** Steady beat | "A beat is steady like a heartbeat." | `rhythmTap`: 4 steady quarter-note beats with a click, then without it, at 60–80 bpm. Mix tapping, clapping back, and playing the pulse on one piano key. |
| **S03** Echo 2–3 notes | "I play, then you play it back." | Implemented `echo`: 2 notes, then 3, from C–D–E around Middle C, judged in order (R5). Mix echo with "play the letters you hear." |
| **S04** Black-key mini-tunes **(new)** | "The black keys make a cozy little song. Let's play a tiny tune on them." | Short 3–5 note patterns on a group of 2 or a group of 3 black keys (listen, echo, then play from a simple letter-free picture). Not a full song yet. Patterns stay inside one group. |
| **S05 Recital 1: Black-Key Buns** **(new)** | "You know this song! Play *Hot Cross Buns* on the three black keys." | Harbor Recital / Boss Song. Arrangement of *Hot Cross Buns* on the group of three black keys (**A♯–G♯–F♯**, same steps as E–D–C). Use the Song Station engine, piano first. New catalog id suggested: `hcb-black`. |

### U04 Loud, soft, short, and long — existing IDs
| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Loud and soft | "Forte is loud; piano is soft." | Grown-up check, Phase 1 (mic loudness remains Phase 2). Checklist: plays one note loud then soft on request, three times. |
| **S02** Short and long | "Some notes are short like a hop; some are long like a slide." | `durationCompare`: mixed pairs (1 vs 2, 1 vs 4, 2 vs 4 beats) asking "longer?" or "shorter?", **plus play answers** as in the matrix above. |
| **S03** Make up a 3-note question and answer | "Play 3 notes to ask, then 3 to answer." | Grown-up check. Checklist: plays a 3-note "question" and a different 3-note "answer." |

### U05 Fingers and Middle C — existing S01–S03, plus a mixed review
| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Finger numbers | "Thumbs are 1, pinkies are 5, on both hands." | `finger`: both hands, all 5 numbers, mixed "Which finger is 3?" and "What number is this finger?", plus "Hold up finger 2" / "Play with finger 1." |
| **S02** Find Middle C | "Middle C is the white key just left of the two black keys, in the middle." | `notePlay` / `noteFind`: "Play Middle C" (the exact octave counts), mixed with "Play any C," "Find Middle C," and a short echo that starts on Middle C. |
| **S03** Rhythm echo with no words | "Listen, then clap it back." | `rhythmTap`: quarter and half notes, 2 measures, no words on screen. Mix clap-back and play-back on one key. |
| **S04** Mix it up **(new)** | "Let's play a little bit of everything you've learned so far." | Mixed-skill review of U01–U04. Listen, identify, play, and echo; categories from those stops; no consecutive duplicates. |

### U06 C, D, and E — existing S01–S03, plus Recital 2
| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Name C, D, and E | "C is left of the 2 black keys, D is between them, E is on the right." | `letterFind`: C, D, or E, first in any octave, then "the one nearest Middle C." Mix find, name, and play. |
| **S02** Play C–D–E patterns | "Read the letters, then play them." | `notePlay` sequence: 3–5 notes from C, D, and E (for example C D E D C), judged in order. Mix read-and-play with echo. Timing is not judged here (R5). |
| **S03** Quarter, half, and whole notes, and quarter rests | "A quarter note gets 1 beat, a half note gets 2, a whole note gets 4, and a quarter rest is a 1-beat quiet." | Beats `symbol`, expanded from v3.3: "How many beats?", "Which note gets 2 beats?", "Which one is the quiet?", and "Count this short line." Pictures only use values already introduced: quarter, half, whole, and quarter rest. Mix identify with tapping or playing the line, honoring rests. |
| **S04 Recital 2: Hot Cross Buns** **(new)** | "Now play *Hot Cross Buns* on the white keys, with C, D, and E." | Harbor Recital / Boss Song. Existing Song Station song `hcb` (C position, right hand). Piano first. This is the same tune as Recital 1, now on C–D–E. |

### U07 The left hand — all new
Right-hand C–D–E is already in place. This stop adds the left hand around Middle C: C, B, and A (thumb, pointer, and middle finger, thumb on Middle C).

| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Find C, B, and A with the left hand | "Your left thumb sits on Middle C. Next door are B and A, walking down." | Find, name, and play Left-hand C, B, and A around Middle C. Mix with "Which left-hand finger plays B?" |
| **S02** Left-hand C–B–A patterns | "I'll play a little left-hand tune; then you play it back." | 3–5 note `notePlay` / `echo` patterns from C, B, and A, judged in order. |
| **S03** Hands taking turns | "Right hand asks; left hand answers." | Short call-and-response: a 3-note right-hand C–D–E idea, then a 3-note left-hand C–B–A answer, or the other way around. One hand at a time. |

### U08 Five-finger songs and playing in time — all new, plus Recital 3
| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Find and name F and G | "F and G live just past E. Now your right hand can use all five fingers." | Find, name, and play F and G nearest Middle C, then any F or G. Completes right-hand 5-finger C–D–E–F–G. |
| **S02** Five-finger patterns | "Walk up and down the five keys under your right hand." | 3–5 note patterns from C–D–E–F–G, mostly right hand. Left-hand 5-finger F–G–A–B–C (below Middle C) may appear at Tier 3 for a bigger stretch; it is not required to pass Tier 1 or 2. |
| **S03** Play a melody in time | "I'll count you in. Play the notes and the rhythm together." | **Pitch and rhythm combined:** 4–8 note melodies with a count-in, judged for both letter order and timing (existing rhythm tolerances). Values from U06 (quarters, halves, wholes, quarter rests). Slow at Tier 1; beginner tempo at Tier 2; slightly brighter and with no highlights at Tier 3. |
| **S04** Notes and rests in a line | "Play the sound and honor the quiet." | Read and play short 1–2 measure lines that mix whole, half, and quarter notes with quarter rests, on a repeated pitch or a simple C–G tune. |
| **S05 Recital 3: Mary Had a Little Lamb** **(new)** | "You can play a real song with C, D, E, and G." | Harbor Recital / Boss Song. Existing Song Station song `mary` (C position, right hand). Piano first. |

### U09 Harbor review — all new, plus Recital 4 (world boss)
| Skill | Teach (say) | What the child does |
|---|---|---|
| **S01** Harbor mix-up | "A little of everything you've learned in Melody Harbor." | Whole-world mixed review: black keys, high/low, both hands around Middle C, 5-finger notes, rhythm with rests and whole notes, short in-time phrases. Listen, identify, play, and echo. |
| **S02** A short two-hand idea | "One hand can hold a long note while the other plays a little tune — or they can take turns." | A short beginner two-hand or alternating-hands pattern (for example, left hand holds whole-note C while the right hand plays a 4-note tune, or phrase-by-phrase turns). Tier 1 may be hands-separate; Tier 3 is the combined version, slowly. |
| **S03** Melody in time, mastery | "Count-in, then play a longer little song — notes, rhythm, and the quiets." | 6–8 note combined pitch-and-rhythm melody with a count-in, including at least one quarter rest or whole note. This is the hardest non-recital Harbor skill; it should stretch Micaela without stranding Zoe (Tier 1 stays slow and may repeat a shorter phrase). |
| **S04 Recital 4: Ode to Joy** **(new)** | "This is your Melody Harbor concert song. Take a bow when you're done!" | Harbor Recital / Boss Song, end of World 1. Existing Song Station song `ode` (C position, right hand, 5-finger). Piano first. Performance tempo and no visual hints at Tier 3. *Lightly Row* (`row`) may be offered as a free-play encore in Song Station after this recital, not as a required fifth boss song. |

## Recital rules (all four)
- Use the **Song Station** real-piano engine (mic first, on-screen keys as fallback).
- **Tier 1:** slow, phrase by phrase if needed, modest highlights *after* a miss.
- **Tier 2:** whole song at a gentle beginner tempo, piano first, fewer hints.
- **Tier 3:** performance tempo, count-in, no visual hints, **pitch and rhythm both judged**.
- A confidently heard wrong note is a miss; timeout, low-confidence capture, or replay of the prompt is re-offered, not scored (R5).
- Passing Tier 1 on the recital is enough to unlock the next stop the following day. Tiers 2 and 3, and spaced `secure`, can happen over the following days while new stops slowly open.

Suggested Song Station ids: `hcb-black` (new arrangement), `hcb`, `mary`, `ode` (already in `index.html`).

## End-of-world check (readiness)
v3.3 R1 asked every child-playable Harbor skill to appear exactly once. That list would be too long once Harbor has 25 skills and 4 recitals.

**Proposed World 1 gate (Claude should reconcile with R1 and the existing Journey thresholds):**
- The compact readiness check covers each **family** at least once: keyboard geography, ear (high/low or contour), beat and note values (including a rest or whole note), right-hand C–D–E–F–G, left-hand C–B–A, and a short in-time melody.
- **U09-S01** (Harbor mix-up) and **U09-S04** (Ode to Joy, at least Tier 1) are required evidence for opening the next world.
- Grown-up items stay excluded (owner decision, 2026-11-25). The next world may open with grown-up checks still pending.
- The journey gate's own thresholds (`J_ITEMS` / `J_PASS`) stay unchanged unless Kevin decides otherwise. E1's 9/10 rule still applies to lesson checks, reviews, transfers, and the recital checks, not to a redesigned Journey Readiness.

## Versioning, IDs, and tests
- **Do not edit** `HARBOR_V33_REWORK_SPEC.md` except to point here if Claude later wants a one-line cross-reference. This file is the expansion authority.
- **Curriculum ID:** 3.4 (or the next ID after 3.3). `isGameCurriculum` should accept 3.x.
- **Kept IDs:** `NQ-00-U01-S01`…`S03`, `NQ-00-U02-S01`…`S03`, `NQ-00-U03-S01`…`S03`, `NQ-00-U04-S01`…`S03`, `NQ-00-U05-S01`…`S03`, `NQ-00-U06-S01`…`S03`.
- **New skill IDs:** `NQ-00-U03-S04`, `NQ-00-U03-S05`, `NQ-00-U05-S04`, `NQ-00-U06-S04`, `NQ-00-U07-S01`, `NQ-00-U07-S02`, `NQ-00-U07-S03`, `NQ-00-U08-S01`, `NQ-00-U08-S02`, `NQ-00-U08-S03`, `NQ-00-U08-S04`, `NQ-00-U08-S05`, `NQ-00-U09-S01`, `NQ-00-U09-S02`, `NQ-00-U09-S03`, `NQ-00-U09-S04`.
- **New stop IDs:** `NQ-00-U07`, `NQ-00-U08`, `NQ-00-U09`.
- Placeholder prompt text stays banned (v3.3 lint).
- Variety lint (R4) applies to every new generator, including recitals' practice prompts and both mixed reviews.
- Version safety follows R6: keep v3.2 / v3.3 state and history; mark materially stronger skills `recheck: true`; failing a recheck does not lower an earned state.
- Tests: per-skill variety; three-tier unlock order; Day 1 / Day 3 / Day 6 `secure` (including "two days in a row does not grant `secure`"); daily new-stop cap (with practice, songs, and games still free); U02 never gating U03; mixed-review evidence counting toward a due spaced review; recital scoring (pitch + rhythm at Tier 3); a v3.3 saved profile loading into 3.4 without lost progress.
- Kevin plays the finished Harbor on the tablet before Amazon is reworked the same way.

## Not in this spec
- Amazon or any world after Harbor.
- Mic loudness (still Phase 2).
- Changing Journey Readiness thresholds (`J_ITEMS` / `J_PASS`).
- Game-code changes. This document is coordination only; implementation follows the phase table above.
