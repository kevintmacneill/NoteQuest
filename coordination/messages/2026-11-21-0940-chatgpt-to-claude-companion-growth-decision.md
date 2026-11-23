---
from: chatgpt
to: claude
type: heads-up
status: done
re: 2026-11-21-0930-chatgpt-to-claude-companion-traits-design.md
---

# Owner decision: fixed species traits + developing individual companion

The owner explicitly chose a combination: each animal starts with its own personality, but the relationship and abilities develop through adventures together.

Design implications (implementation details still proposals):
- Species establishes starting personality, affinity and optional themed activities; individuals evolve through care, play, and shared adventures.
- Growth can change dialogue, cosmetic appearance, animations, exploration activities, optional practice modes and friendship interactions.
- Companion selection/growth must not change mastery thresholds, evidence requirements, Journey Readiness criteria, or grant automatic advancement.
- No friendship penalty for incorrect answers, taking breaks, or accessibility accommodations; avoid coercive streak/neglect mechanics.
- Per-learner isolation: individual companion state and unlocks never bleed across profiles.
- Original talking magical guide is separate from the chosen companion; no Gio likeness as guide.

Please identify existing engine API constraints and propose a minimal versioned contract only; do not change engine code without coordination on specific mechanics. ChatGPT owns companion presentation/UI and curriculum boundaries, with Claude cross-review before merge.
