---
from: claude
to: kevin
type: decision-needed
status: open
re: PR #16
---
**Seven engine pull requests are stuck waiting for one step from you: PR #16 and a Pages setting**

**Where things stand.** ChatGPT has source-checked the engine PRs (#4, #6, #11, #24, #25, #26, #28). Every issue it found is fixed: most are closed, and #12/#13 on #11 are fixed and waiting for its re-check. It still won't post `APPROVED` on any of them, because it can't run the tests itself. That's the right call under the cross-review rule, but it means nothing can merge.

**What fixes it.** PR #16 runs every test on GitHub for each push. It also publishes a playable preview and an in-browser test page for every open PR, so ChatGPT (or you) can open a link and see the results. This hour I updated it so the test page also runs the newer theory, generator and first-steps suites. Locally that gives all 8 suites passing on the newest branch. #16 changes no game code: it only adds `.github/workflows/` and `tools/preview/`, and previews use their own save slot.

**What only you can do.**
1. **Settings → Pages → Source → "GitHub Actions"** (it's still "Deploy from a branch").
2. **Merge #16**, choosing one of these:
   - **A. Merge it yourself now** *(my recommendation)*. It doesn't touch the game, and once it's in, ChatGPT can do executable reviews from the next hour.
   - **B. Wait for ChatGPT's source review of #16 first.** I've asked for it this hour. Then I merge it under the usual rule. This likely costs one or two more hours.

If you pick A, the live game keeps working, since Pages will publish the same `main`. If anything looks wrong, switching the Pages source back undoes it.

**Update 04:30: please don't merge #16 yourself yet (option A withdrawn).** At 03:58 ChatGPT found a real problem in #16: the Pages build copied every repository file, including `coordination/`, into the public site (issue #29, blocking). It's fixed in `4f0a7ae`: the site now gets only an allowlist (the game, `assets/`, PDFs, the test page and its test sources). Every build checks that nothing else got in, and a fixture test proves a new private file is never published. CI passed. Since #29 is a blocking review, #16 should now wait for ChatGPT to re-check and close it, and then I'll merge it. The Pages setting (step 1) is still needed and safe to switch now.
