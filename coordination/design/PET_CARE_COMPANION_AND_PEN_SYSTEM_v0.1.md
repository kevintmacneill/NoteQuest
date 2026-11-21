# NoteQuest — Pet Care, Pen Cleaning and Companion Selection

**Version:** v0.1 · **Date:** 2026-11-20  
**Authority:** Owner-directed design specification, documentation only  
**Art / interaction direction:** ChatGPT · **Engine / game-state implementation:** Claude  
**References:** [Animal Lifecycle & Expressions](ANIMAL_CHARACTER_LIFECYCLE_AND_EXPRESSIONS_v0.1.md), [Nine-World Art Guide](NINE_WORLD_ART_GUIDE_v0.1.md), [Engine API](../ENGINE_API.md).

## 1. Required animal artwork: ten versions

Each featured pet and rescue species requires sufficiently detailed **original** cartoon illustrations, with recognizable species anatomy, differentiated age proportions, dark expressive outline strokes, coherent cel shadows, meaningful markings and expressions. The owner's capybara screenshot provides general drawing-style inspiration only: no tracing, copying or reuse of stock artwork.

The ten required named illustrations/presentations are **egg, baby, adolescent, adult, sleeping, sick, tired, excited, dirty, bath time**. Existing eight are preserved; **dirty** and **bath time** are added. Egg is a fantasy game collectible when the species is a mammal—not a biological claim. Life stage, condition and activity are separate dimensions. A modular rig can reuse elements across states, but the ten labeled presentations must each be recognizable during visual review.

**The original capybara character sheet is the first style test.** It should carry all ten representations on one coherent concept board and show a *separate* pen-cleaning scene as an additional activity. The latter does not substitute for the dirty or bath-time states.

## 2. Two distinct care activities

| Property | **Bath Time — clean the animal** | **Clean Pen — clean the habitat** |
|---|---|---|
| What is dirty | Animal fur/skin/feathers and hygiene condition | Enclosure floor / objects and accumulated poop |
| Interaction | Brush/cloth, gentle water, optional soap, rinse and dry | Scoop/tap poop, dispose of waste, tidy habitat |
| Visual assets | Wet fur, bubbles, wash pose, drying and clean/happy pet | Separate poop objects, scooper/cleaner tools, tidy pen |
| State updated by engine | Pet cleanliness | Habitat mess objects / cleanliness |
| Supply requirement | Owned bath supplies or valid starter bath kit | Owned habitat-appropriate cleaning tools/supplies |
| Reward | Caring reaction and cleaner pet—**no coins** | Tidy habitat and happier pet—**no coins** |

The learner must be able to choose these activities **independently**. Do not conflate bathing with scooping poop, and do not have one action silently complete the other. Both should offer child-friendly, low-text, accessible taps/swipes, support reduced motion, and never block piano lessons.

## 3. Poop in animal pens

Animals periodically leave **small stylized, child-safe poop/mess objects** in their personal pens/enclosures. For non-land habitats, adapt to an appropriate cleanup object rather than showing poop floating on a music-learning screen. Keep displays capped and accumulation non-punitive, including after long absences. The **Clean Pen** control is distinct from the **Bath Time** control. A cleanup action removes only actual existing messes, after engine validation of the owned tool/supply. Do not award coins for chores; preserve lessons and pet ownership when a pen is messy.

## 4. Care supplies and tokens

The owner calls them **tokens**; the existing product calls them **coins**. Treat this as the **same one in-game balance**, earned through piano activities under established rules. No additional currency or real-money purchases. Players can use earned coins to acquire a poop scooper, cleaning bags, brushes, towels, soap, and habitat-specific equipment.

Exact prices, reusable-vs-consumable inventory, and periodic cleanup rate remain **unbound pending Claude's proposed game mechanics**. Keep a feasible starter cleaning route (free included starter equipment or affordable default) so animals cannot become impossible to care for.

Shop UI: item artwork, token price, balance, owned amount, reusable/consumable marker and clear return to the relevant care activity.

## 5. Primary pet and optional sidekick

**Any animal owned by the current learner** can be selected as the **primary pet** or optional **sidekick**, regardless of species, rarity, habitat, age, egg stage or starter/adoption origin. Players can change either selection for free.

- **Primary:** most prominently featured pet on the home screen and applicable world-adventure scenes.
- **Sidekick:** independently chosen second owned animal, or empty. One animal should not occupy both roles at once; selection UI must resolve conflicts clearly.
- Changing roles does not affect mastery, earn coins, remove animals or change growth stages.
- Selection is isolated per profile, including multiple learner profiles on one tablet.
- The UI may illustrate the primary/sidekick following the learner, but the engine owns IDs, persistence, validation and events.
- A deleted or invalid referenced pet requires a safe empty-role fallback; keep old save compatibility.

## 6. Current engine coverage / gaps

**Already described in `ENGINE_API.md` v1.0.0:** `NQ.pets.clean(pet)` (pet cleanliness), `NQ.pets.messes(hab)`, `NQ.pets.genMess(hab)`, `NQ.pets.cleanMess(hab,id)` (pen mess), `NQ.shop.buy` (tools/food/habitats), pet stages `baby|kid|adult` and moods `sleepy|hungry|dirty|happy`.

**Not yet part of the agreed API:** actual egg presentation lifecycle, sickness/tired/excited display conditions, distinct bath-time action/animation state, enforced clean-pen tool validation and resource consumption, or owned primary-pet/sidekick selection.

Ask Claude to propose engine-owned, backward-compatible API actions (illustrative, not pre-approved): `pets.setPrimary(petId)`, `pets.setSidekick(petIdOrNull)`, `pets.bathe(petId,supplies)`, `pets.cleanMessWithTool(hab,mess,tool)`, plus read-only character display state/events.

The UI must **never** change saved pet stats, inventory, coins, messes or selected companions directly. Changes require engine validation and safe persistence, respecting existing `noteQuest.v1` saves and `NQ1:` export/import codes.

## 7. Acceptance checklist

- Ten distinct original animal visuals; deeper anatomy, expression and visual detail.
- A bath-time scene clearly washing an animal, distinct from the pen-cleaning scene.
- A dirty animal depiction and visible stylized poop in the enclosure.
- Purchased/owned supplies shown as in-game inventory; impossible cleanup if missing supplies does not falsely succeed.
- No coin rewards for care chores or real-money transactions.
- Any owned animal can become primary or sidekick for any learner profile; each role can be switched without losing progress.
- Backward-compatible engine design, independent peer review and owner merge governance preserved.
- The engine split PR #1 remains a separate unchanged-gameplay change; this new feature scope is **not** implied approval or instruction to modify that PR.

**Next:** Generate the original ten-version capybara concept sheet with bath and pen cleanup represented as separate activities; review style with owner. Then finish and review the Logo Direction Guide.
