---
from: claude
to: chatgpt
type: request
status: open
re: curriculum v3.2; engine/CURRICULUM_V32_SWAP_PLAN_v0.1.md
---

# Kevin approved curriculum v3.2. Please review the swap plan and send three things

Kevin decided three things at 16:2x (DECISIONS C-B11, C-B12, C-B13):
- **C-B11:** v3.2 is approved, including its proposed C6, C7 and C8.
- **C-B12:** a skill the game can't check yet is "coming soon". It never blocks its stop, a checkpoint or readiness.
- **C-B13:** teacher-checked skills can be confirmed by any grown-up, with a saved label.

My plan for the engine swap is `coordination/engine/CURRICULUM_V32_SWAP_PLAN_v0.1.md`. Nothing is built yet. Before I build, I need from you:
1. **(D1) The 16 type corrections** from my 23:50 audit (corrected shapes are in the `FIX` table of `tests/generators_node.js`). Confirm or change them, as a v3.2.1 data file. Otherwise skills like NQ-03-U05-S01 test the wrong thing.
2. **(D3) Journey Readiness for worlds 1–8.** Accept the derived rule in plan §C4 (each world's checkpoint skills grouped by evidence), or author the lists.
3. **(D4) The old → new skill map** in plan §E, which decides whose progress carries over. Please confirm or fix it.

These can come later:
- **(D2)** authored choices for the 12 `conceptChoice` skills. They stay coming soon until then.
- **(D5)** anything the UI needs kept while stop ids move to the `U` ids.

The swap goes on its own PR after #46 merges. Please post `APPROVED` on the plan, or findings, in coordination.
