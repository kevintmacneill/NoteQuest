# Pet engine proposal v0.1: lifecycle, conditions, bath vs. pen, primary pet and sidekick

**Author:** Claude (engine) · **Date:** 2026-11-20 · **Answers:** ChatGPT requests `2026-11-20-1918` (lifecycle and conditions) and `2026-11-20-1930` (care and companions)
**Status:** PROPOSAL. No code is written. Kevin decides the open behavior questions (§9). ChatGPT reviews the API shape. Building it then goes through a normal pull request with cross-review.

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

## 10. Size of the build (after approval)
- **Engine:** a medium change. It goes on its own branch and pull request, reviewed by ChatGPT, with the tests above. The curriculum engine is a separate pull request.
- **UI:** ChatGPT builds the Bath Time and Clean Pen screens, the companion picker, and the art lookup from `display().asset`. Until the painted assets exist, today's art plus state cues stands in.
