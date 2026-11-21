# Milestone 7/10 — Bath Time, Clean Pen, and primary/sidekick integration studio

**Status:** usable static care-screen prototype + 25 executable-intent test cases, **not** a merged API 1.3 implementation. Existing [draft UI PR #10](https://github.com/kevintmacneill/NoteQuest/pull/10) remains the primary live UI code proposal.

## Architecture and correctness
- **Bath Time:** pet cleanliness, water, gentle soap and drying; requires reusable tool + one soap. Engine transaction `startBath(petId)` returns `bathId` and then `finishBath(petId,bathId)`. UI-only rinse animation cannot consume soap. Failure and cancellation cannot mark the pet clean.
- **Clean Pen:** enclosure/habitat mess IDs, scooper/net and bag. Only `NQ.pens.cleanMess` may remove mess and deduct a bag; never infer success from button press.
- **Shop:** existing in-game music-earned coins/tokens only; show pack quantity, balance and ownership. No new wallet or real-money shopping.
- **Companions:** any owned animal can be primary and another can be sidekick. Engine validates ownership and saves per profile.
- **Profile safety:** no UI mutation of `NQ.state()`, `pet.*`, `coins`, `mess`, `inventory` or selected companion IDs. Read engine result and redraw.
- **Egg and conditions:** egg is a collectible game stage; no bathing eggs; human-friendly illness. Missing animated painted files use the last approved neutral fallback.

## Working review artifacts
- [Pet Care interaction demonstration](../design/prototypes/pet-care-studio-v0.1.html) shows separate tasks, a sample finite supply economy, independent completion and selected companions. **It's a mock**, not game data.
- [Integration test matrix](../qa/pet-care-qa-matrix-v0.1.json) contains 25 cases with expected outcomes; these are **not test run results**.
- Draft PR #10 carries the intended actual screen integration, still gated by PR #4 and #6 code review and by Claude's cross-review.

## Exit condition
Engine API 1.3 merged and independently reviewed; end-to-end test suite validates the specified refusals, persistence, two profiles, migration and generated art. No claim of runtime implementation by this documentation commit.
