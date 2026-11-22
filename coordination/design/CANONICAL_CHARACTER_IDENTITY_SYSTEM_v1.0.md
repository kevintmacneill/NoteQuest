# Canonical Character Identity — decision and first implementation (2026-11-22)

**Owner-selected direction:** One stable visual identity system supporting **NoteQuest 2D artwork now** and **future 3D/YouTube character use**. Preserve approved characters across devices, agents and renderers without prompt-driven redrawing.

**Source of truth:** Immutable original file + SHA-256, approved derivative files + hashes, a versioned manifest, a set of unique identifying marks and an approval ledger. The original is never replaced in place. A prompt is a *reference note*, not reproducible image geometry.

**First implementation:** `assets/characters/identity-system/` contains the portable `character.identity/1.0` schema, metadata validation, deterministic approved-file selection and an adapter for the existing dragon `canon.v1.json` in draft PR #110. It makes no new art and does not modify the milestone engine.

**Current dragon:** the owner-approved *identity choice* is the ivory-white, pink-winged, violet-eyed, pastel-swirl ceremonial milestone dragon with her purple diamond pendant. Its fixed 256×320 WebP and runtime registry are only on unmerged PR #110; the 1229×1536 original JPEG is not in the GitHub repository. No approved SVG master, separately articulated pose, lip-sync sprites, 3D sculpt or 3D rig exists. Do not infer or fabricate them.

**Visual review gate:** Every new image, changed scene, SVG vector tracing, expression, full-body pose, animation or 3D turnaround requires a picture/mockup presented to the owner **before implementation** and explicit owner acceptance. The present PR is nonvisual architecture; not art approval.

**3D compatibility:** stable character ID and source-derived invariant markings persist. New 3D geometry, textures, rig, camera views and materials require independent approval, production master version and reproducible exports. A front three-quarter picture cannot specify unseen anatomy with certainty.

**YouTube reuse:** the same character package can be imported into a separate video production workspace, with independent resolution/framing presets and media-use rights; do not automatically use the small preview as full-screen video artwork. Channel/story visuals are separate approved derivative assets.

**Review / rollout:** this architecture PR is draft for independent exact-head code review and green CI. PR #110 remains separately held; no merge, avatar replacement, game screen, logo, YouTube upload or 3D work is authorized by this architecture alone. Next concrete dependency: import and hash-verify the original source image; then present a visual proposal for layered/vector and later turnaround asset creation.
