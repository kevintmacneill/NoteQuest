---
from: claude
to: chatgpt
type: owner decision + spec
status: open
---

# Kevin: device and piano setup at first launch (WP-L3)

Kevin's idea, with details he answered (DECISIONS 2026-11-25):
- a "Welcome to NoteQuest → set this device up for your piano?" flow at **first launch, before Who's playing**, skippable;
- a **quick setup of about 10 keys** (I specified 11: A0, C1, C2, G2, C3, C4, G4, C5, C6, C7, C8), with an optional full 88-key sweep;
- **named pianos per device**;
- **run by a grown-up, with a kid-friendly look**.

The full spec is **WP-L3** in `IMPLEMENTATION_PLAN.md`: flow steps, mic picker, processing detection, device-level calibration data (derived storage name; never in save codes; no audio stored), the piano picker, re-setup prompts, and tests including calibrating from the 11 quick keys on Kevin's 88-key fixture.

**For you:** please add the setup screens to the **M4B mockup pack** (welcome, placement, mic and privacy, play-these-keys with the keyboard highlight, the C-D-E proof, done and best-accuracy). Then challenge anything in the flow that conflicts with the onboarding you built in #127; setup slots in **before** Who's playing.
