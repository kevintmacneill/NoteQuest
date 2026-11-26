# Melody Harbor: reconciling the World 1 expansion with v3.3 and #152 (Claude, 2026-11-26)

**Sources:**
- `HARBOR_V33_REWORK_SPEC.md` (E1–E7, R1–R6): kept;
- `HARBOR_WORLD1_EXPANSION_SPEC.md` (the Cursor/Coding Agent spec): the content authority;
- PR #152 (E1–E4 draft).

This file holds the **exact engine rules** for Phase C, and supersedes the expansion spec only where it says so. ChatGPT builds; Claude reviews at the exact head.

## 0. Owner decisions that apply
- **2026-11-26 08:34–08:37:** Harbor is a 2–4 week foundation, with all four expansion levers.
- **2026-11-26 09:20 (new, to Claude): "Test out, but slower."** A child who passes the placement check or the end-of-world check early still skips the stops she proved, **but the one-new-stop-a-day limit still applies**: tested-out stops are credited **one per calendar day**. So Micaela can't clear Harbor in a day, and she isn't made to redo lessons she already knows.

## 1. Phases and versions (agreeing with the expansion spec)
| Phase | Scope | Curriculum ID | Engine gate |
|---|---|---|---|
| A | #152 E1–E4, as written | 3.3+ | `harborCheckRules` (`/^3\.(?:[3-9]\|[1-9]\d+)$/`, `NQ-00`); unchanged |
| B | v3.3 content U01–U06 plus the expansion's mixed-interaction upgrades (`highLow`, `keyboardSide`, `durationCompare`, listen/identify/play/echo) | **3.3** | as A |
| C | U07–U09, 4 recitals, tiers, spaced secure, pacing, mixed reviews, new readiness | **3.4** | a new `harborTierRules(level)`: curriculum ≥ 3.4 **and** `NQ-00`. Everything in §2–§6 sits behind it. |

**One amendment to the v3.3 R4 categories (Phase B):** `highLow`, `keyboardSide` and `durationCompare` each gain a **play** category: "play a high/low note", "play left then right", "play a short/long note". So the R4 "≥ 2 per category" coverage includes play items. `isGameCurriculum` already accepts 3.x.

## 2. Tiers (Phase C)
- **Record:** add `tier` (0–3, the highest tier passed; absent means derived, see §6) to each Harbor child skill record in `p.learn.skills[id]`.
- **Round size:** `learn.start(id, 'check', {tier})`. `tier` defaults to the next unpassed tier, or 3 once all are passed. Tier N needs tier N−1 passed, otherwise `{ok:false, reason:'tier-locked'}`. Practice rounds take an optional tier for difficulty only, and never record tier evidence.
- **Generators** get `tier` in their context. Tier 1: slow, highlight after a miss, shorter patterns. Tier 2: piano first, mixed moves. Tier 3: tighter intervals or tempo, no visual hints, and up to 2 of 10 items from a declared related skill. The R4 category coverage applies at every tier.
- **Pass bar:** E1 (9 of the first 10 on first try) at every tier, and for recitals.
- **On a pass:**
  - Tier 1 sets `tier ≥ 1` and state `≥ developing`.
  - Tier 3 records mastery evidence (§3).
  - Tier passes never use the daily stop budget (§4).
- **Recitals** use the Song Station engine through a learn adapter, so that results reach `learn` with the same round, token and coin rules (WP-0.7 envelope, rev7a pay). Tier 3 judges pitch **and** rhythm with the existing tolerances. A confident wrong note is a miss; timeout, low confidence and replay are unscored (R5).

## 3. Spaced secure (Phase C; supersedes E1's "2 passing days" for Harbor 3.4+ only)
- **Effective day:** `eday = max(localDayIndex(now), p.learn.hw)` (days since the epoch, device clock). Then `p.learn.hw = eday`. That's the same high-water rule as coins, so moving the clock back can't replay a day, and moving it forward only helps once.
- **Mastery record:** `mastery: [d1, d2, d3]`, effective-day integers in each skill record.
- **Tier 3 pass on day `d`:**
  - with no `d1`: `d1 = d`;
  - else with no `d2` and `d ≥ d1 + 2`: `d2 = d`;
  - else with no `d3` and `d ≥ max(d1 + 5, d2 + 3)`: `d3 = d`, and the state becomes **`secure`**.
  
  A pass that comes too early records nothing. Missed days never reset.
- **Due reviews:** `dueReviews` lists a Harbor skill when its next spaced pass is eligible (`eday ≥ d1+2` or `eday ≥ max(d1+5, d2+3)`). Day 3 and Day 6 rounds use Tier 3 settings with mixed prompts, drawn from a different generator seed than the previous check.
- **Mixed-review credit** (U05-S04, U09-S01):
  - a **passed** review gives a mastery pass to each covered skill that had **at least 2 items, all first-try correct**;
  - this only counts when that skill's next spaced pass is eligible that day (it never fills `d1`, which needs a Tier 3 pass of the skill itself).
- **Grown-up checks** are unchanged: never block, never pay, and not part of `secure`.

## 4. Daily stop pacing (Phase C)
- **Child-learning stop:** a stop with a non-human skill (the #143 definition). U02 is adult-only, so it's never paced and never gates.
- **`unitDoneDay[stopId]`:** the first effective day on which every child skill in the stop has `tier ≥ 1`. For a stop with a recital, Tier 1 of the recital is enough, since the recital can only start after the earlier skills' Tier 1 passes. Recorded once, never changed.
- **Opening a stop:** a Harbor child stop *S* (after U01) opens when the previous child-learning stop *P* has `unitDoneDay[P] < eday`, meaning *P* was finished on an earlier day. The existing sequence, world and prerequisite rules still apply on top. **Opened stops never close again.**
- **Within an open stop:** the recital starts the same day once the stop's earlier child skills have Tier 1.
- **Never capped:**
  - practice on unlocked skills;
  - climbing tiers;
  - due reviews;
  - recital replays and Song Station songs;
  - practice games, pets and the village.
- **Read-only API:** `learn.nextStopOpensOn(p)` returns `{stopId, day}` or `null`, so the map can say "Your next island opens tomorrow!"

## 5. Test out, but slower (owner decision 09:20)
- **Credit, not completion:** placement (`placement.pick` or a placement check) and an early end-of-world pass grant **credit** for the stops they cover: `p.learn.credit = {through: stopId, from: eday}`. They don't mark those skills learned all at once.
- **Daily walk:** each effective day (evaluated lazily on read, inside one guarded write), the frontier advances by **at most one** credited child stop. Its child skills get `tier = max(tier, 1)` and state `≥ developing`, with `credited: true` provenance, and `unitDoneDay[stop] = eday`. Mastery (Tier 3 and spaced secure) still has to be earned by play.
- **Opening the next world:** Harbor's next world opens when the frontier has walked past U09 (credit counts) **and** the world's readiness is passed (§6). So a child who tests out of all of Harbor reaches Amazon after about 8 days of short visits.
- **Placement into a later world** (the grown-up pick): **the walk only applies within Harbor.** For a world after Harbor, the current `placeAt` rule stands, so a grown-up placing Micaela straight into Amazon works at once. **This needs Kevin's confirmation once Amazon is reworked.**

## 6. Readiness and save safety
**End-of-world readiness for Harbor 3.4** (replaces R1's "every child skill once"). The three parts keep `J_ITEMS`/`J_PASS` unchanged:

| Part | Skills it draws from |
|---|---|
| navigation | U01-S01, U03-S01, U06-S01 |
| performance | U07-S02, U08-S02 |
| timing | U06-S03, U08-S03 |

That's **one family each**: keyboard geography, ear, C–D–E, left hand, five-finger, note values and rests, and melody in time.

**Opening the next world also needs `tier ≥ 1` on U09-S01 and U09-S04** (credited or played). Lint changes to: readiness covers each declared family at least once, and never includes human types.

**Saves from v3.2 and v3.3 loading into 3.4:**
- Nothing earned is lowered.
- `secure` gives `tier 3` and a complete `mastery`.
- `developing` gives `tier 1`.
- `learning` or new gives `tier 0`.
- R6 `recheck` is kept for strengthened skills. **New for Phase C:** U01-S02, U01-S03, U04-S02 (play moves) and U06-S03 (whole notes and rests) are added to the recheck list.
- Stops already open at migration stay open. Pacing applies only to stops not yet open. `unitDoneDay` is back-filled as "before today" for already-finished stops.
- `hw` starts at today.
- No migration from the original game.

**Coins (WP-0.4 rev7a):** use per-tier keys `learn:<id>:check:t<N>`, at the same 1, ½, ¼, 0 daily repeat rate. Credited skills pay nothing. A due spaced review pays once per day per skill. Recitals use `learn:<id>:check:t<N>` too.

## 7. Tests (Phase C)
- **Tiers:** unlock order and the `tier-locked` refusal; Tier 3 passes on days 1, 2 and 3 grant nothing beyond `d1`; days 1, 3 and 6 grant `secure`; days 1, 4 and 7 also grant it (missed days don't reset); moving the clock backwards doesn't replay a day.
- **Mixed review:** credits only covered skills that are eligible that day, and never `d1`.
- **Pacing:**
  - U01 finished on day 0 means U03 opens on day 1, not day 0;
  - U02 never gates;
  - practice, recitals, songs and games are allowed with a stop capped;
  - opened stops never close.
- **Test out:** a full Harbor test-out walks one stop a day. The next world stays locked until the walk passes U09 and readiness is passed. The walk is credited, not secure, and pays no coins.
- **Readiness:** family coverage lint. U09-S01/S04 tier ≥ 1 is required.
- **Saves:** a v3.3 profile (with secure, developing and recheck skills) loads into 3.4 unchanged; tiers are derived; open stops stay open.
- **Recital:** Tier 3 judges pitch and rhythm; R5 outcomes are unscored.
- Plus the existing variety lint for every new generator.

## 8. Order (owners per DECISIONS 2026-11-26 11:55, Phase C split)
1. **ChatGPT:** land #152 (A) as written.
2. **ChatGPT:** Phase B content (3.3), with the §1 R4 amendment.
3. **ChatGPT:** Phase C engine (§2–§6), as **one engine PR with a version**. I'll review the exact rules.
4. **Coding Agent**, after step 3 lands: Phase C content (U07–U09, the 4 recitals with the Recital Stage presentation, and `hcb-black` in Song Station). The stage, audience and dragon art need Kevin's picture approval first. Phase D (`HARBOR_PHASE_D_PROPOSAL.md`) follows after C ships, once Kevin approves its spec.
5. Kevin plays Harbor on the tablet.
