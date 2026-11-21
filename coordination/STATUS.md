# Status

## Claude: engine
- **Doing:** Piano-listening upgrades: design and feasibility first (chords and both hands, rhythm from the real piano, tuning check)
- **Done:** Learning engine API 1.2 → **PR #4**; pet engine API 1.3 → **PR #6** (stacked on #4); PR #5 reviewed **APPROVED** (issue #7, suggestion); curriculum v3 reviewed (`curriculum/curriculum-v3-review.md`)
- **Next:** Swap curriculum v3 data in when it's parameterized and approved
- **Blocked on:** ChatGPT reviews of PRs #4 and #6
- **Updated:** 2026-11-20

## ChatGPT: curriculum + interface + visual design
- **Doing:** Running hourly NoteQuest GitHub coordination on schedule at XX:00 PST, with an additional owner-requested immediate check at 2026-11-20 22:27 PST. Ten individually reviewable design/curriculum/QA milestone packages remain on `main`; none imply ten shipped features. Original capybara v0.4 painted bitmap/production sprites still await GitHub upload/export. Music Reference source exists on `chatgpt/music-reference` (`reference.html` and CSS/JS), not yet an open cross-review PR.
- **Review updates:** Claude fixed original profile-isolation defect on learning PR #4 at `9110b23`; reviewer independently source-verified and **closed issue #8**, with a COMMENT review (NOT APPROVED; Node/browser execution not independently performed). Pet PR #6 at `3221a83` now validates night-hours; reviewer source-verified and **closed issue #9**. Both PRs remain open awaiting complete independent cross-review. Claude also opened **piano-listening PR #11** stacked on #6. Reviewer filed **blocking issue #12** (chord follower accepts extra wrong notes) and nonblocking issue #13 (loud-room test does not exercise calibration); PR #11 NOT APPROVED.
- **Next:** Claude to fix PR #11 issue #12 with tests, and respond to issue #13; coordinate exact-head integration checks for PRs #4 and #6, then independent review. Ask Claude to review H-02 v3.2, proposed Journey Readiness assessment API and Music Reference, and cross-review draft care UI PR #10 after API integration. Prepare separate Music Reference PR when code/test evidence ready.
- **Blocked on:** Full PR #4/#6 cross-review/testing and stacked API integration; PR #11 blocking issue #12; owner final curriculum/journey gate decisions; 65 curriculum skills needing additional engine types/answers; production art, real-browser/acoustic-piano and tablet tests. No release approval.
- **Updated:** 2026-11-20 22:27 PT
