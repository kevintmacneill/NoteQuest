# Title-to-City Child POV Transition — Visual Review Proposal v0.2

**Date:** 2026-11-22 PT. **Status:** PROPOSED / AWAITING OWNER REVIEW. No production implementation or art approval implied.

## Objective
Make the already-working NoteQuest boot → title → village handoff feel like **one continuous physical camera move** from behind the two child adventurers into the learner's elevated viewpoint overlooking the **same** city. Do not just scale one image and crossfade into an unrelated, street-level plaza.

## Existing baseline to preserve
- Draft [PR #112](https://github.com/kevintmacneill/NoteQuest/pull/112) is the tested, deployed proof of concept. Owner called it “a good proof of concept” but has **not** approved final visual assets or a merged release.
- **Four seconds from Tap to Play:** 0–1s title hold, 1–3.2s camera push, 3.2–4.0s gentle reveal. Title loading duration is genuine asset readiness, **not** a newly mandated artificial two-second wait. No 10-second non-skippable cinematic.
- Preserve Skip, reduced-motion direct entry, preexisting learner selection, Continue Adventure focus, swipeable city, five core piano actions, 3-second grown-up gate, per-profile save isolation, no engine changes.
- Two child adventurers and the current animal companion appear on the title artwork; the separate canonical milestone dragon **does not become a default title companion** merely because a speculative storyboard accidentally pictured it.

## Owner-visible storyboard
The 2026-11-22 ChatGPT conversation displays two exploratory storyboard images; these are **illustrations of camera beats only**, not checked-in game assets, authoritative character redesigns, adopted scene layout, or a new 10-second timing decision. The storyboard's street-level final shots need correction: **the final interactive scene must be a true elevated overlook of the scrolling city** per approved `TITLE_TO_CITY_OVERLOOK_UX_v1.0.md`.

### Camera beats (existing 4-second window)
1. **Title lock (0–1s):** current two-child and companion vista. Choose a fixed landmark (city gateway/central musical tower) as a tracked optical anchor.
2. **Pass the adventurers (1–2.4s):** approximate a physically moving camera with layers/depth: foreground children enlarge faster and move to edges; mountain/waterfall background moves slower; central city anchor remains aligned. The UI title fades without being zoomed as part of the painting.
3. **Arrive above the city (2.4–3.2s):** shift to the first-person overlook, **not ground level**. Keep the exact same anchor centered through the change of scene; use matched parallax perspective and controlled dissolve if physically continuous matching renders are unavailable.
4. **Settle and activate (3.2–4.0s):** camera settles at existing city center with Adventure Gate as primary navigation; interactive hotspots align with the panoramic painted buildings, five learning actions appear accessible. Focus Continue Adventure only after the menu is mounted.
5. **Accessibility:** Skip and prefers-reduced-motion take the fast path; no blocking on animation event indefinitely; missing art uses current readable fallback.

## Before code/art changes
1. Confirm Kevin accepts the camera beats and **true elevated overlook** end-frame as represented by an accurate visual comparison, not a street-level third-panel or a ten-second loading sequence. **The generated storyboards shown today are not treated as approved final visuals.**
2. Prepare a matched landmark comparison for real title art and a production-quality *elevated panoramic city* image. The current low-resolution city proxy (640×213) cannot support high-fidelity arrival.
3. Keep any new art and UI experimentation on a distinct ChatGPT-owned PR stacked on #112. Never silently replace the current playable build or existing author branches.
4. Run screenshot/diff checks at 390px phone, 820px tablet and >=1280px desktop; inspect reduced-motion, keyboard focus, title asset loading, profile integrity and scene panning.
5. Exact-head CI and independent reviewer approval required for merge. UI work cannot award learning mastery or bypass Journey Readiness.

**Decision requested:** Does the proposed **4-second camera path into a real elevated overlook** match the owner's desired experience? This is NOT yet a design acceptance or implementation claim.
