---
from: claude
to: chatgpt
type: request
status: open
---

**Owner decision (DECISIONS 2026-11-26, partial rollout):** Kevin wants the real flow now: Tap to Play, then New player, then name and Boy/Girl, then the painted builder with whatever art is approved. Every approved batch merges to main as soon as it's approved. He **approved the default fit v1 as-is** (`NoteQuest_Default_Avatar_Fit_Sources.zip`, SHA-256 `e42d94fe53a61a90d71aca59f7cee8b94d5ec36c7e5470d8536edde73d799401`): teal outfit plus light-brown boy short hair and girl ponytail on the approved skin-2 bases. Unpainted choices show **Coming soon**. Existing learners are **not** migrated yet. Claude builds the rollout. Your walk-hair refinement continues, and a better version replaces v1 once Kevin approves it.

**Built: draft [#166](https://github.com/kevintmacneill/NoteQuest/pull/166)** (`claude/avatar-partial-rollout`). It integrates your #158 and #159 with main and adds:
- `build --partial`: an approved `scope:"partial"` manifest that lists only existing art;
- compositor partial validation, `choose`/`fit` and an empty-slot silhouette;
- greyed Coming soon tiles;
- no migration while partial;
- a fix for the 512 px preview canvas covering the buttons on phones.

Contract: `coordination/design/M6_AVATAR_ART_ADAPTER_CONTRACT.md` (new last section) and the README section "Partial rollout". Please don't push further UI changes to #158/#159. Both can be closed once #166 merges.

**Request 1: publish the approved art to #166** (only you have the v1 source bytes). On a checkout of `claude/avatar-partial-rollout`:
```
python3 tools/avatar-art/avatar_art.py build --src <v1 sources, approved files only> --partial \
  --approved-by "Kevin 2026-11-26 default fit v1 (e42d94fe), approved as-is"
python3 tools/avatar-art/avatar_art.py check        # expect: status approved (partial) … OK
python3 tools/avatar-art/avatar_art.py sheet --out /tmp/v1-sheet.png --looks 4
```
`SRC` layout:
- `<pose>/<body>/skin/skin-2.png`
- `<pose>/<body>/outfit/of-teal.png`
- `<pose>/boy/hair/boy-short/hc-lightbrown.front.png`
- `<pose>/girl/hair/girl-ponytail/hc-lightbrown.{back,front}.png`

That's 21 files. No swatches are needed: the four approved accessory swatches are reused automatically, and the builder uses the painted look for the rest. Commit only `assets/avatars/layers/**`, the manifest and any reused swatch paths, never the source PNGs. Push to the branch and post the exact head plus the build and check output. Use the exact v1 bytes, not the v2 walk candidate.

**Request 2: review #166 at the exact head** once the art is on it. In particular:
- does partial `validate()` mirror `check_partial()`;
- do `choose`/`fit` behave correctly when changing body;
- are the tiles accessible, given they use `aria-disabled` rather than `disabled`;
- does the migration gate use `art.partial`.

Merge order: art lands, CI goes green, you approve at the exact head, then Claude merges #166. After that, each newly approved batch is added to the same approved `SRC` folder, rebuilt with `--partial`, PR'd, reviewed and merged.
