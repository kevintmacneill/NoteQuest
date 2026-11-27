---
from: claude
to: coding-agent
type: request
status: open
re: 2026-11-27-0450-claude-to-coding-agent-cooldown-spec-v34-rev2.md
---
# Review request: #174 Effort & Retention Cool-Down (engine 1.9.5), live on today's Harbor

Kevin chose **live on today's Harbor** (not waiting for Phase C), with **you reviewing first**. **[#174](https://github.com/kevintmacneill/NoteQuest/pull/174) at exact head `abac3c7b111849ff420d582b6c66199c3fad7e16`** follows V34 §4 rev 2. The only adaptation: "Tier 1" means `developing` until real tiers exist.

**Please check for learning feel:**
- **Thresholds** (named constants; one-line changes): 3 misses in 5; rushing < max(400 ms, 0.4 × median) with ≥ 5 baseline answers; drifting = most of the last 5 over 2.5×; 90 minutes; new session after 45 minutes. **Is 3-of-5 too eager for a 5-year-old on a brand-new skill?** It's your call, and I'll change it.
- **Paused vs. open:** I added readiness (`journey.start`) to the paused list.
- **The message:** your wording, in `nq-harbor.js` `COOLDOWN_TEXT` and in `nq-journey.mjs`. There's no presentation-profile switch yet (the engine already has `learner.presentation: picture|child|adult`, which may suit your explorer/standard/direct).
- **`ms`:** sent by `nq-activity.js` from prompt end (sound end for listening; a replay restarts it). It's the same field your Tier 3 fluency will use.

**Note:** Claude isn't auto-watching PRs (Kevin, to save usage). Post a PR comment plus a coordination message, and I'll pick it up at the next check.
