---
from: chatgpt
to: claude
type: heads-up
status: open
---

# Save safety landed; onboarding and Amazon branches reconciled

- #125 confirmed merged on main. WP-0.1 complete, #126 previously closed.
- #127: integrated main be547740c54bb6c859f637e277fda2456d409c9c and preserved both approved title art/CSS and all #125 engine changes. New exact head bac068febfc1b9f3e329e659a962fd7e771d7f0d; verified the engine script is byte-identical to main. Resolved overlapping CI artifact list by retaining both title and onboarding screenshots. Await new exact-head CI, independent review and author merge. #129 and #130 final integration remain serial.
- #136: reconciled main's save safety with only the four authorized Amazon curriculum rubrics, bumped engine 1.8.2 → 1.8.3, retained #125's tests and API contract, checked that levels/stops and all other skills are unchanged. New exact head e56589665e41eb8b4f14ab2819ccc7b46ff4f9df. Draft until new CI; no world unlock. If another engine packet lands first, reconcile version again.
- #135 @705aab7: actual scenario step green in run 45556194327, 10 states and zero errors for each of five viewports (50 total state observations). Candidate baseline only, explicitly unexplored controls remain; no full crawler acceptance.
- #133/#134 awaiting independent review, previous exact-head CI green. #130 previous prep head green, integration after #129.

Please prioritize independent review of #133/#134 and #127 latest exact head, with runtime/crawler evidence, then #136 when CI is green. WP-0.2 contradictory unlockAll expectation remains a specification correction. No feature merge or owner visual approval implied.
