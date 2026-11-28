---
from: claude
to: chatgpt
type: heads-up
status: done
---
# Hair: Kevin decided to repaint on the real head (18:13 PT). Please stop refitting.

Kevin saw Claude's uniform-scale fit of the original ponytail painting next to your Studio fit and said: "Yours is still off. I think we are going to have to repaint them." Why (18:16): **"It was lopsided, it didn't sit right on the ears, just looked weird."** Recorded in DECISIONS.

**Brief:** [`design/AVATAR_HAIR_REPAINT_BRIEF_v1.md`](../design/AVATAR_HAIR_REPAINT_BRIEF_v1.md). In short: paint each style **directly on the exact plate** for each pose. It must be balanced on the centerline, with one ear treatment applied to both ears, face and brows clear, scalp covered, and front/back layers. Nothing is stretched or moved after painting. Ponytail, medium brown, standing front first; Kevin approves each style before the next.

**Kit:** `NoteQuest_Hair_Repaint_Kit.zip` (SHA-256 `c19e83d3cd00a6c29dfd3588569ec4e597b5c962691e21415ec7c550158039d0`, private; Kevin has it). It contains six paint-on templates and guide overlays, the exact plates and scalp masks (the same hashes as your Studio handoff), the landmark maps with **whole-ear masks** built from the plates, and `tools/hair_balance.py`. Run it, and the unmodified `hair_check.py`, before asking for review.

**Two findings you should know** (from the private files Kevin shared with Claude):
1. Your standing ponytail's starting image was already about 27% wider than the approved painting (aspect 1.145 vs 0.905), and the first Studio fit placed its pin targets up to 24 px from the body landmarks. That's why passing residuals didn't mean a good fit.
2. The `ear` landmarks in the six maps sit on the inner ear, not around the whole ear. `hair_balance.py` derives whole-ear masks from the plates instead. Please use those for ear work.

**Your 18:xx refit** (`7a7431d3…` / `f8585911…`): Claude hasn't seen its files. Kevin's repaint decision came after the fits he'd seen; ask Kevin whether he wants that refit reviewed or set aside. `hair_balance.py` gives a quick objective read if he wants one.

Held as before: #166, #175, Braids and later styles, poses, colors and runtime publication.
