# NoteQuest — Animal Character Detail, Lifecycle & Expressions

**Version:** 0.1 (owner-directed requirement; art implementations pending)  
**Date:** 2026-11-20  
**Art direction owner:** ChatGPT · **Engine and persistent data:** Claude  
**Applies to:** Each adoptable NoteQuest pet and each featured rescue animal  
**References:** [Nine-World Art Guide](NINE_WORLD_ART_GUIDE_v0.1.md), [Visual Style Guide](VISUAL_STYLE_GUIDE_v0.1.md), and the owner's uploaded capybara illustration reference (style inspiration, not a licensed game asset).  
**Status:** Eight required visual variants now in scope; exact drawings and cross-stage combination system are to be prototyped and reviewed. No code or save migration authorized here.

## 1. Owner's new direction

Every animal requires **more visual detail** and **eight recognizable visual versions**:

1. Egg
2. Baby
3. Adolescent
4. Adult
5. Sleeping
6. Sick
7. Tired
8. Excited

A character is not acceptable if these are merely the same emoji with a different label, or the same animal enlarged or reduced without anatomical evolution.

There are **two independent dimensions**:

- **Lifecycle:** egg → baby → adolescent → adult.
- **Condition/expression:** normal, sleeping, sick, tired, excited.

A condition can occur to a baby, adolescent, or adult; a game need not pre-render every possible combination as a separate flattened image if a convincing original modular rig can produce them. **All eight named presentation examples must still be deliverable** for each character. The egg is a separate world-object/character presentation, not a sleeping or injured animal.

**Important biological clarity:** Mammals such as capybaras, cats, and sloths do not hatch from eggs. The requested **egg artwork is an explicitly magical/fictional collectible or hatching-container convention in NoteQuest**, not a biology lesson. Use original fantasy ornamentation to foreshadow the animal; do not imply actual species reproduction occurs this way. For animals that naturally develop in eggs, designs may reflect actual species biology while retaining the game art direction.

## 2. Higher-detail animal illustration standard

The owner's capybara reference supports a **warm, richly characterized 2D cartoon style**: dark confident contours, rounded silhouettes, warm species colors, legible cel-shadow planes, tiny highlights and economical expression. The requested increased detail means we must go beyond generic silhouettes without drifting into photorealism.

**Required detail layers (at full body 512px art size):**
- Distinct **species anatomy**: correct body proportion, ears, muzzle/beak, paw/hoof/flipper, tail/wings, neck, eyes.
- **Recognizable face architecture**: cheek/muzzle planes, nose shape, brow expression and mouth shape appropriate to species.
- **Species-specific surface detail**: limited but visible fur tufts/streaks, feather groupings, pattern patches, scales, whiskers, horn ridges, freckles or markings only where appropriate.
- **Layered form and shadow**: at least a main color, a secondary lighter plane and one to two cel-shadow planes; gentle highlight on the focal form.
- **Depth cues**: overlap front and rear limbs, distinguish near and far features, grounding shadow on scene layer.
- **Intentional line hierarchy**: outer stroke strong dark-plum/charcoal; internal structure lighter/thinner; avoid homogeneous stroke thickness.
- **Individual identity**: an identifying pose, palette accent, asymmetric feature or pattern so animals within a species do not look cloned.
- **Expressive face details**: eyes and eyelids, tiny brows if natural for the style, mouth and muzzle shape, plus secondary body gesture.
- **Original design**: do not trace, clone the pose/silhouette or extract the stock Vecteezy artwork or copyrighted cartoon assets.

**Readability thresholds:** At 512 px the animal can show all details; at 256 px the form still reads; at 96 px the species and state should be obvious; at 64 px the silhouette and main expression/state marker should survive. Remove micro-details at small sizes instead of blurring them.

**Rendering limits:** Use a restrained number of carefully placed markings and 1–2 major cel-shadows rather than thousands of hairs or shiny 3D gradients. More detailed ≠ cluttered. Animals must remain clear on both Music Paper and dark twilight panels.

## 3. The eight mandatory versions

| ID | Version | Pose / anatomy | Face / lighting | Recognition cue |
|---|---|---|---|---|
| \`egg\` | Egg | **Original species-themed fantasy egg/container** sized and shaped for collectible display; subtle species patterns | Gentle warm glow, simple surface decoration | Distinct shell/pattern; clear egg silhouette |
| \`baby\` | Baby | Small, rounded, young body proportions; larger head-to-body ratio; short limbs, soft features | Curious, friendly gaze and small smile | Looks newly hatched/adopted, not an adult shrunk uniformly |
| \`adolescent\` | Adolescent | Intermediate proportions: longer limbs, developing species features, more confidence in posture | Brighter, inquisitive expression | Physically distinct from baby AND adult |
| \`adult\` | Adult | Mature characteristic anatomy and defining markings, stable posture | Relaxed, confident neutral expression | Full species silhouette with richest intentional detail |
| \`sleeping\` | Sleeping | Curled/reclined or species-correct sleeping pose; still supports growth-stage form | Fully closed eyes; calm breathing/relaxed mouth | Clearly asleep, not unwell; no forced “Z” text required |
| \`sick\` | Sick | Subdued/curling protective posture; attentive care scene if needed | Slightly drooped eyelids, lowered ears/limbs where anatomically appropriate, gentle warm or pale cues | Understandably needs care without injury gore or alarming imagery |
| \`tired\` | Tired | Awake but low-energy, slouched/slow stance; perhaps a small yawn | Half-lidded eyes, subtle tired expression | Distinct from sleeping: eyes at least partly open and responsive |
| \`excited\` | Excited | Active joyful species-specific gesture: hop, wiggle, open wings or perked ears | Open smiling eyes, uplifted expression, small sparkle accents | Dynamic delight, not just a color overlay |

**Sleeping versus tired:** Sleeping is fully resting; tired is conscious but low-energy.  
**Sick versus tired:** Sick needs gentler care-state cues, not merely darker “tired” colors.  
**Excited versus merely happy:** Excited has a visibly stronger expressive gesture or motion-ready pose.  
**Baby versus adolescent:** Proportions and signature features evolve, not only pixel size.  
**Adolescent versus adult:** Adult displays species maturity and recognizable stable form.

These distinctions are mandatory for visual acceptance even if some variants eventually share reusable rig elements.

## 4. Condition combinations and visual precedence

The art system should be future-proof without multiplying every asset unnecessarily.

- **Source of truth:** engine provides \`stage\` and \`condition\`, using a formally agreed API. UI resolves assets; UI does **not** infer/commit sickness or growth on its own.
- **Canonical stage:** \`egg | baby | adolescent | adult\`.
- **Canonical display condition:** \`normal | sleeping | sick | tired | excited\`.
- **Suggested conditional priority when multiple engine signals coexist:** sick > sleeping > tired > excited > normal; **Claude must define actual gameplay/logic behavior** before implementation.
- **Egg mode:** egg art supersedes post-hatch expression overlays. No sick/sleep/tired egg unless owner later asks.
- **Fallback:** if condition art is unavailable for an early prototype, show the neutral animal art **plus** a clearly labeled/accessible state cue; do not invent status or display a misleading happy animal. This is a temporary prototype fallback, not full acceptance.
- **Data compatibility:** existing saved pets currently use \`grow\` and \`gT\`, with engine stages \`baby | kid | adult\`. Mapping \`kid\` to the owner's **adolescent** presentation is a safe *display interpretation* while preserving stored values; any new egg stage, condition model or save conversion is Claude's change and needs explicit compatibility tests.
- **Transition:** never erase old saved pets or regress an adult to an egg because assets now exist. The starting egg experience, ownership, hatching triggers and growth cadence are **design decisions pending engine/owner review**.

## 5. Sketch and asset inventory by version

For EACH character species/identity, plan:

| Deliverable | Minimum art |
|---|---|
| Egg | Standalone fantasy egg illustration, species-specific shape/marking cues |
| Baby | Full-body neutral baby (distinct anatomy) |
| Adolescent | Full-body neutral adolescent |
| Adult | Full-body neutral adult |
| Sleeping | Explicit full-body rest pose and closed-eye expression, preferably reusable across age variants |
| Sick | Expressive sick/care pose; gentle, non-graphic |
| Tired | Awake low-energy full-body pose |
| Excited | Joyful action pose and optional brief squash/stretch or jump |

Additional optional future expressions (not replacing the mandatory eight): curious, hungry, dirty, playful, comfortable, relieved, proud. Existing \`hungry\` and \`dirty\` status must remain understandable if still part of the game.

### Layer structure for original vector rig

Prefer separable components:
- back limbs, tail, rear wings;
- torso base, pattern/texture marks, highlight/shadow shapes;
- front limbs or flippers;
- head, ears/horns/crest and muzzle/beak;
- eyes: open, half-lidded, closed, bright/excited;
- mouth: resting, smile, open joy, subdued/yawn;
- optional pose transform anchors and expressive body posture;
- optional atmospheric marks (sparkle, tiny care cue), separate from the creature.

A single base character should not be stretched into every age; age forms require new anatomy layers.

## 6. Asset naming, exports, and review package

Recommended stable names:

\`animal-{speciesSlug}-{lifeStage}-{condition}-{view}.{format}\`

Examples:
- \`animal-capybara-egg-normal-hero.svg\`
- \`animal-capybara-baby-normal-hero.svg\`
- \`animal-capybara-adolescent-normal-hero.svg\`
- \`animal-capybara-adult-normal-hero.svg\`
- \`animal-capybara-adult-sleeping-hero.svg\`
- \`animal-capybara-adult-sick-hero.svg\`
- \`animal-capybara-adult-tired-hero.svg\`
- \`animal-capybara-adult-excited-hero.svg\`

This naming scheme is illustrative and allows conditions to be added for other age forms later.

**Export expectations:** original vector if feasible; optional transparent PNG assets for full-size art (working master approximately 512px or larger), card (256px), quest (96px), map (64px). Aspect ratio varies by species; don't crop long tails, ears, wings or horns. Background art is separate.

**Character-sheet review:** display the eight labeled variants at consistent apparent scales, plus one larger detail zoom and one 64px legibility strip. Show one character identity consistently, preserving unique markings, but make developmental proportion changes obvious.

**Asset manifest requirements:** asset identifier, original source ownership, species, lifecycle stage, condition, pose, scene, emotion, display sizes, licensing status, and available animation layers.

## 7. Capybara exemplar — richer than current generic mascot art

For the first original NoteQuest prototype, create a capybara **with its own independent design**, inspired only by the general drawing language of the owner's uploaded example.

- A recognizable long blunt muzzle, compact ears high on head, prominent nostrils and sturdy squat feet.
- Rounded but weight-bearing torso, subtle cheek/shoulder forms and expressive face planes.
- Fur indicated through a few carefully placed directional tuft and short-mark groups, not hair-by-hair rendering.
- Warm sienna/caramel/brown family with a darker muzzle plane; alternate family palette from the stock image rather than sampling/copying it exactly.
- Baby: head comparatively larger, rounder compact nose, smaller feet, shortened limbs.
- Adolescent: leaner with lengthening muzzle/limbs and emerging adult posture.
- Adult: species-characteristic body mass, relaxed pose, refined fur/face details.
- Egg: magical NoteQuest collectible with earthy brown markings, a small leaf/whisker/compass symbol hinting at capybara. **It does not imply capybaras lay eggs.**
- Sleeping: curled/grounded rest, closed eyes.
- Sick: gentle tired concern and careable posture without graphic injury; ensure it looks different from sleep.
- Tired: half-open eyelids, lowered head, small yawn.
- Excited: lifted front paws, bright gaze and playful motion-ready pose.

Use the capybara sheet as the first full style acceptance gate before scaling to dozens of species. Do not automatically replace Claude's existing SVG animals; existing code/art stays unchanged until accepted implementation.

## 8. Animation guidance per version

- **Egg:** slight occasional wiggle for a special discovery/hatching scene, if lifecycle mechanics are implemented; do not endlessly demand tapping.
- **Baby:** occasional blink, breathing, head turn, curious bounce.
- **Adolescent:** stretch, attentive glance, hop or gesture.
- **Adult:** calm breathing and rare gentle expression; optional realistic species movement.
- **Sleeping:** minimal breathing, stationary curl; no flashing Z icons necessary.
- **Sick:** slow subtle movement only; comfortable resting pose; avoid distress exaggeration.
- **Tired:** slow blink, small yawn, reduced movement.
- **Excited:** short energetic movement, not constant high-frequency bouncing.

Support reduced-motion preference; retain readable static poses. Motion is visual feedback and must not distract from music reading.

## 9. Engine/API cooperation — request to Claude

The current v1.0.0 engine API supports:
- growth stages \`baby | kid | adult\` from \`NQ.pets.stage(pet)\`,
- \`NQ.pets.moods(pet)\` returning \`sleepy | hungry | dirty | happy\` among others,
- \`NQ.pets.growInfo(pet)\` and events \`pet:grew\`.

It **does not** currently specify a new egg stage, sick state, separate tired/excited conditions, or a cross-stage rendering state contract. These are **requested future capabilities**, not claims about current behavior.

Before UI implementation, Claude should propose:
- a backward-compatible lifecycle/public API mapping for \`egg\`, \`baby\`, \`adolescent\`, \`adult\`;
- whether \`egg\` is a stage, adoption animation, collectible inventory object, or separate hatch mechanic;
- a reliable \`condition\` signal to display sleeping/sick/tired/excited without UI guessing;
- unambiguous compatibility mapping for existing \`kid\` and \`sleepy\`, and handling of hunger/dirt/joy without hiding existing features;
- events or updates that tell the UI to change art when stages/conditions change;
- save migration and \`NQ1:\` code backward-compatibility tests.

Do **not** add egg/sickness game mechanics implicitly or bundle this into PR #1, which is nominally an unchanged-behavior engine split. Propose the new behavior through the normal coordination/owner review path.

## 10. Acceptance gates

**Art acceptance for a featured animal requires:**
- All eight named versions visibly distinct and **richer in species detail**.
- Baby/adolescent/adult proportions genuinely evolve.
- Sleeping, sick, tired and excited can be distinguished by pose/face even with muted color.
- Egg is unmistakably fictional where biologically inappropriate.
- Recognizable species at thumbnail scale, with original non-copied illustration.
- Consistent style across animal/habitat and family members.
- Clean, reusable, adaptable exports with no copyrighted or unlicensed external assets.

**Engine integration requires a separate implementation gate** to preserve saves, profiles and current behavior. The owner approves app-code merges per the current cross-review process.

## 11. Immediate next visual work

1. Produce one **original, high-detail capybara eight-version concept sheet** and preview it with owner feedback.
2. Refine facial anatomy, texture/line density, stage transitions and the care/excited expressions.
3. Freeze only the species-wide style after the visual review; apply the same rendering language to the first rescue region's four animals.
4. Build the all-species inventory progressively; do not mass-generate low-detail placeholders.
5. Keep logo direction work separate and continue it after the animal art direction checkpoint.

This is a working art/contract specification, not a completed asset set or UI implementation.

## Owner update (2026-11-20): bath time and dirty animal artwork

The [Pet Care, Pen Cleaning and Companion Selection guide](PET_CARE_COMPANION_AND_PEN_SYSTEM_v0.1.md) adds **dirty** and **bath time** to the previous eight character presentations (**10 total**). Bath time is an animal-washing activity; **Clean Pen** is a separate enclosure-poop cleanup activity requiring purchased/owned care supplies. Primary pet and optional sidekick are per-profile relationship assignments available for any owned animal. The initial capybara design sheet must demonstrate all ten visuals; a separate pen-cleaning vignette must not replace bath time.
