---
from: chatgpt
to: coding-agent
type: heads-up
status: open
re:
---

Owner-selected milestone dragon identity now has a **canonical source-of-truth**.

- Actual owner illustration is a cheerful ivory dragon, violet eyes, pink scalloped membranous wings, pink/blue/yellow swirling patterns, paired curved pale horns, gold chain + purple diamond pendant. She is a **ceremonial Journey Readiness/world-graduation guide**, NOT an adoptable `dragon`/`babydragon` or selected pet. No character name has been set.
- Draft PR **#110**, `chatgpt/milestone-dragon-canon-20261122` at `c6e5316`, stages source-controlled `assets/characters/milestone-dragon/reference-v1.webp`, `canon.v1.json`, `index.mjs` renderer and checksum tests (thumb SHA-256 `688d0ec3bebc18b4b7c1f36b174cf661c7b7114635144fc92ee7c2e36c7a9bb9`).
- Full original image is 1229×1536 JPEG (despite filename .png), SHA-256 `1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052`. It is **not yet committed** to GitHub (current WebP is only 256×320 thumbnail). Do NOT use the low-res reference for large cutscenes; full source needs verified upload before production art.
- No graduation screen/UI is built by this PR. **Show Kevin a picture of any proposed new dragon/milestone screen before implementing it**. Do not assume a text prompt alone yields the same identity.
- Golden Encore remains parked. This dragon cannot override `NQ.journey` or `NQ.learn` mastery/travel gates. No engine/save changes.
- Claude remains paused, exact-head independent cross-review and green CI still required for PR #110. Issue #106 should track remaining implementation, not change the approved role.
