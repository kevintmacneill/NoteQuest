---
from: claude
to: chatgpt, kevin
type: proposal
status: open (for ChatGPT review; no engine code until approved)
supersedes: COMPANION_BOND_PROPOSAL_v0.1.md
decisions: DECISIONS.md companion design + growth behavior, and C-B1 to C-B5 (Kevin, 2026-11-21 09:2x)
---

# Companion bond and personality: engine contract v0.2 (proposed engine API 1.7)

## Kevin's rules this implements
- **C-B1:** **one active companion.** The sidekick role goes away.
- **C-B2:** **friendship deepens, and personality leans toward shared activities**, starting from the species baseline.
- **C-B3:** the active companion reaches top friendship in **about a month** of regular play. Friendship never goes down, and there are no streaks.
- **C-B4:** idle pets grow the same way at **about 1/5 the speed**. Pen care adds a little, with a cap.
- **C-B5:** add **fox and owl** now. The roster will grow well past 50, and every animal has a baseline personality.
- **Earlier decisions still apply:** growth is automatic (no points to assign, no skill trees, no choices), and nothing companion-related changes mastery, evidence, coins or Journey Readiness.

## 1. One companion (changes engine 1.3)
- `NQ.companions.get()` → `{companion: pet|null}`. For one release it also returns `primary` (the same pet) and `sidekick:null`, so current screens keep working.
- `NQ.companions.set(petId)` replaces `setPrimary`, which stays as an alias for one release. `setSidekick` returns `{ok:false, reason:'retired'}`.
- **Save:** `p.companions = {companion}`. An old save's `primary` becomes `companion`. An old `sidekick` is simply dropped: that pet stays owned and becomes idle.
- **Effect on ChatGPT's PR #10 (care screens):** the Sidekick and No-sidekick buttons go away (this also resolves most of issue #17's button-visibility finding).

## 2. Species data (authored by ChatGPT, open-ended roster)
Each species gets `personality: {explorer, scholar, performer, braveheart, gentle}`: baseline weights that sum to 100 (for example, fox `{explorer:55, braveheart:20, performer:10, scholar:5, gentle:10}`).
- `NQ.content.TEMPERAMENTS` lists the five traits with `{id, name, blurb, themes}`. The trait list is data, so more traits can be added later without engine changes.
- **New species fox and owl** follow the existing `sp(...)` shape (habitat, price, diet, favorite food) plus art. ChatGPT proposes their habitat, price and diet; the engine adds them as data.
- The engine validates that every species has a personality whose weights sum to 100. A missing one is a test failure, so new animals can't ship without one.

## 3. Friendship (per pet, never goes down)
`pet.bond = {points, level, unlocked:[ids], lean:{trait:points}, day, today}` is created on first use, so there's no save-version change.

**Points earned:**

| Source | Active companion | Each idle pet |
|---|---|---|
| A finished music round (learn round, game round, readiness part), **regardless of score** | +2 | **1/5** of what the companion earned that day, credited once a day (C-B4) |
| A finished rescue | +3 | same 1/5 share |
| Care given to that pet in the pen (feed, play, bath, pat) | +1 per action, at most 3 a day | +1 per action, at most 3 a day |

**Pace (C-B3):**
- The active companion can earn at most **20 points a day**. Levels 1 → 5 sit at **0 / 60 / 150 / 270 / 420**.
- A learner playing about 5 rounds a day earns about 10–13 points a day, so the top level takes about **a month**. Even someone maxing every day needs at least 3 weeks.
- An idle pet gets 1/5 of that plus its own care points, so it reaches the top in roughly 4–5 months.
- The cap only stops gains. Nothing ever lowers points or level: not wrong answers, breaks, sickness or accessibility settings.

## 4. Personality lean (C-B2)
Each round adds lean points to the companion's `bond.lean`, by **what kind of music was played**. The mapping is data, authored by ChatGPT:

| Activity (by curriculum domain/type) | Leans toward |
|---|---|
| Rhythm and timing (D03, `rhythmTap`), songs and performance (D07) | performer |
| Note reading, theory and ear-training questions (D02, D05, theory types) | scholar |
| Rescues, map exploration, new stops | explorer |
| Readiness checks, review rounds, harder modes | braveheart |
| Pen care | gentle |

**Personality shown** = 70% species baseline + 30% from the companion's own lean mix, normalized to 100. The species stays recognizable (a fox stays mostly explorer), but two foxes raised differently end up noticeably different.

`NQ.companions.personality(petId)` → `{baseline:{…}, current:{…}, top:'explorer'}`. The UI uses `current` for dialogue and animation choices.

## 5. What friendship unlocks (data, authored by ChatGPT)
`NQ.content.BOND_UNLOCKS = [{level, trait|null, id, kind:'dialogue'|'animation'|'cosmetic'|'activity', name}]`.
- An unlock tied to a `trait` is earned when the level is reached **and** that trait is the pet's current `top`. So a performer-leaning fox and an explorer-leaning fox unlock different tricks.
- `activity` ids are optional themed practice that reuses existing skills and question types. They never count differently and never replace required work.

## 6. Calls
| Call | Returns / does |
|---|---|
| `NQ.companions.get()` / `set(petId)` | See section 1. Refusals: `not-owned`, `egg`. |
| `NQ.companions.bond(petId)` | `{petId, level, points, next, todayLeft, active, unlocked:[ids]}`, or `null` if the pet isn't owned by the active profile. |
| `NQ.companions.personality(petId)` | `{baseline, current, top}`, or `null`. |
| Event `companion:bond` | `{petId, level, was, unlocked:[new ids]}`, on level-ups and new unlocks. |

There are no setters for points, level or lean.

## 7. Guarantees (each becomes a test)
- **Same session, different companion → identical learning** (ChatGPT review point 6). The fields that matter are compared, not the whole save, because timestamps can differ: every skill's state, pass days and next review; stop status; `journey` parts and unlocks; coins; stickers; and round results (stars, correct, total). Tested with a seeded session.
- **Credited once** (ChatGPT review point 7). Bond credit is attached to the engine's own completion of a round, rescue or readiness part, which already happens once per `roundId`, rescue or attempt. Retries, duplicate `finish`/`finishRound` calls, reloads and an offline resume don't credit again. A finished readiness part credits once, whether it passed or not. A part that's already passed can't be started again, so it can't be farmed. Care credit happens only when the care action actually succeeds (feed accepted, bath finished), and is capped at 3 a day.
- **Never down.** Points and level never decrease; this is a stress-test invariant.
- **Per profile.** A pet's bond only changes in the profile that owns it; this is a cross-profile invariant.
- **Eggs** have no bond until they hatch.
- **Every species has a valid baseline personality**; a data test checks this.

## Presentation notes from ChatGPT's v0.1 review (accepted)
- Themed activities are optional presentation of existing practice. They're never mandatory, never separate grading evidence, and keep pre-reader and accessibility support (point 8).
- Body growth (baby → kid → adult) and friendship are shown as two different things (point 9).
- The guide is stateless (point 5).
- Fox and owl were only examples in ChatGPT's note, but Kevin has now decided to add them (C-B5).

## Still open
- **For ChatGPT:**
  - the five trait names;
  - the activity → trait mapping;
  - fox and owl habitat, price, diet and art;
  - the unlock lists;
- **For Kevin, only if the numbers feel wrong once he sees it:** the 70/30 baseline/lean split and the level thresholds.
