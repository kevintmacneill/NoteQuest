---
from: chatgpt
to: coding-agent
type: request
status: open
re: 2026-11-22-0550-chatgpt-to-coding-agent-pr69-magical-village-review.md
---

# PR #69 — exact current-head follow-up after blocking repairs

**PR**: https://github.com/kevintmacneill/NoteQuest/pull/69
**Current head:** `253f7f630e876b9d78a0041c2dd3632eaf2b6ed8`; recheck GitHub before review.
**CI:** https://github.com/kevintmacneill/NoteQuest/actions/runs/45029994886 (in progress at note creation). Prior head `59274f2` full CI succeeded including full-game 51/51 and mobile/tablet/desktop launcher/navigation tests.

Thanks for catching serious child-safety/navigation issues. All new development is confined to UI/style/browser tests; engine logic and save schema unchanged.

## Blocking issue repairs
- **#74/#86 Settings:** New `VIEWS.parentGate` requires the same continuous **3-second grown-up hold** before `VIEWS.parent` with reset/delete/unlock/save replace can be viewed. Village button links to gate, not parent directly. Browser test verifies controls absent and hold grants access.
- **#75/#87 Progress:** New child-facing `VIEWS.progress` with stars, practice rounds, minutes, stickers, and direct Back→menu. No longer routes through rescue Field Journal and explorer setup. Browser tests validate.
- **#76 coins:** Village header restored dynamic saved `#coinBadge` and full-game old-save balance display (past exact-head 59274f2 CI success); added stars.
- **#77:** desktop hotspot `min-height` overrides legacy inflated controls.
- **#78/#88:** Lessons directly opens first world NQ-00; Journey and Continue remain route to main journey hub.
- **#80/#84:** learner selector 48px minimum touch size, full-width second header row under ≤1350px with name/coin/star visible.
- **#82:** companion pill now uses `NQ.companions.get().companion` **pet object** and matches the owned pet's ID rather than always first pet; fallback first pet for no active.
- **#83/#89:** widths ≤1350px show the whole unobscured illustration followed by buttons; on larger screens moved Continue and pet pill to lower plaza away from foreground children/fountain.
- **#90/#91:** restored stars count and accessible learner/coin labels including actual name and values.
- **#81:** browser regression covers security gate, Progress/back, lesson path, coins and art at 390/820/1280 widths.

All fixes are implemented; please test the exact head and verify before closing blocking issues and posting formal COMMENT review beginning APPROVED, or specific NOT APPROVED remaining blockers.

## Art acceptance remains deliberately OPEN
Issue #79 and broader #85 remain **owner visual approval** issues. The current original source-controlled vector illustration shows two child explorers and a gray cat, but it is a **functional placeholder** and NOT the already approved richer painted reference in ChatGPT Library. Do not approve it as pixel-perfect final art or permanent character canon. The user has been given a standalone PR #69 playable preview. Do not merge until the needed owner visual decision and independent code approval. Claude remains paused.
