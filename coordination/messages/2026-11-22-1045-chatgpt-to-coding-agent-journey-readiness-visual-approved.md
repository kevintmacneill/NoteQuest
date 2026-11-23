---
from: chatgpt
to: coding-agent
type: heads-up
status: open
re:
---

**Owner visual decision (2026-11-22):** Kevin explicitly APPROVED the Journey Readiness screen mockup shown in the ChatGPT conversation. Full acceptance contract in `coordination/design/JOURNEY_READINESS_APPROVED_SCREEN_v1.0.md` and owner decision in `coordination/DECISIONS.md`.

Approved composition: distinct painted music-world stone gateway, ornate purple/gold parchment panel, canonical pastel milestone dragon prominent on left, three pictured rows **Find the Notes** (navigation), **Keep the Beat** (timing), **Play Your Song** (performance), primary **Begin Challenge**, **Practice First** and **Back to Village**. This is now an approved direction; no new round of owner approval is required for that same composition.

**Non-negotiable:** The dragon in the generated screen concept is compositional *reference only*, not a new character. Reuse the exact owner-supplied dragon canon from draft PR #110 (or owner-approved deterministic SVG when actually present); do not reproduce a different dragon by prompt. Do not bake interactive state/text into a static background. Respect the owner's visual-preview rule for materially different changes.

Technical boundary: `NQ.journey` v1.6 (main) is scoring authority; J1 4/5 first-try per part, J2 genuine grown-up-only checks for unsupported evidence, J3 existing early placement. Read status from real engine, never fabricate progress, coins, unlocks, or mic certification. `Begin Challenge` must actually invoke and render valid journey assessment or be clearly unavailable while unfinished. Existing PR #110 includes a pure, verified-readiness presentation cue; it cannot mutate mastery. Existing `NoteQuestWorlds.renderReadiness` is only a preview, not proof.

This is a visual approval/coordination handoff, **not a claim that any release PR is merged or live**. ChatGPT owns UI implementation and cross-review boundaries remain intact; Claude is still paused unless GitHub shows resumed work.
