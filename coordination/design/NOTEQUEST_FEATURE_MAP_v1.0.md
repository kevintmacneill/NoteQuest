# NoteQuest feature map v1.0

**Date:** 2026-11-22. **Status:** Inventory of learner destinations in the current game, plus ideas Kevin asked to record. This is not a build order and it does not approve the ideas in the last section.

**Design rule (Kevin, 2026-11-22):** Piano learning is the purpose of NoteQuest. Everything else exists to support motivation. **Continue Adventure** is the primary focus. My Journey matters, and learners will open it less often. Lessons are where new material lives, inside the worlds. The four practice games were set early and will be revisited, redesigned, and expanded. Kevin expects the Music Library, as it works today, to be underused.

**Checked against:** `index.html` (the `VIEWS` table), `assets/nq-launch-menu.js`, `assets/nq-worlds-v0.1.js`, `assets/nq-worlds-data-v0.1.js`, and `reference.html`, on `main` at the commit that added this file. Open pull requests are named only when a destination exists there and not on `main`. They are not treated as shipped.

## How to read priority

| Tier | Meaning |
|---|---|
| 1 | Primary focus. This is the thing a learner should be doing. |
| 2 | Core learning. Important, and used less often than Continue Adventure. |
| 3 | Practice support that already exists. Set early. Scheduled to be audited, redesigned, and expanded. |
| 4 | Shipped reference. Useful in principle. Kevin expects low use until it is rethought. |
| M | Motivation. Pets, coins, stickers, and expeditions. They support coming back to the piano. They are not the purpose. |
| G | Grown-up. Required on a shared tablet. Not a learning activity. |

## Village overlook: buildings are not assigned

Kevin (2026-11-22): **which building or landmark in the village overlook stands for which destination is not decided.**

`design/TITLE_TO_CITY_OVERLOOK_UX_v1.0.md` is the interaction direction. After Tap to Play, the camera moves to a first-person overlook of a village/city. Learning destinations stay in the first view. Pet care, stickers, the shop, and grown-up settings stay peripheral, reached by exploring. That doc does **not** assign a landmark to a destination.

The earlier plaza labels in `design/OPENING_SCREEN_ART_DIRECTION_v1.0.md` (Music Library on the left cottage, My Journey on the castle gate, Practice Games on the striped-awning shop, Lessons on the piano house, Pet Home on the pen) are a mockup of one plate. They are not the assignment. Do not build hotspots from that list until Kevin assigns the buildings.

## How a learner arrives

These are not home destinations. They decide which destination comes first.

| Step | Where in the code | What it does today |
|---|---|---|
| Title | `assets/nq-launch-menu.js` | Full-screen "Click to Play". Then `window.NoteQuestEnter`. |
| Remembered learner | `enterNoteQuest()` in `index.html` | One saved learner, or a learner id in `localStorage` key `noteQuest.lastPlayer.v1`, goes straight to `VIEWS.menu`. Otherwise `VIEWS.profiles`. |
| First profile | `VIEWS.newProfile` | Name and avatar, then `go('home')`. Home sends a new learner to `VIEWS.starter` (pick a starter pet) before the music menu. |
| Boot without the launch script | Last line of `index.html` calls `go('profiles')` | The launch script replaces that once it runs. |

Open question: a brand-new learner meets the starter pet before any piano. That matches the egg-onboarding already built. It fights the rule that piano comes first. Whether Continue Adventure should be the first stop after the starter is Kevin's, and it is not decided here.

## Learning

### Continue Adventure — tier 1

**Status:** Not a route on `main`. The closest controls do a different job.

- The menu's primary button is labeled **Music Journey** and runs `data-go="nqwHub"` (`VIEWS.menu`). That opens the nine-world map, not "pick up where you left off."
- Pet Home has a **Play** button (`data-go="games"`) that opens the practice-games list.
- Click to Play only enters the menu (or the learner picker). It does not resume a lesson or a song.

`TITLE_TO_CITY_OVERLOOK_UX_v1.0.md` makes Continue Adventure the default-focus control in the first view of the overlook. PR #69 (open, not on `main`) draws a Continue Adventure button. Review issue [#78](https://github.com/kevintmacneill/NoteQuest/issues/78) says that button, My Journey, and Lessons open the same screen. That bug is not this destination's design.

**Open questions**

- What, exactly, does Continue resume: the current world stop, the last unfinished game, the skill-check recommendation, or a grown-up-chosen activity?
- A learner with no history yet needs a first adventure. Melody Harbor (NQ-00) is the curriculum's start. The button should not dump that learner on the full nine-world map.
- The skill-check idea below is meant to feed this button. The button has to exist as its own action before that recommendation has somewhere to go.

### My Journey — tier 2

**Kevin's name.** The code says **Music Journey**. This is the nine-world map. It is important, and learners will open it less often than Continue Adventure.

**Status:** Live on `main` as a preview, not as the mastery path.

| Screen | View | Code |
|---|---|---|
| Nine-world hub | `nqwHub` | `NoteQuestWorlds.renderHub` in `assets/nq-worlds-v0.1.js` |
| One world | `nqwWorld` | `renderWorld` |
| Readiness story | `nqwReadiness` | `renderReadiness`. Copy says it cannot certify playing or unlock the next world. |

Data file `assets/nq-worlds-data-v0.1.js` is marked `curriculum-v3.2-preview-not-authorized-gameplay`. Nine worlds, 70 stops, 210 skills:

| Id | Name | Stops |
|---|---|---|
| NQ-00 | Melody Harbor | 6 |
| NQ-01 | Amazon Rainforest | 8 |
| NQ-02 | African Savanna | 8 |
| NQ-03 | Australian Outback | 8 |
| NQ-04 | Polar Expedition | 8 |
| NQ-05 | Coral Reef | 8 |
| NQ-06 | Himalayan Mountains | 8 |
| NQ-07 | Space Station | 8 |
| NQ-08 | Grand Music City | 8 |

The hub tells the learner the maps are open for exploration and that real lesson progress is only awarded by the learning engine. Stop cards show "View skills." They do not start a lesson. The hub also links to practice games, Pet Home, and Music Reference, and shows a disabled **My Progress · coming soon** button.

Entry points on `main`: menu primary button, Pet Home's Music Journey button.

Related, not duplicated here: [#73](https://github.com/kevintmacneill/NoteQuest/issues/73) (island map, lock cues, Journey Readiness as the gate) and [#23](https://github.com/kevintmacneill/NoteQuest/issues/23) (developer wording still shown to children on these screens). PR #32 (open) is the visual catch-up for the atlas and is not merged.

**Open questions**

- The map is a place you visit, not the daily path. Continue Adventure should not send every session here.
- Journey Readiness is specified (4 of 5, decisions J1–J4) and the screen on `main` is still a preview. When the live check replaces the preview is a release question, tracked with the Harbor work, not a new idea.
- Child-facing copy on the hub still says "engine" and "preview" ([#23](https://github.com/kevintmacneill/NoteQuest/issues/23)).

### Lessons — tier 2

**Status:** No Lessons destination on `main`. New material is described inside each world stop and is not playable from that screen.

`VIEWS.nqwStop` (`renderStop`) lists the stop's three skills as curriculum objectives: Learn, Practice, Prove. The notice on the page says these are not student scores, and "Full skill checks are not live on this curriculum preview." The actions are "back to this world" and "Practice existing games."

PR #32 (open) is where a playable Melody Harbor path is being built. It is not on `main`. PR #69's Lessons hotspot is not on `main`, and [#78](https://github.com/kevintmacneill/NoteQuest/issues/78) says it currently opens the same screen as My Journey and Continue Adventure.

**Open questions**

- Lessons are "new material inside worlds," so the route should open the next unlearned stop in the current world, not the whole map and not the practice-games list.
- How a non-reader gets through a new idea is still open on the Harbor screens ([#39](https://github.com/kevintmacneill/NoteQuest/issues/39)). This map does not settle it.
- Skills the game cannot check yet stay "coming soon" and must not block the stop (decision C-B12).

### Practice games — tier 3

**Kevin's name.** The menu card says **Practice Music**. The games screen title is **Games**. Kevin says these four were set early and will be revisited, redesigned, and expanded. Until that review, they stay as they are. They support practice. They are not the primary path.

**Status:** Live on `main`. Opened from the menu card (`data-go="games"`), from Pet Home's Play button, from the world hub, and from a lesson-stop's "Practice existing games" button.

`VIEWS.games` lists six tiles. The four games are the practice set. The other two tiles are Sticker Book and Music Reference, which belong to the groups below.

| Game | View | What is inside |
|---|---|---|
| Note Planets | `planets` → `level` | Four planets: Bass Moon (L1, bass C3–G3), Treble Mars (L2, treble C4–G4), Grand Saturn (L3, both hands, C position), Middle C Galaxy (L4). A planet unlocks after 6 stars on the previous one, unless a grown-up turns on "Unlock all planets." |
| | `meet`, `drill`, `meteor` | On a planet: **Meet the Notes**, **Name It**, **Find It**, **Play It** (real piano, microphone), **Meteor Shower** (15 meteors), **Endless Meteors**. |
| Rhythm Rocket | `rhythm` → `beats`, `tap` | **How Many Beats?** (quarter, half, dotted half, whole). **Tap Along** (hold for the length of the note). Stars stored as `rhythm:count` and `rhythm:tap`. |
| Song Station | `songs` → `song` | Eight built-in songs: Hot Cross Buns, Mary Had a Little Lamb, Au Clair de la Lune, Ode to Joy, Lightly Row, Jingle Bells, Twinkle Twinkle Little Star, Old MacDonald. Stars stored as `song:<id>`. |
| Unicorn Rescue | `unicorn` | Play unlocked notes to catch the unicorn. One screen. Stars stored as `unicorn`. |

Name It, Find It, Play It, Meteor Shower, Unicorn Rescue, and expedition tracks write per-note first-try right/wrong through `record()` into `profile.notes`. The key is `noteKey`: the note plus `t` (treble) or `b` (bass), for example `C4t`. Each cell is `{r, w, streak}`. Later questions already lean toward weaker notes (`weight()`). Rhythm rounds do not call `record()`. They append a row to `profile.log` (`a` of `beats` or `tap`, plus correct, total, stars, seconds) and keep a star total. There is no per-value cell for "quarter note" versus "half note."

**Open questions**

- The audit (idea below) decides what is redesigned and what new games are added. This map does not pick them.
- Play It depends on the microphone. On a page where the mic is blocked, the learner taps keys instead. That fallback is fine for now and should be part of the audit.
- The games list still offers Sticker Book and Music Reference. A redesign can split those out so this room is only practice.

### Music Library — tier 4

**Kevin's name.** The code and the page title say **Music Reference**. Kevin expects this area, as it works today, to be underused. It stays available. Making it useful is the rethink in the ideas section (own songs, plus the reference).

**Status:** Live on `main` as `reference.html` (styles `assets/music-reference-v0.1.css`, behavior `assets/music-reference-v0.1.js`). It does not change lessons, pets, or coins. The page says so.

| Tab | What it is |
|---|---|
| Glossary | Searchable beginner definitions. |
| Scales & Chords | Major, natural minor, harmonic minor, from any starting note, with triads and optional sevenths. Chords are not their own tab. |
| Metronome | 30–240 BPM, tap tempo, 2/4, 3/4, 4/4, and 6/8. BPM is clicks per minute. In 6/8 the six clicks are eighth notes, and click 4 is lighter. |
| Music Basics | Note values, intervals, the staff, and technique. Kevin's list named glossary, scales, chords, and the metronome. This fourth tab is also on the page. |

Linked from the menu's "More places" row, from the games grid, from Pet Home, and from the world hub. "Back to NoteQuest" is a normal link to `index.html`. Open issue [#21](https://github.com/kevintmacneill/NoteQuest/issues/21): that reload drops the in-memory learner and lands on the profile picker.

**Open questions**

- Whether anyone opens it is unknown until the on-device usage log exists. Kevin's expectation is that they will not, until their own music lives here.
- [#21](https://github.com/kevintmacneill/NoteQuest/issues/21) is the return path. It is a bug, not part of the rethink.
- A grown-up option to feel 6/8 as two dotted-quarter clicks, which would change what the BPM number means, is still Kevin's. The lighter accent on click 4 is what shipped.

## Pets and rewards

These support motivation. The overlook keeps them off the first screen, reachable by exploring. Current `main` does the opposite in a few places: a new learner is sent to the starter pet, and Pet Home is a full menu card beside Practice Music.

### Pet Home — tier M

**Status:** Live. `VIEWS.home`. Requires a starter (`VIEWS.starter`: puppy, kitten, or isopod). Habitats on the page: Terrarium, Pet Home, Pond, Farm, Hot Spring, Magic Meadow, and Rescue Sanctuary (earned, not sold).

Actions on the habitat: Music Journey, Play, Expeditions, Shop, Decorate (a mode of this same screen, not its own view), Journal, Music Reference. Decor items include a fountain and a castle. Those are shop objects placed in a pen. They are not the overlook's fountain or floating castle.

Care that is live from this screen: feed, play, bath, clean the pen, switch the active companion. Friendship (`pet.bond`) grows from finished music rounds for the active companion only. The levels and the personality lean (performer, scholar, explorer, braveheart, gentle) are engine state. No screen tells the story of that bond. That is the journal idea below.

Dragon and Baby dragon are already Magic Meadow shop species (`dragon`, `babydragon` in `index.html`). They are pets you can buy. They are not the guide. See the dragon idea.

**Open questions**

- Pet Home is one tap from the music menu. The overlook wants it peripheral. Placement waits on the building assignment, which is not decided.
- The first-run path shows the egg before any piano. See "How a learner arrives."

### Expeditions — tier M

**Status:** Live for one region. `VIEWS.map`, reached from Pet Home. If the learner has no explorer yet, the map opens `VIEWS.explorer` first (body, hair, hat, outfit, pack).

| Region | State | Animals |
|---|---|---|
| Amazon Rainforest | Open | Sloth, toucan, jaguar cub, poison dart frog |
| African Savanna | Coming soon | — |
| Arctic & Antarctic | Coming soon | — |
| Australian Outback | Coming soon | — |

An open region (`VIEWS.region`) leads to track-following (`VIEWS.tracks`, note-reading on the trail) and a rescue (`VIEWS.rescue`: treat, then release or invite into the sanctuary). Track-following uses the same per-note `record()` as the practice games. Rescues do not award companion personality traits. The copy and the animal facts are original. No show content (standing decision).

**Open questions**

- Three of four regions are still "coming soon." Expanding them is motivation content. It waits behind the learning path.
- Whether expeditions should stay a separate wilderness, or fold into the nine music worlds, is not decided. Today they are separate on purpose: wildlife expeditions are not the Music Journey.

### Shop — tier M

**Status:** Live. `VIEWS.shop`, from Pet Home. Tabs: Food, Pets, Decor, Care (tools and supplies), Habitats. Coins come from first-try right notes and from star bonuses. Chores do not pay coins (standing decision).

**Open questions**

- None on the shop itself. It is a motivation sink for coins the piano already paid. It should not become a reason to skip practice.

### Journal — tier M

**Status:** Live, and it is a field journal, not a companion journal. `VIEWS.journal`, from Pet Home and from the expedition map. Back goes to the map. Each region shows rescued animals, how many times, and a fact, or "???" until the rescue.

It does not show companion skills, strengths, or friendships. Those are the idea below. PR #69 review notes ([#75](https://github.com/kevintmacneill/NoteQuest/issues/75), [#87](https://github.com/kevintmacneill/NoteQuest/issues/87)) say a Progress button was opening this journal. That is a routing bug on that branch. Progress and Journal are different destinations.

**Open questions**

- Keep this wildlife journal. The companion page should be an addition, not a replacement, unless Kevin says otherwise.
- The page is readable text. A non-reader needs another way to see "I rescued the sloth." Not designed yet.

### Sticker Book / Achievements — tier M

**Status:** Live as **Sticker Book**. There is no Achievements view on `main`.

`VIEWS.stickers`. From the menu ("More places") and from the games grid. A sticker is awarded when a round earns 2 or more stars, picked at random from the ones not yet collected. Four sets: Dogs & Cats, Space, Around the World, Music. Stickers can be placed in habitats.

The overlook and PR #69 say **Achievements**. Review issue [#96](https://github.com/kevintmacneill/NoteQuest/issues/96) asks that the village button say Sticker Book, because that is the child-facing screen. This map uses both names for one destination until Kevin picks the word.

**Open questions**

- One word, for children: Sticker Book or Achievements. [#96](https://github.com/kevintmacneill/NoteQuest/issues/96) recommends Sticker Book. Not re-filed here.
- Stars, stickers, and a future world badge (the parked encore idea) need to stay distinguishable. A sticker is a round reward. A badge would mean a world was completed.

### Progress — tier M, and a learning feedback tool

**Status:** Not a child-facing destination on `main`.

- The world hub draws **My Progress · coming soon** and the button is disabled (`renderHub` in `assets/nq-worlds-v0.1.js`).
- The grown-up screen (`VIEWS.parent`) already shows the numbers: total minutes, last 7 days, rounds, stars, stickers, coins, pets, a 7-day minute chart from `profile.log`, and per-note accuracy from `profile.notes`.
- There is no favorite-song field. Song stars live at `profile.stars['song:<id>']`.
- PR #69 (not on `main`) adds a child progress page. The overlook doc says Progress may sit in the learning district as feedback, and that it must open music progress and return to the village. [#75](https://github.com/kevintmacneill/NoteQuest/issues/75) and [#87](https://github.com/kevintmacneill/NoteQuest/issues/87) are the routing bugs on that branch.

This map lists Progress with pets and rewards because it is a record of what the learner has done, not a place where they learn. The overlook may still put the button in the learning district. That is placement, and the building assignment is not decided.

**Open questions**

- Child-facing progress has to work without reading, and it must not show the grown-up controls.
- Favorite song is the small addition in the ideas section. Whose choice it is (the learner, on this page) is the point of that idea.
- Minutes on the grown-up chart are round time, not time spent standing in a room. The usage-analytics idea is the second kind of number. They should stay separate.

## Grown-up

### Choose Learner — tier G

**Status:** Live.

| Control | Where | Behavior |
|---|---|---|
| Who's playing today? | `VIEWS.profiles` | Lists profiles with stars and sticker counts, plus New player. Selecting a learner stores the id and opens the menu. Opening this view clears the in-memory player (`NQ.profiles.select(null)`). |
| Switch Player | Menu, `data-go="profiles"` | Same screen. |
| Click to Play | Launch overlay | Skips this screen when there is one learner or a remembered learner. |

Profiles are separate: progress, coins, pets, and settings (standing decision). The product is for any person who creates a profile. Micaela and Zoe are the pilot, not the limit.

**Open questions**

- The overlook wants a learner control in the first view ("Welcome Back and the learner picker" in the art-direction note, and profile routing preserved in the overlook spec). The control is decided. Which building it sits on is not.

### Settings / Parent area — tier G

**Status:** Live, behind a 3-second hold, and the hold exists only on the profile picker.

`VIEWS.profiles` renders `<button class="hold" id="hold">` labeled "Grown-ups · hold for 3 seconds." `bindHold()` waits 3000 ms, then `go('parent')`. Releasing early cancels. The menu on `main` has no Settings button.

`VIEWS.parent` contains, per learner: the practice summary and per-note accuracy described under Progress; letter hints (fade / always / off); unlock all planets; exact-octave listening; bonus coins; rename; reset progress; delete player. For the whole app: sound, rhythm latency, mic test, and the save-code copy/paste that moves every learner to another copy of the game.

The overlook and issue [#74](https://github.com/kevintmacneill/NoteQuest/issues/74) require this same hold for any Settings control drawn on the village. A Settings button that opens `parent` immediately is a bug. This map does not weaken the hold.

**Open questions**

- The hold is on the profile picker, so a child who is already playing cannot reach Settings without switching learner first. The overlook wants the hold on the village Settings control. Both can be true: the village control runs the same 3-second hold, then opens this screen.
- Usage analytics, if built, belong on this screen. They stay on the device. See the idea below.

## Ideas under consideration

Kevin asked for these to be written down and filed. They are **not approved work**. None of them was already an open issue on 2026-11-22 (open issues checked through #96; searches for the idea titles found no match). Existing bugs linked above are left as they are.

The repository has an `enhancement` label and no `idea` label. These ten issues were filed for that label. The integration that opened them cannot add labels (`addLabelsToLabelable` is not permitted), so they are unlabeled until someone with permission adds `enhancement`.

1. **Skill check.** A short assessment that finds weak skills and recommends what to practice next, and that recommendation is what Continue Adventure offers. Per-note first-try accuracy is already in `profile.notes`. Rhythm accuracy is in the round log, not in a per-value cell. **GitHub:** [#97](https://github.com/kevintmacneill/NoteQuest/issues/97)
2. **Usage analytics.** An on-device log of which places each learner opens and how long they stay, with a simple chart on the grown-up screen, so effort follows use. Local only. **GitHub:** [#98](https://github.com/kevintmacneill/NoteQuest/issues/98)
3. **Upload own sheet music.** Practice songs the learner cares about. Phase 1 is MusicXML (for example from MuseScore). PDF or a photo comes later. **GitHub:** [#99](https://github.com/kevintmacneill/NoteQuest/issues/99)
4. **Music Library rethink.** Make the library useful: the learner's own songs, plus the reference that is already there. **GitHub:** [#100](https://github.com/kevintmacneill/NoteQuest/issues/100)
5. **Practice games review.** Audit Note Planets, Rhythm Rocket, Song Station, and Unicorn Rescue. Decide redesigns and new games. Kevin says this set was built early and will be revisited. **GitHub:** [#101](https://github.com/kevintmacneill/NoteQuest/issues/101)
6. **Easter eggs.** Hidden discoveries from specific actions. Examples Kevin gave: a secret melody at the fountain, tap the floating castle 5 times, a night-time village. **GitHub:** [#102](https://github.com/kevintmacneill/NoteQuest/issues/102)
7. **Mastery / encore.** Kevin is undecided. The suggestion on the table: an optional harder encore tier and a gold badge on a completed world, with no reset of progress. Parked until there is more to master. **GitHub:** [#103](https://github.com/kevintmacneill/NoteQuest/issues/103)
8. **Journal additions.** Add companion skills, strengths, and friendships. The wildlife field journal stays. **GitHub:** [#104](https://github.com/kevintmacneill/NoteQuest/issues/104)
9. **Progress: favorite song.** Add a favorite song to Progress. **GitHub:** [#105](https://github.com/kevintmacneill/NoteQuest/issues/105)
10. **Dragon guide option.** Requested by Micaela, age 7: a dragon as a guide or companion choice. More of her requests will come. **GitHub:** [#106](https://github.com/kevintmacneill/NoteQuest/issues/106)

## What this file does not decide

- Building assignments in the village overlook.
- Whether to build any idea in the list above.
- The open PR #69 review. The requests in `messages/2026-11-22-0558-chatgpt-to-coding-agent-pr69-blocker-fixes.md` and `messages/2026-11-22-0605-chatgpt-to-coding-agent-pr69-followup-94-96.md` stay open.
- Engine behavior. Changes to `ENGINE_API.md` still go through Claude.
