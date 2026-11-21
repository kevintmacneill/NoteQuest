# Curriculum v3: Claude's review

**Reviews:** `curriculum-v3.md` and `curriculum-v3-h02.json` (3.0-draft, 9 levels, 70 stops, 210 skills) · **Date:** 2026-11-20
**Status:** Review for ChatGPT and Kevin. Nothing here is approved, and the v3 data is not loaded into gameplay.

## Verdict
**The plan is a good outline of all nine levels.** It honors C1 (earlier cut points), C2 (pictures and listening, letters with picture cues), C3 (no book mode) and C9 (all nine planned). It also states the evidence limits honestly: the mic hears single notes, and human checks cover the rest.

**Data checks I ran:** all 210 prerequisites exist, none points forward, there are no cycles, and every evidence type is from the agreed set.

**It isn't usable by the engine yet**, and the prerequisite map needs real structure. Details below. Items 1 and 2 matter most.

## Findings

### 1. Skills have no machine content (needed before the engine can use them)
Every skill's `content` is only `{focus, source}` (a sentence), so the engine can't generate a single question from it.

- **What's needed:** about 100 skills are auto-checked (`quiz` 43, `keys` 16, `tap` 18, `listen` 16, `mic` 7). Each needs `content.type` plus parameters, as in Engine API 1.2. Example:

```json
{"type":"noteName","notes":["C4","D4","E4","F4","G4"],"staff":"treble"}
{"type":"rhythmTap","bpm":66,"beatsPerMeasure":3,"patterns":[[[1,1,1],[3]]]}
{"type":"keyGroup","group":2}
```
- **Human-checked skills** (`self` 44, `caregiver` 46, `teacher` 20) need `{type:'self'|'caregiver', prompt, checklist[]}`. That's a short prompt and 2–4 things to look for, written so a grown-up can judge them.
- **New question types:** v3 needs some types the engine doesn't have yet. I'll add them once the content says what they need:
  - `echo`: hear a short pattern, then tap or play it back
  - `interval`: name or hear 2nds to octaves, melodic vs. harmonic
  - `ledger`: note names off the staff (the `noteName` type with wider note sets)
  - `chordQuality`: major, minor and later qualities by ear
  - `scaleBuild`: pick the scale's notes on the keyboard
  - `keySignature`: name a key from its signature (similar to `symbol`)
  - `contourRead`: a written up/down/same pattern
- **Offer:** to save time, I can draft the `content` parameters for NQ-00 to NQ-02 (about 70 skills) from the titles. You'd check them for teaching sense. You own the curriculum, so tell me if you'd rather write them.

### 2. Prerequisites are one straight line, not a map (needs fixing)
Every skill's only prerequisite is the skill listed just before it, across all 210 (one skill has none).

**That causes real problems:**
- **It blocks unrelated learning.** "Tell high sounds from low sounds" (ear training) requires "Notice and stop when tension or pain occurs" (posture). "Find F using three black keys" requires "Play a relaxed three-finger echo," a caregiver check. A child whose grown-up isn't around for one caregiver check is stuck on everything after it.
- **Placement and Today's practice stop working well.** With one line, there are no parallel strands to mix and no real "what's ready next."
- **It loses v2's design.** v2 had ten parallel strands, and this drops them.

**Proposal:** give each skill the 0–3 prerequisites it *actually* needs, mostly within its own strand (reading, rhythm, technique, ear training…). For example, keyboard → letter names → staff landmarks; pulse → note values → rests → eighths. Then mark one skill per stop as the **checkpoint** for map progress. Learners still see the map move in order, but practice can mix strands.

### 3. NQ-01 order vs. Alfred Prep A (recommended; costs nothing)
Micaela is the Prep A pilot, and her teacher follows the book. Prep A's published order is:
1. black keys (with quarter, half and whole notes, and *p*/*f*)
2. white keys
3. **Middle C position** (letter notes, 4/4)
4. **C position** (dotted half, 3/4)
5. bass staff
6. treble staff
7. grand staff

**v3's NQ-01 order:**
- puts staff reading (U05) **before** C position (U06)
- has no Middle C position stop
- leaves *p*/*f* to U07

**Suggested order:** black-key paths (+*p*/*f*) → finger numbers → white keys → Middle C position → C position (+ dotted half, 3/4) → bass staff → treble staff → grand staff + recital. That fits 8 stops if "Listen and express" folds into the black-key and recital stops. Even without a book mode, matching the order means the game never contradicts her lessons.

### 4. Child and adult wording, and pictures (needed for Zoe's profile)
- `title.child` is identical to `title.adult` for all 210, and `objective` repeats the title.
- **Child titles** should be short and friendly, such as "Find the 2 black keys."
- **For the picture presentation,** each skill needs an `icon` or `picture` key. The engine can pass it through and the art can follow your style guide.
- The `requiresReading` definition (written words only, not music notation) is good. Only 2 skills are marked; please double-check the theory and harmony skills in NQ-05 to NQ-08 that rely on written explanations.

### 5. Smaller points
- **Exactly 3 skills per stop everywhere** looks templated. Some stops need more (NQ-01 first staff reading covers three Alfred sections) and some fewer. Let the counts vary.
- **Evidence mix-ups:**
  - "Show fingers 1 through 5 on hand diagrams" is marked `keys`; it should be `quiz`, picking on a hand picture.
  - "Read a basic two-staff grand-staff example" (`quiz`) can be `noteName` with `staff:'grand'`.
- **The `masteryOverride: null` placeholders are fine for now.** Performance skills (recitals) will want "1 confirmed day" instead of 2. Since performing is the goal, two days can be too strict.
- **35 stops have no rescue animal.** That's fine. The engine treats the animal as optional.

## What I need to swap v3 in for the engine test sample
1. **Findings 1 and 2** for the levels being built first. Even if all nine are planned, I can load NQ-00 to NQ-02 as soon as their content and prerequisites are parameterized.
2. **Kevin's approval** of v3 (and C4–C8, C10).

Loading is then a data swap plus the new question types above, with tests to make sure every skill can generate a playable round.
