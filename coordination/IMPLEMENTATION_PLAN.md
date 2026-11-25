# NoteQuest implementation plan: work packets for ChatGPT (Claude, 2026-11-24)

Turns [ROADMAP.md](ROADMAP.md) into buildable work packets. **ChatGPT builds; Claude reviews every packet at its exact head** (rerunning every test, reading the diff against DECISIONS.md, and trying to break saves, coins and routes). ChatGPT merges after an exact-head `APPROVED` and green CI.

**Authorization:**
- Packets marked **[AUTH]** are already authorized by Kevin.
- Packets marked **[ROADMAP]** start only when Kevin approves ROADMAP.md.
- **[K]** marks a gate where Kevin must approve something (a mockup or a decision) before or during the work.

**Rules for every packet:**
- one PR per packet, unless it says otherwise;
- branch from the current main;
- `NQ.version` gets a patch bump for any engine change;
- `ENGINE_API.md` is updated for any engine change;
- storage names are derived only from `saveFormat()`, never new literals (otherwise previews leak);
- `sh tests/run_engine_tests.sh`, `bash tools/preview/test_build_site.sh` and every browser test in `.github/workflows/tests.yml` pass;
- the PR body lists the packet ID and every acceptance check, with its result.

---

## M0: engine safety and specs (run in parallel)

### WP-0.1 [AUTH] Finish #125 (save safety)
- ChatGPT does its final runtime verification at `7de0c77` (CI green, run 45434596941), approves and merges, and closes #126.
- **Accept:** merged at the approved commit; main's CI is green afterwards.

### WP-0.2 [ROADMAP] #119: locked worlds refuse lessons, with a placement exception
Engine zone (`index.html`, functions `stopUnlocked` ~l.996, `learnStart` ~l.1274, `jStart` ~l.1378).
1. **`stopUnlocked(stopId)`:** the first stop of a world after Melody Harbor is unlocked **only** if `journeyUnlocked(previousWorld)`, or the stop is placed (`learn.place` or placement), or `p.unlockAll`. **Remove** the "a skill here is already past not-introduced" exemption for world gates (it only existed for learners from before 1.6). Stops inside a world keep their current rules.
2. **`learnStart(skillId, mode)`:** if the skill's stop isn't unlocked, return `{ok:false, reason:'locked', gate:{worldId}}`. **Exception:** `mode:'review'` on a skill whose record is already `secure`.
3. **`jStart(worldId, partId)`:** allowed only when (a) `worldId` is the gate world (the world after the last unlocked one, or NQ-00), or (b) placement is active and `worldId === placement.status().nextWorld`. Otherwise `{ok:false, reason:'locked'}`.
- **Tests** (in `curriculum_v32_node.js`, real engine; expected values in brackets):
  - fresh learner: `learn.start('NQ-01-U01-S01','practice')` [`reason:'locked'`, `gate.worldId:'NQ-01'`];
  - `currentStop()` [`NQ-00-U01`];
  - pass all 3 NQ-00 readiness parts through `journey` → start [`ok:true`] and `currentStop()` [`NQ-01-U01`];
  - `placement.pick('NQ-01')` → start [`ok:true`];
  - `unlockAll` → start [`ok:true`];
  - review of a placed secure skill in a locked later world [`ok:true`]; practice of the same [`locked`];
  - the #119 repro steps (markLearned, practice to `developing`, start, cancel, reload) → World 2 still locked;
  - `journey.start('NQ-03','navigation')` with nothing unlocked [`locked`];
  - placement active with nextWorld `NQ-01` → `journey.start('NQ-01',…)` [`ok:true`], `journey.start('NQ-02',…)` [`locked`];
  - switching learner mid-placement → the other learner can't start `NQ-01` [`locked`].
- **Fuzz invariant** (`fuzz_node.js`): no skill in a locked world ever leaves `not-introduced` unless placed.
- **Accept:** all the above; the Harbor browser tests are unchanged.

### WP-0.3 [AUTH, K4] #124: four Amazon skills become grown-up checks
Through `tools/curriculum/build_v32.py` (add to `TEACHER_OVERRIDES`; type `teacher`, evidence `['teacher']`), then rebuild the curriculum block. Rubrics (a grown-up ticks each line; all must be ticked to pass):

| Skill | Prompt | Checklist |
|---|---|---|
| NQ-01-U01-S02 | "Play the black-key groups going up the piano, then coming back down." | Plays each 2-black-key and 3-black-key group in order going up · then going down · uses black keys only · no long stops between groups |
| NQ-01-U04-S03 | "Play C-D-E-F-G and back with your right hand in middle C position." | Thumb on middle C, fingers 1-2-3-4-5 on C-D-E-F-G · plays up and back down in order · each note clear · no stopping to search |
| NQ-01-U05-S03 | "Play a five-note tune (like C-D-E-F-G-F-E-D-C) while I clap or count a steady beat." | Correct notes in order · notes land with the steady beat · no speeding up or slowing down · finishes without stopping |
| NQ-01-U08-S02 | "Count '1-2-3-4' out loud, then play a short tune that repeats notes (like C-C-G-G-A-A-G)." | Says a steady count-in before playing · starts on time after the count · repeated notes played again, not held · keeps the beat to the end |

- The readiness parts get rebuilt (these move from performance-by-mic to grown-up performance; they stay in `performance`).
- Test counts: `teacher` skills go 23 → **27**; the 13 coming-soon skills are unchanged.
- **Tests:** each skill validates as `teacher`; NQ-01 readiness passes `journey.validate`; `build_v32.py --check` is clean; a grown-up `by` label is recorded.
- **Accept:** as above. **No other learning objective changes.**

### WP-0.4 [AUTH] Coin invariant (practice games + rescues)
Spec in `messages/2026-11-24-0700-…`, plus the ROADMAP §3 policy:
- **High-water date:** `p.coinPlays = {hw:'YYYY-MM-DD', days:{[date]:{[key]:n}}}`. `hw` is the latest local date seen. The effective day is `max(today, hw)`. Keep `hw` and the previous 7 days.
- **Round IDs:** a second completion of the same round ID pays 0.
- **Extra tests:**
  - clock moved back 3 days → counts continue against `hw` [4th play pays 0];
  - clock moved forward a day → fresh counts;
  - DST changes (local date strings) handled;
  - a duplicate `finishRound` with the same round ID pays once;
  - a save without `coinPlays` loads, with the balance unchanged.

### WP-0.5 [ROADMAP] Avatar contract + kitten start (engine)
- **Part catalog:** engine data, IDs only, versioned: `AVATAR_CATALOG={v:1,skin:[…6],hair:[…6],hairColor:[…8],outfit:[…6],accessory:['none',…3]}`. Final counts are Kevin's decision (ROADMAP §7.2); IDs are like `skin-1`, `hair-curly`.
- **`profiles.create(name, avatarOrOpts)`:** if the second argument is a string, it's today's emoji (backward compatible). If it's `{look}`, the look is validated against the catalog (unknown → refused `bad-look`) and stored as `p.look={v,skin,hair,hairColor,outfit,accessory}`. `p.avatar` keeps an emoji fallback.
- **`profiles.setLook(id, look)`:** the same validation; only for an existing learner; never touches progress; emits `profile:look`.
- **Kitten start (K2):** new `pets.startKitten(name)`. It creates the `kitten` starter **already hatched, with no egg**, so it can appear and cheer right away. It sets it as the primary companion (`companions.setPrimary`), and is idempotent: if `starterDone`, it returns the existing kitten. The coin bonus is the same as `chooseStarter`.
- **Tests:**
  - create with a valid look;
  - an invalid look is refused, with no learner created;
  - setLook doesn't change stars, coins or learn;
  - `startKitten` twice → one kitten;
  - interrupted (learner created, no kitten) → `starterDone` false and the onboarding step is `nameCompanion`;
  - the companion is primary;
  - old learners without `look` still load.

### WP-0.6 [ROADMAP] World availability query
Engine: `learn.worldState(id) → {exists, unlocked, contentReady, types:[question types used by its playable skills]}`. It's pure, reads nothing from the UI and saves nothing.

UI (not engine): `RENDERERS_V1 = ['notePlay','keyGroup',…]` (versioned manifest) and `worldPlayable(id) = state.unlocked && state.contentReady && state.types.every(t => RENDERERS_V1.includes(t)) && rolloutFlag(id)`. The map, placement and village all use this one selector.
- **Tests:**
  - an unknown world gives `exists:false`;
  - NQ-01 is locked for a new learner;
  - `types` for NQ-00 match its skills;
  - a manifest missing one type makes the world not playable (UI unit test).

### WP-0.7 [ROADMAP] Result envelope
- `learn.finish` / `progress.finishRound` / journey results additionally return `result:{v:1, roundId, kind:'lesson'|'practice'|'readiness'|'placement', outcome, coins:{earned}, stars:{before,after}, evidence:{source:'engine'|'caregiver'|'teacher'|'mic', count}, mastery:{skillId,before,after}|null, next:{route,arg}|null}`.
- Existing fields stay. A field that doesn't apply is `null`, never invented.
- `next` is advisory: the resolver still decides.
- Re-reading the same `roundId` returns the same envelope and never pays again.
- **Tests:** one per kind, plus repeat and refresh idempotency.

### WP-0.8 [ROADMAP] Curriculum lint (cheap, early)
`tools/curriculum/lint.py`, run in the test runner. It checks:
- every skill, stop and level ID is unique and referenced correctly;
- prerequisites exist and don't form cycles;
- the evidence matches the type;
- every readiness part is non-empty and playable;
- teacher checklists have ≥3 lines;
- no skill changes its objective without a version bump.

**Accept:** passes on v3.2 and fails on 5 seeded bad fixtures.

## M1: test foundation

### WP-1.1 [ROADMAP] CI crawler + scenario suite with a known-failure baseline
Start from `tests/browser/experimental/ui_crawl_experimental.py` (branch `claude/ui-crawl-experimental`).
- **State identity:** view + argument + learner + onboarding step + modal + lock state.
- **Real click paths only** for acceptance; isolated contexts; seeded fake learners; controlled time.
- **Per-control disposition:** exercised / intentionally unavailable / destructive (simulated) / external exit (return verified) / unexplored (fails).
- **Scenarios:** proposal §10 plus Claude §8 plus ChatGPT 11–16.
- **Baseline:** `tests/browser/baseline/legacy-routes.json`, keyed by commit, scenario, route and viewport (phone portrait and landscape, tablet portrait and landscape, desktop). CI fails on any *new* legacy route or JS error.
- **Accept:** the baseline is committed, artifacts are uploaded per viewport, and a deliberately added legacy link fails CI.

### WP-1.2 [ROADMAP] Performance baseline
Bytes per viewport (HTML, JS, CSS, images, audio) and time to Tap to Play, measured with defined cache and throttling. Recorded only, not gated, until calibrated.

## M2: land the open PRs (serial; each on the current main)
- **WP-2.1 [AUTH] #127:** merge main in and resolve conflicts. Adopt WP-0.5's `startKitten` when it lands (until then `chooseStarter('kitten',name)` is acceptable).
  - The kitten naming step, land in the village, hide the old pet house, the quiet grown-up link.
  - Narrow guard: block `starter` and `home` on every normal path (including returning interrupted learners and `onRemote`), with tests. If that can't be done cleanly, defer it to M3.
  - **Accept:** the crawler's new-player path never shows `starter` or `home`; no regression against the baseline.
- **WP-2.2 [AUTH] #129:** merge the new main in; resolve **in favour of #127's onboarding and routes**; keep only placement. Grown-up pick shows only playable worlds (through WP-0.6 when available; Melody Harbor until then). **Accept:** `placement_test` passes; no regression.
- **WP-2.3 [AUTH] #130:** merge main in. Replace `id==="3.2"` with capability detection (`typeof NQ.learn.stops==='function'` plus the stop schema). **Accept:** the atlas works on a renamed curriculum ID in a test fixture.

## M3: route resolver, zero legacy

### WP-3.1 [ROADMAP] Resolver + admission table
- `assets/nq-routes.js` (UI zone) holds `ROUTES = {view: {args:schema, needs:'none'|'learner'|'onboarded'|'gate', fallback, lifecycle}}`, listing only new-UI views.
- `resolveRoute(req, ctx)` is pure. `ctx` is a fresh snapshot: `{learnerCount, activeId (validated), onboardingStep, gateOpen, origin}`.
- **Rules:**
  - no learner, or 2+ learners at launch → `profiles` (K1);
  - unfinished onboarding → its step (`newProfile` or `nameCompanion`);
  - grown-up views need `gateOpen`;
  - an unknown view or a bad argument → `{deny, landing}` (the village, or the picker);
  - never recurse; never change learner.
- **Entry points:** `go()`, the `[data-go]` handler, first render, `onRemote()`, `popstate` (History adapter: back closes preview or modal → parent → village → the browser at the root), and the return from Music Reference (validated origin).
- **Lifecycle:** cancel active rounds once on leave.
- Unfinished destinations (old practice, stickers, old settings, shop, care, outpost): not in `ROUTES`. Their buildings get the G1 "Coming soon" response (after the M4A mockup; until then inert).
- **Tests:** a Node table of ≥40 cases (view × context); browser negative tests (forged `data-go`, stale history entry, `onRemote` with a removed learner, 2 learners plus refresh, deep link to `starter`); the intro Skip fix (C1: atomic end, underlying screen inert).
- **Accept:** **zero legacy screens** on every crawler path and viewport; the baseline file shrinks to empty for legacy routes.

---

## Later milestones (packets detailed when each starts; Claude writes the engine specs ahead)

| Packet | Content | Gate |
|---|---|---|
| WP-4A / WP-4B [K] | Mockup packs (ROADMAP M4A, M4B) | Kevin approves |
| WP-5.x | Building hotspots: presentation registry (`{id,name,invitation,routeId,layer,polygon}`), SVG overlay tied to layer coordinates, preview, enter and dismiss state machine, drag threshold and pointercancel, keyboard focus order, on-demand accessible list | After WP-3.1 + 4A |
| WP-6.x | Avatar builder UI (layered composer, cached composite) + kitten presence layer (idle, walk, celebrate; reduced motion) | After WP-0.5 + 4B |
| WP-7.x | Shared header variants; results shell on WP-0.7; child + grown-up progress views (evidence provenance); Library return; grown-up area (separate destructive confirmation); audio service (buses, ducking, mute; wraps the current piano module); offline-after-load fallback | After WP-3.1 + 4B |
| WP-8a–e | Practice Hall (coin rules wired), Trophy House, Companion care, Marketplace, Explorer Outpost: each its own spec, mockup and PR | Kevin decides §7.3 for 8d/8e |
| WP-9.x | Amazon: WP-0.2 + WP-0.3 merged; renderer coverage for NQ-01 types; visual approval; end-to-end clicks through U01–U08 and readiness | Kevin's visuals |
| WP-10 | Developer device matrix + Kevin's development checkpoint | Kevin |
| WP-11.x | MIDI, Today's practice, authoring tool, calibrated performance gates | Separate specs |
| WP-12.x | Remove each replaced legacy view right after its replacement merges; final shipped-page scan | Per replacement |

## Review checklist Claude applies to every packet
1. The diff matches the packet; the engine block changes only where specified.
2. Saves: `migrate` keeps old saves; no new storage literals; the preview isolation check passes; nothing reads or writes original-game data.
3. All tests pass locally **and** in CI at the exact head; new tests fail on the previous commit where they guard a fix.
4. Child-facing: no old screens; touch targets ≥48 px; readable on a phone; grown-up actions gated; names escaped; reduced motion respected.
5. An attempt to break it: farm coins, quit and restart, switch learners, change the date, refresh mid-flow, open a locked world, forge a route.
