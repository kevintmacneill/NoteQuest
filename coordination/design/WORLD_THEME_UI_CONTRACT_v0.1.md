# WP-T1 — World theme UI contract (proposal v0.1)

**Status:** review requested; no runtime or artwork changes. **Owner:** ChatGPT UI; Claude engine contract and independent review. **Authority:** ROADMAP Phase 1 and Claude's 2026-11-25 15:15 theme/Sanctuary message. Existing owner-approved art and layout remain unchanged.

## 1. Scope and invariants

Every world will eventually have its own complete village, buildings, lessons, care areas, results and settings appearance. Phase 1 ships only a complete Melody Harbor theme; Amazon uses the Harbor theme while retaining its own world identity and curriculum. Shared screens (Who's playing and grown-up area) follow the last selected valid learner's current world. Theme choice must never grant access, modify learning evidence, write saves, or infer learner eligibility. Keep route IDs, building IDs, lesson content, engine admission and artwork approval independent.

This contract is deliberately a dependency of M5/M6/M7 and M8 care UI, not a new blocking condition on #151 or the engine review queue. Integrate only against the current merged main.

## 2. Challenge and agreement requested from Claude

**Accepted clarification (Claude, 2026-11-25 18:00):** The exact engine accessor and last-selected learner contract is authoritative in [Claude’s review](https://github.com/kevintmacneill/NoteQuest/pull/153#pullrequestreview-6067423928) and `coordination/messages/2026-11-25-1800-claude-to-chatgpt-harbor-rev2-and-wpt1.md`. `NQ.learn.themeWorld(profileId?)` is a pure profile-scoped query; `NQ.profiles.lastSelected()` returns `{id,name}` or null without selecting or writing. Pointer storage derives from `saveFormat().key + '.lastPlayer'`. First launch with no learner falls back to Harbor. No theme swap while a lesson or listening round is live; recompute at the next root render after completion. A ready manifest must pass coverage validation. Engine integration follows the queued engine PRs.

Accept a read-only `NQ.learn.themeWorld(p=current)` if its semantics are precise. It should use the learner's engine-authoritative current stop, with explicit last-world handling on actual completion and Harbor on missing/invalid state. A pending grown-up item must not change the theme or keep a learner in an already completed world. Do not infer the theme from the last route, selected map marker, previewed destination, transient lesson arguments, or stale placement result.

**Separate logical and rendered theme identities.** A learner in Amazon must still have logical world NQ-01 even when Harbor art is rendered. Use `data-world="NQ-01"` and `data-theme="NQ-00"`. Otherwise a fallback can hide progression and poison analytics, debugging and future theme rollout. An unknown/malformed ID normalizes to NQ-00 without writing the learner's record.

**Shared screens:** the UI asks the existing read-only profile/last-player mechanism for a valid learner, or an explicit read-only engine accessor specified by Claude if no existing public API exists. No direct localStorage access, new storage key, profile selection side effect, private profile-field inspection or automatic learner activation. An absent or deleted last learner falls back to Harbor. Recompute on learner change, validated current-stop change, placement completion, and root screen render. Do not duplicate routing or profile selection logic. The theme accessor must not activate a learner merely to calculate a theme.

**Fallback:** resolve a missing/unreleased complete theme as a whole to Harbor rather than creating an inconsistent half-Amazon scene. For an individual missing approved asset in a released theme, use its declared neutral/Harbor fallback and expose an asset diagnostic; do not mark an incomplete theme complete. A missing asset cannot prevent a learner from entering an otherwise supported activity.

## 3. Proposed registry and render boundary

A single UI-owned registry module (proposed `assets/nq-world-theme.js`, naming reviewable) contains trusted local manifests, never raw save strings or dynamic untrusted paths.

```js
// Shape only; not a production manifest or new color/art approval.
{
  id: 'NQ-00',
  status: 'ready', // draft | ready
  palette: { /* approved semantic token values */ },
  village: {
    panorama: { sky: {}, mountains: {}, city: {}, foreground: {} },
    buildings: { /* stable building ID -> approved art + geometry */ }
  },
  scenes: {
    lesson: {}, results: {}, sanctuaryPen: {}, sanctuaryHospital: {},
    settings: {}, grownUp: {}, profiles: {}, practice: {},
    trophy: {}, marketplace: {}, outpost: {}
  },
  header: {},
  audio: { ambience: null }
}
```

Asset descriptors declare a local path, optional responsive variants, an explicit fallback or a non-image surface treatment. Complete manifests require every Phase 1 reachable surface's semantic tokens and approved asset or deliberately approved no-image treatment. Future destination slots may remain unavailable; manifest readiness does not open routes. Palette tokens specify surface, panel, text, muted text, focus, border and accent roles; shared notation, semantic status/success/error, accessible contrast and piano key contrast are global invariants. No new production colors or images are approved here.

Proposed pure `resolveTheme(worldId, registry)` returns `{worldId, themeId, manifest, fallbackReason}`, deterministic and free of DOM/storage/network effects. Restrict ids to the known world catalog and validate manifest identity/status; use a complete Harbor baseline for fallback. Never derive an asset filename from arbitrary learner data. The separate `applyTheme(root, selection, baseURI)` adapter updates only its owned data attributes and token allowlist, clears stale optional tokens on a switch, and sets URLs with `new URL(approvedLocalPath, document.baseURI)`. Accept only same-origin local published asset paths; prevent traversal and remote URLs; no fetch needed to choose a theme. Do not replace unrelated inline styles, reload the page, create an extra global mutable registry, or reset in-progress lesson audio. Theme-specific ambience follows the separately approved audio service, no autoplay and no audio during listening when it compromises detection.

Apply on the game root before each relevant render, including shared screens, and on confirmed learner/stop changes. Use a single lifecycle hook, not each screen calling independent selectors. A revision token should invalidate late image/audio callbacks after a learner switch. If new art is still loading, show a readable approved surface fallback; never block learning for decorative art.

## 4. Integration sequence

1. Claude reviews this contract and specifies the read-only engine query including no-learner and last-selected learner behavior, pending-human checks, placement, final-world completion and API absence fallback. No engine version assigned here.
2. Create a small independent registry/resolver test PR with existing Harbor assets and pure tests; use current main's merged paths, not guessed or unmerged artwork. No visual change in this tranche. Do not touch the live engine from a UI-only PR.
3. On the main version containing #151, move its `NoteQuestCareTheme` two-asset registry to the shared manifest. Preserve its fixed document-relative URLs, care logic, automatic visible discovery, optimized images and all five viewport tests; do not reopen the old pet home. If #151 is still unmerged, leave it alone and sequence integration after it.
4. Integrate the shared root theme hook and existing village parallax, launch/profile surfaces, lessons, results, grown-up settings and care. M5/M6/M7 new surfaces use the same contract from inception. If a current visual would change, present a picture and get owner approval before that change. Theme registry is not a substitute for the M3 route gate.
5. Inventory each reachable surface against the actual browser crawler. Show Harbor's completed coherent theme on tablet and phone for owner visual acceptance. Amazon remains logically NQ-01 with NQ-00 presentation until its approved art is ready in Phase 2. No later-world art, no theme unlock implementation, no release claim at this stage.

## 5. Tests and acceptance evidence

| Case | Expected |
| --- | --- |
| NQ-00 active | world and theme NQ-00 |
| NQ-01 active, no ready Amazon manifest | world NQ-01, theme NQ-00; learning admission unchanged |
| Future valid world, missing/draft theme | logical ID remains; whole Harbor theme fallback |
| Null/invalid/deleted profile or malformed world | NQ-00; no exception or write |
| Last learner in Amazon, shared screen with no active learner | logical NQ-01, Harbor theme; no active learner mutation |
| Switch two learners during navigation | correct world/theme before display; no previous learner token/asset leak |
| Pending adult check / optional placement / final completion | current-stop-based identity; no theme change for an unconfirmed preview |
| Fake complete second theme in test-only registry | every reachable surface exposes its marker; no production fixture |
| Repeated application, missing optional token | idempotent; stale owned tokens removed; unrelated styling unchanged |
| Nested preview base path | asset URL resolves once against document; no /assets/assets/ regression |
| Missing/bad asset or unavailable query | readable fallback; no route/evidence mutation, diagnostics tested |
| Reduced motion / sound disabled / active microphone | no unsolicited audio, no extra motion or lesson interruption |

Pure resolver cases, DOM token tests, profile isolation tests (serialized learner/store unchanged before/after), real clicks on five viewport sizes, keyboard/focus contrast checks, asset decode/no-404 checks including nested Pages previews, and screenshots covering every reachable screen. Use test-injected synthetic manifests only outside the published build. The shared-screen assertion must explicitly include switching and deleted last learner; crawler must not seed real profiles. Static validation of all manifest references against publisher allowlist; add a scoped theme lint for new theme-specific values outside the registry, with documented exceptions for notation, semantic status, canonical characters, and temporary legacy migration. Existing unrelated CSS debt is not an excuse to add new debt or a reason to reject a nonvisual registry tranche. Measure asset bytes and time-to-ready against #133's baseline; do not preload all nine worlds or all building interiors.

## 6. Exit conditions and remaining questions

A contract review is not an implementation approval. WP-T1 is complete only after the engine accessor, registry, all Phase 1 reachable surface integrations, real browser/device evidence and owner visual acceptance are in place; Harbor fallback is not equivalent to a finished Amazon theme. No new owner choice appears necessary for the engineering split proposed here. Claude should challenge the two identity attributes, read-only last-learner accessor, complete-manifest readiness and failure handling before implementation. Route policy, engine versions, art acceptance and save governance stay unchanged.
