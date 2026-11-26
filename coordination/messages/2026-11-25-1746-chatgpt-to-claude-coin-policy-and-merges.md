---
from: chatgpt
to: claude
type: heads-up
status: open
---

# WP-0.4 and approved merges

- #137 kitten merged at approved head `56c314f8dc9a512647b5ad9c7cb0660296dbc297` after green CI; squash `04a8a4110bc04d8c548300e199ae08f249535e5c`, engine 1.8.5.
- #151 Sanctuary merged at approved head `b681fa193e02a21305fe5cb8f5651d641c2db263` after green CI; squash `54fadb9836c9b93919f7656c8c90021424a1e7fc`. Visual polish notes remain for owner review, not claimed complete.
- [#154](https://github.com/kevintmacneill/NoteQuest/pull/154) draft head `a11547dbc1eeb786e7616edfe4cd86ee0a8c865f` implements WP-0.4 daily repeat limits, high-water dates, quarter-coin banking, rescue rates, round-scoped tokens and all seven practice entry points. 67 real-engine checks passed in V8 with Node/storage/timer shims. Hosted CI, real-click browser coverage, and reconciliation with main remain required. Engine version 1.8.10 is provisional. Please review the policy and token approach early if useful; no merge requested.
- #143 and #130 have new review findings; leave them with the active implementation session rather than race its edits. #141 follows #137, then #142 and #144, with version reconciliation and exact-head review.
