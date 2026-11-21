# NoteQuest — Piano Education Master Curriculum Hierarchy

**Version:** 0.1.1 — revised location-per-level map (draft)  
**Date:** 2026-11-20  
**Status:** DRAFT FOR OWNER REVIEW; not an approved lesson-by-lesson syllabus  
**Curriculum authority:** ChatGPT designs and maintains the educational hierarchy, prerequisite map, learning objectives, and assessment criteria.  
**Implementation authority:** Claude builds the NoteQuest software using approved curriculum specifications. This document does **not** authorize application code changes or deployment.

## 1. Mission and boundaries

Build one comprehensive, self-guided piano curriculum that takes learners from no prior knowledge toward advanced performance and independent musicianship, delivered through personalized child and adult experiences. The original **Note Quest: Piano Learning Path** (2026-11-20) is the starting source, not a ceiling. Preserve its six biomes, Alfred Prep A–F references, 42 skill stops, rescue themes, and Learn → Practice → Check approach where educationally sound, while developing a book-independent competency framework that can extend for many years.

**Known learners:** Micaela is reported near the end of Alfred's Prep Course A; Kevin and Erika are complete beginners. All three use an acoustic piano, a Samsung Android tablet is the intended learning companion, and the realistic target is **10–20 minutes per session, 3–4 sessions weekly**. All musical styles are in scope. Individual progress is independent; family collaboration is encouraged. Existing piano-teacher instruction, where available, should be supported rather than contradicted.

**Boundary:** This is a curriculum architecture, not UI, game specification, audio-recognition technology design, software backlog, or launch plan. Claude should not infer unapproved technical requirements or begin implementation from draft sections.

**Important limitation:** A self-guided product can teach knowledge, listening, and practice skills, but physical technique and nuanced advanced performance are hard to assess reliably without observation. The curriculum should include self-checks and optional qualified human review at key milestones. The goal is not to promise that automated evaluation is equivalent to expert teaching.

## 2. Hierarchy and naming

```text
NoteQuest Master Curriculum
 ├── Level (NQ-00 through NQ-08)
 │    ├── Unit (NQ-XX-U01 ...)
 │    │    ├── Competency / observable skill (stable ID; to define in v0.2)
 │    │    │    ├── Prerequisites
 │    │    │    ├── Concepts / demonstrations
 │    │    │    ├── Guided exercises
 │    │    │    ├── Acoustic-piano practice
 │    │    │    ├── Formative checks
 │    │    │    ├── Mastery evidence & retention review
 │    │    │    └── Optional extensions / multiple styles
 │    │    └── Unit assessment
 │    └── Level capstone / placement out
 ├── Cross-cutting competency domains (D01–D10)
 ├── Style / repertoire pathways (classical, worship, jazz, pop, etc.)
 ├── Learner presentation tracks (child, adult)
 └── Family collaboration and independent exploration
```

*Levels are NOT Alfred book levels or official RCM/ABRSM grade equivalents.* Units below are a scaffold; individual competencies and lesson scripts are a later deliverable. A unit may span several sessions and may interleave with other units. Skill prerequisites, not calendar time, govern progression.

### World-map rule: one unique location for every level

**Owner direction (2026-11-20): every level must have its own distinct world-map location.** The nine learning levels map one-to-one to nine destinations; no two levels share the same destination. A destination is the setting for that level, not a statement that an Alfred book or earlier game's stop list maps one-to-one to its curriculum content.

| Level | Destination | Curriculum focus |
|---|---|---|
| NQ-00 | **Melody Harbor** (new starting location) | Orientation, discovery and placement |
| NQ-01 | **Amazon Rainforest** (preserved original) | First keys, pulse and musical sentences |
| NQ-02 | **African Savanna** (preserved original) | Elementary reading and two-hand coordination |
| NQ-03 | **Australian Outback** (preserved original) | Foundational fluency and bridge beyond Prep |
| NQ-04 | **Polar Expedition** (original Arctic & Antarctic environment consolidated under one destination name) | Early intermediate independence |
| NQ-05 | **Coral Reef** (preserved original) | Intermediate fluency, harmony and style |
| NQ-06 | **Himalayan Mountains** (preserved original) | Upper intermediate musicianship |
| NQ-07 | **Space Station** (retains source's proposed bonus destination) | Advanced artistry and technique |
| NQ-08 | **Grand Music City** (new lifelong destination) | Independent musicianship, specialization and lifelong study |

**Narrative and instructional separation:** Each new level opens a new location. The original 42 stops across six Alfred-aligned regions remain **curriculum source material and a topical crosswalk**, not an enforced nine-level placement. Source ideas may be sequenced at the level where their prerequisites belong, even if that skill is taught outside its original biome. This location table is a draft curriculum-setting decision for owner review, **not authorization for Claude to build or change the application**.


## 3. Ten permanent competency domains

| ID | Domain | Scope across the full path |
|---|---|---|
| D01 | Keyboard geography & orientation | Key groups, pitch location, register, positions, hand movement, transposition landmarks |
| D02 | Notation & sight-reading | Clefs, grand staff, notes, intervals, rhythms on the page, ledger lines, fluent reading, reading ahead |
| D03 | Pulse, rhythm & meter | Beat, subdivision, note/rest values, counting, meters, syncopation, polyrhythm, groove |
| D04 | Healthy technique & coordination | Bench/posture, relaxation, finger control, articulation, scales, chords, leaps, voicing, pedals, injury avoidance |
| D05 | Ear training, audiation & listening | Pitch contour, rhythm imitation, intervals, chords, harmonic function, transcription, expressive listening |
| D06 | Theory, harmony & musical analysis | Symbols, scales, key signatures, intervals, chords, function, form, modulation, harmonic language |
| D07 | Repertoire, style & interpretation | Song acquisition, phrasing, articulation, dynamics, historical/genre conventions, musical storytelling |
| D08 | Improvisation, composition & arranging | Pattern invention, motives, variation, harmonization, melodic and harmonic creation, arranging |
| D09 | Playing with others & practical musicianship | Duets, accompaniment, lead sheets/chord charts, playing by ear, transposition, ensemble listening |
| D10 | Practice, wellness & performance | Goal setting, feedback, error recovery, deliberate practice, memorization, stage skills, listening critically |

These domains are **parallel strands**, not a sequence of ten courses. Every level advances multiple strands. Each unit carries one primary domain and may carry secondary domain tags.

## 4. Level architecture and units

### NQ-00 — Orientation, discovery and placement
**World-map destination:** Melody Harbor  
**Exit outcome:** Learner understands safe setup, musical high/low and steady beat, and has a trustworthy starting placement; prior knowledge is not erased.

- **NQ-00-U01 — Meet the instrument [D01]:** key types, left/right, high/low, octaves; acoustic piano controls and safe handling.
- **NQ-00-U02 — Healthy setup [D04, D10]:** bench height/distance, relaxed alignment, curved but flexible hands, pain/tension warning signs.
- **NQ-00-U03 — Hear and echo [D05, D03]:** match high/low, echo claps and short sung/playback patterns, establish a pulse.
- **NQ-00-U04 — First sound exploration [D08, D07]:** explore loud/soft, fast/slow, short/long without requiring notation.
- **NQ-00-U05 — Placement and preferences [D02, D06, D10]:** quick reading, rhythm, keyboard, and playing observations; record age-appropriate preferences and accommodations.
- **NQ-00-U06 — Practice orientation [D10]:** learn short-session routine; learn how to stop/recover from mistakes without repetitive strain.

**Capstone:** Demonstrate a relaxed sitting position, locate two- and three-black-key groups, imitate a basic rhythm, and choose an appropriate placement. Micaela may place past early units after a check, rather than being forced to replay them.

### NQ-01 — First keys, pulse and musical sentences
**World-map destination:** Amazon Rainforest  
**Exit outcome:** Recognize keyboard landmarks; play very short melodies with controlled rhythm and simple dynamics; begin reading elementary music.

- **NQ-01-U01 — Black-key landmarks [D01]:** groups of two/three; direction, pitch height, repeated patterns.
- **NQ-01-U02 — Finger numbers and hand freedom [D04]:** fingers 1–5; simple, tension-free patterns with each hand.
- **NQ-01-U03 — White-key names [D01, D02]:** A–G cycle; locate C, F and G using black-key landmarks.
- **NQ-01-U04 — Beat and basic duration [D03]:** quarter, half, dotted-half and whole values, 4/4 and 3/4 at an accessible tempo.
- **NQ-01-U05 — First reading systems [D02]:** moving-up/down letter-note patterns, treble/bass clefs, staff and grand-staff introduction.
- **NQ-01-U06 — First five-note patterns [D01, D04]:** Middle C and C-position concepts, play a melody in each hand; hands alternating before simultaneous notes.
- **NQ-01-U07 — Expression and listening [D05, D07]:** piano/forte, high/low, up/down/same, phrase beginnings/endings.
- **NQ-01-U08 — First mini-performance [D07, D10]:** prepare a familiar short melody, count in, play, self-review, celebrate.

**Capstone:** Play two contrasting very short pieces or exercises, keep a recognizable beat, identify basic notes/symbols, and maintain a comfortable hand/bench setup.

### NQ-02 — Elementary reading and two-hand coordination
**World-map destination:** African Savanna  
**Exit outcome:** Read simple grand-staff music and play short pieces involving different hand positions, rests, articulation and two-hand coordination.

- **NQ-02-U01 — Staff fluency [D02]:** treble/bass landmark notes, intervals as steps/skips; avoid dependency on letter labels.
- **NQ-02-U02 — C and G positions [D01, D04]:** hand placement, position names, safe repositioning.
- **NQ-02-U03 — Intervals 2nd–5th [D02, D05, D06]:** melodic versus harmonic, staff shape, keyboard shape, sound.
- **NQ-02-U04 — Silence has duration [D03]:** quarter/half/whole rests and sustained counting.
- **NQ-02-U05 — Connected and detached [D04, D07]:** legato, staccato, slurs and short phrase endings.
- **NQ-02-U06 — Subdivision and simple meter [D03]:** eighth notes/rests, 2/4, 3/4, 4/4; counting while playing.
- **NQ-02-U07 — Two-hand foundations [D04, D07]:** simultaneous and alternating notes; simple melody/accompaniment textures.
- **NQ-02-U08 — Echoes and duets [D05, D09]:** rhythm echoes, call-and-response, very simple partner parts.

**Capstone:** Play a short two-hand piece and a duet at a stable personal tempo, with clear rests, phrases and recognizable rhythm.

### NQ-03 — Foundational fluency and the bridge beyond Prep
**World-map destination:** Australian Outback  
**Exit outcome:** Move beyond fixed five-finger patterns; navigate accidentals, basic scales and harmony, and play longer beginner pieces.

- **NQ-03-U01 — Accidentals and signatures [D01, D02, D06]:** sharps, flats, naturals, key signatures; enharmonic spelling introduced accurately.
- **NQ-03-U02 — Hand shifts and ledger lines [D01, D02, D04]:** position changes, read beyond five-note ranges, discover landmarks.
- **NQ-03-U03 — First major scales [D04, D06]:** one-octave C, G, then D/F as readiness permits; finger crossings with relaxed motion.
- **NQ-03-U04 — Larger intervals and octave hearing [D02, D05, D06]:** 6ths, 7ths, octaves, melodic/harmonic recognition.
- **NQ-03-U05 — Dotted rhythms and expression [D03, D07]:** dotted quarters/eighths, accents, fermatas, deliberate shaping.
- **NQ-03-U06 — Triads and primary chords [D06, D04]:** chord building, I/IV/V/V7 in friendly keys, simple chord transitions.
- **NQ-03-U07 — Pedal and keyboard color [D04, D05, D07]:** introduction to damper pedal and clean changes; listen for blur.
- **NQ-03-U08 — Patterns, ostinatos and longer songs [D08, D09, D07]:** simple two-hand patterns, accompaniments, 16–32-measure readings where appropriate.

**Capstone:** Perform a beginner repertoire selection with position changes, a basic scale, a simple I–V7 accompaniment, and a short invented pattern.

### NQ-04 — Early intermediate independence
**World-map destination:** Polar Expedition  
**Exit outcome:** Read across more keys, coordinate contrasting hand roles, understand common harmony, and shape convincing musical phrases.

- **NQ-04-U01 — Key fluency [D01, D06]:** major/minor key relationships, circle-of-fifths landmarks, core key signatures.
- **NQ-04-U02 — Scales, arpeggios and cadences I [D04, D06]:** expanding major/minor scales, broken chords, cadence vocabulary.
- **NQ-04-U03 — Compound meter and rhythm I [D03]:** 6/8, triplets, ties across beats, basic syncopation.
- **NQ-04-U04 — Reading by pattern [D02]:** chord shapes, intervals, phrase groups, first reading at sight without rehearsal.
- **NQ-04-U05 — Independence of hands [D04, D07]:** melody/accompaniment balance, Alberti or broken-chord textures, left-hand steadiness.
- **NQ-04-U06 — Functional harmony I [D06, D05]:** tonic/predominant/dominant behavior, simple cadences by ear.
- **NQ-04-U07 — Genre introductions [D07, D09]:** short classical forms, hymns/worship accompaniment, pop lead sheets, blues patterns.
- **NQ-04-U08 — Motives and variations [D08, D10]:** improvise a phrase, vary rhythm or ending, self-assess expressive choices.

**Capstone:** Present contrasting repertoire, sight-read easier unfamiliar music, play scales/cadences at a defined controlled tempo, and accompany a simple melody from chords.

### NQ-05 — Intermediate fluency, harmony and style
**World-map destination:** Coral Reef  
**Exit outcome:** Play more independent textures and substantial music, interpret notation intelligently, and apply basic harmony creatively.

- **NQ-05-U01 — Scales and arpeggios II [D04]:** two-octave patterns where physically appropriate; coordinated motion, even tone, varied articulation.
- **NQ-05-U02 — Chord grammar [D06]:** inversions, seventh chords, diatonic chord families, harmonic progressions.
- **NQ-05-U03 — Reading and transposition [D02, D01]:** more accidentals, denser textures, transposing short patterns and melodies.
- **NQ-05-U04 — Rhythm and groove II [D03]:** swung versus straight feel, compound patterns, syncopated accompaniment.
- **NQ-05-U05 — Pedaling, voicing, balance [D04, D07]:** sustain timing, melodic projection, dynamic gradation.
- **NQ-05-U06 — Form and listening [D06, D05, D07]:** binary/ternary, variation, common harmonic motion, phrase-level analysis.
- **NQ-05-U07 — Real-world playing [D09]:** chord charts and lead sheets; simple worship/pop accompaniment and ensemble timing.
- **NQ-05-U08 — Composition and improvisation II [D08, D10]:** write a short piece; improvise within a progression; practice memorization and recording review.

**Capstone:** Perform contrasting works, read unfamiliar easier music, harmonize or accompany a melody, and present a short original composition/arrangement.

### NQ-06 — Upper intermediate musicianship
**World-map destination:** Himalayan Mountains  
**Exit outcome:** Handle denser polyphony, broader harmonic language and expressive control across several genres.

- **NQ-06-U01 — Technical expansion [D04]:** scales/arpeggios across more keys, double-note preparation, octaves where safe, endurance without tension.
- **NQ-06-U02 — Voice independence [D04, D07]:** contrapuntal lines, voicing inner parts, control of overlapping articulations.
- **NQ-06-U03 — Advanced reading patterns [D02, D03]:** rapid pattern recognition, complex ties/subdivisions, larger register changes.
- **NQ-06-U04 — Harmony and modulation [D06]:** secondary dominants, borrowed chords, related-key modulation, basic harmonic reduction.
- **NQ-06-U05 — Sophisticated listening [D05]:** identify chord quality/inversions, bass motion and cadential patterns, transcribe short phrases.
- **NQ-06-U06 — Stylistic interpretation [D07]:** Baroque, Classical, Romantic, modern, jazz/blues/pop conventions and appropriate articulation.
- **NQ-06-U07 — Ensemble and comping [D09]:** lead-sheet voicings, reading with a singer, rehearsal cues and flexible tempo.
- **NQ-06-U08 — Arranging and program building [D08, D10]:** arrange a song, select a balanced mini-program, record critical listening notes.

**Capstone:** A multi-style program, an independently prepared short work, a sight-reading sample, harmonic listening task, and a collaborative/accompaniment task.

### NQ-07 — Advanced artistry and technique
**World-map destination:** Space Station  
**Exit outcome:** Prepare demanding repertoire and show secure technical, interpretive, analytical and collaborative independence.

- **NQ-07-U01 — Advanced movement efficiency [D04]:** rapid passages, octave/chord control as appropriate, redistribution, tension management.
- **NQ-07-U02 — Complex rhythm [D03]:** cross-rhythm, shifting meter, polymetric/polyrhythmic concepts, rubato without losing structure.
- **NQ-07-U03 — Advanced reading [D02]:** dense scores, nonstandard notation as encountered, score study and rapid preparation strategies.
- **NQ-07-U04 — Harmony and form II [D06]:** advanced chromatic harmony, altered dominants, modal mixture, large-scale forms.
- **NQ-07-U05 — Artistic listening and interpretation [D05, D07]:** voicing, tonal color, style-sensitive pacing, comparative interpretation.
- **NQ-07-U06 — Advanced repertoire studio [D07, D10]:** multiple periods and styles, long-term practice plans, memory and performance readiness.
- **NQ-07-U07 — Creativity and collaboration [D08, D09]:** advanced improvisation/arranging, duet/chamber or singer accompaniment.
- **NQ-07-U08 — Performance resilience [D10]:** mock recital, mistakes and recovery, preparation cycles, reflective critique.

**Capstone:** Substantial multi-work recital or recorded program with analysis, musical contrast, independent learning evidence, sight-reading/ear work, and well-being review. *Not a claim of equivalence to a conservatory diploma.*

### NQ-08 — Independent musician, specialization and lifelong study
**World-map destination:** Grand Music City  
**Exit outcome:** Direct one's own ongoing learning, create and interpret music with intention, and maintain a sustainable lifelong practice.

- **NQ-08-U01 — Self-directed repertoire planning [D07, D10]:** choose attainable stretch repertoire, analyze challenges, schedule preparation.
- **NQ-08-U02 — Specialist technique [D04]:** targeted work for selected repertoire/genre without an unsafe one-size-fits-all requirement.
- **NQ-08-U03 — Advanced harmonic application [D06, D05]:** reharmonization, modal and chromatic systems, listening-based applications.
- **NQ-08-U04 — Composition and orchestration at the keyboard [D08]:** original portfolio, arranging for voice/ensemble or multiple keyboards.
- **NQ-08-U05 — Improvisation pathway [D08, D09]:** choose idiom(s), build vocabulary, perform spontaneously with other musicians.
- **NQ-08-U06 — Accompaniment and leadership [D09]:** rehearsal, cueing, flexible transposition, collaborative decisions.
- **NQ-08-U07 — Interpretation and informed listening [D05, D07]:** comparative recordings, historical practices, personal artistic choices.
- **NQ-08-U08 — Independent portfolio [D10]:** recurring performances, recordings, self-assessment, revision and mentorship choices.

**Capstone:** Learner-defined portfolio with rationale, completed musical artifacts, public/private performance or recorded demonstration, self-critique, and next-year development plan. This is an *open-ended* stage, not a finite game ending.

## 5. Prerequisite architecture (first pass)

1. **Safe movement first:** reasonable bench/hand position and comfortable motion precede speed, octaves and repetitive technical drills.
2. **Pulse precedes notation complexity:** reliable beat → durations and rests → subdivisions → syncopation → compound and cross-rhythms.
3. **Keyboard geography precedes fluency:** black-key groups → letter keys → staff landmarks → reading by intervals/patterns → shifting positions → rapid reading and transposition.
4. **One hand precedes coordinated complexity:** hands separately → alternate hands → simple simultaneous events → melody with accompaniment → independent counterpoint/voicing.
5. **Hearing reinforces reading:** high/low → contour and echo → intervals and chord quality → harmonic function → transcription and sophisticated interpretation.
6. **Harmony is layered:** intervals → triads → I/IV/V/V7 → inversions → functional harmony → chromatic harmony → reharmonization.
7. **Creativity begins immediately:** sound play from NQ-00, not a reward withheld until high-level theory.
8. **Stage gates are multidimensional:** performing one song never substitutes for core reading, rhythm, technique, ear, and practical musicianship.
9. **Review is permanent:** knowledge once learned must reappear in varied keys, rhythms, repertoire and unfamiliar contexts.
10. **A learner may place out:** skip only demonstrated prerequisites; keep optional reinforcement available.

## 6. Relationship to the original six Note Quest regions

The attached user markdown defines **42 stops across six regions** and five running strands. They remain valid *source material* for a child-focused presentation, but the new 10-domain framework is the curriculum authority **once approved**. All nine levels now have a unique destination in Section 2. The map below is an **initial topical crosswalk, not a world-map assignment and not a verified page-by-page Alfred syllabus mapping**.

| Existing region | Source book | Principal content bridge | Proposed curriculum placement |
|---|---|---|---|
| Amazon Rainforest | Prep A | Black/white keys, finger numbers, basic durations, C/Middle C, first grand staff | Mostly NQ-00 / NQ-01 |
| African Savanna | Prep B | G position, steps/skips, 2nds–5ths, rests, legato and phrases | Mostly NQ-02 |
| Australian Outback | Prep C | 2/4, eighths, staccato, accidentals, Middle C position | NQ-02 / NQ-03 |
| Arctic & Antarctic | Prep D | Position changes, C/G scales, damper pedal, longer pieces | NQ-03 |
| Coral Reef | Prep E | Dotted quarters, 6ths–octaves, ledger lines, contrary-motion scales | NQ-03 and selected NQ-04 readiness |
| Himalayan Mountains | Prep F | Triads, I/IV/V7, progressions, syncopation, ostinato, D scale | NQ-03 / early NQ-04 bridge |
| Bonus Space Station | Basic Piano Course Level 3 (proposed in source) | Minor keys, 6/8, chromatic scale and wider repertoire | Candidate NQ-04 themes; verify book contents first |

**Important audit finding:** Alfred's publisher places seating/hand-position instruction at the very beginning of Prep A, and its detailed Prep A concept outline introduces Middle C position before C position. The existing game outline omits the posture start and simplifies the book's sequence; do not claim exact page alignment until an item-by-item crosswalk is completed. Alfred also explicitly presents Prep A–F as a young-beginner course and identifies bridges into its Basic Course. [Alfred official overview](https://www.alfred.com/pages/alfreds-basic-piano-prep-course-overview).

Original map features to retain for future child presentation: five animals per region, Learn → Practice → Check, 2+ star checks as *game feedback*, placement checks, free play, daily review, recitals and teacher-book-page syncing. **Star counts must not become the sole source of educational mastery.** Game unlocks may remain separate from prerequisite-based academic progress.

## 7. Core mastery and assessment system — proposed policy

**Evidence types** (all applicable at each level, difficulty adjusted):

- **Knowledge:** identify and explain a symbol, key, pattern or concept.
- **Rhythm and listening:** clap, count, sing/hum, discriminate or echo an unfamiliar pattern.
- **Instrument demonstration:** play technique/exercise on the real acoustic piano; observe comfort and control.
- **Transfer:** apply skill to a new key, phrase, tune, rhythm or unseen excerpt.
- **Retention:** repeat after a gap without rebuilding from scratch.
- **Artistry/creativity:** demonstrate expression, phrase shaping, accompaniment or an original musical choice.

**Skill states:** Not introduced → Exploring → Developing → Secure → Transferable. A skill advances to **Secure** only after a successful independent demonstration using skill-specific criteria; **Transferable** means the learner can apply it to unfamiliar material. Repeated mistakes trigger targeted support, not penalties. Later retention checks can move a skill back to Developing without erasing progress history.

**Level advancement draft:**

1. Core prerequisite competencies reach Secure, with selected important skills Transferable.
2. Capstone includes repertoire, technique, reading/rhythm, hearing, and one creative or ensemble element where feasible.
3. Demonstration is repeatable on more than one session, not just a lucky game result.
4. A practical posture/comfort check is included; pain is a stop signal, not an acceptable tradeoff for passing.
5. Tempo, accuracy, fluency and musical expectations are **defined per skill and level** during detailed curriculum design; do not adopt one global “three mistakes or fewer” rule.
6. A placement exam can bypass a level only when its core evidence is demonstrated.

**Assessment caveat:** Mic-driven acoustic-piano note and rhythm detection will have imperfect visibility into complex textures and cannot evaluate posture. That engineering limitation belongs to Claude's future technical feasibility work, but the *curriculum* must specify what evidence would establish mastery and when a learner/parent/human reviewer should judge it.

## 8. Learner pathways and session design

**Single competency model, multiple teaching presentations.** The child and adult tracks use the same prerequisite standards, while illustrations, vocabulary, pacing, choice of repertoire, and rewards can differ. Micaela receives initial placement near the Prep A topics, subject to demonstration; Kevin and Erika begin at NQ-00. All three progress separately.

**Practice baseline:** 3–4 sessions weekly, 10–20 minutes each. No level-duration promise and no artificial calendar lock. Advanced proficiency can take many years, depending on practice quantity, quality, and individual goals.

- **10-minute example:** 2 min comfortable setup/warm-up + 3 min one target competency + 4 min real-piano application + 1 min reflection/review.
- **20-minute example:** 3 min warm-up + 5 min new/reviewed competency + 9 min real-piano repertoire/creative application + 3 min self-check/retention.
- **Every few sessions:** reintroduce older skills and unfamiliar examples rather than repeating only the current piece.
- **Family activity:** duet, shared rhythm challenge, call-and-response, accompaniment or family recital at each learner's level; never require equal playing ability.

## 9. Genre pathways, parallel not competing

The comprehensive core is genre-independent. After basic foundation, optional repertoire/skills tracks should sample **classical, worship/hymns, gospel, contemporary pop/rock, jazz/blues, country/folk, film, video-game, seasonal and original music**. Genres share foundational competencies but develop extra idioms, ear skills, accompaniment patterns and reading conventions. No genre is a prerequisite for mastering another. Repertoire choices must respect rights/licenses; this curriculum does not reproduce copyrighted music.

## 10. Quality gates and planned work sequence

| Gate | Deliverable | Responsible | Decision rule |
|---|---|---|---|
| H-01 | Master level/domain/unit hierarchy (this document) | ChatGPT | Owner reviews scope and sequence; **DRAFT** now |
| H-02 | Skill register: atomic competencies with stable IDs, prereqs, measurable outcomes | ChatGPT | Every unit decomposed; no orphan prerequisites |
| H-03 | Source crosswalk: each of 42 existing stops to atomic skills; Alfred mapping verified separately | ChatGPT | No unsupported book/page equivalence claims |
| H-04 | Lesson and exercise outlines for each skill | ChatGPT | Includes misconceptions, child/adult adaptations, real-piano practice |
| H-05 | Assessment rubrics, examples, retention plan and capstones | ChatGPT | Human/automated evidence boundaries explicit |
| H-06 | Repertoire and genre coverage matrix; beginner-to-advanced gap audit | ChatGPT | Balanced progression, lawful source strategy |
| H-07 | Approved curriculum handoff package | ChatGPT → Claude | Versioned, frozen educational requirements provided; implementation permission separate |
| H-08 | Software planning/build/integration | Claude | Claude implements only against approved version and own project governance |

**No approval implied:** This v0.1.1 revises the first architecture for discussion, not a frozen syllabus or a Claude build instruction. Next curriculum action: owner review and refinement of levels/domains; then produce the detailed atomic skill inventory (H-02).

## 11. Reference frameworks and status of claims

- **Source of existing themes and current stops:** user-attached *Note Quest: Piano Learning Path* (2026-11-20), 6 regions / 42 stops / 5 strands. Material has been preserved or cross-referenced, not silently treated as a verified publisher lesson index.
- **Alfred Music:** [official Prep Course overview](https://www.alfred.com/pages/alfreds-basic-piano-prep-course-overview) documents intended audience, concept sequence for Prep A, and A–F to Basic Course transition options.
- **The Royal Conservatory of Music:** [Curriculum and Disciplines](https://www.rcmusic.com/learning/about-the-royal-conservatory-certificate-program/curriculum-and-disciplines) describes repertoire, technique, musicianship and musical literacy as complementary across levels; [RCM piano syllabus overview](https://shopus.rcmusic.com/products/piano-syllabus-2022-edition) identifies preparatory through Level 10 and diploma tracks.
- **ABRSM:** [Piano practical grades](https://www.abrsm.org/en-gb/piano) use repertoire, scales/arpeggios, sight-reading and aural tests as distinct components; 2027–28 repertoire has been announced, but NoteQuest levels are **not** asserted equivalent to ABRSM grades.

**Method:** The 9-level / 10-domain NoteQuest hierarchy and unit labels are original design proposals informed by the user source and the general multi-strand structure above, not copied official certification levels. All cross-framework equivalences require future verification.

**Version note (v0.1.1):** Applied owner direction to assign exactly one distinct location to each level NQ-00–NQ-08, retaining original six environments and proposed Space Station, with new Melody Harbor and Grand Music City. No competencies, units, mastery policy, code, or level-to-book equivalence changed.