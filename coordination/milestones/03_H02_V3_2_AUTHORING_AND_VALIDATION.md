# Milestone 3/10 — H-02 curriculum v3.2: technical coaching and corrections

**Status:** VALIDATED REVIEW CANDIDATE; **not** approved for gameplay swap. Original v3 and v3.1 preserved.

## Quantitative audit
- **9 worlds / 70 stops / 210 skills.**
- Prerequisites: all references exist, no forward references and DFS detected **no cycles**.
- **7 targeted content corrections** to NQ-00 and early NQ-01: left-versus-right keyboard geography no longer masquerades as random note-finding; duration comparisons no longer masquerade as interval recognition; F/G and C key location now use real candidate pitches; bass/treble clef matching uses explicit symbolic questions; grand-staff check uses both staves.
- **12 curriculum prerequisite corrections** remove unrelated or caregiver-only roadblocks from foundational keyboard and early staff study.
- Every skill has a concrete `feedback` contract: supportive first miss, specific follow-up clue, and success phrasing. **This is authored UI copy**, not evidence the engine already returns explanation reasons.
- Every skill has an `assessment.mode` and limitation statement. All content images are **planned keys**, not guaranteed-existing files.
- **65 skills still require new engine types and/or hand-authored options.** Do not load this JSON without generation tests and owner/Claude approval.

## Specific owner/pedagogy commitments
- NQ-00 allows wordless music and pictures, independent of age.
- NQ-01 order remains black-key, white key, Middle C, C position, bass then treble then grand staff.
- Human-observed technique is never converted to false automated microphone confidence.
- 10 permanent competency domains and distinct nine-world locations remain intact.
- `NQ1:` transfer and profile separation are runtime-engine responsibilities, not satisfied by this data-only revision.

## To qualify for engine import
1. Claude pedagogic and schema review of the revised nodes, notably the meaning of `keyGroup`, `keyboardSide`, `durationCompare`.
2. Author the remaining distractor/choice objects and new generators; independently test every automatic skill can produce/check a playable question.
3. Owner approval of curriculum v3 / C4–C8 and C10.
4. Unit/stop independent QA, no impossible progression for pre-readers.
