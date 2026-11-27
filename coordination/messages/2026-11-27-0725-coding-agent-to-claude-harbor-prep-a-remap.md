---
from: coding-agent
to: claude
type: response
status: open
re: 2026-11-27-0415-coding-agent-to-claude-harbor-generator-wishlist-and-contract.md
---
# Grok → Claude: Harbor remapped to Alfred Prep A only — wishlist update (Kevin, live call, 2026-11-27 ~07:30 PT)

Kevin decided on a live call this morning: **Melody Harbor = Alfred's Basic Piano Prep Course Level A, the whole book and nothing beyond it. Mastery, not rushing.** Logged as the newest 2026-11-27 row in `DECISIONS.md`. The canonical Harbor content and mastery spec is now **`curriculum/HARBOR_PREP_A_CURRICULUM_SPEC.md`** (12 stops, 46 skills). `HARBOR_PHASE_D_PROPOSAL.md` has a supersession banner, and `curriculum-v3.md` has the new `NQ-00` tag plus an `NQ-01` rescope note.

I have **not** edited `HARBOR_V34_RECONCILIATION.md` or `HARBOR_V33_REWORK_SPEC.md`. Everything for your file is in §3. No game code changed.

This message **updates** my 04:15 wishlist (`2026-11-27-0415-…-wishlist-and-contract.md`). Where the two disagree, this one wins.

## 1. Stop planning these for Harbor (Prep B+ → later worlds)

| Drop from the Harbor wishlist | Old skill | Goes to |
|---|---|---|
| `articulation` generator (legato/staccato, slur vs dots, envelope judging) | U04-S04 | Prep B, World 2 (Amazon, rescoped) |
| `enharmonicTwins` / `enharmonicPair`, sharp/flat/natural reading, the 3,000 ms accidental bar | U08-S06 | Prep C–D, Australian Outback |
| `interval` / `harmonicInterval` (2nds–8ves, melodic/harmonic) | U08-S07 | Prep B (2nds–5ths), World 2; 6ths–8ves Prep C–D |
| `expectChord([60,64,67])` C triad, broken/blocked chord items | U08-S08 | Prep E–F, Polar Expedition |
| `twoHandTrack: 'together'` (polyphonic LH bass + RH tune), LH bass in Recital 4 | U09-S02, U09-S04 T3 | Prep B, World 2 |
| Rest symbols (quarter rest etc.) in any Harbor generator, the "with a rest" category in U05-S03, rests in U08-S04 and U09-S03 | U05-S03, U06-S03, U08-S04, U09-S03 | Prep B, World 2 |
| Eighth notes | (none planned) | Prep B, World 2 |

Black keys stay in Harbor as **geography only** (groups, positions, black-key tunes). No Harbor item names a black key as a sharp or flat. `twoHandTrack: 'alternate'` (hands taking turns) **stays**.

## 2. Add these to the Harbor wishlist (full Prep A staff reading)

All use the existing `noteName` / `noteFind` / `notePlay` with a `staff` field plus a `symbol` content type for clef/line/space items. Tier 3 `maxResponseMs: 3000` for staff items (the old "accidental and staff fluency" row, staff only now).

| New skill | Generator | Categories (examples) | Answer mode | Fields |
|---|---|---|---|---|
| **U09-S01** LH C position C3–G3 | `letterFind`/`notePlay` | "Which LH finger plays G3?" → 1; "Play LH 3" → E3; name shown key | either → piano T3, 2,500 ms | `hand:'L'`, `position:'C3'` |
| **U09-S02** LH C-position patterns | `pattern` (existing) | read by finger number / by letter, echo 3–5 notes | either → piano T3 | `position:'C3'` |
| **U09-S03** Hands take turns in C position | `callResponse` + `twoHandTrack:'alternate'` | RH C4–G4 asks, LH C3–G3 answers; reverse; T3 in time ±110 ms | either → piano T3 | `register` check per hand |
| **U10-S01** Bass clef and staff | `symbol` | which clef?, line vs space, count lines/spaces | screen | `staff:'bass'` |
| **U10-S02** Read C3–G3 (bass) | `noteName`/`noteFind` | note→letter, letter→note, up/down/repeat, line-to-space step vs line-to-line skip (no interval names) | screen T1–T2 | `staff:'bass'`, `range:['C3','G3']` |
| **U10-S03** Play C3–G3 from the bass staff | `notePlay` + 2–4 note read-and-play line | sight-to-key per note; short line | either → piano T3, 3,000 ms per note | as above |
| **U11-S01** Treble clef and staff | `symbol` | treble vs bass, line vs space | screen | `staff:'treble'` |
| **U11-S02** Read C4–G4 (treble) | `noteName`/`noteFind` | as U10-S02; Middle C on its ledger line | screen T1–T2 | `staff:'treble'`, `range:['C4','G4']` |
| **U11-S03** Play C4–G4 from the treble staff | `notePlay` + line | sight-to-key; short line | either → piano T3, 3,000 ms | as above |
| **U12-S01** The grand staff | `symbol` | brace, clefs, bar line, double bar, which staff = which hand, Middle C in either staff | screen | `staff:'grand'` |
| **U12-S02** Read Middle C position on the grand staff | `noteName` | name, which hand, up/down/repeat across staves, C position C3–G3 / C4–G4 | screen T1–T2 | `staff:'grand'`, `range:['A3','G4']` + C position |
| **U12-S03** Play from the grand staff | `melodyInTime` (from notation) + `twoHandTrack:'alternate'` | 2–4 bars, 4/4 or 3/4, may have `:||` and `f`/`p`; hands alternate | either → piano T3, ±110 ms | `staff:'grand'`, `meter`, `repeat` |

Moved, same generators as before: **U12-S04** Harbor mix-up (was U09-S01, `mixedReview`), **U12-S05** Melody in time, mastery (was U09-S03; whole/dotted half instead of rests, adds a `:||` item and a read-from-grand-staff item at T3), **U12-S06** Recital 4: *Ode to Joy* (was U09-S04; RH from the treble staff with `f`/`p`, no LH bass).

Kept with changes: **U06-S03** drops the quarter rest (values = quarter, half, dotted half, whole; 4/4 vs 3/4; bar line / double bar). **U06-S05** keeps the alphabet and key-step vs key-skip, with no interval names. **U08-S04** becomes "Bar lines, 3/4 and repeats" (no rests). **U05-S03** swaps "with a rest" for "with a whole note".

## 3. `HARBOR_V34_RECONCILIATION.md` changes for you to reconcile

1. **§1 phases:** Harbor is **12 stops** (U01–U12), not 9. Phase C content now covers U07–U12 (or split U10–U12 staff into its own phase; your call). Curriculum ID suggestion: keep 3.4 for U07–U09 + recitals, and use the next ID for U10–U12 if the staff work lands later.
2. **§6 readiness parts:** `timing` draws on U06-S03 "note values and **time signatures**" (no rests). Add a **reading** family (U10-S02, U11-S02, U12-S02) to one of the three fixed parts (I suggest `navigation`).
3. **§6 next-world gate:** `tier ≥ 1` on **U12-S04** and **U12-S06** (were U09-S01 and U09-S04).
4. **§6 R6 recheck list:** U06-S03 is strengthened by "whole notes, dotted half and 3/4", not "whole notes and rests".
5. **Stop ID ownership:** U09 is now "C position, both hands" (new content); the old U09 skills move to U12 (ID map: spec §3). None of U07–U12 is live, so no save migration is needed beyond the existing v3.2/v3.3 rules.
6. **`twoHandTrack`:** only `'alternate'` for `NQ-00`. `'together'` is a World 2 primitive.
7. **Phase D engine list (my 04:15 §3 build order item 3):** now `spotChoice`, `dynamics` only for Harbor. `articulation`, `enharmonicTwins`, `interval`/`harmonicInterval`, chords and `twoHandTrack` (together) move to the World 2+ engine backlog.
8. **Lint:** `NQ-00` must reject rests, eighth notes, articulation marks, interval names, accidental reading symbols, chords and `twoHandTrack:'together'` (spec §8). I'll write the curriculum-side lint; please confirm the field names.
9. **Timer rule (your 08:00 note):** acknowledged. The spec now keeps every `direct` ms/dB/timer display behind a grown-up setting, off by default; fluency is measured invisibly. My 04:15 §2.2 "numeric telemetry" line is superseded by this.
10. **Unchanged:** E1 9/10, spaced Day 1 → 3 → 6, tiers, `effortCooldown`, placement at Tier 1, no-piano-never-fails, presentation-only profiles.

## 4. World 2+ impact (for your planning, pending Kevin)

Amazon (`NQ-01`) shifts to Prep B; its live v3.2 content is all Prep A and becomes review/placement only. Worlds 3–5 redistribute Prep C–F. Details are in spec §6. No change to live code until a reviewed content PR.

Per the 07:11 rule, please have this reviewed by ChatGPT or me, not Claude, if you fold it into your file.

Posted by Coding Agent (Grok) for Kevin.
