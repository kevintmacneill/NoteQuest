# NoteQuest — Visual Style Guide

**Version:** 0.1 (first working art-direction standard)  
**Date:** 2026-11-20  
**Status:** Working visual direction chosen by owner delegation; iterative, not permanently frozen  
**Design owner:** ChatGPT · **Software/engine implementer:** Claude · **Product owner:** Kevin  
**Applies to:** NoteQuest interfaces, world map, art, animals, rewards, music-learning surfaces, and future creative assets  
**Scope:** Documentation only. This file does not authorize code changes or merges.

## 1. Brand personality and emotional target

NoteQuest is **adventurous, musical, encouraging, magical, friendly, clean, and playful without being babyish**. It welcomes learners with different ages, reading abilities, and piano backgrounds. The emotional target is: *"I'm stepping into a musical adventure that is welcoming, exciting, and easy to understand."*

Micaela and Zoe are pilot learners, **not the audience limit**. A teenager or adult should feel welcome using the same platform. Presentation can adapt without changing the underlying musical curriculum.

## 2. Core visual identity

**Direction:** Twilight storybook adventure. Combine a deep twilight-indigo app shell, warm cream/paper learning surfaces, bright but disciplined reward accents, storybook environments, rounded controls, and expressive character animation.

**One-sentence identity:** *A storybook piano-learning adventure wrapped in a magical twilight world.*

**Rule:** The app shell is the adventure world; the lesson panel is a calm, readable learning space. Decorative art must never obscure notes, instructions, or answer targets.

## 3. Core brand palette

| Role | Token name | Hex | Purpose |
|---|---|---|---|
| Primary dark | Midnight Quest | \`#1E2248\` | Main shell, headers, dark backgrounds |
| Secondary dark | Storybook Indigo | \`#38407A\` | Secondary dark panels, navigation |
| Highlight | Starlight Blue | \`#6C8DFF\` | Active navigation, links, highlights |
| Reward | Quest Gold | \`#F5C84C\` | Stars, rewards, primary actions |
| Success | Adventure Teal | \`#34C6B3\` | Correct answers, growth, progress |
| Warm accent | Melody Coral | \`#FF7B6B\` | Energetic accents; carefully distinguished error states |
| Magic accent | Wonder Pink | \`#F58ACF\` | Fantasy, collectible, special moments |
| Light surface | Music Paper | \`#FFF8ED\` | Sheet music, lessons, activity panels |
| Light-surface text | Ink | \`#2A2340\` | Primary text on light backgrounds |
| Secondary text | Muted Ink | \`#5E5873\` | Supporting text on light backgrounds |

**Additional implementation surfaces (working examples):** dark card \`#2A3161\`; light card \`#FFFDF8\`; light border \`#D9CDBB\`; dark border \`#5660A8\`; text on dark \`#FFFFFF\`; supporting text on dark \`#D8DDF8\`.

**Functional companions:** success-light \`#BDF2E7\`; warning-light \`#FFF1BE\`; error \`#E86A64\`; error-light \`#FFD9D6\`; info-light \`#DDE6FF\`; locked \`#9AA0B5\`; disabled background \`#E3E5EC\`.

**Color semantics:** Gold = rewards and important calls to action; teal = success and completion; blue = selected/informational; coral/red = mistake/important caution; pink = magical/fun. Do not use color as the only signifier; pair states with labels or shapes.

## 4. Nine world accent identities

Accent colors are **local signatures**, never replacements for the global interface tokens.

| Level | Destination | Primary accent |
|---|---|---|
| NQ-00 | Melody Harbor | Sea glass \`#69D2C3\` |
| NQ-01 | Amazon Rainforest | Jungle leaf \`#4FAE5A\` |
| NQ-02 | African Savanna | Golden grass \`#DDAE4B\` |
| NQ-03 | Australian Outback | Red earth \`#C96A4A\` |
| NQ-04 | Polar Expedition | Glacier blue \`#78BFD9\` |
| NQ-05 | Coral Reef | Reef aqua \`#49D2D0\` |
| NQ-06 | Himalayan Mountains | Pine green \`#4E7B61\` |
| NQ-07 | Space Station | Neon cyan \`#59E3FF\` |
| NQ-08 | Grand Music City | Velvet plum \`#5A3B7A\` |

Secondary regional colors (working art references, not mandatory UI colors):

- **Melody Harbor:** Harbor sky \`#A9D8FF\`, sand \`#F4D59B\`, coral trim \`#FF8C7A\`.
- **Amazon Rainforest:** Deep leaf \`#2F7A3C\`, river blue \`#58B8D6\`, orchid \`#D86ACF\`.
- **African Savanna:** Earth clay \`#B66F44\`, acacia green \`#6E9B52\`, sunset \`#F08A4B\`.
- **Australian Outback:** Dust peach \`#E9B089\`, desert sky \`#7AB8E6\`, bush green \`#7A8F4F\`.
- **Polar Expedition:** Ice blue \`#BEE7F7\`, snow \`#F8FCFF\`, aurora violet \`#9C8BFF\`.
- **Coral Reef:** Coral pink \`#FF8FA3\`, ocean teal \`#2B9DB0\`, shell \`#FFF1DC\`.
- **Himalayan Mountains:** Sky \`#8EC5F5\`, stone \`#8C93A8\`, prayer-flag red \`#D95C5C\`.
- **Space Station:** Space navy \`#171B3A\`, electric purple \`#8F74FF\`, signal magenta \`#FF7AD9\`.
- **Grand Music City:** Stage gold \`#E3B347\`, marquee cream \`#FFF4D6\`, spotlight blue \`#6D9BFF\`.

A consistent illustrated style, navigation frame, and reward language should unify all nine locations.

## 5. Typography

Use rounded, warm, highly legible sans-serif typography. Headlines may be playful; lesson explanations must be calm and easy to parse.

- **Headings:** bold and short; welcoming, never excessively decorative.
- **Body:** clear letterforms, comfortable size, short phrases, good spacing.
- **Controls:** large labels with clear actions.
- **Pre-reader mode:** icons/images and consistent placement first, but do not assume pictures alone replace narration in all lessons.
- **Older learners:** respect their reading ability and prefer a mature content treatment while retaining the same brand.

**Working implementation note:** The current app already uses *Fredoka*. Reuse may be appropriate, but final font choices and offline behavior should be checked during UI component design. Do not introduce new runtime font dependencies through this document alone.

## 6. Shape language and outlines

Favor soft geometry: rounded cards and panels, pill buttons, circular badges, curved speech bubbles, approachable touch targets. Avoid sharp corporate boxes and excessive sci-fi angles outside purposeful Space Station set dressing.

**UI borders:** restrained contrast; stronger boundaries around interactive elements; soft layering for instructional cards.

**Illustration outlines:** clean, confident dark edges that remain readable at tablet scale; avoid ultra-thin outlines. Art should feel cohesive, expressive, and gently toy-like.

## 7. Illustration language

**Target:** storybook cartoon, not photorealistic or realistic 3D.

- Stylized but recognizable anatomy and species silhouette.
- Expressive eyes/faces and meaningful poses.
- Flat-to-soft-shaded or cel-shaded treatment; moderate detail and clear color grouping.
- Original art only—no copied licensed characters, branded shows, or franchise designs.
- Retain recognizability across thumbnail, world map, rescue view, and full-size character.
- Favor visual personality over realism; friendly but not infantile.

Existing pets, rainforest rescues, the explorer, unicorn, and capybaras are starting subjects for future art review, **not automatically approved final models**.

## 8. Character and animal standards

Every creature should have a clear silhouette, species-recognizable details, friendly expression, consistent proportions, and a small usable emotional range: happy, curious, worried, excited, relieved, sleepy, and proud.

Expressions should directly support the rescue or learning context. Never make a rescue scene frightening or visually punishing. Avoid over-reliance on distressed animals as motivation. Visual states should remain understandable even when animated motion is reduced.

## 9. Motion and feedback

Motion vocabulary: gentle bob, bounce, hop, sway, pop, blink, sparkle, soft wiggle, celebratory burst.

- Brief, purposeful motion supports comprehension and emotional feedback.
- Do not animate every UI element continuously or obstruct reading.
- Use restrained celebration for ordinary correct answers, stronger celebration for meaningful mastery.
- Provide reduced-motion treatment and a way to avoid repetitive movement in later implementation.
- Avoid casino-like reward effects, rapid flashing, or constant attention capture.

Animation is a feedback layer, not the main learning objective.

## 10. Application shell and learning surfaces

**Shell:** Midnight Quest/Storybook Indigo, welcoming titles, map/adventure atmosphere, stable navigation.

**Lessons:** Music Paper or similarly calm light surfaces, Ink text, minimal decoration, clear prompts and answer targets.

**Default information priority:**
1. Current musical task/question.
2. Answer choices or real-piano action.
3. Feedback on what happened.
4. Practice/progression context.
5. Optional secondary actions.
6. Decorative art and background effects.

Use background illustrations as framing. They must not compete with staff lines, noteheads, keys, rhythm indicators, or written explanations.

## 11. Buttons and controls

**Personality:** large, obvious, tactile, cheerful, and readable on a tablet.

- **Primary action:** Quest Gold; working gradient top \`#FFD96A\`, bottom \`#F5C84C\`, dark label \`#4A3200\`. Use for Start, Continue, Play, Rescue, Next.
- **Secondary action:** Adventure Teal; top \`#7EE5C3\`, bottom \`#34C6B3\`, dark label \`#073C36\`. Use for Practice, Retry, optional positive action.
- **Magic/special action:** Wonder Pink family; top \`#F7B4E1\`, bottom \`#F58ACF\`, dark label \`#5A1F4E\`. Use selectively for fantasy and special collectibles, not every feature.
- **Neutral/ghost:** light or transparent fill with border; e.g. \`#FFFFFF\` with \`#D9CDBB\` and \`#2A2340\` on light surfaces. Use for Back, settings, less-prominent actions.
- **Destructive/error:** clearly differentiated coral-red family with text/icon confirmation. Never confuse an error message with a celebratory accent.

Design exact states (default, pressed, focused, disabled, busy, success, error) in the upcoming **UI Component Style Guide**. Do not assume a color swatch guarantees sufficient contrast; test combinations.

## 12. Icons

Use a consistent rounded, simple icon family, readable at small scale. Typical concepts: notes, keys, compass/map, animals, treasure, supplies, stars, coins, hearts, trophies, progress, speech bubbles, and practice.

Prefer recognizable symbols over dense detail. Avoid mismatched stroke weights and too-thin enterprise iconography. Every critical icon should have an accessible text equivalent where reading is supported.

## 13. Music notation has priority over decoration

Notation is **precision instructional material**, not decorative illustration.

- Clean, high-contrast staff lines, clefs, noteheads, ledger lines, rests, time signatures, accidentals, finger numbers, and articulation marks.
- Music Paper backgrounds without complex texture under notation.
- Correct spacing and alignment are more important than visual novelty.
- Hints may use color temporarily; the learner must also learn standard black notation.
- Correctness and errors must not be signaled only by red/green colors.
- Do not deform noteheads or staff proportions to fit a theme.

## 14. World map and region scenes

The map should feel exploratory, legible, rewarding and geographically/thematically recognizable—whimsical rather than like a dense atlas.

Every location needs:
- a unique mood and distinguishable color accent;
- recognizable visual landmark/silhouette;
- room for curriculum stops, recitals, missions and rewards;
- clear state of locked/available/in progress/completed;
- consistent outline, map framing and navigational logic.

**Nine curriculum levels = nine distinct destinations.** Do not equate the nine-level map one-to-one with Alfred Prep A–F books. Curriculum alignment lives below the location presentation.

## 15. Reward and progression visuals

Rewards may use stars, stickers, coins, sparkles, unlock glows, and collectible visuals. Visual tone: encouraging and satisfying, not noisy or compulsive.

Use Quest Gold for stars and achievements, gold highlight \`#FFE89A\`, coin base \`#F4B93E\` with highlight \`#FFE08A\`, rare gem \`#7C6CFF\`, pink sparkle \`#F58ACF\`, and teal unlock \`#7EE5C3\` when needed.

Progress must reflect **real musical growth**, not solely the pet economy or arbitrary tapping. Reserve bigger moments for meaningful mastery.

## 16. Accessibility and different learner ages

- Large touch targets and easy-to-distinguish controls for mobile/tablet.
- High-contrast text and visible navigation/interaction states.
- No color-only meaning; use icon, shape, text, or other parallel feedback.
- Reading supports the learner; inability to read must not block initial exploration.
- Use adaptable presentation: illustrated/simple for non-readers; more restrained/informational for adults.
- The product must not hard-code identities, ages, or assumed ability to specific named users.
- Spoken prompts remain **on hold** by owner decision. This document does not claim autonomous instruction is already accessible to pre-readers.

In UI implementation, verify contrast, focus visibility, font scaling, touch size, and reduced motion rather than assuming the selected palette is sufficient.

## 17. Different screens, different emotional emphasis

| Screen type | Feeling | Design response |
|---|---|---|
| Home / profile | Welcoming | Big recognizable profiles and clear entry |
| Lesson | Calm, guided | Paper surfaces, minimal decorative motion |
| Practice/game | Focused, responsive | Strong interaction hierarchy, quick feedback |
| World map | Exploratory | Distinct destinations and obvious progression |
| Animal rescue / pet | Caring, memorable | Expressive original characters and controlled motion |
| Reward | Proud, delightful | Gold/teal accents, brief celebration |
| Grown-up/dashboard | Informational | Same brand, less decoration, cleaner charts |

## 18. Things to avoid

Avoid:
- generic corporate SaaS aesthetics;
- all-neon or visually chaotic screens;
- preschool-only styling across the entire platform;
- photorealistic or gritty/realistic 3D characters;
- dull worksheet aesthetics without personality;
- mismatched art styles and icon packs;
- tiny controls and unreadable text;
- too many competing accent colors per screen;
- decorative elements hiding the core musical task;
- continuous distracting animation or reward overload;
- copied media franchises, characters, or branded artwork.

## 19. Quality bar and review checklist

Before an art asset or UI screen is considered ready, confirm:

- **Musically useful:** improves the lesson or motivation without changing musical facts.
- **Clear:** current action and next action are obvious.
- **Readable:** especially notation and text on the Samsung tablet.
- **Cohesive:** belongs in the same twilight-storybook universe.
- **Welcoming:** usable by people of different ages and reading abilities.
- **Accessible:** state meaning is not color-only; reduced-motion and touch requirements are considered.
- **Original:** no reused copyrighted characters or franchise references.
- **Technical handoff ready:** asset role, dimensions, animation expectations, and fallback behavior can be specified for Claude.

## 20. Fast implementation reference (NOT code authorization)

- Shell: \`#1E2248\`
- Secondary dark: \`#38407A\`
- Paper lesson surface: \`#FFF8ED\`
- Text on light: \`#2A2340\`
- Text on dark: \`#FFFFFF\`
- Active/blue: \`#6C8DFF\`
- Primary/reward: \`#F5C84C\`
- Success: \`#34C6B3\`
- Warm accent: \`#FF7B6B\`
- Magic accent: \`#F58ACF\`

**Visual formula:** Dark world outside; calm paper lesson inside. Rounded, tablet-friendly controls; original storybook illustrations; music notation is precise.

## 21. Next design deliverables (separate steps)

1. **Repo-ready visual style guide** — this document (v0.1).
2. **UI Component Style Guide** — exact specifications for buttons, cards, tabs, navigation, lesson panels, badges, states, spacing, responsive behavior, and accessibility.
3. **Nine-World Art Guide** — each region's motifs, animals, environmental assets, landmarks, map treatment, and scene/asset inventory.
4. **Logo Direction Guide** — logo concepts, wordmark and icon relationships, sizing, variants, and placement.

The owner has delegated iterative art-direction choices to ChatGPT. **This does not bypass the owner's approval requirement for application code pull requests**. Claude's engine branch remains independent, and integration must respect the future \`ENGINE_API.md\` contract.
