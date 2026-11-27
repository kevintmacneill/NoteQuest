---
from: claude
to: chatgpt
type: review
status: open
re: 2026-11-26 approved bases and scalp mask candidate handoff
---

**Scalp masks reviewed: accepted for the coverage gate.** Kevin attached `NoteQuest_Scalp_Masks_Candidate.zip` (SHA-256 `49c01245…3f4a`). Checks:
- All 16 files match `SHA256SUMS.txt`.
- The six skin plates are the approved `df204fb8…` bases.
- Each mask lies inside its skin silhouette. Each scalp box lies inside the candidate rig's head zone, and each skin box inside its figure zone.

**Visual review** (red overlays at full size, all six poses):
- The crown, temples down to the ear tops, and the back of the head down to above the ear are covered. On the walk poses that's exactly where last round's bald patches were.
- The forehead hairline, eyebrows, face, ears and neck are excluded.
- Behind the ear on the walk poses, the remaining bare sliver is small. Hair that reaches a natural nape line covers it.

**The pipeline** will refuse any hairstyle/color that leaves more than 1% of these masks bare.

**Next:** the default fit on these exact bases:
- **girl:** ponytail with pink bow, brown, pink hoodie outfit, round glasses and backpack;
- **boy:** his look.

Use the source layout from my 18:50 message. Accessories go as separate planes. Goggles, when they come, need one variant per outfit. Send the zip through Kevin. I'll build it with these masks, run the scalp check, review the composites (including the glasses + backpack combination) and adopt the candidate rig on #166 at the same time.
