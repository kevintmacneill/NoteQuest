# Milestone Dragon — Cinematic Character Animation Architecture v1.0

**Decision date:** 2026-11-22  
**Decision type:** Owner-selected long-term capability target; technical production architecture proposed, not approved new character art or approval to merge code  
**Scope:** NoteQuest ceremonial milestone dragon as first character; generic interoperability for future YouTube channels. Does **not** impose cinematic rig requirements on all animal companions.

## Owner-selected capability target

This dragon should eventually perform as a fully animated movie character, not simply a seven-layer movable illustration. Required performance categories:
- Body: idle, weight shifts, breathing, walk, run, stop, turn in place, 360° orientation changes, sit/stand, land.
- Flight: takeoff, wings unfolding/folding, flap cycles, glide, bank, hover as visually appropriate, land; wings must deform believably.
- Acting: expressive eyes/brows/eyelids, smile/frown, jaw and head motion, emotion shifts, head focus, synchronized speech mouth shapes, body gestures and tail response.
- Reusability: consistent identity in NoteQuest and YouTube renders with reusable animation labels and per-platform/export render profiles.

These are **target capabilities**, not tested/implemented claims.

## Canonical appearance and fidelity

- Unique source owner-selected reference: original 1229×1536 JPEG, SHA-256 `1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052`, byte-verifiably staged in **draft PR #110**. Keep master immutable.
- Preserve silhouettes and defining marks: ivory-white four-legged form, two curved horns, amethyst/violet eyes with lashes, pink layered/membrane wings, patterned pink/blue/yellow swirls, long curled ribbon-tip tail, gold necklace and purple diamond jewel.
- Original image captures only one three-quarter view. Front, profile, back, wing undersides and mouth interior are **unknown**; no AI or modeler may invent them as accepted canon. Present actual owner-facing concept pictures for approval before building the visual derivative.
- A 3D render from new angles is a consistent **interpretation**, not mathematically identical pixels to the original JPEG. Character identity is protected by approved geometry/materials/versioned sources, not a text-only prompt.

## Architecture decision: 3D animation source, 2D exports

```text
Approved single-pose JPEG — immutable identity reference
                |
      [OWNER REVIEW: TURNAROUND PICTURES]
                |
Approved multi-view turnaround / model sheet + color/marking map
                |
       High-quality 3D character master
     sculpt + retopology + UV + materials
                |
     deforming skeleton + facial controls
       (armature, weights, shape keys)
                |
          Versioned animations
           + tested poses/acting
                |
    +----------------+-----------------+
    |                |                 |
 NoteQuest       YouTube videos    Rendered 2D sprites
 in-game asset   editor package    or optional SVG art
```

A native project file (proposed `.blend`), mesh/texture references and exact software/render version is the 3D editing authority. Export an interoperability representation (proposed glTF 2.0 / GLB); use other formats only with validation for deformation, materials, animation and scale. Never claim glTF exports retain every native rig control or film shader. The 2D vector master is an **optional separate art deliverable**; it does not magically create 3D geometry. For NoteQuest, an optimized 2D render or sprite can come directly from the approved 3D master without requiring full vector tracing.

## Proposed rig/control families (not a finalized joint-count)

| Family | Why it must move independently |
|---|---|
| Root / pelvis / spine / chest | Quadruped locomotion, weight transfer, breath, body turns |
| Segmented neck / head / horns | Look, nod, talk, expressive poses while protecting head silhouette |
| Face / eyes / eyelids / brows / cheeks / jaw / tongue | Acting and speech-visemes; no generic mouth cutout |
| Front left/right legs, hind left/right legs, paws/claws | Foot plant, gait cycles, stride changes, contact |
| Each wing: shoulder, spars, wrist, membranes and shoulder feather-like textures | Flap, bank, fold, spread, secondary deformation |
| Tail base + several segments + ribbon tip | Curl, follow-through, expressive sweep, flight balance |
| Necklace + diamond pendant | Controlled secondary motion without losing iconic center jewel |

The former **seven groups** are useful design categories only. They do not specify sufficient geometry, bones, deformation weights, animation controls or views. Joint and blendshape counts must follow movement tests—not arbitrary fixed counts.

## Proposed production pipeline and review gates

1. **Owner-facing pictures before building visual assets:** Show the unaltered original alongside proposed front, side, back, and 3/4 turnarounds, plus folded/open wing silhouettes and expression range. Label all conjectured unseen features. Obtain explicit owner approval; no 3D construction from an unapproved derivative.
2. Establish a full, versioned character bible: body measurements/proportions, every angle, material palette, surface markings, constraints, reference image SHA and acceptance evidence.
3. Sculpt blockout and owner-review screenshots of 3D silhouette from front/side/back/3/4 before polished sculpt; owner approval.
4. Retopology + UV + shaders/textures; establish eye, horn, jewelry, wing and tail materials; validate landmark identity comparisons under neutral lighting.
5. Build quadruped skeleton and skin deformations; wing membrane folding/flapping and tail chains; rig facial expression shapes and speech-visemes.
6. Demonstrate acceptance clips/tests: walk, run, left/right turn, complete orbit, takeoff, glide, flap, hover/land, breathing, eye and mouth speech test, joyful/concerned/encouraging acting and wing/jewel follow-through. Check clipping, foot sliding, wing intersections, neck/tail volume retention, and graceful resting poses.
7. Export game-optimized assets and video-quality files separately; test at mobile performance budgets (to be set) and 1080p/4K rendering targets without treating upscaled small rasters as masters. Use fixed versions/lighting/seeds/assets for reproducible render comparisons. Reduced-motion static fallbacks for game UI.
8. Independent technical review, visual owner acceptance, appropriate copyright/license provenance, CI/integrity checks and authorized merge before any runtime integration or published video.

## Work boundaries and unresolved decisions

- **No** creation or promotion of a speculative new 3D image in this planning change.
- **No** future use of generated video without distinct review for quality and licensing.
- **No** assumptions about exact joints, neck lengths from unseen angles, materials, voice, accent, or actor performance; owner or reference approval required.
- **No** new awards/progress rules: all NoteQuest skill evidence and Journey Readiness remain engine-authoritative.
- **No** scope creep to 50+ adoptable animals; their lightweight existing `02_ANIMAL_RIG_AND_EXPORT_SPEC.md` remains the pet standard unless separately elevated.
- **Open gating question for the next visual iteration:** show actual turnaround concept picture and obtain approval of unseen side/back geometry. Until then, this is technical design only.
- Draft PR #110 (character identity/original) and #111 (portable identity schema) remain unmerged and subject to their existing independent cross-review gates. This decision does not waive them.

## Immediate next milestone

Prepare an **owner-facing turnaround visual proposal based on the exact source JPEG**, visibly mark front/side/back as new inferred concept views, and ask for acceptance. Once approved, start a separate non-destructive 3D-model construction workstream. Do not rewrite the original JPEG, assert that the self-contained raster SVG is vector geometry, or hold up existing NoteQuest gameplay unnecessarily.
