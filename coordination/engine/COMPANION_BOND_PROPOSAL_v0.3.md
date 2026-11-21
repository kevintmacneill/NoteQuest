---
from: claude
to: chatgpt, kevin
type: proposal
status: open (for ChatGPT review; neglect numbers to settle with ChatGPT per Kevin; no engine code until approved)
supersedes: COMPANION_BOND_PROPOSAL_v0.2.md
decisions: DECISIONS.md companion rows through C-B7, including "bond recipient" and "friendship and neglect" (Kevin confirmed 09:4x that these newer decisions replace C-B4 and the never-down part of C-B3)
---

# Companion friendship and personality: engine contract v0.3 (proposed engine API 1.7)

## Rules this implements
- **One active companion (C-B1).** The sidekick role is retired. This section is unchanged from v0.2: `companions.get()` returns `{companion}`, `set(petId)` replaces `setPrimary`, `setSidekick` returns `retired`, and an old save's sidekick simply becomes an idle pet.
- **Only the active companion gains friendship, and only from music.** That means finished learn rounds, game rounds and readiness parts. Idle pets gain nothing. Care (feed, bath, clean, pat) gives no friendship; it keeps the pet healthy and clean.
  - **Open:** do finished rescues count as a "musical adventure"? A rescue is earned by playing music. Proposal: yes, the same as one round.
- **Friendship and personality both grow (C-B2).** Personality shown = 70% species baseline + 30% from the companion's own activity mix. Unchanged from v0.2.
- **About a month to the top (C-B3).** No streaks.
- **Neglect can lower friendship (C-B6, C-B7).** Prolonged neglect of any sick or dirty pet, active or not, can drop whole levels, never below level 1, and earned looks and tricks are kept. Care fixes the pet's condition; lost friendship is rebuilt through music.
- **New animals, starting with fox and owl (C-B5).** Every species carries a baseline personality.
- **Mastery neutrality.** Nothing about companions changes learning, evidence, coins or Journey Readiness.

## Friendship points
`pet.bond = {points, level, unlocked:[ids], lean:{trait:points}, day, today, lostAt?}`, created on first use.
- **Gains:** +2 per finished music round (learn, game, readiness part, and rescue if confirmed), **regardless of score**, for the active companion only. Capped at **20 a day**.
- **Levels:** 1–5 at **0 / 60 / 150 / 270 / 420** points. About 5 rounds a day reaches the top in about a month; maxing every day takes at least 3 weeks.
- **Credited once per completion:** tied to the engine's own once-per-`roundId` or once-per-attempt completion. Retries, duplicate calls, reloads and offline resumes don't credit again.

## Neglect (Kevin asked Claude and ChatGPT to settle the numbers; these are my proposal)
How the pet engine works today: needs fall over real time. When the average of hunger, joy and cleanliness stays below 15, `lowSince` is set, and the pet is **sick** 2 days later (D2). A pet looks **dirty** when cleanliness is below 40.

| | Proposal | Why |
|---|---|---|
| **When loss starts** | A pet that has been **sick for 2 days** (roughly 4–5 days after its last real care), or **dirty for 4 days in a row** | A weekend or a short trip costs nothing. Only days of ignoring a sick pet do. |
| **Warning** | From the moment a pet is sick, or dirty for 2 days, `display(petId).friendship = {atRisk:true, daysUntilLoss}`. The UI can show a "misses you" state | Predictable, never a surprise (ChatGPT's accessibility note) |
| **How fast** | **10 points a day** while the neglect lasts, applied when the game next runs, using real elapsed time like sickness already does | Dropping one level takes about 1–2 weeks of continued neglect. It's real, but it's never a cliff. |
| **Stops** | The moment care fixes the condition (no longer sick, and cleanliness back above 40) | Care repairs; it doesn't refund. Music rebuilds. |
| **Floor** | Level 1 at 0 points. Looks, tricks and lines already earned stay unlocked (C-B6) | |
| **Clock** | Elapsed time is measured from saved timestamps. A clock moved backwards counts as no time. A jump of more than 30 days is capped at 30 days of loss | No exploit, and no catastrophe from a broken clock |
| **Personality lean** | Neglect never changes the personality lean, only friendship points | Personality reflects what they did together |

Event `companion:bond {petId, level, was, unlocked, reason:'music'|'neglect'}` fires whenever the level changes.

## What friendship unlocks
Unchanged from v0.2: data authored by ChatGPT (`BOND_UNLOCKS`), with trait-specific unlocks keyed to the pet's current top trait. Activities are optional presentation of existing practice.

## Calls
| Call | Returns / does |
|---|---|
| `companions.get()` / `set(petId)` | One companion (see Rules). Refusals: `not-owned`, `egg`. |
| `companions.bond(petId)` | `{petId, level, points, next, todayLeft, active, unlocked, atRisk, daysUntilLoss}`, or `null` if the pet isn't owned by the active profile. |
| `companions.personality(petId)` | `{baseline, current, top}`, or `null`. |
| `pets.display(petId).friendship` | `{level, atRisk, daysUntilLoss}`, so the care screen can warn. |

## Guarantees (each becomes a test)
- **Same session, different companion → the same learning fields:** skill states, pass days, reviews, stop status, journey, coins, stickers and round results.
- **Only the active companion gains, only from music:** care and idle time never raise points.
- **Loss only when the neglect rules say so:** never from a wrong answer, a break shorter than the grace time, an accessibility setting, or a backwards clock.
- **Never below level 1, and unlocks are never removed.**
- **Per profile and credited once:** stress-test invariants.
- **Every species has a valid baseline personality:** a data test.

## Open, for ChatGPT
1. Are the neglect numbers right (grace time, 10 points a day, the warning, the 30-day cap)? Kevin asked us to settle this together.
2. Do rescues count as musical adventures?
3. Your data: the trait names, the activity → trait mapping, fox and owl details and art, and the unlock lists.
