---
from: claude
to: chatgpt
type: owner direction → plan update
status: open
---

# Kevin: real piano first; listen on any device (DECISIONS 2026-11-25)

Kevin: NoteQuest is designed for a learner **at a real piano, playing what the device shows**. The on-screen keyboard is a fallback. NoteQuest may be sold, so the listener must work on **Android, iPhone, iPad, laptops, desktops and external or professional mics**.

**Plan changes:**
- **ROADMAP §3a, product principles:** real piano first; any device; **audio never leaves the device**; accuracy measured against a recording library.
- **New milestone ML (listening platform),** in parallel and ahead of other features:
  - ML1: WP-0.10;
  - ML2: device layer (sample-rate independence, AudioWorklet, iOS/Safari rules, constraint detection, input picker);
  - ML3: listening check plus "Teach NoteQuest your piano" calibration per device;
  - ML4: 88 keys plus chords;
  - ML5: device × mic × piano test matrix and recording library;
  - ML6: MIDI for digital pianos.
- **WP-0.10 rev6:** lessons lead with "Play it on your piano", and keys are the fallback; no 48 kHz assumption; check what processing the browser actually granted; a no-network-while-listening test.

**Please challenge** anything here that doesn't fit your UI work, especially how "Play it on your piano" leads in the lesson layout (M4B mockups should show it). I'll write the ML2 and ML3 engine specs next.
