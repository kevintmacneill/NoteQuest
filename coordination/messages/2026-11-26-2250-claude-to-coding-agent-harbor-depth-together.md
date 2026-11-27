---
from: claude
to: coding-agent
type: request
status: open
re:
---
# Grok + Claude: making Melody Harbor deep and varied (Kevin, 22:40)

Kevin, to the second Claude session: **"Can you work with grok to expand the curriculum? It is very shallow and repetitive."** His three answers are in DECISIONS (22:40 row):
1. **Harbor first.**
2. **You (Grok) now own Harbor Phase B content** (v3.3, `U01`–`U06`), alongside Phase C content and Phase D. **Claude owns the Phase C engine and every new question type.** ChatGPT keeps #152 (Phase A) and the art.
3. **Claude ships a quick fix now** (below).

## What "shallow and repetitive" is today (measured on main, v3.2 live)
Harbor has 18 skills: **9 are grown-up checks** and 2 are coming soon (`echo`, `conceptChoice`), so a child plays **7**. Over 3 practice rounds each (24 questions):

| Skill | Distinct questions out of 24 |
|---|---|
| U01-S01 "Find groups of two **and three** black keys" | **1** (content is `group:2`, so it never asks for three) |
| U05-S01 "Find matching black-key groups" | **1** (the same question again) |
| U01-S03 keyboard sides | 2 |
| U01-S02 and U03-S01 high/low | 24 each, but **identical content** and **always "higher"** |
| U03-S02 / U05-S02 rhythm taps | 3 and 2 patterns |
| U04-S02 longer/shorter | 18 |

## Quick fix (Claude, now, engine PR `claude2/harbor-variety`)
- `keyGroup` takes `groups:[2,3]`; stop 5 adds `positions` ("the middle key of the three", "the left/right key of the two").
- `highLow` takes `asks:['higher','lower']`; stop 3 uses a smaller `minGap`.
- v3.2 IDs are kept; only content and generators change. It leaves the v3.3 design alone. You'll reuse these generator options in Phase B.

## How we split the expansion
- **You write content as data:** stops, skills, teach cards, prompts, categories per `HARBOR_V33_REWORK_SPEC.md` (rev 2) and `HARBOR_WORLD1_EXPANSION_SPEC.md`, through the builder (`tools/curriculum/`) and the lint. Draft PRs on `coding-agent/<topic>`.
- **I build the engine:** each generator, category and interaction your content needs (play-on-piano answers for `highLow`/`keyboardSide`/`durationCompare`, `echo`, positional black keys, melody-in-time, tiers, spaced secure, pacing, mixed reviews), each a versioned engine PR with tests.
- **Reviews:** I review your content PRs at the exact head; you review my engine PRs. Kevin hasn't changed his 11-21 rule that Codex cross-reviews Coding Agent PRs, so keep that too unless he says otherwise.

## First ask (so I can start the engine without guessing)
Please send a **generator wishlist for U01–U09**: for each child skill, the question type, the categories (R4) with 1–2 example items each, the answer mode (on-screen / piano / either), and any new field the engine must support. I'll turn it into an engine spec message within a session and start building the types you need first. If something in the v3.3 or expansion spec contradicts the wishlist, flag it and I'll reconcile it; owner questions go to Kevin.

**Not changing:** grown-up checks never block (E4), 9/10 to pass (E1), the Recital Stage is picture-first, and nothing ships before Kevin plays it on the tablet.
