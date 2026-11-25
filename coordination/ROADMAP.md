# NoteQuest roadmap: draft for owner approval

**Status: DRAFT, reconciled by Claude and ChatGPT (round 3, 2026-11-24). Not approved. Nothing in it is authorized to build until Kevin confirms.** Previously authorized work (#125, #127, #129, #130, the coin engine rules) continues under its own gates.

Sources, kept unchanged for comparison:
- [proposal](design/COMPLETE_UI_MODERNIZATION_AND_INTERACTIVE_VILLAGE_PROPOSAL.md) (ChatGPT);
- [Claude contribution](design/COMPLETE_UI_MODERNIZATION_CLAUDE_CONTRIBUTION.md);
- [ChatGPT counter-review](design/COMPLETE_UI_MODERNIZATION_CHATGPT_COUNTERREVIEW.md);
- [Claude round 2](design/COMPLETE_UI_MODERNIZATION_CLAUDE_ROUND2.md);
- [ChatGPT round 3](design/COMPLETE_UI_MODERNIZATION_CHATGPT_ROUND3.md).

Item numbers below (R1–R5, C1–C12, G1–G3) refer to those documents.

## 1. Goal
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
- **Engine locks (R3):** #119 makes `learn.start` refuse lessons in a locked world. Review of earlier, already-secure work stays allowed. `journey.start` is allowed only for the gate world after the last unlocked one, or for `placement.nextWorld` during active placement.
- **Engine-owned data:**
  - `profiles.create(name, {look})` stays backward compatible with `create(name, emoji)`;
  - `profiles.setLook(id, look)` is validated against a versioned **part catalog of IDs only**;
  - the onboarding order is learner (name and look) → kitten naming. Interrupted naming resumes, with exactly one starter and the companion active;
  - a typed **result envelope** gives results screens real deltas (coins, stars, evidence source, mastery, next eligible route). It's idempotent on reload or retry, adds alongside today's finish APIs rather than breaking them, and never fabricates mastery.
- **Coin invariant (C11, confirmed policy):**
  - Counts are per local calendar day. The engine keeps a persisted **high-water date** (the latest local date ever seen for the learner).
  - If the clock reads earlier than the high-water date, payouts count against the high-water day, so rolling the clock back never resets limits. Limits reset only when real time passes the high-water date.
  - Counts are kept for the high-water day plus the previous 7 days. Older entries are dropped, which is safe because they can never apply again.
  - The 3-star check uses the best stars before the round. Fractions bank in `coinFrac` and pay whole coins.
  - Duplicate completion of the same round ID pays once.
  - Saves sync last-writer-wins, so the worst case after a two-device merge is an occasional extra or missing fraction of a coin; acceptable and tested.
  - Lesson rewards, saves and progress are never reduced.
- **History (C8):** hierarchical Back (close preview or modal → parent → village → at the root the browser may leave), through a minimal History API adapter feeding the resolver.
- **Audio (C9):** one service with buses for UI, ambience, lesson piano and metronome, using the AudioContext clock. It ducks or pauses for listening, rhythm and mic exercises, never autoplays, and suspends in the background. It wraps today's piano module; sampled piano comes only with approved, licensed assets and measured gains.
- **Unavailable buildings (G1):** a transient, non-navigating "Coming soon" response with an accessible name and status. It respects reduced motion and mute, makes no date promises and never repeats as a forced popup. If Kevin rejects the mockup, the fallback is inert.
- **Legacy code (G2):** removed progressively after each replacement. The final M12 scan of the shipped page finds no legacy entry points or code. Engine APIs, save schemas and Git history are preserved.

## 4. What "complete game" means (F: destination completeness)
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
| **M2** | Integrate **#127 → #129 → #130**, serially, each on the current main (narrow #127 guard only if it covers every starter and old-home path, incl. interrupted returns and remote callbacks) | M1 | C · Cl reviews each | No regressions against the baseline; #130 detects capability, not a version |
| **M3** | Route resolver + admission table; every entry point routed; unfinished destinations Coming soon or hidden; intro Skip fix (C1) | M2 | C · Cl reviews | **Zero legacy screens** on every crawler path and viewport; resolver table tests; negative tests 11–16 |
| **M4A** | Mockups: building states (idle, hover, focus, preview, Coming soon), panorama, drag, accessible destination list | — (parallel) | C · **K** | Kevin approves |
| **M4B** | Mockups: avatar rig (portrait, full-body idle, celebration; shared layers where geometry allows), picker, contextual header variants, results shell, kitten presence; audio palette sample | — (parallel) | C · **K** | Kevin approves |
| **M5** | Building hotspots + presentation registry + accessible list | M3, M4A | C · Cl reviews | Geometry tests (centroid, edges, overlap) at 3 sizes; no entry while dragging; keyboard and screen reader |
| **M6** | Avatar contract (engine) + builder UI + kitten presence | M0, M4B | C · Cl reviews the engine | Interrupted onboarding resumes; one kitten; existing learners keep their emoji until they edit |
| **M7** | Shared header, results shell on the result envelope, child progress + grown-up progress view (evidence provenance), Music Library return, grown-up area, audio service, offline-after-load fallback | M3, M4B, M0 | C · Cl reviews | Every reachable destination is new UI; screenshot inventory approved by Kevin |
| **M8a–e** | Practice Hall (coin rules wired), Trophy House, Companion care, Marketplace, Explorer Outpost: one sub-milestone each, with their own spec and mockups | M7 | C · Cl reviews · **K** mockups | Each destination moves from Coming soon to Done in §4 |
| **M9** | Amazon: #119, #124 grown-up checks, renderer coverage, visuals, end-to-end clicks; the same template for each later world | M0, M3 | C · Cl reviews · **K** | Engine negative tests; Amazon playable by real clicks |
| **M10** | Developer device matrix + Kevin's development checkpoint | M3, M5–M7 (+ M8/M9 as built) | all · **K** | Proposal §10 criteria; §4 tables report honestly what is Done or Coming soon |
| **M11** | Platform: MIDI input (progressive enhancement), Today's practice (context-aware, on-demand, no extra village block), full authoring tool, calibrated performance gates | M10 | Cl specs the engine · C builds · **K** | Each with its own spec and decision |
| **M12** | Legacy code removal: progressive after each replacement; final shipped-page scan | each replacement; final after M8 | C · Cl reviews | No legacy view code or entry points in the shipped page |

**Order and parallelism:** M0, M1, M4A and M4B start together. Then M2 → M3 → M5, M6 and M7 (partly parallel) → M8 → M10. M9 runs alongside once M0 and M3 land. M12 trails each replacement.

## 6. Current state (2026-11-24 16:20 PT)
- **#125** (save safety) @ `7de0c77`: CI green on that exact commit ([run 45434596941](https://github.com/kevintmacneill/NoteQuest/actions/runs/45434596941)), mergeable. Awaiting ChatGPT's final runtime verification and approval; review issue #126 closes with it.
- **#127** onboarding @ `4ecb670` and **#129** placement @ `686fb79`: **conflicts with main**; need main merged in (M2).
- **#130** world map @ `d1cc0d5`: mergeable; still to switch from a version check to capability detection.
- **Crawler:** experimental script and first-run evidence on branch `claude/ui-crawl-experimental` @ `4243722` (`tests/browser/experimental/`). It confirms #131 in a real browser.
- **Coin rules:** spec in `messages/2026-11-24-0700-…`; refinements in §3 (high-water date). Implementation not started.
- **Live game:** title fixed (#128). New player, pick-a-pet and the pet house are still old screens until M2 and M3.

## 7. Decisions for Kevin
1. **Approve this roadmap** (or change its order or scope). This is the gate for everything not already authorized.
2. **Avatar scope for M4B:** how many choices in each category to start with (suggested: 6 skin tones, 6 hair styles, 8 hair colours, 6 outfit colours, 4 accessories)? The art cost grows with each option.
3. **Marketplace and Explorer Outpost (M8d, M8e):** keep them in the game (redesigned), or retire them? They're tied to the old economy and rescues.
4. **World order after Amazon:** open worlds one at a time by curriculum order (recommended), or finish all of the village (M8) first?
