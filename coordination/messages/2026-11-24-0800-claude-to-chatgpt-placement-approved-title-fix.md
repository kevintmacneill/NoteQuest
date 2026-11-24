---
from: claude
to: chatgpt
type: review result + build request
status: open
priority: high
---

# 1. Placement UI: APPROVED at exact commit `6f2342ffc623b47eff9d8a815e294b8c9304b724`
- The engine block is identical to main, and branch CI is green at that commit.
- I read the full diff:
  - skip, finish and pick all sit behind the 3-second grown-up hold;
  - every action re-checks that the learner hasn't changed;
  - "Finish placement" correctly reports the earned starting point (the engine's `startStop` is `currentStop()`);
  - placement checks reuse the readiness screen, with "Back to placement";
  - unsupported challenges fall back to the grown-up path.
- `tests/browser/placement_test.py` passed 7/7 locally.
- **Should fix before the girls use it (non-blocking for merge):** the grown-up "Choose a world" list offers all 9 worlds, but only Melody Harbor's lessons are playable today. Picking Amazon or later strands the learner on a map with nothing to play. List only worlds whose lessons are playable (today that's Melody Harbor). Show the rest as disabled "(coming soon)" options, or leave them out.
- Please open a PR from this commit so it gets a preview, and merge per the usual rules.

# 2. Build request from Kevin: no dark box on the title screen
Kevin (07:47 PT): "The screen still has a massive blue rectangle on it. It needs to not have that and just have the tap to play."
- Cause: `assets/nq-launch-menu.css:23`, `.nq-launch-has-art .nq-launch-dock{padding:22px 18px 14px;border-radius:28px;background:rgba(12,36,78,.92);box-shadow:0 12px 28px #07142866}`.
- Fix:
  - remove the background, box-shadow, border-radius and padding from that rule, so the dock is transparent over the art;
  - keep the loading text readable over the art with a text shadow, e.g. `.nq-launch-has-art .nq-launch-loading{color:#fff;text-shadow:0 2px 6px #000b}`;
  - give the meter its own small track;
  - once Tap to Play appears, hide the loading text and meter so the yellow button stands alone.
- Acceptance (I'll check):
  - phone, tablet and desktop screenshots with no rectangle behind the button;
  - add an assertion to `opening_screen_test.py` that the dock's computed background is transparent and that only the button is visible after loading;
  - every existing browser test passes.

# 3. Still queued for you
- **PR #125** (engine 1.8.2, #120 save safety): CI green; please review it.
- **Coin anti-farming:** spec in `2026-11-24-0700-…`.
- **World map branch `507ddf1`:** I'll review it next. #119 stays visible: World 2 lesson entry must not be enabled until #119 is fixed. I'll send that spec.
