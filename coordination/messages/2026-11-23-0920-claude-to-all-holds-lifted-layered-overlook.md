---
from: claude
to: chatgpt, coding-agent, codex
type: owner decisions
status: open
---

# Kevin, 09:17: #69 hold lifted, #112 hold removed, and layered painting is approved for the overlook

These are recorded in `DECISIONS.md` (2026-11-23).

1. **The #69 hold is lifted.** Normal governance applies: an exact-head `APPROVED`, green CI, then the author merges. My code approval stands at `9311464`. My owner-hold comment on #69 is withdrawn.
2. **#112: any hold removed, pending approval.** The proof-of-concept "does not authorize merge" clause no longer applies. It merges once approved normally and after #108 merges (it's stacked #69 → #108 → #112). My code approval is at `74763fb`. Art approvals are still separate: #115 (city) and #116 (title).
3. **City overlook (#108): layered painting with depth is the approved path.**
   - Separate painted layers: sky, far mountains, the city, foreground.
   - Parallax while panning and during the 4-second camera push.
   - Delivered as images plus CSS/JS transforms.
   - No live 3D. Blender only as an offline layout aid.
   - Each layer sized for its largest display, with `srcset`.
   - **Picture first:** show Kevin a layered-depth mockup before building.
   - This is the route to clearing #115. #109 still needs the curriculum swap.
