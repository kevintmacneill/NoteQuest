# NoteQuest Hair Registration Studio

A local browser editor for the private 1024 × 1024 avatar source art. The studio runs on loopback and writes a review ZIP. The existing NoteQuest tools handle runtime builds after owner review.

## Run

From the repository root with Python 3.10 or newer:

~~~powershell
python -m pip install pillow numpy scipy scikit-image
python tools/avatar-art/hair-studio/server.py
~~~

Open http://127.0.0.1:8765/. The studio includes Claude's exact checker from PR #173, commit 0fb3a87f8480e43daf32411f42705ecf95e4d197, with SHA-256 d2187804ceeec4fd8d55aeee9197e3328c0f9198462df1169448c77d73b5b3d3. The server verifies its bytes before each run. Use a separate Python virtual environment if desired. Run the same port and browser profile to reopen local history.

## Verify the inputs

Use the private NoteQuest_Registration_Studio_Handoff.zip and its nested checksum manifests. The handoff records SHA-256 2428901de9e69bb5b6131e301772eb4681468be9305832f7c791fc24976d6a44. For the final six approved bases and accepted masks, use NoteQuest_Scalp_Masks_Candidate.zip (SHA-256 49c0124550e6d846ee7469807aa486c3116171cfaa0720eb252d6cb6e02f3f4a). Check each PNG against the applicable manifest. The older base-pose proof uses different geometry.

Use the approved paintings. If originals are multi-sprite sheets, supply a verified transparent 1024 × 1024 extraction and optionally select the original sheet under the provenance field. Preserve the source bytes and record how the extraction was prepared. The studio applies no colors. For the standing medium-brown ponytail, the authorized color-only patch has front PNG SHA-256 fd6f97408137a412af77d33b144a82ca7cbe64e0d20d69ea818a3af2c14bb91d. Earlier geometric trials are evidence of the defect. Identify any previous registration baked into the starting plane in the correction notes.

## Fit and review a style

1. Select the current production entry and load the approved body, scalp mask, transparent hair source, candidate rig and original back plane when supplied. Existing pipeline pose IDs are front, wave and walk.
2. Choose **Author base landmarks** with hair hidden. Zoom in and annotate each landmark on the actual body, using left and right as seen by the viewer. Save and export the anatomy for that plate. Repeat for all six bases. The body canvas stays fixed.
3. Set global translation, rotation and width/height, with the pivot near the head. Toggle **Show before** when picking source points. Set Temple, Ear center and Cheek for both sides of the ponytail. Use **Target landmark** where the correct contact coincides with the body landmark, or set a target numerically or by dragging. For a face-framing lock, record the intended position next to the cheek. Lightly adjust individual sections with a radius covering the surrounding strands. The tool rejects excessive combined gradients.
4. Inspect **Head**, **Left ear**, **Right ear**, **Forehead**, both temples and **Jaw**. Use the mouse wheel or buttons to zoom. Drag in **Pan / inspect** or use the middle or right mouse button in other tools. Toggle high-contrast backgrounds, hide either plane and use the red scalp mask to inspect gaps.
5. To move existing foreground pixels behind the body, choose **Edit back-plane curve**. Work on **Show before** to edit in source space. Click around the rear strand to form a closed, curved selection, and drag nodes to follow natural strand boundaries. Front/back planes share the original opacity through feathering. Inspect the boundary against the body. Existing rear pixels stay behind the body.
6. Run the checker. Red and amber rectangles come from its report. Blue rectangles flag tentative detached regions or pale semitransparent edges for inspection. The browser also shows the largest correspondence residual. Do a full visual review on the actual body, paying attention to eye and eyebrow clearance, hairline, volume and both sides of the face.
7. Save a draft and export the review ZIP. It includes matching 1024 px RGBA front/back PNGs in pipeline layout, body and mask copies, exact hashes, fit configuration, original checker logs and sheets, and rendered before/after and close-up images. If no source back plane exists, the studio exports an explicit transparent back PNG. Both output files are checked.
8. Once Kevin accepts that exact fit, record the review reference and lock the checked revision. The queue permits the next entry only after a lock. The standing brown ponytail precedes standing brown Braids. The remaining brown poses precede every other color. Phase D starts from the locked brown correspondences and keeps those destinations while the painted source landmarks can move.

## Reopen and reproduce

Open a saved revision or import fit.json and reload the exact source PNGs and rig. The studio compares input and output SHA-256 when reproducing the saved settings. Keep review ZIPs with the private sources. The app stores fit and anatomy history in the current browser profile, and exported snapshots can be imported for review. Approval history is local to that browser profile. An imported owner reference does not advance another profile's production queue.

The warp uses an affine transform plus a compact Wendland interpolation with a bounded displacement gradient. It samples the original image directly in premultiplied alpha, preventing transparent RGB from tinting strand edges. Output PNG encoding is deterministic. Browser source decoding and path rasterization can differ by engine. Reproduction checks the output hash and flags a mismatch. Keep the original browser engine and inputs for locked work. The curved split moves source foreground pixels into the back plane. Moving existing back pixels to the front requires re-extracting the original as a unified foreground source, then drawing the desired rear boundary.

Scoped exports check one combination. The official checker only calculates cross-color overlap and cross-style color drift when enough corresponding candidates are present. Single-fit checks cannot establish those results. For Phase D use the original checker against the grouped accepted candidates and compare the observed report keys with the approved manifest. The studio records explicit visual approval references, and humans verify the review applies to the exact exported bytes.

## Tests

~~~powershell
node tools/avatar-art/hair-studio/core.test.mjs
python -m pip install playwright
python -m playwright install chromium
python tools/avatar-art/hair-studio/browser_test.py
~~~

The tests use synthetic inputs. The private asset test and anatomical annotations are separate work on the six approved plates. The first standing brown ponytail still requires an actual bilateral fit, checker results on that exact fit, and owner visual approval.
