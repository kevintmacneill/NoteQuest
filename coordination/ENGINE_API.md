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
The curriculum is **data** (`NQ.learn.curriculum()` → `{levels, stops, skills}`). The current data is an **engine test sample for NQ-00 and NQ-01**. ChatGPT's approved curriculum replaces it with no engine change.

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
| `NQ.learn.start(skillId, mode)` | mode: `practice\|check\|review\|transfer` → `{ok, roundId, total, question}` or `{ok:false, reason:'locked'(+missing)\|'needs-reading'\|'not-secure'\|'no-transfer'\|'unknown'}` |
| `NQ.learn.answer(roundId, value)` | `{correct, firstTry, reveal?, done, next, judge?, result?}` |
| `NQ.learn.cancel(roundId)` | Leaving mid-round. Nothing is saved. |
| `NQ.learn.place(stopId)` | Placement: earlier stops count as secure, with reviews coming up soon |
| `NQ.learn.due()` · `today(10\|20)` | Due reviews · today's plan `{items:[{kind:'review'\|'learn'\|'practice'\|'check'\|'piano'\|'reflect', skillId?, mode?}]}` |
| `NQ.learn.learner()` · `setLearner({presentation:'picture'\|'child'\|'adult', reads})` | Per-profile presentation settings |

**Rules for answering:**
- A wrong answer can be retried. The second miss returns `reveal` with the right answer.
- `self`, `caregiver`, `song` and `rhythmTap` questions are one-shot (no retry).
- **First-try right answers earn 1 coin, except `self` and `caregiver` checks, which earn none.** Rounds give the usual star bonus and count once (via `roundId`).

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
| `beats` | `value, choices` | a number |
| `symbol` | `show` (art key, e.g. `dyn-f`, `key-black`), `choices` | a choice |
| `rhythmTap` | `measures, beatsPerMeasure, bpm, onsets, flat` | `{start, presses:[[down, up], …]}` in audio-clock seconds; the engine judges it |
| `song` | `song, maxMistakes` | `{completed:true, mistakes}` (play-along runs on screen) |
| `self` · `caregiver` | `prompt, checklist` | `true\|false` |

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

### First-steps questions (v1.5.2: in PR #28, stacked on #26, not merged yet)
Three more `content.type` values for curriculum v3.2's first worlds, built to the blocks as authored. None needs reading.

| type | content | question (public) | answer to send |
|---|---|---|---|
| `keyboardSide` (NQ-00-U01-S03) | `targets?` (`['left','right']`), `split?` (MIDI, default 60) | `{ask:'low'\|'high', split, choices:['left','right']}` | `'left'`/`'right'`, or the MIDI number of the key tapped: below `split` is left, above is right, and the split key itself counts as neither |
| `durationCompare` (NQ-00-U04-S02) | `durationsBeats?` (default `[1,4]`), `ask?` (`'longer'`\|`'shorter'`), `bpm?` (default 60), `midi?` or `lo?`/`hi?` | `{ask, midi, bpm, a:{beats, seconds}, b:{beats, seconds}, choices:['a','b']}`. Both sounds use the same pitch, so play `midi` for `a.seconds`, then for `b.seconds`. | `'a'` or `'b'` |
| `contourRead` (NQ-01-U04-S02) | `patterns?` (`['up','down','same']`), `clef?` (default treble), `range?` (two naturals, default `['C4','G4']`), `maxStep?` (letter steps, default 2) | `{context:'notation', notes:['C4','D4','F4'], clef, choices}`. Three naturals that all rise, all fall or all stay. Draw them on the staff. | `'up'`, `'down'` or `'same'` |

## Changelog
- **1.5.2 (PR #28, stacked on #26, pending review):** first-steps types `keyboardSide`, `durationCompare`, `contourRead` (see above). `NQ.version` is `'1.5.2'`. Additive; no save change.
- **1.5.1 (PR #26, stacked on #25, pending review):** `cadence` `ask:'classify'` and the `secondaryDominant` type (see above). `NQ.version` is `'1.5.1'`. Additive; no save change.
- **1.5.0 (PR #25, merged):** theory question types, `learn.validate`, `learn.sample`, `learn.types` (see above). Additive; no save change. The `NQ.journey` proposal moves to 1.6.
- **1.4.1 (PR #24, merged):** `NQ.music.theory` spelling helpers (see above). Additive; nothing saved, nothing removed.
- **1.4.0 (PR #11, merged):** piano listening (`NQ.listen`), and tuning applied to the single-note mic.
- **1.3.0 (PR #6, merged):** pet engine (see above). `clean()` and `cleanMess()` now use the checked paths (soap or bags). Save v2.
- **1.2.0 (PR #4, merged):** learning engine (`NQ.learn`), `progress.startRound` and `finishRound({roundId})`. Nothing removed.
- **1.1.0:** rescues validated and completed in the engine (issue #2). Added `giveSupply`, `remaining`, `canInvite`, `release`; `rescue` is now one-shot and validated; `invite` needs a finished rescue; removed `useSupply`.
- **1.0.0:** first version.

## Coming next
- **When curriculum v3 / H-02 is approved:** swap the test sample for the real curriculum data.
