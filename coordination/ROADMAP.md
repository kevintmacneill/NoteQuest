# NoteQuest roadmap: draft for owner approval

**Status: APPROVED by owner, 2026-11-24 — implementation authorized.** Reconciled by Claude and ChatGPT (round 3); revision 2 answers the packet review. All five owner decisions in §7 are settled. Follow the approved delivery order, single-device boundary, scoped packet dependencies, visual mockup gates, exact-head independent review, CI and save safety. Remaining technical acceptance checks in `messages/2026-11-24-1750-chatgpt-to-claude-plan-rev2-review.md` must be addressed before affected work. This approval is not final artwork, code review or release approval.

Sources, kept unchanged for comparison:
- [proposal](design/COMPLETE_UI_MODERNIZATION_AND_INTERACTIVE_VILLAGE_PROPOSAL.md) (ChatGPT);
- [Claude contribution](design/COMPLETE_UI_MODERNIZATION_CLAUDE_CONTRIBUTION.md);
- [ChatGPT counter-review](design/COMPLETE_UI_MODERNIZATION_CHATGPT_COUNTERREVIEW.md);
- [Claude round 2](design/COMPLETE_UI_MODERNIZATION_CLAUDE_ROUND2.md);
- [ChatGPT round 3](design/COMPLETE_UI_MODERNIZATION_CHATGPT_ROUND3.md).

Item numbers below (R1–R5, C1–C12, G1–G3) refer to those documents.

## 0. Rollout phases (Kevin, 2026-11-25): **this section sets priority; when in doubt, Phase 1 work comes first**

### Phase 1: Family (current priority)
**Goal:** Micaela and Zoe play NoteQuest on Kevin's **Android tablet** (Chrome) at the family's **upright piano**, regularly and without rescue. The on-screen keys stay as a fallback.

**Scope** (and nothing else, unless Kevin adds it):

| Area | What's in Phase 1 | Milestones / packets |
|---|---|---|
| Foundation | save safety ✅ (#125); title ✅ (#128); curriculum lint (#134); performance baseline (#133); crawler baseline (#135 → M1) | M0, M1 |
| Onboarding | **device and piano setup at first launch** (11 keys + optional full sweep), Who's playing / new player (#127), **painted avatar builder**, kitten naming → **hatched, primary kitten** (`startKitten`) | WP-L3, M2, WP-0.5, M6 |
| Village | **tap-a-building village** (preview, then a second tap or Visit enters), all 8 approved buildings plus a Hospital Bay building (2026-11-26), each painted on its own layer, with no floating signs, and glow + lift when tapped ([remake spec](design/VILLAGE_LAYERED_REMAKE_v1.0.md)). Live: Adventure Gate, Music Academy, Music Library, Companion Sanctuary and Hospital Bay; the others are Coming soon (DECISIONS 2026-11-26); Continue Adventure button; **kitten visible**, walking and cheering | M4A → M5, M6 |
| Learning | **Melody Harbor + Amazon** playable: #119 lock (WP-0.2), Amazon grown-up checks (#136), world availability (WP-0.6), placement (#129), world map (#130), Amazon renderer coverage and visuals (M9 for NQ-01 only) | M0, M2, M9 (NQ-01) |
| Listening | **hearing the piano in lessons** (WP-0.10 Stage 1: detector A, decay re-fire suppression, range limits) on the **tablet + upright**, calibrated through setup | ML1, ML3 (Android Chrome only) |
| Screens | route gate (M3) with old screens **hidden**: Practice Games, Sticker Book, old grown-up settings; shared header; results screen (WP-0.7); child progress; **minimal new grown-up area** (piano setup and pianos, sound, save code, learner management) | M3, M7 subset |
| World theme | theme system + **complete Melody Harbor theme** across village, buildings, lessons, sanctuary, results and settings (shared screens follow the last selected child's world); Amazon uses Harbor's theme until Phase 2 | WP-T1 (new) |
| Companion Sanctuary | pen + hospital + care + cleaning + informed-neglect friendship loss, per the 2026-11-21 decisions (#151) | M8c (pulled into Phase 1) |
| Economy | coin rules (WP-0.4) and the single-device guard (WP-0.9), already authorized; cheap to finish | M0 |
| Mockups (Kevin approves) | M4A buildings; M4B avatar rig, kitten, header, results, setup screens | M4A, M4B |

**Phase 1 is done when:** both girls play about **5 days a week for 2 weeks** on the tablet and piano, with **no blocking problems** and **no rescue from Kevin**. Before those two weeks start, Claude runs the full crawler and scenario suite plus a walkthrough on the real tablet with Kevin.

### Phase 2: Friends and family (after Phase 1 is done)
Other homes, devices and pianos:
- the full **device layer** (iPhone and iPad Safari, laptops and desktops, external mics: ML2), the **88-key and chord** listener (ML4), the device × mic × piano **test library** with outside recordings (ML5), and MIDI (ML6);
- the full 88-key sweep everywhere;
- **all village destinations** redesigned and un-hidden (M8a–e: Practice Hall, Trophy House, Companion care, Marketplace, Explorer Outpost);
- worlds **NQ-02 onward** (M9 template each);
- Today's practice and the authoring tool (M11);
- performance gates; legacy code removal (M12).

**Done when:** at least 3 outside households (different devices and pianos) complete setup and play for 2 weeks, and every supported device class has an acceptance result (§3a.4).

### Phase 3: Public and commercial (after Phase 2)
- Children's privacy compliance (COPPA and equivalents), a privacy policy, and parental consent flows;
- accounts and **multi-device sync** (conflict-safe merge; §7.5 revisited);
- distribution (installable web app; app-store wrappers if needed), licensing and payments;
- support and opt-in diagnostics (never audio);
- teacher and parent dashboards; an accessibility audit; asset licensing review;
- **M13 complete-game gate.**

**Done when:** Kevin decides it's ready to sell.


One cohesive musical adventure, and a real piano-learning platform:
- every screen a player can reach is new UI (no legacy interface, then no legacy code);
- the village is the menu;
- progress is honest and evidence-based;
- each new world opens only when the engine, screens and assessments are all ready.

This is the development phase. Kevin's review at M10 is a development checkpoint, not family acceptance or a release.

## 2. Settled decisions (owner)
K1 shared tablet · K2 kitten is the first companion, visible and cheering · K3 sound and ambience in development · K4 Amazon uses grown-up checks now (#124) · K5 #32 closed. Earlier today: onboarding with no old screens; a default cat named by the child; land in the village; old pet house hidden; avatar builder "build a kid", painted; on touch, the first tap previews and the second tap or Visit enters; one Continue Adventure button; coin rules (practice and rescues: 3-starred levels pay 0; repeats ×1, ×½, ×¼, then 0 per day; lessons unchanged; no message); one playable NoteQuest; save safety (#120).

## 3. Agreed architecture (both agents)
- **Route resolver (R1):** one pure function `resolveRoute(request, ctx)` over a fresh context snapshot: validated active learner, onboarding step, grown-up gate session, origin, route metadata and argument schema. It's unit-tested from a table and has browser negative tests.
  - Every entry point uses it: `go()`, `data-go`, first render, `onRemote()`, `popstate`, and returns from Music Reference.
  - It fails closed to the right new screen and never recurses or switches learner.
  - There's **no legacy bypass in any published build.** Denied requests show up only in test-only diagnostics, without learner data.
- **Two tables (D):** route admission (view, arguments, context rules, fallback, lifecycle) and destination presentation (stable ID, name, layer polygon, invitation, route ID). The world map uses the runtime curriculum through the same resolver.
- **Availability boundary (R3, confirmed):**
  - The engine answers only a pure query: the world exists, is unlocked, and its content is ready (`learn.worldState`, or separate queries).
  - The UI holds a **versioned renderer capability manifest** (the question types each build can display) plus a rollout flag.
  - **One UI selector** combines them into "supported" and "playable" for the map, placement and village, and fails closed for unknown types.
  - The manifest is read-only input. It never grants mastery, never bypasses a lock and is never saved. One renderable activity never makes a whole world playable.
- **Engine locks (R3):** #119 makes `learn.start` refuse lessons in a locked world. Review is allowed only for the active learner's own secure work in an unlocked or placed world. `markLearned` can't pre-seed a locked world. The legacy `unlockAll` practice option never opens curriculum worlds (rev2). `journey.start` is allowed only for the gate world after the last unlocked one, or for `placement.nextWorld` during active placement.
- **Engine-owned data:**
  - `profiles.create(name, {look})` stays backward compatible with `create(name, emoji)`;
  - `profiles.setLook(id, look)` is validated against a versioned **part catalog of IDs only**;
  - the onboarding order is learner (name and look) → kitten naming. Interrupted naming resumes, with exactly one starter and the companion active;
  - a typed **result envelope** gives results screens real deltas (coins, stars, evidence source, mastery, next eligible route). It's idempotent on reload or retry, adds alongside today's finish APIs rather than breaking them, and never fabricates mastery.
- **Coin invariant (C11, confirmed policy):**
  - Counts are per local calendar day. The engine keeps a persisted **high-water date** (the latest local date ever seen for the learner).
  - If the clock reads earlier than the high-water date, payouts count against the high-water day, so rolling the clock back never resets limits. Limits reset only when the **device clock** passes the high-water date. The local clock can't be verified, so a clock moved *forward* gives a new day's allowance; when cloud is connected, the server timestamp sets the day (rev2).
  - Counts are kept for the high-water day plus the previous 7 days. Older entries are dropped, which is safe because they can never apply again.
  - The 3-star check uses the best stars before the round. Fractions bank in `coinFrac` and pay whole coins.
  - Duplicate completion of the same round ID pays once.
  - Cloud saves are whole-document last-writer-wins. Coins can't be **multiplied** across devices, but coins earned on a device whose save gets overwritten can be **lost** (today's behavior for all progress; historical limitation). Owner §7.5 now limits initial scope to one device only; concurrent and cross-device play are unsupported and a conflict-safe merge is deferred. Do not silently overwrite saves. Exact single-device enforcement and existing cloud compatibility require a reviewed spec.
  - Lesson rewards, saves and progress are never reduced.
- **History (C8):** hierarchical Back (close preview or modal → parent → village → at the root the browser may leave), through a minimal History API adapter feeding the resolver.
- **Audio (C9):** one service with buses for UI, ambience, lesson piano and metronome, using the AudioContext clock. It ducks or pauses for listening, rhythm and mic exercises, never autoplays, and suspends in the background. It wraps today's piano module; sampled piano comes only with approved, licensed assets and measured gains.
- **Unavailable buildings (G1):** a transient, non-navigating "Coming soon" response with an accessible name and status. It respects reduced motion and mute, makes no date promises and never repeats as a forced popup. If Kevin rejects the mockup, the fallback is inert.
- **Legacy code (G2):** removed progressively after each replacement. The final M12 scan of the shipped page finds no legacy entry points or code. Engine APIs, save schemas and Git history are preserved.

## 3a. Product principles (Kevin, 2026-11-25)
1. **Real piano first.** Every playing activity is designed as "play it on your piano": the screen shows what to play, the device listens, and the game responds to what it hears. The on-screen keyboard is a **fallback** (no piano, or it's in use), always available but never the main design. Results and the grown-up progress view say how each skill was shown (piano heard, on-screen keys, or grown-up check).
2. **Listen on any device.** The listener must work on Android phones and tablets, iPhones and iPads (Safari/WebKit), Windows, Mac and Chromebook laptops and desktops, and external or professional microphones (USB, audio interfaces, headset). No feature may assume one device, browser, sample rate or microphone.
3. **Audio stays on the device.** Piano sound is analysed in the browser and **never recorded, stored or uploaded** (a requirement for a children's product and a selling point). Only calibration numbers (per-key pitch and level profiles) are saved, locally.
4. **Sellable quality.** Listening accuracy is measured against a growing library of real recordings (devices × microphones × pianos), not just our own piano, and each supported device class has a written acceptance result.

 (F: destination completeness)
**Village destinations.** Every one ends **Done (new UI)**, **Coming soon (G1)**, or explicitly out of scope by Kevin's decision:

| Destination | Route today | Target | Milestone |
|---|---|---|---|
| Continue Adventure (button) | new | next lesson or readiness through the resolver | M3 |
| Music Academy (lessons) | new (Harbor) | all playable worlds | M3, M9 |
| Adventure Gate (readiness) | new | — | M3 |
| World Map | old `map`; #130 runtime atlas | runtime atlas | M2 |
| Music Library / Reference | new page, return path unverified | verified return to origin | M7 |
| My Progress | old style | new child view + grown-up progress view | M7 |
| Who's Playing / New player | old; #127 new | new + avatar builder | M2, M6 |
| Grown-up area | old | new, with safe learner management | M7 |
| Practice Hall (practice games) | old | redesigned + coin rules wired | M8a |
| Trophy House (stickers) | old | redesigned | M8b |
| Companion Sanctuary / care | old (hidden) | redesigned around the kitten | M8c |
| Hospital Bay | accessible via the Companion Sanctuary | separate village entrance plus the Sanctuary tab | M5, M8c |
| Marketplace (shop) | old (hidden) | redesigned (needs spec) | M8d |
| Explorer Outpost (rescues) | old (hidden) | redesigned (needs spec) | M8e |

**Curriculum scope.** 9 worlds, 70 stops, 210 skills (v3.2):

| Worlds | State | Opens when |
|---|---|---|
| NQ-00 Melody Harbor | playable | — |
| NQ-01 Amazon | locked | M9: #119 + #124 grown-up checks + renderer coverage + Kevin's visual approval + end-to-end clicks |
| NQ-02 … NQ-08 | locked; map shows "coming soon" | each needs its own M9-style milestone (renderer coverage for its question types, content QA, visuals). The 13 coming-soon skills (12 conceptChoice, 1 echo) need content or the mic, through the authoring lint and a curriculum 3.3 |

"Full game ready" is reported against these two tables, never as Harbor or Amazon alone.

## 5. Milestones
Owners: **C** = ChatGPT builds · **Cl** = Claude specs the engine and reviews everything · **K** = Kevin approves visuals and scope. Every code milestone ends with an exact-head independent review and green CI. Mockup milestones end with Kevin's visual approval, not test results.

| ID | Milestone | Depends on | Owners | Exit evidence |
|---|---|---|---|---|
| **M0** | Engine safety and specs: #125 final review and merge; specs for #119 (+ journey placement guard), #124 rubric, avatar contract + part catalog, the world-availability query, the result envelope (with evidence provenance), coin invariant (§3 policy); early curriculum schema and reference lint | — | Cl specs and reviews · C builds the authorized engine scopes | Each spec has negative tests; #125 merged; coin tests incl. rollback, timezone/DST, duplicate completion, two-device merge |
| **M1** | Crawler + scenario suite in CI with a **known-failure baseline** (keyed to commit, scenario, route, viewport); per-control coverage dispositions; **performance baseline** (asset bytes per viewport, time to ready) | — | C (from Claude's experimental crawler) · Cl reviews | Baseline report committed; artifacts per viewport |
| **M2** | Integrate **#127 → #129 → #130**, serially, each on the current main. **Temporary gate until M1 exists (rev3):** the existing CI + packet regression tests + an independent exact-head run of the experimental crawler as evidence; the formal M1 baseline gates from M3 on (narrow #127 guard only if it covers every starter and old-home path, incl. interrupted returns and remote callbacks) | M1 (temporary gate above) | C · Cl reviews each | No regressions against the baseline; #130 detects capability, not a version |
| **M3** | Route resolver + admission table; every entry point routed; unfinished destinations Coming soon or hidden; intro Skip fix (C1) | M2 | C · Cl reviews | **Zero legacy screens** on every crawler path and viewport; resolver table tests; negative tests 11–16 |
| **M4A** | Mockups: building states (idle, hover, focus, preview, Coming soon), panorama, drag, accessible destination list | — (parallel) | C · **K** | Visual direction approved by Kevin, 2026-11-25 |
| **M4B** | Mockups: avatar rig (portrait, full-body idle, celebration; shared layers where geometry allows), picker, contextual header variants, results shell, kitten presence; audio palette sample | — (parallel) | C · **K** | Visual direction approved by Kevin, 2026-11-25 |
| **M5** | Building hotspots + presentation registry + accessible list | M3, M4A | C · Cl reviews | Geometry tests (centroid, edges, overlap) at 3 sizes; no entry while dragging; keyboard and screen reader |
| **M6** | Avatar contract (engine) + builder UI + kitten presence | M0, M4B | C · Cl reviews the engine | Interrupted onboarding resumes; one kitten; existing learners keep their emoji until they edit |
| **M7** | Shared header, results shell on the result envelope, child progress + grown-up progress view (evidence provenance), Music Library return, grown-up area, audio service, offline-after-load fallback | M3, M4B, M0 | C · Cl reviews | Every reachable destination is new UI; screenshot inventory approved by Kevin |
| **M8a–e** | Practice Hall (coin rules wired), Trophy House, Companion care, Marketplace, Explorer Outpost: one sub-milestone each, with their own spec and mockups | M7 | C · Cl reviews · **K** mockups | Each destination moves from Coming soon to Done in §4 |
| **M9** | Amazon: #119, #124 grown-up checks, renderer coverage, visuals, end-to-end clicks; the same template for each later world | M0, M3 | C · Cl reviews · **K** | Engine negative tests; Amazon playable by real clicks |
| **ML** | **Listening platform** (real piano first; any device). Runs in parallel from now, ahead of other features, because it's the core input. **ML1** listening in Harbor lessons (WP-0.10 stage 1). **ML2** device layer: sample-rate-independent detection, AudioWorklet with a fallback, iOS/Safari rules (start on a tap; resume after interruptions and screen lock), microphone constraint fallbacks, input picker for external mics, per-browser permission guidance. **ML3** listening check plus "Teach NoteQuest your piano" calibration per device (noise, level, bass response, placement advice, per-key profile). **ML4** all 88 keys plus chords on calibrated devices. **ML5** device × microphone × piano test matrix and recording library, with an acceptance result per device class. **ML6** MIDI input for digital pianos where the browser supports Web MIDI (an extra path, never a replacement for listening) | M0 (ML1); then independent | Cl specs (engine and DSP) and reviews · C builds · **K** device recordings and approval | ML1: Harbor lessons playable by ear on Kevin's piano. ML2–ML5: the per-device-class table in §3a.4 is met; no audio leaves the device (tested) |
| **M10** | Developer device matrix + Kevin's **development** checkpoint (may come before M8/M9; not a completeness claim) | M3, M5–M7 (+ M8/M9 as built) | all · **K** | Proposal §10 criteria; §4 tables report honestly what is Done or Coming soon |
| **M11** | Platform: MIDI input (progressive enhancement), Today's practice (context-aware, on-demand, no extra village block), full authoring tool, calibrated performance gates | M10 | Cl specs the engine · C builds · **K** | Each with its own spec and decision |
| **M12** | Legacy code removal: progressive after each replacement; final shipped-page scan | each replacement; final after M8 | C · Cl reviews | No legacy view code or entry points in the shipped page, covering every replaced destination |
| **M13** | **Complete-game gate** (rev2) | M8, M9 per world, M12 | all · **K** | Every §4 destination Done or retired by Kevin; each world's scope decided with its own QA; "Coming soon" never counts as complete |

**Order and parallelism:** M0, M1, M4A and M4B start together. Then M2 → M3 → M5, M6 and M7 (partly parallel) → M8 → M10. Amazon (M9) may proceed alongside foundational village work once M0 and M3 land and Melody Harbor is complete. Owner-approved delivery order: finish Amazon, then complete M8a–e before opening NQ-02 onward in curriculum order. M11 advanced features and final validation follow the remaining worlds. M12 trails each replacement.

## 6. Current state (2026-11-24 16:20 PT)
- **#125** (save safety) @ `7de0c77`: CI green on that exact commit ([run 45434596941](https://github.com/kevintmacneill/NoteQuest/actions/runs/45434596941)), mergeable. Awaiting ChatGPT's final runtime verification and approval; review issue #126 closes with it.
- **#127** onboarding @ `4ecb670` and **#129** placement @ `686fb79`: **conflicts with main**; need main merged in (M2).
- **#130** world map @ `d1cc0d5`: mergeable; still to switch from a version check to capability detection.
- **Crawler:** experimental script and first-run evidence on branch `claude/ui-crawl-experimental` @ `4243722` (`tests/browser/experimental/`). It confirms #131 in a real browser.
- **Coin rules:** spec in `messages/2026-11-24-0700-…`; refinements in §3 (high-water date). Implementation not started.
- **Live game:** title fixed (#128). New player, pick-a-pet and the pet house are still old screens until M2 and M3.

## 7. Decisions for Kevin
1. **Overall roadmap — APPROVED by owner, 2026-11-24.** Begin implementation subject to the packet-specific prerequisites, independent review, visual approval and save-safety requirements. All five scope decisions are settled.
2. **Avatar scope for M4B (approved by owner, 2026-11-24):** male and female child avatar options, each with 6 hairstyles, 6 skin tones, 8 natural hair colours, 8 outfit colours (including pink and black) and 8 accessory options (including none). Mockups still require owner approval.
3. **Marketplace and Explorer Outpost (M8d, M8e) — approved by owner:** retain and redesign both. Marketplace: earned-coin purchases (clothing, accessories, companion supplies and other items); Outpost: animal rescue expeditions, exploration, discoveries and reward opportunities. Separate specifications and visual approval required.
4. **World order after Amazon — approved by owner:** Melody Harbor → Amazon Rainforest → all village destinations and supporting mechanics (M8a–e) → NQ-02 through NQ-08 in curriculum order → advanced educational features and final validation.
5. **Device scope — approved by owner:** initial NoteQuest works on one device only, supporting multiple learners on that shared device. Multi-device play, cross-device handoff and conflict-safe cloud synchronization are deferred. Claude to specify safe enforcement and existing-save/backup compatibility; no destructive changes or new cloud infrastructure authorized.
