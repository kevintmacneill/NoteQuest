# Phase 1 status audit (Claude, second session, 2026-11-26 18:35 PT)

Checked against `main` at `ede660f` (engine **1.8.9**), open PRs as of 2026-11-26 18:30 PT, `DECISIONS.md` and `ROADMAP.md` §0. "Done" means merged on main. CI is the hosted `Tests` check at the PR's exact head. I ran the full engine suite and the CI browser list on main myself: all green (16 engine suites, lint, publish allowlist, 12/12 browser tests). `full_game_test` needs full git history; a shallow clone fails it.

**Status key:** ✅ done · 🟡 in PR · ⬜ not started · ⛔ blocked

## Rows of ROADMAP §0 Phase 1

### Foundation (M0, M1)
| Item | Status | Evidence / what's left |
|---|---|---|
| Save safety | ✅ | #125 (engine 1.8.2) |
| Title | ✅ | #128 |
| Curriculum lint | ✅ | #134; `tools/curriculum/lint.py` runs in the engine runner |
| Performance baseline | ✅ (informational) | #133; CI step `continue-on-error` by design (WP-1.2) |
| Crawler baseline (M1) | 🟡 | #135 merged (real-click scenarios, candidate baseline). #146 control ledger: ChatGPT, draft, CI green at `2bacbc7` but conflicts with main (`tests.yml`). **M1 not accepted:** the crawler step is still `continue-on-error`, so a new legacy route can't fail CI yet (WP-1.1 acceptance). |

### Onboarding (WP-L3, M2, WP-0.5, M6)
| Item | Status | Evidence / what's left |
|---|---|---|
| Device and piano setup at first launch | 🟡 engine, ⬜ screens | Storage #148 and the 88-key sweep and proof #150: ChatGPT, drafts, CI green, stale against main. **Setup screens: not started** (WP-L3 screens are ChatGPT's after M4B; the piano-setup board was approved 2026-11-25). Decisions: full sweep (11-25 13:58), "Later" asks again next launch (11-25 18:05). |
| Who's playing / new player | ✅ | #127, #140 |
| Painted avatar builder | 🟡 | Catalog #142 (WP-0.5), pipeline #162, accessories #160/#161 are merged. #165 (art rig) and #166 (builder, engine **1.9.0**) belong to the other Claude session; #166 CI was running at `3995ee3`. **Art:** the new default girl (approved mockup) and the restyled boy are being painted by ChatGPT (DECISIONS 2026-11-26 16:22); per the 10:38 row, the builder rolls out with whatever is approved. #158/#159 (ChatGPT) stay draft. |
| Kitten naming → hatched primary kitten | ✅ engine | #137 `startKitten`. Painted kitten art: ⬜ (all animals repainted, 11-25 17:34). |

### Village (M4A → M5, M6)
| Item | Status | Evidence / what's left |
|---|---|---|
| Tap-a-building village (preview, then second tap or Visit) | ⬜ | Main still has the #122/#69 overlook with emoji pins that enter on the first tap (`assets/nq-city-overlook.js`). M5 (WP-5.x) needs WP-3.1 wired in plus the approved M4A art. |
| All 8 approved buildings | ⬜ | M4A direction approved 11-25. No building art is in the repo yet. |
| Separate Sanctuary and Hospital Bay entrances | ✅ | #151, #157 |
| Continue Adventure | ✅ | Live on main (Harbor only; see Learning) |
| Kitten visible, walking, cheering | ⬜ | No kitten presence layer in the village. Needs WP-6 and painted kitten art. |

### Learning (M0, M2, M9 NQ-01)
| Item | Status | Evidence / what's left |
|---|---|---|
| #119 world lock (WP-0.2) | ✅ | #138 (1.8.4) |
| Amazon grown-up checks (#136) | ✅ | #136 (1.8.3) |
| World availability (WP-0.6) | 🟡 | #143: ChatGPT, draft at `598e075`. **No hosted CI at that head.** Claims VERSION 1.8.9, which main already uses. Conflicts with main. |
| Placement | ✅ | #129 |
| World map | ✅ | #130 |
| Amazon renderer coverage and visuals (M9 NQ-01) | ⬜ | Amazon isn't reachable to play on main: Continue Adventure and the placement picker are Harbor-only (`index.html` `continueAdventure`, `canChoosePlacementWorld`). See Kevin question 1. |
| Harbor 2–4 week rework (DECISIONS 11-26) | 🟡 | Phase A #152: ChatGPT, draft, CI green at `01efac3`, stale. Phase B (v3.3 content): ChatGPT, ⬜. Phase C engine: ChatGPT, ⬜. Phase C content: Grok, ⛔ waiting on the Phase C engine. Order: `curriculum/HARBOR_V34_RECONCILIATION.md` §8. |

### Listening (ML1, ML3)
| Item | Status | Evidence / what's left |
|---|---|---|
| Mic capture lifecycle | ✅ | #141 |
| Decay re-fire suppression | 🟡 | #145: ChatGPT, draft, stacked on #141's merged branch, VERSION 1.8.3 is stale. Needs a real-piano replay (private copy only). |
| Range limits (cap ~2550 Hz, "too high/low to hear clearly") | ⬜ | Specified in WP-0.10 rev5. No PR. Ownership not stated; ChatGPT builds engine packets by default. |
| **Lessons listen to the piano** | ⬜ | `openHarbor`/`engineLesson` never start the mic. `source:'mic'` appears nowhere on main. This is the core Phase 1 must-have, and nothing is in a PR yet. Kevin's build order (11-25 18:33) puts it third, after the avatar and village. |
| Calibrated through setup | 🟡 | #148, #150 (engine only) |

### Screens (M3, M7 subset)
| Item | Status | Evidence / what's left |
|---|---|---|
| Route gate (M3) | 🟡 | #147: ChatGPT, draft, pure resolver only, not wired in. My review at `2246e42` is still open (Sanctuary routes missing, legacy `progress` admitted, `grownup:<id>` existence check). #149 (intro inert) is merged. |
| Old screens hidden | ⬜ (decided, unowned) | The village still links Practice Games (`games`), Sticker Book (`stickers`), My Music Progress (`progress`), and the gear opens the legacy `parent` screen. |
| Shared header | ⬜ | M7, after M4B |
| Results screen (WP-0.7) | ⬜ | The engine result envelope isn't on main. **Unowned:** no PR, no claim. **Claude (this session) is claiming the engine half.** The screen stays ChatGPT's, after M4B. |
| Child progress | ⬜ | Needs WP-0.7 |
| Minimal new grown-up area | ⬜ | M7. Nothing in a PR yet. |

### World theme (WP-T1)
| Item | Status | Evidence / what's left |
|---|---|---|
| Theme contract | ✅ | #153 (`design/WORLD_THEME_UI_CONTRACT_v0.1.md`) |
| Pure registry and resolver | ✅ | #155 (`assets/nq-world-theme.js`). **Not loaded by `index.html`.** Harbor is marked `status:'draft'`. |
| Engine accessor (`learn.themeWorld`, `profiles.lastSelected`) | ⬜ | Specified in the #153 review (`messages/2026-11-25-1800-…`, "gets 1.8.10, after #143"). No PR. ChatGPT's 18:02 reply says it "waits until engine queue permits". Implicitly ChatGPT's, but unclaimed. |
| Complete Harbor theme on every surface | ⬜ / ⛔ art | Runtime wiring isn't started. Painted Harbor surfaces need Kevin's picture approval. |

### Companion Sanctuary (M8c)
| Item | Status | Evidence / what's left |
|---|---|---|
| Pen, hospital, care, cleaning, informed neglect | ✅ (illustrated preview) | Engine 1.7 (#46); screens #151, #157; `sanctuary_flow_test` green. Entering counts as seen (DECISIONS 11-25 15:25). |
| Painted animals (48 species + egg) | ⬜ / art | Decision 11-25 17:34. Egg colors: #156, ChatGPT, draft, logic approved, VERSION 1.8.12 now out of order. |

### Economy (M0)
| Item | Status | Evidence / what's left |
|---|---|---|
| Coin rules (WP-0.4) | 🟡 | #154: ChatGPT, draft at `5cfa64f`, logic approved through rev7a. **No `Tests` check at that head, and its Pages preview fails tests.** That failure turns main's Pages run red (the `gate` job) even though main deploys fine. Conflicts with main. VERSION 1.8.11 is out of order. |
| Single-device guard (WP-0.9) | ✅ | #144 (1.8.8) |

### Mockups (Kevin approves)
| Item | Status | Evidence |
|---|---|---|
| M4A buildings, M4B boards | ✅ direction | DECISIONS 2026-11-25 ("M4A and M4B visual direction APPROVED") |
| Avatar builder mockup | ✅ | DECISIONS 2026-11-25 19:26; exact reference committed 2026-11-26 |

## Cross-cutting: engine VERSION queue
Main is **1.8.9**, and #166 takes **1.9.0**. Every ChatGPT engine draft claims a version that's already used or lower:

| PR | Claims | Problem |
|---|---|---|
| #143 | 1.8.9 | same as main |
| #145 | 1.8.3 | stale (stacked on merged #141) |
| #148, #150*, #152 | 1.8.6 / none | #148 and #152 change the engine without bumping VERSION |
| #154 | 1.8.11 | below 1.9.0 |
| #156 | 1.8.12 | below 1.9.0 |
| WP-0.7 (Claude, new) | **1.9.1** | next free after #166 |

\*#150 is a UI-zone module; no engine version is needed.

**Proposal:** whoever merges next takes the next free number at merge time (1.9.1, 1.9.2, …), and each PR says so in its body. I'm taking 1.9.1 for WP-0.7. If something else lands first, I'll renumber.

## Kevin needs to decide
1. **Is Amazon still in the Phase 1 exit, or is Phase 1 now Harbor only?** ROADMAP §0 says "Melody Harbor + Amazon playable". DECISIONS 2026-11-26 08:34 says "Stay on Harbor only until it is playable and solid; do not start World 2 yet", and Harbor is now 2–4 weeks long. *Recommendation:* Phase 1 exit = Harbor complete. Amazon moves to the start of Phase 2. Two weeks of family play can't reach Amazon anyway.
2. **Repeated notes in songs vs the decay filter (#145).** The new rule ignores a note unless the sound gets clearly louder. A child playing C-C quickly at the same loudness might not be heard the second time. *Recommendation:* record a 20-second clip on the tablet of you playing "C C C C, G G G G" at lesson speed. Keep it private, like the 88-key recording. ChatGPT tunes the filter against it before lessons listen.
3. **Who builds "lessons listen to the piano"?** It's the core Phase 1 must-have, specified (WP-0.10 Build 1–5), and has no PR. *Recommendation:* ChatGPT, right after the avatar builder lands (your 11-25 build order), with Claude reviewing.

## Unowned work (specified, no PR, no claim)
- **WP-0.7 result envelope (engine):** claimed now by Claude (this session), draft PR to follow.
- **WP-0.10 Stage 1 range limits** (2550 Hz cap, "too high/low" message): engine.
- **WP-0.10 lesson listening** (Kevin question 4).
- **WP-T1 engine accessor** (`themeWorld`, `lastSelected`): ChatGPT said it's waiting on the queue, but nobody has claimed it.
- **Hiding the old screens** (already decided: ROADMAP §0, DECISIONS 2026-11-25 05:25). Practice Games, Sticker Book and My Music Progress are still on the village. The old grown-up settings can't be hidden until the new grown-up area holds piano setup, sound, save code and learners.
- **M3 wiring** of #147 into `go()`, `data-go`, `onRemote` and `popstate`: #147 calls it "follow-up after M2", with no named owner.
- **Minimal grown-up area (M7)** and the **shared header**: no owner named. Both wait on M4B screens.
- **Real-tablet walkthrough before the 2-week trial:** Claude runs it with Kevin (ROADMAP §0). Checklist to follow at `qa/TABLET_WALKTHROUGH_PHASE1.md`.
