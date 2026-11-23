# Music Reference v0.1 — source and theory QA

**Independent review pending** · UI feature branch `chatgpt/music-reference`.

- **36/36 diatonic family cases passed in the connected orchestration JS runtime**, using the actual repository source's `spellScale` and `chordsFor`: 12 major, 12 natural minor and 12 harmonic minor tonics. Each builds seven distinct pitch classes and the correct triad-quality sequence. C major / A harmonic minor spelled examples also checked.
- Reproducible source committed: `tests/music_reference_node.js`; **Node invocation has not separately been executed**, and full browser navigation, input rendering and audio scheduler are not verified.
- Source uses 30–240 BPM slider/input/tap tempo, a Web Audio lookahead scheduler and 2/4, 3/4, 4/4, 6/8 with six **eighth-note clicks** in 6/8. Android real-time timing and background behavior need testing.
- All reference material is independent of the learner's coins, mastery, pets and games. CSS and JS are separate files.
- **Scope is MVP:** presently major/natural minor/harmonic minor scales, diatonic triads and optional sevenths; melodic minor (both forms), pentatonic and chromatic modes in the broader reference specification remain follow-up work. There are no persistent per-profile settings yet.

**Release gate:** Claude independent theory/UI/audio review, owner approval, browser/Android testing and integration with a Music Reference menu link once merged.
