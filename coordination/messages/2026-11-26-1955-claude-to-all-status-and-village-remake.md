---
from: claude
to: all
type: heads-up
status: open
---

**Kevin asked for coordination to be brought up to date on everything, including the village remake.** Everything below is also in STATUS (19:50).

## Village remake (one spec)
[`design/VILLAGE_LAYERED_REMAKE_v1.0.md`](../design/VILLAGE_LAYERED_REMAKE_v1.0.md) gathers Kevin's 18:40, 19:04 and 19:18–19:20 decisions:
- tap-a-building, with the live and coming-soon buildings;
- **no floating signs**;
- **the scene repainted with every building on its own transparent layer** (4344×1448, sky, mountains, ground, foreground, plus `b-*` per building), and a **new Hospital Bay building**;
- **a gold edge glow plus a gentle lift**;
- the handoff format (`village-layers.json` and SHA-256s through Kevin);
- what the game does now and when the layers land (alpha hit tests, a glow on the real edge);
- tests.

It supersedes my 19:25 brief where they differ. **ChatGPT:** the village repaint comes after the default avatars, unless Kevin reorders.

**#168** (green, mergeable, `b886759`) is the interaction on the current painting. It still needs the **M4A board** (ChatGPT, please send it to Kevin) and an **exact-head review** (ChatGPT or the second Claude session).

## Avatars
- **#166** is green and mergeable at `3995ee3`, and held until the new default kids are approved.
- **Waiting on:** the **default fit zip** through Kevin: girl ponytail (brown, pink bow), the pink hoodie outfit, round glasses and backpack as separate accessory planes, plus the boy's default look. Use the same `SRC/` layout as before, with SHA-256s. Kevin approved both default hairstyles; I need the matching outfit and accessories too.
- **Approved hair packs** (girl ponytail, all 8; braids once Kevin approves the exact composites): I'll publish them with `--partial` right after the defaults go live, each as its own reviewed commit.
- **Eye Color (Kevin approved 8: dark brown, brown default, hazel, amber, green, blue, gray, blue-green): Claude takes it on #166.** The plan:
  - **engine 1.9.0:** add `eyeColor` (`ec-darkbrown`, `ec-brown`, `ec-hazel`, `ec-amber`, `ec-green`, `ec-blue`, `ec-gray`, `ec-bluegreen`) to the v:1 catalog, append-only;
  - **saves:** looks without it read as `ec-brown`; writes accept it;
  - **builder:** an Eye Color tab, coming-soon support and Surprise Me;
  - **compositor:** an **iris-only layer after skin, before hair and accessories**, with the cache key.
  - **Art:** `SRC/<pose>/<body>/eyes/<ec-id>.png`, iris color only. The pupils, whites and highlights stay in the skin plate, as ChatGPT proposed.
  - **Question for Kevin, before I code:** should eye color have its own tab (a 7th) or sit inside the Skin tab? I'll ask him directly.
