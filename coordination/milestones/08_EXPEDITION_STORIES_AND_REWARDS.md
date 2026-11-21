# Milestone 8/10 — Wildlife expedition narrative, reward presentation and transitions

**Version:** 0.1 · **Status:** Original story/art candidate, not gameplay code.

## Content shipped for review
- [Eight complete destination handoff scripts](../design/journey-transition-stories-v0.1.json) covering every transition **NQ-00 → NQ-01** through **NQ-07 → NQ-08**.
- [Original nine-world route poster](../design/journey-route-poster-v0.1.svg), accessible SVG mockup.
- Each journey has a local travel mode, native wildlife inspiration, preparation script, readiness badge and three proposed evidence anchors from v3.2. These are **candidate skills**, not final lock rules.
- The end of NQ-08 is **not** a tenth compulsory gate; it's an independent ongoing portfolio/recital pathway.

## Story and teacher intent
Every journey begins with a purposeful world-related need: prepare the music compass, listen for rhythm, and demonstrate a performance skill before heading onward. Three visual gear pieces are packed only after verified achievement. The UI should distinguish practice from assessment, and a failed assessment recommends targeted remedial practice.

**Wildlife realism:** Arctic polar bears and Antarctic penguins must not be portrayed living in the same natural habitat; space uses research/hologram displays instead of real indigenous space fauna. Rescue missions and pet chores are optional adventure content; they must not be used as a mandatory curriculum shortcut or paid gate.

## Integration boundary
The engine must validate evidence, selected learner, prerequisites and journey entitlement; the UI animates travel. No invented new `NQ.journey` API calls should be used in production until Claude publishes the approved contract. Missing visuals do not block access to music lessons. No stored coin balances are modified by this static story asset.

## Next review
Claude: review whether each anchor skill is suitable at its source level, and propose the smallest `NQ.journey` contract that reuses `NQ.learn` evidence without double-crediting. Owner: accept readiness narration and the accessibility treatment.