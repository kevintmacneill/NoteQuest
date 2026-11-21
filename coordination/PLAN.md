# Note Quest — Build Plan

**Owner:** Kevin · **Audience:** any person who creates a learner profile, at any age or musical starting point. **Initial setup:** acoustic piano and shared Samsung Android tablet.
**Goal:** a comprehensive, self-guided piano education system from first experience through advanced independent playing. Each profile gets a skill-appropriate learning path, with structured progression and free exploration.

## Learners, scope and personalization

- **Profile creation is open to anyone**, not restricted to named people or children. Each learner's placement, progress, mastery, curriculum unlocks, practice history, preferences, coins, pets, habitats and settings remain separate, even on a shared tablet.
- **Curriculum follows skill, not age:** do not determine progression solely from age, reading fluency, name, or which Alfred book someone owns. People can start at zero or place into a higher level. Each of the nine levels has its own unique world-map location.
- **Presentations adapt to the learner:** support picture-first, low-text interaction for pre-readers without forcing the same childish presentation on adults or more advanced learners. Big touch targets and accessibility apply broadly.
- **Initial real-world pilot cases (not an audience limit):** Micaela (7, nearing the end of Alfred Prep A), Zoe (5, pre-reader and zero prior lessons), Kevin and Erika (adult complete beginners). Their differing needs should inform tests without becoming hard-coded restrictions.
- **Voice is deferred.** Prepare narration-ready material, but do not claim a fully self-guided pre-reader experience until it is actually accessible. Picture-based lessons and caregiver participation may bridge the interim period.
- **Curriculum:** Alfred Prep A–F is a useful external reference, not the whole curriculum. The nine-level proposed hierarchy spans NQ-00 through NQ-08. The original rescue and animal game concepts may remain as motivational presentation for those who enjoy them.

## Who does what

| Role | Who | Owns |
|---|---|---|
| Product owner | Kevin | Final say, approves merges and curricular acceptance, coordinates playtesting with learners at different levels |
| Engine builder | Claude | Game rules and data, with no visuals: curriculum data, note/rhythm checking, microphone pitch detection, scoring, stars, coins, pet needs and growth, rescue missions, save/load, move-progress codes |
| Interface builder | ChatGPT | All learner-facing screens, layout, theme, animations, sound and artwork, with age- and reading-appropriate presentation |
| Curriculum | ChatGPT writes, Claude reviews | ChatGPT architects competencies and hierarchy; Claude reviews pedagogy, Alfred mapping and feasibility; Kevin approves proposed changes |

Neither builder changes the other's area. To get something from the other side, open a request in `coordination/messages/`.

## Repo layout

```
index.html               the game (one page, two marked zones; see below)
assets/                  painted art as image files, loaded on demand (ChatGPT owns)
tests/                   engine tests, run with tests/run_engine_tests.sh (Claude owns)
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
- Code reaches `main` through a pull request, and only after the **other AI** reviews it and approves (see *Code review* in `README.md`). Once approved, the author merges.
- Small edits inside `coordination/` go straight to `main` so messages arrive right away. Those commits touch nothing outside the folder.

## Ground rules (both builders)

1. **Never lose any learner's progress.** The save key `noteQuest.v1`, the existing save shape, and `NQ1:` move-progress codes keep working. A save format change must include an automatic upgrade from the old format.
2. **Kid-safe and original.** No copyrighted characters or show content (no Minecraft, KPop Demon Hunters, Grinch, Wild Thornberrys, or copied artwork). Original art only.
3. **For learners of any age and reading ability.** Non-reading learners need visual-first choices, large tap targets, and few words; older users need a non-infantile presentation. Reading level and initial piano proficiency must not be inferred solely from age. Keep activities safe, original, and free of ads, purchases or unrelated external links. Spoken prompts remain on hold, and pre-reader accessibility has known limitations until it is solved.
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
| 5 | Merge and playtest | Kevin | Approved branches are merged; diverse learner profiles are playtested on tablet; feedback goes into `messages/` |

Phases 1 and 2 can run at the same time. Phase 3 starts once `ENGINE_API.md` v1 is posted.

**Curriculum handoff equivalence:** `coordination/curriculum/curriculum-v2.md` is an **unaltered copy** of the previously authored `NoteQuest_Master_Curriculum_Hierarchy_v0.1.1.md`. The internal version 0.1.1 is correct; "v2" is the coordination filename. It is a **draft hierarchy** with nine distinct level locations, not a complete lesson set or authorization to implement. Claude's v3 review is pending Kevin's approval.

## What the engine will expose (draft; details go in ENGINE_API.md)

- **Profiles:** list, create, switch, delete for any learner. Visual avatars allow selection without reading. Curriculum progress, preferences, coins, pets, habitats, and settings are independently stored per profile. No hard-coded names, roster size, age floor, or child-only learning path.
- **Voice:** on hold. Prompts stay short so a spoken line can be added later.
- **Curriculum:** regions → stops → steps; current position; unlock state; placement.
- **Questions:** `NQ.round.start(gameType, stopId)` returns questions; `NQ.round.answer(value)` returns right or wrong plus feedback; `NQ.round.finish()` returns stars, coins and unlocks.
- **Microphone:** start and stop; events for the detected note.
- **Rhythm:** a pattern to play, a tap/hold timeline, and timing judgments.
- **Economy and pets:** coins, shop items, pet list with each pet's needs, mood, growth stage and current action; feed, play, clean, adopt.
- **Missions:** regions, animals in trouble, supplies, chests, journal.
- **Events:** `NQ.on('coins'|'pet'|'unlock'|'save', fn)` so screens update by themselves.
- **Saves:** automatic save, export code, import code.
