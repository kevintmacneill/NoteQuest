# Real-piano audio fixtures (not published; the Pages allowlist excludes `tests/audio/`)

## `kevin-upright-88keys-2026-11-24/`
Kevin's upright acoustic piano. Every key from A0 to C8, played one at a time (about 2.3 s apart), recorded on a **Samsung Galaxy S25 Ultra phone** on the music stand, not the game tablet. It was analysed in a separate session; the analysis code is in `tools/audio-analysis/`, and the full findings are in `REPORT.md`.
- `notequest-88keys.flac`: mono, 24 kHz, 16-bit, 206.5 s, 4.95 MB. It includes 10 extra presses: repeats, one stray D4, and 5 C8 taps.
- `expected.json`: all 98 presses `{midi, name, onsetSec, primary}`. Filter on `primary:true` for the 88.
- `keys.json` / `keys.csv`: per key, pitch, tuning, signal-to-noise, decay and the results of both game detectors.
- **The piano is flat:** median −21 cents; the bass is 50–75 cents flat.
- **Caveat:** the FLAC is 24 kHz, but the report's numbers were measured at 48 kHz. A test should resample to 48 kHz or account for the difference.

Use: WP-0.10 regression tests. Every change to listening is checked against this real piano.
