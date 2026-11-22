# Portable Canonical Character Identity System v1

**Purpose:** The same approved character should be reproducible from its **saved files**, independent of which AI agent, game, YouTube editor or computer is using it. Text prompts and random seeds are *not* canonical artwork.

## Guarantees and non-guarantees

1. **Exact repeat:** preserve the original bytes, versioned asset files and SHA-256 digests. Reusing an asset produces the same composition, rather than asking an image model to guess again. Screen/video renderers may rasterize differently.
2. **2D scale:** an approved SVG master can scale cleanly at any display size. A raster master is limited by its actual pixels. The milestone dragon is currently **raster only**: the 256×320 WebP is NOT a vector, transparent rig, cinematic 4K export or replacement for its 1229×1536 source.
3. **Animation:** pose, expression, talking, wings, transparency and separated layers are **new derivative artworks**; they must be shown and accepted visually before being added as approved assets.
4. **3D:** a future glTF/GLB model and rig may represent the same character *identity*, but is a new sculpt requiring front/side/back turnaround and separate owner approval. No single-view raster can prove what an unseen back looks like.
5. **Cross-platform:** use this format in game repos and YouTube production pipelines; the core module is browser-compatible ES module code and does not import NoteQuest game/engine rules.
6. **No unauthorized image changes:** do not paint over, mirror or hue-shift identifying features. Never automatically derive a new production asset from a textual description or an unapproved AI output.

## Durable layout

```text
characters/
  identity-system/
    character.identity.schema.json   # portable schema
    index.mjs                        # deterministic approved-asset selection
    notequest-dragon-adapter.mjs      # maps existing canon, no duplicate truth
  milestone-dragon/
    canon.v1.json                    # PR #110 — owner's character authority
    reference-v1.webp                # PR #110 — verified 256×320 image
    ORIGINAL-FULL-RES.jpeg           # NOT YET IN REPOSITORY — do not invent
```

The source is an image file and its SHA, **not JavaScript code capable of reconstructing its pixels**. Keep a byte-identical archive of the highest-quality original. To promote an SVG, PSD, layered sprite, turnaround sheet or 3D model, create a new asset with its own immutable hash, documented parent source hash, review evidence and explicit approval. Never rewrite a formerly approved file in place; add a new version.

## Current white dragon

- Existing authoritative description and unmerged art: `coordination/design/MILESTONE_DRAGON_CHARACTER_CANON_v1.0.md` and draft [PR #110](https://github.com/kevintmacneill/NoteQuest/pull/110).
- Existing `canon.v1.json` and image remain authoritative; **do not copy and manually maintain a second character definition**. `fromNoteQuestDragonCanon` adapts that existing record to this generic format when PR #110 lands.
- Its reference thumbnail is allowed for **reference preview only** by the cross-product selector. Video production, graduation cutscenes and 3D export fail closed until those assets are explicitly approved.
- Full-size original SHA-256 is `1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052`. Import only exact matching bytes.
- Keep the character **unnamed** until the owner decides. Do not mistake her for the adoptable game dragons.

## Integration example

```js
import { fromNoteQuestDragonCanon } from "./notequest-dragon-adapter.mjs";
import { selectCharacterAsset } from "./index.mjs";

const identity = fromNoteQuestDragonCanon(dragonCanonJson);
const thumbnail = selectCharacterAsset(identity, { purpose: "reference", minWidth: 128 });
// thumbnail.path === "milestone-dragon/reference-v1.webp"
// App/editor resolves that path relative to assets/characters; it NEVER generates new pixels.
```

`selectCharacterAsset(identity, {purpose:"video", minWidth:1920})` intentionally throws until an approved high-resolution video derivative exists. It does not stretch 256 pixels to 1920 or secretly call AI.

## Production readiness gate

- Record original bytes, ownership/licensing and exact SHA-256. **Only upload or publish art you have rights to use**, including commercial YouTube use.
- Version the source and immutable markings; write approved asset metadata and SHA-256 for every derived file.
- Obtain *actual visual owner approval* for newly created artwork, poses, vectors, animation or 3D representations before production implementation.
- Verify file bytes against declared SHA in CI and export pipeline. The portable selector validates metadata only; it does not read files or prove their SHA is correct by itself.
- Make production usage explicit (`game`, `video`, `thumbnail`, `reference`, etc.). An owner-selected reference is **not** automatically approved for every context.
- For raster export, enforce a minimum real resolution; for vector export use the approved SVG geometry; for 3D use an approved model and rig.
- Keep drawing/animation rules separate from mastery, assessment and unlock systems. Never let character artwork award a NoteQuest milestone.

## How YouTube will reuse it

Create a per-channel character collection pointing to the same immutable source files (or byte-identical packaged copies), plus each channel's approved clothing, backdrop, expressions, lip-sync rig and framing profiles. Assets are not shareable merely because an AI prompt produces something similar. Add versioned outputs appropriate for 1920×1080, 3840×2160 or thumbnails only after their actual source quality and approval support those sizes.

**Current implementation:** portable contract, validator/selector, NoteQuest adapter and automated behavior tests. No vector conversion, full-resolution source import, video renderer, 3D model, or gameplay change is claimed.
