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
| Earlier | Curriculum follows the Alfred Prep Course order, from beginner to early intermediate, and the world map is the curriculum. |
| Earlier | Pets are the motivation layer above all games: 1 coin per first-try right note, plus a star bonus. No coins for chores. |
| Earlier | Rescue missions have a Wild Thornberrys *feel* only, with no show content. |

Earlier named-child decisions describe pilot requirements, not restrictions on the product audience. Alfred Prep A–F remains a resource and mapping reference within the broader beginner-to-advanced curriculum.
