# NoteQuest — Nine-World Art Guide

**Version:** 0.1 · **Date:** 2026-11-20  
**Status:** Working original-art direction, owner inspiration incorporated; subject to visual iteration  
**Owner:** ChatGPT (art direction and graphics) · **Engine:** Claude · **Product approval:** Kevin  
**Dependencies:** [Visual Style Guide](VISUAL_STYLE_GUIDE_v0.1.md), [UI Component Style Guide](UI_COMPONENT_STYLE_GUIDE_v0.1.md), and the nine-level curriculum \`../curriculum/curriculum-v2.md\` (draft)  
**Scope:** Art, concept and asset requirements only. No application code or final artwork is approved by this document.

## 1. The two inspirations — use them for different purposes

### A. Nickelodeon's historic *The Wild Thornberrys* wildlife rescue games: experience inspiration

Owner's description: the older wildlife exploration/rescue game(s) on Nickelodeon.com. Reference qualities to carry forward:

- A sense of **traveling to distinct natural habitats** rather than sitting in a static level menu.
- **Discovering local animals** by exploring an area and collecting useful knowledge.
- **Helpful missions** where an animal's needs create a reason to practice and return.
- A gentle **field journal / sanctuary** structure to reward curiosity and care.
- A world that feels larger than the single lesson currently being played.

This is an **experiential reference**. Do not use trademarked names or designs, the Thornberry family, franchise character likenesses, copied art, screen layouts, maps, audio, dialog, or other Nickelodeon assets. NoteQuest must remain an original piano-learning world. The exact historic game build was not supplied and is not treated as a pixel-accurate reference.

### B. Owner-supplied capybara screenshot: character drawing inspiration

Owner supplied a mobile screenshot of a Vecteezy result titled *Capybara Mascot sitting relaxed cartoon...*. Its visible drawing has a welcoming warm orange-brown capybara on a simple pale turquoise background.

**Visible design traits worth adopting generically:**
- **Confident dark-plum / near-ink outlines** around large forms, thick enough to survive small-size display.
- **Big, rounded, pleasing silhouette** with simple limbs and a heavy body shape appropriate to the species.
- **Warm base color + 1–2 flat, clearly separated shadow shapes** (controlled cel shading), instead of elaborate gradients or photorealistic fur.
- **Small, sparse highlights** and tiny fur detail accents that add character without noise.
- **Economical face design**: a very few expressive shapes for eyes, nostrils, ears, mouth.
- **Muted/coordinated backgrounds** that help the subject remain the main visual focus.
- **Mellow personality** that is charming, expressive, and not infantile.

This is an **illustration-style reference**, not a licensed art source. **Do not copy or trace the actual stock capybara, reuse its exact silhouette/face/palette layout, remove watermarks, or redistribute the supplied screenshot as an in-game asset.** Produce original animals with independent anatomy, new poses, scene requirements and stylistic variation.

### Visual synthesis

> **Original illustrated wildlife characters, drawn with confident outlines and simple warm cel shading, populate an exploratory rescue adventure. The real musical lesson is the action that powers discovery.**

The reference image can inform human design discussion; it is **not embedded in this repository** and its licensing status has not been established.

## 2. Animal design specification — what "the NoteQuest look" means

### Construction

1. Start with the **species silhouette**, not interchangeable mascot body parts. A capybara must read as capybara, a toucan as toucan, a red panda as red panda.
2. Use **2–5 major shape families** for head, torso, legs, face/muzzle and signature species features. Details are subordinate.
3. Use a **bold continuous outer contour** in dark warm charcoal/plum, such as working outline \`#2B1E2F\`. Internal details use thinner strokes; avoid harsh black unless the world scene calls for it.
4. Lay in one dominant **mid-tone**, one soft lit/secondary color, and one meaningful **shadow plane**. Optional tiny highlights; avoid noisy multi-gradient gloss.
5. Draw eyes/mouth/brow with economy. Expression should work at approximately **96 px** display size.
6. Use asymmetry and species-specific gesture to give characters individuality. Avoid exact cloning from a single stock mascot.
7. Render feet/paws/wings with readable simplified groupings rather than tiny anatomical detail.
8. Pick a consistent perceived viewing angle within a set (mostly front 3/4 for animal portraits; side 3/4 for movement), but tailor to animal anatomy.
9. Give a character a **calm resting pose** that feels alive even with reduced motion.
10. Keep dramatic backgrounds separate from the animal art so the asset can appear in multiple scenes and on the world map.

### Working graphic values (to be tested, not rigid math)

| Art property | Direction |
|---|---|
| Outer stroke | Thick, rounded joins/caps, dark plum/charcoal |
| Internal detail stroke | Approximately half to two-thirds of outline apparent thickness |
| Shading | 1–2 hard/soft-edged cel-shadow shapes |
| Highlights | A few small, soft shapes only |
| Texture | Sparse strategic marks; no all-over fur noise |
| Eyes | Clear expressive curve/ellipse; allow blinking variant |
| Background for standalone icon | Transparent for export; scene background on separate layer |
| Character palette | Species-rooted warm or natural colors tuned to each habitat |
| Small-scale check | Readable silhouette and expression at 96 px and 64 px |

### Character expression/pose sheets (eventual deliverables)

At minimum for a **featured** creature:
- neutral / relaxed,
- curious / attentive,
- needs-help / concerned without fear,
- delighted / successful,
- resting or asleep.

Useful independent pose states: sitting, standing, moving, offering/receiving a supply, and celebrating. Simple blinks, head tilt, tail/ear movement, breathing are sufficient. Prefer separated elements/rig-friendly artwork; final animation setup is an interface/engine integration decision.

### What not to do

Avoid emoji pasted onto landscape cards; identical circular heads for every species; overstylized gigantic eyes; plush-toy texture; photo-montage animals; full 3D rendering; oversaturated rainbow shading; stock-image tracing; complex gradients under eyes; ornate line noise; constant mouth animation on a non-spoken scene.

## 3. Player/explorer visual language

The player is an original NoteQuest explorer, **not** a likeness of any cartoon franchise. Outfit, backpack, movement animation and silhouette can visually connect the nine world hubs. Keep explorer designs modular, inclusive and suitable for an age-diverse learner pool.

- Offer a choice of recognizable avatars or illustration styles without enforcing an age-based look.
- Travel props can include a field journal, small piano-note compass, music satchel, headlamp and handheld map.
- The explorer should **never cover musical content** or compete with the notation panel.
- For advanced/adult learner presentations, reduce mascot prominence rather than eliminating the world narrative.

## 4. Shared asset and environment construction

All scenes use the same hierarchy:

1. **Background:** sky, sea, hills, ice, mountains, reef depth, cosmic vista.
2. **Midground:** major biome landmark, natural features, paths, vegetation, buildings.
3. **Interaction layer:** creature, explorer, supplies, stop markers, reward objects.
4. **UI layer:** separate from illustration; uses the central NoteQuest style tokens.
5. **Atmosphere:** optional light beams, leaves, stars, bubbles, snow; turn down or remove during lessons and for reduced motion.

### Shared rules

- Big recognizable shapes and 2–3 depth layers before minute details.
- Limit animation near active lesson notation.
- Preserve world accent identities without changing success/error meaning or staff colors.
- Keep landmarks readable in landscape and portrait crops.
- Use modular original vector layers where possible; export raster only as necessary.
- A world should be recognizable by **silhouette and landmark**, even before its label is read.

## 5. NQ-00 — Melody Harbor

**Curriculum stage:** Orientation and placement, absolute first contact with the piano.  
**Accent:** Sea glass \`#69D2C3\`; supporting harbor sky \`#A9D8FF\`, sand \`#F4D59B\`, coral trim \`#FF8C7A\`.  
**Mood:** Welcoming, gentle, sunlit; a place to begin with no intimidation.

- **Hero silhouette:** lighthouse shaped around a subtle musical staff/clef motif, small curved harbor, boats and inviting rooflines.
- **Environmental objects:** dock ropes, seashells, shoreline grass, pebble paths, colorful nautical flags.
- **Featured original animals:** sea otter, harbor seal, pelican or shorebird (regional exactness can depend on the fictional harbor setting).
- **Creative interpretation:** music-notes as flags or bell chimes, used sparingly.
- **Quest interaction:** find a note, explore high and low, listen for a sound, choose a first playable activity.
- **World map thumbnail:** a teal harbor with a recognizably warm lighthouse and sheltered bay.
- **Avoid:** pretending beginners must identify written notes before any listening or movement activity.

## 6. NQ-01 — Amazon Rainforest

**Curriculum stage:** First keys, pulse, simple reading.  
**Accent:** Jungle leaf \`#4FAE5A\`; supporting deep leaf \`#2F7A3C\`, river blue \`#58B8D6\`, orchid \`#D86ACF\`.  
**Mood:** Lush discovery, canopy depth and gently adventurous travel.

- **Hero silhouette:** winding turquoise river beneath enormous layered canopy, a high wooden lookout.
- **Environmental objects:** broad leaves, vines, orchids, moss, trunks, stepping stones, simple rescue supplies.
- **Featured animals:** sloth, toucan, jaguar cub, poison dart frog (existing mission subjects); all **redrawn in original NoteQuest character language**, not direct stock copies.
- **Interaction cue:** discover animal tracks and gather helpful supplies through musical practice.
- **World map thumbnail:** jungle canopy + blue river bend.
- **Avoid:** frightening predation scenes, overgrown backgrounds behind staff notation, caricatured animals that do not resemble their species.

## 7. NQ-02 — African Savanna

**Curriculum stage:** Growing reading fluency, early two-hand coordination.  
**Accent:** Golden grass \`#DDAE4B\`; supporting clay \`#B66F44\`, acacia \`#6E9B52\`, sunset orange \`#F08A4B\`.  
**Mood:** Expansive golden light, big skies and gentle animal encounters.

- **Hero silhouette:** single acacia tree under huge sunset sky, layered grassland.
- **Environmental objects:** grasses, warm stones, watering hole, termite mound, distant hills.
- **Featured animals:** giraffe, elephant calf, meerkat, zebra or lion cub.
- **Interaction cue:** rhythmic footsteps, watering-hole path, call-and-response animal echoes.
- **World map thumbnail:** warm gold plain with a single strong acacia silhouette.
- **Avoid:** safari clichés that copy specific films or insensitive depictions of local cultures.

## 8. NQ-03 — Australian Outback

**Curriculum stage:** Foundational fluency, scales, basic harmony.  
**Accent:** Red earth \`#C96A4A\`; supporting dust peach \`#E9B089\`, desert sky \`#7AB8E6\`, bush green \`#7A8F4F\`.  
**Mood:** Wide-open red landscape with playful animal discovery.

- **Hero silhouette:** layered rust-red rock mesas and long curved trail under a bright sky.
- **Environmental objects:** gum trees, scrub, rocks, shadowed creeks, dry grass.
- **Featured animals:** kangaroo joey, wombat, echidna, cockatoo, koala in appropriate wooded areas.
- **Interaction cue:** hopping interval paths, pattern finding, sanctuary/rescue supplies.
- **World map thumbnail:** rust-red bluff + bright sky.
- **Avoid:** arbitrary cultural motifs treated as decoration, duplicate rainforest foliage or all animals having identical poses.

## 9. NQ-04 — Polar Expedition

**Curriculum stage:** Early intermediate independence, expanded rhythm/keys.  
**Accent:** Glacier blue \`#78BFD9\`; supporting ice \`#BEE7F7\`, snow \`#F8FCFF\`, aurora \`#9C8BFF\`.  
**Mood:** Peaceful, bright and crisp; careful exploration.

- **Hero silhouette:** sweeping glacier, angular iceberg and aurora curtain.
- **Environmental objects:** ice caves, snow ridges, sea ice, frosted rocks.
- **Featured animals:** **Arctic scene:** polar bear, Arctic fox, seal. **Antarctic scene:** penguin, seal. Keep biomes distinctly separated; do **not** place polar bears and penguins in the same natural scene.
- **Interaction cue:** measured footsteps, patterns in frozen surfaces, call-and-response echoes.
- **World map thumbnail:** white ice shelf with lavender-blue aurora.
- **Avoid:** white-on-white notation, dangerous weather framing that overwhelms a young learner.

## 10. NQ-05 — Coral Reef

**Curriculum stage:** Intermediate musicianship, expressive styles and harmonic development.  
**Accent:** Reef aqua \`#49D2D0\`; supporting coral \`#FF8FA3\`, ocean teal \`#2B9DB0\`, shell \`#FFF1DC\`.  
**Mood:** Curious, luminous underwater world with gentle motion.

- **Hero silhouette:** layered coral shelf, sea arches and bubbles rising toward surface light.
- **Environmental objects:** branching coral, sea anemones, seagrass, shells, underwater rock tunnels.
- **Featured animals:** sea turtle, clownfish, manta ray, octopus, seahorse.
- **Interaction cue:** rhythmic bubbles, layered musical textures, caring for reef habitats.
- **World map thumbnail:** turquoise water with prominent pink coral.
- **Avoid:** busy water shimmer beneath notation, visually implying touching or harming reef wildlife.

## 11. NQ-06 — Himalayan Mountains

**Curriculum stage:** Upper intermediate technique, harmony and ensemble work.  
**Accent:** Pine green \`#4E7B61\`; supporting sky \`#8EC5F5\`, stone \`#8C93A8\`, red \`#D95C5C\`.  
**Mood:** Expansive height, contemplative discovery and resilient progress.

- **Hero silhouette:** layered snow peaks above pine forest, winding mountain path.
- **Environmental objects:** pines, stone paths, mountain river, dramatic cloud layers and sheltered lodge.
- **Featured animals:** red panda in forested foothills, snow leopard on high rocky terrain, yak, Himalayan monal.
- **Interaction cue:** mountain ascent as a progression metaphor; quiet listening and careful musical choices.
- **World map thumbnail:** high white peak with strong dark pine silhouette.
- **Avoid:** using sacred religious objects or symbols as generic decorative fantasy props.

## 12. NQ-07 — Space Station

**Curriculum stage:** Advanced musicianship, interpretation and performance.  
**Accent:** Neon cyan \`#59E3FF\`; supporting space navy \`#171B3A\`, electric purple \`#8F74FF\`, signal magenta \`#FF7AD9\`.  
**Mood:** Expansive exploration, wonder, and technical precision with a gentle magical edge.

- **Hero silhouette:** round observation dome overlooking a planet and glowing stars.
- **Environmental objects:** observation glass, soft-lit control consoles, floating instruments as abstract decorative motifs, research greenhouse.
- **Character possibilities:** original explorer plus a friendly space robot; animal learning themes can appear in a **conservation greenhouse** or Earth-life exhibit, not as fake “native space wildlife.”
- **Interaction cue:** deep listening, complex musical patterns, ensembles and expressive experimentation.
- **World map thumbnail:** cyan orbital station with a large planetary arc.
- **Avoid:** flashing neon behind music, imitating a recognizable sci-fi franchise or making high-level learners feel like a toddler in a rocket game.

## 13. NQ-08 — Grand Music City

**Curriculum stage:** Independent lifelong musicianship, creation and performance.  
**Accent:** Velvet plum \`#5A3B7A\`; supporting stage gold \`#E3B347\`, marquee cream \`#FFF4D6\`, spotlight blue \`#6D9BFF\`.  
**Mood:** Welcoming, celebratory, mature and open-ended rather than a “game over” scene.

- **Hero silhouette:** elegant concert hall/arched stage rising above a warm lively city.
- **Environmental objects:** piano studio windows, small theaters, recording space, street music stage, composition workroom.
- **Featured subjects:** musicians, ensemble characters, familiar rescued animals visiting a park/sanctuary where appropriate; animals need not dominate independent adult-facing practice.
- **Interaction cue:** repertoire, arranging, composing, ensemble leadership, self-chosen goals, performance celebrations.
- **World map thumbnail:** plum city skyline with large golden concert-stage arch.
- **Avoid:** implying the learner has permanently “finished” music; this world stays expandable.

## 14. Consistency between all nine worlds

Use the following standards when concepting world cards and backgrounds:

| Attribute | Consistent across worlds | Changes with world |
|---|---|---|
| Primary app shell | Twilight indigo | No |
| Paper lesson panels | Warm cream, Ink text | No |
| Illustration strokes | Rounded, confident, dark plum/charcoal | Only contrast adjustments |
| Character rendering | Distinct silhouettes, simple cel shading | Local species, gestures and colors |
| Environment layers | Background/midground/interaction/atmosphere | Landmarks and biome |
| Location thumbnail | Legible landmark and short label | Accent hue, landscape silhouette |
| Unlock/completion meaning | Stable lock/check/current semantics | Optional trim decoration |
| Rescue missions | Gentle, caring, original and meaningful | Regional needs, supplies, species |
| Learning skills | Governed by curriculum data | Level outcome and task |

**The user travels to a new location at every level.** That is a navigation/art requirement, not an assertion about book placement or verified Alfred pagination.

## 15. Reusable asset families

Future original art package should be planned as:

1. **World heroes:** 9 wide environment compositions with portrait/landscape safe crops.
2. **World thumbnails:** 9 distinct landmark images optimized for map cards.
3. **Map markers:** 9 silhouette icons + locked/current/complete treatments.
4. **Animal portraits:** per-species neutral and expressive states.
5. **Animated character parts:** separated eyes, ears, head/body/limbs/tails where practical.
6. **Explorer parts:** avatars, outfits, backpacks, poses, adaptable presentation.
7. **Scene props:** rescue supplies, journal, tracks, chest, musical navigation cues.
8. **Ambient effects:** leaves, dust, snow, bubbles, stars, stage glow (optional and reduced-motion safe).
9. **Quest illustration vignettes:** small compositions showing animals calmly awaiting help.
10. **Brand integration art:** decorative note/compass motifs, never staff-notation replacements.

For initial concept approval, prioritize **one feature animal character sheet** (recommend an **original NoteQuest capybara**) plus **one sample world hero** before creating the entire pack. A unified early sample prevents style drift across nine destinations.

## 16. Asset authoring and handoff requirements

No asset is generated or committed by this document itself. For future source/art deliveries:

- Prefer vector-friendly source and clean exports at multiple sizes; confirm the actual implementation format with the UI builder/Claude API contract.
- Keep reusable animal subject layers separate from world backgrounds.
- Each asset manifest should identify: original authorship, subject/species, world, pose/emotion, aspect ratio, expected pixel/relative display sizes, animation state, transparent background status, and licensing/rights.
- Use naming appropriate to asset role, e.g., \`animal-capybara-relaxed\`, \`world-rainforest-map-card\`, \`world-space-station-hero\`.
- Verify that all generated or contracted art is original and suitable for project reuse; do not copy the Vecteezy illustration or Nickelodeon game art.
- Animation design belongs to ChatGPT's UI zone; all gameplay rules and game state remain Claude's engine responsibility. Do not edit \`index.html\` until the coordination process and owner's code-review/merge rules are observed.

## 17. Review gate before production artwork

Visual reference review:
- Does the character resemble the **generic qualities** of the owner's capybara reference without tracing/copying it?
- Is the species immediately identifiable at 64 px?
- Does a relaxed face look friendly and expressive with minimal detail?
- Are outlines consistent and shadows intentionally simplified?
- Is the local habitat recognizable in a small map preview?
- Does it work on warm paper and twilight shell backgrounds?
- Is the music lesson still the main task?
- Would a teen/adult still feel welcome?
- Are the historical Nickelodeon and stock art references inspiration only?
- Are the exact illustrations, gameplay states and animations appropriately marked as **draft**, not falsely shown as completed or merged?

## 18. Roadmap and authority boundaries

- **Completed:** Visual Style Guide v0.1; UI Component Style Guide v0.1.
- **This milestone:** Nine-World Art Guide v0.1 with the two explicit inspiration sources separated by purpose.
- **Next:** Logo Direction Guide v0.1; then original capybara character-sheet visual prototype and one world-scene visual prototype for iterative feedback.
- **Implementation:** Keep \`chatgpt/ui\` isolated, follow \`ENGINE_API.md\` and independent cross-review/owner merge approval. Do not modify Claude's engine code through an art-direction document.

**Owner delegation:** ChatGPT may develop and revise the working graphic direction. Code changes, repository merges, and externally licensed art use require their respective separate approvals.

## Owner update (2026-11-20): richer animals and eight required visual versions

**The detailed companion specification is [Animal Character Detail, Lifecycle & Expressions v0.1](ANIMAL_CHARACTER_LIFECYCLE_AND_EXPRESSIONS_v0.1.md).** It is the controlling interpretation for animal detail and variant inventory: egg, baby, adolescent, adult, sleeping, sick, tired, excited. The earlier emphasis on sparse lines and extremely simple construction should now be read as **controlled detailed 2D cel shading**, not low-detail emoji-like art. Biological realism remains intact; eggs for mammals are explicitly fantasy game collectibles, never factual biology. No assets or game-state changes are implied by this note.

## Owner update (2026-11-20): separate animal bath and enclosure cleanup

The [Pet Care, Pen Cleaning and Companion Selection guide](PET_CARE_COMPANION_AND_PEN_SYSTEM_v0.1.md) defines separate interaction/art asset families for animal Bath Time and pen/enclosure poop cleanup. Each world artist should allow species-appropriate bathing areas, care supply props, stylized habitat mess objects and companion appearances. **10 required animal presentations** now include dirty and bath time in addition to the prior eight.
