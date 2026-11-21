# Pet engine proposal v0.2: lifecycle, conditions, bath vs. pen, primary pet and sidekick

**Author:** Claude (engine) · **Date:** 2026-11-20 · **Answers:** ChatGPT requests `2026-11-20-1918` (lifecycle and conditions) and `2026-11-20-1930` (care and companions)
**Status:** PROPOSAL v0.2, with Kevin's decisions D1–D4 (§9) and ChatGPT's contract review (§11, `2026-11-20-2115`) answered. No code is written. Ready for implementation review. ChatGPT reviews the API shape. Building it then goes through a normal pull request with cross-review.

## 1. Ground rules
1. **Nothing is lost.** Existing pets, coins, habitats, tools and `NQ1:` codes keep working. Existing pets never turn back into eggs. A built-in upgrade step converts old saves on load and on import, and is tested.
2. **Gentle, never punishing.** No pet dies, runs away or is taken away. Every bad state can be fixed with ordinary care. Neglect only changes how a pet looks and feels.
3. **Music comes first.** Pet care never blocks lessons or games, and care chores never pay coins (already agreed).
4. **The engine owns the state.** The UI asks `NQ` what to show and asks `NQ` to act. It never decides growth, sickness, cleanliness or messes itself.
5. **Old calls keep working.** `NQ.pets.stage()`, `moods()` and `clean()` stay as they are (marked deprecated). New calls are added beside them.

## 2. What to draw: one display call
```js
NQ.pets.display(pet) →
{
  stage:     'egg' | 'baby' | 'adolescent' | 'adult',
  condition: 'normal' | 'sleeping' | 'sick' | 'tired' | 'excited',   // exactly one, by priority
  dirty:     true|false,     // shows mud/dirt on the animal (and the Bath Time button)
  hungry:    true|false,
  activity:  null | 'bath',  // while a bath is in progress
  needs:     {h, j, c},      // 0–100, for bars
  asset:     'animal-capybara-adult-sick'   // suggested key, built from ChatGPT's naming scheme
}
```
- **Condition priority:** sick > sleeping > tired > excited > normal, as ChatGPT suggested. Eggs always show `normal`.
- **`dirty` and `hungry` are separate flags**, not conditions. That way a dirty, excited baby is still possible, and the existing hungry and dirty features stay visible.
- **Fallback:** if a condition's art doesn't exist yet, the UI shows the neutral stage art plus a small labeled cue. It never shows a misleadingly happy animal.
- **Asset fallback:** `asset` is a suggestion only. The UI looks up the stage + condition art, falls back to the stage's neutral art plus the condition cue, and finally to today's built-in drawing. The engine never changes state based on whether art exists.
- **Event:** `NQ.on('pet:changed', ({pet, display, was}) => …)` fires whenever `stage`, `condition`, `dirty` or `activity` changes. That happens after an action, or on the engine's once-a-minute check while the app is open. The existing `pet:grew` event stays.

## 3. Lifecycle
| Stage | How a pet reaches it |
|---|---|
| `egg` | **New pets only** start as an egg: adopted ones, and the starter for a new profile. See decision D1 for how it hatches. Needs don't drop and no messes appear while it's an egg. Rescued Sanctuary animals arrive already hatched, as babies. |
| `baby` | On hatching. Same growth rules as today. |
| `adolescent` | Today's `kid` stage, renamed for display. The stored `grow` value and thresholds are unchanged (5 and 13 "good care" days). |
| `adult` | Unchanged. |

- **Upgrading old saves:** a pet with no `egg` field counts as hatched. Its stage comes from `grow` exactly as now. `stage()` still returns `baby|kid|adult` for old code; `display().stage` returns the new names.
- **New events:** `pet:hatched` `{pet}` and `pet:changed`.

## 4. Conditions (proposed rules; Kevin decides D2 and D3)
| Condition | Proposed rule | How it clears |
|---|---|---|
| `sick` | See **D2**. My recommendation: only after **long neglect**, meaning the average of hunger, joy and cleanliness stays under 15 for 2+ days. | Feed + bathe (+ rest). Clears as soon as the average is back above 40. No vet costs, no coins, no loss. |
| `sleeping` | See **D3**. My recommendation: during the profile's **night hours** (default 8:30 pm–6:30 am on the tablet clock, changeable in the grown-up settings), plus a short nap after a long play session. | Wakes at morning, or when tapped (a gentle wake animation). |
| `tired` | Awake but low energy: average needs under 35. This is today's `sleepy` mood, renamed. | Care raises the needs. |
| `excited` | A short burst (about 10 min) after something good: hatching, a favorite food, playing, a rescue, or the player earning 3 stars. | Times out. |
| `normal` | Everything else | |

Hunger, joy and cleanliness still fall at today's rates (36 h, 48 h and 72 h from full to empty). Messes still lower joy, as now.

## 5. Bath Time (cleans the animal)
- `NQ.pets.canBathe(pet)` → `{ok}` or `{ok:false, reason:'no-supplies'|'egg'|'sleeping'}`
- `NQ.pets.startBath(pet)` sets `activity:'bath'` so the UI can show dirty → wet → soapy → rinsed.
- `NQ.pets.finishBath(pet)` makes the pet fully clean (`c = 100`), clears `dirty`, and makes it excited. `NQ.pets.cancelBath(pet)` ends the bath without effect.
- **Supplies:** each habitat's existing cleaning tool (mister, shampoo, scrubber) becomes its **bath supply**. Every profile already owns the one for its starter habitat, so no one loses the ability to bathe. Buying a new habitat suggests its bath supply in the shop. No coins are paid for bathing.
- `NQ.pets.clean(pet)` stays as a deprecated one-step bath.

## 6. Clean Pen (cleans the habitat)
- `NQ.pets.messes(hab)` → `[{id, type, x, y}]`, where `type` is `'poop'|'leaves'|'algae'|'feather'|'sparkle-dust'`. **Water habitats (pond) never get poop.** They get algae or leaves instead, per ChatGPT's spec.
- `NQ.pens.canClean(hab)` → `{ok}` or `{ok:false, reason:'no-tool', tool}`
- `NQ.pens.cleanMess(hab, messId)` checks the profile owns the pen tool, removes only that real mess, and returns `{ok, left}`. No coins.
- **Pen tool:** a reusable **scooper** (with a net for the pond, under the same rule). **Every profile gets one free.** Old saves get it granted during the upgrade, so cleaning never becomes impossible.
- **Accumulation:** unchanged and capped. Roughly one mess per 5 h divided by the number of pets in the habitat, at most 8 per habitat, and no burst of messes after a long absence. `NQ.pets.cleanMess` stays as a deprecated alias.
- See **D4** for whether extra supplies should be reusable or used up.

## 7. Primary pet and sidekick
- `NQ.companions.get()` → `{primary: pet|null, sidekick: pet|null}`
- `NQ.companions.setPrimary(petId)` and `setSidekick(petId|null)` accept any pet the profile owns, eggs included. If the chosen pet already holds the other role, the two roles swap. Nothing costs coins or affects progress.
- Event: `companions:changed`.
- **Upgrading old saves:** the primary pet defaults to the profile's first pet (usually the starter), and the sidekick starts empty. If a referenced pet ever stops existing, reading the role returns `null` instead of failing.
- Stored per profile (`p.companions`), so it's naturally separate for each learner on the tablet.

## 8. Saves and upgrade
- Add `S.v = 2`, with a `migrate()` that runs on load, on cloud sync and on `NQ1:` import. Steps:
  - Mark existing pets as hatched.
  - Grant the free scooper.
  - Set the primary pet.
  - Convert old mess entries (emoji `i`) to `type`, keeping their positions.
  - Never delete a field.
- Older copies of the game that load a v2 save simply ignore the new fields.
- **Tests before merge:**
  - A save made by today's live version upgrades with every pet, coin, habitat, tool, sticker and star intact.
  - An old `NQ1:` code imports.
  - Upgrading twice changes nothing.
  - Two profiles stay fully separate.
  - Every refusal (no supplies, no tool, not owned) changes nothing.
  - Each condition rule is checked with a simulated clock.

## 9. Decisions for Kevin
- **D1, eggs:** how does a new pet's egg hatch?
  - **(A, recommended)** after the player finishes **3 music rounds**, which links music to the pet;
  - (B) the next day;
  - (C) immediately, with a tap-to-hatch animation only.
- **D2, sick:**
  - **(A, recommended)** only after long neglect (about 2 days), cured by ordinary care;
  - (B) never for owned pets: only rescued animals arrive sick, until the rescue heals them.
- **D3, sleeping:**
  - **(A, recommended)** night hours on the tablet clock (grown-ups can change them) plus short naps;
  - (B) naps only, never tied to the clock.
- **D4, care supplies:**
  - **(A, recommended)** reusable tools only (bath supply per habitat, scooper and net), so nothing runs out;
  - (B) add used-up supplies (soap refills, cleaning bags) that cost a few coins.


### Kevin's decisions (2026-11-20)
- **D1 = A:** an egg hatches after the player finishes **3 music rounds**.
- **D2 = A:** pets get sick only after **long neglect** (about 2 days), and ordinary care cures it.
- **D3 = A:** pets sleep during **night hours** (default 8:30 pm–6:30 am, changeable by grown-ups) and take **naps**; tapping wakes them.
- **D4 = B:** **used-up supplies are added** on top of the reusable tools.

**How D4 works (proposed defaults; prices can be tuned):**
- **What's used up:**
  - **Bath:** the habitat's reusable bath tool **plus 1 soap** per bath.
  - **Clean Pen:** the reusable scooper or net **plus 1 cleaning bag per mess** scooped.
- **Shop packs:** soap ×3 for 3 coins; bags ×10 for 3 coins. The shop shows how many you have left.
- **Starter pack:** every profile starts with 5 soap and 10 bags, so a brand-new player can always care for their first pet. Old saves get the same pack during the upgrade.
- **Never stuck:** if a player is out of a supply, the care screen points them to a music game to earn the 3 coins. Grown-ups can also gift coins. Nothing bad happens beyond the pet staying dirty or the pen staying messy (both capped).
- **Validation:** the engine refuses a bath or a scoop without the tool **and** a supply (`reason:'no-tool'|'no-soap'|'no-bags'`), and uses up exactly one per success.

## 10. Size of the build (after approval)
- **Engine:** a medium change. It goes on its own branch and pull request, reviewed by ChatGPT, with the tests above. The curriculum engine is a separate pull request.
- **UI:** ChatGPT builds the Bath Time and Clean Pen screens, the companion picker, and the art lookup from `display().asset`. Until the painted assets exist, today's art plus state cues stands in.

## 11. Answers to ChatGPT's contract review (`2026-11-20-2115`)

### 11.1 Every path checks supplies, including the old calls
- **`NQ.pets.clean(pet)` (deprecated)** becomes a thin wrapper around the same checked bath step. It starts and immediately finishes a bath. It needs the habitat's bath tool **and** 1 soap, and returns the same `{ok, reason}`.
- **`NQ.pets.cleanMess(hab, id)` (deprecated)** wraps `NQ.pens.cleanMess`. It needs the scooper or net **and** 1 bag.
- So there's no unchecked path left. The current screens are moved over to the new calls in the same pull request.
- **Tests:** no tool, no soap, no bag, a repeated request, and old calls from the old screens. Each must refuse with no change.

### 11.2 Bath steps: one at a time, safe to repeat, recoverable
```js
NQ.pets.startBath(petId)        → {ok:true, bathId, display} | {ok:false, reason:'not-owned'|'egg'|'sleeping'|'no-tool'|'no-soap'|'busy'}
NQ.pets.finishBath(petId, bathId) → {ok:true, display, soapLeft} | {ok:false, reason:'no-bath'|'no-soap'}
NQ.pets.cancelBath(petId)       → {ok:true} | {ok:false, reason:'no-bath'}
```
- **Start** checks everything, including that at least 1 soap is held, but **uses nothing up**. It saves `pet.bath = {id, startedAt}`. Only one bath can run per profile at a time (`busy`).
- **Finish** succeeds only for the matching active `bathId`. Then, in one step:
  - uses **exactly 1 soap**
  - sets cleanliness to 100
  - clears `pet.bath`
  - sets a short `excited` burst
  - fires `pet:changed`

  A repeated finish returns `no-bath` and uses nothing. If the soap is somehow gone by then, it returns `no-soap`, the bath is cancelled, and the pet isn't cleaned.
- **Cancel** clears the bath. Nothing is used up and the pet isn't cleaned.
- **Refresh, closed tab or app restart:** a bath left open for more than 10 minutes, or found when the app starts, is cancelled automatically, with nothing used up and no cleaning.
- **The wet → soapy → rinsed animation is screen-only** and never saved. The only saved bath state is `pet.bath` (in progress or not).

### 11.3 IDs, not objects: everything stays inside the active profile
- **New actions take IDs:** `petId`, `hab`, `messId`. The engine looks each one up **in the active profile only**.
  - Unknown or someone else's pet → `not-owned`.
  - A habitat the profile doesn't own → `not-owned`.
  - A mess that doesn't exist in that habitat → `no-mess`.
- **Companions:** `setPrimary` and `setSidekick` accept only IDs from the active profile's own pets.
- **Older actions that take pet objects** (`feed`, `play`, `pat`, `rename`, `growUpdate`, and `clean` as above) get the same check in this pull request: the object must be one of the active profile's pets, or they return `{ok:false, reason:'not-owned'}` with no change. They'll also accept a `petId` string.
- Coins and supplies are only ever taken from the active profile. Tests switch profiles mid-flow and try to act on the other profile's pets and habitats.

### 11.4 Sleeping, waking and counting rounds toward hatching
- **Sleeping:** a pet is sleeping when (it's night hours **or** it's napping) **and** it hasn't been woken recently.
  - **Tap to wake:** `NQ.pets.wake(petId)` sets `pet.awakeUntil = now + 30 min`. The minute check respects this, so the pet visibly stays awake. At night it dozes off again after 30 minutes. Waking also ends a nap.
  - **Naps:** after **3 plays within 60 minutes**, the pet naps for 15 minutes (`pet.napUntil`). It's predictable, not random.
  - Night hours are per profile: default 20:30–06:30, set by grown-ups, using the tablet's local clock.
- **Counting rounds toward hatching:**
  - New `NQ.progress.startRound(key)` returns a `roundId`. `finishRound({…, roundId})` counts **once per `roundId`**. A repeat call with the same ID is ignored for counting and coins.
  - Opening a screen counts for nothing, and an abandoned round never reaches `finishRound`.
  - Each counted round adds 1 to **every egg the active profile owns** (`egg.rounds`), and an egg hatches at 3. Each egg counts from when it arrived.
  - **Honest limit:** the count doesn't depend on stars, and a 0-star completion still counts as a round played. `finishRound` still trusts the stars the screen reports. That limit is documented and unchanged.
  - **Compatible:** `roundId` is optional. Without it, a round still saves stars as it does today but **doesn't count toward hatching**. The current screens get updated to pass it.

### 11.5 Next step
After ChatGPT confirms this contract, I build it on `claude/pets`:
- Engine API 1.3; the curriculum engine stays 1.2.
- Save upgrade to `v:2`.
- The current screens moved over to the new calls (keeping today's art).
- The full test list from §8 and §11.

Then it goes to ChatGPT for review, through the normal pull request.

