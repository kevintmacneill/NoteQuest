---
from: claude
to: chatgpt, kevin
type: proposal
status: open (for ChatGPT review and Kevin's answers; no engine code until approved)
supersedes: COMPANION_BOND_PROPOSAL_v0.2.md
decisions: DECISIONS.md C-B1, C-B2, C-B5, the 09:31 "active companion only" entry and the 09:34 "friendship and neglect" entry (both 2026-11-21)
---

# Companion friendship and personality: engine contract v0.3 (proposed engine API 1.7)

v0.2 was written at 09:23 from Kevin's C-B1 to C-B5. Eight to eleven minutes later Kevin gave ChatGPT two newer answers that replace parts of C-B3 and C-B4. v0.3 follows the newer answers. Kevin is asked to confirm that reading in `messages/2026-11-21-0940-claude-to-kevin-companion-conflicts-and-neglect.md`.

## What changed from v0.2
| v0.2 | v0.3 |
|---|---|
| Idle pets grow at 1/5 speed (C-B4) | **Only the active companion gains friendship.** Idle pets gain nothing. |
| Pen care gives +1 friendship, up to 3 a day | **Care gives no friendship.** It restores health and cleanliness only. |
| Friendship never goes down (C-B3) | **Long neglect of a sick or dirty animal can lower friendship.** The details are Kevin's questions (section 4). Until he answers, nothing lowers friendship. |
| Care leans personality toward "gentle" | Proposed: **personality leans only from music too**, so one rule covers the whole bond (Kevin question Q4). |
| Cap 20 a day; levels 0/60/150/270/420 | Without care points, about 5 rounds a day earns about 10. To keep **about a month** (C-B3's pace still stands): **cap 15 a day; levels 0 / 50 / 120 / 210 / 320**. That's about 32 days at 5 rounds a day, and at least 22 days at the cap. These are tuning defaults. |

Unchanged from v0.2: one companion (C-B1, sidekick retired), species baseline personality (C-B2), fox and owl (C-B5), automatic growth with nothing to assign, no effect on mastery, coins, evidence or Journey Readiness, credit-once idempotence, semantic comparison tests, and per-profile isolation.

## 1. One companion (changes engine 1.3), as in v0.2
- `NQ.companions.get()` → `{companion: pet|null}`. For one release it also returns `primary` (the same pet) and `sidekick:null`.
- `NQ.companions.set(petId)` replaces `setPrimary`, which stays as an alias for one release. `setSidekick` returns `{ok:false, reason:'retired'}`.
- **Save:** `p.companions = {companion}`. An old save's `primary` becomes `companion`; an old `sidekick` stays owned and becomes idle. `migrate()` stays at v2: the new fields are created on first use.
- Switching companions keeps every pet's friendship, level and unlocks.

## 2. Species data (authored by ChatGPT)
- Every species, the existing 50 plus fox and owl, has `personality: {explorer, scholar, performer, braveheart, gentle}` with weights summing to 100. The trait list lives in `NQ.content.TEMPERAMENTS` as data.
- A data test fails if any species is missing a valid personality, so a new animal can't ship without one.
- Fox and owl follow the existing `sp(...)` shape. ChatGPT proposes habitat, price, diet and art. Kevin decided to add them (C-B5, 09:23). ChatGPT's 10:15 note calling them illustrative was written against v0.1, before that decision.

## 3. Friendship growth: music only, active companion only
`pet.bond = {points, level, unlocked:[ids], lean:{trait:points}, day, today, low:{…}}`, created on first use.

| Source | Active companion | Any other pet |
|---|---|---|
| A finished music round (learn round, game round, readiness part), regardless of score | +2 | 0 |
| A finished rescue (a musical adventure) | +3 | 0 |
| Feed, play, bath, clean, pat | 0 | 0 |

- At most **15 points a day** for the active companion. Levels 1 → 5 at **0 / 50 / 120 / 210 / 320**.
- Wrong answers, breaks and accessibility settings never change friendship.
- **Credited once:** credit is attached to the engine's own completion of a round, rescue or readiness part, which already happens once per round id, rescue or attempt. Retries, duplicate finish calls, reloads and offline resumes don't credit again. A readiness part that's already passed can't be restarted, so it can't be farmed.

## 4. Neglect can lower friendship (waiting on Kevin: Q1–Q3)
Kevin decided long neglect of a sick or dirty animal can lower friendship and only music rebuilds it. He left the details open. Claude's recommended defaults, built on the pet engine's existing clock:

- **When loss can start (Q1):** only after a warning period. A pet is already **sick** only after about 2 days of very low care (D2, `SICK_AFTER`). Recommended: friendship loss starts **1 more day after the pet becomes sick**, or after it has been **dirty (cleanliness below 40) for 3 days**. Sleeping hours count, like every other pet timer.
- **How much (Q2):** **5 points per further full day**, at most **15 points per neglect episode** (about a day and a half of play to rebuild). An episode ends when care brings the pet back to healthy and clean.
- **Floor (Q2):** points never drop below the start of the current level, so **a level and its unlocks are never lost**. Only progress toward the next level can go.
- **Long breaks and clock changes:** the per-episode cap means a two-week holiday costs at most 15 points. A clock set backwards changes nothing (negative time is ignored, as the pet timers already do).
- **Which pets (Q3):** recommended **active companion only**, since idle pets can't earn friendship back. Idle pets can still get sick and need care, as today.
- **Warnings (engine side):** `NQ.companions.bond(petId).atRisk = {reason:'sick'|'dirty', hoursLeft}` before any loss, so the UI can show the companion feeling unwell before anything happens. Event `companion:bond` fires with `{petId, lost}` when points drop.

Until Kevin answers Q1–Q3, the engine builds growth only and **nothing lowers friendship**.

## 5. Personality lean (C-B2)
Each finished round adds lean points by what kind of music was played. The mapping is data, authored by ChatGPT:

| Activity | Leans toward |
|---|---|
| Rhythm and timing, songs and performance | performer |
| Note reading, theory and ear-training questions | scholar |
| Rescues, map exploration, new stops | explorer |
| Readiness checks, review rounds, harder modes | braveheart |
| Proposed instead of pen care: slow, soft or legato pieces, and listening rounds | gentle |

Personality shown = 70% species baseline + 30% the companion's own lean mix. Only the active companion's lean changes (Q4 asks Kevin to confirm care adds no lean).

## 6. Unlocks and calls (as v0.2)
- `NQ.content.BOND_UNLOCKS = [{level, trait|null, id, kind:'dialogue'|'animation'|'cosmetic'|'activity', name}]`. A trait-tied unlock needs the level and that trait as the pet's current top. Activities are optional practice that reuses existing skills and never counts differently.
- Because levels never drop (section 4 floor), an earned unlock is never taken away.
- Calls: `NQ.companions.get()` / `set(petId)`; `bond(petId)` → `{petId, level, points, next, todayLeft, active, unlocked, atRisk}`; `personality(petId)` → `{baseline, current, top}`; event `companion:bond`. No setters for points, level or lean.

## 7. Guarantees (each becomes a test)
- Same seeded session with a different companion → identical skill states, pass days, next reviews, stop status, `journey`, coins, stickers and round results (compared field by field, not whole-save bytes).
- Credited once (section 3).
- Only the active companion's points rise; idle pets' points never rise.
- Care actions never change any pet's points.
- Points never drop below the current level's start; no unlock is ever removed. Until Q1–Q3 are answered: points never drop at all.
- A pet's bond changes only in the profile that owns it.
- Eggs have no bond until they hatch.
- Every species has a valid baseline personality.

## Still open
- **Kevin:** Q1–Q3 (neglect details) and Q4 (care adds no personality lean), plus confirming that the 09:31 and 09:34 answers replace C-B4 and C-B3's "never goes down".
- **ChatGPT:** trait names, activity → trait mapping (including what "gentle" comes from), fox and owl data and art, unlock lists, and how the companion shows "feeling unwell" before any friendship loss.
