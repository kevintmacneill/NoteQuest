# NoteQuest 88-key recording: analysis report

Source: `20261124_192720.mp4` (836 MB), analysed locally on 2026-11-24. Nothing was uploaded anywhere.

## Summary in plain language

- **All 88 keys are in the recording, in order, none skipped.** The player also pressed a few keys twice, hit D4 once by mistake before C#4, and tapped the top key five more times at the end, so there are **98 key presses for 88 keys**. After 207 s someone plays freely; that part is cut from the test file.
- **The piano is flat, and very flat in the bass.** The middle of the keyboard is about 20 cents flat (median of all keys: -21 cents). The bottom octave and a half is 50 to 75 cents flat, and the second-highest key (B7) is 61 cents sharp. A detector that rounds a measured frequency to the nearest note will therefore name the wrong key in the bass on this piano even if it measures perfectly.
- **Detector A (`Mic`) is right on 51 of 88 keys.** It is right on every key from B2 to F6, and on 8 of the 13 keys from B1 to A#2. **Confirmed: it hears F6 and nothing above it** (F#6 to C8: 19 keys, never fires). At the low end it does not simply "ignore" the keys: it stays silent only on A#1, and on the 15 keys from A0 to A1 it **fires a wrong note** (a note two to four octaves too high) every time.
- **Detector B (`DSP.detectNotes`) with today's defaults is right on 46 of 88 keys**; opened to the full range it is right on 56. It is right on every key from D#3 up to A#7 (full range), and **wrong on every key below D#3**, including the 15 keys from C2 to D3 that are inside its default range. Above C6 it adds 1 to 3 phantom notes when asked for chords.
- **The game's streaming `Listener` also reacts to key releases**: over the 206 s run it reported 151 onsets for 98 presses. 55 of them are not key presses (mostly the thump of a key being let go), and 53 of those produced a phantom note.
- **What blocks the low keys** is the same thing for both detectors: these strings have almost no energy at their fundamental (40 to 60 dB below their strongest overtone), and the analysis windows are too short to separate the overtones. **What blocks the high keys** is mostly the frequency limits (1400 Hz in A, MIDI 96 in B), then the very fast decay.
- **A small prototype that scores each key against its own measured overtone pattern (a per-piano calibration) got 88 of 88** on this recording, and 10 of 10 on the repeated presses it was not calibrated from. That result is in-sample (the calibration comes from this same recording), so treat it as a strong hint, not a guarantee.

**Things you should know before relying on this:**

- The video was recorded on a **Samsung Galaxy S25 Ultra phone**, not a tablet. The microphone, its bass response and its automatic level control can differ from the tablet the game runs on, so the low-note results in particular may differ on the tablet.
- The keys were played about one every 2.3 s (not one per second), mostly held until the next key.
- `ffmpeg`, `ffprobe`, Python and `librosa` **could not be run on this PC** (it blocks Python, PowerShell and downloaded programs). Everything was done in Node.js instead; details and the consequences are in "How this was done" at the end.

---

## 1. The recording

| | |
|---|---|
| Container | MP4 (`ftyp` major brand `mp42`, compatible `isom`, `mp42`), 836,215,613 bytes |
| Duration | 230.50 s (movie); audio track 230.48 s |
| Video | HEVC (`hvc1`), 3840 x 2160 |
| Audio | AAC-LC (`mp4a`, object type 2), **48,000 Hz, stereo**, 16-bit field, **256 kb/s** (average 256.0), 10,804 frames |
| Device | `Galaxy S25 Ultra` (Samsung author tag); Android version tag present; UTC offset tag `-0800` |
| Created | 2026-11-25 03:31:12 UTC (19:31 local) |
| Encoder string | none beyond the Samsung/Android tags |

Read by parsing the MP4 boxes directly (no `ffprobe`).

**Levels and problems**

- Peak: left -0.7 dBFS, right -0.8 dBFS, mono mix -1.1 dBFS. **No clipped samples.** The two channels are genuinely different (two microphones), so the mono mix is not identical to either.
- Key peaks are very even (-1.1 to -9.2 dBFS, median -3.0), which suggests the phone's automatic level control or limiter was active. I cannot prove that from the audio.
- Room noise floor: **-54.5 dBFS** RMS (quietest half second of the run). A steady 60 Hz mains hum is visible in the quiet parts.
- Level just before each key (previous note still ringing or just released): median -43 dBFS. Signal-to-noise per key: median 33.6 dB, lowest 20 dB (B5; C#2 is next at 20.6 dB).
- Low rumble or handling noise from about 86 s to 92 s (under F3 to G3). Faint steady tones and murmuring in the background during the top octave and from 203.5 s to 207 s.
- **Speech:** I found no clear "start" or "done". There are weak sounds at 0.1 to 0.9 s (peak -22 dBFS) and murmuring after the last key; neither was loud or sharp enough to be mistaken for a key. I did not transcribe them.
- **After 207.3 s** there is free playing (repeated E4, C3, a short tune). It is not part of the 88-key run and is cut from the fixture.

## 2. Finding the key presses

Result: **98 pitched key presses, covering all 88 keys exactly once or more. Not 88 onsets.** Nothing was forced.

How the count came about:

1. An onset detector looking for a sharp rise in the 150 Hz to 8 kHz band found **230 candidates** in the run (0 to 206.5 s).
2. Keeping only strong attacks (rise of 15 dB or more, peak above -12 dBFS) left **101**.
3. **3 were rejected**, each for a stated reason:
   - 131.80 s and 135.86 s: loud but unpitched thumps (peak -7 and -8 dBFS, almost no harmonic content), right after C5 and D5 were released.
   - 181.31 s: noise 0.12 s before the C7 attack, merged into it.
4. The remaining **98** all have a clear pitch. The other 129 weak candidates are key-release thumps (very regular, about 1.2 s after each treble key), re-triggers inside ringing bass notes, and handling noise.

A first attempt with a plain spectral-flux detector gave 171 events and missed two soft attacks (D#3 at 81.26 s, F#3 at 87.98 s); it was replaced by the detector above.

**The 10 extra presses** (all listed in `extra-presses.json`, and flagged `primary: false` in `expected.json`):

| Time (s) | Key | What happened |
|---|---|---|
| 6.593 | B0 | First press; pressed again at 8.160 (used as the main one) |
| 60.715 | G#2 | Pressed for only 0.5 s |
| 61.218 | G2 | Went back to G2 |
| (64.355) | G#2 | Second G#2 press, used as the main one |
| 76.072 | C#3 | Held 0.8 s; pressed again at 76.890 (main) |
| 103.651 | D4 | **Wrong key**: D4 pressed before C#4 (104.285). D4 played again in its place at 106.673 (main) |
| 202.368, 202.663, 202.918, 203.159, 203.415 | C8 | Five quick taps after the first C8 (201.370, main) |

For a key pressed more than once, the "main" press used in `keys.json` is the first one that was held at least 1.7 s and did not follow another press by less than 0.5 s; if none qualifies, the first press.

**Labelling and the pitch cross-check**

Labels were not assigned by simply counting. Each press got a blind pitch estimate, and the label came from walking up the sequence using the **interval between consecutive presses** (which is immune to the piano being flat):

- Every step between consecutive new keys is one semitone: measured steps range from 66 to 134 cents, except the last two (A#7 to B7: 150 cents; B7 to C8: 59 cents; see tuning below).
- The walk starts at A0 and ends exactly at C8 after 87 upward steps, so **no key was skipped and no label is shifted**.
- An independent blind estimate (no knowledge of the expected key) agrees with the final per-key measurement to within 20 cents for every key from C#1 up (within 12 cents for all but G1, A2 and F#3). For A0, A#0, B0 and C1 the blind estimate locks onto the third overtone (it reads 1841 to 1848 cents high, which is a twelfth); that is the expected failure when the fundamental is absent, and it is consistent with the labels.

**Keys outside +-50 cents of their expected note (13):** A0, A#0, B0, C1, C#1, D1, E1, F1, F#1, G1, A1, A#1 (all 51 to 75 cents flat) and B7 (61 cents sharp). These are **tuning, not a skipped or repeated key**, for the reasons above. No relabelling was needed. One caveat on B7 and C8: their step sizes (150 and 59 cents) are ambiguous by themselves; they are labelled B7 and C8 because they are two different pitches and the only two keys left.

## 3. The piano's tuning

Median offset from equal temperament at A4 = 440 Hz: **-21.2 cents**.

| Range | Median cents | Lowest to highest | Median inharmonicity B |
|---|---|---|---|
| A0 to B0 | -71 | -75 to -69 | 7.4e-4 |
| C1 to B1 | -53 | -71 to -35 | 4.9e-4 |
| C2 to B2 | -32 | -46 to -26 | 2.9e-4 |
| C3 to B3 | -22 | -39 to -8 | 5.2e-4 |
| C4 to B4 | -17 | -31 to +2 | 9.0e-4 |
| C5 to B5 | -16 | -30 to -11 | 1.9e-3 |
| C6 to B6 | -17 | -34 to +18 | 4.3e-3 |
| C7 to B7 | -4 | -17 to +61 | not measurable (too few overtones) |
| C8 | +20 | | |

- A4 itself is close to pitch (440.5 Hz); its neighbours are 15 to 20 cents flat.
- The top octave is uneven: steps between neighbouring keys vary from 81 to 150 cents. E6 (+18) and B7 (+61) stand out.
- For the 10 lowest-energy fundamentals (A0, A#0, B0, C1, C#1, D1, E1, G#1, C#2, F2) there is no usable peak at the fundamental, so `f0Hz` is derived from a fit to the overtones (`f0Derived: true`).
- **The bass overtones are stretched.** For A0 the strongest overtone is the 14th; dividing its frequency by 14 gives a pitch 50 cents *sharp* of A0, while the fitted fundamental is 75 cents *flat*. A detector therefore gets a different "pitch" depending on which overtones it looks at. `centsFromStrongestPartial` in `keys.json` gives this second number for each key (orange dots in `plots/pitch-vs-expected.png`).
- Inharmonicity jumps between E3 (2.5e-4) and F3 (7e-4), which is where the strings change from wound to plain. `DSP.detectNotes` assumes a fixed 2e-4 for every key.

**Fundamental versus overtones**

| Range | Keys where 2nd harmonic is stronger than the fundamental | Fundamental below the strongest overtone (median) |
|---|---|---|
| A0 to B0 | 3 of 3 | 60 dB (effectively absent) |
| C1 to B1 | 10 of 12 | 48 dB |
| C2 to B2 | 12 of 12 | 35 dB |
| C3 to B3 | 7 of 12 | 7.5 dB |
| C4 and up | 0 | 0 dB (fundamental is the strongest) |

**Decay**

| Range | Time to -20 dB (median) | Time to -40 dB (median) |
|---|---|---|
| A0 to B2 | about 2.0 to 2.2 s | not reached |
| C3 to B3 | 1.3 s | 2.1 s |
| C4 to B4 | 0.86 s | 2.1 s |
| C5 to B5 | 0.60 s | 2.0 s |
| C6 to B6 | 0.44 s | 1.7 s |
| C7 to B7 | **0.24 s** | 0.82 s |
| C8 | **0.22 s** | not reached before the next tap |

Caveat: the keys were held about 1.2 to 2.5 s and then released. Below about G6 the damper cuts the note at release, so decay times of roughly 1.2 s or more reflect when the key was let go, not how long the string would have rung. `null` means the level had not dropped that far before the next press.

## 4. Detector A (`Mic`, autocorrelation)

Simulated exactly as specified: the original `autoCorrelate` run in Node on the 48 kHz audio, the latest 2048 samples every 60 ms, range 60 to 1400 Hz, three equal readings in a row to fire, from each onset to the next press. Timer phase was also shifted by 15, 30 and 45 ms to check it does not matter.

**Result on the 88 keys: 51 correct, 1 wrong octave, 16 wrong note, 20 nothing.**

| Range | Keys | Correct | Wrong octave | Wrong note | Nothing |
|---|---|---|---|---|---|
| A0 to B0 | 3 | 0 | 1 | 2 | 0 |
| C1 to B1 | 12 | 1 | 0 | 10 | 1 |
| C2 to B2 | 12 | 8 | 0 | 4 | 0 |
| C3 to B3 | 12 | 12 | 0 | 0 | 0 |
| C4 to B4 | 12 | 12 | 0 | 0 | 0 |
| C5 to B5 | 12 | 12 | 0 | 0 | 0 |
| C6 to B6 | 12 | 6 | 0 | 0 | 6 |
| C7 to B7 | 12 | 0 | 0 | 0 | 12 |
| C8 | 1 | 0 | 0 | 0 | 1 |

- **Correct:** B1, C2, D#2, E2, F2, G2, G#2, A#2, and every key from B2 to F6.
- **Wrong octave:** B0 fires B2.
- **Wrong note:** A0>G4, A#0>F#4, C1>A#4, C#1>F#3, D1>C#4, D#1>B4, E1>C#4, F1>C4, F#1>C2, G1>C#4, G#1>C#4, A1>E4, C#2>C4, D2>C#4, F#2>C#4, A2>E4.
- **Nothing:** A#1, and F#6 through C8.
- **Speed when correct:** 180 ms for 47 of the 51 keys (the minimum possible with three readings 60 ms apart), 240 ms for 3, 300 ms for 1.
- **Timer phase:** same result in 4 of 4 phases for every correct key except C2 (3 of 4).

**"Hears everything up to F6 and nothing above": confirmed.** F6 measures 1384 Hz on this piano, just under the 1400 Hz limit; F#6 measures 1470 Hz, so every reading is thrown away. From F#6 to C8, every reading that was loud enough was either above 1400 Hz and discarded (1 to 17 readings per key) or a stray value that never repeated three times. The rest, 42 to 86 % of each key's readings, were silent (below the 0.012 loudness gate), because these notes fade within a fraction of a second.

**The lower limit: partly refuted.** The 60 Hz limit is real but it is not what happens on most low keys:

- Only **A#1** is silently ignored: 31 of its 41 readings were about 57.5 Hz, below the limit.
- **B1 passes by a hair**: it reads 60.8 Hz (a true 61.7 Hz B1 would pass comfortably; this one is flat). A slightly flatter piano would lose B1.
- On the **15 keys from A0 to A1 the autocorrelation never finds the true period at all.** It locks onto the cluster of strong overtones between about 260 and 480 Hz and reports a steady wrong note (A0 gave "G4" on 35 of 43 readings). So in this simulation the game would hear a *wrong* note, not no note. If the tablet shows these keys as ignored, the likely reasons are that the wrong note does not match what the game was waiting for, or that the tablet microphone passes even less bass.
- C#2, D2, F#2 and A2 fail the same way (they report the 3rd or 4th overtone as a note).

**Extra false notes while a correct key rings:** on 10 keys the detector fires the right note and later a second, wrong one as the note decays (for example F2 then "C4" at 0.48 s; C3 then "C4" at 1.14 s; G#5 then "C#4" at 0.84 s). These are in `detectorA.allFired`.

## 5. Detector B (`DSP.detectNotes`, spectral)

Run unmodified in Node on 4096-sample frames at 48 kHz, starting 50 ms after each onset (also 150 ms and 300 ms). "Correct" means the first note returned is the key.

| Range | Keys | Default (36 to 96) correct | Full (21 to 108) correct | Full: octave error | Full: other wrong note | Full: correct but with phantom extras (maxNotes 4) |
|---|---|---|---|---|---|---|
| A0 to B0 | 3 | 0 | 0 | 1 | 2 | - |
| C1 to B1 | 12 | 0 | 0 | 2 | 10 | - |
| C2 to B2 | 12 | 0 | 0 | 7 | 5 | - |
| C3 to B3 | 12 | 9 | 9 | 3 | 0 | 4 |
| C4 to B4 | 12 | 12 | 12 | 0 | 0 | 0 |
| C5 to B5 | 12 | 12 | 12 | 0 | 0 | 2 |
| C6 to B6 | 12 | 12 | 12 | 0 | 0 | 7 |
| C7 to B7 | 12 | 1 | 11 | 0 | 1 | 10 |
| C8 | 1 | 0 | 0 | 0 | 1 | - |
| **All** | **88** | **46** | **56** | 13 | 19 | 23 |

- **Default range, as the game runs today: 46 of 88.** Inside its own range (C2 to C7, 61 keys) it is right on 46: every key from D#3 to C7, and none of the 15 keys from C2 to D3.
- **Full range: 56 of 88.** It gains C#7 to A#7 and nothing at the bottom.
- **Octave errors (full range):** B0>B2, C1>C3, B1>B3, C2>C4, C#2>C#4, D2>D4, D#2>D#4, E2>E4, G2>G3, B2>B3, C3>C4, C#3>C#4, D3>D4.
- **Other wrong notes (full range):** A0>F#4, A#0>F3, C#1>G3, D1>B3, D#1>C4, E1>C#4, F1>C4, F#1>C4, G1>B3, G#1>C4, A1>E4, A#1>D4, F2>C4, F#2>C#4, G#2>D#4, A2>E4, A#2>F4 (mostly the 3rd overtone or a cluster of high overtones), **B7>C8** (B7 is 61 cents sharp, so it is closer to C8), and **C8>F#4** at 50 ms (the hammer thump dominates; C8 is found correctly at 150 ms).
- **Above the default range** the default call returns an octave below or an unrelated note (C#7>F#4, D7>G5, F7>F5, A7>A6 and so on): it never returns nothing.
- **Later frames:** at 150 ms the full-range call is right on 59 keys; at 300 ms on 55. At 300 ms it starts to lose F3, F#3, G3 (reported an octave up as the fundamental fades) and E7, B7, C8 (already too quiet).
- **Phantom notes with `maxNotes: 4`:**
  - D#3 to F#3 each come with their own octave above (D#3+D#4 and so on).
  - **From C6 to A#7, 17 of 23 correctly found keys come with 1 to 3 phantom notes**, mostly low or mid notes (F6 + A3/E4/F3; A7 + A6/C5/D6). With only one or two real overtones in the frame, the hammer thump and background easily pass the 2 % threshold.
  - C5+B4 and G5+F#5 are not overtone phantoms: the previous key was still ringing.
  - Below C3 every answer is wrong, so "extras" are not meaningful there.

**The streaming `Listener` (defaults), run over the whole 206.5 s as the game does:** 151 onsets and 150 note events for 98 real presses. It caught 96 of the 98 presses (87 of the 88 main ones; it missed F#3, which started during the rumble). **55 onsets were not key presses**, and 53 of them produced a note event. Most sit about 1.2 s after a treble key, where the key was released. Top note correct on 47 of the 88 keys.

## 6. What blocks each range

**A0 to B1 (15 keys)**

- *Weak fundamental (main cause).* The fundamental is 48 to 60 dB below the strongest overtone. Detector B refuses any note whose fundamental is under 2 % of the biggest peak, so the true key is never even a candidate. Detector A's autocorrelation sees the overtone cluster, not the period.
- *Window too short.* 2048 samples at 48 kHz is 43 ms: only 1.1 to 2.6 periods of a 26 to 61 Hz note. 4096 samples gives a spectral peak about 47 Hz wide, wider than the 26 to 60 Hz spacing between these keys' overtones, so they cannot be told apart.
- *Band limit.* 60 Hz in A excludes A0 to A#1 on paper; B's default starts at C2.
- *Tuning.* These keys are 50 to 75 cents flat; rounding to the nearest note, or B's +-35 cent window (about +-49 cents under 200 Hz), would miss them even with a perfect measurement.

**C2 to B5 (48 keys)**

- A is right on 44 of 48; B on 33 of 48.
- C2 to D3 fail in B, and C#2, D2, F#2, A2 in A, for the same weak-fundamental reason (still 35 dB down at C2 to B2). From D#3 up nothing blocks either detector.
- The 20 to 45 cent flatness here sits right at the edge of B's +-35 cent window.

**C6 to C8 (25 keys)**

- *Band limits (main cause).* A stops at 1400 Hz (above F6); B's default stops at MIDI 96 (C7).
- *Fast decay against the gate and the three-reading rule.* Notes above C7 fall 20 dB in about 0.24 s. In A, 67 to 86 % of the readings for C7 and above were below the 0.012 loudness gate. Three readings 60 ms apart need 180 ms of steady tone.
- *Resolution.* Even with A's band opened to 4500 Hz (prototype below), E7 to C8 come out an octave low or not at all: the period is only 11 to 18 samples and the largest autocorrelation peak is often a multiple of it.
- *Tuning and thump.* B7 is far enough off to be named C8, and in the first 50 ms of C8 the hammer noise is louder than the note.

## 7. Recommendations, ranked by expected impact

The numbers come from small **prototypes run on this same recording. They are not the game's behaviour**, and the calibrated ones are in-sample (calibrated and tested on the same presses), except where noted. Full numbers are in `prototype-results.json`.

**1. Calibrate per piano, and detect low notes from their overtone pattern (fixes the 27 keys below C3).**
Have the player do this same 88-key sweep once, store each key's measured fundamental and inharmonicity, and score incoming sound against each key's own overtone positions, without requiring any energy at the fundamental.
- Prototype (calibrated overtone template, long window, plus rule 3 for the highs): **88 of 88**, and **10 of 10** on the repeated presses that were not used for calibration.
- Same template without calibration (equal temperament, fixed inharmonicity 2e-4): 75 of 88, and only 8 of 15 for A0 to B1. So calibration is what rescues the bottom octave on this piano.
- In `DSP.detectNotes` specifically: the "fundamental must be at least 2 % of the biggest peak" rule has to go for low notes, and the fixed 2e-4 inharmonicity and +-35 cent window need to become per-key values.

**2. Use a much longer window for low notes.**
Calibrated template, A0 to B1 correct: 0 of 15 with 2048 samples, 6 of 15 with 4096, 13 of 15 with 8192, **15 of 15 with 16384** (0.34 s at 48 kHz). C2 to B2 are fine from 4096; C3 and up from 2048. So: about 0.34 s for the bottom octave and a half, 0.17 s for C2 to B2, and short windows above. The cost is latency on the lowest keys only.
- Simply giving Detector A a longer buffer does not do it: with 4096 or 8192 samples and the band opened, C2 to B2 become 12 of 12 but A0 to B1 only 4 and 5 of 15.
- Giving unchanged Detector B longer frames barely helps: 56 of 88 with 4096, 59 with 8192, 60 with 16384.

**3. Open the frequency band, and find high notes from the spectral peak (fixes the 19 keys above F6).**
- Detector A with only the band changed to 25 to 4500 Hz: 62 of 88. It gains F#6 to D#7 (10 keys) and still fails E7 to C8 (octave low).
- Detector B needs `hi: 108` (gains C#7 to A#7).
- Prototype rule "if the strongest peak in a 2048-sample frame is above 1 kHz, take the calibrated key nearest that peak, with interpolation": **25 of 25 for C6 to C8**, including B7 and all C8 taps.
- If autocorrelation is kept for the highs, take the first strong peak rather than the largest, and interpolate more finely.

**4. Apply the tuning offset.**
Set the existing tuning setting to about **-20 cents** for this piano. Alone it changes little (unchanged Detector B, full range: 56 to 59 of 88), and it cannot describe a piano that is 20 cents flat in the middle and 70 flat at the bottom. That is why per-key calibration (1) ranks higher.

**5. Confirm faster and gate lower for high notes.**
Above C7 there is only about 0.2 s of usable sound. Analyse one short frame right after the onset (as the `Listener` already does) or accept two readings 30 ms apart, and use a loudness gate relative to the recent peak instead of a fixed 0.012. Measured effect here is small by itself (two readings instead of three: no extra keys, because the remaining failures are wrong pitches, not timeouts), so it matters only once 3 is in place.

**6. Ignore key releases.**
The `Listener` produced 55 false onsets in 206 s, 53 with a phantom note, mostly from keys being let go. Require that an onset be followed by a sustained, pitched tone, and treat a sharp click with falling level as a release. This matters before chords, where phantom notes are costly.

**7. For chords later.**
Expect phantom notes above C6 (17 of 23 keys here) and octave doubles around D#3 to F#3 unless the per-key overtone envelope is known. `verifyNotes` with the calibration data is the natural place to use it.

**Check on the real device.** Repeat the sweep with the tablet's own microphone path (the browser's echo cancellation, noise suppression and automatic gain all change levels and bass). The 0.012 gate, and whether the low keys come out as wrong notes or as silence, depend on it.

## 8. The delivered files

| File | What it is |
|---|---|
| `REPORT.md` | This report |
| `keys.json` | One entry per key (88), using each key's main press. Required fields plus extras (below) |
| `keys.csv` | The same as a table |
| `extra-presses.json` | The 10 presses that are not a key's main press, same fields |
| `notequest-88keys.flac` | The fixture: mono, 24 kHz, 16-bit, 206.5 s, 4.95 MB |
| `expected.json` | Ground truth for the fixture: **all 98 presses** in time order, `{midi, name, onsetSec, primary}`. Filter on `primary: true` for the 88 |
| `prototype-results.json` | Raw numbers for the prototypes in section 7 |
| `plots/` | `pitch-vs-expected.png`, `snr-decay.png`, `detector-results-per-key.png`, `detector-accuracy-per-octave.png` |
| `analysis-scripts/` | The Node scripts that produced all of this |

**About the fixture**

- It starts at the original time zero (1.39 s before A0) and stops at 206.5 s, 3.1 s after the last C8 tap and before the free playing. It did not need trimming for size. Onset times in `expected.json` are relative to the FLAC and are the same as in `keys.json`.
- It contains the repeated presses, the stray D4 and the key-release thumps. A test that expects exactly 88 notes in order will fail on it; use `expected.json` with the `primary` flag, or expect all 98.
- It is at 24 kHz, as requested. The detectors behave differently at 24 kHz than at 48 kHz (a 2048-sample buffer is 85 ms instead of 43 ms), and nothing above 12 kHz survives. All results in this report are at 48 kHz.
- The FLAC was decoded again and matches the source samples bit for bit.

**Extra fields in `keys.json`**

- `noiseDbfs`: RMS level from 250 ms to 30 ms before the onset. In this recording that is usually the previous note still ringing, not room noise (room noise is -54.5 dBFS). `snrDb` is the loudest 20 ms RMS after the onset minus that.
- `f0Hz`, `cents`: frequency of the fundamental; where no peak exists there (`f0Derived: true`) it is derived from a fit to the overtones. `pitchFlag` marks keys outside +-50 cents.
- `inharmonicityB`, `strongestPartial`, `centsFromStrongestPartial`, `h1Db`, `h2Db`, `fundamentalBelowStrongestDb`.
- `decay20Ms`, `decay40Ms`: `null` when not reached before the next press; `holdMs` is the time to the next press.
- `detectorA`: also `result` (correct, wrong-octave, wrong-note, none), `allFired`, counts of silent and out-of-range readings, `correctInPhases`.
- `detectorB_default`, `detectorB_full`: also `result`, the notes returned with `maxNotes: 4`, and the 150 ms and 300 ms frames.
- `listener`: what the streaming `Listener` reported for that press.

## 9. Per-key table

`*` after the frequency means derived from the overtones. "A" is Detector A (note fired, time to fire). "B def" and "B full" are Detector B's first note at 50 ms; `+n` means n phantom extras with `maxNotes: 4`. ">hold" means the level had not dropped that far before the next press.

| # | Key | Onset s | Peak dBFS | SNR dB | f0 Hz | Cents | Strongest overtone | 2nd > fund. | -20 dB ms | -40 dB ms | A | B def | B full |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | A0 | 1.39 | -6.3 | 41 | 26.34* | -74.5 | 14 | yes | 2095 | >hold | G4 X 240ms | F#4 X | F#4 X |
| 2 | A#0 | 3.95 | -3.2 | 29.7 | 27.96* | -71.4 | 13 | yes | 1920 | >hold | F#4 X 180ms | F3 X | F3 X |
| 3 | B0 | 8.16 | -6.4 | 28.3 | 29.66* | -68.8 | 12 | yes | 1570 | >hold | B2 X 480ms | B2 X | B2 X |
| 4 | C1 | 10.21 | -2.3 | 31.5 | 31.59* | -60 | 16 | yes | 2125 | 2540 | A#4 X 480ms | C3 X | C3 X |
| 5 | C#1 | 12.86 | -4.7 | 34 | 33.26* | -70.8 | 11 | yes | 2270 | >hold | F#3 X 360ms | G3 X | G3 X |
| 6 | D1 | 15.60 | -3 | 33.6 | 35.59* | -53.4 | 15 | yes | 2260 | >hold | C#4 X 180ms | B3 X | B3 X |
| 7 | D#1 | 18.36 | -4.1 | 33.6 | 37.87 | -45.9 | 13 | yes | 2185 | >hold | B4 X 660ms | C4 X | C4 X |
| 8 | E1 | 20.92 | -2.1 | 29 | 39.97* | -52.5 | 13 | yes | 2325 | >hold | C#4 X 180ms | C#4 X | C#4 X |
| 9 | F1 | 23.57 | -2.2 | 27.7 | 42.03 | -65.8 | 6 | no | 2300 | >hold | C4 X 180ms | C4 X | C4 X |
| 10 | F#1 | 26.20 | -2.8 | 29 | 44.56 | -64.4 | 7 | yes | 2130 | >hold | C2 X 660ms | C4 X | C4 X |
| 11 | G1 | 28.71 | -1.5 | 32.6 | 47.58 | -51 | 5 | yes | 2575 | >hold | C#4 X 180ms | B3 X | B3 X |
| 12 | G#1 | 31.61 | -2.6 | 30.4 | 50.86* | -35.4 | 5 | yes | 2225 | >hold | C#4 X 240ms | C4 X | C4 X |
| 13 | A1 | 34.20 | -2.4 | 26.8 | 53.08 | -61.6 | 6 | yes | 2085 | >hold | E4 X 480ms | E4 X | E4 X |
| 14 | A#1 | 36.64 | -3.7 | 23.7 | 56.52 | -52.9 | 5 | no | 2030 | >hold | none | D4 X | D4 X |
| 15 | B1 | 39.08 | -1.3 | 32.3 | 60.07 | -47.4 | 4 | yes | 2305 | >hold | B1 ok 240ms | B3 X | B3 X |
| 16 | C2 | 41.61 | -2.8 | 23.2 | 63.71 | -45.6 | 4 | yes | 2245 | >hold | C2 ok 180ms | C4 X | C4 X |
| 17 | C#2 | 44.02 | -1.6 | 20.6 | 68* | -32.7 | 4 | yes | 2060 | >hold | C4 X 240ms | C#4 X | C#4 X |
| 18 | D2 | 46.32 | -4.5 | 24.5 | 71.94 | -35.3 | 4 | yes | 2400 | >hold | C#4 X 240ms | D4 X | D4 X |
| 19 | D#2 | 48.99 | -3.8 | 28.5 | 76.6 | -26.5 | 4 | yes | 2295 | >hold | D#2 ok 180ms | D#4 X | D#4 X |
| 20 | E2 | 51.56 | -1.8 | 26.3 | 80.57 | -38.9 | 4 | yes | 1990 | >hold | E2 ok 180ms | E4 X | E4 X |
| 21 | F2 | 53.92 | -2.1 | 24.9 | 85.8* | -30.2 | 3 | yes | 2160 | >hold | F2 ok 300ms | C4 X | C4 X |
| 22 | F#2 | 56.34 | -1.5 | 24.2 | 90.69 | -34.1 | 3 | yes | 1820 | >hold | C#4 X 480ms | C#4 X | C#4 X |
| 23 | G2 | 58.57 | -5.3 | 28.8 | 96.3 | -30.3 | 3 | yes | >hold | >hold | G2 ok 180ms | G3 X | G3 X |
| 24 | G#2 | 64.36 | -2.1 | 39.5 | 101.98 | -31.1 | 3 | yes | 1700 | >hold | G#2 ok 180ms | D#4 X | D#4 X |
| 25 | A2 | 66.58 | -2.2 | 25.7 | 108.2 | -28.6 | 3 | yes | 2035 | 2415 | E4 X 240ms | E4 X | E4 X |
| 26 | A#2 | 69.06 | -3.2 | 30.2 | 114.79 | -26.2 | 3 | yes | 1850 | >hold | A#2 ok 180ms | F4 X | F4 X |
| 27 | B2 | 71.39 | -3.1 | 35.1 | 120.77 | -38.2 | 3 | yes | 1645 | >hold | B2 ok 180ms | B3 X | B3 X |
| 28 | C3 | 73.73 | -2.1 | 31.4 | 128.32 | -33.3 | 2 | yes | 1510 | 2275 | C3 ok 180ms | C4 X | C4 X |
| 29 | C#3 | 76.89 | -4.8 | 24.6 | 137.05 | -19.3 | 2 | yes | 1805 | >hold | C#3 ok 180ms | C#4 X | C#4 X |
| 30 | D3 | 78.96 | -3.3 | 34.3 | 145.02 | -21.5 | 2 | yes | 1830 | 2225 | D3 ok 180ms | D4 X | D4 X |
| 31 | D#3 | 81.26 | -6 | 31.4 | 153.28 | -25.6 | 2 | yes | 1265 | >hold | D#3 ok 180ms | D#3 ok | D#3 ok +1 |
| 32 | E3 | 83.48 | -2 | 33.7 | 162.17 | -28 | 2 | yes | 1750 | >hold | E3 ok 180ms | E3 ok | E3 ok +1 |
| 33 | F3 | 85.70 | -1.3 | 25.9 | 172.42 | -21.8 | 2 | yes | 1045 | >hold | F3 ok 180ms | F3 ok | F3 ok +1 |
| 34 | F#3 | 87.98 | -3.3 | 24.2 | 180.87 | -39 | 2 | yes | 1010 | >hold | F#3 ok 180ms | F#3 ok | F#3 ok +1 |
| 35 | G3 | 90.13 | -1.6 | 26.4 | 194.14 | -16.5 | 1 | no | 1395 | 2110 | G3 ok 180ms | G3 ok | G3 ok |
| 36 | G#3 | 92.31 | -1.8 | 35.7 | 204.69 | -24.8 | 1 | no | 265 | 1945 | G#3 ok 180ms | G#3 ok | G#3 ok |
| 37 | A3 | 94.38 | -1.8 | 36.3 | 218.98 | -8.1 | 1 | no | 160 | 1875 | A3 ok 180ms | A3 ok | A3 ok |
| 38 | A#3 | 96.56 | -2 | 36.4 | 230.65 | -18.2 | 1 | no | 1500 | 2050 | A#3 ok 180ms | A#3 ok | A#3 ok |
| 39 | B3 | 98.84 | -2.2 | 25.1 | 245.12 | -12.8 | 1 | no | 815 | 2170 | B3 ok 180ms | B3 ok | B3 ok |
| 40 | C4 | 101.22 | -3.5 | 37.9 | 258.48 | -21 | 1 | no | 1310 | >hold | C4 ok 180ms | C4 ok | C4 ok |
| 41 | C#4 | 104.28 | -6.2 | 21.1 | 274.7 | -15.6 | 1 | no | 2050 | >hold | C#4 ok 180ms | C#4 ok | C#4 ok |
| 42 | D4 | 106.67 | -1.4 | 24.7 | 290 | -21.8 | 1 | no | 440 | >hold | D4 ok 180ms | D4 ok | D4 ok |
| 43 | D#4 | 108.88 | -6.6 | 29.1 | 308.32 | -15.7 | 1 | no | 850 | 1955 | D#4 ok 180ms | D#4 ok | D#4 ok |
| 44 | E4 | 111.03 | -1.9 | 41.9 | 326.59 | -16 | 1 | no | 695 | >hold | E4 ok 180ms | E4 ok | E4 ok |
| 45 | F4 | 113.20 | -1.9 | 29.7 | 347.14 | -10.4 | 1 | no | 690 | >hold | F4 ok 180ms | F4 ok | F4 ok |
| 46 | F#4 | 115.54 | -1.6 | 34.3 | 363.47 | -30.8 | 1 | no | 860 | 2005 | F#4 ok 180ms | F#4 ok | F#4 ok |
| 47 | G4 | 117.76 | -1.6 | 41.7 | 387.78 | -18.7 | 1 | no | 935 | 2100 | G4 ok 180ms | G4 ok | G4 ok |
| 48 | G#4 | 120.11 | -2.4 | 35 | 410.77 | -19 | 1 | no | 550 | 2095 | G#4 ok 180ms | G#4 ok | G#4 ok |
| 49 | A4 | 122.42 | -1.8 | 38.5 | 440.48 | +1.9 | 1 | no | 940 | 2165 | A4 ok 180ms | A4 ok | A4 ok |
| 50 | A#4 | 124.82 | -1.1 | 43.3 | 465.61 | -2.1 | 1 | no | 1475 | 2145 | A#4 ok 180ms | A#4 ok | A#4 ok |
| 51 | B4 | 127.22 | -2.7 | 34.3 | 488.97 | -17.3 | 1 | no | 215 | 1895 | B4 ok 180ms | B4 ok | B4 ok |
| 52 | C5 | 129.59 | -2.5 | 39 | 516.67 | -21.9 | 1 | no | 715 | >hold | C5 ok 180ms | C5 ok | C5 ok +1 |
| 53 | C#5 | 132.25 | -3.3 | 29.2 | 548.06 | -19.8 | 1 | no | 610 | 2175 | C#5 ok 180ms | C#5 ok | C#5 ok |
| 54 | D5 | 134.61 | -1.4 | 35 | 583.72 | -10.7 | 1 | no | 375 | >hold | D5 ok 180ms | D5 ok | D5 ok |
| 55 | D#5 | 136.96 | -4.6 | 23 | 616.82 | -15.2 | 1 | no | 1175 | 1865 | D#5 ok 180ms | D#5 ok | D#5 ok |
| 56 | E5 | 138.97 | -3.9 | 32 | 653.17 | -16.1 | 1 | no | 550 | 2120 | E5 ok 180ms | E5 ok | E5 ok |
| 57 | F5 | 142.54 | -1.7 | 44.5 | 690.68 | -19.4 | 1 | no | 145 | 2035 | F5 ok 180ms | F5 ok | F5 ok |
| 58 | F#5 | 144.73 | -2.8 | 35.7 | 734.19 | -13.6 | 1 | no | 625 | >hold | F#5 ok 180ms | F#5 ok | F#5 ok |
| 59 | G5 | 146.71 | -4.9 | 33.5 | 770.37 | -30.3 | 1 | no | 305 | 1915 | G5 ok 180ms | G5 ok | G5 ok +1 |
| 60 | G#5 | 148.91 | -9.2 | 32.5 | 823.26 | -15.4 | 1 | no | 1615 | >hold | G#5 ok 180ms | G#5 ok | G#5 ok |
| 61 | A5 | 151.06 | -3.9 | 32.2 | 874.08 | -11.7 | 1 | no | 780 | 2075 | A5 ok 180ms | A5 ok | A5 ok |
| 62 | A#5 | 153.32 | -1.9 | 33.1 | 919.84 | -23.3 | 1 | no | 580 | 1820 | A#5 ok 180ms | A#5 ok | A#5 ok |
| 63 | B5 | 155.36 | -4.9 | 20 | 979.58 | -14.4 | 1 | no | 560 | >hold | B5 ok 180ms | B5 ok | B5 ok |
| 64 | C6 | 157.38 | -6.7 | 28.4 | 1026.17 | -34 | 1 | no | 635 | >hold | C6 ok 240ms | C6 ok | C6 ok +2 |
| 65 | C#6 | 159.43 | -4.2 | 25.1 | 1094.21 | -22.8 | 1 | no | 515 | 1730 | C#6 ok 180ms | C#6 ok | C#6 ok |
| 66 | D6 | 161.39 | -6.4 | 34.9 | 1159.33 | -22.7 | 1 | no | 660 | 1885 | D6 ok 240ms | D6 ok | D6 ok +3 |
| 67 | D#6 | 163.43 | -5.1 | 41.3 | 1238.92 | -7.8 | 1 | no | 450 | 1755 | D#6 ok 180ms | D#6 ok | D#6 ok |
| 68 | E6 | 165.32 | -2.3 | 39.3 | 1332.34 | +18.1 | 1 | no | 455 | 1640 | E6 ok 180ms | E6 ok | E6 ok +2 |
| 69 | F6 | 167.63 | -4 | 34.5 | 1384.27 | -15.7 | 1 | no | 320 | 795 | F6 ok 180ms | F6 ok | F6 ok +3 |
| 70 | F#6 | 169.54 | -6.9 | 38.1 | 1469.83 | -11.9 | 1 | no | 265 | >hold | none | F#6 ok | F#6 ok |
| 71 | G6 | 171.52 | -3.5 | 34.7 | 1542.78 | -28.1 | 1 | no | 510 | >hold | none | G6 ok | G6 ok |
| 72 | G#6 | 173.48 | -5.5 | 28.7 | 1630.6 | -32.2 | 1 | no | 420 | 1980 | none | G#6 ok | G#6 ok +3 |
| 73 | A6 | 175.60 | -4.9 | 39.6 | 1743.52 | -16.3 | 1 | no | 370 | >hold | none | A6 ok | A6 ok +3 |
| 74 | A#6 | 177.70 | -3.9 | 32.8 | 1846.91 | -16.6 | 1 | no | 375 | 1025 | none | A#6 ok | A#6 ok |
| 75 | B6 | 179.61 | -1.9 | 37.7 | 1960.2 | -13.5 | 1 | no | 350 | 1595 | none | B6 ok | B6 ok +3 |
| 76 | C7 | 181.43 | -3 | 36 | 2074.91 | -15 | 1 | no | 295 | 775 | none | C7 ok | C7 ok |
| 77 | C#7 | 183.22 | -3.8 | 43.7 | 2195.28 | -17.4 | 1 | no | 195 | 710 | none | F#4 X | C#7 ok +3 |
| 78 | D7 | 185.00 | -2.7 | 43 | 2337.72 | -8.6 | 1 | no | 320 | 1275 | none | G5 X | D7 ok +3 |
| 79 | D#7 | 186.63 | -3.1 | 40.1 | 2477.21 | -8.2 | 1 | no | 260 | 1005 | none | D#5 X | D#7 ok +3 |
| 80 | E7 | 188.43 | -1.8 | 36.9 | 2660.17 | +15.1 | 1 | no | 165 | 695 | none | A5 X | E7 ok +3 |
| 81 | F7 | 189.98 | -2.7 | 43.2 | 2793.31 | -0.3 | 1 | no | 305 | 795 | none | F5 X | F7 ok +3 |
| 82 | F#7 | 191.65 | -4.4 | 37.9 | 2946.17 | -8.1 | 1 | no | 280 | 900 | none | F#6 X | F#7 ok +3 |
| 83 | G7 | 193.37 | -5.7 | 38.1 | 3152.52 | +9.1 | 1 | no | 225 | 1260 | none | C5 X | G7 ok +3 |
| 84 | G#7 | 195.00 | -3.9 | 40.3 | 3301.77 | -10.8 | 1 | no | 240 | 1500 | none | A#4 X | G#7 ok +3 |
| 85 | A7 | 196.59 | -4.3 | 40.4 | 3566.79 | +22.9 | 1 | no | 185 | 700 | none | A6 X | A7 ok +3 |
| 86 | A#7 | 198.10 | -4.9 | 37.3 | 3754.25 | +11.5 | 1 | no | 185 | 615 | none | D#5 X | A#7 ok +3 |
| 87 | B7 | 199.77 | -5.2 | 38.6 | 4092.86 | +61 | 1 | no | 235 | 840 | none | B6 X | C8 X |
| 88 | C8 | 201.37 | -5.2 | 39.2 | 4234.33 | +19.9 | 1 | no | 220 | >hold | none | F#4 X | F#4 X |

## 10. How this was done, and what differs from the brief

- **No ffmpeg, ffprobe, Python or librosa.** This PC refused to start Python, PowerShell and any downloaded `.exe`. I did not try to get around that. Node.js was allowed, so:
  - container and track facts were read by parsing the MP4 boxes;
  - the AAC track was copied out untouched and decoded with FAAD2 compiled to WebAssembly (`@audio/aac-decode`);
  - mono is (left + right) / 2, the same as ffmpeg's `-ac 1`; no normalisation, no noise reduction;
  - 24 kHz was made with a 255-tap windowed-sinc low-pass (cut-off 11.4 kHz) and decimation by 2, rounded to 16 bits without dither;
  - the FLAC was written with libFLAC (`libflacjs`).
- **If you re-extract the audio with ffmpeg**, expect the same sound but possibly a constant shift of about 21 ms (one AAC frame: this decoder returned 10,803 frames of the 10,804) and tiny differences from a different resampling filter. Times in `expected.json` match the delivered FLAC.
- `analysis.wav` (48 kHz, 32-bit float, 44 MB) was made and used but is not in the zip because of the size limit.
- **Pitch cross-check:** instead of `librosa.pyin` I wrote a harmonic-comb estimator (overtone positions with an inharmonicity search, then a least-squares fit to the measured overtones). It was checked against the semitone steps between neighbouring keys.
- **Detector A** is the original `autoCorrelate` code run in Node (so it uses the same 32-bit float arithmetic), driven by a simulated 60 ms timer. A real `AnalyserNode` on the tablet will differ in timer jitter and, more importantly, in microphone processing.
- **Detector B** is the code from the brief, unchanged.
- Decay times are limited by when the key was released (section 3).
- The exact Android version tag was not decoded with certainty and is left out.
