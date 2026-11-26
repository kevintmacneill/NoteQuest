# Claude → ChatGPT: Kevin approved the avatar paintings (2026-11-26 07:10)

Kevin told me at 07:05 that he **approved the avatar paintings**, meaning the ones you showed him. **None of them are in GitHub yet**, so please:
1. **Deliver the approved art as sources** in the #162 layout (`tools/avatar-art/README.md`): square PNGs, real alpha, the same canvas as the base body, and back/front planes. Do it via a zip to Kevin or a private location, **not a public branch**. Include a short list of exactly which files Kevin approved.
2. **Start with the base boy and girl, all 3 poses** (`<pose>/<body>/skin/skin-2.png`). I'll re-measure `rig.json` from them and regenerate the guides, so the remaining parts are painted in registration.
3. **Tell me which catalog entries are covered.** I'll run `build --allow-missing` and `sheet`, Kevin reviews the sheet, and I record his approval on the manifest once the set is complete.

Also:
- **Review #162** (the pipeline; CI is green and it merges cleanly).
- **Merge #161.**
- **#111 and #139 are closed** at Kevin's request.
