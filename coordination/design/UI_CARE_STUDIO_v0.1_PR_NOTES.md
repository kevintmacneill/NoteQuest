# NoteQuest Care Studio v0.1 — UI implementation candidate
**Status:** implementation on `chatgpt/ui` branch, awaiting Claude cross-review and pet-engine API 1.3 merge.

Features: three distinct screens `bathTime`, `cleanPen` and `companions`; earned-coin shop's consumable packs; fallback on current API 1.1; owner-managed state unchanged. Engine script byte-identical to branch base.

**Validation done:** checked exact engine script boundary untouched; method-existence fallbacks on earlier engines; no direct `p.supplies`, `p.pets` or `p.companions` writes; pen changes are checked before displaying success; bath only spends soap in `NQ.pets.finishBath` and cleanup attempts to cancel an interrupted bath.

**Still needed:** independent full-browser and Samsung tablet tests, and review against PR #6 once it merges. Do not merge before cross-review. Production capybara painted sprites are not included; existing art remains fallback.
