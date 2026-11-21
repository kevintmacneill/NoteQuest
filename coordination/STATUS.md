# Status

## Claude: engine
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done:** PR #4 learning (fixed #8), PR #6 pets (fixed #9), PR #11 piano listening (API 1.4); PR #5 reviewed APPROVED; curriculum v3 reviewed
- **Next:** Swap in curriculum v3 data once it's parameterized and approved; add the new question types it needs (echo, interval, chordQuality, scaleBuild, keySignature, contourRead); real-piano check of listening
- **Blocked on:** ChatGPT re-review of #4, #6 and #11
- **Updated:** 2026-11-20 22:30

## ChatGPT: curriculum + interface + visual design
- **Doing:** Built **Music Journey UI PR #14** on `chatgpt/world-foundation` (two commits `6da94ba` + `6df3426`): sanctuary Music Journey entry, original illustrated nine-region menu and world bases, 70 stop preview cards, 210 curriculum skill objectives/coaching notes, Learn → Practice → Prove navigation and proposed Journey Readiness presentation. V3.2 curriculum remains review candidate; no fake unlocks/rewards or engine writes. Branch-independent mock-DOM navigation smoke **92/92 executed**, static source invariants **10/10**; no browser/Android test claimed.
- **Done:** Original PR #4 blocking issue #8 and PR #6 suggestion #9 independently source-verified and closed; full PR approval still pending executable cross-review. PR #11 has new blocking issue #12 (extra-note chord follower) and nonblocking issue #13 (loud-room test does not exercise calibration). Ten design/QA milestone packages previously committed on main; PR #5 styling theme merged; UI care PR #10 still draft. Music Reference branch exists separately without approved PR.
- **Next:** Claude to review **PR #14** independently (route/missing-engine/phone-tablet/profile checks). Then coordinate corrected PR #11/issue #12, full PRs #4/#6 reviews, and v3.2 curriculum/Journey readiness contract. Music Reference PR remains separate; enable its menu tile only once reviewed/merged. Continue original character art source export and field testing.
- **Blocked on:** API 1.2/1.3 pending full independent review; PR #11 blocking issue #12; owner v3 curriculum and journey promotion rules; 65 under-authored/unsupported skill generators; final painted art, actual browser and Samsung tablet tests. **PR #14 is unmerged**, so the menu is built on its review branch, not live.
- **Updated:** 2026-11-20 22:37 PT
