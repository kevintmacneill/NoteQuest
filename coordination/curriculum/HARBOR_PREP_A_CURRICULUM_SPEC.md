# Melody Harbor (NQ-00) — Prep A curriculum spec (canonical)

**Owner:** Coding Agent (Grok), Curriculum Architect (DECISIONS 2026-11-27).
**Decision:** Kevin, live call, 2026-11-27 ~07:30 PT: **Melody Harbor = Alfred's Basic Piano Prep Course Level A — all of it, and nothing beyond it. Full book, mastery not rushing.**
**Status:** canonical Harbor **content and mastery** spec. It replaces the Harbor scope in `HARBOR_PHASE_D_PROPOSAL.md` (Part 2 extras), `HARBOR_WORLD1_EXPANSION_SPEC.md` (U07–U09 shape) and the 2026-11-27 04:15 generator wishlist where they disagree.
**Engine contract:** `HARBOR_V34_RECONCILIATION.md` (Claude) stays the engine authority and is **not** edited here. `HARBOR_V33_REWORK_SPEC.md` stays the Phase A/B baseline and is not edited. Every engine-side consequence is listed in §7 for Claude to reconcile (message `messages/2026-11-27-0725-coding-agent-to-claude-harbor-prep-a-remap.md`).
**No game code.** This is a coordination document. Alfred is a reference and mapping only; exact page equivalence is still **not asserted** (curriculum-v3 C1 / H-03).

---

## 1. World 1 theme and Alfred tag

| Field | Value |
|---|---|
| World | **Melody Harbor** (`NQ-00`) |
| Theme | Sunlit teal harbor, a lighthouse with a clef motif, boats, sea otters and seals. "A place to begin with no intimidation." Start by ear and touch, then learn to read: by the lighthouse you can read and play Middle C position from the grand staff. |
| Focus | The **whole first piano book**: keyboard geography, healthy hands, finger numbers, steady beat and note values (quarter, half, dotted half, whole; 4/4 and 3/4; bar lines; repeat signs), `f`/`p`, white-key letters A–G, Middle C position and C position, and **first bass, treble and grand staff reading**. |
| `alfredRef` tag | **`Alfred's Basic Piano Prep Course Level A — full book, mastery not rushing`** (replaces "Before Prep A / accessible entry") |
| Length | 2–4 weeks of real mastery work. No daily stop cap; `effortCooldown` handles fatigue. |
| Recitals | 4 Recital Stage songs: *Black-Key Buns* → *Hot Cross Buns* → *Mary Had a Little Lamb* → *Ode to Joy* (world boss, read from the staff). |
| Exit proof | A learner who clears Harbor can read and play Middle C position and C position melodies from the bass, treble and grand staff, in time, with `f`/`p`, on a real piano. |

## 2. Universal contract (unchanged; applies to every skill)

- **Pass bar:** 9 of the first 10 right on the first try, every tier, including recitals and reviews (E1). A miss adds an unscored extra item, up to +5 (E2). No repeat twice in a row; every category ≥ 2 per 10 (E3/R4).
- **Mastery (`secure`):** a Tier 3 pass on Day 1 → Day 3 → Day 6. A mixed review can count toward a due day.
- **No visible lesson timer** (DECISIONS 2026-11-27): response times are measured invisibly for Tier 3 fluency and `effortCooldown`; no timer, countdown or ms/dB number shows in any profile unless a grown-up setting (off by default) turns it on. Every "ms", "timer" or "meter" in a `direct` presentation below is behind that setting.
- **Universal metrics are never reduced for age.** Only presentation changes: `explorer` (~4–5 and any non-reader), `standard` (~6–10), `direct` (teens/adults). Presentation never reaches scoring (lint rule).
- **Fluency (Tier 3 and Day 3/6 reviews):** keyboard geography, letters and fingers `maxResponseMs: 2500`; staff reading `maxResponseMs: 3000`. Slow but correct = first-try miss ("Right key — now quicker"). Tiers 1–2 untimed (20 s R5 timeout only).
- **Rhythm:** ±110 ms at Tier 3, recitals and reviews (proposed ±160 T1 / ±130 T2, same for every profile).
- **Real-instrument proof:** Tier 3 play items are heard on the real piano (mic or MIDI); ≥ 5 of 10 Tier 3 items are play/echo where an honest play form exists. **No piano never fails:** Tiers 1–2 work on screen; Tier 3 shows "Connect your piano to show mastery".
- **Placement:** every stop proven in placement is credited at once, at Tier 1. Mastery still needs Day 1 → 3 → 6.
- **Pacing:** `effortCooldown` replaces the 1-stop-a-day cap (DECISIONS 2026-11-27).
- **Generic tiers:** T1 Guided/Slow (2–3 unscored guided tries, highlight only after a miss); T2 Real Piano/Mixed (listen/identify/play/echo mixed); T3 Mastery (no visual hints, full visible span, up to 2 of 10 items from a related skill).
- **Answer modes:** `screen` = on-screen only; `either` = on-screen or piano; `piano` = real piano (mic/MIDI) at T3 with the no-piano rule above.
- **Holiday-aware calendar** (DECISIONS 2026-11-27): seasonal and holiday repertoire is a cross-world product requirement, not a Harbor-only extra. When the calendar surfaces Christmas, Easter and other Christian observances (plus cultural holidays such as Day of the Dead and the Fourth of July), Harbor Song Station and Recital material must stay within Prep A skills and correlate to the student's current level — the same idea as Alfred's Christmas, Hymn and Patriotic books. This does not add, remove or remap any of the 12 stops or 46 skills in this spec.
- **Prep A only:** no item in Harbor may use a rest symbol, an eighth note, legato/staccato marks, interval names (2nd–8ve), sharps/flats/naturals as reading symbols, blocked chords, or both hands sounding at once. Black keys are played as **geography** (groups, positions), never named as sharps/flats. (Lint: §8.)

## 3. Stop map (12 stops, 46 skills)

| Stop | Title | Skills | Prep A thread |
|---|---|---|---|
| U01 | Meet the piano | 3 | Keyboard, black-key groups, high/low, left/right |
| U02 | Sit comfortably (`pace:false`, never gates) | 3 | Posture and healthy hands |
| U03 | Listen and play + Recital 1 | 5 | Up/down/same, steady beat, echo, black-key tunes |
| U04 | Loud, soft, short and long | 3 | `f`/`p`, long/short, musical question/answer |
| U05 | Fingers and Middle C + mixed review | 4 | Finger numbers, Middle C, rhythm echo |
| U06 | C, D and E + Recital 2 | 5 | White keys C–D–E, note values, 4/4 & 3/4, A–G alphabet |
| U07 | The left hand (Middle C position LH) | 3 | LH C4–B3–A3, hands take turns |
| U08 | Five-finger songs + Recital 3 | 5 | F and G, RH C–G, melody in time, bar lines/3/4/repeats |
| U09 | C position, both hands | 3 | LH C position C3–G3, hands take turns in C position |
| U10 | Bass staff | 3 | Bass clef, lines/spaces, C3–G3 read and play |
| U11 | Treble staff | 3 | Treble clef, C4–G4 read and play |
| U12 | Grand staff + world boss | 6 | Grand staff, Middle C position from notation, review, Recital 4 |

Counts: 46 skills = 3 non-gating posture skills + 4 recitals + 2 mixed reviews + 37 core skills. (Previous unified plan: 40 skills, U01–U09.)

### ID migration from the 04:15 wishlist (none of U07–U12 is live; live v3.2 has U01–U06 only)

| Old ID (planned 3.4 / Phase D) | New |
|---|---|
| U04-S04 Smooth and bouncy | **Removed** → Prep B (§5) |
| U08-S06 Sharps, flats and twins | **Removed** → Prep C–D (§5) |
| U08-S07 Intervals | **Removed** → Prep B (§5) |
| U08-S08 First chord C–E–G | **Removed** → Prep E–F (§5) |
| U09-S01 Harbor mix-up | → **U12-S04** |
| U09-S02 Two-hand bass companion | **Removed** → Prep B (§5) |
| U09-S03 Melody in time, mastery | → **U12-S05** (no rests) |
| U09-S04 Recital 4: Ode to Joy | → **U12-S06** (RH from the treble staff, no LH bass companion) |
| U09-S05 Grand Staff guideposts | Expanded into **U10–U12** (full Prep A staff reading) |
| U09 (stop) | Reused for **C position, both hands** (new) |

## 4. Skill by skill

Format: **ID Title** — ≤10-word summary. *Metric* · *Tiers* · *Presentation (explorer / direct)* · *Answer mode*.

### U01 Meet the piano
- **U01-S01 Black-key groups** — Find groups of two and three black keys anywhere.
  - Metric: 9/10; T3 2,500 ms, full visible span, on the piano. Categories: group-2 find, group-3 find, place ("lowest group of three"), named position ("middle key of the three"), echo-in-group.
  - Tiers: T1 shown region ≥ 2 octaves · T2 find and play across ≥ 2 octaves · T3 full-keyboard sweeps, no hints.
  - Explorer: "Black keys come in groups of 2 and 3 — like twins and triplets!" / Direct: "Play a key in a 3-group"; timing numbers only via the grown-up setting.
  - Answer: either → piano at T3 (place items stay on screen until exact-MIDI Stage 2).
- **U01-S02 High and low** — Hear and play higher, lower, high and low sounds.
  - Metric: 9/10; `gapByTier` T1 12→7, T2 7→4, T3 4→2 semitones. Categories: higher?, lower?, register play, relative play, register name (T2+).
  - Tiers: T1 wide gaps · T2 high/middle/low by name or play · T3 named register anywhere, tight gaps.
  - Explorer: "Right is high like a bird; left is low like a bear." / Direct: register words, no animals.
  - Answer: either → piano at T3. Open: high threshold ≥ G5 vs ≥ G4.
- **U01-S03 Left and right** — Left goes low, right goes high; play both.
  - Metric: 9/10; order judged on "play both"; full span at T3. Categories: tap side, which side, play both in order, side + register (T3).
  - Tiers: T1 on screen split at Middle C · T2 play left then right · T3 side + register unassisted.
  - Explorer: "Going right, the sounds go up." / Direct: "Note left of C4, then right of C4."
  - Answer: either → piano at T3.

### U02 Sit comfortably (`pace:false`, never gates U03, never counts as cool-down pileup)
- **U02-S01 Bench and posture** — Choose the right bench distance and tall posture.
- **U02-S02 Relaxed arms and wrists** — Spot level wrists and loose shoulders, play relaxed.
- **U02-S03 Bubble hands, stop if it hurts** — Curved fingertips; stop and tell someone if it hurts.
  - Metric (all three): 9/10 on kid-playable `spotChoice` picture items; on screen at every tier (documented exception to the T3 piano rule: posture has no honest play form). Optional "play five comfy notes" mic item is a soft landing, never required.
  - Tiers: T1 two clearly different pictures, highlight + why-line after a miss · T2 three pictures, closer distractors · T3 3–4 pictures, subtle mistakes, no highlight before reveal.
  - Explorer: "Which kid is sitting just right?" / Direct: short self-check card.
  - Answer: screen. Phase B still ships these as non-blocking grown-up checks until `spotChoice` lands. New art is picture-first (Kevin approves).

### U03 Listen and play + Recital 1
- **U03-S01 Up, down or same** — Hear whether notes climb, fall or stay.
  - Metric: 9/10; step T1 ≥ 4 semitones → T3 1–2. Categories: up, down, same, play a contour, echo 2-note contour. Prep A "up/down/repeat" reading lives later in U10–U12.
  - Explorer: "Do the notes climb up, slide down, or stay the same?" / Direct: ↑ ↓ = pad. Answer: either → piano at T3.
- **U03-S02 Steady beat** — Keep a steady pulse when the click drops out.
  - Metric: ±110 ms T3; BPM T1 60–72, T2 72–84, T3 84–100. Categories: with click, dropout (2 beats T1 → 4 T3), pulse on a piano key.
  - Explorer: "Steady like a heartbeat" with bounce visual / Direct: metronome; ms offsets only via the grown-up setting. Answer: T1 tap, T2 either, T3 piano-key onsets (needs "rhythm stays tapped" lifted for T3; until then T3 tap with the same window).
- **U03-S03 Echo 2–3 notes** — Play back short C–D–E patterns by ear.
  - Metric: 9/10, judged in order (first wrong note = miss). Categories: echo 2, echo 3, echo with a repeat.
  - Explorer: "I play, then you play it back." / Direct: "Echo." Answer: either → piano at T3.
- **U03-S04 Black-key mini-tunes** — Echo tiny tunes inside one black-key group.
  - Metric: 9/10; 3–5 notes inside one group. Categories: echo in 2-group, echo in 3-group, play from a letter-free dot picture. Black keys are positions, never named ♯/♭.
  - Explorer: "The black keys make a cozy little song." / Direct: contour diagram. Answer: either → piano at T3.
- **U03-S05 Recital 1: Black-Key Buns** — Perform Hot Cross Buns on three black keys.
  - Metric: T3 performance with count-in, pitch + rhythm at ±110 ms. Song `hcb-black` (the three keys of the 3-group, same steps as E–D–C). Quarters and halves only.
  - Tiers: T1 phrase by phrase · T2 whole song, gentle tempo · T3 performance tempo, no hints.
  - Explorer: Recital Stage walk-on, white dragon in the wings / Direct: performance mode with an accuracy breakdown (timing numbers via the grown-up setting). Answer: piano at T3.

### U04 Loud, soft, short and long
- **U04-S01 Forte and piano** — Hear, read and play loud `f` versus soft `p`.
  - Metric: 9/10; T3 "play forte, then piano" judged by calibrated relative contrast (`minContrastDb`). Categories: identify by ear, symbol (`f`/`p`), play contrast.
  - Explorer: "Forte is loud; piano is soft." / Direct: `f`/`p` symbols (dB meter only via the grown-up setting). Answer: either → piano at T3 (identify/symbol items carry a no-mic learner through T1–T2).
- **U04-S02 Short and long** — Compare note lengths, then play short and held notes.
  - Metric: 9/10; T3 sustain judged on the mic (`holdBeats`, `sustainMs`). Categories: longer?/shorter? (1–2, 1–4, 2–4 beats), play short / play long and hold, play longer than this. *This is duration (quarter vs half vs whole), not staccato/legato touch.*
  - Explorer: "Short like a hop; long like a slide." / Direct: beat counts. Answer: either → piano at T3.
- **U04-S03 Question and answer** — Answer a three-note musical question with new notes.
  - Metric: 9/10; `answerRule` differ or end on C; timing not judged. Categories: answer my question, ask and answer.
  - Explorer: "Play 3 notes to ask, then 3 to answer." / Direct: "Call / response." Answer: either → piano at T3.

### U05 Fingers and Middle C + mixed review
- **U05-S01 Finger numbers** — Match fingers 1–5 on each hand, play by number.
  - Metric: 2,500 ms T3; finger inferred honestly from pitch on anchored play. Categories: L/R number→finger, finger→number, mirror ("RH 2 and LH 2"), play with finger N from an anchor.
  - Explorer: "Thumbs are 1, pinkies are 5, on both hands." finger glow / Direct: "LH 3?" at speed. Answer: screen T1 → piano anchored play at T3.
- **U05-S02 Middle C and every C** — Find Middle C, then every C on the keyboard.
  - Metric: 2,500 ms per note T3, full span. Categories: Middle C exact, any C, named C (`C3`, `C5`), every-C sweep.
  - Tiers: T1 Middle C only · T2 low/middle/high C · T3 find ALL C's.
  - Explorer: "Middle C is just left of the two black keys, in the middle." / Direct: `C3`/`C4`/`C5` labels (presentation only). Answer: either → piano at T3.
- **U05-S03 Rhythm echo** — Clap or play back two-bar rhythms by ear.
  - Metric: ±110 ms T3. Categories: clap-back quarters and halves, play-back on a key, **with a whole note** (T3). *No rest category (rests are Prep B).*
  - Explorer: "Listen, then clap it back." no words / Direct: notation after the attempt (ms only via the grown-up setting). Answer: T1 tap → piano key at T3.
- **U05-S04 Mix it up** — Mixed review of everything from U01–U04.
  - Metric: 9/10, `minPerSkill:2`, T3 on the piano wherever the source skill is; can count toward a due Day 3/6 review.
  - Explorer: "A little bit of everything so far." / Direct: "Mixed review." Answer: per source skill.

### U06 C, D and E + Recital 2
- **U06-S01 Name C, D and E** — Find and name C, D and E everywhere.
  - Metric: 2,500 ms T3, full span. Categories: find nearest Middle C, name shown key, any octave, all-C/D/E sweep.
  - Explorer: "C left of the 2 black keys, D between, E on the right." / Direct: letters. Answer: either → piano at T3.
- **U06-S02 C–D–E patterns** — Read letter patterns and play C–D–E tunes.
  - Metric: 9/10, judged in order; T3 no letter highlight. Categories: read and play, echo 4 notes, play the letters you hear; length 3 → 4 → 5.
  - Explorer: "Read the letters, then play them." / Direct: letter string. Answer: either → piano at T3.
- **U06-S03 Note values and time signatures** — Quarter, half, dotted half, whole; 4/4 and 3/4.
  - Metric: 9/10; T3 adds tap or play the line at ±110 ms. Categories: symbol→beats, beats→symbol, which lasts longer, count a bar, "how many beats in a bar?" (4/4 vs 3/4), bar line / double bar. *Quarter rest removed (Prep B).*
  - Explorer: "A quarter note gets 1 beat, a half note gets 2…" / Direct: plain notation. Answer: screen T1 → piano/tap line at T3.
- **U06-S04 Recital 2: Hot Cross Buns** — Perform Hot Cross Buns on C, D and E.
  - Metric: as Recital 1. Song `hcb`. Explorer: "Now play it on the white keys." Recital Stage / Direct: performance mode. Answer: piano at T3.
- **U06-S05 Musical alphabet** — Say and play A–G forward and backward, wrapping.
  - Metric: 2,500 ms T3, no letter strip; wraps G → A. Categories: next letter, previous letter, play forward from a random start, play backward, **key-step vs key-skip** (neighbor key vs skip one white key). *No interval names (2nd/3rd…) — those are Prep B.*
  - Explorer: "What comes after G?" spoken / Direct: rapid letter prompts. Answer: either → piano at T3.

### U07 The left hand (Middle C position, LH)
- **U07-S01 LH C, B and A** — Find and play left-hand C, B and A.
  - Metric: 2,500 ms T3, full span. Categories: find and play LH B, which LH finger plays B (→ 2), name the shown key, all A's and B's (T3).
  - Explorer: "Your left thumb sits on Middle C; B and A walk down." / Direct: `B3`, `A3`. Answer: either → piano at T3.
- **U07-S02 LH C–B–A patterns** — Read and echo short left-hand C–B–A tunes.
  - Metric: 9/10, judged in order. Categories: read and play (C B A B C), echo 3–5 notes.
  - Explorer: "I'll play a little left-hand tune; you play it back." / Direct: letter string. Answer: either → piano at T3.
- **U07-S03 Hands take turns** — Right hand asks, left hand answers, one at a time.
  - Metric: 9/10, judged by pitch order and register (`twoHandTrack: 'alternate'`; never both at once). Categories: RH asks/LH answers (C–D–E → C–B–A), and reverse.
  - Explorer: "Right hand asks; left hand answers." / Direct: "Alternate hands." Answer: either → piano at T3.

### U08 Five-finger songs + Recital 3
- **U08-S01 F and G** — Find and play F and G, completing C–G.
  - Metric: 2,500 ms T3, full span. Tiers: T1 nearest Middle C · T2 nearby octaves · T3 ALL F's and G's.
  - Explorer: "F and G live just past E." / Direct: letters. Answer: either → piano at T3.
- **U08-S02 RH Middle C position C–G** — Play and echo five-finger patterns, RH C4–G4.
  - Metric: 9/10. Categories: RH C–G patterns by finger number and by letter, echo.
  - Explorer: "Walk up and down the five keys under your right hand." / Direct: pattern notation (letters). Answer: either → piano at T3.
- **U08-S03 Melody in time** — Play four to eight notes with correct rhythm.
  - Metric: pitch **and** rhythm, ±110 ms T3. Categories: count in and play 4–8 notes, echo in time.
  - Explorer: "I'll count you in." / Direct: metronome; onset ms only via the grown-up setting. Answer: piano at T3.
- **U08-S04 Bar lines, 3/4 and repeats** — Read a line with bar lines, 3/4 and repeats.
  - Metric: ±110 ms T3. Categories: count the bars, read and play a 3/4 line with a dotted half, repeat sign `:||` (play it twice), 4/4 vs 3/4 switch. *Rests removed (Prep B).*
  - Explorer: "Two dots mean play it again!" / Direct: notation with `:||`. Answer: screen T1 → piano at T3.
- **U08-S05 Recital 3: Mary Had a Little Lamb** — Perform Mary Had a Little Lamb, RH.
  - Metric: as Recital 1. Song `mary`. Explorer: "A real song with C, D, E and G." / Direct: performance mode. Answer: piano at T3.

### U09 C position, both hands (new)
- **U09-S01 LH C position C3–G3** — Place LH 5 on C3; find C3–G3.
  - Metric: 2,500 ms T3. Categories: which LH finger plays G3 (→ 1), play LH finger N in C position, name the shown key, find C3 vs Middle C.
  - Explorer: "Left pinky on the low C, thumb on G." / Direct: `C3`–`G3`, LH 5→1. Answer: either → piano at T3.
- **U09-S02 LH C-position patterns** — Read and echo left-hand C3–G3 five-finger tunes.
  - Metric: 9/10, judged in order. Categories: read and play by finger number, by letter, echo 3–5 notes.
  - Explorer: "Your left hand walks its own five keys." / Direct: letter + octave string. Answer: either → piano at T3.
- **U09-S03 Hands take turns in C position** — Alternate hands across C3–G3 and C4–G4, never together.
  - Metric: 9/10, pitch order + register (`twoHandTrack: 'alternate'`); T3 in time at ±110 ms.
  - Explorer: "Low hand, high hand, taking turns." / Direct: "Alternate LH C3–G3 / RH C4–G4." Answer: either → piano at T3.

### U10 Bass staff
- **U10-S01 Bass clef and staff** — Recognize bass clef; count five lines, four spaces.
  - Metric: 9/10; T3 3,000 ms. Categories: which clef?, line vs space, count lines/spaces, "F-clef dots hug the F line".
  - Explorer: color/shape onboarding at T1–2, gone at T3 / Direct: plain black-and-white from the start. Answer: screen.
- **U10-S02 Read C3–G3 on the bass staff** — Name bass-staff notes C3 through G3.
  - Metric: 3,000 ms T3, plain staff. Categories: note → letter, letter → note, up/down/repeat between two notes (Prep A reading direction), step vs skip on the staff (line-to-space vs line-to-line, no interval names).
  - Explorer: spoken prompt, landmark picture at T1 / Direct: plain staff (no visible timer). Answer: screen (T1–T2) → piano at T3 via U10-S03 mix.
- **U10-S03 Play C3–G3 from the bass staff** — See a bass-staff note, play it.
  - Metric: 3,000 ms per note T3, on the piano; 2–4 note read-and-play lines at T3.
  - Explorer: "Find it on the staff, then on the keys." / Direct: sight-to-key prompts (timer measured invisibly). Answer: either → piano at T3.

### U11 Treble staff
- **U11-S01 Treble clef and staff** — Recognize treble clef; place notes on lines and spaces.
  - Metric: 9/10; T3 3,000 ms. Categories: which clef? (treble vs bass), line vs space, "G-clef curls around G".
  - Explorer / Direct: as U10-S01. Answer: screen.
- **U11-S02 Read C4–G4 on the treble staff** — Name treble-staff notes C4 through G4.
  - Metric: 3,000 ms T3, plain staff. Categories: as U10-S02 on the treble staff; Middle C on its own ledger line.
  - Answer: screen (T1–T2) → piano at T3.
- **U11-S03 Play C4–G4 from the treble staff** — See a treble-staff note, play it.
  - Metric: 3,000 ms per note T3, on the piano; 2–4 note read-and-play lines.
  - Answer: either → piano at T3.

### U12 Grand staff + world boss
- **U12-S01 The grand staff** — Brace, both clefs, and Middle C between them.
  - Metric: 9/10; T3 3,000 ms. Categories: name the parts (brace, treble, bass, bar line, double bar), which staff (RH/LH), Middle C in either staff, "same note, two places".
  - Explorer: lighthouse "two decks, one ladder" art at T1–2 / Direct: plain grand staff. Answer: screen.
- **U12-S02 Read Middle C position on the grand staff** — Read RH C4–G4 and LH C4–A3 notes.
  - Metric: 3,000 ms T3, plain grand staff, mixed staves. Categories: name the note, which hand plays it, up/down/repeat across staves, read C position (C3–G3 bass, C4–G4 treble).
  - Answer: screen (T1–T2) → piano at T3.
- **U12-S03 Play from the grand staff** — Read and play short grand-staff lines, hands taking turns.
  - Metric: 9/10, pitch order + register; T3 in time at ±110 ms; 2–4 bars, 4/4 or 3/4, may include `:||` and `f`/`p`. Hands alternate, never together.
  - Explorer: "Top staff right hand, bottom staff left hand." / Direct: notation (onset ms only via the grown-up setting). Answer: either → piano at T3.
- **U12-S04 Harbor mix-up** — Whole-world mixed review: listen, identify, read, play.
  - Metric: 9/10, `minPerSkill:2` across every family, T3 on the piano where the source skill is. **Required for the next world at Tier ≥ 1.**
  - Explorer: "A little of everything from Melody Harbor." / Direct: "World review." Answer: per source skill.
- **U12-S05 Melody in time, mastery** — Read and play longer melodies with dynamics, in time.
  - Metric: ±110 ms T3, pitch + rhythm; `f`/`p` must be followed at T3. Categories: 6–8 notes with a whole or dotted half note, a 3/4 item, a `:||` item, `f`/`p` at T3, read from the grand staff at T3. *No rests.*
  - Explorer: "Count in, then play a longer little song." / Direct: notation (telemetry only via the grown-up setting). Answer: piano at T3.
- **U12-S06 Recital 4: Ode to Joy (world boss)** — Read and perform Ode to Joy with `f`/`p`.
  - Metric: T3 performance from the treble staff, RH Middle C position melody, `f`/`p` contrast, pitch + rhythm ±110 ms. **Required for the next world at Tier ≥ 1.** No LH bass companion (Prep B). *Lightly Row* is a free encore only.
  - Tiers: T1 phrases · T2 whole song · T3 full performance, notation only.
  - Explorer: "This is your Melody Harbor concert song. Take a bow!" Recital Stage / Direct: performance mode. Answer: piano at T3.

## 5. Removed / reassigned out of Melody Harbor

| Removed from Harbor | Was | Prep level | Receives it |
|---|---|---|---|
| Rests (quarter rest, half rest, whole rest) | U06-S03, U05-S03 T3, U08-S04, U09-S03 | Prep B | **World 2, Amazon Rainforest** (rescoped to Prep B); today in plan `NQ-02` Savanna |
| Eighth notes | (planned Savanna) | Prep B | **World 2, Amazon Rainforest** (Prep B) |
| Legato vs. staccato touch | U04-S04 (Part 2 #1) | Prep B | **World 2, Amazon Rainforest** (Prep B); today `NQ-02-U05` |
| Intervals 2nds–5ths, octaves, melodic vs harmonic | U08-S07 (Part 2 #3) | Prep B (2nds–5ths); 6ths–8ves Prep C–D | **World 2, Amazon Rainforest** (2nds–5ths); 6ths–octaves to the Prep C–D world (**Australian Outback**) |
| Simultaneous two-hand bass companion / hands together | U09-S02 (Part 2 #6), U09-S04 T3 LH bass | Prep B | **World 2, Amazon Rainforest** (Prep B); today `NQ-02-U07` |
| Sharps, flats, naturals, enharmonic twins | U08-S06 | Prep C–D | **Australian Outback** (`NQ-03`, Prep C–D) |
| C major blocked triad (C–E–G) | U08-S08 (Part 2 #5) | Prep E–F | **Polar Expedition** (`NQ-04`, Prep E–F) |
| Interval-named "steps and skips" (2nds/3rds) | U06-S05 T2 | Prep B | **World 2, Amazon Rainforest**; Harbor keeps key/letter neighbors and staff line/space steps without interval names |

Still in Harbor from the 11-27 "six extras": **3/4 and dotted half** (U06-S03, U08-S04) and **Grand Staff** (now full Prep A staff reading, U10–U12).

## 6. Downstream impact on Worlds 2–5 (rescope pending)

- **World 2, Amazon Rainforest (`NQ-01`)** stops being Prep A. Its live v3.2 stops (black keys, finger numbers, white keys, Middle C, C position, 3/4, bass/treble/grand staff, first recital) are now all Harbor material and would be pure repetition. **Amazon shifts to Prep B:** reading by intervals (2nds–5ths, melodic/harmonic), G position and moving hand positions, rests, legato/staccato, eighth notes, hands together. Prep A material appears there only as review/placement.
- **Worlds 3–5** shift one step accordingly: the current plan has Savanna = Prep B, Outback = Prep C–D, Polar = Prep E–F. With Amazon taking Prep B, the Prep C–F span must be redistributed across Savanna, Outback and Polar (proposal: Savanna Prep C, Outback Prep D, Polar Prep E–F). **Kevin decision needed;** the destination column in §5 uses the current world map until then.
- Worlds 6–9 are unchanged.
- Live game: `index.html` v3.2 still has the old 6-stop Harbor and Prep A Amazon. Nothing changes in code until Claude's engine plan and a reviewed content PR.

## 7. Engine items for Claude to reconcile (no edits to Claude's files here)

Listed in full in the 07:25 message. Short form: drop Harbor `articulation`, `enharmonicTwins`, `interval`/`harmonicInterval`, chord / `expectChord` C triad, `twoHandTrack:'together'`, rest and eighth-note symbols; add staff generators (`staff:'bass'|'treble'|'grand'`, ranges C3–G3 / C4–G4 / Middle C position, line/space and clef `symbol` items, sight-to-key prompts (timer measured invisibly)); V34 §6 readiness families and next-world gate move to U12-S04 / U12-S06; R6 recheck list drops rests from U06-S03; 12 stops instead of 9.

## 8. Lint additions (curriculum tooling, Coding Agent)

- `NQ-00` content may not contain: rest symbols, eighth notes, articulation marks, interval names, accidental reading symbols, chords, or `twoHandTrack:'together'`.
- Every staff skill declares `staff` and its range; Harbor ranges limited to C3–G3 (bass), C4–G4 (treble), Middle C position LH C4–A3.
- Every skill ≥ 4 distinct prompts per category; no duplicate skill across stops; T1 → T3 difficulty ramp present.

Posted by Coding Agent (Grok) for Kevin.
