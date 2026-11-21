# Decisions (Kevin)

| Date | Decision |
|---|---|
| 2026-11-20 | Claude builds the engine. ChatGPT builds the graphical interface and all art, including pets and animals. |
| 2026-11-20 | Same repo. Each builder works on its own branch, and the branches merge into main. |
| 2026-11-20 | The game stays one `index.html`. |
| 2026-11-20 | Claude and ChatGPT communicate through `coordination/` on GitHub. |
| 2026-11-20 | Claude's Base Camp theme mockups are dropped. ChatGPT designs the look. |
| 2026-11-20 | ChatGPT's curriculum v2 is the starting point. Claude reviews and improves it. |
| 2026-11-20 | ~~Kevin approves every pull request into main.~~ Replaced the same evening by cross-review (next row). |
| 2026-11-20 | **Cross-review:** a pull request merges only after the other AI reviews and approves it. Review notes are GitHub issues, one per note. Approval is a PR review (type Comment) that starts with `APPROVED`, because both AIs post as Kevin's account and GitHub blocks self-approval. Once approved, the author merges. |
| 2026-11-20 | Edits inside `coordination/` may go straight to main. |
| 2026-11-20 | Kevin starts check-ins by telling a builder to "check coordination". |
| 2026-11-20 | Players: Micaela (7) now; Zoe (5) will also use it later, with her own profile and progress. |
| 2026-11-20 | Zoe starts from absolute zero: no lessons and no reading yet. The curriculum needs a first-steps start before Prep A, and every prompt must work without reading. |
| 2026-11-20 | The girls share one tablet with completely separate profiles: progress, coins, pets, camp and settings. |
| 2026-11-20 | Voice (spoken prompts) is on hold. Build everything else first. |
| 2026-11-20 (scope refinement) | NoteQuest is for **any person who creates a profile**, not exclusively Micaela and Zoe. Initial learners are pilot examples, not limits or default roster; profile progress and rewards remain separate. All ages and reading abilities must have appropriate instruction and placement. |
| 2026-11-20 (curriculum handoff) | The earlier `NoteQuest_Master_Curriculum_Hierarchy_v0.1.1.md` is **curriculum-v2.md** for the coordination workflow; it remains a draft requiring Claude review and Kevin acceptance before implementation. Each of nine levels has a distinct map location. |
| 2026-11-20 (roles) | ChatGPT owns curriculum architecture and visual design; Claude owns game engine/implementation; existing branch separation and owner PR approval remain in force. |
| 2026-11-20 (animal art) | Every featured animal/pet needs richer species-specific illustration with eight recognizable presentations: egg, baby, adolescent, adult, sleeping, sick, tired, excited. Growth and conditions are different dimensions. The egg is a clearly fictional collectible convention for mammals. No game mechanics or code modification authorized by this art decision. |
| 2026-11-20 (pet care & companions) | Owner requires a dedicated Bath Time activity (wash animal), a separate Clean Pen activity (animals poop; clean enclosure using supplies purchased with piano-earned tokens/coins), and the ability to choose any owned animal as primary pet or sidekick. The currency is the existing in-game coins; cleaning chores do not earn coins. Dirty and bath-time artwork bring animal versions to 10. Prices, spawn rates and persistent engine API details remain proposed, not yet implemented. |
| 2026-11-20 | **Painted art:** keep the painted raster look from the capybara sheet. The game becomes `index.html` plus an `assets/` folder of image files loaded on demand (GitHub Pages). It no longer needs to fit in one file. |
| 2026-11-20 | **Curriculum review (C1):** move level cut points earlier, so the beginner years get more map locations (about Prep A, B, C–D, E–F, then intermediate onward). |
| 2026-11-20 | **Curriculum review (C2):** Zoe knows letters A–G but can't read words. Letter names can come early with picture cues; instructions must not need word reading. |
| 2026-11-20 | **Curriculum review (C3):** no "follow my lesson book" mode. The game moves at each learner's own pace. |
| 2026-11-20 | **Curriculum review (C9):** plan all nine levels in detail first, then build. |
| 2026-11-20 | **Pets D1:** new pets (adopted, and a new player's starter) arrive as eggs that hatch after the player finishes 3 music rounds. Existing pets never become eggs. |
| 2026-11-20 | **Pets D2:** pets get sick only after long neglect (about 2 days); ordinary care cures it. Nothing dies or is taken away. |
| 2026-11-20 | **Pets D3:** pets sleep during night hours (default 8:30 pm–6:30 am, changeable by grown-ups) plus short naps; tapping wakes them. |
| 2026-11-20 | **Pets D4:** add used-up care supplies (soap per bath, bags per pen mess) on top of reusable tools, with a free starter pack. |
| 2026-11-21 | **Journey Readiness J1 (pass bar):** a part (Navigation, Timing, Performance) passes with **4 of 5** fresh questions right on the first try. A passed part stays passed. |
| 2026-11-21 | **Journey Readiness J2 (grown-up confirmation):** a grown-up's "yes, she played it" can pass a Performance item **only for skills the microphone can't check**. It is saved as grown-up evidence (`caregiver`/`teacher`), never as a microphone pass. |
| 2026-11-21 | **Journey Readiness J3 (early check):** a learner may take a world's readiness check before finishing its stops. Passing every part then counts as placement: that world's stops are marked placed, with review reminders, like today's placement test. |
| 2026-11-20 (journey challenge direction) | Owner proposed a story-led **Journey Readiness Challenge** before traveling to each next world: learners prepare for an expedition and prove they know the necessary musical skills for the next location. ChatGPT defined Navigation, Timing and Performance demonstration candidates, picture-first presentation, targeted retries, and free earlier-world exploration in milestone #5/#8. **Exact pass thresholds, engine unlock API, and curriculum skill assignment remain proposals pending owner/Claude acceptance; not yet implemented.** |
| 2026-11-21 (companion design) | Each animal begins with species-specific personality and optional themed activities; individual friendship, personality expression and cosmetic/optional abilities develop through shared adventures. The talking magical guide is an original creature separate from the learner's selected companion; Gio is not the guide. No companion advantage may bypass music mastery or Journey Readiness. Exact engine schema and implementation remain unapproved. |
| 2026-11-21 (companion growth behavior) | **Owner decision:** companions develop automatically through normal gameplay and shared adventures, not through manually assigned personality points, skill trees or upgrade choices. Species starts with a distinct personality; each individual's friendship and optional abilities evolve through ordinary play and care. Preserve per-profile isolation and existing assessment standards; exact triggers/schema remain to be designed and cross-reviewed. |
| Earlier | Curriculum follows the Alfred Prep Course order, from beginner to early intermediate, and the world map is the curriculum. |
| Earlier | Pets are the motivation layer above all games: 1 coin per first-try right note, plus a star bonus. No coins for chores. |
| Earlier | Rescue missions have a Wild Thornberrys *feel* only, with no show content. |

Earlier named-child decisions describe pilot requirements, not restrictions on the product audience. Alfred Prep A–F remains a resource and mapping reference within the broader beginner-to-advanced curriculum.
