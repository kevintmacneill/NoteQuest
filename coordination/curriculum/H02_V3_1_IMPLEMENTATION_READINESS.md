# NoteQuest H-02 v3.1 — parameterized curriculum candidate

**Date:** 2026-11-20 · **Curriculum architect:** ChatGPT · **Status:** detailed, unapproved H-02 candidate. Preserve original `curriculum-v3-h02.json` and `curriculum-v3.md` as the prior reviewed draft. This separate v3.1 candidate is for Claude's review, not a runtime data swap or permission to merge.

## Review addressed
Claude's `curriculum-v3-review.md` found placeholder content, a one-chain prerequisite graph, incorrect Prep A sequence, repetitive titles, and missing picture keys. This candidate addresses them **without claiming that all 210 question sets are playable**.

- **9 levels, 70 stops, 210 atomic skills.** The nine region names and existing unit identifiers stay in place.
- **Real strand-based prerequisite graph:** 0–2 predecessors per skill, usually within the same competency domain, rather than a single global chain; 10 roots; 11 cross-domain checks. Checkpoint IDs are explicit.
- **Pedagogical correction at NQ-01:** black-key/finger exploration → white names → Middle C → C position and 3/4 → bass staff → treble staff → grand staff and short recital. The existing stop IDs remain stable.
- **Machine content shape for every skill:** `content.type` plus pitches, choice symbols, rhythm patterns, listening registers, or human-check prompts. Child wording and `skill-...` illustration lookup keys are provided.
- **Required reading** flags apply only where word-reading is needed in upper levels; staff notation itself is not classified as written-word reading.
- **Human verification** on 110 skills is explicit; monophonic microphone scores are never presented as measuring two-hand technique, chord quality, posture or expression.

## Question type inventory
```json
{
  "keyGroup": 5,
  "highLow": 2,
  "noteFind": 4,
  "self": 42,
  "caregiver": 48,
  "rhythmTap": 16,
  "echo": 1,
  "interval": 16,
  "conceptChoice": 13,
  "notePlay": 10,
  "symbol": 5,
  "finger": 2,
  "letterFind": 3,
  "contourRead": 2,
  "noteName": 7,
  "chordQuality": 6,
  "beats": 1,
  "scaleBuild": 3,
  "keySignature": 4,
  "teacher": 20
}
```

**Implementation boundary:** 65 skills currently use either new question types or still need hand-authored choice/distractor options. They are clearly marked with `requiresEngineType` or `requiresAuthoredOptions`. The existing API 1.2 engine supports only its published type subset; **do not simply drop v3.1 into the live engine and assume the full curriculum plays**.

## Claude review requested
1. Independently validate all prerequisite edges for pedagogical reasonableness (not just DAG shape), particularly between domains and beginner pre-reader access.
2. Review the NQ-01 Prep A order and evidence on Middle C, C-position and two staves.
3. Confirm `content.type` schema, identify any first wave of new question generators (`interval`, `echo`, `chordQuality`, `scaleBuild`, `keySignature`, `contourRead`, `conceptChoice`) and data validation checks.
4. Work with curriculum architect to replace remaining concept-choice prompts with specific verifiable answers and distractors.
5. Ask owner for **C4–C8/C10 and v3 acceptance** before replacing the engine test sample.

**Scope:** All nine levels are planned in detail; technical playability and owner curriculum approval remain separate gates.

## Independent schema audit (post-authoring check)

The published Engine API 1.2 has **15 supported question types**. On exact type comparison, **65 of 210** v3.1 skills use not-yet-supported generators, including **20 teacher-confirmed** skills. This corrects the initial estimate of 45, which had omitted the teacher-type gap. The engine must implement a teacher-confirmation pathway or map it explicitly to a human-check adapter; do not silently treat teacher evidence as automatically verified. Two beginner black-key group skills include manual follow-up for the alternate group until the question generator supports a mixed two-and-three-group lesson.
