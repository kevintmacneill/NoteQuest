# NoteQuest — UI Component Style Guide

**Version:** 0.1 (working design specification)  
**Date:** 2026-11-20  
**Owner:** ChatGPT (visual/UI design) · **Engine:** Claude · **Approvals:** Kevin  
**Status:** Working design direction; adjustable after real-tablet review  
**Related authority:** [Visual Style Guide v0.1](VISUAL_STYLE_GUIDE_v0.1.md), [NoteQuest Build Plan](../PLAN.md)  
**Scope:** Design documentation **only**. This does not change the app, authorize a merge, define engine behavior, or supersede the pending engine API.

## 1. Visual thesis

**The adventure outside; the music inside.** Use a deep twilight shell, warm paper lesson panels, rounded tactile controls, expressive original illustrated art, and focused musical interaction. Reward moments may be bright; actual instruction remains calm. Every learner profile, from a non-reader to an adult, uses the same underlying curriculum with presentation appropriate to reading ability, skill, and preferences—not a hard-coded identity or age.

### Core palette and semantic tokens

| Token | Value | Intended meaning |
|---|---|---|
| `--nq-bg` | `#1E2248` | Midnight Quest shell |
| `--nq-panel-dark` | `#2A3161` | Dark cards |
| `--nq-indigo` | `#38407A` | Secondary shell and navigation |
| `--nq-paper` | `#FFF8ED` | Lesson sheets and light cards |
| `--nq-paper-strong` | `#FFFDF8` | Raised light surfaces |
| `--nq-ink` | `#2A2340` | Text on paper |
| `--nq-ink-muted` | `#5E5873` | Secondary text on paper |
| `--nq-white` | `#FFFFFF` | Primary text on dark |
| `--nq-white-muted` | `#D8DDF8` | Supporting text on dark |
| `--nq-gold` | `#F5C84C` | Primary action, stars, rewards |
| `--nq-teal` | `#34C6B3` | Success, completed, secondary action |
| `--nq-blue` | `#6C8DFF` | Selected/active/helpful |
| `--nq-coral` | `#FF7B6B` | Fun warm accent; not the sole error indicator |
| `--nq-pink` | `#F58ACF` | Magic and special collectible accents |
| `--nq-error` | `#E86A64` | Error emphasis with ink-colored text or dark outline |
| `--nq-locked` | `#9AA0B5` | Locked visual treatment |

**Contrast specification:** Aim for WCAG AA at minimum: 4.5:1 for normal text; 3:1 for large text and essential visual boundaries. Calculated examples: white on Midnight Quest ≈15.2:1; Ink on Music Paper ≈14.1:1; `#4A3200` on gold ≈7.6:1; `#073C36` on teal ≈5.8:1; `#5A1F4E` on pink ≈5.4:1. **Do not use white normal-size text directly on Starlight Blue (≈3.1:1) or Melody Coral (≈2.5:1).** Use dark text, stronger surfaces, or a verified darker variant. Always check real composited/gradient states before accepting them.

**World accents:** The nine locations have unique accent palettes in the parent visual guide. Use those in banners, illustrated scenes, trim and location-specific graphics—not as unverified replacements for primary button, text or status semantics.

## 2. Sizing, grid, and spacing

Use a consistent **4 px base unit** with this design scale:

| Token | Pixel size | Typical use |
|---|---:|---|
| `space-1` | 4 | Tight icon alignment |
| `space-2` | 8 | Small internal groups |
| `space-3` | 12 | List and compact gutters |
| `space-4` | 16 | Default card padding, gaps |
| `space-5` | 20 | Larger controls |
| `space-6` | 24 | Major section padding |
| `space-8` | 32 | Separation between page sections |
| `space-10` | 40 | Reward and map feature spacing |

- **Screen gutters:** 16 px narrow layouts, 24 px normal tablet layouts, optionally 32 px in spacious landscape layouts.
- **Main content:** fluid; max width ~1080 px for general app composition. Keep notation/practice activity narrower when that aids attention; do not force a desktop-width sight-reading line.
- **Cards:** 12–24 px internal padding based on density. Rounded corners 20–24 px; feature cards 26–28 px.
- **Small controls and tokens:** radius 12–16 px; primary buttons and tags may use 999 px pill radius.
- **Outlines:** usually 2 px; illustrated rescue/action cards may use 3 px for legibility. Avoid shadows replacing visible boundaries.
- **Smallest intended touch target:** 48×48 CSS px; **primary practice choices:** preferably 60–72 px or larger. Spacing between adjacent controls at least 8 px where practical.

## 3. Type hierarchy

Use Fredoka as the **working heading/display family** to align with the existing game, with suitable locally available sans-serif fallbacks. Use a very readable sans-serif for extended explanations. Final offline font packaging is an implementation decision.

| Style | Working size / line height | Weight / role |
|---|---|---|
| Hero title | 36–44 / 1.1 | Bold; only on destination and home views |
| Page title | 26–30 / 1.2 | Bold |
| Section title | 22–24 / 1.25 | Semibold |
| Card title | 18–20 / 1.3 | Semibold |
| Body / instruction | 17–19 / 1.4 | Regular/medium |
| Supporting text | 15–16 / 1.45 | Regular |
| Secondary metadata | 14 / 1.4 | Regular; non-critical only |
| Oversize note/answer | 28–40 / 1.2 | Medium/bold; lesson-specific |

Never use tiny decorative text for critical instructions. Accommodate tablet OS font scaling, longer translations, and content wrapping. Pre-reader layouts may use short paired icon+word cues; adult-friendly layouts may include more descriptive text and reduced decoration.

## 4. Component 01 — App shell and top navigation

**Anatomy:** full-page twilight background → optional subtle world atmosphere → stable header/back control → screen content → context-sensitive bottom/secondary navigation.

- Keep task content above decorative sky/background layers.
- Header/back target at least 48×48; keep Back in a predictable location.
- Selected screen shown clearly; profile switcher is recognizable but does not leak or mix progress.
- Preserve portrait and landscape compatibility. On landscape tablets use generous horizontal whitespace; do not expand all practice buttons to full width.
- Do not introduce persistent bottom controls that obscure the lower piano keys, mission supplies or sheet music.

**Variants:** compact practice header, world-map header, parent/dashboard header. More restrained decorative density for older learners/parents.

## 5. Component 02 — Buttons

| Variant | Background | Text | Role |
|---|---|---|---|
| Primary | Gold `#F5C84C` (optional light `#FFD96A` gradient) | `#4A3200` | Start, Continue, Play, Next |
| Secondary | Teal `#34C6B3` (optional `#7EE5C3` top) | `#073C36` | Practice, Try Again, positive alternative |
| Special | Pink `#F58ACF` (optional `#F7B4E1` top) | `#5A1F4E` | Magical/special actions (rare) |
| Neutral | Paper/white or deep indigo | Ink or white respectively | Back, settings, optional actions |
| Destructive | Light error surface `#FFD9D6` | Ink `#2A2340` | Reset/delete only with confirmation |

**Default:** 54–58 px height, 16–22 px horizontal padding, clear pictogram optional, label required for readers. **Large learner CTA:** 64 px+ height. **Compact icon button:** 48–52 px square, accessible name mandatory.

**State requirements:** default, hover where available, pressed (slight visual depression; no layout jump), keyboard focus with visible contrasting ring, disabled with legible reason where needed, loading without duplicate actions, success/feedback. A disabled control must not look like a broken/unresponsive control. Do not communicate success by background color alone.

## 6. Component 03 — Profile selection

**Card anatomy:** recognizable avatar/illustration → learner display name → optional progress/subtitle. Never hard-code Micaela, Zoe, Kevin, or Erika into the UI. New profile is a clear equal-footing action.

- Avatar tile minimum ~160×150 px in comfortable landscape grid; stack or use 2 columns when narrow.
- For pre-readers, images are essential identifiers; text labels remain visible for readers.
- Switching profiles always goes through the engine/profile API and must not mutate another profile's state.
- Age/readability or instructional presentation is a **preference/placement concern**, not a limit on who may create a profile.
- Adult profile choices should be presented with mature, restrained illustration options as well as playful ones.

## 7. Component 04 — World location / map card

**Card anatomy:** location artwork → name → progress/completion → clear action. Reserve one distinct location for each of the nine NQ levels (NQ-00…NQ-08).

**States:** locked (lock symbol and explanation), available (clear CTA), current (highlight + “Continue”), complete (check mark/stars), revisitable (Practice). Shape and labels must distinguish states without relying on color alone.

- Map pins and landmarks must be large enough to tap.
- Use world accent color only as a local art/trim cue.
- Preserve location geography and art identity; the game data determines actual unlocks.
- Do not present the Alfred Prep A–F book map as synonymous with all nine levels.

## 8. Component 05 — Learning path / lesson stop

**Anatomy:** lesson stop title → single objective → Learn / Practice / Check step status → next allowed action → optional rescue reward.

- Clear distinction between “seen,” “practiced,” and “mastered.” Never award mastery merely because a decorative activity was opened.
- Display prerequisites only when useful; avoid overwhelming beginning learners.
- Use numbered steps and small status icons rather than color alone.
- Keep motivational art to the side of the essential musical activity.

## 9. Component 06 — Lesson instruction card

**Anatomy:** small objective/lesson label → one short instruction → demonstration or staff/keyboard surface → one primary action → optional hint/skip/back.

- Paper `#FFF8ED`; Ink `#2A2340`; 20–24 px corner radius.
- Show one new concept at a time; chunk a long explanation into separate cards.
- Readable piano fingering, labels, and music symbols take priority over narrative art.
- On pre-reader presentation, use familiar paired picture/gesture instructions and allow caregiver assistance until narration is available.
- Optional textual detail can expand for adult learners without forcing every learner through an animated child-facing explanation.

## 10. Component 07 — Staff, note, and piano-response panel

**Music rendering is an accuracy-critical surface.** Use clean light paper with high-contrast staff, clefs, noteheads, ledger lines, accidentals, time signatures, rests, finger numbers, and articulation.

- Never style notes as fuzzy/glowing decorative blobs.
- Keep actual notation proportions and spacing musically accurate.
- If colors highlight a target note or key, also use a shape, position or label cue.
- Allow comfortably large staff presentation on the tablet. Avoid squeezing too many notes into one line.
- The actual **acoustic piano** remains the instructional instrument; tablet keyboard is a fallback/interactive practice widget, not a substitute for real-key playing.
- Microphone listening feedback must indicate listening/permission/problem states accurately, without claiming reliable chord detection or automatic physical-technique evaluation.
- For note-choice buttons, letter/key targets should be at least ~64 px where space allows.

## 11. Component 08 — Rhythm/ear-training interaction

- Present a clear count-in or “Ready” state, then one unambiguous rhythm/tap/hold surface.
- Tap/hold targets minimum ~72 px where practical; avoid accidental neighboring taps.
- Distinguish waiting/listening/recording/evaluated.
- If timing is imprecise due to the device/browser, provide respectful “Try again” feedback instead of asserting a learner was wrong.
- Use minimal animation while active rhythm decisions are being made.

## 12. Component 09 — Progress, mastery, and stars

**Two different concepts must not be conflated:**

1. **Play rewards**: coins, stars, stickers, animal supplies.
2. **Musical competency**: skill evidence, accuracy, recurrence, mastery/placement.

A visually delightful star reward may accompany a level, but it is not by itself proof of technique, musicality, or independent mastery.

- Default progress display: current step and a compact progress bar or segmented completion markers.
- Use check marks and accessible text for complete stages.
- Keep detailed analytics in the dashboard or a “View progress” expansion, not across the main practice screen.
- Visual reward symbols should remain consistent across worlds.

## 13. Component 10 — Feedback and celebrations

| Feedback | Appearance | Copy tone |
|---|---|---|
| Correct | Teal accent + check icon | Encouraging, specific |
| Incorrect / retry | Light warm/error accent + retry icon | Gentle and actionable |
| Needs review | Gold/neutral + practice cue | Informative, never shaming |
| Unlocked | World accent + gold star/check | Brief, satisfying |
| Technical issue | Dark neutral/paper + help icon | Clear workaround |

- In-practice feedback should be quick and quiet.
- Confetti/celebration reserved for meaningful milestones; reduced-motion fallback required.
- Avoid streak-shaming, punitive missed-day visuals, or distressed-character pressure.
- On a pre-reader screen, meaning should be recognizable without reading; voice is not yet implemented.

## 14. Component 11 — Modal, confirmation, and settings

- Use a centered paper/light modal on darkened background, with a clear close option; do not hide a critical control off-screen.
- Destructive actions require explicit confirmation and must identify **which profile** is affected.
- Distinguish Cancel from Delete/Reset by label, emphasis, and location.
- Preserve input focus and predictable back navigation.
- Parent settings and profile records remain separate.
- Do not overwrite or migrate existing saves solely through a UI design change.

## 15. Component 12 — Pets, rescue, and collectible cards

- Character artwork remains the focal delight, but all choices should clearly identify the next action.
- Keep pet state and resource counts distinguishable from musical mastery.
- Rescue items should look like distinct objects, with labels where appropriate and generous targets.
- Use soft expression changes, not frightening scenes or aggressive flashing.
- Asset proportions and rigs are a separate future artwork specification; existing drawn pets are not yet approved final models.

## 16. Component 13 — Dashboard / grown-up view

A quieter version of the same brand: cream data cards, indigo headings, restrained star/teal accents. Show practice minutes, current level, skill strengths, weak spots, and settings where real data exists.

- Do not invent progress/competency from incomplete data.
- Use simple charts with text labels and meaningful zero states.
- Keep profile-specific details isolated.
- Any reset, deletion or cross-device transfer displays clear consequences.

## 17. Responsive behaviors

| Situation | Desired behavior |
|---|---|
| Narrow portrait (<600 CSS px) | Single-column lessons, 2-column maximum for large choices, stacked profile/region cards |
| Medium widths (600–959 px) | Two-column card grid, prominent centered lesson, compact shell |
| Large landscape (≥960 px) | 2–3-column discovery grids; centered/narrower practice surfaces to preserve focus |
| Enlarged system font | Wrap, expand and reflow; do not clip labels under fixed-height cards |
| Reduced motion | Remove constant bobbing/sparkles and nonessential transitions |
| Offline / no font load | Legible system fallback, no critical remote imagery |
| Microphone unavailable | Clear unavailable reason and safe fallback interaction |

These are **working layout guidance**, not binding device-breakpoint code or a promise that every Android browser behaves identically. Check on the actual Samsung tablet.

## 18. Three screen composition recipes

### A. Profile picker
Twilight background; compact logo/title; 2–4 large avatar cards, then **Add player**. A separate grown-up control should remain recognizable without becoming part of a child’s first lesson.

### B. Lesson / practice
Compact header → calm Music Paper instruction card → **large staff or keyboard interaction** → one primary action/hint control → small progression indicator. Avoid showing the coin shop, unrelated animals, or multiple competing CTAs while sight-reading.

### C. World-map screen
Compact map title → illustrated map with **nine geographically/thematically distinct destinations** → current destination highlight → small legend for locked/current/completed → “Continue adventure” action. Locations use their own accents while the global app shell stays indigo.

## 19. UI review checklist / handoff to Claude

Before applying this guide to the UI branch, check:

- Original and readable on real Samsung Android tablet in portrait and landscape.
- Contrast validated for all text, button states and overlays.
- Every action has a touch target and feedback state.
- Curriculum level and profile boundaries are not hard-coded.
- Note notation is accurate and not covered by decoration.
- Real piano listening states are honest about browser/microphone capability.
- Rewards and skill mastery are not treated as the same measure.
- No legacy save keys/codes are silently broken.
- No engine rules or game state mutations are reimplemented in the UI zone.
- Work is confined to the `chatgpt/ui` branch for application code, and subject to Kevin's pull-request approval.
- The engine API contract `coordination/ENGINE_API.md` is not yet published as of this draft; final UI bindings and functional component states must wait for its actual definitions.

## 20. Next design documents

1. **Visual Style Guide v0.1** — published.
2. **UI Component Style Guide v0.1** — **this document, published for iterative review**.
3. **Nine-World Art Guide** — next: setting/landmarks, subject inventory, moods, palettes and consistent asset families.
4. **Logo Direction Guide** — after world art guide: wordmark, icons, sizes and variants.

**Approval boundary:** This is a visual design specification, not an instruction to change or deploy the game. The owner has authorized evolving art direction; app-code merges continue to require Kevin's review.
