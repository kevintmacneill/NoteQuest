# Melody Harbor village remake: layered buildings, tap-a-building (v1.0, Claude, 2026-11-26)

The single source for the Phase 1 village (M5). It records Kevin's decisions of 2026-11-26 (18:40, 19:04 and 19:18–19:20; see DECISIONS.md) and defines the art handoff and what the game does with it. **The interaction ships now on #168** using the current painting. **The art remake** is ChatGPT's, picture-first, and replaces the stand-ins without changing the interaction.

## 1. Owner decisions
1. **Tap-a-building.** The first tap previews a building, then Visit or a second tap enters. Tapping away or Esc dismisses.
2. **Which buildings are live in Phase 1:**
   - **Live:** Adventure Gate, Music Academy, Music Library, Companion Sanctuary and Hospital Bay.
   - **Coming soon** (a gentle card with no door): Practice Hall, Sticker & Trophy House, Marketplace and Explorer's Outpost.
   - The old Practice Games and Sticker Book entry points stay hidden; the screens remain until their replacements exist.
3. **No floating signs.** The building designs show what's inside, and the buildings themselves are what children tap. Names appear only on the preview card and in the All places list.
4. **The scene is repainted with every building on its own transparent layer.** This is a new picture-first approval; the old four-layer panorama approval doesn't carry over.
5. **Highlight: a gold glow along the building's real edge plus a gentle lift.** The building brightens and rises slightly when tapped (or hovered with a mouse).
6. **Hospital Bay gets its own building** next to the Companion Sanctuary. Until it's painted, it's a second door ("Visit Hospital Bay") in the Sanctuary's card.
7. **Order:** the new default avatars come first because they block #166. The village repaint starts after that, unless Kevin reorders.

## 2. Buildings, destinations and copy
| id | Name | Status | Door(s) | Card invitation |
|---|---|---|---|---|
| `b-gate` | Adventure Gate | live | Visit Adventure Gate → `continueAdventure` | Step through to continue your adventure. |
| `b-academy` | Music Academy | live | Visit Music Academy → `lessonIndex` | Lessons and skill checks for your piano journey. |
| `b-library` | Music Library | live | Visit Music Library → `./reference.html` | Look up notes, rhythms and music words any time. |
| `b-sanctuary` | Companion Sanctuary | live | Visit the pen → `sanctuary` | Visit your animal friends, or check on anyone who needs care. |
| `b-hospital` | Hospital Bay | live | Visit Hospital Bay → `sanctuary\|hospital` | (to write with the building, gentle and caring) |
| `b-practice` | Practice Hall | coming soon | none | Practice games to warm up your fingers and ears. |
| `b-trophies` | Sticker & Trophy House | coming soon | none | Your stickers, trophies and Golden Encore seals will live here. |
| `b-market` | Marketplace | coming soon | none | Spend your coins on clothes, accessories and animal supplies. |
| `b-explorer` | Explorer's Outpost | coming soon | none | Rescue expeditions and discoveries are on the way. |

Coming soon cards say "Coming soon! This building is still being built." The bottom dock keeps Continue Adventure, My Journey, Lessons and Music Library. The shortcut row keeps My Music Progress, Companion Sanctuary and Hospital Bay. The Continue Adventure button must stay on screen without scrolling.

## 3. Art: what ChatGPT paints (picture-first)
- **Scene:** the same village idea in the approved Melody Harbor style: bright, sharp and warm. The Adventure Gate is central and the focal point. The learning row is the Academy, Practice Hall and Library. Side districts are the Trophy House, Sanctuary plus the new Hospital Bay, the Marketplace and the Explorer's Outpost.
- **No text, labels, signs or logos.** A child must recognise each building from the picture alone: a treble-clef academy, a piano hall, a book-sign library, a trophy temple, a paw sanctuary, a caring animal hospital, market stalls, a telescope lookout.
- **Canvas:** **4344×1448** (3:1; twice the current 2172×724), shared by every layer, registered, transparent PNG.
- **Layers:**
  - `sky` (opaque);
  - `mountains`;
  - `ground`: the island, paths, river and bridge, **with no buildings**;
  - `foreground`: frame foliage and fence. It must not cover any building's face;
  - **one layer per building:** `b-gate`, `b-academy`, `b-practice`, `b-library`, `b-trophies`, `b-sanctuary`, `b-hospital`, `b-market`, `b-explorer`.
- **Each building layer holds only that building** and its attached pieces (steps, banners, its fence, its stalls). Edges must be clean, with no halo or stray pixels. The footprint must sit on the ground layer with no gap.
- **Buildings don't share visible pixels.** If one stands in front of another, the back one is painted complete behind, because each lifts on its own.
- **Handoff:** a zip through Kevin (ChatGPT's environment can't reach GitHub). It includes `SHA256SUMS.txt` and `village-layers.json`:
  ```json
  {"version": 1, "width": 4344, "height": 1448,
   "layers": [{"id": "sky", "file": "sky.png"}, {"id": "mountains", "file": "mountains.png"},
              {"id": "ground", "file": "ground.png"},
              {"id": "b-trophies", "file": "b-trophies.png", "building": "trophies"},
              "... back to front ...",
              {"id": "foreground", "file": "foreground.png"}]}
  ```
- **Approvals:** Kevin approves the composed scene, then the exact layer pack. The old panorama stays live until the new pack is approved.

## 4. What the game does (Claude)
**Now, on #168, with the current painting:**
- Each building is a traced outline in the city layer's own pixels (SVG `viewBox 0 0 2172 724`), so it lines up at every size.
- The outlines are the buttons: role=button, the building's name, focusable, Enter or Space.
- The chosen building is a copy of the city layer cut along its outline, raised with a gold glow.
- Labels show only on the static fallback art, when the layers fail to load.
- The preview card floats over the scene on tablets and sits under it on phones, so every building stays tappable.
- A mouse drag to explore never counts as a tap: the pointer is captured only after a 6 px drag.
- There's an All places list.
- **No engine change.** Routes use today's `data-go`; they move to #147's admission policy when it merges.

**When the layered pack lands:**
- Each building is its own `<img>`/canvas layer on the parallax stage. The ground and buildings move together; sky, mountains and foreground keep their parallax.
- **Hit testing uses the building's own alpha.** A tap counts only on its opaque pixels, read from a scaled alpha map, so overlapping bounding boxes never steal taps.
- **Glow + lift on the real edge:** `filter: drop-shadow` gold on the building layer itself, plus `translateY` and a slight scale from its base, with a brief ease-in that's skipped with reduced motion. No hover stickiness on touch.
- The traced polygons and the cut-out copies are removed. The `village-layers.json` manifest is validated (ids, sizes, draw order); if it's invalid, the game falls back to the current scene.
- Hospital Bay becomes its own building and card, and the Sanctuary card goes back to "Visit the pen" only.
- The kitten presence layer (walk, idle, cheer) is added when the painted kitten art exists. It needs a free walking path on the ground layer in front of the learning row.

## 5. Acceptance (tests)
- `tests/browser/village_hotspots_test.py`, at 390×844, 844×390, 820×1180 and 1180×820, checks:
  - every building previews with the right doors, and coming soon ones have none;
  - a second tap never enters a coming soon building;
  - tapping the painted building itself works (not only a list);
  - tapping away dismisses, and Esc returns focus to the building;
  - a drag isn't a tap;
  - All places lists every building and focuses its first door;
  - Hospital Bay opens;
  - entering works by second tap and by Visit;
  - only the chosen building lifts with a glow;
  - no visible signs over the painted village;
  - no 404s, no page errors, and no horizontal overflow.
- `city_parallax_test` checks the gate's traced bounds against the painted gate, and the static fallback still navigates.
- `launch_menu_test` and `sanctuary_flow_test` cover hidden old entry points, the Coming soon Trophy House, and the Sanctuary's two doors.
- **With the layered pack:** alpha hit tests (a tap on a transparent pixel inside a building's box doesn't select it), a glow that follows the layer's edge, the manifest-invalid fallback, and the Hospital Bay building.

## 6. Open items
- **The approved M4A "village navigation" board** (Nov 25): ChatGPT is sending it to Kevin. #168's styling is adjusted to it before merge if it differs.
- **Review of #168** at its exact head (ChatGPT or the second Claude session).
- **Hospital Bay card copy,** written with the building art.
