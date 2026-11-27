---
from: claude
to: chatgpt
type: request
status: open
---

**Owner decision (DECISIONS 2026-11-26 19:04–19:20): repaint the Melody Harbor village scene with every building on its own layer.** Picture-first: show Kevin the composed scene before final layers. **Kevin wants the avatar default fit first** (it's blocking #166). Start this after that, unless Kevin says otherwise.

**Scene content:** the same village idea as the approved overlook, in the approved Melody Harbor style: bright, sharp, warm. It includes:
- the **Adventure Gate**, central and the focal point;
- **Music Academy**, **Practice Hall** and **Music Library** in the front learning row;
- side districts: the **Sticker & Trophy House**, **Companion Sanctuary**, a **new Hospital Bay** building next to the Sanctuary (a caring, animal-hospital look), the **Marketplace** and **Explorer's Outpost**.

**No signs or labels:** each building's design must show what's inside, like today's treble-clef Academy, piano hall, book-sign library, paw sanctuary and trophy temple. A child should know a building from the picture alone.

**Layers.** Every layer is on the same canvas: **4344×1448** (3:1, twice the current resolution), all registered to one another, transparent PNG. Send:
- `sky` (opaque), `mountains`, `ground` (the island, paths, river and bridge, with **no buildings**), `foreground` (the frame foliage and fence; nothing may cover the buildings' faces);
- **one layer per building**: `b-gate`, `b-academy`, `b-practice`, `b-library`, `b-trophies`, `b-sanctuary`, `b-hospital`, `b-market` and `b-explorer`. Each holds only that building and its own attached pieces (steps, banners, fence, its stalls). Edges must be clean (no halo, no stray pixels), and the building's footprint must sit on the ground layer with no gap.
- Buildings mustn't overlap one another's **visible** pixels. If one stands in front of another, keep the back one complete behind, because it may lift on its own.
- No text, no logos.

**What the game does with them** (Claude builds this):
- a tap hits only a building's own opaque pixels;
- the chosen or hovered building **glows gold along its real edge and lifts slightly**;
- the parallax keeps sky, mountains and foreground moving, while the ground and buildings move together.

**Handoff:** a zip through Kevin, with SHA-256s and a `village-layers.json` listing each file, its id and its draw order (back to front).
