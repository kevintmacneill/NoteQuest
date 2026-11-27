# Handoff: Claude avatar/village session (2026-11-27 07:00 PT)

The session ran out of context; Kevin is starting a new thread. Read this, the latest `DECISIONS.md` rows and `messages/` since 2026-11-27 06:50 before acting.

## Standing rules
- **Kevin:** "Do not make any changes until you have 95% confidence in what you need to build. Ask me follow-up questions until you reach that confidence."
- **DECISIONS.md:** only rows Kevin actually made, quoting his choice.
- **Merging:** Claude merges only its own PRs, after an independent exact-head approval and green CI, unless Kevin says otherwise.
- **Never commit** avatar source art (zips, PNGs, sheets); only runtime WebPs and the manifest. Never copy Kevin's piano recording (branch `claude/audio-fixture-88keys`) to other branches, CI artifacts or PRs. No secrets.
- **Environment:** GitHub GraphQL is blocked from Claude sessions, so use `gh api repos/kevintmacneill/NoteQuest/...` (REST) for comments and PRs. Don't reset a checkout that holds someone's unresolved merge; use worktrees.
- **ChatGPT can't reach GitHub.** Art arrives as zips Kevin attaches. Messages to ChatGPT go in `messages/`, and Kevin pastes a short version.

## Open PRs (all green, mergeable, unreviewed at 06:40)
| PR | Branch @ head | What | Gate |
|---|---|---|---|
| #166 | `claude/avatar-partial-rollout` @ `ee7289f` | Partial painted-avatar rollout; Eye Color in its own Eyes tab (engine 1.10.0) | New default-kids zip; fresh exact-head review. #169 uses 1.9.2, so whichever lands second rebases and bumps |
| #168 | `claude/village-hotspots` @ `8aabc2e` | Tap-a-building village; second tap on the Sanctuary opens the pen | ChatGPT's M4A board; re-review (approval was for `b886759`) |
| #171 | `claude/fix-ui-crawler` @ `94cfce2` | `ui_scenarios.py` fixed for the coming-soon Amazon map; baseline 30→25 | Review; overlaps ChatGPT #146 |
| #173 | `claude/hair-checker` @ `0fb3a87` | `tools/avatar-art/hair_check.py` hair candidate checker, `--colors` one-color mode | Review |

## Eye color model (#166)
- **IDs:** `ec-darkbrown`, `ec-brown` (default = `eyeColorBase`), `ec-hazel`, `ec-amber`, `ec-green`, `ec-blue`, `ec-gray`, `ec-bluegreen`.
- **Brown** is painted into the bases: no layer, never published.
- **Other colors** are iris-only layers at `poses.<pose>.bodies.<body>.eyes.<id>`, from source `SRC/<pose>/<body>/eyes/<id>.png`. Drawn after the skin, before the outfit, hair front and glasses.
- **Older saves** without `eyeColor` read as brown. An unknown value is refused on write and displayed as brown.
- **Unpainted colors** are "Coming soon". A look falls back to brown when its color isn't painted for that body.
- ChatGPT has the art spec: `messages/2026-11-27-0640-claude-to-chatgpt-eye-color-art-spec.md`.

## Hair (state at handoff)
- **Candidate 1** was rejected (`…-0400-…-redo.md`, `…-0500-…-addendum.md`). **Candidate 2** was skipped by Kevin ("wait for candidate 3").
- **ChatGPT now works one pose and one color at a time:** front, `hc-brown`, all 12 styles.
- **Its hair_check run had 6 FAIL:**
  - straight edges on bob (41 px, around x600–614, y334–373), buns (59 px, x654–666, y158–216) and long (46 px, x625–648, y530–570);
  - bald scalp on girl curly (1.3%) and ponytail (just over 1%);
  - buzz brown drifts ΔE 16 from the other styles' brown.
  - The correction was sent through Kevin (06:55), along with the updated checker.
- **Still open from the sheet review** (`…-0650b-…-fit-check-sheet-1-review.md`): Spiky pale halo, Shaggy floating loop, Buzz cap-like hairline.
- **Kevin to decide:**
  - Ponytail pink bow back? (Painted into the hair, or a separate head accessory, which would block a hat or headphones.)
  - Braids: keep plain ties, or bring back the pink bows?
- **Settled:** Shaggy replaced Wavy (`boy-wavy` stays as the compatibility ID). Classic Short brown was normalized to the other colors' size.
- **Review method that works:**
  1. Run `hair_check.py` (add `--colors hc-brown` for a one-color batch).
  2. Look at real composites yourself at high zoom. The first visual pass missed the girls' straight forehead cut; the checker caught it.
  3. A drawn-checkerboard overview sheet is not proof of fit; ask for the real 1024 px RGBA files.

## Default kids (release blocker for #166)
- **Waiting on ChatGPT's default-fit zip:**
  - girl: ponytail, pink hoodie outfit, glasses and backpack as separate planes;
  - the boy's look;
  - both on the approved new bases with scalp masks.
- **Then:**
  1. Build with `avatar_art.py --partial --approved-by "<Kevin>"`.
  2. Run the scalp gate.
  3. Adopt `rig.candidate.json`.
  4. Review the composites.
  5. Commit the WebPs and manifest to #166.
  6. Request review.

## Today's owner decisions (all in DECISIONS.md)
- Eye Color gets its own Eyes tab. The Sanctuary second tap opens the pen.
- Hair cutting went to Claude and then back to ChatGPT. No painted fill: fitting may only move, resize, tilt and gently bend.
- **Harbor:**
  - Tier 3 mastery needs the real piano.
  - Placement credits every proven stop at once, at Tier 1.
  - All six extra skills stay in Harbor, built last.
- The activity wardrobe (7 styles) is approved for later; it doesn't delay the default release.

## Private art
Nothing from the old session's container carries over: the earlier zips, candidate 1 and the approved bases and scalp masks. Ask Kevin to re-attach whatever you need.

## Scheduled checks
The old thread has one PR check scheduled for 2026-11-27 18:05Z. The new thread should set up its own.

## Update 2026-11-27 07:25 PT (new thread)
- **Reviewer rule changed:** ChatGPT or Grok review Claude's work; Claude never reviews Claude (DECISIONS row). #166/#168/#171/#173 need a ChatGPT or Grok exact-head review.
- **Front/brown hair batch reviewed** (`messages/2026-11-27-0725-claude-to-chatgpt-front-brown-review.md`): checker reproduced 0 FAIL; the ponytail is too warm (ΔE≈10, reads auburn) and needs a fix; all warnings accepted. Waiting on ChatGPT's fix and Kevin's acceptance.
- **Bows answered (09:10 PT):** pink for now; outfit-matched bows are Phase 2; hats and headphones hide the bow (DECISIONS).
- Kevin's zips are in the project files folder (`/mnt/project-files/` in Claude threads): the front-brown package, the original paintings and Candidate 2. Nothing from them was committed.
