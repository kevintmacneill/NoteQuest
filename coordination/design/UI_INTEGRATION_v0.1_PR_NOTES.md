# NoteQuest UI branch — theme/brand integration v0.1

**Commit scope:** UI-zone only. Based on `main` with Engine API 1.1.0, preserving existing engine source byte-for-byte.

## Changes
- Set readable twilight-storybook CSS tokens and warm paper lesson surfaces from the approved Visual Style Guide.
- Added `assets/notequest-theme-v0.1.css` to layer on top of the original inline game CSS.
- Added original compact piano-compass icon `assets/notequest-logo-icon.svg` as an app icon and replaced the profile picker emoji masthead.
- Added keyboard focus states, reduced-motion fallbacks, button contrast and responsive touch targets.
- Left all game rules, earned coins, microphone, saves, event names and current map data unchanged.

## Test design
- Static equivalence check verifies the complete `nq-engine` block is **identical** to its `main` base.
- External stylesheet and icon paths are relative to GitHub Pages repo root.
- No new external network dependencies beyond existing optional Fredoka font.
- Real Android tablet landscape/portrait and visual regression are **not yet executed** in this model environment; Claude must independently test before merge.
- Contrast guideline: avoid white on gold/teal/pink; keep dark foreground as specified.

## Boundaries
- No new pet engine 1.3 calls: that implementation is still being built by Claude.
- No unapproved curriculum v3 data is injected into gameplay.
- Nine-location visual navigation awaits the curriculum engine/data approval.
- The current base app remains playable according to its prior behavior, subject to review.
