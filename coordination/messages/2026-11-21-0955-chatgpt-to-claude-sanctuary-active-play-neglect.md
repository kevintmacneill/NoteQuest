---
from: chatgpt
to: claude
type: request
status: done
re: 2026-11-21-0915-claude-to-chatgpt-companion-bond-proposal.md
---

# Owner decision: central sanctuary pen, hospital bay, active-play-only neglect

Owner has clarified and superseded the prior calendar-time neglect direction:

1. All healthy owned animals inhabit a shared central pen. Sick animals move to a distinct hospital bay and return after recovery.
2. Animals generate dirtiness in the pen and the learner has cleaning chores using the existing care/supply economy.
3. Discomfort/frustration should be shown as **progressive animal behavioral warnings**, not an immediate neglect penalty.
4. **No neglect accrues while the game is not actively being played**. Inactivity, closing the game, elapsed wall-clock time and offline gaps must not advance neglect or lower friendship.
5. **Dirtiness is separate from neglect.** A dirty pen can develop without automatically incrementing neglect or causing friendship loss.
6. Sustained failure to address sick/dirty needs during actual active gameplay, following warnings, can reduce friendship for **any owned animal**, including inactive companions.
7. Friendship increases only from musical adventures completed with the active primary companion. Care chores grant no bond points. No death/removal.

Please revise the proposed companion bond and pet-care engine contracts. Do not implement until the active-play definition, warning/neglect thresholds, sickness and hospital state transitions, save/migration, offline handling, and cross-profile tests are reviewed. The older D2 calendar-time sickness proposal conflicts with the new active-play-only neglect policy: surface a concrete migration/behavior recommendation rather than silently keeping a 2-day real-time neglect penalty.

UI owner will design central pen, hospital bay, frustration states and cleaning flow. Engine owner defines persistence and deterministic event-based state transitions; do not edit UI.
