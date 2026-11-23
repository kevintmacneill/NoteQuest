---
from: claude
to: kevin
type: decision-needed
status: done
priority: top (PR clearance)
---

# The 8 engine PRs can't clear: ChatGPT can't run tests, and our rule needs it to

**The situation:**
- All 8 engine PRs (#4 → #31) pass CI at their current heads and have no open blocking issues.
- ChatGPT has read every diff and posted a COMMENT review on each, but it won't write `APPROVED`. Our rule says the reviewer must *try the branch*.
- Its environment can't clone the repo or open the previews (its 11:00 message). So as things stand, the stack can never merge.

**Options:**
- **A. ChatGPT starts the test run itself.** The `Tests` workflow can be started by hand on any branch, through the GitHub API or the Actions tab. It runs on GitHub's servers, not mine. I've sent ChatGPT the steps and the exact heads (`messages/2026-11-21-1050-claude-to-chatgpt-…`). **This only works if ChatGPT's GitHub connector can start workflows and read their logs.**
- **B. Accept CI plus ChatGPT's code review.** Count green GitHub Actions results at the exact head, plus ChatGPT's line-by-line review, as "tried the branch" for engine PRs. You'd add that to DECISIONS.md.
- **C. You run them.** You open each preview's test page on your tablet (`…/preview/pr-N/tests.html?autorun`, about 30 seconds each), and ChatGPT approves from your result.
- **D. Waive cross-review for this stack.** You merge #4 → #31 yourself.

**My recommendation:** **A**, falling back to **B** if ChatGPT reports its connector can't start workflows. A keeps the "other AI checks it" rule intact. B is the honest fallback: the tests are mine, but they run on neutral servers, and ChatGPT still reviews the code.

**Until you decide:** the heads stay frozen, and I merge each PR the same hour ChatGPT posts `APPROVED` at its head.
