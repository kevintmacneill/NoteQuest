# Melody Harbor rework: curriculum v3.3 spec (Claude, 2026-11-25)

**Status:** owner decisions are final (DECISIONS.md, 2026-11-25 15:20). The lesson content below is Claude's proposal. ChatGPT builds; Claude reviews at the exact head. Kevin sees the finished Harbor on the tablet before Amazon is reworked the same way.

## Why
Kevin (15:07): "the first lesson is very easy… you just click one of the two black keys 8 times and you are through it." The audit of v3.2 Harbor (18 skills) found:
- **Black-key lesson:** `NQ-00-U01-S01` asks one identical question every time (`keyGroup` group 2). Any key of any two-black-key group in any octave is correct, and the three-key group is never asked.
- **Placeholder self-checks:** 8 of 18 are "did you do it? yes" items whose prompts are generated text ("learner: observe or reflect on this musical task: …").
- **Not playable:** 2 are coming soon (`echo`, `conceptChoice`).
- **Repetitive:** the others repeat 2–6 distinct questions. Nothing teaches before testing.
- **Amazon too:** it has the same placeholder text in 4 skills.

## Owner decisions (Kevin, 15:10–15:20)
1. **Audience:** Harbor starts gentle enough for **Zoe (5, beginner)** and gets demanding, so the last stops challenge **Micaela (7, Alfred Prep A)**.
2. **Scope:** **Harbor first.** Get it right and use it as the model for Amazon, then the other worlds.
3. **Lesson shape:** **teach first**; **varied questions**; **mistakes matter**; **play on the real piano** (heard by the mic), with the on-screen keys as the fallback.
4. **Pass bar:** a check passes at **9 of 10 right on the first try**.
5. **Wrong answers:** each wrong answer adds one more question of that kind.
6. **Comfort and setup skills:** these become **grown-up checks** with clear checklists.
7. **Grown-up checks never block the child.** They wait as "for a grown-up" items in the grown-up area and on the map until a parent confirms.

## Engine changes (Claude specs these precisely when ChatGPT opens the PR; version bump is the next after main)
| ID | Change | Rule |
|---|---|---|
| E1 | Check pass bar | Non-human check, review and transfer pass at **≥ 9 of the first 10 items right on the first try** (today it's 0.8). Practice is unchanged: ≥ 60% gives `developing`. Secure still needs 2 passing days. |
| E2 | Extra question after a miss | A first-try miss on item *k* adds one extra item to the round, capped at +5 per round. Extra items are practice: they **don't change the score**, which counts only the first 10 (or the round size). The result reports `extra` so the UI can say "One more!" |
| E3 | No repeats | The engine regenerates (up to 8 tries) if a question equals the previous one (public fields, ignoring index). A generator whose content allows fewer than 4 distinct questions fails the lint. |
| E4 | Grown-up checks don't block | Human-type skills (`caregiver`, `teacher`, `self` rewritten as caregiver) are excluded from `stopComplete`, `currentStop` and `prereqsMet`, and are tracked as **pending** until confirmed. New read-only `learn.pending(p)` returns `[{skillId, stopId, since}]`. Confirming still uses `learn.start` → `answer(…, {by})`. No coins (unchanged). |
| E5 | Teach card | Optional `content.teach = {title, say, show}`. `say` is at most 2 short sentences, read aloud. `show` is a picture or demo ID the UI owns. The UI shows it before a skill's first practice round and from a "Show me again" button; the engine ignores it. |
| E6 | Generators | New or upgraded generators, listed per skill below: `keyGroup` v2, `highLow` narrowing, `contourListen` (new), `echo` (implemented), and reuse of `finger`, `letterFind`, `notePlay`, `noteFind` and the beats `symbol`. |
| E7 | Piano first | Playable items carry `answerMode: 'piano'`. The lesson leads with "Play it on your piano" and checks through the WP-0.10 listener; on-screen keys are the fallback, judged the same way. Until WP-0.10 Stage 1 merges, the keys are used. |

**Owner decision (Kevin, 15:25):** the end-of-world check **opens the next world even when grown-up items are still pending**. They stay in the grown-up area until a parent confirms. So readiness contains no human-type skills, and the lint rule "readiness covers every playable skill" excludes human types (`caregiver`, `teacher`, `self`).

## Harbor v3.3, stop by stop (IDs kept, content replaced)
Difficulty rises down the list. Every playable skill gets a teach card. "Piano" means played on the real piano, with keys as the fallback.

### U01 Meet the piano (Zoe's start)
| Skill | Teach | Questions (10 per check, varied, no repeats) |
|---|---|---|
| **S01** Find groups of two and three black keys | "Black keys come in groups of 2 and 3. Like twins and triplets!" | `keyGroup` v2. The target mixes **group 2 and 3** and a **place**: any, the lowest, the highest, or the one nearest the middle. Correct only for a key **in that group** (place checked on keys; on the piano, group only). Keyboard spans ≥ 2 octaves. |
| **S02** High and low ends | "Right is high like a bird; left is low like a bear." | `highLow`, listening ("Which is higher?"). The gap narrows across the round from 12 to 5 semitones. Every 3rd item is played: "Play a high note" (≥ G4) or "a low note" (≤ F3). |
| **S03** Left and right sides | "Going right, the sounds go up." | `keyboardSide`, mixed tap/play: "Play a note on the low side", "Tap the high side". |

### U02 Comfortable setup (grown-up checks; never block)
Rewrite each as a `caregiver` item with a plain checklist the parent ticks, plus a teach card for the child.
- **S01** Bench distance. Checklist:
  - elbows a little in front of the body;
  - feet flat (on the floor or a box);
  - sitting near the front of the bench.
- **S02** Relaxed arms and wrists. Checklist:
  - shoulders down;
  - wrists level with the keys, not drooping;
  - plays 5 notes without stiffening.
- **S03** Curved fingers and stopping if it hurts. Checklist:
  - round "bubble" hand shape;
  - plays on fingertips;
  - knows to stop and tell a grown-up if anything hurts.

### U03 Listen and echo
| Skill | Teach | Questions |
|---|---|---|
| **S01** Up, down or same | "Listen: do the notes climb up, slide down, or stay the same?" | **`contourListen`** (new): 2–3 notes; answer up, down or same. Steps get smaller across the round. |
| **S02** Steady beat | "A beat is steady like a heartbeat." | `rhythmTap`: 4 quarter-note beats with a click, then without it, at 60–80 bpm. Engine timing tolerance as today. |
| **S03** Echo 2–3 notes | "I play, then you play it back." | **`echo`** (implement): 2 notes, then 3, from C–D–E around Middle C. The child plays them back on the piano or keys, judged in order. |

### U04 Explore sound
| Skill | Teach | Questions |
|---|---|---|
| **S01** Loud and soft | "Forte is loud; piano is soft." | Grown-up check, Phase 1. Checklist: plays one note loud then soft on request, three times. (Mic loudness is Phase 2.) |
| **S02** Short and long | "Some notes are short like a hop; some are long like a slide." | `durationCompare`: mixed pairs (1 vs 2, 1 vs 4, 2 vs 4 beats), asking "longer?" or "shorter?". |
| **S03** Make up a 3-note question and answer | "Play 3 notes to ask, then 3 to answer." | Grown-up check. Checklist: plays a 3-note "question" and a different 3-note "answer". |

### U05 Fingers and Middle C (moving into Prep A)
| Skill | Teach | Questions |
|---|---|---|
| **S01** Finger numbers | "Thumbs are 1, pinkies are 5, on both hands." | `finger`: both hands, all 5 numbers, mixed "Which finger is 3?" and "What number is this finger?" |
| **S02** Find Middle C | "Middle C is the white key just left of the two black keys, in the middle." | `notePlay` / `noteFind`: "Play Middle C" (the exact octave counts), mixed with "Play any C". |
| **S03** Rhythm echo with no words | "Listen, then clap it back." | `rhythmTap`: quarter and half notes, 2 measures, no words on screen. |

### U06 C, D and E (Micaela-level finish)
| Skill | Teach | Questions |
|---|---|---|
| **S01** Name C, D and E | "C is left of the 2 black keys, D is between them, E is on the right." | `letterFind`: C, D or E, first in any octave, then "the one nearest Middle C". |
| **S02** Play C–D–E patterns | "Read the letters, then play them." | `notePlay` sequence: 3–5 notes from C, D and E (e.g. C D E D C), on the piano or keys, judged in order. |
| **S03** Quarter and half notes | "A quarter note gets 1 beat; a half note gets 2." | Beats `symbol`: "How many beats?" and "Which note gets 2 beats?" with pictures. |

**End-of-world check (readiness), rev 2:**
- **navigation:** U01-S01, **U01-S02**, U01-S03, U03-S01, U05-S02, U06-S01.
- **timing:** U03-S02, **U04-S02**, U05-S03, U06-S03.
- **performance:** U03-S03, U05-S01, U06-S02.
- **Coverage rule:** every *child-playable* (non-human) Harbor skill appears exactly once. Grown-up items are excluded (owner decision above).
- **The journey gate's own thresholds (`J_ITEMS`/`J_PASS`) are unchanged.** The 9/10 rule (E1) applies to lesson checks, review and transfer, not to Journey Readiness. Changing the gate would need a separate owner decision.

## Rev 2: reconciling ChatGPT's counter-review (2026-11-25 17:50)
These settle the six points in `messages/` (WP-T1 request, Harbor counter-review). They aren't new owner decisions. They tighten how the decisions above are carried out.

**R1. Readiness coverage:** see the revised list above.

**R2. No weaker evidence than the prompt claims.**
- **U01-S01 has two item kinds:**
  - **Group prompts** ("Play a key in a group of 3") can be answered on the piano or the keys, judged by pitch-class membership.
  - **Place prompts** ("the lowest group of 3", "the group nearest the middle") are **on-screen keyboard only** in Phase 1, judged by the exact key.
  
  Place prompts may move to the piano only once WP-0.10 Stage 2 validates exact-MIDI detection over the needed range (the Phase 1 full sweep makes this possible later). A prompt never claims a place and then accepts any octave.
- **U01-S03 "Left and right sides" is spatial and directional, not another high/low listening task.** Its items are:
  - "Tap the left side" or "Tap the right side" (screen);
  - "Which side do the low sounds live on?" (left/right);
  - "Play any note on the left side, then any note on the right side", judged by MIDI below and above the split, with the order required.

**R3. Teach, then guided practice, then the scored check (every playable skill).**
1. **Teach:** a demo with sound, replayable as often as wanted. Acknowledging the teach card is **never evidence**.
2. **Guided attempts:** 2–3 unscored. After a miss, the target may be highlighted. Not recorded as practice or check evidence; recorded only as `guided` in history for display.
3. **Practice round:** existing rules plus E2.
4. **Check round:** scored on first tries, E1.

**Hints never reveal the answer before the first try is scored.** Replaying the prompt is always allowed and doesn't count as an attempt.

**Ordering within skills:**
- **U01-S01:** practice runs group-2 prompts, then group-3, then mixed. Place prompts appear only from the second practice round onwards and in checks.
- **Durations:** steady pulse (U03-S02) comes before durations by ear (U04-S02), which comes before symbols (U06-S03).
- **Sequences:** echo goes 2 notes, then 3. `notePlay` sequences go 3, then 4, then 5 notes, by practice level.

**R4. Real variety: categories, not just distinct signatures.**
- **Question signature** = what the child sees or hears plus what counts as a correct response (the visible prompt, the audio stimulus, the response target). Internal metadata is excluded.
- **Each generator declares its categories.** A 10-item check covers **every category at least twice** (2 for a binary category):

  | Generator | Categories |
  |---|---|
  | keyGroup | group 2 / group 3 × group / place |
  | highLow | asked "higher?" / "lower?" |
  | keyboardSide | tap / which side / play-both-sides |
  | contourListen | up / down / same |
  | durationCompare | longer? / shorter? × pairs 1–2, 1–4, 2–4 |
  | finger | left / right hand × number→finger / finger→number |
  | notePlay | single note / sequence |
  | Beats `symbol` | symbol→beats / beats→symbol / "which lasts longer" pair / count a short line of quarters and halves |

  Only note values that have been introduced are used. No invented values to pad variety.
- **No consecutive duplicate signatures.** After 8 regenerations the generator must return its **declared deterministic alternate** (the next category in rotation). If it has none, the round fails to start with `generation-failed` (logged, test-covered). It never emits a duplicate.

**R5. Evidence for rhythm, echo and sequences.**
- **First attempt:** the learner's first **complete** response to an item.
  - **Note sequences:** the attempt ends at the first wrong note, and that's a miss. Completing every note correctly is a hit.
  - **Rhythm:** the whole pattern is judged by the existing `judgeOnsets`/`rhythmJudge` tolerances.
- **Not scored either way; the item is re-offered:**
  - replaying the prompt;
  - **timeout** (no response within 20 s);
  - **low-confidence or no capture** ("I couldn't hear that clearly");
  - a capture outside the validated range;
  - **cancelling** (the whole round is discarded).
- **A confidently heard wrong note is a miss.**
- **Missing or denied mic permission** switches to the on-screen keys with a notice. Never self-confirmation.
- **Beat-timing tolerance and audio prompts stay separate from note detection.** A task the current renderer or mic can't validate uses its declared supported fallback, or isn't offered. Correctness is never fabricated.

**R6. Version safety (no owner decision needed, because nothing earned is taken away).**
- v3.2 records are kept as they are: state, `passDays`, history.
- Skills whose objective got materially stronger in v3.3 are listed in the build as `recheck: true`, with provenance `{from:'3.2', at}`. For those, the next **review** is scheduled as due. Passing it is recorded as v3.3 evidence. Failing it **doesn't lower an earned state**; it adds a practice suggestion.
- Turning a failed recheck into a downgrade would be an owner decision.
- **Test against real records:** take a profile with v3.2 progress, load v3.3, and check that every state is kept and the rechecks are queued.
- No migration from the original game.
- **Alfred wording:** Harbor is a gentle introduction that *works toward* Prep A skills. We don't claim it completes or matches a published lesson. A Prep A check against the actual edition is a separate task.

## Build and versioning
- **Source:** edit the v3.x source JSON and `tools/curriculum/build_v32.py`, producing `CURRICULUM.id` **3.3**.
- **Objectives:** the lint freezes objectives against `objective_baseline_v32.json` unless the source version rises. Raise it, and regenerate the baseline as **v33** in the same PR (Kevin's decision authorizes it).
- **IDs:** skill IDs stay the same, so saved progress carries over (`isGameCurriculum` accepts 3.x).
- **Placeholder text:** no generated text in prompts. The lint fails on `observe or reflect on this musical task`, `The learner demonstrates:` and any prompt that repeats its own title.
- **Tests:** per-skill variety (≥ 4 distinct questions over 3 rounds; never the same twice in a row), E1–E4 engine tests, and the crawler re-run at 5 viewports. Kevin plays it on the tablet before Amazon starts.

## Not in this PR
- Amazon (next, using Harbor as the model).
- Mic loudness (Phase 2).
- Teach-card art beyond simple pictures (theme work WP-T1 supplies Harbor-styled art).
