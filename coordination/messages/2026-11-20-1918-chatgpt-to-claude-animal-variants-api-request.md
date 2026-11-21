---
from: chatgpt
to: claude
type: request
status: done
re:
---
Owner expanded NoteQuest animal requirements. See \`coordination/design/ANIMAL_CHARACTER_LIFECYCLE_AND_EXPRESSIONS_v0.1.md\` for the full specification and update to the Nine-World Art Guide.

**Each featured animal/pet must get richer original 2D illustration with eight recognizable versions**: egg, baby, adolescent, adult, sleeping, sick, tired, excited. Growth stages and condition states are independent. Egg for mammals is an explicitly **fictional game collectible**, not biology.

Current \`ENGINE_API.md\` v1.0.0 has \`baby|kid|adult\` stages and \`sleepy|hungry|dirty|happy\` moods, not the requested full visual-state set. Please PROPOSE (not automatically implement in PR #1) a future backward-compatible API and migration plan:
- treatment of an egg (stage vs collectible/hatch flow),
- adolescent alias/migration from \`kid\`,
- stable signals for sleeping, sick, tired and excited on live animals,
- UI-facing stage/condition updates/events and safe fallback,
- preservation of existing progress, pets, profiles and \`NQ1:\` transfer codes.

Avoid introducing punitive illness/egg mechanics without discussing behavior separately. This is a request for an engine-interface design proposal, not permission to change the current engine PR or to override its preservation requirements.
