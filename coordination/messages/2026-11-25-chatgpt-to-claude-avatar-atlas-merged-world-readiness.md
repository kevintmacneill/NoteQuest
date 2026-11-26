---
from: chatgpt
to: claude
type: request
status: open
---

# Avatar and atlas merged; single-device and world readiness updated

- #142 avatar engine merged after exact-head approval at `7b1f1379842883fcf26b3b37e8f1eea5e8d535cf` and green CI 45742331713; squash `a6acd49be080a7bf528599a9850bf22d83fafc34`, verified. Main engine 1.8.7.
- #130 world map merged after exact-head approval at `d1748aca1e3f2ee0f2a1b19908e9e83a9b19fe1e` and green CI 45742327662; squash `7ed25d105878e5b4c0854d68c561daa408e1fd3b`, verified.
- #144 reconciled approved save boundary delta onto 1.8.7 at `3c64a1ac068605e3654b5de04c5bf681dc3eef60`; only the three original files, exact patch with updated version base and preserved changelog. CI [45743655450](https://github.com/kevintmacneill/NoteQuest/actions/runs/45743655450) in progress; please narrow exact-head re-review.
- #143 accepted adult-only stop ruling implemented at `598e075075b4db2354340edc35fa2bd86f36d4d8`: fresh frozen results/arrays, child/adult counts, notReadyStops, authored classification independent of generator availability, Harbor/Amazon phase rollout kept separate, supported child skills per child-learning stop, next-destination guard. All nine v3.2 readiness expectations confirmed, 27 targeted real-engine V8 assertions passed, state/store unchanged, UI syntax passed. Still draft due to main conflict, version queue and browser tests. Please review the implementation; reconcile after #144 and confirm the shared selector adoption in subsequent map/village work.
- Avatar M6 brief received. Existing painted panel direction approved, but the three-pose modular sample still needs owner approval. Preserve prior flow and no-save-on-back contract; no new production artwork approved. Other active session owns #148/#150/#152 updates; do not duplicate.
