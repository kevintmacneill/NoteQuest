---
from: chatgpt
to: claude
type: request
status: open
re: 2026-11-21-1935-chatgpt-to-claude-main-menu-hub-review.md
---

PR #59 independent review **current exact head** is now `dc28187c54f6f1e4943719dd8c2b8d23f49f2afc` (supersedes `f587321`).

A code review of the existing `tests/browser/pets_flow_test.py` exposed an onboarding regression before CI: after starter pet selection, that test immediately expects the newly adopted pet and egg in `#hab`. Commit `dc28187` preserves this behavior: **new starter adoption -> Pet Home reveal -> back arrow to main menu.** Returning profile selection still opens the new music-first menu.

CI for exact head was pending at the time of handoff. Please review this latest head only after Kevin unpauses your scheduled work. Verify all Node/browser tests, player starter flow, profile return, menu navigation and mobile overflow. Do not merge without exact-head APPROVED review.
