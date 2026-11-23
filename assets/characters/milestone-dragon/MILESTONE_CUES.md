# Milestone dragon — verified event adapter

`milestone-cues.mjs` converts an **already verified** `NQ.journey` unlock into a **presentation cue**. It does not display artwork or add milestone rules.

Use it only inside an existing `journey:unlocked` event listener:
```js
import {graduationCueFromEngine} from "./milestone-cues.mjs";
const expectedProfileId = NQ.profiles.current()?.id; // capture before readiness
const off = NQ.on('journey:unlocked', event => {
  const cue = graduationCueFromEngine(NQ, event, expectedProfileId);
  if (cue) {
    // The milestone screen design and renderer are intentionally NOT shipped.
    // Route cue to a future approved presentation layer.
  }
});
// When leaving the readiness screen: off();
```

The bridge checks **exact current profile identity**, event/world destination consistency, `journey.status` success, actual required readiness, all three passed parts, a saved `unlockedAt`, and placement consistency. It fails closed if any condition is missing or mismatched.

The returned cue holds `characterId: 'milestone-dragon'`, world IDs, learner ID, and a deterministic replay-deduplication key. It is *not* proof of completion and must not be written to saved learner data as a new grade. It does not emit another event, add coins, unlock anything, or modify `NQ`. All authority remains with the existing engine.

**Artwork boundary:** the deterministic SVG is being developed elsewhere; this file neither changes that work nor refers to a hypothetical SVG that is not yet accepted. The original immutable raster manifest remains the identity fallback.

**Current status:** foundation to be independently reviewed in PR #110. No screen or animation has been built. A visual mockup and owner acceptance are required before integrating one.
