# Canonical NoteQuest Milestone Dragon
The illustration supplied by the owner on **2026-11-22** is the **identity authority** for this creature. This folder does NOT create or change engine rules, adopter pets, or UI screen visuals.

- `canon.v1.json`: the structured immutable character definition, source hashes, visual markers, allowed milestone contexts and explicit exclusions.
- `reference-v1.webp`: source-controlled exact-identity display thumbnail (256 × 320) downscaled from the owner's image; it is not a newly generated dragon.
- `index.mjs`: stable browser image component that always uses the checked-in asset.
- `tests/milestone_dragon_node.js`: tests hashes, locked identity, source/registry agreement, and reference format.
- **Original source**: owner-supplied JPEG bytes (despite upload name ending in .png), 1229 × 1536, SHA-256 `1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052`. **The exact original is now source-controlled in this review branch as `original-v1.jpg`, with its SHA-256 and Git blob hash checked by tests**. It has not been merged or approved as a new game screen or a cinematic export.

**Do not recolor, regenerate, flip, add costumes, alter the lavender eyes, wing membranes, horn pair, pink/blue/yellow swirls, or purple gemstone.** This is a flattened picture, not rigged SVG layers; future expressions or animated poses must be new previews based on this exact reference and approved by Kevin before implementation.

**Role:** a ceremonial world-graduation / major milestone guide. The existing adoptable species `dragon` and `babydragon` are separate. Her display name is not yet assigned and must not be invented.

**Integration gate:** she must not trigger readiness, completion, graduation or rewards merely by appearing. All learning evidence remains governed by Claude's API. The UI importer must display exact `reference-v1.webp` rather than asking an image model to redraw it.

**Status:** asset and identity contract ready for review; character not wired into game screens and no animation/sprite rig claimed.
