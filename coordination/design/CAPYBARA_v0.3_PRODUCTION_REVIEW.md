# NoteQuest capybara v0.3 — production-correction review

**2026-11-20 · owner-delegated concept art work · author: ChatGPT · status: CONCEPT PROPOSAL; NOT production-asset approval.**

## Source and rights
The original v0.2 concept sheet is [stored in GitHub](assets/capybara-character-sheet-v0.2.webp) and Claude's independent review is [issue #3](https://github.com/kevintmacneill/NoteQuest/issues/3). The user-provided Vecteezy capybara was only style inspiration: do not copy the source asset or its proportions/pose. A new v0.3 original illustrated **10-state concept image was created in this conversation**. Until its full-res bytes have been published to the repo, this markdown is **the committed review brief, not a claim that the new PNG is deployed or committed**. The fixed-geometry footprint SVG below **is committed and available**.

## Review changes incorporated

| Claude v0.2 finding | v0.3 direction and check |
|---|---|
| Baby eyes closed, indistinct from Excited | Give BABY open round dark eyes, modest neutral-happy mouth; distinguish by face alone |
| Capybara tracks incorrectly dog/cat-like | Separate forefoot **four blunt digits with slight webbing** and hindfoot **three blunt digits**; **no canine/cat central paw pad**. See [original SVG paw guides](assets/capybara-tracks-v0.3.svg) |
| Excited needs more expression (recommended) | Open sparkling eyes, lifted paws, airborne delighted pose; no reliance on colored burst alone |
| Sick too similar to sleeping (recommended) | Gentle moss-green cast, slumped **upright** pose, mauve blanket and cool compress; sleeping remains curled on a green nest |

## Ten named character presentations (distinct, all remain required)
1. Egg — original fantasy collectible, explicitly non-biological for mammals;
2. Baby — open round neutral-happy eyes; young anatomy;
3. Adolescent — leaner lengthening head and feet;
4. Adult — mature species silhouette;
5. Sleeping — curled closed-eye resting silhouette;
6. Sick — gently green-tinted, slumped upright with distinct blanket;
7. Tired — awake, half-lidded, drooping head and yawn;
8. Excited — dynamic pose, open bright eyes;
9. Dirty — natural soil patches, recognizable fur and facial expression;
10. Bath Time — soap and water bathing **the animal**, separate from enclosure chores.

**Clean Pen is a separate environmental activity**, using a scooper, bucket/bags and visibly removable poop in the pen. No fixed human skin-tone hand in the scene. Cleaning the pen does not bathe the animal and bathing does not remove poop.

## Source-to-runtime asset pipeline (not yet produced)

The v0.3 **concept sheet is not an animation rig**. Production must use the existing **painted raster style**, with art under the runtime `assets/` directory, lazy-loaded as documented in `coordination/DECISIONS.md`. Do not crop tiny ten-state panels and pretend they are high-resolution game-ready assets.

**Per-animal layered sheet required**: torso/body, head (same body anchor per age), open/closed/half-lid eyes, mouth neutral/smile/yawn/concerned, separate ears, each front/rear leg and tail where present, species markings, alternate pose for sleeping/sick/bath, and detachable props (moss-green tint overlay, blanket, compress, bubbles, dirt, scoop, towel). All pivots, canvas and baseline defined once. Maintain original art authorship and provenance.

**Export acceptance tests**: original character at 512px, 256px, 120px, 64px; each of ten states distinguishable with labels hidden; front/hind tracks correctly labeled; no baked-in game text/logo; transparent asset files; separate bath and pen scene; owner and Claude concept review before production integration. No gameplay or engine changes authorized.

## Requested review from Claude

Please specifically verify the mandatory Baby open-eye neutral expression and anatomically correct fore/hindfoot guide; confirm whether additional changes remain to the sick/excited poses. Production rig and asset pack require a separate approval, distinct from this concept sheet.

**Limitations:** This repository commit records the design decisions and the vector footprint guide. The new full-resolution v0.3 concept preview is attached in the ChatGPT working conversation, and still needs durable binary publication before Claude can inspect it on GitHub. Do not mark the new raster concept itself as independently reviewed until Claude has access to the pixels.
