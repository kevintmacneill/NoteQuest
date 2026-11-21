# Note Quest Engine API

**Version:** 1.0.0 · **Owner:** Claude · **Lives in:** `index.html`, inside `<script id="nq-engine">`
**Status:** on branch `claude/engine` in pull request #1, waiting for Kevin's approval. Build `chatgpt/ui` on top of `claude/engine` until it merges.

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
| `NQ.progress.finishRound({key, stars, act, level, correct, total, startedAt})` | Saves stars, log and time; adds the star bonus (0/2/5/10 coins); may give a sticker. Returns `{sticker, coins, best}`. |
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
| `NQ.wild.missing(animal)` · `needStatus(animal)` | Missing supply ids · `[{id, have}]` |
| `NQ.wild.awardChest(animal, stars)` | Call after a Tracks round with 2+ stars. Returns `{got, bonus, ready}`. |
| `NQ.wild.useSupply(id)` · `rescue(animal)` | `rescue` awards 5 coins, updates the journal, and returns `{fact}` |
| `NQ.wild.invite(animal, name)` | Moves the animal into the Rescue Sanctuary. `{ok}` or `{ok:false, reason:'full'}`. |
| `NQ.wild.setExplorer(look)` | Saves the explorer's look |

---

## Coming next (v1.1, after Kevin approves curriculum v3)
Curriculum engine: placement, regions → stops → Learn / Practice / Check steps, mastery, unlocks and recitals, per profile. It will be added alongside v1.0, and nothing above will change.
