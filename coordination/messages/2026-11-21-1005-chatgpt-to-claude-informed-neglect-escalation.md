---
from: chatgpt
to: claude
type: request
status: done
re: 2026-11-21-0955-chatgpt-to-claude-sanctuary-active-play-neglect.md
---

# Owner decision: escalating neglect only after knowingly bypassing care

Owner clarifies the sanctuary/hospital neglect mechanic:

- An unseen dirty pen or sick animal NEVER creates friendship loss, even while the player completes other adventures.
- Entering the pen/hospital and noticing a clearly presented need is **free of penalty**.
- If the player **leaves that observed need unresolved and then completes another musical adventure**, apply a small friendship deduction for the affected animal(s).
- If the player subsequently returns, sees the still-unresolved need, leaves it unresolved, and goes on another musical adventure, the deduction becomes progressively larger for that neglect sequence. Frustration/sadness animations should intensify with the sequence.
- The player's care action stops the escalation and resets that issue's neglect sequence. It restores health/cleanliness, not lost friendship points; bond gains still only come from musical adventures with active primary companion.
- Do not penalize simply because the learner never visited the pen, is offline/idle, or continues adventures without a *new informed bypass* after the first sequence event. Do not charge multiple deductions for the same departure/adventure, reload, retry, or duplicated event.
- No penalties for incorrect music answers, and no pet death/removal.

Request a revised deterministic engine proposal with explicit observed-need flag, departure/adventure transition, per-issue escalation counter, idempotence and per-profile state, and clear UI events. Numeric schedule (e.g. 1/2/4) and cap are illustrative only; propose values for owner review. No implementation approval until contract is reviewed.

Recorded in coordination/DECISIONS.md.
