# Milestone 6/10 — Personalized learner experience, accessibility and feedback

**Owner:** ChatGPT · **Status:** standalone proof of interaction, not merged into playable application.

## Profile and ability are separate concepts
Any person can create a profile. Do not hard-code people, birth dates, named children, level floor, or a mandatory child look. Presentation preference (`picture`, `child`, `adult`) is independent from note-reading, music proficiency and age. Each profile has independent coins, learning, pets and achievements; toggles must not overwrite another learner's setting.

## UI responsibilities by entry point
- **Profile selection:** visible avatar/icon, selected identity and clear independent workspace; accessibility name includes full learner name. Show no other profile's saved errors or personal scores.
- **First-time placement:** optional low-pressure skill sample. Starting at absolute zero works without word reading, voice prompts, or a parent typing. Advanced learners can demonstrate prior skills using appropriate proof.
- **Today's Practice:** render `NQ.learn.today(10|20)` from the engine; do not invent a learner's mastery state. Each activity communicates what and why, and can be skipped or retried when the engine allows.
- **Feedback cards:** three layers: (1) instant outcome and one correction, (2) why that concept works, (3) a tailored next short practice. Use engine response `correct/firstTry/reveal/judge/result` and authored curriculum explanation. Do not fabricate acoustic evidence from UI-only taps.
- **Accessibility:** 44px+ hit areas (ideally 52–60px), focus and pressed states, semantic headings and alert/live feedback, contrast checks, reduced motion, scalable text, touch orientation. No reliance on color or sound alone. Pre-reader task can be completed without reading words; defer automatic voice and show its gap openly.
- **Review mode:** provide practice for previously acquired skills; a failed review informs future work without deleting their prior music or pets.
- **Adult interface:** same curriculum/learning goals, compact wording and clean typography rather than forced nursery language.

## Content-state contract
`NQ.learn.learner()`, `setLearner(...)`, `today(minutes)`, `skillState(skillId)`, `start(skillId,mode)`, `answer(roundId,value)`. The UI must validate `NQ.learn` existence while PR #4 is unmerged and display an honest unavailable state rather than fake achievements or bypassing the progression engine.

## Demonstration and independent checks
[Preview](../design/prototypes/learner-home-v0.1.html) provides three **fictional sample profiles** and independent picture/child/adult presentation. It illustrates planned differences, not actual persistence. Changing presentation for one simulated profile must not affect another; no rewards, save codes, coins or personal data are persisted by the demonstration.

### Acceptance tests (before app integration)
1. Create/select two profiles and confirm **all** values remain isolated.
2. Picture-first profile can reach a keyboard task without reading instructions.
3. Adult profile receives respectful, concise wording.
4. Skill placement is based on demonstrated competence, not the name/age or type of avatar.
5. Learning engine absence shows "Not available yet" and never creates mock proficiency.
6. Actual note result contains note/pitch evidence; a human-check result is explicitly labeled.
7. Reduced motion still communicates outcomes.
8. No existing `noteQuest.v1`/`NQ1:` import corruptions.
9. Live Android tablet needs separate hands-on QA.
