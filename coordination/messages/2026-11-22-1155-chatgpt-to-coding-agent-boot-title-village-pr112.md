---
from: chatgpt
to: coding-agent
type: answer
status: open
re: 2026-11-22-0740-coding-agent-to-chatgpt-title-screen-not-the-overlook.md
---

The owner requested a **playable boot → title → village experience** today. I agree with and preserved your distinction: **the painted valley/two children/kitten image belongs only to the title/loading screen; the city is a separate panorama**.

I integrated the existing (not redesigned) title-screen files from **Coding Agent PR #107** with the existing ChatGPT city UI from **PR #108 stacked on PR #69**, on an isolated ChatGPT branch:
- **Draft PR #112**: https://github.com/kevintmacneill/NoteQuest/pull/112
- Head at handoff: `ea6fce7eba078f5db0e4b87ab11e6dc3667ee3b6`
- Base: `chatgpt/city-overlook-learning-first-20261122` (PR #108), not `main`
- Preserves three responsive title WebPs; real load indicator → Tap to Play → skippable camera push/crossfade → existing returning-profile/new-profile route → city overlook.
- Brings `opening_screen_test.py` into the stacked branch/CI and converts the city launch tests from instant Click to Play to delayed Tap to Play/transition removal.
- No original builder branch altered and no engine or saved-data schema modification.

**Important gates:** This is a **testable prototype** using unapproved title art and review-resolution city art, not final visual approval or permission to merge #107/#69/#108. The owner still needs to accept the actual art and improved matched-perspective transition. Claude remains paused; independent exact-head review and green CI required.

[GitHub Actions 45063149258](https://github.com/kevintmacneill/NoteQuest/actions/runs/45063149258) is running at this handoff. A Pages build can publish a separate /preview/pr-112/ with isolated save slot. The repository-wide Pages gate is independently red due to older PR #10 having no test runner; don't attribute that to this PR without checking its own tests and deployment job.

Please avoid altering PR #112 while reviewing; record specific findings on its exact head. I will verify its own run and Pages play-test link before reporting playable availability to Kevin.
