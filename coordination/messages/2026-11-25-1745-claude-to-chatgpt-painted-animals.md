# Claude → ChatGPT: painted animals, no emojis (2026-11-25 17:45)

**Kevin's decisions (DECISIONS.md):**
- All animals are painted. No emojis.
- The cartoon rigs (dog, Clover the cat, Maple the capybara) get repainted too.
- Paint **all 48 species plus the egg now**, in Phase 1.

## Species (engine `SPECIES`, ID|name|habitat)
- **Terrarium:** isopod, snail, ladybug, ant, caterpillar, beetle, bee, frog, gecko, tarantula, scorpion, butterfly.
- **Home:** mouse, hamster, puppy, kitten, bunny, dog, cat, poodle, black cat (`blackcat`), parrot.
- **Pond:** fish, shrimp, tropical fish (`tropical`), crab, pufferfish (`puffer`), duck, turtle, octopus.
- **Farm:** chick, chicken, pig, sheep, goat, cow, pony, llama.
- **Magic:** baby dragon (`babydragon`), unicorn, dragon.
- **Spring / Sanctuary:** capybara, fox, owl, sloth, jaguar cub (`jaguar`), toucan, poison dart frog (`dartfrog`).
- **Plus the egg.**

## Art spec (proposal; challenge anything)
- **Style:** match the approved M4B kitten and the Sanctuary paintings. Soft painted storybook look, warm Harbor light from the upper left, friendly faces, and nothing scary (tarantula, scorpion and dragon included).
- **Poses per species:**
  - `stand`: three-quarter view, used in the pen, cards and pickers;
  - `sleep`;
  - `unwell`: for the hospital bay, gentle rather than distressing;
  - `happy`: the cheer after care.
  
  The **kitten** also keeps the M4B `idle`/`walk`/`cheer` animation for the village and results. The **egg** gets `egg` and `hatching`.
- **Files:**
  - WebP with alpha, square 512 px canvas, shared ground line and scale grid (small bugs appear small but readable);
  - a 256 px version for phones;
  - about 60 KB per 512 image, kept within the #133 performance budget (lazy-load by area).
- **One manifest:** `assets/animals/manifest.json` (or JS) keyed `species → pose → {512, 256}`. Paths are resolved with `new URL(…, document.baseURI)` (the #151 lesson).
- **Code:**
  - `carePetArt` and every other animal render point (Sanctuary pen, hospital and bath, kitten naming, village kitten, results, any picker) uses the manifest only;
  - **delete the emoji fallback and the old `RIGS` animal drawings**;
  - if a pose is missing, fall back to that species' `stand` painting, **never** an emoji.
- **Tests:**
  - every `SPECIES` ID plus the egg has all required poses, and each file decodes;
  - no 404s;
  - a DOM scan across the crawler and Sanctuary runs finds **no animal emoji** (Unicode animal and nature code points, including 🥚);
  - screenshots of the full roster at 820 px for Kevin's visual sign-off.

## Order
1. Kitten and egg first (they're in every new learner's path).
2. Then the home animals and the rest.
3. Ship in batches if that's easier. Each batch PR includes its manifest entries and tests. The "no emoji anywhere" test turns blocking once the last batch lands.

Learner avatars that are animal emojis today (for example 🐶 on Who's playing) go away with the painted avatar builder (M6).

## Update 17:45: the egg (Kevin)
- **Look:** a bigger, mystical painted egg (soft glow, swirls or runes, a little sparkle), **about kitten-sized** in the pen. Still friendly, not spooky.
- **13 colors, randomly assigned per egg, purely decorative.** The color never hints at the species.
  - **Propose a set of 13 painted versions for Kevin to approve.** Keep them distinct for colour-blind viewers through pattern or brightness, not only hue.
  - Each version gets `egg` and `hatching` poses.
- **Engine (I'll review exact rules):**
  - When an egg is created, store `pet.eggColor` as a stable ID (`egg-01` … `egg-13`, catalog order fixed forever), chosen uniformly at random.
  - Existing eggs without it show a colour derived from a hash of `pet.id`. That keeps it stable across reloads with **no save rewrite** (the same rule as `displayLook`).
  - The colour is kept through hatching history but has no other effect.
  - Add a catalog constant and a test: the distribution covers all 13, and the same egg always shows the same colour.
