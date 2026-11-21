# Curriculum v2 (v0.1.1): Claude's review and proposed v3 changes

**Reviewer:** Claude (engine) · **Date:** 2026-11-20 · **Reviews:** `curriculum-v2.md` (internal v0.1.1, ChatGPT)
**Status:** Proposal for Kevin. Nothing here is approved or built. ChatGPT owns the curriculum architecture. If Kevin accepts changes, ChatGPT writes them into v3.

## Verdict

**The framework is strong. Keep it.** Ten skill strands, prerequisite-based progress, placement that skips what a learner can already show, mastery kept separate from game stars, and honesty about what a self-guided app can't judge are all exactly right. My changes are about **balance, the real pilot learners, and what the software can actually check**, not about replacing the design.

Four changes matter most:
1. **C1:** the beginner years are packed into too few map locations.
2. **C2:** Zoe's pre-reader start is missing.
3. **C5:** every skill needs a stated way it gets checked, and the microphone can't hear chords or two hands.
4. **C9:** spec and build one level slice at a time, not all nine.

## What I checked it against
- **Alfred Prep A, publisher outline** ([Alfred overview](https://www.alfred.com/pages/alfreds-basic-piano-prep-course-overview)): posture and finger numbers → black keys (quarter, half and whole notes, *p*/*f*) → white keys → Middle C position (letter notes moving up and down the page, 4/4) → C position (dotted half, 3/4) → bass staff → treble staff → grand staff.
  - **NQ-01 matches this sequence well.** Micaela, near the end of Prep A, is at the grand staff, which is NQ-01 Unit 5. That matches what we already know about her.
  - The same page names switch points into Alfred's Basic Course after Prep B, D and F.
  - I don't have the B–F books, so book-level claims below are approximate, as v2 itself says.
- **The microphone engine as built:** one note at a time, pitch detection with octave tolerance, tap-based rhythm timing.
- **The four pilot learners Kevin named:**
  - Micaela, 7: in lessons, near the end of Prep A.
  - Zoe, 5: no lessons, can't read.
  - Kevin and Erika: adult beginners.

---

## Proposed changes

### C1. Spread the beginner years across more map locations (high)
In v2, **NQ-03 alone holds most of Prep C, D, E and F**, roughly three to four books (v2 §6 crosswalk). Meanwhile NQ-05 to NQ-08 cover advanced and lifelong study.
- **The problem:** for a child in weekly lessons, three to four Prep books can take a year or more. Under the one-location-per-level rule, that means **one map location for over a year**, right when kids most need the map to move.
- **The other end:** the advanced locations will be reached by few learners, and the app can support them least (C5).

**Proposal:** keep nine levels and nine locations, but move the cut points earlier.

| Level | Location | v2 content | Proposed content |
|---|---|---|---|
| NQ-00 | Melody Harbor | Orientation, placement | Same, plus the pre-reader path (C2) |
| NQ-01 | Rainforest | First keys … grand staff | Same (≈ Prep A) |
| NQ-02 | Savanna | Reading and two hands | ≈ Prep B (positions, steps and skips, 2nds–5ths, rests, legato) |
| NQ-03 | Outback | Prep C–F bridge | ≈ Prep C–D (eighths, staccato, accidentals, position shifts, first scales, pedal) |
| NQ-04 | Polar | Early intermediate | ≈ Prep E–F (ledger lines, dotted quarters, 6ths–octaves, triads, I–IV–V7, first minor) |
| NQ-05 | Coral Reef | Intermediate | v2 NQ-04 content (keys, 6/8, hand independence, functional harmony) |
| NQ-06 | Himalayas | Upper intermediate | v2 NQ-05 + NQ-06 combined |
| NQ-07 | Space Station | Advanced | v2 NQ-07 |
| NQ-08 | Grand Music City | Lifelong | v2 NQ-08 |

Also: **every level gets 6–10 visible stops on its map**, each roughly one unit, so progress shows every week or two even inside a long level. The engine needs stops anyway.

### C2. Add a pre-reader path for absolute beginners like Zoe (high)
v2 §1 lists Micaela, Kevin and Erika but **not Zoe**, the hardest pilot case. Several early units assume reading or alphabet knowledge ("A–G cycle", reading letter notes).

**Proposal:**
- **Add Zoe** to the pilot list (age 5, no lessons, can't read).
- **Pre-reader track in NQ-00 and early NQ-01, taught with pictures and sound only:**
  - high/low and up/down/same
  - the two- and three-black-key groups as pictures
  - finger numbers on a hand picture
  - steady beat by tapping
  - echo patterns
  - playing by finger number from picture cards
- **Letter names as an optional bridge,** with a picture cue per letter, before letter notes move up and down the page.
- **Each skill marks whether it needs reading** (`requiresReading: true|false`). The engine then hides those skills from non-reader profiles until a caregiver turns reading on.
- Voice is on hold, so for now **a caregiver sits with Zoe**. v2 already says not to claim she can play alone yet. Keep that.

**Question for Kevin:** does Zoe know the letters A–G, even though she can't read words? That decides whether letter names can come early for her.

### C3. A "follow my lesson book" mode (high, for Micaela)
Micaela has a teacher. v2 §1 already says to support the teacher, not contradict her.

**Proposal:** a caregiver setting in each profile, `follow: none | alfred-prep-A…F` plus `bookPosition` (unit or page range).
- **When set:** new skills unlock only up to the current lesson. Practice and review still cover everything earned.
- **Moving forward:** the caregiver bumps the position as lessons move on.

This needs an item-by-item Alfred crosswalk, which v2 lists as gate H-03. Kevin can make it accurate by photographing the contents page of each book Micaela uses.

### C4. Set presentation separately from age (medium)
The engine needs explicit profile fields, set by the person creating the profile, never guessed from age:
- `presentation`: `'picture' | 'child' | 'adult'`
- `reads`: `true | false`

This matches v2 §8, "single competency model, multiple presentations."

### C5. Every skill states how it is checked (high, engine feasibility)
v2 rightly separates evidence types (§7). The microphone engine hears **one clear note at a time**. It can't reliably hear chords, both hands at once, pedal, legato vs. staccato quality, balance or posture.

**Proposal:** in H-02, every atomic skill gets an `evidence` list from this fixed set:

| Evidence | The app can… | Good for |
|---|---|---|
| `quiz` | check taps or choices on screen | note names, symbols, intervals by sight, theory |
| `keys` | check taps on the on-screen keyboard | keyboard geography, finding notes |
| `mic` | hear single notes on the real piano | single-line melodies, one hand, finding notes |
| `tap` | time taps and holds | pulse, durations, rhythm reading |
| `listen` | play a sound and check the answer | ear training (high/low, intervals, chord quality) |
| `self` | ask the learner a guided "did you…?" | technique, articulation, dynamics |
| `caregiver` | ask a grown-up to watch and confirm | posture, hands together, pedal, early two-hand pieces |
| `teacher` | record an optional teacher sign-off | capstones, artistry |

**Consequence:** from NQ-02's two-hand work onward, more and more checks are `self` or `caregiver`. Level capstones from NQ-03 up should mix automatic checks with a short human-confirmed performance, as v2 already suggests.

### C6. Default mastery rules the engine can run (medium)
v2 leaves the thresholds per skill, which is right long-term. The engine still needs defaults until H-05 rubrics exist.

**Proposal:**
- **Exploring:** first attempt.
- **Developing:** some success.
- **Secure:** ≥ 80% first-try on an automatic check, **on two different days**, or a confirmed `self`/`caregiver` check on two days.
- **Transferable:** success on unfamiliar material (a new note set, key or excerpt).
- **Review:** skills come back at about 1, 3, 7, 21 and 60 days. A missed review drops the skill one state, and history is kept, as in v2.
- **Overrides:** any skill can override these defaults.

### C7. A daily "Today's practice" plan (medium)
v2 §8's 10- and 20-minute session shapes are good. The engine can build them automatically from the skill states:
1. warm-up review that's due
2. one new or developing skill
3. real-piano application
4. a short self-check

Pets, coins and rescues stay a reward layer. **They never gate music** (already agreed).

### C8. Repertoire and licensing (medium)
v2 §9 lists film, video-game and pop pathways. Most of that music is copyrighted. **Proposal:** in-app pieces are public domain or original compositions written *in the style of* a genre. Learners can bring their own sheet music to `self`/`teacher`-checked practice. The current eight songs are all public domain.

### C9. Specify and build one slice at a time (high)
Decomposing all nine levels into atomic skills and lessons (H-02 to H-06) before anything is playable is a lot of design ahead of real feedback.

**Proposal:**
1. **Slice 1 = NQ-00 + NQ-01** (pre-reader path through grand staff), about 35–50 atomic skills with evidence types. This covers all four pilots: Zoe from zero, Kevin and Erika from zero, and Micaela placing near the end of NQ-01.
2. Claude builds the curriculum engine (placement, stops, Learn → Practice → Check, mastery and review) against slice 1.
3. Playtest with all four.
4. Then NQ-02, and so on. Levels NQ-05 to NQ-08 stay at today's outline level until learners get close.

### C10. Smaller fixes
- **§1 frequency:** "3–4 sessions weekly": keep it as guidance only. The engine won't lock content by calendar (v2 agrees).
- **§6 Alfred note:** confirmed by the publisher page. Prep A starts with posture and finger numbers, and Middle C position comes before C position. NQ-01's order already reflects this, so the "audit finding" can be marked resolved for Prep A.
- **Adults:** consider an optional **chord path** right after triads and I–IV–V7: playing a melody plus simple chords from a chord chart. Many adult beginners want that early, and it suits the D09 strand.
- **Rests:** the Prep A outline doesn't mention rests. v2 places them in NQ-02, which is consistent.

---

## What the engine will need from the next curriculum deliverable (H-02, slice 1)
For each skill:
- `id`
- `level` and `unit`
- `title` (child and adult wording)
- `domains`
- `prereqs`
- `requiresReading`
- `evidence[]`
- `content`: which notes, rhythms or symbols, from the existing level and question data where it fits
- optional `masteryOverride`
- `alfredRef` (approximate)

For each stop:
- `id`
- `location`
- the skills it contains
- a checkpoint
- a rescue animal (optional)

Given that, I can build the curriculum engine as Engine API 1.2.

## Decisions for Kevin
1. **C1:** move the level cut points earlier, so the beginner years get more map locations?
2. **C2:** add the pre-reader path? Does Zoe know letters A–G?
3. **C3:** add a "follow my lesson book" mode for Micaela?
4. **C9:** spec and build NQ-00 + NQ-01 first?
5. **C5–C8 and C10:** accept as written, or note changes.
