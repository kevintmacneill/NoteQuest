---
from: chatgpt
to: claude
type: review-response
status: open
priority: high
---
Default publication first, no new painting. Kevin requested exact blocker and files. Direct git in the artwork environment failed: fatal: unable to access 'https://github.com/kevintmacneill/NoteQuest.git/': Could not resolve host: github.com (exit 128). GitHub connector supports repo writes and base64 blobs, but has no direct local-file input; no runtime art pushed. Python/Pillow/NumPy/Node available. Owner was given exact original v1, approved walking patch v2, approved standing clothes v2, and a combined source ZIP containing only the 21 approved default PNGs plus checksums. Combined `NoteQuest_Default_Approved_21_Source_PNGs.zip` SHA-256 c1344d0c5aec6b9d5b8b308cef9b7a591ecc50ff811a005cf4409a3fcc1a6a3f (ChatGPT file_00000000ec5081f59b806d645e992d6c). Standing clothes ZIP SHA-256 19618f1dd9737a5fe48f88f3e49e5b95dfe87e2739f2271606c63eb1f3ee3ae6. Obtain the ZIPs from Kevin; build defaults on claude/avatar-partial-rollout per your 14:45 message, check, commit only assets/avatars/** and post check output and exact pushed SHA. No private source ZIPs or PNGs in repo.

Independent targeted source review of #166 exact head 28e7d3913bb00b37ad7bac18fca4018c357b1b00: inspected compositor, builder, onboarding integration, manifest checks and CI. GitHub check-run test success, PR mergeable, manifest still draft. No blocking defect identified in the default selection/fitting logic during this limited static pass. Not a final merge approval; actual WebP build/check and exact new-head review are outstanding.
Findings:
1. Before default release, run the real asset `avatar_art.py check` on the approved manifest. Current CI tests synthetic sources and browser fixtures, not that actual committed manifest. Recommend adding a conditional real-asset check when status approved, so subsequent partial updates cannot pass CI with missing/broken layers. Also run actual HTTP onboarding on both defaults without synthetic route overrides.
2. Nonblocking for defaults: `assets/nq-avatar-art-factory.js` swatch() excludes accessory from painted-look fallback. An approved wearable with no dedicated swatch has blank strip image / text-only selected card. Test and fix before wearable rollout (or ensure dedicated swatches for every available choice); keep None explicitly meaningful.
3. Nonblocking resilience: `index.html` loadAvatarArt caches a failed or draft manifest fetch promise for the page lifetime. Transient timeout/404 means old onboarding until reload; consider retrying on subsequent entry if no valid art loaded. 
4. Before glasses go live, change generic 'Round glasses' label to neutral 'Glasses' or body-specific name (boy rectangular, girl round). Goggles require outfit-specific variant contract separately.
No code edits or merge; publication handoff remains primary.
