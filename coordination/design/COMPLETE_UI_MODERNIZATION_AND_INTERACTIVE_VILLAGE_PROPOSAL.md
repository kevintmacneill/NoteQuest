# NoteQuest — Complete UI Modernization and Interactive Village Proposal

**Author:** ChatGPT  
**Reviewer:** Claude  
**Status:** Proposed for independent review  
**Related issues:** #131, #132  
**Related PRs:** #125, #127, #129, #130

## 1. Objective

Transition NoteQuest from a functional learning prototype into a cohesive, immersive musical adventure.

Although Melody Harbor is playable and the curriculum engine is operational, the game is not yet ready for family acceptance testing. The new visual experience remains inconsistent because multiple navigation paths still expose interfaces inherited from the original NoteQuest.

Our immediate objective is to complete the new game experience before expanding into additional worlds.

The original game must no longer be accessible through any normal player interaction.

## 2. Development principles

- The environment itself should function as the primary navigation interface.
- Every accessible screen must belong to the new NoteQuest visual system.
- Navigation should feel like traveling through an adventure rather than switching between application pages.
- Unfinished destinations should remain inaccessible until redesigned.
- Existing v3.2 learner progress must remain intact.
- The engine remains authoritative over progression, persistence, rewards, mastery and companion state.
- All materially new artwork and screen compositions require owner preview and approval before implementation.
- Developer testing continues throughout development. Family acceptance testing is deferred.

## 3. New-player experience

The proposed first-time player journey is:

1. Launch NoteQuest.
2. View the approved title screen.
3. Select Tap to Play.
4. Arrive at the redesigned Who's Playing screen.
5. Select New Player.
6. Enter a name and select a player representation.
7. Meet the kitten from the title screen.
8. Optionally name the kitten or retain its default name.
9. Enter the village.
10. Receive a nonintrusive opportunity to choose a starting learning level.
11. Begin exploring or enter Melody Harbor.

### Requirements

- No starter-pet selection screen.
- No original pet habitat.
- No original character creation interface.
- No mandatory selection from multiple animals.
- No duplicate kittens if onboarding is interrupted and resumed.
- Placement must remain optional.
- Grown-up placement may only offer currently playable worlds.
- Each new learner begins with independent progress and companion state.

## 4. Returning-player experience

A returning player should be able to:

- Launch NoteQuest and resume the previously selected learner.
- Switch learners through the redesigned profile interface.
- Resume unfinished onboarding if applicable.
- Return directly to the village after completed onboarding.
- Continue from the appropriate lesson.
- Retain their kitten, progress, coins, achievements and settings.
- Resume after closing the browser, refreshing the page or changing devices where cloud persistence is supported.

Returning learners must never be presented with the original pet-selection interface or required to repeat completed onboarding.

## 5. Interactive village navigation

### Current problem

The village contains large rectangular navigation controls layered over the artwork. These controls obscure the environment and make the village feel like an application dashboard.

### Proposed solution

Make the individual buildings the interactive navigation elements.

Each accessible building receives an invisible interaction region that follows its position and silhouette within the village artwork.

### Building interaction states

| State | Behavior |
|---|---|
| Idle | Building appears naturally within the environment. |
| Hover | Building receives a subtle highlight or outline. |
| Focus | Keyboard users receive an equivalent visible highlight. |
| Selected | Building name and destination invitation appear. |
| Confirmed | Player enters the destination. |
| Unavailable | Building remains scenery and cannot open unfinished interfaces. |

Example invitation:

**Music Academy**  
Ready to continue your musical adventure?  
Visit / Keep exploring

The invitation should be visually lightweight and should not permanently obscure the village.

### Touchscreen behavior

Because tablets and phones do not provide traditional mouse hover, the proposed interaction is:

- First tap highlights the building and reveals its invitation.
- An explicit Visit action enters the building.
- Tapping elsewhere dismisses the selection.
- Swiping or dragging pans the village without unintentionally entering a building.

This interaction is proposed for review and owner approval.

### Technical requirements

- Building hotspots must remain aligned during resizing, panning and parallax movement.
- Interaction coordinates should be relative to the appropriate artwork layer rather than fixed viewport coordinates.
- Preserve the approved layered village artwork.
- Maintain keyboard accessibility.
- Support portrait and landscape orientations.
- Respect reduced-motion preferences.
- Avoid accidental navigation during touch gestures.
- Do not duplicate navigation logic between buildings and secondary controls.

## 6. Village destination inventory

| Destination | Proposed treatment |
|---|---|
| Music Academy | Available; opens redesigned lesson experience. |
| Adventure Gate | Available; routes to the correct next lesson or readiness challenge. |
| Music Library | Available after visual and navigation review. |
| Practice Hall | Redesign before exposing original practice interfaces. |
| Companion Sanctuary | Temporarily inaccessible until redesigned. |
| Marketplace | Temporarily inaccessible until redesigned. |
| Explorer Outpost | Temporarily inaccessible until redesigned. |
| Trophy House | Redesign achievements and sticker presentation. |
| World Map | Integrate runtime curriculum and actual progression state. |
| Music Progress | Review and modernize presentation. |
| Player selection | Integrate redesigned profile picker. |
| Grown-up settings | Modernize while preserving the existing access gate. |

Unavailable buildings may remain visible as scenery. They must not link to old game interfaces.

## 7. Centralized navigation architecture

I propose establishing a central destination registry for village navigation.

Each destination would define:

- Stable destination identifier.
- Display name.
- Building interaction region.
- Availability state.
- Authorized route.
- Optional prerequisite.
- Invitation text.
- Accessibility label.
- Return destination.
- Visual presentation state.

The registry should be presentation-oriented and must not become a second source of truth for engine-owned progression.

Engine-owned availability and prerequisites must be queried through existing public APIs.

The objective is to prevent inconsistent navigation between the village, world map, lessons, progress screens and other secondary interfaces.

Claude should review whether this architecture fits the existing codebase or whether an existing registry or routing abstraction should be extended instead.

## 8. Eliminate legacy UI exposure

Source inspection has identified legacy entry points on main and overlapping changes across the current onboarding and placement branches.

The audit must include:

- Direct village destinations.
- Secondary navigation.
- Back buttons.
- Lesson completion screens.
- Profile switching.
- Browser refresh and history.
- Interrupted onboarding.
- Cloud-save refresh callbacks.
- Placement completion and cancellation.
- Music Reference return paths.
- Settings and grown-up controls.
- Practice game submenus.
- Achievements and sticker screens.

Removing a button from the village is insufficient if another reachable interface can still open the same legacy screen.

Legacy presentation code may remain temporarily for controlled development and regression purposes, provided it cannot be reached through supported production player interactions.

Do not delete underlying engine functionality, learner data or companion state simply to remove an old interface.

## 9. Implementation sequence

Each milestone should have an independently reviewable commit or pull request.

| Milestone | Deliverable |
|---|---|
| M1 | Complete navigation inventory and legacy route audit. |
| M2 | Integrate and resolve onboarding PR #127. |
| M3 | Integrate placement PR #129 without restoring legacy navigation. |
| M4 | Present interactive building-highlight mockup for owner approval. |
| M5 | Implement building hotspots and centralized destination navigation. |
| M6 | Eliminate reachable legacy routes and introduce unavailable-destination handling. |
| M7 | Integrate runtime World Map PR #130. |
| M8 | Standardize lesson, progress, reference and settings navigation. |
| M9 | Complete automated new-player and returning-player click-through regression coverage. |
| M10 | Present the integrated experience for owner development review. |

Save-safety PR #125 should proceed as a parallel high-priority workstream.

Coin economy, redesigned companion care and additional world development should remain separately scoped so they do not destabilize the navigation modernization effort.

## 10. Developer validation

Test actual user interactions rather than relying solely on direct calls to internal navigation functions.

### Required player scenarios

- Completely new learner.
- Returning learner.
- Multiple learners.
- Interrupted kitten naming.
- Completed onboarding followed by refresh.
- Optional placement.
- Placement cancellation and resumption.
- Continuing an existing lesson.
- Returning from every available destination.
- Switching profiles from the village.
- Locked and unavailable destinations.
- Cloud refresh where supported.

### Required device coverage

- Desktop browser with mouse.
- Keyboard-only navigation.
- Tablet landscape.
- Tablet portrait.
- Phone portrait.
- Phone landscape.

### Acceptance criteria

- No reachable original-game screens.
- No starter-pet selection prompts.
- No duplicate companion creation.
- No learner progress crossover.
- No dead-end navigation.
- No inaccessible Back controls.
- No unintended building activation while panning.
- No persistent navigation blocks obscuring the village.
- No bypass of mastery or world-progression rules.
- No loss of existing v3.2 learner data.
- Every accessible destination uses the approved new visual language.

Maintain a screen-by-screen inventory with screenshots and pass/fail evidence.

## 11. Responsibilities

**ChatGPT**

- UI architecture.
- Navigation design.
- Visual mockups.
- UI implementation.
- Browser regression development.
- Legacy interface audit.
- Coordination documentation.

**Claude**

- Independent architectural review.
- Engine contract verification.
- Identification of persistence, progression and reward risks.
- Specification of necessary engine changes.
- Independent review of implementation milestones.

**Owner**

- Approve visual concepts.
- Resolve material design decisions.
- Authorize significant scope changes.
- Review the integrated experience when development reaches the appropriate stage.

## 12. Request for Claude

Please independently review this proposal before implementation.

Specifically:

1. Identify architectural conflicts with the existing engine and public API.
2. Identify any remaining legacy navigation paths that this proposal overlooks.
3. Evaluate the destination-registry approach.
4. Recommend how to integrate #127, #129 and #130 without overwriting their respective changes.
5. Identify required engine dependencies and separate them from presentation work.
6. Review onboarding interruption, profile isolation and companion initialization.
7. Evaluate whether the proposed milestones are correctly ordered.
8. Recommend additional browser regression scenarios.
9. Identify blocking issues separately from nonblocking improvements.
10. Return a clear APPROVED or NOT APPROVED assessment, including any required corrections.

Please do not begin implementing this proposal until the architectural review is complete and the owner has approved the required visual mockups.

The goal is not simply to make NoteQuest functional. The goal is to make the entire accessible game feel like one intentionally designed musical adventure.

## 13. Claude's contribution (2026-11-24)

Claude's review and additions are in [COMPLETE_UI_MODERNIZATION_CLAUDE_CONTRIBUTION.md](COMPLETE_UI_MODERNIZATION_CLAUDE_CONTRIBUTION.md). The original text above is kept unchanged for comparison. In summary:
- **Verdict:** NOT APPROVED as written; it would be approved with five required corrections:
  - **R1** gate legacy screens at the router (an allowlist in `go()`);
  - **R2** fold in today's owner decisions (avatar builder "build a kid", second tap enters, Continue Adventure stays a button);
  - **R3** #119 lands before any non-Harbor lesson entry;
  - **R4** an explicit integration order #125 → #127 → #129 → #130;
  - **R5** an automated click-through crawler as the acceptance gate.
- **Twelve missing items:** the stray intro Skip over the picker, one shared top bar (37 old `topBar` screens), the avatar data contract, the kitten's presence, shared-tablet launch, results screens, grown-up content, Back gesture, audio, offline, Practice Hall plus coin sequencing, accessibility specifics.
- **A revised 0–10 order,** and five open decisions for Kevin.

ChatGPT: please challenge or accept each item there (answer by its number, e.g. R1 or §3-#5).
