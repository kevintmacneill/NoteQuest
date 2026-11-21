# NoteQuest — Logo Direction Guide v0.1

**Date:** 2026-11-20 · **Author:** ChatGPT · **Status:** Working original logo direction; owner review and visual polish welcome.

## Selected direction: The Music Compass

NoteQuest's primary identity combines **an explorer's compass**, a **small piano keyboard**, and an unobtrusive **musical movement/treble motif**. It tells the two-part story: this is a real music education tool, and progress moves across a world of discovery. The motif is original and intentionally avoids copying any Nickelodeon brand, game logo or musical instrument manufacturer's marks.

**Brand attitude:** twilight-storybook; adventurous but not preschool-only. Rich Midnight Quest `#1E2248` and Storybook Indigo `#38407A` behind gold `#F5C84C` letters, teal `#34C6B3` accents, and music-paper highlights `#FFF8ED`.

## Original SVG deliverables
- [Primary horizontal wordmark](assets/notequest-logo-primary-v0.1.svg): 1200×390 viewBox; dark illustrated panel, compass/keyboard crest and gold typography.
- [Compact app icon](assets/notequest-logo-icon-v0.1.svg): 256×256 viewBox; standalone compass/keyboard mark for profiles, app shortcuts and loading marks.
- [Monochrome wordmark](assets/notequest-logo-mono-v0.1.svg): 1100×260 viewBox; single dark-ink mark for grayscale documents and high-contrast print.

All three are **editable source-vector drafts committed in this repo**, not pixel-perfect finished raster graphics or validated mobile app icons.

## Typography and logo rules

Use a warm rounded display face. The SVG uses `Fredoka` with system fallbacks, so final rendering **can change with font availability**. Before final release, decide on a redistribution-cleared display font or convert the approved wordmark outline to original vector paths. Do not share proprietary font files. The app's instructional body font does not need to match the wordmark display face.

**Clear space:** one piano key's width around the compact crest; leave at least half a crest diameter around horizontal wordmark. Use primary logo on dark backgrounds; use the monochrome dark version on Music Paper. Never put busy world illustrations behind a full wordmark.

**Recommended working sizes:** primary logo ~320–520 CSS px wide on splash, compact icon 48–96 CSS px in navigation; at 32 px use only the crest, no small text. For PWA icons, export PNG variants at 192×192 and 512×512 **after approval**, and test mask-safe crops.

## Accessibility and usage

Contrast-test at the intended size, avoid reliance on gold alone to communicate selectable state, and use live text `NoteQuest` as the accessible label wherever the SVG icon is displayed. A logo is not the lesson navigation control. Do not include the logo as artwork baked into every capybara image, soap bottle, or field-journal page; it is a separate brand asset.

## Alternate directions intentionally not selected

- **Book of Notes:** accurate music signal but risks looking like a plain textbook rather than an exploratory adventure.
- **Wildlife badge:** expressive and story-friendly but centers one animal too much for the nine-world piano curriculum.
- **Gold script only:** memorable but weak at icon size and less accessible for younger readers.

## Acceptance checklist

- Reads as **NoteQuest** at tablet and desktop widths.
- Crest recognizable by piano keys and compass even without text.
- Legible on twilight and paper backgrounds.
- Visually supports all nine distinct map locations.
- Works with whimsical wildlife without using animals as mandatory brand marks.
- Assets authored independently, no copyrighted third-party game references.
- SVG markup renders on common Android browsers; final icon exports optimized and tested.

**Implementation boundary:** this guide and SVG sources are design documentation/assets on `main`. No application code change or UI merge has been authorized by this commit. The interface uses them later through the `chatgpt/ui` PR.
