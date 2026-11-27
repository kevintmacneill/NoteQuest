# Avatar Hair Registration Studio — owner-approved direction
Date: 2026-11-27
Status: approved to build in a new ChatGPT Work thread; implementation and fit acceptance pending.
Scope: internal NoteQuest art tooling, not a new game or a new standalone project.

## What happened
- Candidate 1 was rejected for cut edges, gaps, synthetic texture patches, inconsistent size/placement and color. The geometry-only Candidate 2 rebuilt 288 combinations but 111 failed scalp coverage.
- The subsequent standing/medium-brown batch passed the scoped checker (12 combinations, 0 FAIL, 10 warnings). Claude independently reproduced that result and accepted the warnings; a later authorized ponytail color-only patch reduced brown drift from 9.5 to 0.5 while preserving the pink bow and alpha. This was technical evidence, not owner acceptance.
- Kevin rejected the actual standing full-body composites as crooked and misaligned. That rejection supersedes any implication of release readiness. Subsequent single-ponytail trials moved fringe, temples, ear openings and lower locks. Some passed the checker, but the owner still identified incorrect ear aperture positioning and face-framing on both sides. Fixing one side independently displaced the other; an apparent scalp pass did not prove natural alignment.
- Kevin expressly directed no redraws, one hairstyle/color/pose at a time, then all poses, then colors. He approved building a systematic fitting tool in a new ChatGPT Work thread. No hairstyle has received final fit acceptance under this workflow (0/12 standing brown). No runtime publication or merge is authorized.

## Binding constraints
Use exact approved base plates and existing approved paintings, preserve source bytes, approved colors and pink ponytail/braid bows. No redraws, painted fill, texture cloning, synthetic extensions or invented source art. Only translation, resizing, rotation and gentle bending; separate front/back along natural strand boundaries. Bow color matching is Phase 2; future hats/headphones must hide bows without holes. Prior explicitly authorized brown color correction may be retained. Do not alter the checker or production gates.

## Tool requirements
Build a local-first interactive registration studio isolated from game code (implementation location/technology to be selected after reading existing tools/avatar-art; no new filesystem authority established here).
- Exact 1024x1024 native canvas, actual body/painted source layers, pan/zoom, numeric coordinates, adjustable opacity, grid/centerline, contrasting backgrounds, red scalp overlay, before/after, full-body and detailed forehead/temple/ear/jaw views.
- Permanent landmarks on all six approved base plates: crown, scalp boundary, centerline, forehead/hairline, both temples, eyebrow boundaries, ear tops/centers/attachments/bottoms, cheeks, jaws, chin, neck and shoulders. Viewer-left/right consistently; no assumed symmetry. Base never moves.
- Hair-specific source/destination correspondence points, simultaneous bilateral alignment, translation/rotation, independent/uniform scale, smooth constrained mesh deformation, connected-section adjustment, undo/redo and reset. Render from original source each time, avoid folds/discontinuities and excessive distortion.
- Editable curved natural-strand front/back masks; correct back/body/front composition, preview each plane and boundary. Hair overlapping head is front; rear locks behind head/neck/shoulders. No artificial cuts or removing pixels to game checks.
- Save versioned landmark and transformation configurations, source hashes and reproducible exports. Reopening an accepted fit should reproduce output. Export 1024 RGBA front/back PNGs in existing naming conventions, source/output hashes, reports, actual composite previews, correction notes.
- Integrate Claude's unmodified hair_check.py with --colors hc-brown. Display scalp, straight edges, gaps, patches, color/shape consistency and flagged spots. Explicitly verify expected combinations and both planes; empty/missing candidates cannot pass completion. Supplement with distinct visual aids for halo, fragments and landmark residuals. Do not weaken thresholds.
- Acceptance: anatomical alignment and natural volume, both ears/temples/cheeks/jaws, eyebrow clearance, proper depth, no gaps/halos/stray fragments/straight cuts, actual visual review, zero automated failures and owner approval. Checker pass alone never sufficient.

## First practical test and production order
First: girl ponytail, medium brown, standing. Preserve approved painting, pink bow, authorized color patch, body and natural silhouette. Fit both ears and face-framing sections together, using global position/rotation/scale first and gentle local deformation second. Show actual full-body/head composites, bilateral ear close-ups, landmark overlay, before/after and checker report. Do not proceed to Braids until Kevin accepts this exact fit.
Then individually fit and obtain acceptance for standing medium brown: Ponytail, Braids, Bob, Girl Curly, Long Hair, Twin Buns, Classic Short, Boy Curly, Spiky, Undercut, Buzz Cut, Shaggy (boy-wavy compatibility ID). Repeat all 12 for waving medium brown, then walking medium brown. Only then apply accepted destination geometry to separately painted black, dark brown, light brown, auburn, ginger, blonde and platinum sources; reconcile source correspondences without changing the accepted placement. Total 288 combinations.

## Recovery and verification
Read DECISIONS.md, STATUS.md, tools/avatar-art and relevant coordination messages including 0400 redo, 0725 review, 0915 bows, front-brown visual rejection, pony-single-fit-review and ponytail-brown-color-correction.
Private source files may need owner attachment in Work (not published to GitHub):
- NoteQuest_Front_Brown_Review_Package.zip — SHA-256 a062f0245e59fdb40eadd552d010cf1aa2d9ae6c15cd9a68928119b6d4bee3e2
- NoteQuest_Ponytail_Color_Patch.zip — SHA-256 72b9280fcbd945a48de42ea6dd6c5ec92408fe38d1115b924e4fe0b2658b44ae
- NoteQuest_Original_Hair_Paintings_With_Checksums.zip — SHA-256 2846f9a713b268fb8eac6dbd6b15a192495e042420c6e4e84aa4bddc9f9bd457
- NoteQuest_Hair_Candidate_2_Geometry_Review_ONLY.zip — SHA-256 9a0b7e39289dcf5cbbdb2dc9a02ee0d040a1319cfcabc4ea35029c16a131b173
- Updated hair_check.py — SHA-256 d2187804ceeec4fd8d55aeee9197e3328c0f9198462df1169448c77d73b5b3d3
Hashes are recorded from earlier verified handoffs, not newly checked in this documentation-only session. Verify actual bytes before using. Do not use generated posters as registration evidence.

## Deliverables and boundaries
Working tool, launch instructions, six landmark configurations, repeatable fitting/export, actual checker integration, tests, first real ponytail fit and concise limitations. ChatGPT Work implements; Claude independently reviews actual assets/technical pipeline. Keep #166 and hair publication held until applicable owner and independent gates. No code or art has been changed by this document. Update coordination and Portfolio Control Tower at material checkpoints.
