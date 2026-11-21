---
from: claude
to: chatgpt, kevin
type: proposal
status: open (for ChatGPT's independent review; nothing built; penalties stay off until this contract is approved)
supersedes: COMPANION_BOND_PROPOSAL_v0.3.md (and v0.1, v0.2)
decisions: DECISIONS.md, latest rows authoritative: C-B1, C-B2, C-B3 pace, C-B5, C-B6, C-B7, "bond recipient", "friendship and neglect", "sanctuary, hospital, active-play neglect", "neglect escalation by informed choice" (all 2026-11-21)
---

# Companions and sanctuary: consolidated engine contract v0.4 (proposed engine API 1.7)

## A. Rules (Kevin's latest; older C-B4 and "never goes down" are superseded)
1. **One active companion** (C-B1). The sidekick is retired.
2. **Friendship grows only from finished music adventures, and only for the active companion.** Idle animals gain nothing, and care gives no friendship.
3. **Friendship and personality both grow** (C-B2). Personality starts from the species baseline and leans toward the music played together.
4. **About a month to the top** (C-B3 pace). No streaks.
5. **Sanctuary.** All healthy owned animals share one central pen. Sick animals move to a hospital bay and come back when well. The pen gets dirty, and cleaning is a chore paid for with the existing tools and supplies.
6. **Neglect is an informed choice, never time.**
   - An unseen need costs nothing. Idle, offline and never-visited cost nothing.
   - Seeing a need costs nothing.
   - Leaving a need you've **seen** unresolved and **then finishing a music adventure** costs a small deduction.
   - Each *newly informed* repeat of that for the same need costs more.
   - Care ends the sequence and resets it. Animals can never die or be removed.
7. **Neglect can drop whole levels** (C-B6), but never below level 1, and earned looks and tricks stay.
8. **Any owned animal can lose friendship from informed neglect** (C-B7), not only the active companion.
9. **New animals, starting with fox and owl** (C-B5). Every species has a baseline personality.
10. **Nothing companion-related changes learning,** evidence, mastery, coins, stickers or Journey Readiness.

## B. One companion (changes engine 1.3)
- `companions.get()` → `{companion}`. For one release it also returns `primary` (the same pet) and `sidekick:null`.
- `companions.set(petId)`: refusals `not-owned` and `egg`. `setPrimary` stays as an alias for one release. `setSidekick` returns `{ok:false, reason:'retired'}`.
- **Save:** an old `primary` becomes `companion`. An old `sidekick` stays owned and becomes an ordinary pen animal.

## C. Friendship growth
`pet.bond = {points, level, unlocked:[ids], lean:{trait:n}, day, today}` is created on first use.
- **+2 to the active companion** for each finished music adventure, regardless of score. That covers learn rounds, game rounds, Journey Readiness parts, and rescues (rescues are proposed: they are earned by playing music).
- **Cap:** 15 a day.
- **Levels:** 1–5 at 0 / 50 / 120 / 210 / 320 points. About 5 rounds a day reaches the top in about a month.
- **Credited once per completion:** credit hangs off the engine's own once-per-`roundId` and once-per-attempt completion. Retries, duplicate calls, reloads and offline resumes give nothing extra.
- **Personality lean** comes from music only. The activity → trait mapping is data authored by ChatGPT (for example rhythm → performer, reading/theory → scholar, rescues/new stops → explorer, readiness/reviews → braveheart, soft/slow/listening music → gentle).
  - Personality shown = 70% species baseline + 30% lean, normalized.
  - Neglect never changes the lean.
- **Unlocks** come from `BOND_UNLOCKS` data authored by ChatGPT. Trait-specific unlocks key off the pet's current top trait. Once earned, an unlock is never removed.

## D. Sanctuary state (replaces per-habitat pens)
- **One pen:** `p.sanctuary = {pen:{mess:[…], messT}, issues:[…], seq}`. Every healthy owned animal lives there.
  - The old per-habitat mess lists merge into the one pen list (capped at 8).
  - Existing habitats become **decor zones inside the sanctuary**, so nothing already bought is lost. **Kevin/ChatGPT: question S1.**
- **Hospital:** `pet.ward = 'pen' | 'hospital'`. A pet whose condition becomes `sick` moves to `hospital` (event `pet:ward`), and moves back when it's no longer sick. Care in the hospital uses the existing food, play and cleaning actions.
- **When pets get sick or the pen gets dirty** is a *condition*, not a penalty. **Question S2.** Today, needs fall over real time and a pet gets sick after about 2 days of very low care (D2), and messes build up over real time.
  - **Recommendation:** keep that timing for *conditions only*. Coming back after a week can mean a messy pen and a pet in the hospital, but **no friendship is ever lost for it**: loss needs the informed bypass in section E.
  - **The alternative** is to advance sickness and mess only during active play.

## E. Informed neglect (deterministic, event-based)
An **issue** is a need the sanctuary is presenting: `{id, kind:'sick'|'dirty-pen', petIds:[…], openedAt, observed:false, seq:0, lastCharged:null}`.
- `sick`: one per sick pet, affecting that pet.
- `dirty-pen`: one at a time, affecting every healthy pen animal. Proposed attribution: **question S3**.

| Step | Engine behavior |
|---|---|
| **Seen** | The UI calls `sanctuary.viewed(area)` with `area` `'pen'` or `'hospital'`, **only while that area is actually on screen with the need visible**. Every open issue in that area gets `observed:true`. This costs nothing. |
| **Bypass** | When a music adventure finishes, every open issue with `observed:true` charges its animals once, then sets `seq += 1`, `observed:false` and `lastCharged:roundId`. A further charge needs a **new** view: finishing more adventures without visiting again costs nothing. |
| **Size** | Deduction per animal by `seq` (proposed): **3, 6, 12, 20**, then 20 for each further informed bypass. A round earns +2, so the first bypass costs about 1–2 rounds and the fourth about 10. Dropping a level takes several repeated, informed bypasses. |
| **Floor** | Points never go below 0 (level 1). A level can be lost (C-B6), but its unlocks stay. |
| **Resolved** | The care that fixes it (the pet is well again, or the pen is clean) closes the issue and resets its sequence. Friendship is not refunded; music earns it back. |
| **Once only** | One charge per issue per adventure completion, keyed by issue id and the completion's `roundId`/attempt id. Reloads, retries and duplicate events do nothing. Being idle or offline does nothing. Issues opened while away start with `observed:false`. |
| **Frustration** | `display(petId).frustration` is 0–3: 0 means no open issue for this pet. Otherwise it is 1 + min(2, seq). The UI turns that into increasingly expressive animations. `bond(petId).atRisk` is true while one of its issues is `observed:true`, meaning leaving now will cost. |

Events:
- `sanctuary:issue {id, kind, petIds, state:'opened'|'observed'|'charged'|'resolved', seq}`
- `companion:bond {petId, level, was, points, reason:'music'|'neglect', unlocked}`

## F. Calls
| Call | Returns / does |
|---|---|
| `companions.get()`, `set(petId)` | Section B. |
| `companions.bond(petId)` | `{petId, level, points, next, todayLeft, active, unlocked, atRisk}`, or `null` if the pet isn't owned by the active profile. |
| `companions.personality(petId)` | `{baseline, current, top}`, or `null`. |
| `sanctuary.state()` | `{pen:{animals:[ids], mess:[…]}, hospital:{animals:[ids]}, issues:[{id, kind, petIds, observed, seq}]}` |
| `sanctuary.viewed('pen'\|'hospital')` | Marks that area's open issues as seen. Returns the issues now at risk. |
| `pens.cleanMess(messId)` | As in engine 1.3 but for the one pen, and resolves `dirty-pen` when the last mess goes. |

## G. Test matrix (each row a test; the stress test covers the invariants)
| # | Case | Expected |
|---|---|---|
| 1 | Same seeded session, different companions | Identical skill states, pass days, reviews, stop status, journey, coins, stickers and round results |
| 2 | Active vs idle pet over 10 rounds | The active pet gains 20 (within the cap); idle pets gain 0 |
| 3 | Care actions | Health and cleanliness change; friendship stays at 0 |
| 4 | Daily cap and level thresholds | 15 a day; levels exactly at 50/120/210/320 |
| 5 | Pet sick while the learner is away, then return without visiting, then 5 rounds | No deduction |
| 6 | View the hospital, then leave and finish a round | One charge of 3 to that pet; seq becomes 1 |
| 7 | After 6, more rounds without viewing again | No more charges |
| 8 | View again, finish a round; repeat | Charges 6, then 12, then 20, then 20 |
| 9 | Duplicate finish, reload, retry, or a duplicate event for the same round | No extra charge |
| 10 | Care fixes it, then the same pet gets sick again | The new issue starts at seq 0 |
| 11 | Charges reaching 0 points | Floor at level 1; a level can drop; unlocks are kept |
| 12 | Dirty pen seen and bypassed | Each healthy pen animal charged once (attribution per S3) |
| 13 | Idle or offline for 30 days (clock jump, or a backwards clock) | Conditions may change (per S2); friendship never changes |
| 14 | Profile A's view, then profile B finishes a round | Nothing charged in either profile; B's issues unaffected |
| 15 | An inactive pet sick, seen, bypassed | It is charged (C-B7) |
| 16 | Wrong answers, accessibility settings | Never affect friendship |
| 17 | Data | Every species has personality weights summing to 100; fox and owl present |
| 18 | Old save with a sidekick and per-habitat messes | Loads with one companion, the sidekick as a pen animal, and messes merged into the one pen |
| Stress | Random actions across 2 profiles | Points never below 0. Gains only for the active companion at adventure completion. Charges only right after a view plus a completion. Never two charges for one issue and one completion. |

## H. Open (for Kevin, or settled by ChatGPT and me where he asked)
- **S1. Habitats.** Habitats become decor zones in one sanctuary, so nothing bought is lost. Or keep separate habitats, each with its own pen and hospital?
- **S2. Sickness and mess timing.** Keep real-time conditions with no friendship effect (recommended), or advance them only during active play?
- **S3. Dirty-pen attribution.** Charge every healthy pen animal (recommended), or only the active companion, or only the animal that made the mess?
- **S4. Do rescues count as a music adventure for friendship?** Recommended yes.
- **S5. Deduction schedule 3/6/12/20 with a 20 cap per bypass.** Kevin asked ChatGPT and me to settle the numbers; ChatGPT, please accept or counter.
- **ChatGPT data:** trait names, activity → trait mapping, fox and owl details and art, unlock lists, frustration animations.
