# Melody Harbor: engine rules for the Prep A Harbor (Claude, rev 3, 2026-11-27)

**Sources:**
- `HARBOR_PREP_A_CURRICULUM_SPEC.md` (Grok, 2026-11-27): **the content authority** for World 1 (12 stops, 46 skills). This file never changes content; where they disagree on content, the spec wins.
- `HARBOR_V33_REWORK_SPEC.md` (E1–E7, R1–R6): kept.
- PR #152 (E1–E4 draft): unchanged by this file.
- `HARBOR_WORLD1_EXPANSION_SPEC.md` and `HARBOR_PHASE_D_PROPOSAL.md`: superseded by the Prep A spec where they disagree.

This file holds the **exact engine rules** for Phases C and D. Claude builds the engine; ChatGPT or Grok reviews it at the exact head (07:11 rule: Claude never reviews Claude).

**Rev 3 (2026-11-27, about 12:30 PT):** reconciled with Grok's Prep A remap (`messages/2026-11-27-0725-coding-agent-to-claude-harbor-prep-a-remap.md`, items 1–10). The ten schema answers from Kevin and Grok (12:25) are in §9.

## 0. Owner decisions that apply
- **2026-11-26 08:34–08:37:** Harbor is a 2–4 week foundation.
- **2026-11-27, about 04:05:** no one-new-stop-a-day cap. Pacing comes from depth, tiers, spaced `secure` and the cool-down (§4).
- **2026-11-27 04:31 answers:** placement credits every proven stop **at once, at Tier 1** (§5); Tier 3 needs the real piano, with "no piano never fails" for Tiers 1–2.
- **2026-11-27 (Claude `c6f0fde`, now in the spec):** **no visible lesson timer.** Response times are measured invisibly. No timer, countdown or ms/dB number shows in any profile unless a grown-up setting (off by default) turns it on.
- **2026-11-27, about 07:30 (live call):** **Melody Harbor = Alfred's Prep Course Level A, the whole book and nothing beyond it.** 12 stops, 46 skills. Rests, eighth notes, legato/staccato, named intervals, hands together, sharps/flats/naturals as reading symbols and the C major chord leave Harbor.
- **2026-11-27, architecture notes only (no engine rules yet):**
  - **RCM baseline:** the nine-world design aligns to the RCM 11-level curriculum, theory and history co-requisites included. Harbor stays Alfred Prep A. Keep level and skill IDs free of any one method book's numbering, so a later RCM crosswalk is a mapping, not a rename.
  - **Holiday-aware calendar:** seasonal repertoire is surfaced by date and filtered to the learner's level. Engine implication for later: songs need a skill-requirement tag the scope guard (§9 P9) can check, so a holiday song never shows content above the learner's world.
  - **Content and avatar policy:** as recorded in DECISIONS. No engine rule in this file.

## 1. Phases and versions
| Phase | Scope | Curriculum ID | Engine gate |
|---|---|---|---|
| A | #152 E1–E4, as written | 3.3+ | `harborCheckRules` (`/^3\.(?:[3-9]\|[1-9]\d+)$/`, `NQ-00`); unchanged |
| B | v3.3 content: U01–U06, skills S01–S03 of each, plus the mixed-interaction upgrades (`highLow`, `keyboardSide`, `durationCompare`, listen/identify/play/echo) | **3.3** | as A |
| C | U07–U09; the new skills in U01–U06 (**U03-S04, U03-S05 Recital 1, U05-S04 mixed review, U06-S04 Recital 2, U06-S05**); U08-S05 Recital 3; the strengthened U06-S03 (dotted half, whole, 4/4 vs 3/4); tiers, spaced secure, cool-down, mixed review, recital adapter; §9 P3, P4, P7 (time signatures, bar lines, repeats), P9, P10 | **3.4** | `harborTierRules(level)`: curriculum ≥ 3.4 **and** `NQ-00`. Everything in §2–§6 sits behind it. |
| D | U10–U12 staff reading, U12-S04 mixed review, U12-S05, U12-S06 Recital 4; §9 P1, P2, P5, P6, P7 (staff parts), P8 | **3.5** | `harborTierRules` plus the next-world gate in §6, which needs 3.5 |

- **World 2 stays "coming soon" until 3.5** (Kevin and Grok, 12:25). U12 is the real Harbor gate, and World 2 is being rescoped to Prep B. Under 3.4 the Harbor frontier ends at U09 and no next world opens. `lockedWorldGate` keeps `NQ-01` closed; the §6 readiness and gate rules are defined now and apply from 3.5.
- **The R4 categories (Phase B):** `highLow`, `keyboardSide` and `durationCompare` each gain a **play** category ("play a high/low note", "play left then right", "play a short/long note"). The R4 "≥ 2 per category" coverage includes play items. `isGameCurriculum` already accepts 3.x.
- **Stop IDs:** U09 is now "C position, both hands". The old U09 skills move to U12 (spec §3 ID map). Live v3.2 has only U01–U06 in `NQ-00` (checked against `index.html` at `f6178ed`), so this needs no save migration beyond §6. v3.3 U01–U06 S01–S03 IDs and meanings match the spec.

## 2. Tiers (Phase C)
- **Record:** add `tier` (0–3, the highest tier passed; absent means derived, see §6) to each Harbor child skill record in `p.learn.skills[id]`.
- **Round size:** `learn.start(id, 'check', {tier})`. `tier` defaults to the next unpassed tier, or 3 once all are passed. Tier N needs tier N−1 passed, otherwise `{ok:false, reason:'tier-locked'}`. Practice rounds take an optional tier for difficulty only, and never record tier evidence.
- **Generators** get `tier` in their context. Tier 1: slow, highlight after a miss, shorter patterns. Tier 2: piano first, mixed moves. Tier 3: tighter ranges or tempo, no visual hints, and up to 2 of 10 items from a declared related skill. The R4 category coverage applies at every tier.
- **Fluency (Tier 3 and Day 3/6 reviews only):** each skill declares `maxResponseMs`: **2,500** for keyboard geography, letters and fingers; **3,000** for staff reading. A correct answer slower than that is a first-try miss ("Right key — now quicker"). Tiers 1–2 are untimed (only the R5 20-second timeout). For a `staffLine` item, the limit applies to the first note (§9 P6). The limit and the measured time are **never shown** (§0, §9 P10).
- **Rhythm tolerance:** ±110 ms at Tier 3, recitals and reviews; ±160 ms at Tier 1 and ±130 ms at Tier 2. The same for every presentation profile.
- **Real instrument:** at Tier 3, ≥ 5 of 10 items are play/echo where an honest play form exists, heard by the mic or MIDI. With no piano connected, Tier 3 isn't offered: the lesson shows "Connect your piano to show mastery". It never fails the child.
- **Pass bar:** E1 (9 of the first 10 on first try) at every tier, and for recitals and reviews.
- **On a pass:**
  - Tier 1 sets `tier ≥ 1` and state `≥ developing`.
  - Tier 3 records mastery evidence (§3).
  - Tier passes are never paused by the cool-down unless §4 says so.
- **Recitals** (U03-S05, U06-S04, U08-S05, U12-S06) use the Song Station engine through a learn adapter, so results reach `learn` with the same round, token and coin rules (WP-0.7 envelope, rev7a pay). Tier 3 judges pitch **and** rhythm at ±110 ms, and U12-S06 also judges `f`/`p` (§9 P8). A confident wrong note is a miss; timeout, low confidence and replay are unscored (R5).

## 3. Spaced secure (Phase C; supersedes E1's "2 passing days" for Harbor 3.4+ only)
- **Effective day:** `eday = max(localDayIndex(now), p.learn.hw)` (days since the epoch, device clock). Then `p.learn.hw = eday`. That's the same high-water rule as coins, so moving the clock back can't replay a day, and moving it forward only helps once.
- **Mastery record:** `mastery: [d1, d2, d3]`, effective-day integers in each skill record.
- **Tier 3 pass on day `d`:**
  - with no `d1`: `d1 = d`;
  - else with no `d2` and `d ≥ d1 + 2`: `d2 = d`;
  - else with no `d3` and `d ≥ max(d1 + 5, d2 + 3)`: `d3 = d`, and the state becomes **`secure`**.

  A pass that comes too early records nothing. Missed days never reset.
- **Due reviews:** `dueReviews` lists a Harbor skill when its next spaced pass is eligible (`eday ≥ d1+2` or `eday ≥ max(d1+5, d2+3)`). Day 3 and Day 6 rounds use Tier 3 settings with mixed prompts, drawn from a different generator seed than the previous check.
- **Mixed-review credit** (**U05-S04**, covering U01–U04; **U12-S04**, covering the whole world, `minPerSkill: 2`):
  - a **passed** review gives a mastery pass to each covered skill that had **at least 2 items, all first-try correct**;
  - this only counts when that skill's next spaced pass is eligible that day (it never fills `d1`, which needs a Tier 3 pass of the skill itself).
- **Grown-up checks** are unchanged: never block, never pay, and not part of `secure`.

## 4. Effort & Retention Cool-Down (Phase C; replaces daily stop pacing)
**Rev 2 (Claude, 2026-11-27).** Kevin dropped the one-new-stop-a-day cap (DECISIONS 2026-11-27, about 04:05): Harbor's 2–4 weeks must come from depth, difficulty, tiers and spaced `secure`, not a calendar lock. The engine instead **pauses new unlocks for a short while when effort drops or learning isn't sticking**. The signals and behavior below follow Grok's proposal (`messages/2026-11-27-0415-…` §2.3). Thresholds are named constants so tests and tuning can change them. `unitDoneDay` and `learn.nextStopOpensOn` are withdrawn. PR #174 implements this section.

**Scope:** behind `harborTierRules` (curriculum ≥ 3.4 and `NQ-00`), like the rest of Phase C. Grown-up (human-type) items are never paused. Adult-only stops (U02, `stop.pace:false`) never count toward any signal.

**What the engine records** (per learner, in `p.learn`, all small):
- `recent`: the last 5 **scored first-try lesson answers**, as `{t, ok, ms|null, type, skillId}`. `ms` comes from the screen (`learn.answer(..., {ms})`), measured from the end of the prompt to the answer, and is **never displayed** (§9 P10). Missing or invalid values are `null`, and those items never feed the timing signals.
- `rt[type]`: the learner's **own baseline**, the last 20 correct `ms` values per question type. It's never an age norm.
- `session = {startedAt, lastAt, openedStops:[], startedSkills:[], failedChecks:{skillId:n}, triggered:false}`. A **new session** starts when ≥ `CD_NEW_SESSION_MIN` (45) minutes have passed since `lastAt`.
- `cooldown = {since, until, reason} | null`, plus `thw`, a **time high-water mark** (the latest time seen). The effective time is `max(now, thw)`.

**Signals** (checked after each scored lesson answer, each finished check, and each stop opening; at most **one trigger per session**):
1. **Retention dip (`reason:'retention'`):** ≥ 3 first-try misses among the last 5 scored items of this session, **or** the same skill fails its check twice in this session.
2. **Rushing (`'rushing'`):** ≥ 3 of the last 5 are wrong **and** each of those wrong answers was faster than `max(400 ms, 0.4 × median(rt[type]))`. It needs ≥ 5 baseline samples for that type.
3. **Drifting (`'drifting'`):** the median `ms` of the last 5 is > 2.5 × the baseline median for those types. It needs ≥ 5 baseline samples and ≥ 4 timed items.
4. **Pileup (`'pileup'`):** opening a 3rd new child stop this session while ≥ 2 stops opened this session still have a child skill below Tier 1, **or** ≥ 4 skills started this session with none reaching Tier 1.

**When triggered:** `cooldown = {since: eff, until: eff + CD_MINUTES (90) min, reason}`, `session.triggered = true`, event `learn:cooldown {until, reason}`. It **never** lowers a state, changes a tier or `mastery`, takes coins, breaks a streak, or writes a fail.

**Active while** `eff < until` and it's still the same session. **A new session clears it** (≥ 45 minutes away), and so does reaching `until`. Turning the clock back can't extend or restart it, because of the high-water mark. Turning it forward ends it early, which is the same documented local-clock limit as the coins.

**Paused while active** (refused with `{ok:false, reason:'cooldown', until, why:reason}`):
- opening a stop not opened before (`markLearned` / the stop's first `learn`);
- `learn.start` on a never-started skill;
- a **new tier check** (`check` mode) on the skill(s) that triggered it;
- `journey.start` (a readiness part opens a new world).

**Never paused:** practice on started skills, `review` (due spaced reviews), recital replays of unlocked recitals, Song Station, practice games, pets and the village, grown-up items, and placement already in progress.

**Reads:** `learn.cooldown()` returns `{active, until, reason} | null` and is pure. `learn.today()` leaves out new-stop items while active and adds `{kind:'cooldown', until, reason}` first. The copy is Grok's (`nq-harbor.js`, per presentation profile); the engine only gives the reason code. **No countdown is shown** to the child (§0); the copy says when to come back in words, not a ticking clock.

## 5. Placement and early passes (owner decision, 2026-11-27 04:31)
- **Credit at once, at Tier 1:** placement (`placement.pick` or a placement check) and an early end-of-world pass credit **every stop they prove**, immediately. Each covered child skill gets `tier = max(tier, 1)` and state `≥ developing`, with `credited: true` provenance. `p.learn.credit = {through: stopId, at: eday}` records it.
- **Credited, not secure:** mastery (Tier 3 and the Day 1 → 3 → 6 checks) still has to be earned by play. Credited skills pay no coins.
- **The cool-down still applies afterwards** (§4). Credited skills are already at Tier 1, so they never count toward the pileup signal.
- **Opening the next world:** the frontier is past U12 (credit counts), §6 readiness is passed, and the §6 gate holds. From 3.5 only.
- **Placement into a later world** (the grown-up pick): the current `placeAt` rule stands. **This needs Kevin's confirmation once World 2 is rescoped.**
- The rev 2 one-stop-a-day "daily walk" is **withdrawn**.

## 6. Readiness and save safety
**End-of-world readiness for Harbor** (replaces R1's "every child skill once"; applies from 3.5). The three parts keep `J_ITEMS`/`J_PASS` unchanged:

| Part | Families | Skills it draws from |
|---|---|---|
| navigation | keyboard geography, ear, **reading** | U01-S01, U03-S01, U06-S01, **U10-S02, U11-S02, U12-S02** |
| performance | left hand, five-finger | U07-S02, U08-S02 |
| timing | **note values and time signatures**, melody in time | U06-S03, U08-S03 |

- Parts are fixed at three; families are the coverage unit. A part draws its `J_ITEMS` across its families, at least one item per family. Reading items are screen items at T1–T2 settings, so readiness never needs a piano.
- **Opening the next world also needs `tier ≥ 1` on U12-S04 and U12-S06** (credited or played).
- **Lint:** readiness covers each declared family at least once, and never includes human types.

**Saves from v3.2 and v3.3 loading into 3.4 / 3.5:**
- Nothing earned is lowered.
- `secure` gives `tier 3` and a complete `mastery`.
- `developing` gives `tier 1`.
- `learning` or new gives `tier 0`.
- R6 `recheck` is kept for strengthened skills. **Added for Phase C:**
  - U01-S02, U01-S03, U04-S02 (play moves);
  - U06-S03 (dotted half, whole notes, 4/4 vs 3/4, bar line and double bar; **no rests**);
  - **U04-S01** (loud and soft moves from a v3.3 grown-up check to an engine-checked skill: identify by ear, read `f`/`p`, play the contrast). A v3.3 grown-up confirmation is kept as it is, and the engine-checked review is queued.
- Stops already open at migration stay open. No `unitDoneDay` back-fill.
- `hw` starts at today.
- No migration from the original game.

**Coins (WP-0.4 rev7a):** use per-tier keys `learn:<id>:check:t<N>`, at the same 1, ½, ¼, 0 daily repeat rate. Credited skills pay nothing. A due spaced review pays once per day per skill. Recitals use `learn:<id>:check:t<N>` too.

## 7. Tests (Phases C and D)
- **Tiers:** unlock order and the `tier-locked` refusal; Tier 3 passes on days 1, 2 and 3 grant nothing beyond `d1`; days 1, 3 and 6 grant `secure`; days 1, 4 and 7 also grant it (missed days don't reset); moving the clock backwards doesn't replay a day.
- **Fluency:** a correct Tier 3 answer slower than `maxResponseMs` is a first-try miss; at Tiers 1–2 it isn't; a replay restarts the timer and is never an attempt; an R5 timeout is unscored. No result field the child's screen reads contains `ms` (§9 P10).
- **No piano:** Tiers 1–2 complete on screen; Tier 3 isn't offered and nothing is recorded as a fail.
- **Mixed review:** U05-S04 and U12-S04 credit only covered skills that are eligible that day, and never `d1`.
- **Cool-down (rev 2):**
  - each signal triggers, and does not trigger one step below its threshold;
  - rushing and drifting need ≥ 5 baseline samples;
  - paused vs. never-paused actions match §4, and grown-up items are never paused;
  - at most one trigger per session; a new session (≥ 45 min) clears it;
  - turning the clock back can't extend or restart it;
  - no state, tier, `mastery`, coin or streak change;
  - **a fast, accurate learner can open several stops in one sitting with no cool-down** (Kevin's intent);
  - U02 never counts; opened stops never close.
- **Placement:** a full Harbor placement credits every proven stop at once at Tier 1; it is credited, not secure, and pays no coins. Under 3.4 World 2 stays locked; under 3.5 it opens only past U12 with readiness and the U12-S04/S06 gate.
- **Readiness:** family coverage lint, including the reading family. U12-S04/S06 tier ≥ 1 is required.
- **Saves:** a v3.3 profile (with secure, developing, grown-up-confirmed U04-S01 and recheck skills) loads into 3.4 unchanged; tiers are derived; open stops stay open; rechecks are queued.
- **Recitals:** Tier 3 judges pitch and rhythm (and `f`/`p` on U12-S06); R5 outcomes are unscored.
- **Prep A primitives (§9):** one test group per item P1–P10, including every P9 rejection and the P4 rule that C4 counts for either hand in Middle C position.
- Plus the existing variety lint (E3) for every new generator.

## 8. Order (owners per DECISIONS 2026-11-26 22:40 and 2026-11-27)
1. **ChatGPT:** land #152 (Phase A). Nobody else touches it.
2. **Grok (Coding Agent):** Phase B content (3.3, U01–U06 S01–S03) through `tools/curriculum/`, per the Prep A spec, plus the curriculum lint (spec §8, field names in §9 P9).
3. **Claude:** the Phase B engine primitives on Grok's wishlist (generator options, `echo`, `contourListen`, play answers, `presentation` / `maxResponseMs` / `rhythmToleranceMs`), then the **Phase C engine** (§2–§6, §9 P3, P4, P7 time/bar/repeat, P9, P10), each as a versioned engine PR. ChatGPT or Grok reviews; Claude reviews Grok's content.
4. **Grok:** Phase C content (3.4: U07–U09, the new U01–U06 skills, Recitals 1–3 with the Recital Stage). The stage, audience and dragon art need Kevin's picture approval first.
5. **Claude:** the **Phase D engine** (§9 P1, P2, P5, P6, P7 staff parts, P8) plus `spotChoice` and `dynamics` (U02 and U04-S01). Then **Grok:** Phase D content (3.5: U10–U12, Recital 4 *Ode to Joy*), which also opens World 2's gate.
6. Kevin plays Harbor on the tablet.

**World 2+ engine backlog (not Harbor):** `articulation` (legato/staccato), `twoHandTrack:'together'`, rests and eighth notes, `interval` / `harmonicInterval`, `enharmonicTwins` and accidental reading, chords (`expectChord` C triad). Each one stays out of `NQ-00` by §9 P9.

## 9. Prep A engine primitives (approved by Kevin and Grok, 2026-11-27 12:25)
| # | Primitive | Rule | Phase |
|---|---|---|---|
| P1 | `notes` or `range` | `noteName`, `noteFind` and `notePlay` accept either `notes:[…]` or `range:[lo, hi]` (every natural from lo to hi, inclusive). Exactly one of the two; both or neither is a validation error. On `contourRead` (and `staffLine`), `staff` is an alias for `clef`; giving both with different values is an error. | D |
| P2 | Middle C on either staff | On `staff:'grand'`, a `notes` entry may be a string or `{note, staff:'treble'\|'bass'}`. A string keeps today's rule (C4 and up on treble). An object forces the staff, so `{note:'C4', staff:'bass'}` draws Middle C on the ledger line above the bass staff. The question key includes the staff, so treble C4 and bass C4 count as different questions for E3. Matches the original game's "Middle C Galaxy" level. | D |
| P3 | `hand` and `position` | `hand:'L'\|'R'` and `position:'middleC'\|'C'` fix which finger plays which key. **Middle C:** RH 1–5 = C4–G4; LH 1 = C4, 2 = B3, 3 = A3, 4 = G3, 5 = F3. **C:** RH 1–5 = C4–G4; LH 5 = C3 … 1 = G3. Used by `finger`, `letterFind`, `notePlay`, `pattern` and `staffLine`. (Grok's 07:25 draft wrote `position:'C3'`; the approved name is `'C'`.) | C |
| P4 | `twoHandTrack:'alternate'` | Each step carries `hand`. Judged on **pitch order and register** only: RH notes ≥ C4, LH notes ≤ C4. In Middle C position, C4 counts for either hand. In C position, LH tops out at G3. The engine never records or reports which physical hand pressed a key, and no copy claims the mic heard a hand. The UI shows clear LH/RH cues. `'together'` is refused in `NQ-00` (P9). | C |
| P5 | Step vs skip | `contourRead` gains `ask:'stepSkip'`: two written notes; the answer is `'step'` (next letter: line to space, or space to line) or `'skip'` (two letters: line to line, or space to space). No interval names anywhere in the question or choices. The existing `'same'` answer is shown as "repeat" in Harbor (presentation only; the answer value stays `'same'`). | D |
| P6 | `staffLine` | New generator for U10-S03, U11-S03 and U12-S03. Content: `staff`, `notes` or `range`, `length` (2–4 notes), `maxStep` (1–2 letters), optional `meter` (`'4/4'\|'3/4'`), `rhythm` (beat values), `hands` (`'R'\|'L'\|'alternate'`), `repeat` and `dyn`. Draws the line with `staffSVG`; the answer is the keys played in order. Tiers 1–2 judge pitch order only. Tier 3 with `meter` also judges onsets (±110 ms, `judgeOnsets`). `maxResponseMs` applies to the first note. One item per round slot (`single`). | D |
| P7 | Symbols | **Grok owns** the canonical `show` list and the semantic symbol IDs. **Claude owns** the engraved primitives in `staffSVG`, so they match the staff renderer: `staff-lines`, `staff-spaces`, `note-line`, `note-space`, `brace`, `bar-line`, `double-bar`, `repeat-end`, `time-4-4`, `time-3-4`, `note-dhalf`, plus the existing `clef-treble`, `clef-bass`, `dyn-f`, `dyn-p`. Already drawn today: ledger lines, bar lines, the final double bar, dotted halves, grand staves. To add: brace, `repeat-end` (`:\|\|`) and time signatures. **ChatGPT owns** illustrated and storybook art, not engraving. Time signatures, bar lines and repeats are Phase C (U06-S03, U08-S04); the staff parts are Phase D. | C/D |
| P8 | Songs: dynamics and repeats | A song note may carry `dyn:'f'\|'p'` (it applies from that note on), and a song may contain a repeat bar. Song Station expands the repeat for judging and draws `repeat-end`. At Tier 3, dynamics are judged by **relative contrast** between the `f` and `p` passages, calibrated to the device (`minContrastDb`), never by absolute dB. Used by U12-S05 and U12-S06 (*Ode to Joy*, RH, treble staff); the `dyn` marks are Grok's content. | D |
| P9 | Prep A scope guard | **Both** the engine (`validateContent`, behind `harborTierRules`, reason `prep-a-scope`) and Grok's curriculum lint refuse `NQ-00` content that has: (1) the generator types `interval`, `chordQuality`, or the chord-building types `chordBuild`, `inversion`, `harmonize`, `cadence`, `secondaryDominant`; (2) `twoHandTrack:'together'`; (3) a symbol `show` starting with `rest-`, `articulation-`, `accidental-` or `eighth`; (4) any ♯, ♭, `#` or `b` accidental in a note name (`/^[A-G](?:#\|b\|♯\|♭)/`); (5) a beat value under 1 (in `beats.values`, `rhythmTap` patterns, `durationsBeats`, `staffLine.rhythm` and song durations). Live v3.2 Harbor (18 skills) passes all five today, including the four extra theory types below (checked at `4738857`). **For Grok to confirm:** the remaining theory types (`keySignature`, `scaleBuild`, `stepPattern`, `degree`) are also beyond Prep A; I propose adding them to rule 1. | C |
| P10 | Hidden telemetry | No `ms`, dB, timer or meter reaches a child-facing screen in any profile. The engine keeps `ms` and dB in `p.learn` and in a grown-up read that the UI shows only when the grown-up setting (off by default) is on. | C |

**Presentation rule from P9 (UI, any owner):** in Harbor, black keys are geography only. No visible text or accessibility label names a black key as a sharp or flat. PR #172's black keys switch to positional labels ("Black key 1 from the left").
