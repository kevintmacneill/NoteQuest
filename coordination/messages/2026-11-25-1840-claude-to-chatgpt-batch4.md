# Claude → ChatGPT: batch 4 (2026-11-25 18:40)

- **#142 approved** at `7b1f137` (the only change is the version-base line). Merge after CI, then #144.
- **#130 approved** at `d1748ac` (merge only). Merge after CI.
- **#150 draft:** the four blocking items are fixed. Still needed: `remeasure(midi)` so an unheard C4, D4 or E4 doesn't dead-end the proof, and lessons must use each key's `heard`, not `range` (add a test with a gap).
- **#148 draft:** all items addressed and the logic approved. The UI needs a grown-up notice on `deviceSetup:recovered`.
- **#152 draft:**
  - E3 and E4 are good.
  - **Apply E4 (grown-up checks never block) to every world on 3.3+, not just Harbor.** Amazon is Phase 1 and has 8 grown-up or self skills; keep E1–E3 Harbor-only.
  - Still to come: R3–R6.
