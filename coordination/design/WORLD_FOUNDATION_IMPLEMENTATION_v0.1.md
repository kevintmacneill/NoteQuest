# NoteQuest — World Journey menu and nine level foundations v0.1

**Owner:** ChatGPT (UI and curriculum) · **Review:** Claude independent code review required · **Status:** implementation PR, not merged/approved.

## Purpose
Retain the existing pet habitat and Note Planets minigames, while introducing a dedicated **Music Journey** entry from the sanctuary home screen. Do not rename or override existing wildlife **Expeditions**. The new separate world map shows the full nine-level proposed curriculum NQ-00 through NQ-08 as a read-only preview.

## New menu
- Music Journey — nine world cards, regional intro stories, 70 stops, preview of three skill objectives per stop, and Journey Readiness story.
- Practice Games — existing `VIEWS.games`; no new reward logic.
- Animal Sanctuary — existing `VIEWS.home`; unchanged.
- Music Reference — reserved menu control marked **in review**, intentionally disabled until the separate `chatgpt/music-reference` PR is approved and merged.
- My Progress — planned and not linked to grown-ups controls or falsely populated with sample scores.

## Delivery and source
- `assets/nq-worlds-data-v0.1.js`: generated deterministic reading copy from **curriculum v3.2 review candidate**, nine-world-map-node study and eight transition story scripts. **9 worlds, 70 stops, 210 skill objectives**.
- `assets/nq-worlds-v0.1.js`: isolated UI module, no engine writes, no save mutations, no unlock methods, original simplified SVG world illustrations. Five pages of behavior: home→hub, hub→world, world→stop, world→readiness, route back; plus link to existing playable games.
- `assets/nq-worlds-v0.1.css`: scoped theme, focus, small screen, reduced-motion support.
- `index.html`: adds four namespaced UI routes + one sanctuary button + script/style includes; **`<script id="nq-engine">` byte-for-byte preserved**.

### World page composition
1. Original illustrative scene / unique local setting
2. Clear musical focus and story introduction
3. Six–eight numbered nodes with curriculum-consistent titles
4. Three skill objectives per stop, with authored coaching cue + evidence provenance
5. Preparation for travel and assessment story, without fabricated unlock state or rewards

## Rules
- Free world preview ≠ structured lesson unlock. No `learn.start`, `markLearned`, `coins`, `pets` or private save writes happen in this module.
- If the current learning engine does not contain the v3.2 skill/stop IDs, show a clear **curriculum preview** status. Never map old minigame star counts to new world mastery. When compatible engine data is present, read `NQ.learn.stopStatus` to display provisional engine state; do not claim Journey Readiness entitlement until there is a reviewed API.
- The "Learn → Practice → Prove" explanation does not itself award mastery. The readiness screen is **preview only**, not a quiz or a gate.
- Content is authored for general learners; no profile name hard-coded.
- Original SVG scenery is temporary concept art, not approved final habitat graphics or production pet sprites.
- Keep any future signed-off world IDs and stop IDs stable for save compatibility.

## Review gate
Claude review on PR: route and browser smoke test, two profiles, no direct engine mutation, missing/new engine API fallback, keyboard-only activation, phone widths 390px, tablet portrait/landscape, no accidental ability to bypass Journey readiness. A browser visual regression test and user approval are still required.
