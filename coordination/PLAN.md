# Note Quest — Build Plan

**Owner:** Kevin · **Player:** Micaela (age 5–7, Alfred's Basic Piano Prep Course, Level A, acoustic piano, Android tablet)
**Goal:** Micaela learns to read sheet music and play piano while having fun. Every feature serves that goal.

## Who does what

| Role | Who | Owns |
|---|---|---|
| Product owner | Kevin | Final say, approves merges, playtests with Micaela |
| Engine builder | Claude | Game rules and data, with no visuals: curriculum data, note/rhythm checking, microphone pitch detection, scoring, stars, coins, pet needs and growth, rescue missions, save/load, move-progress codes |
| Interface builder | ChatGPT | Everything she sees and touches: screens, layout, theme, animations, sounds, and all art, including the pets and animals |
| Curriculum | ChatGPT writes, Claude reviews | ChatGPT drafts; Claude checks it against the Alfred order and improves it; Kevin approves |

Neither builder changes the other's area. To get something from the other side, open a request in `coordination/messages/`.

## Repo layout

```
index.html               the game (one page, two marked zones; see below)
coordination/            how Claude and ChatGPT talk (lives on main)
  README.md              the rules for using this folder
  PLAN.md                this file
  STATUS.md              each builder's current status
  DECISIONS.md           what Kevin has decided
  ENGINE_API.md          the contract between engine and interface (Claude maintains)
  messages/              one file per message
  curriculum/            curriculum drafts, reviews, and the approved version
```

### One index.html, two zones
The game stays a single `index.html`. Inside it, clearly marked blocks set who edits what:

```html
<!-- ===== UI ZONE (ChatGPT) ===== -->        markup, CSS, art, screens
<script id="nq-engine">
/* ===== ENGINE ZONE (Claude) ===== */        window.NQ engine, no DOM drawing
</script>
<script id="nq-ui">
/* ===== UI ZONE (ChatGPT) ===== */           screens that call NQ.*
</script>
```

The engine never draws or touches the page layout. The interface never changes game rules or saved data directly; it calls `NQ.*` functions and listens for engine events. Keeping the zones separate stops branch merges from colliding.

## Branches

- `main`: always playable; this is what GitHub Pages serves.
- `claude/engine`: Claude's code work.
- `chatgpt/ui`: ChatGPT's code work.
- Code reaches `main` through a pull request. Kevin approves the merge.
- Small edits inside `coordination/` go straight to `main` so messages arrive right away. Those commits touch nothing outside the folder.

## Ground rules (both builders)

1. **Never lose her progress.** The save key `noteQuest.v1`, the existing save shape, and `NQ1:` move-progress codes keep working. A save format change must include an automatic upgrade from the old format.
2. **Kid-safe and original.** No copyrighted characters or show content (no Minecraft, KPop Demon Hunters, Grinch, Wild Thornberrys, or copied artwork). Original art only.
3. **Built for a 5-year-old.** Big tap targets, very few words, nothing scary, no ads, no outside links or purchases.
4. **Offline-friendly.** No outside network calls beyond fonts. The microphone works only on HTTPS (GitHub Pages).
5. **Android tablet first.** Touch, landscape and portrait, and an older tablet's speed.
6. **Don't break main.** Test before opening a pull request, and list what was tested in it.

## Phases

| # | Phase | Lead | Done when |
|---|---|---|---|
| 0 | Set up the coordination folder and branches | Claude | This folder is on `main`, and both branches exist |
| 1 | Curriculum v2 → v3 | ChatGPT pushes v2; Claude reviews | `curriculum/curriculum-v3.md` is approved by Kevin |
| 2 | Engine split | Claude | Today's game logic sits in the ENGINE ZONE behind `window.NQ`; the game plays exactly as it does now; `ENGINE_API.md` is published |
| 3 | New interface | ChatGPT | New screens are built on `chatgpt/ui` using only `NQ.*` |
| 4 | Curriculum engine | Claude | The world map's stops, Learn → Practice → Check, placement, and recitals run from the v3 data |
| 5 | Merge and playtest | Kevin | Both branches are merged; Micaela plays on the tablet; feedback goes into `messages/` |

Phases 1 and 2 can run at the same time. Phase 3 starts once `ENGINE_API.md` v1 is posted.

## What the engine will expose (draft; details go in ENGINE_API.md)

- **Profiles:** list, create, switch, delete.
- **Curriculum:** regions → stops → steps; current position; unlock state; placement.
- **Questions:** `NQ.round.start(gameType, stopId)` returns questions; `NQ.round.answer(value)` returns right or wrong plus feedback; `NQ.round.finish()` returns stars, coins and unlocks.
- **Microphone:** start and stop; events for the detected note.
- **Rhythm:** a pattern to play, a tap/hold timeline, and timing judgments.
- **Economy and pets:** coins, shop items, pet list with each pet's needs, mood, growth stage and current action; feed, play, clean, adopt.
- **Missions:** regions, animals in trouble, supplies, chests, journal.
- **Events:** `NQ.on('coins'|'pet'|'unlock'|'save', fn)` so screens update by themselves.
- **Saves:** automatic save, export code, import code.
