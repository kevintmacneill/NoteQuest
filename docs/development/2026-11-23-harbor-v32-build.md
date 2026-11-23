# Melody Harbor v3.2 implementation start

The owner authorized implementation on November 23. Curriculum v3.2 and the underlying learning rules were already approved as C-B11 through C-B13. The engine swap and decisions about the relevant activity corrections, readiness criteria and saved mastery are still subject to review. This branch exposes the Harbor controls needed for the approved content when the engine loads it.

## What changed in the curriculum

- v3.1 and v3.2 both specify 9 worlds, 70 stops and 210 skills. Seven activity definitions change: two in Harbor (keyboard side and duration comparisons) and five in Rainforest (keyboard position, clef recognition, and grand-staff note naming). Four Rainforest stop titles also change. The runtime still uses the temporary two-world engine curriculum with 13 stops and 26 skills.
- v3.2 gives Harbor six stops with 18 authored skills. Echo and the low-pressure notation concept check are intended to show as coming soon. Checkpoints and readiness must stay accessible when those skills are unavailable.

## Build delivered here

- The key-group renderer accepts real engine prompts for groups of two or three and submits the selected MIDI key. The keyboard-side renderer submits the engine's left or right choice. Duration comparison uses the engine's exact sound lengths and enables answers after playback starts.
- The Harbor Learn action respects the engine's proposed playable flag. The browser fixture samples the real generator with the approved definitions. The fixture does not replace the production sample data or alter scores or saves.
- The focused browser command is `python tests/browser/harbor_v32_activities_test.py`. It covers actual generated prompts and answer payloads on simulated phone touch input and verifies the two deferred activities. It does not test physical piano or phone audio output.

## Engine and curriculum review still needed

1. Review an explicit old/new content diff for the generator audit's proposed corrections. `tests/generator_contract_v32.json` is a generator fixture. For Harbor, the new renderer can present both black-key group sizes, but approved U01-S01 currently generates only groups of two and specifies a manual follow-up for three. The assessment must account for that follow-up before certifying the full objective. U05-S01 also deserves an objective-to-prompt check because a group-size prompt is still a prompt.
2. Derive Harbor readiness from playable checkpoint skills with explicit categories and evidence. One possible evidence set is a keyboard region or key-group demonstration for navigation, a pulse demonstration for timing and a witnessed setup or a deliberate playing demonstration for performance. This is a candidate for review. Never infer performance from a listening answer, or silently pass a missing category.
3. Keep raw legacy records. Old black/white recognition is insufficient for finding black-key groups, old loud/soft listening is insufficient for playing loud/soft, and old self-reported curved hands are insufficient for a caregiver-confirmed wrist check. Compare each candidate transfer to the actual new objective, evidence and assessment. The high/low listening result is a candidate for U03-S01; carrying it to the physical-end objective as well needs explicit evidence. Preserve existing unlocked worlds and test importing and reopening older saves without silently upgrading unmatched mastery.
4. Wire all six stops and their prerequisites using the runtime IDs and the engine owner's migration. Test fresh, partial and fully mastered legacy profiles. Obtain exact-commit review before any release.

## Artwork

Issue #115 refers to the city overview in `assets/nq-city-overlook-v1.avif` on PR #108. That file is the 640 × 213 preview proxy. The design handoff names a 2172 × 724 master. Review that image and the desktop sizing requirement separately from the lesson work.
