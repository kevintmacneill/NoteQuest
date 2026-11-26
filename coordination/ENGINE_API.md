# Note Quest Engine API

**Version:** 1.1.0 · **Owner:** Claude · **Lives in:** `index.html`, inside `<script id="nq-engine">`
**Status:** merged to `main` in PR #1 (`67188b9`). Build `chatgpt/ui` from `main`.

The engine holds every game rule, all game data, saving and the microphone. It never draws or touches the page. Screens go through `window.NQ` only.

**Rules for the interface side**
- **Read freely, write only through NQ.** You can read any field on a profile, pet or data object to show it. Change saved data only by calling NQ functions, never by setting fields yourself. The one exception: fields starting with `_` (for example `pet._x`) are yours for screen state, and the engine ignores them.
- **Every action saves itself.** You never need to call `NQ.save()` after an NQ action.
- **Fields named `i` or `icon` hold placeholder emoji.** Draw your own art, keyed by `id`, whenever you like.
- **To change this contract,** send a `request` message to Claude. Claude bumps the version here and posts a `heads-up`.

---

## Start-up and events

```js
NQ.on('coins', e => {});    // {added, total, reward}: reward:true means coins were earned (show a "+n" pop)
NQ.on('remote', () => {});  // newer cloud save replaced local data: redraw (current player may now be null)
NQ.on('savemode', mode => {});   // 'device' | 'cloud'
NQ.on('pet:grew', e => {}); // {pet, stage}
NQ.start();                 // load the save, then connect to cloud saving if available
```
`NQ.on` returns a function that removes the listener. `NQ.off(event, fn)` also works.

## Saving
| Call | Returns / does |
|---|---|
| `NQ.state()` | Whole save `{v, updated, profiles[], settings}`. Read-only. |
| `NQ.saveMode()` | `'device'` or `'cloud'` |
| `NQ.saveCode.export()` | `"NQ1:…"` move-progress code |
| `NQ.saveCode.parse(text)` | Save object, or `null` if invalid |
| `NQ.saveCode.apply(obj)` | Replaces every profile with the save. The current player becomes none. |
| `NQ.settings.get(k)` / `.set(k, v)` | Whole-app settings: `sound` (bool), `latAdj` (rhythm delay fix, seconds) |

The save key `noteQuest.v1`, the save shape, and `NQ1:` codes from older versions all still work. This is tested.

## Profiles
| Call | Notes |
|---|---|
| `NQ.profiles.list()` | All profiles |
| `NQ.profiles.current()` | The selected profile or `null` |
| `NQ.profiles.select(id)` | Pass `null` to deselect |
| `NQ.profiles.create(name, avatar)` | Creates and selects. Returns the profile, or `null` if the name is blank. |
| `NQ.profiles.get(id)` · `rename(id, name)` · `remove(id)` · `resetProgress(id)` | |
| `NQ.profiles.setOption(id, key, value)` | `hints`: `'auto'\|'always'\|'never'`; `unlockAll`: bool; `exactOctave`: bool; `uniMode`: `'keys'\|'letters'` |
| `NQ.profiles.giveCoins(id, n)` | Grown-up bonus for real practice |
| `NQ.profiles.totalStars(profile)` | |

**Profile fields you can read:** `id, name, avatar, stars{key:0-3}, stickers[], notes{key:{r,w,streak}}, seconds, log[], hints, unlockAll, exactOctave, coins, pets[], habs[], inv{food:n}, tools[], decor[], decorInv{}, curHab, starterDone, best{levelId:n}, wild{sup, mis, done, journal, explorer}`.

## Music helpers: `NQ.music`
`LETTERS, SEMI, NOTE_NAMES, VALUE_NAME, midiOf('C4')→60, whiteFromMidi(60)→'C4', nameFromMidi(61)→'C♯4', niceName('C4')→'Middle C', noteKey(note, staff)→'C4t', typeFor(beats)→'quarter'|'half'|'dhalf'|'whole', posOf(note, clef), diaOf, staffFor(note, level)`

A **note item** is `{note:'E4', staff:'treble'|'bass'}`. Its stats key is `noteKey(item.note, item.staff)`.

## Content: `NQ.content` (read-only data)
`LEVELS, ACTS, SONGS, RHYTHM_PATTERNS, STICKER_SETS, ALL_STICKERS, FOODS, TOOLS, CLEAN_TOOL, HABS, HAB_ORDER, DECOR, SPECIES, SPECIES_BY_ID, MAX_PETS, STARTER_PETS, STAGE_NAME, SUP, REGIONS, WILD, rarity(cost), levelById(id)`

`REGIONS[].x/y` are suggested map positions only.

## Playing notes
| Call | Notes |
|---|---|
| `NQ.items.forLevel(level)` | Note items for a level |
| `NQ.items.unlockedPool()` | Every note from unlocked levels (used by Unicorn and Tracks) |
| `NQ.items.pickWeighted(items, prev)` | Next question, favoring weak notes, never repeating `prev` |
| `NQ.items.pickRandom(items, prev)` | Random pick, never repeating `prev` |
| `NQ.items.clefFor(items)` · `lettersFor(items)` | Clef to draw; letter buttons to show |
| `NQ.check.letter(item, 'E')` · `key(item, midi)` · `mic(item, midi)` | `true` if right. `mic` respects the exact-octave setting. |
| `NQ.progress.record(key, ok)` | Call once per question, on the **first** try only. A right answer earns 1 coin. |
| `NQ.progress.hintOpacity(key)` | 0–1 opacity for the letter drawn inside the note |
| `NQ.progress.stat(key)` · `levelStars(levelId)` · `isUnlocked(levelIndex)` · `totalStars()` | |
| `NQ.progress.finishRound({key, stars, act, level, correct, total, startedAt})` | Saves stars, log and time; adds the star bonus (0/2/5/10 coins); may give a sticker. Returns `{sticker, coins, best}`. **Known limit:** real-time games are timed on screen, so the engine trusts the stars you pass. Always compute them with `NQ.scoring`. |
| `NQ.progress.best(levelId)` · `setBest(levelId, n)` | Endless Meteors record |
| `NQ.coins.roundStart()` | Call when a screen opens. `NQ.coins.round()` then gives the coins earned since. |
| `NQ.coins.balance()` · `rewardNotes(n)` | `rewardNotes` covers right notes that have no stats key (songs, beats, rhythm). |

### Game rules
| Game | Engine pieces |
|---|---|
| Name / Find / Play It | 10 questions; `NQ.scoring.drill(firstTryRight)` |
| Meteor Shower | `NQ.meteor.GOAL` (15), `SHIELDS` (3), `fallTime(cleared, endless)` in seconds, `maxActive(...)`, `spawnGap(...)`, `NEW_NOTES_EVERY` (10), `addNextLevel(levelIndex, items)` adds the next level's notes in Endless; `NQ.scoring.meteor({shields, cleared, firstRight, total})`, `NQ.scoring.endless(cleared)` |
| Unicorn Rescue | `NQ.unicorn.HERO_START, UNI_START, STEP, GUST, drift(right)` (per second), `caught(hero, uni)`, `lost(uni)`, `stars(misses)` (positions are 0–100%) |
| How Many Beats | `NQ.rhythm.BEATS_TOTAL` (8), `beatsQuestion(prev)`, `NQ.scoring.beats(firstTry)` |
| Tap Along | `NQ.rhythm.BPM` (66), `ROUNDS` (5), `newPattern()` → `{beatsPerMeasure, measures, flat, onsets, totalBeats}`; `judge({start, onsets, durs, presses})` with times in seconds and `presses=[[down, up], …]` → `{results:[{result:'perfect'\|'close'\|'miss', held}], perfect, close, miss, points}`; `NQ.scoring.tap(points/notes)` |
| Songs | `NQ.songs.list`, `get(id)`, `measures(song)` (note indexes grouped by bar), `staffFor(song, note)`; `NQ.scoring.oops(mistakes)` |
| Animal Tracks | `NQ.tracks.TOTAL` (10), `CHEST_MIN` (7 first-try right wins a chest) |

## Sound and microphone
| Call | Notes |
|---|---|
| `NQ.audio.ctx()` | The shared AudioContext. Use it for every sound you play. |
| `NQ.audio.soundOn()` | Respect it before playing sounds |
| `NQ.mic.possible()` | `false` inside the Claude artifact frame or without HTTPS |
| `await NQ.mic.start(midi => {})` | `true` once listening. The callback fires once per steady note. |
| `NQ.mic.stop()` · `isOn()` | Stop it when a screen closes |
| `NQ.mic.muteUntil(audioTime)` | Call when you play a note, so the mic ignores the game's own sound |

## Pets
| Call | Returns |
|---|---|
| `NQ.pets.init()` | Current profile, with pet fields guaranteed |
| `NQ.pets.starterBonus()` · `chooseStarter(speciesId, name)` | First pet: sets up habitat, tool, 3 favorite foods and bonus coins |
| `NQ.pets.habitat()` · `setHabitat(hab)` · `inHabitat(hab)` | |
| `NQ.pets.need(pet, 'h'\|'j'\|'c')` · `joy(pet)` | 0–100 (`joy` includes the mess penalty) |
| `NQ.pets.moods(pet)` | Any of `['sleepy','hungry','dirty','happy']` |
| `NQ.pets.lowestNeed(pet)` | `'h'\|'j'\|'c'` if one is below 45, else `null` |
| `NQ.pets.stage(pet)` · `growInfo(pet)` · `growUpdate(pet)` | `growUpdate` runs growth, returns the new stage when one is reached, and fires `pet:grew` |
| `NQ.pets.feed(pet, food)` | `{ok, fav, evolved}` or `{ok:false, reason:'none'\|'diet'}` |
| `NQ.pets.play(pet)` · `clean(pet)` | `{ok}` or `{ok:false, reason:'tool', tool}` |
| `NQ.pets.pat(pet)` | `{boosted, rolls}` (joy rises at most once per 10 minutes) |
| `NQ.pets.rename(pet, name)` | |
| `NQ.pets.messes(hab)` · `genMess(hab)` · `cleanMess(hab, id)` | `genMess` returns `true` if new messes appeared |
| `NQ.pets.canAdopt(speciesId)` · `adopt(speciesId, name)` | `reason`: `'no-habitat'\|'full'\|'coins'` |
| `NQ.shop.price(kind, id)` · `buy(kind, id)` | kind: `food\|decor\|tool\|hab`; `{ok}` or `{ok:false, reason:'coins'\|'owned'}` |
| `NQ.decor.tray()` | `{shop:[{i,n}], stickers:[…]}` |
| `NQ.decor.owned(i)` · `place(i, 'shop'\|'sticker', hab)` · `move(id, x, y)` · `remove(id)` | `x`/`y` are % of the habitat; `remove` puts shop items back |

## Rescue missions
| Call | Returns |
|---|---|
| `NQ.wild.state()` | `{sup, mis, done, journal, explorer}` |
| `NQ.wild.mission(animal)` | `{t, need:[supplyIds]}` |
| `NQ.wild.remaining(animal)` | Items still to give for the current mission (repeats allowed) |
| `NQ.wild.missing(animal)` · `needStatus(animal)` | Remaining items the player doesn't hold yet · `[{id, have, given}]` for the mission |
| `NQ.wild.awardChest(animal, stars)` | Call after a Tracks round with 2+ stars. Returns `{got, bonus, ready}`. |
| `NQ.wild.giveSupply(animal, id)` | Gives one item. The engine checks it's still needed and held, uses it up and remembers the progress. When the last item is given, the rescue **completes in the engine** (5 coins, journal, next mission). Returns `{ok:true, done:false, left}`, `{ok:true, done:true, left:[], fact}`, or `{ok:false, reason:'not-needed'\|'not-held'\|'unknown', left}`. |
| `NQ.wild.rescue(animal)` | One-shot version: succeeds only if every remaining item is held, then uses them all. `{ok:true, done:true, fact}` or `{ok:false, reason:'missing', missing}`. |
| `NQ.wild.canInvite(animal)` · `invite(animal, name)` · `release(animal)` | Each finished rescue allows **one** invite *or* release. `invite` → `{ok, pet}` or `{ok:false, reason:'not-rescued'\|'full'}`; `release` → `{ok}` or `{ok:false, reason:'not-rescued'}`. |
| `NQ.wild.setExplorer(look)` | Saves the explorer's look |

---

## Learning engine (v1.2: merged in PR #4)
The curriculum is **data** (`NQ.learn.curriculum()` → `{id, version, levels, stops, skills}`). Since **1.8.0** it is the approved **curriculum v3.2** (9 worlds, 70 stops, 210 skills); see *Curriculum v3.2, coming soon, grown-up checks and placement* below. The old 2-world sample is now test data only (`tests/curriculum_sample_0_1.js`).

**Skill fields:**
- `id`, `title{child, adult}`, `domains`, `prereqs`, `requiresReading`, `evidence[]`
- `content{type, …}`, with an optional `content.transfer`
- `alfredRef`
- `stop` and `level` (added by the engine)

**Stop fields:** `id`, `level`, `title{child, adult}`, `skills[]`, `recital?`

| Call | Returns / does |
|---|---|
| `NQ.learn.levels()` · `stops(levelId?)` · `skill(id)` | Curriculum data |
| `NQ.learn.stopStatus(stopId)` | `{unlocked, complete, step:'learn'\|'practice'\|'check'\|'done', skills:[{id, state}], recital}` |
| `NQ.learn.currentStop()` | First stop that isn't complete |
| `NQ.learn.markLearned(stopId)` | Learn step seen (the intro and demo are the screen's job) |
| `NQ.learn.skillState(id)` | `{state, placed, passDays, nextReview, prereqsMet, missing}` |
| `NQ.learn.start(skillId, mode)` | mode: `practice\|check\|review\|transfer` → `{ok, roundId, total, question}` or `{ok:false, reason:'locked'(+missing)\|'needs-reading'\|'not-secure'\|'no-transfer'\|'coming-soon'(+why)\|'unknown'}` |
| `NQ.learn.answer(roundId, value, {by}?)` | `{correct, firstTry, reveal?, done, next, judge?, result?}`. For grown-up checks, `{by:'caregiver'\|'teacher'}` says who confirmed (1.8.0); anything else is refused with `bad-by`. |
| `NQ.learn.cancel(roundId)` | Leaving mid-round. Nothing is saved. |
| `NQ.learn.place(stopId)` | Placement: earlier stops count as secure, with reviews coming up soon |
| `NQ.learn.due()` · `today(10\|20)` | Due reviews · today's plan `{items:[{kind:'review'\|'learn'\|'practice'\|'check'\|'piano'\|'reflect', skillId?, mode?}]}` |
| `NQ.learn.learner()` · `setLearner({presentation:'picture'\|'child'\|'adult', reads})` | Per-profile presentation settings |

**Rules for answering:**
- A wrong answer can be retried. The second miss returns `reveal` with the right answer.
- `self`, `caregiver`, `teacher`, `song` and `rhythmTap` questions are one-shot (no retry).
- **First-try right answers earn 1 coin, except `self`, `caregiver` and `teacher` checks, which earn none.** Rounds give the usual star bonus and count once (via `roundId`).

**How to answer each question type** (`question.type` → value to pass):

| type | Show | Answer with |
|---|---|---|
| `noteName` | `note, staff, clef, choices` | a letter |
| `noteFind` | `note, staff, clef` | MIDI number of the key tapped |
| `notePlay` | `note, staff, clef` | MIDI number from the mic (or a key) |
| `letterFind` | `letter` | MIDI number of a key |
| `keyGroup` | `group` (2 or 3) | MIDI number of a black key |
| `highLow` | play `a` then `b` | `'a'\|'b'` (the higher one) |
| `contour` | play `a` then `b` | `'up'\|'down'\|'same'` |
| `loudSoft` | play `midi` at `volume` | `'loud'\|'soft'` |
| `finger` | `hand, finger, choices` | a number from 1 to 5 |
| `beats` | `value, note, choices`. `note` is `'quarter'\|'half'\|'dhalf'\|'whole'` (PR #53, merged `199d218`): draw that. `value` equals the answer, so never show it. | a number |
| `symbol` | `show` (art key, e.g. `dyn-f`, `key-black`), `choices` | a choice |
| `rhythmTap` | `measures, beatsPerMeasure, bpm, onsets, flat` | `{start, presses:[[down, up], …]}` in audio-clock seconds; the engine judges it |
| `song` | `song, maxMistakes` | `{completed:true, mistakes}` (play-along runs on screen) |
| `self` · `caregiver` · `teacher` | `prompt, checklist` | `true\|false` (`teacher` since 1.8.0: any grown-up can confirm, gate it behind the grown-up hold) |

**Mastery (defaults until the curriculum sets its own):**
- not-introduced → exploring (first try)
- → developing (practice ≥ 60%)
- → **secure** (check ≥ 80% first-try, or a "yes" for self/caregiver checks, **on two different days**)
- → transferable (passes the `transfer` content)

Reviews come at 1, 3, 7, 21 and 60 days. A failed review drops one state and keeps the history. Events: `learn:skill` `{skillId, state, was}`, `learn:stop` `{stopId}`, `round:finished`.

**Rounds:** `NQ.progress.startRound(key)` → `roundId`; `finishRound({…, roundId})` counts once, and a repeat call returns `{duplicate:true}`. Without `roundId`, it behaves as before (`counted:false`).


## Pet engine (v1.3: merged in PR #6)
Contract: `coordination/engine/PET_ENGINE_PROPOSAL_v0.2.md`, which ChatGPT accepted. Summary of the calls:

| Call | Returns |
|---|---|
| `NQ.pets.display(petId)` | `{stage:'egg'\|'baby'\|'adolescent'\|'adult', condition:'normal'\|'sleeping'\|'sick'\|'tired'\|'excited', dirty, hungry, activity:null\|'bath', needs{h,j,c}, asset, hatchRoundsLeft}`, or `null` if the pet isn't owned |
| `NQ.pets.byId(id)` · `tick()` · `wake(petId)` | `wake` keeps a pet awake for 30 minutes and ends a nap |
| `NQ.pets.canBathe` · `startBath(petId)` → `{bathId}` · `finishBath(petId, bathId)` → `{soapLeft}` · `cancelBath(petId)` | reasons: `not-owned\|egg\|sleeping\|no-tool\|no-soap\|busy\|no-bath` |
| `NQ.pens.canClean(hab)` · `NQ.pens.cleanMess(hab, messId)` → `{left, bagsLeft}` | reasons: `not-owned\|no-bags\|no-mess` |
| `NQ.pets.supplies()` · `NQ.shop.buy('supply', 'soap'\|'bags')` | `NQ.content.SUPPLIES` holds the pack sizes and prices |
| `NQ.companions.get()` · `setPrimary(petId)` · `setSidekick(petId\|null)` | Any owned pet; the two roles swap on conflict |
| `NQ.pets.nightHours()` · `setNight('20:30', '06:30')` | Per profile |

- **Messes** now carry `type` (`poop|leaves|dust|toy|algae|mud|feather|pebble|sparkle-dust`), as well as the old `i` emoji.
- **Events:** `pet:changed {pet, display, was}`, `pet:hatched {pet}`, `companions:changed`.
- **Ownership:** every pet action resolves inside the active profile only. `feed`, `play`, `pat` and `rename` also accept a `petId`. `play` now reports `{napping}` and refuses while the pet sleeps; `feed` refuses eggs.
- **Saves:** `S.v = 2`, upgraded automatically.

## Piano listening (v1.4: merged in PR #11)
| Call | Returns / does |
|---|---|
| `await NQ.listen.start({onOnset, onNotes, onNote})` | Starts the mic analyser. `onOnset {t}` (audio-clock seconds); `onNotes {t, midis[], top, notes[{midi, salience}], cents}`; `onNote(top)` |
| `NQ.listen.stop()` · `isOn()` · `possible()` | `possible` is false in the artifact frame or without HTTPS |
| `NQ.listen.expectChord([60, 64, 67], cb, allowExtra=0)` | Verifies the next notes heard against the expected set: `cb({ok, heard, present, missing, extra, t})`. Use this for chords, both hands and octaves. |
| `NQ.listen.followSong(songId, opts)` · `follow(seq, opts)` | Play-along follower. Pass each `onNotes` event to `.feed(ev)`; `.state()` returns `{index, done, mistakes, skipped, hits[{i, t, verified}], timing[{i, err, ok}], bpm}`; `.expected()` returns the next step. Chord/both-hands steps: with audio, the expected notes are verified and a wrong extra note fails the step (stays, counts a mistake); `opts.allowExtra` (0 default, max 1) tolerates one stray note. Without audio, the heard set must equal the expected set and the hit is `verified:false`. `opts.octaveFree`, `opts.cents` (default: saved tuning) |
| `NQ.listen.judgeOnsets({start, onsets, heard})` | Rhythm from piano note starts (perfect ≤ 0.12 s, close ≤ 0.25 s) |
| `await NQ.listen.measureNoise(ms)` | Measures the room while it's quiet. Refuses (`too-loud`) instead of saving a bad level |
| `await NQ.listen.measureTuning(ms)` | Measures how far notes played during `ms` are from standard pitch (median cents), saves `tuneCents`, and reports `outOfTune` |
| `NQ.listen.settings()` | `{tuneCents, noiseFloor}` |

Learning `rhythmTap` questions also accept `{start, onsets:[t…]}` from the piano. Limits: blind detection can miss octave doublings inside a chord (verification handles them); piano rhythm judges note starts only; tested on synthetic piano and needs Kevin's real piano.


## Music theory: `NQ.music.theory` (v1.4.1: merged in PR #24)
These are pure helpers. They never save anything, and bad input returns `null`. Notes are written `'C'`, `'F#'`, `'Bb'`, `'C##'`, with an optional octave (`'F#4'`). The octave belongs to the letter, so `B#3` sounds as C4. Intervals use short names: `P1 m2 M2 A2 … d5 P5 … M7 P8`, up to `P15`.

| Call | Returns |
|---|---|
| `parse(n)` · `norm(n)` · `pc(n)` · `midi(n)` | `{letter, acc, octave}` · tidy spelling · 0–11 · MIDI number (needs an octave) |
| `fmt(n)` | Printed form: `C##`→`C𝄪`, `Ebb`→`E𝄫`, `F#4`→`F♯4` |
| `interval(a, b)` | `{short:'M3', name:'major 3rd', quality, number, simple, semitones, direction:'up'\|'down'\|'same', compound}`. Without octaves, `b` is the nearest copy above `a`. |
| `intervalNumber(a, b)` | The size a staff shows, from letters only: 2nd, 3rd, and so on |
| `transpose(n, 'M3', 'up'\|'down')` · `parseInterval('m7')` | Correctly spelled note, or `null` when it would need a triple accidental · `{quality, number, simple, semitones}` |
| `scale(tonic, kind)` | `major`, `natural`/`minor`, `harmonic`, `melodic`, `majorPentatonic`, `fiveFinger`, `minorFiveFinger` |
| `chord(root, kind, inversion)` · `CHORDS` · `chordSymbol(kind)` | `major minor diminished augmented sus2 sus4 dominant7 major7 minor7 halfDiminished7 diminished7 minorMajor7 augmentedMajor7` |
| `identifyChord(notes)` | `{root, kind, symbol:'F♯m', inversion, bass, tones}`. The first note is the bass, and spelling decides. |
| `keySignature(tonic, 'major'\|'minor')` | `{type:'sharps'\|'flats'\|'none', count, accidentals[], relative, relativeMode}`, or `null` for theoretical keys (G♯ major) |
| `keyFromSignature(type, count)` · `relative(tonic, mode)` | `{major, minor}` · the relative key |
| `diatonicChords(tonic, mode, sevenths)` | `[{degree, name:'tonic'…'leading tone'\|'subtonic', roman:'vii°', root, kind, notes}]` |
| `nameInKey(midi, tonic, mode)` | Spells a heard key the way that key spells it: 70 → `Bb4` in F, `A#4` in D |
| `MAJOR_KEYS` · `MINOR_KEYS` · `SHARP_ORDER` · `FLAT_ORDER` · `DEGREE_NAMES` | Lists, ordered around the circle of fifths |

The spelling matches PR #15's Music Reference on all 36 scale families and their roman numerals.

## Theory questions (v1.5: merged in PR #25)
These are new `content.type` values for `NQ.learn`, built on `NQ.music.theory`. Questions arrive the same way as before, through `learn.start` and `learn.answer`. The answer checker stays in the engine. Note names in questions have no octave unless they are sounding notes.

| type | content | question (public) | answer to send |
|---|---|---|---|
| `interval` | `intervals:[n…]` (1–8), `ask:'size'\|'direction'\|'melodicOrHarmonic'\|'octave'`, `context:'notation'\|'melodic'\|'harmonic'`, `range?`, `clef?`, `directions?`, `others?` (for `octave`) | `{a, b, play:null\|'melodic'\|'harmonic', clef, choices}`. White keys only, so it never tests quality. | a size number, `'up'`/`'down'`, `'melodic'`/`'harmonic'`, or `'same'`/`'different'` |
| `chordQuality` | `qualities[]`, `context:'ear'\|'notation'`, `roots?`, `register?` (where the root may sit) | `{notes:['C4','E4','G4'], context, clef, choices}` | one of `qualities` |
| `chordBuild` | `ask:'build'\|'fromSymbol'\|'secondaryDominant'`, `kinds[]`, `roots[]`, or `keys[]` + `targets?` (2–6), `answerMode:'keys'\|'names'` | `{root, kind}`, `{root, symbol:'B♭m'}`, or `{key, target, targetRoman}`, plus `answerMode` | `keys`: MIDI numbers, any octave, no extras. `names`: spelled names, any order (`'F#'` or `'F♯'`). |
| `keySignature` | `keys[]` (major names), `modes?`, `ask:'name'\|'relative'\|'accidentals'` | `{signature:{type, count, accidentals}, mode, clef}` or `{tonic, mode}`, plus `choices` | a tonic, or `'none'`/`'2#'`/`'1b'` |
| `scaleBuild` | `tonics[]`, `kind`, `ask:'build'\|'transpose'`, `pattern?` (degrees), `from?`, `answerMode` | `{tonic, kind, length}` or `{from, to, given:[…]}`, plus `answerMode` | the notes in order: `keys` = same shape from the right note, `names` = spelled names |
| `stepPattern` | `tonics[]`, `kind` | `{tonic, kind, notes, step, choices:['W','H'(,'W+H')]}`: the step from `notes[step]` to the next note | `'W'`, `'H'` or `'W+H'` |
| `degree` | `keys[]`, `degrees?` (default 1, 4, 5), `ask:'whichNote'\|'whichDegree'` | `{key, degree, degreeName, choices:[notes]}` or `{key, note, choices:[degrees]}` | a note name, or a degree number |
| `harmonize` | `keys[]`, `chords?` (default I, IV, V), `allowShared?` | `{key, note, choices:[romans]}`. The note fits only one of the chords unless `allowShared`. | a roman numeral |
| `inversion` | `kinds?`, `roots?`, `inversions?` (0–2, or 3 for seventh chords), `register?`, `clef?` | `{notes, clef, choices:[0,1,2]}` | 0 = root position, 1 = first inversion, 2 = second |
| `cadence` | `keys[]`, `ask:'ending'`, `toTonic?`, `toDominant?` (lists of romans) | `{key, chords:[[bass, …notes]…], choices:['tonic','dominant']}` | `'tonic'` or `'dominant'` (not cadence names) |
| `cadence` (1.5.1, PR #26) | `keys[]`, `ask:'classify'`, `cadences?` (default `['authentic','half']`; also `'plagal'`, `'deceptive'`), `halfFrom?` (I, ii, iii, IV, vi), `seventh?`. Notation only (#27): `context:'ear'` is refused until a tested listening pathway exists. | `{key, chords:[[bass, …], [bass, …]], bass:[b1,b2], clef:'grand', context, choices}`. No roman numerals. | a cadence name |
| `secondaryDominant` (1.5.1, PR #26) | `keys[]` (major), `ask:'target'`, `targets?` (2–6), `register?`, `clef?`. Notation only. | `{key, notes:['A4','C#5','E5','G5'], clef, context:'notation', choices:['ii','iii','IV','V','vi']}` | the roman numeral of the chord it leads to |

| Call | Returns |
|---|---|
| `NQ.learn.validate(content)` | `[]`, or problems an author can read. `learn.start` refuses a bad block with `{ok:false, reason:'bad-content', errors}`. |
| `NQ.learn.sample(content, {seed, count})` | `{ok, questions}`: public questions only. The same seed gives the same questions. It needs no profile and saves nothing, so use it for previews. |
| `NQ.learn.types()` | Every supported `content.type` |

Use `answerMode:'names'` when the objective is spelling or notation, and `'keys'` only for keyboard or ear tasks. A `clef` or `range` field is a drawing hint. It's evidence of nothing until a screen actually shows the staff or plays the sound.

### First-steps questions (v1.5.2: PR #28, merged 2026-11-21)
Three more `content.type` values for curriculum v3.2's first worlds, built to the blocks as authored. None needs reading.

| type | content | question (public) | answer to send |
|---|---|---|---|
| `keyboardSide` (NQ-00-U01-S03) | `targets?` (`['left','right']`), `split?` (MIDI, default 60) | `{ask:'low'\|'high', split, choices:['left','right']}` | `'left'`/`'right'`, or the MIDI number of the key tapped: below `split` is left, above is right, and the split key itself counts as neither |
| `durationCompare` (NQ-00-U04-S02) | `durationsBeats?` (default `[1,4]`), `ask?` (`'longer'`\|`'shorter'`), `bpm?` (default 60), `midi?` or `lo?`/`hi?` | `{ask, midi, bpm, a:{beats, seconds}, b:{beats, seconds}, choices:['a','b']}`. Both sounds use the same pitch, so play `midi` for `a.seconds`, then for `b.seconds`. | `'a'` or `'b'` |
| `contourRead` (NQ-01-U04-S02) | `patterns?` (`['up','down','same']`), `clef?` (default treble), `range?` (two naturals, default `['C4','G4']`), `maxStep?` (letter steps, default 2) | `{context:'notation', notes:['C4','D4','F4'], clef, choices}`. Three naturals that all rise, all fall or all stay. Draw them on the staff. | `'up'`, `'down'` or `'same'` |

## Journey Readiness: `NQ.journey` (v1.6.0: PR #31, merged 2026-11-21)
The check before traveling on to the next world. It implements the accepted 23:05 proposal under Kevin's rules (DECISIONS J1–J3):
- **J1:** a part passes with **4 of 5** fresh questions right on the first try. A passed part stays passed.
- **J2:** a grown-up's "yes" counts **only** for items the engine can't check (`self`/`caregiver`/`teacher` questions). It is saved as `caregiver` or `teacher`, never as `mic`.
- **J3:** the check can be taken **before** the world's stops are finished. Passing every part then places that world's stops, with review reminders, like `learn.place`.

Readiness never gives coins and never changes skill mastery (except the J3 placement). Free play and earlier worlds are never gated.

**Curriculum data:** `level.readiness = {navigation:[skillIds], timing:[skillIds], performance:[skillIds]}`.
- Each part needs at least one skill.
- Skills must be from this world or earlier.
- Invalid data never gates anyone. `journey.validate(worldId)` lists the problems.
- The sample sets it on NQ-00: navigation `k-blackwhite`, `e-highlow`; timing `r-pulse`; performance `t-posture`, `t-hands`.

| Call | Returns / does |
|---|---|
| `journey.requirements(worldId)` | `{ok, worldId, to, early, missingStops[], items:5, pass:4, parts:[{id, skills[], passed, evidence[]}]}`. `early` is true when the world's stops aren't all complete (J3). Refusals: `no-profile`, `unknown`, `no-readiness`, `bad-readiness`(+`errors`). |
| `journey.start(worldId, partId)` | `{ok, attemptId, total:5, pass:4, early, question}`. Five items cycle through the part's skills in a shuffled order. They are fresh variants: never the same twice in a row for a skill, and never the learner's last practice question for that skill. `question` adds `skillId` and `grownUp` to the usual public question. One open attempt per profile+part: a new start replaces it. The attempt belongs to the profile that started it. Refusals: `no-profile`, `unknown`, `no-readiness`, `bad-readiness`, `passed`(+`passedAt`), `needs-reading`. |
| `journey.answer(attemptId, value, {source}?)` | `{ok, correct, done, next, judge?, result?}`. **One try per item, no reveal, no coins, no mastery change.** Answer values are the same as in `learn.answer`. Pass `{source:'mic'}` only when the sound really came from the microphone (notePlay, song, chord/keys answers). Without it, a played note is recorded as `keys`. Rhythm `onsets` count as `mic`; rhythm `presses` count as `tap`. Every other type is `checked`. On the 5th item the part finishes and `result` is included. Refusals: `no-attempt`, `wrong-profile`, `needs-grown-up` (use `confirm`). |
| `journey.confirm(attemptId, {by:'caregiver'\|'teacher', yes:boolean})` | The same reply as `answer`, for `grownUp` items only. Refusals: `checkable` (the engine checks this item itself), `bad-confirm`, `no-attempt`, `wrong-profile`. The UI should gate this behind the grown-up hold. |
| `journey.finish(attemptId)` | After the 5th item: returns the saved result again with `duplicate:true`. Before then: `{ok:false, reason:'not-done', remaining}`. |
| `journey.cancel(attemptId)` | `true` if an attempt was open. Nothing is saved. Attempts are also dropped on profile remove/reset, import and cloud replace. |
| `journey.status(worldId)` | `{ok, worldId, to, required, parts:{navigation:{passed, passedAt?, evidence?},…}, unlocked, unlockedAt, placed}`. `required:false` (and `unlocked:true`) when the world has no valid check. |
| `journey.validate(worldId)` | A list of problems with that world's readiness data (`[]` when valid). |
| `journey.PARTS`, `ITEMS`, `PASS` | `['navigation','timing','performance']`, `5`, `4`. |

**Result** (in `answer`/`confirm` on the 5th item): `{ok, worldId, partId, passed, correct, total, pass, evidence[], practice:[skillIds missed], unlocked, placed, to}`. `unlocked` is true on the attempt that completes the third part. `placed` is true when that happened before the world's stops were done (J3).

**Events:** `journey:part {worldId, partId, passed}`, and `journey:unlocked {worldId, to, placed}`.

**How it connects to learning:**
- `learn.stopStatus(id).gate` is `{worldId, unlocked}` on the first stop of a world whose previous world has a check, and `null` everywhere else.
- A valid preceding check gates lesson admission until the learner passes it or is placed into the world. Existing skill progress alone does not skip admission. Invalid checks are reported by validation and never gate lessons; sequential stop prerequisites still apply.
- `learn.today()` puts `{kind:'journey', worldId, to, parts:[not yet passed]}` in place of the stop items when the check is what's next.
- `learn.place(stopId)` past a whole world marks that world's check passed, with evidence `placement`, so placement never strands a learner.

- The engine checks world admission on every lesson start and Learn write. A denied `learn.start` returns `{ok:false, reason:'locked', gate:{target, requires}}`. Ordinary stop prerequisites return `missing` instead. Review requires the active learner's secure skill and an admitted world. Journey Readiness opens in order, with active placement scoped to that learner's next world. The legacy practice-game unlock option leaves curriculum locks intact. (WP-0.2, version 1.8.4.)

**Eggs:** a finished part counts as a music round for hatching (D1).

**Save:** `p.journey[worldId] = {parts:{[part]:{passedAt, evidence[], correct, total}}, unlockedAt, placed, attempts:[last 20 {part, t, correct, total, passed}]}`. It is created on first use, so no save version change and nothing existing changes. `NQ1:` codes carry it with the profile.

## Companions and friendship (v1.7.0: PR #46 on `claude/sanctuary`, not merged)
Contract: `engine/COMPANION_SANCTUARY_CONTRACT_v0.6.md` (APPROVED by ChatGPT 14:05). Part 1 is sections B and C: one companion plus friendship growth. Part 2 (the sanctuary pen, hospital ward and informed neglect, sections D and E) is the next section.

| Call | Returns / does |
|---|---|
| `companions.get()` | `{companion, primary, sidekick:null}`. `primary` is the same pet (kept for one release). |
| `companions.set(petId)` | `{ok}`. Refusals: `not-owned`, `egg`, `no-profile`. `setPrimary` is an alias for one release. `setSidekick` returns `{ok:false, reason:'retired'}`. |
| `companions.bond(petId)` | `{petId, level, points, next, todayLeft, active, unlocked[], atRisk}`, or `null` if not owned by the active profile. Reading never writes. `atRisk` is true while one of the pet's issues has been seen and not yet charged (see Sanctuary). |
| `companions.personality(petId)` | `{baseline, current, top}`, or `null`. `current` = 70% species baseline + 30% music lean, normalized to 100 (baseline alone until any lean exists). An exact tie for `top` goes to the earlier trait in `data.traits`. |
| `companions.LEVELS`, `DAY_CAP`, `data` | `[0,50,120,210,320]`, `15`, and the data hook `{species, activityTraits, unlocks}` (see below). |

- **Growth:** +2 to the active companion for each finished music adventure, whatever the score: a counted game round, a learn round (any with a `roundId`), or a Journey Readiness part. Idle animals and care give nothing.
- **Daily cap:** 15 per local date of play. A gain past the cap is cut to the remainder (+1), then 0.
- **Once per completion:** credit uses the engine's own once-only completion (`finishRound` `roundId`, journey `attemptId`), plus an in-memory guard. Rounds from another profile get `reason:'wrong-profile'` and credit nothing. Rescues (chest, supplies, rescue, invite) give nothing: only the music round that earned them counts (S4).
- **Eggs:** an egg companion gains nothing. The round that hatches it credits the hatched pet.
- **Self/caregiver learn rounds** (posture/hands checklists) have no `roundId`, so like hatching they are not counted as music adventures.
- **Levels:** 1–5 at 0/50/120/210/320. Every change goes through one path (floor 0, so never below level 1). Unlocks, once earned, are never removed.
- **§H data (ChatGPT, `messages/2026-11-21-1625-…`):** `data.traits` = `performer, scholar, explorer, braveheart, gentle`. Baselines: capybara 10/15/15/10/50, fox 15/20/35/20/10, owl 5/45/20/15/15, puppy 25/10/20/20/25, kitten 15/20/20/10/35, and every other species 20/20/20/20/20. Activity map: `kind:game`→performer, `kind:learn`→scholar, `kind:journey`→braveheart, `domain:D05`→gentle (no explorer source yet). Unlocks: L2 `bond-wave`; L3 `bond-happy-dance`/`bond-study-pose`/`bond-explorer-pose`/`bond-brave-pose`/`bond-cozy-pose` by top trait; L4 `bond-sparkle`; L5 `bond-celebration`. Visual only.
- **Fox and owl** are in `content.SPECIES` (hidden, `soon:true`); `pets.adopt('fox'|'owl')` → `{ok:false, reason:'not-yet'}` until ChatGPT supplies habitat, price and how a learner gets them.
- **Data hook (ChatGPT-authored, §H):** `species:{sp:{trait:weight}}` (weights sum to 100); `activityTraits:{tag:trait}`; `unlocks:[{id, level, trait?}]`. Tags for a completion are `kind:game|learn|journey`, `act:<act>`, `skill:<id>`, `domain:<Dxx>`, `part:<partId>`, `key:<round key>`. Each completion adds 1 to each distinct trait it maps to, for the active companion only.
- **Event:** `companion:bond {petId, level, was, points, reason:'music'|'neglect', unlocked[]}`.
- **Save:** `pet.bond = {points, level, unlocked, lean, day, today}`, created on first gain. `p.companions` becomes `{companion}`: an old `primary` becomes `companion`, and an old `sidekick` stays an owned animal (its id kept as `retiredSidekick`). Upgraded lazily like the other 1.3 fields; `S.v` stays 2. `NQ1:` codes carry it.

## Sanctuary, hospital and informed neglect (v1.7.0 part 2, PR #46)
Contract v0.6 §D, §E, §F. Conditions change in real time (C-B8); friendship is only ever lost by informed neglect.

| Call | Returns / does |
|---|---|
| `sanctuary.state()` | `{pen:{animals:[ids], mess:[{id,type,i,x,y,zone}], zones:[habs]}, hospital:{animals:[ids]}, issues:[{id, kind:'sick'\|'dirty-pen', petIds, observed, seq}]}`. Brings wards, messes and issues up to date first. |
| `sanctuary.viewed('pen'\|'hospital')` | Marks that area's open issues as seen (`'pen'` → `dirty-pen`, `'hospital'` → `sick`) and returns the area's issues now at risk. Costs nothing. **UI invariant:** call only while that area is on screen with its need shown and acknowledged; never from a background render, prefetch or warm-up; say the need is still unresolved before the learner picks another adventure. Anything else returns `[]`. |
| `pens.cleanMess(messId)` | One bag per mess, as before. The 1.3 form `(hab, messId)` still works and only finds messes in that zone. Returns `{ok, left, penLeft, bagsLeft}` (`left` is the zone's count in the 1.3 form, else the pen's). Cleaning below 3 messes resolves `dirty-pen`. `pens.canClean(hab?)`: `hab` optional now. |
| `pets.display(id)` | Adds `ward:'pen'\|'hospital'` and `frustration` 0–3 (0 = no open issue for this pet; else 1 + min(2, seq)). |
| `sanctuary.NEGLECT_STEPS`, `PEN_MAX`, `DIRTY_AT` | `[1,2,4,8]` (then 8), `8`, `3`. |

- **One pen:** `p.sanctuary = {pen:{mess, messT}, issues, seq}`. It makes one mess per 5 h per healthy (not egg, not hospital) pen animal, at most 8 in all. That is the same total rate as the old per-habitat lists.
- **Decor zones:** each mess has a `zone`, the habitat of a randomly chosen healthy pen animal. Mess types come from that zone. So `pets.messes(hab)` and `pets.genMess(hab)` keep working for the current per-habitat screens: `messes(hab)` is a copy of that zone's messes, and `genMess(hab)` brings the pen up to date and returns true when that zone's messes changed since it last asked. A pet's shown joy still counts only the messes in its own zone.
- **Hospital:** `pet.ward` becomes `'hospital'` when the pet's condition is `sick` (about 2 days of very low care, real time), and `'pen'` again when it is well. Event `pet:ward {pet, petId, ward, was}`. Care uses the usual feed, play and bath actions.
- **Issues:** `sick` is one per hospital pet. `dirty-pen` is one at a time while the pen has **3 or more** messes (`sanctuary.DIRTY_AT = 3`, Kevin's decision, option B). It resolves when cleaned below 3, and lists every healthy pen animal (never eggs, never hospital pets). Issues open unseen, including ones that open while the game is closed.
- **Charge:** at a finished music adventure (the same once-only completion that gives friendship), every seen issue charges its animals once, then becomes unseen with `seq += 1` and `lastCharged = <completion id>`. A pet in two issues is charged once, at the higher step. A further charge needs a new `viewed()`. Charges go through the same floor-0 path as gains: a level can drop; unlocks stay. Eggs are never charged. Care that fixes the need closes the issue (`resolved`), and a new issue starts at seq 0.
- **Event:** `sanctuary:issue {id, kind, petIds, state:'opened'|'observed'|'charged'|'resolved', seq}`.
- **Save:** `petInit` creates `p.sanctuary` once. The old `p.mess` lists merge into the pen (first 8 kept, each tagged with its old habitat as `zone`, untyped ones typed). The old `p.mess`/`p.messT` stay in the save untouched. `pet.ward` is added on first sync. `S.v` stays 2; `NQ1:` codes carry it.

## Curriculum v3.2, coming soon, grown-up checks and placement (v1.8.0: PR on `claude/curriculum-v32`)
Kevin's decisions C-B11, C-B12, C-B13 and S-1 to S-3 (coordination/DECISIONS.md, 2026-11-23).

**The data.** `tools/curriculum/build_v32.py` builds the curriculum block in `index.html` (between `/*NQ-CURRICULUM-BEGIN*/` and `/*NQ-CURRICULUM-END*/`) from `coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json` plus the 26 corrected skill shapes in `tests/generator_contract_v32.json`. `--check` fails if the block has drifted; the test runner runs it. Annotation fields (`objective`, `source`, `validation`, `designStatus`, …) are left out.
- **Levels:** `id, location, title, focus, alfredRef, readiness?`. **Stops:** `id, level, title{child, adult}, skills[], checkpoint{skillId, requiredEvidence}, picture, rescueAnimal`. **Skills:** as before, plus `feedback`, `pictureKey` and an optional `masteryOverride`.
- **S-1:** three listening judgments a quiz can't mark (`NQ-07-U05-S01`, `NQ-08-U07-S01`, `NQ-08-U03-S02`) are `teacher` checks. 23 `teacher` skills before WP-0.3. Four Amazon performance objectives (NQ-01-U01-S02, U04-S03, U05-S03, U08-S02) now use the owner-approved grown-up rubrics (#124), rather than single-note mic checks. 27 teacher skills in all; 13 coming-soon skills unchanged. These remain in Performance readiness. No world unlocked by this change.

**Coming soon (C-B12).** A skill whose `content.type` the engine has no generator for is *coming soon*: 12 `conceptChoice` (`why:'authoring'`, content not written yet) and 1 `echo` (`why:'listening'`, needs the sing-back mic). It never blocks anyone:
- `learn.playable(id)` → `{playable, reason:null|'authoring'|'listening'}` (null for an unknown id).
- `stopStatus(id).skills[]` entries carry `playable` and `reason`. Stop completion and `step` count playable skills only. Show coming-soon skills as a locked "coming soon" card if you like.
- A coming-soon prerequisite counts as met. `today()` never offers one. `learn.start` refuses with `coming-soon`.
- When the content (or the mic) arrives, the skill simply becomes playable; no data change is needed.

**Grown-up checks (C-B13).** `teacher` works exactly like `caregiver`: same question shape, one-shot, no coins, `journey.confirm` for readiness. Any grown-up can confirm; pass `{by:'caregiver'}` or `{by:'teacher'}` to `learn.answer` to label who did (default: `teacher` for teacher skills, `caregiver` otherwise). The label is saved in the skill history entry as `by`.

**Readiness (S-2).** Worlds NQ-00 to NQ-07 get `readiness` built from **all** of that world's playable skills: rhythm skills → `timing`; played, sung and grown-up skills → `performance`; everything else → `navigation`. NQ-08 is the last world, so it has none. Every check passes `journey.validate`. The first stop of each world after Melody Harbor is gated by the previous world's check, as in 1.6.

**Fresh game (superseding S-3).** v3.2 starts with new profiles and settings. The device save (`noteQuest.game32`), last player selection, and cloud document (`notequest-game32`) are separate from the original game. Save codes use `NQ32:` and must contain the v3.2 game marker and v3.2 profiles. Legacy device saves, cloud saves and transfer codes are left untouched.

**Placement: `NQ.placement`.** An optional assessment for a newly created learner. It uses only v3.2 gameplay or a grown-up's selection. Since 1.8.1 **every new learner is offered it**: `newProfile` sets `learn.placement.pending`, so `status().pending` is true and `today()` lists placement first until it is begun, picked or skipped (Kevin 2026-11-23).

| Call | Returns / does |
|---|---|
| `placement.status()` | `{ok, pending, active, nextWorld, startStop, how, endedAt}`. `pending`: not answered yet. `active`: "Show what you know" is under way. `nextWorld`: the world whose readiness check comes next. `how`: `'checks'\|'grown-up'\|'skipped'\|'nothing-left'` once it ended. Refusal: `no-profile`. |
| `placement.begin()` | Starts "Show what you know". The child then takes `nextWorld`'s readiness check with the usual `journey.start/answer/confirm`. Each world passed in full is placed (J3) and `nextWorld` moves on. **The first part not passed ends placement there** (`how:'checks'`, `world`). It also ends when no worlds are left. If the child leaves mid-way, `active` stays true: call `begin()` again to carry on, or `dismiss()`. |
| `placement.pick(worldId)` | A grown-up picks the starting world. Earlier worlds are placed like `learn.place` (their readiness counts as passed with `placement` evidence). Picking `NQ-00` starts at the beginning. Ends with `how:'grown-up'`. Refusals: `unknown`, `no-profile`. |
| `placement.dismiss()` | A grown-up skips placement; the learner starts at Melody Harbor. `how:'skipped'`. |

- `learn.today()` puts `{kind:'placement', active, nextWorld}` **first** while placement is pending or active.
- Event: `placement:done {how, startStop, world?}`. Placement checks give no coins (readiness never does).

**Tests.** `tests/curriculum_v32_node.js` runs on the real engine. The older suites run on the same engine with the sample swapped back in (`tests/run_engine_tests.sh` and `tests.html` both do this). Random-action fuzz runs on both.

## First companion (WP-0.5, K2)

`NQ.pets.startKitten(name, learnerId?)` starts an already-hatched kitten as the active learner's primary companion and pays the starter bonus once. Pass the learner ID captured when opening the name form to reject a stale submission after a learner switch. Empty names use Melody. Success returns `{ok:true, pet}`. Repeats return `{ok:false, reason:'has-companion', pet}`. A damaged starter record returns `needs-recovery`. The operation also rejects `no-profile` and `wrong-profile`. Existing companions, including eggs, retain their saved state.

## Painted learner avatars (WP-0.5)

- `profiles.avatarCatalog` is the immutable catalog. `body`, `skin`, `hairColor`, `outfit` and `accessory` list stable IDs. `hair[body]` lists valid hairstyles for that body.
- `profiles.create(name, {look})` creates and selects a learner and returns the profile. An invalid name or look returns `null` with no save. Existing `create(name, emoji)` callers still work.
- `profiles.setLook(id, look)` returns `{ok:true, look}` or `{ok:false, reason:'no-profile'|'bad-look'}`. Successful changes persist for that learner and emit `profile:look {id, look}` with a copy.
- Stored shape is `p.look = {v:1, body, hair, skin, hairColor, outfit, accessory}`. Writes require explicit `v:1` and IDs from the catalog, including a hairstyle for the chosen body.
- The pre-release v1 catalog adds light brown hair, pink and black outfits, and four accessories (round glasses, headphones, scarf and music-note pin). Blue hair is retired. A stored `hc-blue` displays using the first supported hair color while keeping the stored ID until the learner saves a new look. The catalog is append-only from the Phase 1 release.
- Render **only** from `profiles.displayLook(id)`. It returns a safe view with display-only defaults for unrecognized parts and `null` for an absent look or unknown body, which means use the existing emoji. It never changes stored IDs. Never use raw `p.look` to select artwork.

## Optional cloud and the single-device boundary (WP-0.9)

Phase 1 supports multiple learners sharing one device. Playing the same learners concurrently on two devices is unsupported. `syncedAt` records the last successful cloud write or adoption. With a known baseline, a device-only change is uploaded, a cloud-only change is adopted, and a change on both sides keeps the device save and preserves the raw cloud record separately. Older saves without a baseline use the existing newer-timestamp rule.

On divergence the canonical cloud document is left alone. The engine attempts a copy to `<saveFormat().cloud>-conflict-<ms>`, stays in device mode and emits `save:conflict {where:'cloud', backedUp}`. A successful copy stores the remote revision in the device-only `conflictBackedUp` marker and later launches skip a repeat copy of that revision. A failed copy can be retried. Portable save codes omit both markers. Incoming markers are ignored and the receiving device keeps its own trusted baseline, if present.

## Changelog
- **1.8.8 (proposed):** Preserve both copies when device and optional cloud saves diverge.
- **1.8.7 (proposed):** Store and validate versioned painted-avatar choices.
- **1.8.6 (proposed):** Cancel pending microphone permission and release capture on navigation or page hide.
- **1.8.5 (proposed):** Add the active learner’s one-time, hatched kitten starter.
- **1.8.4 (WP-0.2):** enforce valid readiness and stop prerequisites on lesson entry and Learn writes. Review and daily recommendations respect world admission.
- **1.8.3 (WP-0.3):** four Amazon grown-up performance rubrics (#124); existing save safety from #125 retained.
- **1.8.2 (#120):** a save belongs to the game when it has the game marker `notequest-3.2` and every learner has a v3 curriculum id (any, not only the current one); `migrate` moves learners from another v3 curriculum to the current one, keeping all progress (`p.curriculumFrom` records the old id; progress on removed skills/stops/worlds stays, unused). An unreadable stored save (including an empty value) is never overwritten: device copy to `<save key>.unreadable.<ms>` (verified by reading it back), cloud copy to `<cloud doc>-unreadable-<ms>` (if the cloud copy fails, the game stays on the device); event `save:backup {where}`. Every write to the device save goes through one guard (`Store.writeLocal`); if the device backup fails, the device save stays **locked** (the game runs in memory, nothing overwrites the original; event `save:blocked {where:'device'}`). A stored, cloud or imported save is only taken once a copy of it migrates cleanly with every save blocked; a save that breaks migration is unreadable (backed up, never overwritten). If reading the device slot throws, writes stay blocked until a later read shows the slot is empty. Curriculum ids must look like `3.<n>`. The game marker is the stable identity; the curriculum id is a version. `NQ.version` is `'1.8.2'`.
- **1.8.1:** every new learner is offered optional placement. `NQ.version` is `'1.8.1'`.
- **1.8.0 (PR #118, merged 2026-11-24):** curriculum v3.2 data (S-1 corrections), coming soon (`learn.playable`, `coming-soon` refusal), `teacher` grown-up checks with a `by` label, readiness for NQ-00..NQ-07 (S-2), isolated new-game saves (superseding S-3), `NQ.placement` (see above). `NQ.version` is `'1.8.0'`.
- **1.7.0 (in progress, `claude/sanctuary`):** one companion and friendship (part 1), then the one pen, hospital ward and informed neglect (part 2), above. `NQ.version` is `'1.7.0'`. `setSidekick` is retired; save shape upgraded in place.
- **1.6.0 (PR #31, merged 2026-11-21):** `NQ.journey` Journey Readiness (see above), `stopStatus().gate`, `today()` journey item, placement counts as readiness. `NQ.version` is `'1.6.0'`. Additive; new `p.journey` created on first use, no save version change.
- **1.5.2 (PR #28, merged 2026-11-21):** first-steps types `keyboardSide`, `durationCompare`, `contourRead` (see above). `NQ.version` is `'1.5.2'`. Additive; no save change.
- **1.5.1 (PR #26, merged 2026-11-21):** `cadence` `ask:'classify'` and the `secondaryDominant` type (see above). `NQ.version` is `'1.5.1'`. Additive; no save change.
- **1.5.0 (PR #25, merged):** theory question types, `learn.validate`, `learn.sample`, `learn.types` (see above). Additive; no save change. The `NQ.journey` proposal moves to 1.6.
- **1.4.1 (PR #24, merged):** `NQ.music.theory` spelling helpers (see above). Additive; nothing saved, nothing removed.
- **1.4.0 (PR #11, merged):** piano listening (`NQ.listen`), and tuning applied to the single-note mic.
- **1.3.0 (PR #6, merged):** pet engine (see above). `clean()` and `cleanMess()` now use the checked paths (soap or bags). Save v2.
- **1.2.0 (PR #4, merged):** learning engine (`NQ.learn`), `progress.startRound` and `finishRound({roundId})`. Nothing removed.
- **1.1.0:** rescues validated and completed in the engine (issue #2). Added `giveSupply`, `remaining`, `canInvite`, `release`; `rescue` is now one-shot and validated; `invite` needs a finished rescue; removed `useSupply`.
- **1.0.0:** first version.

## Coming next
- `conceptChoice` content for the 12 coming-soon skills (curriculum side), and the sing-back mic for `echo`.
- Screens for placement, coming-soon cards and the `teacher` grown-up check (ChatGPT).
