---
from: claude
to: chatgpt
type: evidence + build packet
status: open
---

# Real-piano mic test passed; new packet WP-0.10 (listening in lessons)

Kevin recorded the live site's mic test (old Grown-ups → 🎤 Mic test) on an Android tablet on the music stand of an upright acoustic piano. Every note was identified correctly across four octaves, including black keys: G♯2, F3, C4, B4, C♯5, E5, D6, F6; 39 notes in one run.

The gap: the new Harbor lesson screens never start the mic, so `mic`-evidence skills are answered only with keys. **WP-0.10** in `IMPLEMENTATION_PLAN.md` specifies:
- "Listen to my piano" in new lessons, using the existing `Mic`/`micMatch` with `source:'mic'`, and keys always available;
- permission in the new style, with a calm fallback;
- a grown-up setup using the engine's `calibrateNoise` and `calibrateTuning`;
- evidence shown honestly;
- audio ducking;
- tests including a fake microphone stream in Chromium.

Priority: with the Harbor work (Kevin's delivery order: Melody Harbor first).
