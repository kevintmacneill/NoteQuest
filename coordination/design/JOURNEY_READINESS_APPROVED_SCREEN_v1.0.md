# Journey Readiness — owner-approved visual direction v1.0

**Owner approval date:** 2026-11-22. **Decision:** Kevin explicitly replied "Approve it" to the Journey Readiness screen mockup shown in ChatGPT immediately beforehand. **Status:** APPROVED ART DIRECTION AND SCREEN LAYOUT; **NOT IMPLEMENTED/NOT MERGED**.

## Approved visual reference

The exact owner-reviewed concept is the 1672×941 landscape image generated in the 2026-11-22 NoteQuest conversation, locally named `a_vivid_highly_detailed_colorful_fantasy_game_ui.png`. That image has not yet been added as a full-resolution asset to this GitHub repository; **do not pretend it is a checked-in image or a final game asset**. Keep the source concept available for side-by-side visual acceptance.

The approved composition:
- Bright, richly painted fantasy city-world color palette with springtime flowers, stone archway, warm lanterns, sky, distant musical castle/islands, glowing treble-clef emblem, purple-and-gold trim.
- At **left**, the **unique ceremonial milestone dragon**, friendly and welcoming, visually leading the learner toward the journey gate.
- At **right**, a large legible cream/parchment assessment panel with purple-and-gold header **“Ready for the Journey?”**, a brief encouraging introduction, and **three distinct challenges**.
- The three user-facing categories are **Find the Notes** = engine `navigation`; **Keep the Beat** = engine `timing`; **Play Your Song** = engine `performance`.
- Buttons: visually dominant **Begin Challenge**, subordinate **Practice First** and **Back to Village**. The learner must be able to leave without losing earned evidence.
- Picture-first presentation: illustrated compass/piano, drum, musical staff and piano glyphs. Keep text readable at phone/tablet widths and maintain semantic labels for pre-readers and accessibility.

## Critical fidelity clarification

The 1672×941 concept includes an AI-rendered *likeness* of the dragon for composition. **That likeness is NOT a new canonical dragon design**. The original owner-supplied 1229×1536 ivory/rose/lilac dragon is authoritative, tracked by SHA-256 `1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052`. The immutable asset/renderer remains in [draft PR #110](https://github.com/kevintmacneill/NoteQuest/pull/110), and a separate thread is developing deterministic SVG. Use only that reference or a separately owner-approved, traceable vector/production derivative. Do not create a third dragon or silently replace the original face, eyes, wings, patterns, pendant, or silhouette.

## User flow and engine truth

This approval is of a **screen concept**, not of new scoring rules. Existing `NQ.journey` v1.6.0 in `coordination/ENGINE_API.md` controls readiness:
- `NQ.journey.requirements(worldId)` and `status(worldId)` determine the real three-part states and whether a check is available. Render those states, not invented circles/progress.
- Engine J1: **4/5 fresh first-try correct** answers per part, with already-passed parts retained.
- J2: human verification is accepted **only** for tasks the engine cannot check; it must use the existing grown-up hold and `journey.confirm` with a genuine caregiver/teacher source. A microphone can never be used to falsely certify posture, two-handed playing or expression.
- J3: early readiness can place uncompleted stops per the existing governed contract. Do not add a manual UI unlock or arbitrary time/streak/currency threshold.
- If the engine has no valid readiness check, the screen must clearly say so and not launch a simulated exam or show fake completion.
- `Begin Challenge` must start a **real supported engine assessment part** when implemented. It must not route to a non-scoring storyboard while implying completion. The three thumbnail circles from the concept are decorative until accurately backed by engine evidence; preferably replace with accessible “Not started / Passed / Needs practice” state text without falsely showing percentages.
- `Practice First` should reach existing learning/practice destinations appropriate to missed skills. Where targeted recommendations are not implemented, route to existing genuine practice screens with honest labeling.
- `Back to Village` returns safely, does not award or remove progress, and preserves the active learner. On an active assessment, cancel safely through documented API only when leaving truly ends that attempt.
- The ceremonial dragon is a **presentation-only guide**; verified `journey:unlocked` events may use draft PR #110's read-only milestone cue adapter for graduation, but it does not cause, assume, or record passing.

## Implementation/review sequencing

1. Keep the **approved concept** immutable as design reference; prepare layered, responsive production art and import the owner's exact dragon asset at a usable resolution. Do not bake interactive buttons or progress into a background image.
2. Build a responsive readable UI shell and real engine-backed three-category state mapping in a ChatGPT UI branch (independent from PRs #69/#107/#108). If building atop draft PR #110, explicitly document that dependency.
3. Connect `Begin Challenge` only once proper question and evidence rendering is supported and tested (keyboard, microphone, rhythm and grown-up pathways). Otherwise disable visibly with clear explanation; never claim a preview assesses learning.
4. Test 390px phone, 820px tablet, 1280px+ desktop, landscape and portrait, screen readers, keyboard/touch, reduced motion, image failure, profile switching, and post-refresh state from real engine.
5. Require exact-head independent cross-review and green CI; no self-approval or merge. Claude is paused until owner reactivates him; do not assume otherwise.
6. Show the actual implementation screenshot to Kevin for **visual fidelity acceptance** before release if it materially differs from the approved concept. Approval here does not automatically approve all art variants or final code.

**Boundaries:** This screen is a major musical milestone, not a normal daily practice modal; does not turn the dragon into a pet and does not reopen the Golden Encore/Prestige decision.
