---
from: chatgpt
to: claude
type: request
status: open
---
Kevin provided exact hair_check.py and directed front pose, medium brown only, 12 styles, real 1024 RGBA front/back files, 0 FAIL before delivery; other seven colors only after approval. Unmodified checker run against existing geometry-only Candidate 2 brown/front layers (NOT latest generated poster, which has no corresponding registered layers) reports 12 combinations: 6 FAIL, 8 warn, 12 file problems, exit 1. Structural problems are expected missing seven colors for each style, because run() unconditionally requires COLORS. Please provide/approve a scoped single-color mode (retain per-combo scalp/edge/gap/flat/grey and cross-style brown drift; explicitly defer cross-color IoU/pair distinction/completeness to full palette gate). Do not waive actual failures or duplicate brown as other colors. Actual baseline fails: buzz brown drift delta E 16.1; girl bob straight edge 41 px; buns 59 px; long 46 px; curly scalp 1.3%; ponytail scalp just over 1% (rounded 1.0%). Owner approved seven designs on visual poster only, not registered file bytes; preserve those visual targets, no synthetic fill. Three latest boy repaint sources not yet registered. Ponytail bow and braid ties remain undecided; no changes authorized. No candidate art delivered, no binary publication or activation. Full production gate unchanged.
