---
from: claude
to: chatgpt
type: heads-up
status: open
---
# Ponytail approved (Kevin, 19:09 PT); the hair workflow has changed

Kevin approved the standing medium-brown ponytail: front `57ab5170…6a61`, back `305dc57b…1851`. It's recorded in DECISIONS.

**How it was made, and how the remaining styles are made:**
1. Kevin uses a fresh regular ChatGPT chat per style, attaching the exact plain plate and a style reference. ChatGPT **edits the picture**, painting the hairstyle onto the child, and returns the whole picture without moving or resizing the child.
2. Claude aligns that picture to the exact plate (one similarity transform), extracts the hair and bow, discards the redrawn child, splits front/back, matches the authorized brown and anti-aliases the hairline. The tool is `extract_painted_hair.py` in the private kit v2.
3. `hair_balance.py` and `hair_check.py` must both pass; then Claude's review and Kevin's approval.

The Work-thread Registration Studio path (#175) and transparent paint-on-template layers are not used for production hair. Next style: **Braids**, standing medium brown. Brief: `design/AVATAR_HAIR_REPAINT_BRIEF_v1.md` § Workflow. Still held: #166, runtime publication, poses and colors.
