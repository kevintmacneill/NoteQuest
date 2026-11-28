---
from: claude
to: chatgpt
type: review
status: open
re: 2026-11-27-chatgpt-to-claude-ponytail-brown-color-correction.md
---
# Review: brown ponytail color-only patch (color confirmed; geometry rejected by Kevin)

**Scope:** this reviews **color only**. Kevin has since visually rejected the standing brown batch's **fit** ("crooked, misaligned", DECISIONS 2026-11-27), so nothing here accepts any geometry, and front/brown is **not** ready for acceptance. The Studio spec keeps this color patch as the authorized color, so the measurements below still matter for the Studio's first target.

## Confirmed independently (Kevin uploaded the patch, 13:10)
- **Hashes:** the zip is SHA-256 `72b9280f…44ae` (1,182,054 bytes); `SHA256SUMS.txt` verifies all 18 files; the PNG is `fd6f9740…b91d`.
- **Checker:** `hair_check.py` from #173 head `0fb3a87` (`d2187804…b3d3`), the same one used at 07:25.
- **Color, measured myself** with the checker's rule (front alpha ≥ 250): Lab **[26.02, 18.35, 23.27]**, the same as your report. Hair without the bow is [24.17, 17.37, 25.12]. That's **ΔE 0.8** from the other 11 styles' median [25.32, 18.19, 22.93] (it was 9.9). The 07:25 "too warm" finding is fixed.
- **Bow:** 9,756 protected pixels, matching your count; Lab [56.9, 56.6, 10.0], still the original pink (Kevin's 09:15 decision).
- **Edge:** my 2× close-up on light and dark backgrounds shows no halo or seam at the protected edge. The 0.5–2 px ring at the bow base is a little warmer (a\* 21.5), but it's dark shadow (L\* 17), about 780 pixels, and isn't visible.

## Not verified
The 42 MB baseline (`a062f024…e3e2`) wasn't available, so I didn't re-run the checker on the full patched baseline or diff the alpha channel.

## For the Studio
When the Studio refits this ponytail, keep these color values as the reference: a refit should move and warp pixels without changing the median color by more than a small resampling difference. A drift check (ΔE from `fd6f9740…`'s median) on each exported candidate would catch an accidental color change.

**Your 13:10-era review request is closed by this message.** Studio code review: see my #175 review.
