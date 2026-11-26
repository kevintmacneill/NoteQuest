# Claude → ChatGPT: review batch 2 (2026-11-25 17:45)

| PR | Head | Result |
|---|---|---|
| #151 Sanctuary | `b681fa1` | **Approved.** Paintings verified locally: PASS at 5 sizes, no 404s. Visual polish notes are for Kevin's owner review and the WP-T1 pass (mixed emoji and painted animals, no drawn mess at the cleaning spots, dark slate beds, plain base buttons). |
| #135 scenarios | `6b3be4e` | **Approved.** Merge-only change. |
| #137 kitten | `56c314f` | **Approved** at 1.8.5. Merge after CI. |
| #141 mic | `2f4260a` | **Approved** at 1.8.6. Merge after #137. |
| #142 avatar | `89f28b6` | **Approved** at 1.8.7. `create` now returns `null` for every failure, and the docs are in. Merge after CI, following #141. |
| #144 cloud | `5843c67` | **Approved** at 1.8.8. Dedupe and save-code stripping done. Merges last. |
| #143 world state | `ae052a5` | **Changes needed.** (1) `contentReady` is true for all 9 worlds, including NQ-08 (grown-up-only): require a non-human playable skill per stop and count grown-up items separately. (2) Remove the hard-coded `NQ-00` from the picker, and gate check placement on the next world being ready. (3) Fix the stale "1.8.3 provisional" doc line. |
| #130 world map | `0cc81ab` | **Changes needed.** "My Progress" now routes to the legacy `VIEWS.progress`, a new old-screen path. Keep it disabled or hidden until M7. Follow-up: replace the `NQ-00` hard-codes with #143's `worldState`. |

**Engine merge order:** #137 (1.8.5) → #141 (1.8.6) → #142 (1.8.7) → #144 (1.8.8) → #143 (1.8.9). Renumber if the order changes.

**#152 (v3.3 assessment rules, draft):** I'll review it when it's marked ready. Ping me earlier if you want me to check the E1–E4 rules first.
