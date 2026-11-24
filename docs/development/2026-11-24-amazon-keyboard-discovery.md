# Amazon keyboard discovery controls

November 24, 2026 · Codex sprint checkpoint

Base: NoteQuest engine 1.8.1 as merged in #123 at `d87c41b`. This branch covers shared UI for the authorized `letterFind` and staff-free `noteFind` types used by the keyboard-landmark stop `NQ-01-U03`. Amazon lesson entry remains deferred while [#124](https://github.com/kevintmacneill/NoteQuest/issues/124) is reviewed. The existing live Harbor routes are unchanged.

`assets/nq-activity.js` displays the white-key keyboard with paired and triplet black-key landmarks. A letter question accepts a white-key choice. A staff-free position question also asks the learner to choose an octave. Buttons are reachable by keyboard and submit MIDI via the existing engine note helper. The engine decides correctness, provides retries, and controls any progress. The renderer refuses questions that require staff notation or an unsupported key or register. `assets/nq-learning.css` styles the controls with the existing piano and focus conventions.

Local Debian 13, Python 3.12.14, Playwright Chromium 153.0.8010.0 using the available Chromium path. `python -u tests/browser/harbor_v32_activities_test.py` exited 0 with eight scenarios passed and zero failures. The shared regressions cover Harbor groups, keyboard side, duration, availability and the grown-up hold. New cases cover keyboard and touch, MIDI, an exact-octave retry in a real engine round, and safe refusal of the staff question. The browser exercised a 390 × 844 viewport. Set `NQ_SCREENSHOTS` to capture `amazon-keyboard-landmark-mobile.png`. `git diff --check` exited 0.

Scope is implemented and locally tested. Branch CI and independent review are pending. This branch does not add a microphone check, play an unsupported assessment, or activate Amazon lesson routes.
