# NoteQuest — Village Destinations & Encore Proposal v0.1

**Date:** 2026-11-22 · **Author:** ChatGPT (curriculum/visual UX) · **Status:** PROPOSAL FOR KEVIN, **not** an accepted building assignment, feature authorization, engine API, or merge approval.

**Sources:** [Feature Map v1.0](NOTEQUEST_FEATURE_MAP_v1.0.md), [Title-to-City Overlook UX v1.0](TITLE_TO_CITY_OVERLOOK_UX_v1.0.md), owner directions in the 2026-11-22 conversation. The feature map is an inventory and explicitly leaves buildings and ideas undecided.

## Non-negotiable product hierarchy

**Learning piano is the product.** Rewards and pets are motivation, not alternate progression. After **Tap to Play**, the camera pushes past the two adventurers into their first-person overlook of the city. This is a *new* wide painted city panorama, not the title/loading valley picture (which has baked-in loading text), and not the rejected vector/plaza stand-in. No floating user-interface sign should obstruct a landmark.

Immediately visible at all viewport sizes, including 390px portrait: **Continue Adventure**, **My Journey**, **Lessons**, **Practice Games**, **Music Library**. A short persistent learning dock may replace some tiny building labels on phones. Secondary areas become visible through horizontal panning (or accessible direct navigation). Keep the core learning destinations visible *without* dragging.

## Proposed landmark assignment, pending owner acceptance

| Village landmark / treatment | What opens | First-view placement | Why |
|---|---|---|---|
| **Central Adventure Gateway / illuminated route marker** | **Continue Adventure**, dynamically targeted to the next suitable learning activity | Center and strongest action, default focus | The daily action, not the entire world map. No-history learner begins in Melody Harbor; later use actual progress/recommendations, not a guessed destination. |
| **Music Academy** | **Lessons** inside the learner's current world; future skill-check/recommended practice embedded here or surfaced by Continue | Center-left | Learning new material and assessing it are one learning workflow, not separate cities. |
| **Practice Hall** | Existing/reworked practice-games menu, targeted exercises | Center-right | Repetition serves mastery. Do not expand the number of buildings as games expand. |
| **Music Library / conservatory** | Music Reference, searchable glossary, scales/chords, adjustable metronome, songs; future MusicXML import and personal sheet-music shelf | Visible on learning district's edge | Resource hub becomes compelling with a learner's own music. Upload is a shelf/function, **not** a building. |
| **World Gateway / map observatory** | **My Journey** nine-world map; readiness challenges occur at world transitions | Clearly visible behind central gateway | Exploration of world progress differs from the current next action. Journey Readiness is a gate within the journey, not a separate building. |
| **Learner badge / progress sign at overlook rail** | Child's music **Progress** with strengths, next skill, favorite song (future) | One-tap from learning area, not a competing building | Feedback is frequent, but need not consume a landmark. Child-facing progress must differ from rescue Field Journal. |
| **Companion Sanctuary** | Pet Home, care, active companion selection, bond/personality, companion pages | Side district requiring exploration | Important engagement, but no piano mastery shortcut. Do not equate fixed pictured cat with the learner-selected companion. |
| **Village Market** | Shop, food, supplies, decor | Side district | Currency use is supporting motivation. |
| **Explorer's Outpost** | Wildlife expeditions, rescue missions, wildlife Field Journal | Side district | Adventure side story; distinct from nine **music** worlds. |
| **Memory Garden / Celebration House** | Sticker Book, achievements, world encore badges and collections | Side district; can be nested in sanctuary if crowding | Celebrate earned outcomes without drawing attention from practice. Use **Sticker Book** for today's actual page, not an unlabeled promise of Achievements. |
| **Grown-up settings symbol**, not a building | Settings, analytics, learner administration, privacy controls | Consistent header or overlook edge | Preserve 3-second hold before controls that can change/delete profiles. |
| **Learner switch** | Profiles | Consistent header | Important navigation; no building needed. |

**No standalone buildings for:** skill-check test (#97), usage analytics (#98), uploaded sheet music (#99), practice-game subtypes (#101), easter eggs (#102), Prestige/Encore (#103), companion personality journal (#104), favorite song (#105), or guide character (#106). These are embedded experiences, content, or hidden interactions. A guide dragon may *appear* in the environment and offer contextual teaching without owning a mandatory building or replacing the chosen pet.

### Placement without reducing access
- Side districts may extend beyond initial view left/right; use gesture/pointer pan with clear directional hints and a **Return to Learning** control.
- Give keyboard and screen-reader users a direct destination list; no feature is accessible *only* by drag. Reduced-motion users skip the push-in.
- Keep hotspots anchored to landmarks, not baked into painting; align on 390/820/1280 widths and preserve touch targets/focus order.
- Do not label unreleased areas as playable. Offer coming-soon affordances only when they make sense and cannot block the piano path.

## Proposed behavior: Continue Adventure

1. If a world lesson/check has a genuinely resumable state, resume that.
2. Else if a recent assessment has an actionable verified recommendation, go to its matching lesson/practice.
3. Else route to the next available learning stop in current world.
4. For first-time learners, start with Melody Harbor's beginning. Never send a novice by default to the nine-world selection page.
5. An assessment must not infer learned skill merely from time on screen, coins, pet care, or exploration. Journey Readiness rules J1–J4 remain separate.

This is **product logic to review with engine owner Claude** before implementation, not an engine API instruction.

## Prestige idea for ages 5–7: “Encore Adventures”

**Recommendation:** Use the child-facing name **Encore Adventure** or **Golden Encore**, not “Prestige.” Older users may see “Mastery Encore.” Optional post-world mastery, **never a reset**.

### First-world example
- A learner completes Melody Harbor under ordinary requirements and can travel onward. No extra fee, coins, or hold.
- At its world gateway a small gold music-note icon appears: “Want to play an Encore?” (picture-first; spoken instructions when voice is eventually enabled).
- A short **3-part, 5–8-minute** optional musical encore tests *transfer*, not simply replaying the exact answers: (1) recognize a taught note on a new card or register, (2) clap/tap a familiar rhythm in a new pattern, (3) play a tiny learned phrase/skill on a real piano or use a suitable grown-up-confirmed route **only where approved assessment rules permit**. The exact content/difficulty must be authored from the world's skill data and independently validated; these are examples, not final tests.
- Success awards a **Golden World Seal** and a cosmetic flourish on the learner's world map or journal. It does not unlock worlds earlier, change grades/placement, boost companion bond unfairly, or replace J1–J4 evidence.
- If they struggle: “Great practice! Try again another day.” Show targeted suggestions, let them leave, and preserve normal world completion. No lost stars, progress reset, streak penalty, timers, mandatory grinding, or leaderboard.
- Encourage replay by **variety** (different musical examples) rather than repetition targets. Badges belong to the learner profile; do not share between siblings or devices unless the existing save-sync mechanism carries them.

### Suggested release conditions (not yet accepted)
- **Phase 0:** Reserve Encore as a future idea; no engine code. Close no issue.
- **Phase 1:** After the complete first world is truly playable, design one pilot Encore with child observation and grown-up usability feedback. Gate evaluation and pass rule must be approved separately from Journey Readiness; do not manufacture a score from the examples above.
- **Phase 2:** Expand per-world only if the pilot improves practice rather than distracting from it.
- No special building; world-specific Encore starts at each *completed world's* gateway and is recorded in Progress/Memory Garden.

### Decisions for Kevin (not presumed)
1. Accept or change the landmark assignment (particularly whether the **World Gateway** and **Continue Gateway** are two visually distinct landmarks).
2. Should the child-facing celebration location be **Sticker Book**, **Memory Garden**, or another word?
3. Keep “Prestige” parked in favor of an optional no-reset **Encore** pilot when the first world is ready?

## Build/review boundaries

The **#69** menu is still held for the final scrollable city overlook; its current art and corrected Settings/Progress behaviors do not constitute final art approval. **#70** title-to-overlook loading transition remains a separate issue/workstream. Fix and independently verify current-head blockers, preserve save/profile safety, and do not merge without required exact-head review and green CI. Claude remains paused; this proposal does not reactivate him.

**Out of scope:** approving the ten idea issues, changing engine APIs, altering J1–J4 mastery, modifying main game code, or deciding the above owner questions.
