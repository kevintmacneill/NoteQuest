# Melody Harbor Phase D proposal (Coding Agent, 2026-11-26)

**Status:** Draft Proposal — awaiting Kevin's approval before any Phase D code.

**Owner:** Coding Agent, on its own branch and a draft PR, only after this document is approved **and** Phase C has shipped.

**Authoritative context:** `HARBOR_V34_RECONCILIATION.md` remains the Phase C engine authority and is **not** overwritten by this file. `HARBOR_WORLD1_EXPANSION_SPEC.md` and `HARBOR_V33_REWORK_SPEC.md` still describe the A–C Harbor shape (9 stops, 4 recitals, E1–E7 / R1–R6). This proposal is additive. If Kevin approves it, Claude should fold the approved pieces into a follow-on note (suggested curriculum **3.5**) rather than rewriting the v3.4 engine rules.

**Engine stance:** no engine rule changes outside the minimal additions explicitly proposed below for Kevin's approval. Pass bars, tier unlock, spaced `secure`, daily stop pacing, test-out-slower, readiness families, coin rates, and `harborTierRules` stay as in `HARBOR_V34_RECONCILIATION.md` §2–§6.

## Preconditions

Phase D work does not start until all of the following have shipped:

1. **Phase A** — [PR #152](https://github.com/kevintmacneill/NoteQuest/pull/152) (Harbor assessment rules).
2. **Phase B** — v3.3 content for `U01`–`U06`, including the R4 **play** categories for `highLow`, `keyboardSide`, and `durationCompare`.
3. **Phase C engine** — one versioned PR: tiers, spaced secure, pacing, readiness, behind `harborTierRules` (curriculum ≥ 3.4 and `NQ-00`).
4. **Phase C content** — `U07`–`U09`, the 4 recitals with the Recital Stage presentation (picture-first art approval), and `hcb-black` in Song Station.

Until then, this file is review-only.

**Suggested curriculum ID:** **3.5** (or the next ID after 3.4). Existing `harborTierRules` should already apply to 3.5 if the gate is “curriculum ≥ 3.4.” Do not invent a second tier engine.

---

## Part 1 — Core Phase D (approved in principle)

Kevin approved this scope on 2026-11-26 at 11:55 AM PT (America/Los_Angeles): replace grown-up checks with kid-playable quizzes and mic checks, and expand L1–L3 content progressions inside Harbor lessons. The 9-stop / 4-recital A–C map stays; Phase D deepens what those stops teach.

Age calibration, used throughout: **Tier 1 is gentle and scaffolded for Zoe (5, beginner)**; **Tier 3 is full-keyboard and unassisted enough to challenge Micaela (7, Alfred Prep A)**. This matches the existing generator guidance in reconciliation §2 (slow / highlight-after-miss / shorter patterns at Tier 1; tighter, no visual hints, mixed related items at Tier 3). Phase D specifies the *content* at each tier, not a new speed-only ladder.

### 1. Zero grown-up-check gates

#### What exists today

Harbor currently has **five** non-blocking grown-up checks (`caregiver` / `teacher` content types; E4 / #152):

| ID | Stop | What the grown-up confirms |
|---|---|---|
| `NQ-00-U02-S01` | U02 Sit comfortably | Bench distance: elbows a little in front, feet flat, sit near the front of the bench |
| `NQ-00-U02-S02` | U02 | Relaxed arms and wrists: shoulders down, wrists level, five notes without stiffening |
| `NQ-00-U02-S03` | U02 | Curved “bubble” fingers, fingertips, and stopping if it hurts |
| `NQ-00-U04-S01` | U04 Loud, soft, short, and long | Plays one note loud then soft on request, three times (mic loudness was deferred) |
| `NQ-00-U04-S03` | U04 | Plays a 3-note “question” and a different 3-note “answer” |

Under v3.4 they never block, never pay, are not part of `secure`, and are excluded from readiness. **U02 is adult-only, so it is never paced and never gates U03** (reconciliation §4). `learn.pending()` lists them until a caregiver or teacher confirms.

Kevin's reason for changing this: parent checkboxes get clicked through. The child should show the habit, not a grown-up tapping “yes.”

#### Converted shape (keep the same five IDs)

Each converted skill becomes a normal Harbor **child-playable** skill: teach card, then E1 checks at Tiers 1–3, mixed prompts, piano first where a piano prompt is honest (E7). Acknowledging a teach card is still not evidence.

**A. “Spot the Good Habit” visual quizzes — new `spotChoice` content type.**

The child sees 2–4 pictures (or short stills) and taps the one that shows the good habit. Wrong answers can be retried; the second miss reveals the good picture and a short why-line (“Feet flat, sit near the front of the bench”). Pictures need alt text and Kevin's visual approval before going live, same picture-first rule as other new art.

Proposed public question:

```text
{ type:'spotChoice', prompt, choices:[{id, src, alt}], why? }
```

Answer: the correct choice `id`. Content names the habit family (`bench`, `arms`, `hands`, and later `loudSoftPose` if used). Generators vary pose, clothing, and left/right seating, and do not repeat the same correct picture consecutively (existing Harbor variety / signature rules).

Tier content:

| Tier | Feel |
|---|---|
| 1 | Two clearly different pictures; after a miss, highlight the good habit and read the why-line |
| 2 | Three pictures; distractors are closer (almost-right bench distance, almost-curved fingers) |
| 3 | Three or four pictures, no highlight before the reveal, more subtle misses |

**B. Real-piano mic soft-landing checks.**

These sit in the same skill as the pictures, as mixed-interaction categories, not as a second gate.

- **U02-S01 (bench):** pictures do the real work. Optional mic item: play a short comfortable five-finger pattern. A missed or unavailable mic **does not fail** the skill if the visual items met the E1 bar. On-screen keys remain the fallback (E7).
- **U02-S02 (arms / wrists):** pictures plus “play five notes without rushing,” judged loosely as a completed pattern, not as posture science. Same soft-landing: mic cannot be the only way to pass.
- **U02-S03 (bubble hands):** pictures, including a “stop and tell a grown-up if it hurts” scene. No mic test can detect pain; the visual / identify item carries that rule.
- **U04-S01 (loud / soft):** this one *can* be heard. Mix existing `loudSoft` identify items with mic play (“play a loud note, then a soft one”). If the mic is missing, identify and on-screen dynamics still let the child pass. (The engine already has `loudSoft`.)
- **U04-S03 (question and answer):** convert the checklist into child-playable `notePlay` / `echo` (3 notes up or out as a “question,” 3 different notes as an “answer”), judged in order. Timing is not judged here (R5).

**C. Optional, non-gating Parent Tip drawer.**

A quiet “Tips for a grown-up” control on these skills (and only these, unless Kevin extends it). It never starts a round, never writes `learn` history, never pays coins, never appears in `learn.pending()` or `today()`, and is never required to open a stop, take a check, or finish Harbor. Bench-height and “sit with your child the first week” advice lives here so it is not a checkbox gate.

#### Zero regression to U02 non-gating / non-paced rules

This is a hard constraint.

If U02's skills simply stop being `HUMAN_TYPES`, today's §4 definition (“a stop with a non-human skill is a child-learning stop”) would suddenly **pace U02 and gate U03**, adding a day and changing the agreed map. That is not allowed.

**Proposal, for Kevin's approval:** add an explicit stop field, defaulting to today's behavior:

```text
stop.pace: true | false   // default true when the stop has any child-playable skill
```

Set `pace: false` on `NQ-00-U02`. Then, even after S01–S03 are child-playable:

- U02 never spends the daily new-stop budget.
- U02 never gates U03. After U01, the next *paced* child stop is still U03, opening when `unitDoneDay['NQ-00-U01'] < eday`.
- U02 may be opened and played the same day as U01 or later, whenever the learner (or a grown-up) wants a habit break. Opened stays open.
- Practice, habit quizzes, and Parent Tips stay free.
- Readiness still must not require U02 (human types already excluded; keep excluding this stop, or only include it as optional enrichment, never as a world gate).
- Test-out credit still walks one *paced* child stop a day; U02 is not in that walk.

**U04-S01 and U04-S03:** U04 is already a paced child-learning stop because of `U04-S02`. Converting S01 and S03 does not add a stop or a new day. **Recommendation:** they become ordinary child skills in U04, so `unitDoneDay['NQ-00-U04']` waits until S01, S02, and S03 all have `tier ≥ 1`. The child can still finish them the same day U04 is open (reconciliation §4: within an open stop, later skills and the next day's opening are unchanged). This is more work inside U04, not a new island. If Kevin would rather keep U05 opening after S02 alone, say so; the alternative is a skill-level `requiredForPacing: false` on the former adult checks only.

#### Saves and `learn.pending()`

- Nothing earned is lowered.
- Converted IDs drop out of `learn.pending()`. A leftover caregiver “yes” is kept in history but is not mastery evidence and does not grant Tier 1 or `secure`.
- The child starts these skills at `tier 0` / not-introduced (or exploring after the teach card) and earns tiers by play.
- Coins: once converted, they use the same per-tier keys `learn:<id>:check:t<N>` as other Harbor child skills (rev7a rates; no pay after `secure` practice). They are no longer “never pay,” because they are no longer click-throughs. Easy `spotChoice` rounds still cannot be farmed after they are secure.

### 2. Progressive L1 → L2 → L3 content depth inside Harbor lessons

“L1 / L2 / L3” here **are** the existing engine tiers (`learn.start(id, 'check', {tier})`, `harborTierRules`). Do not add a second progression system. Generators already receive `tier` in their context (reconciliation §2). Phase D fills that `tier` with richer *targets*, not only slower/faster playback.

Prefer deepening **existing skill IDs**. Add a new ID only when the idea has no honest home. New IDs stay inside the **same 9 stops** so daily pacing does not grow. Strengthened existing skills keep R6 `recheck: true` where the pass bar gets materially harder, and never lower an earned state.

#### 2a. Deepen existing skills

| Skill | Child idea | Tier 1 (Zoe-friendly) | Tier 2 | Tier 3 (Micaela-facing) |
|---|---|---|---|---|
| `U01-S01` Find 2s and 3s | Black-key groups | Find a 2-group and a 3-group in a shown region; highlight after a miss | Find and play from groups across ≥ 2 octaves | **Full-keyboard landmark sweeps:** find a 2-group or 3-group anywhere, no visual hints |
| `U01-S02` High and low | Register | High vs low with a wide gap (v3.3: 12 down toward 5 semitones) | **High / mid / low:** name or play in a register | Named register anywhere on the span; tighter gaps; no hints |
| `U01-S03` Left and right | Keyboard sides | Left vs right, split at Middle C | Play left, then right; mixed identify and play | Unassisted side + register (“a low note on the left”), full span |
| `U05-S02` Middle C | The landmark C | Play / find **Middle C** only, with the “just left of the two black keys, in the middle” hint after a miss | **Low C, Middle C, and High C** octaves, by name and by ear | **Find ALL C's** on the current keyboard span |
| `U06-S01` Name C, D, and E | Landmarks near the 2-group | C, D, E nearest Middle C | Those letters in a nearby octave as well | **Find ALL C's, ALL D's, and ALL E's** across octaves |
| `U07-S01` Left-hand C, B, and A | Walking down from Middle C | LH C, B, A around Middle C only | A nearby lower octave | **Find ALL A's and ALL B's** (and C's) across octaves, still allowing a left-hand prompt |
| `U08-S01` Find F and G | Completing the 5-finger hand | F and G nearest Middle C | Nearby octaves | **Find ALL F's and ALL G's** across octaves |

R4 category coverage (listen / identify / play / echo, including play categories) still applies at every tier.

#### 2b. New skills inside existing stops

| Proposed ID | Stop | Why it needs its own ID | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|---|---|
| `NQ-00-U06-S05` The musical alphabet | U06, after C–D–E are introduced, not part of Recital 2 | Forward and backward A–G loops are a new idea, not an honest C–D–E item | Say and play **A–B–C–D–E–F–G–A** slowly, starting on A or C, with the letters visible | Start on other letters; **G–F–E–D–C–B–A–G** backward; short **steps** (2nds) and **skips** (3rds) as “next door” vs “skip one” | Unassisted forward and backward loops from a random start, mixed with step/skip identify and play, no letter strip |
| `NQ-00-U08-S06` Sharps, flats, and twins | U08, after all white-key letters exist, not part of Recital 3 | Accidentals and enharmonic names are new | Sharp = one key to the **right** (`A → A# → B`); play a named sharp next to a white key already known | Flat = one key to the **left** (`B → Bb → A`); also the white-key half steps **E–F** and **B–C** (“no black key in between”) | **Enharmonic twins:** the same black key has two names. All **5** pairs: `C#=Db`, `D#=Eb`, `F#=Gb`, `G#=Ab`, `A#=Bb`. Play items accept either name for the sounding key; “what else is this called?” items ask for the twin |

If Kevin wants fewer new IDs, `U06-S05` can move to `U05-S05` (after Middle C) and `U08-S06` to `U09-S05`. Recommendation: keep them where the prerequisites are already taught (alphabet after C–D–E; accidentals after F and G close the white-key set).

Steps and skips in `U06-S05` are a light introduction only. A full interval unit (4ths, 5ths, harmonic vs melodic, `C → G`) is the optional Part 2 item, not core Phase D.

### 3. Schema, linter, and test impact

**Stay inside existing `harborTierRules`:** tier unlock and `tier-locked`, E1 9/10 at every tier, spaced `mastery: [d1,d2,d3]`, `unitDoneDay` and opened-never-closes, test-out credit walk, readiness families plus `U09-S01` / `U09-S04` at `tier ≥ 1`, per-tier coin keys, recital adapter rules, and R4/R5 variety. Phase D must not retune those numbers.

**Minimal additions, for Kevin's approval:**

| Addition | Where | Purpose |
|---|---|---|
| `content.type: 'spotChoice'` | curriculum data + `NQ.learn` generator / `learn.validate` / `learn.types()` / ENGINE_API | Visual habit quizzes. Documented in ENGINE_API only when implemented. Alternative, if Claude prefers fewer types: an approved extension of `symbol` or `conceptChoice` that still carries picture `src`, `alt`, and `why`. |
| Habit picture assets | approved art, picture-first | One correct picture and distractors per U02 (and any U04 visual) prompt family, with alt text |
| `stop.pace` (`false` on U02) | curriculum stop record + pacing code path already described in reconciliation §4 | Preserve U02 non-gating / non-paced behavior after the skills are child-playable |
| `allOctaveTargets` (or equivalent generator context) | skill content for letter-find / note-play skills | The set of MIDI pitches for a letter (or pitch class) on the **current Harbor keyboard span** (every key the on-screen or connected piano actually shows; never require a hidden key). Tier 3 “find ALL X's” draws from this set. |
| Enharmonic equivalence | note-matching in play / echo / `letterFind` / `notePlay`, plus a small `NQ.music` helper if one is not already enough | Sounding-pitch items: `A#` and `Bb` (and the other four twins) are the same key. Name items: “what else is this called?” expects the twin spelling. Do not mark a correct black-key *playing* of `A#` wrong because the detector labeled it `Bb`. |
| Curriculum **3.5** data | `CURRICULUM.id` after 3.4 | New skills, converted types, `pace: false`, deepened generators. v3.4 saves migrate without lowering state; converted grown-up IDs are not auto-secured. |

**Lint (`tools/curriculum/lint.py`):**

- `spotChoice` blocks validate (prompt, ≥ 2 choices, exactly one correct, every picture has `src` and `alt`).
- `stop.pace === false` is allowed only when explicitly set (U02); U03 still opens from U01, not U02.
- `allOctaveTargets` for each required letter covers the declared keyboard span with no duplicates and no out-of-span MIDI.
- The five enharmonic twins are complete and consistent.
- New skills keep unique IDs, prereqs, R4 coverage at every tier, and readiness still never includes human types or U02 as a required family member.
- Variety / signature lint on every new or deepened generator.

**Tests (`tests/run_engine_tests.sh`):**

- U02 remains unpaced and never gates U03 after conversion; U02 skills can be played without spending the daily budget.
- Converted IDs are absent from `learn.pending()` and do not require `{by:'caregiver'}`.
- `spotChoice` first-try scoring, retry, and reveal behave like other Harbor scored items (E1, extras cap unchanged).
- U04-S01 / S03 can pass at Tier 1 without a mic when the non-mic categories are enough; with a mic, loud/soft play items score.
- Tier 3 “find ALL C's” (and the other letters) asks every target in `allOctaveTargets` over the planned items without consecutive duplicates.
- Playing `A#` accepts the `Bb` key (and each other twin); a “twin name” item does not accept the same spelling back.
- A v3.4 profile with a pending U02 caregiver check loads into 3.5 with U02 still open or openable, no lowered states, and no credited `secure` on the converted skills.
- Existing Harbor 3.4 engine tests (tiers, spaced days, mixed review, test-out walk, readiness, recital R5) stay green.

---

## Part 2 — Optional Month-1 expansion menu

Kevin asked to **keep, trim, or defer** these seven extras. They are **not** in the approved core until he marks them. Default recommendation is in the last column; the decision column is for Kevin.

Use **Keep in Phase D** / **Defer to Phase D2 or World 2** / **Drop**.

| # | Topic | Suggested placement | Effort | Value | Recommendation | Kevin's decision |
|---|---|---|---|---|---|---|
| 1 | **Legato (smooth) vs. staccato (bouncy) touch** | New or deepened skill in **U04** (already short/long and loud/soft) or a touch add-on in **U08** | Medium: teach + ear/play items; mic can help but needs a soft-landing if detection is rough | High for musical playing; pairs naturally with duration | **Keep in Phase D** if touch can be shown with pictures + “play it smooth / bouncy” without over-trusting the mic; otherwise Defer | |
| 2 | **3/4 time (waltz), dotted half notes (3 beats), bar lines, repeat signs (`:||`), and tempo** | Deepen **U06-S03** (already quarter / half / whole / quarter rest) and use 3/4 in a later melody skill | Medium-high. Engine already draws dotted halves (`beats` / `note:'dhalf'`, PR #53). Bar lines, repeats, 3/4 feel, and tempo words are mostly new teaching + generators | High for real songs and for not leaving Harbor in an all-4/4 world | **Keep a thin slice in Phase D** (dotted half + “some songs feel in 3”) in U06-S03; defer a full repeat-sign / tempo unit to Phase D2 if it crowds U06 | |
| 3 | **Intervals up to octaves** (2nds, 3rds, 4ths, 5ths `C → G`, octaves; melodic vs. harmonic) | New skill in **U08** or **U09** after white keys exist. Core Phase D already introduces steps/skips in `U06-S05` | Medium-high: ear, play, and together-vs-apart items. `NQ.listen.expectChord` can support harmonic intervals | High ear training; some overlap with core alphabet steps/skips | **Defer to Phase D2** (keep only steps/skips in core `U06-S05`), unless Kevin wants the full interval ladder in Harbor | |
| 4 | **Grand Staff guideposts** (5 lines / 4 spaces, Treble G, Bass F, Middle C) | New skill late **U08** or **U09**. Mark `requiresReading` carefully so a non-reader path remains (Zoe may still be picture-first) | High: new notation teaching, staff art, and transfer to the real keyboard | High for later worlds, but Harbor is piano-first by ear and letter. Easy to over-build for a 5-year-old | **Defer to World 2** (or a thin Middle C-on-the-staff preview only, if Kevin wants a taste) | |
| 5 | **First C Major chord** (`C–E–G` broken and blocked) | Deepen **U08** or **U09** after C–E–G are known. `NQ.listen.expectChord([60,64,67])` already exists | Medium | High: first harmony, clearly earned by the 5-finger hand | **Keep in Phase D** as one skill (broken at Tier 1, blocked at Tier 2–3) | |
| 6 | **Two-hand coordination** (simple LH bass **C / G** drone + RH melody) | Deepen existing **U09-S02** (“a short two-hand idea,” already LH whole-note C + RH tune at Tier 3) rather than a new stop | Medium | High, and it is already half-present. A C/G drone is the natural next step | **Keep in Phase D** as a deepening of `U09-S02` (Tier 1 hands-separate; Tier 3 LH C/G + RH melody, slowly) | |
| 7 | **Two more recitals** (*Twinkle, Twinkle, Little Star* and *Jingle Bells* chorus), taking Harbor from **4 to 6** recitals | Prefer **no new stops** (keeps the 9-stop pacing): attach *Twinkle* to **U05** and *Jingle Bells* to **U07**, both public domain, both on the Recital Stage with the same picture-first art gate. New Song Station arrangements required | High: two arrangements, Recital Stage hooks, scoring, and tablet time | Nice for “more concerts,” but the 09:08 / expansion requirement is already met by the four A–C recitals | **Defer to Phase D2** unless Kevin wants two more Harbor concerts before Amazon | |

No extra topic is scheduled into a branch until Kevin fills the decision column (or replies in coordination). Core Part 1 can ship without any of them.

---

## Part 3 — Build and review plan

When Kevin approves this proposal (including any Part 2 keeps / defers / drops):

1. **Not before Phase C has shipped** (A, B, C engine, and C content).
2. Coding Agent works on **its own branch** and opens a **draft PR**. No edits to [PR #152](https://github.com/kevintmacneill/NoteQuest/pull/152), to `chatgpt/harbor-v33-assessment`, or to the Phase C engine PR.
3. Follow the curriculum data format. Do not change engine rules outside what this approved proposal (and Claude's follow-on 3.5 note) allow.
4. Run `tools/curriculum/lint.py` and `tests/run_engine_tests.sh`.
5. New habit and Recital Stage-adjacent art, if any still lands in this PR, stays **picture-first**: Kevin previews and approves before it goes live.
6. **Independent exact-head approval from Claude**, plus **green CI**, before merge.
7. **No merge without Kevin's go-ahead.**

Until that approval, this is a coordination spec only. No Phase D game code.

Posted by Coding Agent (Grok) for Kevin.
