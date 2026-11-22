/**
 * NoteQuest milestone dragon — event-to-presentation adapter, never a mastery engine.
 * Pure read-only checks against the accepted NQ.journey API v1.6.
 * No images, animation, UI changes, rewards, saved-data writes, or new progression rules.
 */
export const DRAGON_GRADUATION_CUE = "world-graduated";
export const DRAGON_GUIDE_ID = "milestone-dragon";
const REQUIRED_PARTS = Object.freeze(["navigation", "timing", "performance"]);
const validWorldId = id => typeof id === "string" && /^NQ-\d{2}$/.test(id);
const validProfileId = id => typeof id === "string" && id.length > 0;

/**
 * Call synchronously from a journey:unlocked listener with the CURRENT active
 * learner and NQ.journey.status(event.worldId). Capture expectedProfileId from
 * the presenting UI before a readiness attempt, and keep it stable.
 *
 * If any evidence is incomplete, profile identity changes, or the event doesn't
 * match engine status, return null (never guess, unlock, or show a false victory).
 */
export function graduationCueFromVerifiedEvent({
  event,
  activeProfile,
  expectedProfileId,
  journeyStatus
} = {}) {
  if (!event || !activeProfile || !journeyStatus) return null;
  if (!validProfileId(expectedProfileId) ||
      !validProfileId(activeProfile.id) ||
      activeProfile.id !== expectedProfileId) return null;
  if (!validWorldId(event.worldId) ||
      journeyStatus.worldId !== event.worldId ||
      event.to !== journeyStatus.to ||
      (event.to !== null && !validWorldId(event.to))) return null;
  if (journeyStatus.ok !== true ||
      journeyStatus.required !== true ||
      journeyStatus.unlocked !== true ||
      !(Number.isSafeInteger(journeyStatus.unlockedAt) && journeyStatus.unlockedAt > 0) ||
      event.placed !== journeyStatus.placed) return null;
  if (!REQUIRED_PARTS.every(part =>
    journeyStatus.parts?.[part]?.passed === true)) return null;

  const cue = {
    kind: DRAGON_GRADUATION_CUE,
    characterId: DRAGON_GUIDE_ID,
    learnerId: expectedProfileId,
    completedWorldId: event.worldId,
    nextWorldId: event.to,
    placed: event.placed,
    unlockedAt: journeyStatus.unlockedAt,
    // Stable key lets the eventual UI avoid replaying a celebration on refresh.
    // It is NOT a new persistent save ID or proof of mastery.
    key: [DRAGON_GUIDE_ID, DRAGON_GRADUATION_CUE,
      expectedProfileId, event.worldId, journeyStatus.unlockedAt].join(":")
  };
  return Object.freeze(cue);
}

/** Read-only bridge to live NQ; must be called within the unlock event callback. */
export function graduationCueFromEngine(NQ, event, expectedProfileId) {
  if (!NQ || typeof NQ.profiles?.current !== "function" ||
      typeof NQ.journey?.status !== "function" || !validWorldId(event?.worldId))
    return null;
  return graduationCueFromVerifiedEvent({
    event,
    activeProfile: NQ.profiles.current(),
    expectedProfileId,
    journeyStatus: NQ.journey.status(event.worldId)
  });
}
