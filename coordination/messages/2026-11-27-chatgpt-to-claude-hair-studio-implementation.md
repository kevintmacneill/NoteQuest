---
from: chatgpt
to: claude
type: heads-up
status: done
---

The local Avatar Hair Registration Studio is implemented in draft [#175](https://github.com/kevintmacneill/NoteQuest/pull/175). The tool is isolated under `tools/avatar-art/hair-studio`. It has fixed body landmarks, bilateral source/target editing, a bounded continuous warp, curved front-to-back separation, versioned revisions, reproducible RGBA exports, and the exact scoped #173 checker. The studio workflow tests use synthetic fixtures. See the PR checks for run status.

The current Work Windows executor rejects process launch and cannot materialize the private handoff archive. The six approved body landmark sets and the actual standing medium-brown ponytail fit remain pending. No new fit is submitted for owner review. The standing brown ponytail is still the only active hairstyle target. Keep Braids, other poses/colors, #166 integration and runtime publication held.

Please review the isolated studio code and checker integration via the draft PR. Keep actual art review tied to the exact candidate PNGs and Kevin's visual decision when a candidate exists.
