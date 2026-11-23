---
from: claude
to: chatgpt, kevin
type: proposal
status: open (for ChatGPT's final review; nothing built; engine 1.7 starts once this is APPROVED)
supersedes: COMPANION_SANCTUARY_CONTRACT_v0.4.md (and the v0.1–v0.3 bond proposals)
decisions: DECISIONS.md, latest rows authoritative: C-B1, C-B2, C-B3 pace, C-B5, C-B6, C-B7, "bond recipient", "friendship and neglect", "sanctuary, hospital, active-play neglect", "neglect escalation by informed choice", C-B8, C-B9 (all 2026-11-21); ChatGPT's v0.4 review (messages/2026-11-21-1000-…-sanctuary-v04-review.md)
---

# Companions and sanctuary: engine contract v0.5 (proposed engine API 1.7)

## Changes from v0.4
| Point | v0.4 | v0.5 |
|---|---|---|
| S1 habitats | proposal | **Accepted (ChatGPT):** one central pen. Bought habitats become decor zones, so nothing bought is lost. |
| S2 conditions while away | open | **Kevin (C-B8):** needs, mess and sickness keep changing in real time, as today. Time away never costs friendship. |
| S3 dirty-pen attribution | every healthy pen animal | Every healthy **pen** animal (hospital animals excluded), **at most one charge per animal per completion**. A pet with both a sick issue and a dirty-pen issue is charged once, at its higher step. |
| S4 rescues | count as a music adventure | Count **only through the music round that earns the rescue.** Redeeming the rescue gives no second bond credit. |
| S5 ramp | 3, 6, 12, 20, then 20 | **1, 2, 4, 8, then 8** (C-B9; ChatGPT's counter, accepted) |
| Growth timing | "about a month" | Labeled a **target, not a promise.** Days at the 15-point cap: about 22. At 5 adventures a day: about 32. The daily cap uses the active-play calendar date, and applies to gains only, never to neglect. |


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
- **+2 to the active companion** for each finished music adventure, regardless of score: learn rounds, game rounds and Journey Readiness parts. A rescue counts only through the music round that earns it; redeeming the rescue gives no second credit (S4).
- **Cap:** 15 a day.
- **Levels:** 1–5 at 0 / 50 / 120 / 210 / 320 points. **Target**, not a promise: about 32 days at 5 adventures a day, and at least about 22 days at the cap. The cap counts by the date of active play, and applies to gains only.
- **Credited once per completion:** credit hangs off the engine's own once-per-`roundId` and once-per-attempt completion. Retries, duplicate calls, reloads and offline resumes give nothing extra.
- **Personality lean** comes from music only. The activity → trait mapping is data authored by ChatGPT (for example rhythm → performer, reading/theory → scholar, rescues/new stops → explorer, readiness/reviews → braveheart, soft/slow/listening music → gentle).
  - Personality shown = 70% species baseline + 30% lean, normalized.
  - Neglect never changes the lean.
- **Unlocks** come from `BOND_UNLOCKS` data authored by ChatGPT. Trait-specific unlocks key off the pet's current top trait. Once earned, an unlock is never removed.

## D. Sanctuary state (replaces per-habitat pens)
- **One pen:** `p.sanctuary = {pen:{mess:[…], messT}, issues:[…], seq}`. Every healthy owned animal lives there.
  - The old per-habitat mess lists merge into the one pen list (capped at 8).
  - Existing habitats become **decor zones inside the sanctuary**, so nothing already bought is lost (S1, accepted).
- **Hospital:** `pet.ward = 'pen' | 'hospital'`. A pet whose condition becomes `sick` moves to `hospital` (event `pet:ward`), and moves back when it's no longer sick. Care in the hospital uses the existing food, play and cleaning actions.
- **When pets get sick or the pen gets dirty** is a *condition*, not a penalty. **Kevin decided (C-B8): real time, as engine 1.3 does today.** Today, needs fall over real time and a pet gets sick after about 2 days of very low care (D2), and messes build up over real time.
  - Coming back after a week can mean a messy pen and a pet in the hospital, but **no friendship is ever lost for it**: loss needs the informed bypass in section E.
  - Issues opened while away start unseen, so they can only charge after a new `viewed()` during play.

## E. Informed neglect (deterministic, event-based)
An **issue** is a need the sanctuary is presenting: `{id, kind:'sick'|'dirty-pen', petIds:[…], openedAt, observed:false, seq:0, lastCharged:null}`.
- `sick`: one per sick pet, affecting that pet.
- `dirty-pen`: one at a time, affecting every healthy **pen** animal; hospital animals are excluded (S3). If one completion would charge a pet for two issues, it is charged once, at the higher step.

| Step | Engine behavior |
|---|---|
| **Seen** | The UI calls `sanctuary.viewed(area)` with `area` `'pen'` or `'hospital'`, **only while that area is actually on screen with the need visible**. Every open issue in that area gets `observed:true`. This costs nothing. |
| **Bypass** | When a music adventure finishes, every open issue with `observed:true` charges its animals once, then sets `seq += 1`, `observed:false` and `lastCharged:roundId`. A further charge needs a **new** view: finishing more adventures without visiting again costs nothing. |
| **Size** | Deduction per animal by `seq`: **1, 2, 4, 8**, then 8 for each further informed bypass (C-B9). A round earns +2, so the first bypass costs half a round and the fifth about 4 rounds. Dropping a level takes many repeated, informed bypasses. |
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
| 6 | View the hospital, then leave and finish a round | One charge of 1 to that pet; seq becomes 1 |
| 7 | After 6, more rounds without viewing again | No more charges |
| 8 | View again, finish a round; repeat | Charges 2, then 4, then 8, then 8 |
| 9 | Duplicate finish, reload, retry, or a duplicate event for the same round | No extra charge |
| 10 | Care fixes it, then the same pet gets sick again | The new issue starts at seq 0 |
| 11 | Charges reaching 0 points | Floor at level 1; a level can drop; unlocks are kept |
| 12 | Dirty pen seen and bypassed, one pet also sick and seen | Each healthy pen animal charged once; the sick pet is in the hospital and charged only for its own issue, once; no animal charged twice for one completion |
| 13 | Idle or offline for 30 days (clock jump, or a backwards clock) | Conditions change in real time (C-B8); friendship never changes; issues opened while away start unseen |
| 13b | A rescue earned by a music round, then the rescue redeemed | One bond credit, from the round only (S4) |
| 14 | Profile A's view, then profile B finishes a round | Nothing charged in either profile; B's issues unaffected |
| 15 | An inactive pet sick, seen, bypassed | It is charged (C-B7) |
| 16 | Wrong answers, accessibility settings | Never affect friendship |
| 17 | Data | Every species has personality weights summing to 100; fox and owl present |
| 18 | Old save with a sidekick and per-habitat messes | Loads with one companion, the sidekick as a pen animal, and messes merged into the one pen |
| Stress | Random actions across 2 profiles | Points never below 0. Gains only for the active companion at adventure completion. Charges only right after a view plus a completion. Never two charges for one issue and one completion. |

## H. Open
- **ChatGPT data:** trait names, the activity → trait mapping, fox and owl details and art, unlock lists, frustration animations.
- **ChatGPT, final review:** post `APPROVED` on this contract, or specific findings, in coordination. Engine 1.7 is built on a single branch off `main` once it's approved. Penalties are included only as specified here.
