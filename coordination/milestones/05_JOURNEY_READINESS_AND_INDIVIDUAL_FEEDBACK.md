# Milestone 5/10 — Journey Readiness Challenges and instructional feedback

**Date:** 2026-11-20 · **ChatGPT-owned UI/curriculum design** · **STATUS:** independently reviewable interaction prototype and engine handoff; **not live**.

## New owner direction

Before traveling to the next world, the learner hears/sees that the expedition is preparing to depart. They are challenged to **prove readiness for what they will experience**. In-universe motivation (ship, expedition, transport, field guide, equipment) transforms a skills assessment into a meaningful adventure. Exact promotion criteria still need curriculum/engine approval.

**Core story beat:** “We're preparing to journey into the next area! Let's check our musical navigation, timing, and playing skills. Show what you know so we can get ready for the trip.” For pre-readers, this becomes three illustrated activity icons with no required word reading; spoken instructions remain deferred.

## Two levels of proof

1. **Stop readiness:** two or three short evidence tasks per stop that target the actual learning objective, with one checkpoint skill. For theory use randomized *unseen* note or rhythm examples, not the same exact sample practiced five minutes ago. Caregiver confirmation is explicit, never falsely microphone-certified.
2. **World expedition readiness:** three *mixed-domain* short challenges prior to the next world: **Navigation** (pitches/keyboard geography/reading), **Timing** (beat/rhythm), and **Performance** (play a learned excerpt/skills, observed or mic-verified only if technologically supported). Draw from prior mastered skills and the destination's prerequisites. No arbitrary "pay 10 coins" gate. No rescue or pet sickness penalty for a missed skill.

## Rules and evidence

- **Eligibility:** Region can be previewed, earlier worlds revisited, pets cared for and free exploration enjoyed regardless of the readiness badge. Only the structured next-world curriculum is gated.
- **Pass evidence:** per-skill engine-verified correct answers, supported microphone monophonic pitches, rhythmTap timing, or explicitly self/caregiver/teacher-confirmed performance. Do not claim hands-together, pedaling, posture or dynamics are mic-scored in current API.
- **Assessment independence:** challenge items sample fresh variants from existing skill pool. A learner cannot advance by replaying a canned multiple-choice question or clicking a completed UI-only animation.
- **Non-punitive:** wrong answers receive specific correction, practice suggestions and reattempts; keep passed components so the learner only repeats what needs work. No lives, stamina penalties, lockout timers or loss of pet/coins.
- **Placement:** learners who already demonstrate readiness may place into a higher region by passing equivalent evidence, with scheduled reviews and no age-based assumption.
- **Difficulty:** younger pre-readers receive pictorial responses and accessible task length; adults can use concise language. The skill proof does not become easier based only on age.
- **Pass thresholds:** DO NOT invent global thresholds separate from curriculum's current "secure" skill criterion. Exact number of fresh attempts and category mix pending Claude API review and owner acceptance.
- **Recording:** engine owns activeProfileId, challenge attempt IDs, evidence type, skillId, successful components, attempts, verifiedAt and next-region entitlement. Switching profile or abandoning the challenge must not credit someone else's progress.
- **Feedback:** the UI may explain errors based on *actual returned error type and known expected note*, but must never assert it heard a chord, inferred emotional intention, or diagnosed posture.

## Example: Melody Harbor → Amazon Rainforest

A harbor guide announces departure preparations. Three travel supplies become evidence badges:
- **Compass:** find both a group of two and three black keys / locate C. Use keyboard taps or supported live note proof; aim to assess both families, not only one.
- **Rhythm drum:** tap an even four-beat pulse after a count-in. Engine judges timing; if not yet supported, show a practice activity, not an automated "pass."
- **Expedition song:** play a short age/skill-appropriate original pattern. The currently monophonic microphone can verify *individual notes* but cannot certify phrasing/two-hand artistry. Some objectives require a caregiver/teacher checkbox.

As each challenge is passed, a piece of illustrated expedition equipment is packed: compass, drum, field journal. When all three verified categories are satisfied, the boat can launch and the next destination's structured lessons become available.

## Player-facing feedback: exact example

Target F4, actual G4:
- First incorrect: “Almost. You're one white key too far right; find F just before G. Give it another try.”
- Second incorrect: show F on original keyboard overlay, offer guided replay.
- Repeated pattern: record an F/G confusion *skill hint* and propose a 2-minute nearby-key exercise, not a speculative medical or learning-disability explanation.
- Success: “That's F! Your navigation kit is ready.” Do not award mastery for a single lucky answer unless the engine's evidence policy permits it.

## Deliverable boundaries

[Interactive stand-alone proof-of-concept](../design/prototypes/journey-readiness-v0.1.html): three clickable demo tasks, retry/help and explicit non-engine status. **No student coins, profiles, saves or unlocks are written.**

[Engine proposal](../design/prototypes/journey-readiness-contract-v0.1.json) is a requested *capability*, not an existing `NQ` API. Claude owns its final methods and persistence model. Our existing v3.2 curriculum checkpoints remain a draft pending approval.

**Review:** Claude to verify alignment with learning API and the PR #4 session-isolation fix; owner to review destination story, minimal components and acceptable evidence gates before coding.
