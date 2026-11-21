# Music Reference Library — proposed feature specification v0.1

**Status:** owner-requested scope, design proposal; not yet implemented or accepted for release.
**Owner:** ChatGPT (curriculum and UI); Claude reviews pedagogy and engine/API requirements; Kevin approves.
**Purpose:** a freely accessible, non-graded reference area for fundamentals, usable by beginners and experienced learners independent of their Journey progress.

## Navigation and learner experience
- Persistent **Music Reference** entry from learner home, with four initial tabs: **Glossary**, **Scales**, **Chords**, **Metronome**. Open at any curriculum level; no mastery gate, coins, rewards or profile progression changes merely for browsing.
- Visual-first examples for non-readers, short definitions and expandable advanced explanations. Responsive touch-first UI on Samsung Android portrait and landscape, keyboard accessible and usable without microphone.
- Search/filter glossary by term and category; link terms from lessons to the same canonical reference entries. Examples: note, pitch, staff, clef, measure, beat, tempo, rhythm, time signature, key signature, interval, scale, tonic, triad, inversion, chord progression, dynamics, articulation, accidentals.
- Offline-first: no remote runtime API, external audio assets or third-party music content.

## Scales
- Choose tonic (12 chromatic pitch classes) and scale type: major, natural minor, harmonic minor, melodic minor (ascending/descending), major pentatonic, minor pentatonic, chromatic. Present notes in order, correct enharmonic spelling by key, piano-key highlighting, scale degrees, interval pattern and optional staff notation. Later modes may add church modes and arpeggios.
- Explain that melodic minor traditionally differs descending in classical contexts; do not silently present a single universal descending form.
- Offer one/two-octave views and optional hand/fingering guidance only where musically validated. Avoid treating enharmonic notes as interchangeable in written notation.

## Chords within scales
- For a selected key and scale, show diatonic harmonized chords where the scale's structure defines them: triads (I–vii° in major, i–VII in natural minor) with Roman numerals, chord quality, spelled notes, inversions and keyboard display. Optional seventh chords after triads.
- Distinguish harmonic-minor harmonization and melodic-minor ascending from natural-minor harmonization; label the chosen source scale and do not mislabel borrowed or chromatic chords as diatonic.
- Show common progressions as illustrative theory, not mandatory lesson completion.

## Metronome
- User-adjustable tempo **30–240 BPM**, integer steps, with direct numeric entry and +/- controls; prominent start/stop and tap-tempo. Adjustable time signatures (initially 2/4, 3/4, 4/4, 6/8) with optional first-beat accent and visual beat pulse; mute toggle and volume control.
- Audio clock must use a look-ahead scheduler anchored to the Web Audio clock, not naive setInterval-only sound generation; handle page background/suspend/resume without accumulated drift or runaway queued clicks. User gesture unlocks audio. No microphone or cloud required.
- Display chosen BPM, beat grouping and clear distinction between quarter-note BPM and dotted-quarter pulse in 6/8; allow deliberate subdivision choices rather than ambiguous counting.
- Persist preferences per learner only if an approved NQ API exists; do not directly mutate engine save data from UI. Otherwise keep settings session-local. Metronome may run while the learner views scales/chords or practices, with a persistent compact stop control.

## Boundaries, review and acceptance
- This is a reference/practice utility, not a replacement for Learn → Practice → Check or the proposed Journey Readiness assessment.
- ChatGPT authors UI and reference content; Claude owns any new NQ persistence/music contract. Request API changes through coordination messages before implementing them.
- Validate all 12 major and natural minor key spellings, representative harmonic/melodic minor harmonizations, enharmonic edge cases, tempo timing (30/60/120/240 BPM), 6/8 pulse semantics, tab switching while playing, background/resume, mute, accessibility, and Android portrait/landscape.
- Require independent Claude review of UI PR and owner signoff before merge. No claim of production readiness based on this document.
