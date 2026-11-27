# NoteQuest — Master Curriculum v3 (all nine levels, detailed planning draft)

**Version:** 3.0 DRAFT | **Date:** 2026-11-20 | **Curriculum owner:** ChatGPT | **Approval:** Kevin pending | **Engine:** Claude
**Not an approved release.** This is a full nine-level plan for owner and Claude review, with a separate machine-readable H-02 skill register. No engine/gameplay code is changed in this commit.

## Owner decisions honored

- **C1 YES:** beginner level boundaries earlier: Prep A, Prep B, Prep C–D, Prep E–F, then intermediate onward; exact Alfred page equivalence **not asserted**.
- **C2:** pre-reader picture/listening path, no assumed word reading; Zoe knows A–G, and names may come with picture cues; profiles remain available to any learner.
- **C3 NO:** no follow-my-lesson-book mode. Placement and demonstrated skills, not teacher-book progress, drive navigation.
- **C9:** every one of nine levels detailed now, ahead of the curriculum engine's eventual full adoption.
- Distinct locations remain Melody Harbor, Amazon Rainforest, African Savanna, Australian Outback, Polar Expedition, Coral Reef, Himalayan Mountains, Space Station, and Grand Music City.

## Proposed items awaiting owner approval

- **C4:** independent presentation and word-reading preference, unrelated to age, with caregiver-supported picture-first lessons.
- **C5:** each atomic skill declares evidence types; microphone can validate only single notes, not chords, both hands, pedal, posture or phrasing.
- **C6:** proposed mastery and review defaults; performance is human-confirmed where the app cannot measure it. Missing a review never removes access to music.
- **C7:** adaptive daily practice plan, 10–20 minutes; no forced weekly attendance.
- **C8:** original/public-domain in-app score material; learner's own copyrighted sheet music can be practiced without duplicating it into the app.
- **C10:** optional adult chord/lead-sheet path after primary triads; ergonomics and authentic notation remain central.

## Common instructional architecture

Each stop follows **Learn → Practice → Check**. The learner chooses a profile, may take non-punitive placement, visits one of nine distinct regions, and encounters 6–8 visible unit stops. Every unit includes three separately specified micro-skills. Completion evidence must match its actual instrument capability. The application cannot claim to grade two hands, dynamics, hand shape, or pedal through monophonic microphone detection.

**Evidence vocabulary:** `quiz` = on-screen notational/theoretical response; `keys` = tap keyboard geography; `mic` = one note from acoustic piano; `tap` = timed rhythm interaction; `listen` = recognition by ear; `self` = prompted reflection; `caregiver` = optional observer; `teacher` = optional teacher or independent expert. Word-reading requirements do not mean that staff-reading is banned from nonreading profiles.

**Prerequisites:** a strictly sequential initial learning route connects atomic skills across units/levels. Placement can establish equivalent prerequisites by demonstration; learners may still revisit any accessible prior stop. The progression graph is a first pedagogic draft, not an excuse to lock away all free exploration.

## Nine level-by-level plans

### NQ-00 — Melody Harbor
**Focus:** Orientation, pre-reading musical exploration, placement.
**Reference:** Before Prep A / accessible entry. **Scope:** 6 stops; each includes 3 defined skills.

> **Remapped 2026-11-27 (Kevin, live call):** Melody Harbor now covers **all of Alfred's Basic Piano Prep Course Level A and nothing beyond it**. **Focus:** the whole first book — keyboard geography, healthy hands, finger numbers, steady beat, quarter/half/dotted half/whole notes, 4/4 and 3/4, bar lines, repeat signs, `f`/`p`, white keys A–G, Middle C position and C position, and first bass, treble and grand staff reading. **Reference (`alfredRef`):** `Alfred's Basic Piano Prep Course Level A — full book, mastery not rushing`. **Scope:** 12 stops, 46 skills. The stop table below is the historical v3.0 draft; the canonical Harbor curriculum is `HARBOR_PREP_A_CURRICULUM_SPEC.md`.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-00-U01: Meet the piano | Find groups of two and three black keys; Show high versus low ends of the piano; Find left and right keyboard sides | keys, listen, keys |
| NQ-00-U02: Comfortable setup | Choose a comfortable bench distance; Demonstrate relaxed arms and wrists; Notice and stop when tension or pain occurs | self, caregiver, self |
| NQ-00-U03: Listen and echo | Tell high sounds from low sounds; Tap a steady four-beat pulse; Echo a short two- or three-sound pattern | listen, tap, listen |
| NQ-00-U04: Explore sound | Play loud and soft intentionally; Explore short and sustained notes; Create an original three-sound question and answer | self, listen, self |
| NQ-00-U05: Gentle placement | Find matching black-key groups without prompts; Echo a rhythm with no written words; Attempt a note-name or staff sample without pressure | keys, tap, quiz |
| NQ-00-U06: Practice together | Choose one short task to practice; Use a hint or caregiver help without penalty; Finish a brief exploration and reflect on what improved | self, self, self |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-01 — Amazon Rainforest

> **Rescope pending (2026-11-27):** with Melody Harbor now covering all of Prep A, the Amazon stops below (black keys, finger numbers, white keys, steady beat and values, first staff reading, five-note positions, first recital) duplicate Harbor. Amazon shifts to **Prep B** (intervals 2nds–5ths, moving hand positions, rests, legato/staccato, eighth notes, hands together), keeping Prep A only as review/placement. Worlds 3–5 shift to cover Prep C–F; details in `HARBOR_PREP_A_CURRICULUM_SPEC.md` §6, pending Kevin.
**Focus:** First keys, rhythm values, letter notes and grand staff.
**Reference:** Approx Prep A; book order is reference only. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-01-U01: Black-key paths | Recognize groups of two versus three black keys; Play a short ascending black-key path; Echo descending and repeated black-key patterns | keys, mic, listen |
| NQ-01-U02: Finger numbers | Identify thumb as finger 1 on either hand; Show fingers 1 through 5 on hand diagrams; Play a relaxed three-finger echo on the piano | quiz, keys, caregiver |
| NQ-01-U03: White-key names | Use two-black-key group to locate C; Find F using three-black-key group; Identify adjacent notes through the A–G letter cycle | keys, keys, quiz |
| NQ-01-U04: Steady beat and values | Tap four quarter-note pulses; Hold half and whole notes for counted beats; Read dotted-half notes in three-beat music | tap, tap, quiz |
| NQ-01-U05: First staff reading | Recognize up/down/same written pitch direction; Locate a Middle C note and treble/bass clefs; Read a basic two-staff grand-staff example | quiz, quiz, quiz |
| NQ-01-U06: Five-note adventures | Find C position with a relaxed hand; Play a single-hand C–D–E–F–G pattern; Alternate simple two-hand phrases without overlap | keys, mic, caregiver |
| NQ-01-U07: Listen and express | Choose a sound that is louder or softer; Match piano and forte symbols to sounds; Shape one simple musical question-and-answer phrase | listen, quiz, self |
| NQ-01-U08: First recital | Count in to a short prepared melody; Play a short single-hand beginner piece; Reflect on one accurate and one improvable moment | tap, mic, self |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-02 — African Savanna
**Focus:** Prep B-type reading, rests, intervals and first coordination.
**Reference:** Approx Prep B; unverified exact pages. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-02-U01: Staff landmarks | Locate treble and bass clefs and staff line/space landmarks; Read a second or third by relative shape; Find familiar staff notes without letter stickers | quiz, quiz, keys |
| NQ-02-U02: Moving positions | Find C-position hand placement on either hand; Shift from C to G position without twisting; Play one short line after a controlled position change | keys, caregiver, mic |
| NQ-02-U03: Intervals 2 to 5 | Identify melodic second and third in notation; Find a fourth and fifth on the keyboard; Distinguish melodic versus simultaneous intervals | quiz, keys, listen |
| NQ-02-U04: Read the rests | Identify whole and half rests; Tap measures containing quarter rests; Maintain four beats of silence without losing pulse | quiz, tap, tap |
| NQ-02-U05: Connected and detached | Recognize legato versus staccato signs; Play connected versus detached single-line patterns; End a short slur/phrase comfortably | quiz, caregiver, self |
| NQ-02-U06: Eighth-note energy | Count paired eighth notes steadily; Read 2/4, 3/4, and 4/4 measures; Perform a short eighth-note tap exercise | tap, quiz, tap |
| NQ-02-U07: Two hands begin | Play one note with both hands at the same time; Alternate left- and right-hand measures; Perform simple melody with sustained accompaniment | caregiver, caregiver, caregiver |
| NQ-02-U08: Echo and duet | Copy a four-beat rhythmic question; Take turns with a partner without losing pulse; Complete a short two-part phrase and reflect | tap, caregiver, self |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-03 — Australian Outback
**Focus:** Prep C–D-type reading/technique: eighths, articulation, first scales.
**Reference:** Approx Prep C–D; exact pages unverified. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-03-U01: Accidental discovery | Identify sharp flat and natural symbols; Find altered white-key and black-key pitch locations; Read a short accidental-based one-hand phrase | quiz, keys, mic |
| NQ-03-U02: Hand journeys | Read a position change beyond five fixed notes; Shift one hand between two landmarks smoothly; Play a short excerpt containing one hand move | quiz, caregiver, mic |
| NQ-03-U03: Eighth-note paths | Recognize eighth-note beaming and rests; Tap eighth/quarter patterns with an even pulse; Count an eighth-note pattern while playing one hand | quiz, tap, caregiver |
| NQ-03-U04: Staccato and accents | Distinguish slur, dot, and accent visually; Perform detached versus connected phrases; Shape a contrasting loud/soft phrase | quiz, caregiver, self |
| NQ-03-U05: Major-scale trail | Recognize the C major whole/half-step map; Play C major one octave with safe fingering; Try G major after locating F# | quiz, caregiver, caregiver |
| NQ-03-U06: Bigger intervals | Read a sixth versus seventh on the staff; Recognize an octave on piano and page; Listen for octave equivalence | quiz, keys, listen |
| NQ-03-U07: Pedal colors | Locate a sustain pedal and explain its sound; Press and release pedal without blur in one chord; Choose when no pedal is more appropriate | self, caregiver, self |
| NQ-03-U08: Outback music path | Play a two-hand repeating accompaniment pattern; Improvise a short melody over a repeated pulse; Perform a 16-measure excerpt with a review | caregiver, self, caregiver |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-04 — Polar Expedition
**Focus:** Prep E–F bridge: reading beyond staff, triads, primary chords and minor.
**Reference:** Approx Prep E–F; no verified page-level equivalence. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-04-U01: Ledger-line explorer | Locate common notes beyond the five-line staff; Read one ledger line above/below a familiar clef; Play a melody requiring safe position shifts | quiz, quiz, mic |
| NQ-04-U02: Dotted rhythm guide | Read dotted-quarter-plus-eighth relationships; Tap dotted rhythm against a steady beat; Read tied notes across a measure boundary | quiz, tap, tap |
| NQ-04-U03: Sixths and octaves | Identify sixth and octave shapes; Hear ascending and descending octave motion; Read a phrase that spans a sixth or octave | quiz, listen, quiz |
| NQ-04-U04: Triad foundations | Build a C major triad from stacked thirds; Recognize major versus minor triad formula; Play blocked and broken triads comfortably | keys, quiz, caregiver |
| NQ-04-U05: Primary chords | Identify tonic, subdominant, and dominant in C; Play I–IV–V7 with smooth motions; Accompany a melody with simple primary chords | quiz, caregiver, caregiver |
| NQ-04-U06: Minor atmosphere | Hear a major versus minor tonic mood; Find relative minor of C/G major; Play a short A minor melody and primary chord | listen, quiz, caregiver |
| NQ-04-U07: Scale and pedal changes | Play C or G scale with improved evenness; Use controlled pedal on a simple cadence; Coordinate melody against repeating bass pattern | caregiver, caregiver, caregiver |
| NQ-04-U08: Prep bridge recital | Read a short unfamiliar 8-bar phrase; Prepare a contrasting two-hand piece; Complete a self/caregiver capstone showing safe technique | quiz, caregiver, caregiver |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-05 — Coral Reef
**Focus:** Early intermediate: keys, 6/8, independent hands, harmony and genre.
**Reference:** Post-Prep bridge; independent level, not a book equivalent. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-05-U01: Key families | Match common key signatures to tonic names; Identify relative major/minor pairs; Transpose a short five-note pattern to a new key | quiz, quiz, keys |
| NQ-05-U02: Arpeggio currents | Play major and minor scale models in two keys; Arpeggiate a triad with correct chord tones; Perform a simple I–IV–V cadence without tension | caregiver, caregiver, caregiver |
| NQ-05-U03: Compound waves | Feel compound 6/8 in two large beats; Tap triplets against quarter-based rhythm; Read simple syncopation and ties without rushing | tap, tap, tap |
| NQ-05-U04: Reading patterns | Spot triad and interval patterns in notation; Read an unseen short excerpt at modest tempo; Mark repeated motives in a two-hand score | quiz, teacher, quiz |
| NQ-05-U05: Hands with independence | Keep left-hand accompaniment while right plays melody; Voice melody louder than accompaniment; Demonstrate an Alberti/broken-chord pattern | caregiver, caregiver, caregiver |
| NQ-05-U06: Harmonic direction | Hear tonic versus dominant ending; Identify I–IV–V functions in a short phrase; Select a supporting chord for a given melody note | listen, quiz, quiz |
| NQ-05-U07: Many music styles | Identify a classical mini-form and a blues pattern; Read simple pop or worship chord symbols; Play a stylistic 8–16-bar accompaniment | quiz, quiz, caregiver |
| NQ-05-U08: Invent variations | Change the rhythm of a two-measure motive; Create a four-measure variation with a clear ending; Record/listen and explain one creative choice | self, self, self |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-06 — Himalayan Mountains
**Focus:** Intermediate through upper intermediate: voicing, chords, improvisation and ensemble.
**Reference:** Independent intermediate/upper intermediate. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-06-U01: Technique and stamina | Play two-octave scales in a comfortable key; Use arpeggio motion with relaxed rotation; Create a safe short exercise for an uneven passage | caregiver, caregiver, self |
| NQ-06-U02: Chord grammar | Name root, first, and second inversion triads; Form basic dominant and minor seventh chords; Voice a smooth ii–V–I in one friendly key | quiz, keys, caregiver |
| NQ-06-U03: Dense reading | Read multiple accidentals and wider leaps; Transpose a short melody by a step or fifth; Tap syncopated and compound patterns accurately | quiz, caregiver, tap |
| NQ-06-U04: Voices and pedal | Bring a melodic top line forward in chord textures; Play two overlapping voices with distinct articulation; Choose clean pedal timings for changing harmony | caregiver, caregiver, caregiver |
| NQ-06-U05: Harmony and ear | Recognize secondary dominant by sound and notation; Identify common cadence/chord bass motion; Analyze a short modulation to a related key | listen, listen, quiz |
| NQ-06-U06: Stylistic repertoire | Compare two historic articulation approaches; Play a short blues/swing/pop stylistic study; Document a stylistic interpretation choice | self, caregiver, self |
| NQ-06-U07: Ensemble and lead sheets | Comp a simple pop/worship lead sheet; Adjust tempo and cue a partner appropriately; Accompany a melody while keeping the singer audible | caregiver, caregiver, teacher |
| NQ-06-U08: Compose and arrange | Arrange a melody using chord inversions; Compose eight to sixteen measures with contrast; Present a recorded mini-program and reflect | self, self, teacher |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-07 — Space Station
**Focus:** Advanced artistry, complex reading, harmony and artistic resilience.
**Reference:** Advanced independent study, no Alfred equivalence. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-07-U01: Advanced movement | Choose safe movement for rapid passages; Control octaves and chord leaps without pain; Design a redistribution/fingering plan for a dense phrase | caregiver, teacher, self |
| NQ-07-U02: Complex rhythms | Read mixed meter and shifting beat groups; Perform a simple 3-against-2 cross-rhythm; Explain rubato while retaining a shared pulse | tap, caregiver, self |
| NQ-07-U03: Advanced score reading | Find musical structure in a dense score; Explain an unfamiliar symbol using a reliable edition; Prepare an unseen multi-voice passage with a plan | quiz, self, teacher |
| NQ-07-U04: Chromatic harmony | Spell a secondary dominant and altered dominant; Analyze modal mixture in a phrase; Explain a longer harmonic trajectory in a movement | quiz, quiz, self |
| NQ-07-U05: Expressive ear | Compare voicing in two recordings; Plan dynamic and tonal-color contrasts; Make and evaluate an interpretation recording | listen, self, self |
| NQ-07-U06: Advanced repertoire studio | Build a multi-week practice schedule for a major work; Perform contrasting repertoire excerpts; Audit readiness by memorization/performance checks | self, teacher, teacher |
| NQ-07-U07: Advanced creativity | Improvise across a richer progression; Arrange two-part textures for collaborators; Rehearse a duet with prepared cues and balance | self, self, teacher |
| NQ-07-U08: Performance resilience | Run a mock recital without stopping at every error; Practice recovery after an intentional interruption; Write evidence-based next-stage goals | teacher, self, self |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

### NQ-08 — Grand Music City
**Focus:** Independent musician: lifelong repertoire, composition and collaboration.
**Reference:** Open-ended advanced/lifelong pathway. **Scope:** 8 stops; each includes 3 defined skills.

| Stop | Learn / practice / check skills | Primary check methods |
|---|---|---|
| NQ-08-U01: Repertoire planner | Select a realistic stretch work and explain the choice; Break the work into measurable practice goals; Track progress toward a meaningful performance | self, self, teacher |
| NQ-08-U02: Specialist technique | Diagnose a recurring technical problem safely; Select repertoire-specific exercises without strain; Demonstrate improved passage control over time | self, teacher, teacher |
| NQ-08-U03: Advanced harmony in use | Reharmonize a melody with justified choices; Compare modal and chromatic harmonic colors; Play a short transposed progression by ear | self, listen, caregiver |
| NQ-08-U04: Write and orchestrate | Compose an original complete piece; Arrange a piece for singer or ensemble; Revise a composition after recording/feedback | self, teacher, self |
| NQ-08-U05: Independent improviser | Choose an idiom and build motif vocabulary; Improvise a coherent solo with clear form; Participate in a live call-and-response performance | self, teacher, teacher |
| NQ-08-U06: Accompany and lead | Prepare an accompaniment for another musician; Signal entries and adapt to rehearsal changes; Transpose or simplify live while supporting an ensemble | teacher, teacher, teacher |
| NQ-08-U07: Listen and interpret | Compare recordings with stylistic observations; Research interpretive practice responsibly; Present and defend an individual artistic interpretation | listen, self, teacher |
| NQ-08-U08: Lifelong portfolio | Record a personally meaningful performance; Assess strengths/gaps using evidence; Define a next independent musical project | teacher, self, self |

**Level checkpoint:** An unfamiliar musical task and a human-confirmed musical performance or reflection when applicable; use registered evidence rather than stars or pet rewards to infer mastery.

## Nine-region rescoping and crosswalk caution

The earlier hierarchy grouped most of Prep C–F into NQ-03. This revision distributes an approximate C–D bridge in Outback and E–F bridge in Polar, then puts early intermediate in Coral Reef. This is **pedagogical sequencing**, not a claim that proprietary book pages or exams are verified. The original Alfred six themed regions also should not be confused with nine mastery locations.

## Implementation readiness gates

- **H-02:** all 70 units, 210 atomic skills, explicit IDs, objective, prerequisites, evidence, word-reading flag, focus and approximate Alfred reference are in `curriculum-v3-h02.json`; generated and checked.
- **H-03:** exact Alfred Prep B–F source/page crosswalk still **unverified**; do not map pages automatically.
- **H-04:** lesson scripts, examples and listening media remain **to author** for each skill; this planning milestone is not 210 finished interactive lessons.
- **H-05:** default mastery thresholds are proposals, not automatically approved rubrics; require calibration and human judgment.
- **H-06:** review repertoire/original composition, inclusive genres, accessibility and licensed media before full production.
- **H-07:** Claude independent review, owner acceptance, then code data integration via reviewed PR. Engine API 1.2 currently has sample learn data: do not overwrite without an accepted migration plan.

## Validation results

- 9 unique level IDs and 9 distinct map locations.
- 70 units/stops, 210 unique atomic skills.
- All prerequisites resolve to known skill IDs; all skill evidence values are from the defined vocabulary.
- Each stop contains exactly three skills and a checkpoint; no UI/engine implementation is claimed.
