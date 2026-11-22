# NoteQuest — Milestone Dragon Character Canon v1.0
**Status:** OWNER-SELECTED CHARACTER IMAGE / IDENTITY SPECIFICATION. **Draft UI asset PR #110**, not merged, not a live game guide. **Date:** 2026-11-22.

## Source of truth
Kevin supplied the actual illustration in this conversation and directed that **this same dragon** be used when learners approach or accomplish a major milestone, especially world graduation. **Never generate a new dragon from scratch for each appearance.**

Original image: **1229 × 1536 JPEG**, despite the user's uploaded filename ending in `.png`. SHA-256: `1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052`.

- Source-controlled thumbnail for exact small-size reuse: [`reference-v1.webp`](../../assets/characters/milestone-dragon/reference-v1.webp) (256 × 320, SHA-256 `688d0ec3bebc18b4b7c1f36b174cf661c7b7114635144fc92ee7c2e36c7a9bb9`) **in unmerged PR #110**.
- Canonical structured identity: `assets/characters/milestone-dragon/canon.v1.json` **in PR #110**.
- Stable importer/renderer: `assets/characters/milestone-dragon/index.mjs` **in PR #110**.
- The full original image is packaged in the user's source bundle, **not in the repository** yet. The 256px thumbnail is not sufficient for cinematic screens; import full-resolution original later by checksum.

## Immutable appearance, decoded from supplied picture
- **Species/silhouette:** friendly, elegant cream/ivory-white four-legged fantasy dragon with long slender S-curved neck, long tapering tail, soft blush shading, smiling open mouth.
- **Face:** very large violet/amethyst eyes with lashes and soft blue eyeshadow/eyelid strokes, small rounded muzzle, pink-lilac frilled cheeks and neck.
- **Horns:** recognizable pale ivory with pink tint; a matching pair sweeps up/back in curved asymmetrical arcs, with small additional head spikes.
- **Wings:** two large elevated **pink membrane wings**, smooth cream/ivory top edges, layered feather-like textures toward wing shoulders, scalloped trailing membranes and pink-to-peach gradients. Preserve this combined membrane/feather visual identity.
- **Markings:** unique **pink, pale blue, soft yellow** curved ribbon-like swirl designs, not arbitrary spots, stripes or generic rainbow scales. Preserve arrangement on shoulders, legs, hips and tail.
- **Tail:** long curling tail ending in broad flowing ribbon/feather-shaped pink/blue/yellow tuft.
- **Jewelry:** **gold necklace and purple diamond-shaped pendant** on chest. This distinctive mark is mandatory.
- **Mood:** warm, encouraging, magical and slightly majestic; neither intimidating nor an everyday pet.
- **Default pose:** full-body standing three-quarter view, smiling, wings raised. No alternative pose is yet canon.
- **Name:** UNBOUND/unnamed; do not invent a name.

## Character role and boundaries
1. Separate from the adoptable `dragon` and `babydragon` in the Magic Meadow and from whichever pet/sidekick the learner selects.
2. Can be **shown** at a readiness invitation, high-value musical challenge, graduation/world transition and major celebration. Golden Encore invitation remains *future/parked* (#103).
3. Should not pop up for ordinary coin awards, pet care, minor streaks or every practice round.
4. **No visual can set skill evidence, pass/fail, unlock a world or give coins**. Engine `NQ.learn` / `NQ.journey` is the sole authority.
5. Source is a **flattened raster**, not editable vector geometry or a skeletal rig. Expressions, animation layers and transparent cutouts need distinct development and visual approval; never claim they already exist.
6. All future visual transformations require **owner-facing pictures before build**, plus approval. Reuse the exact referenced art when making variants, preserve the immutable markers, and do not redraw from a text-only prompt.

## Release gates
- [x] Inspect image bytes and record original hash/dimensions.
- [x] Document stable appearance/role and distinct pet boundary.
- [x] Stage a source-controlled immutable image thumbnail, manifest and renderer on PR #110.
- [ ] CI green and independent exact-head cross-review (Claude remains paused).
- [ ] Merge PR #110 if authorized.
- [ ] Upload the original full-resolution image to GitHub and verify SHA-256 before any full-size in-game appearance.
- [ ] Show/approve a Journey Readiness or graduation screen mockup **before** implementing that screen.
- [ ] Keep issue #106 open until milestone guide use is implemented and reviewed.

**Do not construe this document as a new image-generation request or automatic release of gameplay.**
