# Milestone 2/10 — Reusable animal animation and export specification

**Date:** 2026-11-20 · **Owner:** ChatGPT · **Status:** SOURCE DESIGN + CONTRACT FOR PRODUCTION, no claim of painted rig completion.

## Render architecture
A production animal is a **species + stage + condition + overlays + transient action**, not ten unrelated static files. The engine alone supplies stage/condition/dirty/activity and companion role through its public read API. The UI maps those values to authored art. Do not infer sick/tired from ad hoc CSS, age from learner profile or visual state from coins.

**Rig scale:** 640×500 coordinate space for a stage family, ground baseline y=446. All drawables use top-left canvas origin, an authored pivot, and explicit z-order. Use a shared anchor for character art, not for scenery. Baby/adolescent/adult require distinct anatomy shape plans, not uniform scaling. Save art filenames as lower-kebab-case; transparent WebP or PNG. Animated masks may share stems/pivots.

### Layer contract
| Layer | Z | Pivot intention | State coverage |
|---|---:|---|---|
| ground-shadow | 0 | ground baseline | all animals except egg |
| rear-feet | 10 | hips | locomotion |
| torso-and-tail | 20 | body center | life stage and breathing |
| **natural-tan-neck-ruff** | 25 | throat/body join | normal coating; never apparel |
| forefeet | 30 | shoulder | locomotion and excited bounce |
| ears | 40 | head pivot | neutral/alert/droop |
| head-and-muzzle | 50 | neck joint | each age, pose variations |
| eye-pairs | 60 | eye-center | open/half/sleep/excited |
| mouths | 65 | muzzle | smile/neutral/yawn/concern |
| condition-overlays | 70 | head/body relevant | gentle sick tint / dirt |
| interactive-props | 80 | species appropriate | towels, blanket, wash water |

## Animation behavior (animation duration proposals, **not** engine timers)
- Rest idle: 3–6 s breathing/blinking loop; optional ears.
- Excited hop: 450–750 ms one-time hop, respects Reduced Motion.
- Tired: slow blink/yawn 1.2–1.8 s; posture slouched.
- Sleeping: static nest option + subtle breath, never forced motion.
- Sick: gentle upright wrap + compress; no flashing, shivering or frightening sounds.
- Bath: display pet dirt, wet fur, soap, rinse and clean result. These are **transient UI frames**; soap decremented only by engine's successful finishBath.
- Pen clean: animated scooper and optional cleaning bag; target mess removed **only after engine success**. Bath UI and pen UI share no completion handler.
- Missing art: neutral stage sprite and **live, accessible text/icon cue**. Never show an unrelated wrong species or substitute a happy state for illness.

## Export QA and source control
1. Every layer exported with matching canvas, z-index and pivot.
2. Human-readable manifest lists every actual existing asset and checksum. **Do not invent URLs** for missing sprites.
3. Tablet: 256 px hero/120 px card; verify 512, 256, 120, 64 px.
4. No pre-rendered captions or logos; all labels from UI. Mascot ruff is natural.
5. File lazy-load and cache; preload only current and adjacent animation poses. On missing asset or decode error show original fallback.
6. No private user images, commercial stock assets or unsupported font redistribution.
7. Reduce-motion preference turns motion into two clear non-animated frames.
8. Actual audio/gameplay remains independent of art loading.

## Before this can be called production-ready
Need the **original painted transparent exports**, runtime-render test against `display()`, Android portrait/landscape, art-review issue #3 follow-up, and asset-size measurements. Existing SVG construction studies remain prototypes.
