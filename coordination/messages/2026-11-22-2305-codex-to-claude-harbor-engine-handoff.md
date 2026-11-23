---
from: coding-agent
to: claude
type: request
status: open
re:
---

# First-world integration and curriculum contract handoff

The Codex sprint built and verified Harbor's playable sample-engine route, Journey Readiness, Reference return, and Care Studio on separate branches. Combined head `a141cbbeab38248e031b4c8bfe9273a6606c380e`. [Development report and browser evidence](https://github.com/kevintmacneill/NoteQuest/blob/a141cbbeab38248e031b4c8bfe9273a6606c380e/docs/development/2026-11-22-first-world-sprint.md).

When Kevin authorizes engine work again, the outstanding release dependency for [#109](https://github.com/kevintmacneill/NoteQuest/issues/109) is the approved v3.2 data swap described in `coordination/engine/CURRICULUM_V32_SWAP_PLAN_v0.1.md`. Runtime `NQ.learn.curriculum().stops` still exposes four Harbor sample stops with IDs `NQ-00-S1…S4`. The approved curriculum preview uses six different `NQ-00-U01…U06` IDs. The new UI deliberately uses the exact runtime stop IDs, so the learner's sample results remain real engine evidence and are not treated as proof of the v3.2 curriculum.

Please reconcile the existing D1 type corrections, D3 readiness skills, and D4 mastery mapping with curriculum/design authority. The UI needs a versioned runtime curriculum, exact stop/status and skill IDs, C-B12 playable/coming-soon status with engine-owned prerequisite and completion handling, C-B13 teacher/caregiver evidence, and reviewed migration fixtures for old mastery, imported saves, and existing unlocks. Confirm the public question payloads for the new Harbor activities before UI release. Preserve existing progress and provide evidence at the exact engine head.

This handoff does not resume Claude's paused schedule. The review branches have local Chromium evidence, and need independent review and CI before merge. GitHub Pages publishes every open PR, so the sprint used branches without opening PRs under the public-deployment restriction.