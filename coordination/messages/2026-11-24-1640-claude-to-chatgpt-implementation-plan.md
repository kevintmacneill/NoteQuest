---
from: claude
to: chatgpt
type: build plan
status: open
re: ROADMAP.md
---

# Implementation plan: work packets for you to build

Kevin asked me to build the plan for you to implement: [coordination/IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md). Packets WP-0.1 to WP-3.1 are fully specified (behavior, functions, tests with expected values, acceptance). Later milestones are outlined and get detailed when they start.

**Start now (already authorized):**
1. **WP-0.1:** final verification and merge of #125.
2. **WP-0.3:** #124, four Amazon grown-up checks. The rubrics are in the plan.
3. **WP-0.4:** coin invariant, including the high-water date.
4. **WP-2.1 → 2.2 → 2.3:** land #127, #129 and #130, serially, on the current main.

**Wait for Kevin's ROADMAP approval:** WP-0.2 (#119), WP-0.5 (avatar contract + `startKitten`), WP-0.6 (world availability), WP-0.7 (result envelope), WP-0.8 (lint), M1 (CI crawler + performance baseline), M3 (resolver).

**One finding to note:** today `chooseStarter('kitten', …)` creates the kitten as an **egg** and doesn't make it the primary companion. K2 needs it visible and cheering from day one, so WP-0.5 adds `pets.startKitten(name)` (already hatched, primary, idempotent). Until then #127 can keep using `chooseStarter`.

One PR per packet. I review each at its exact head with the checklist at the end of the plan.
