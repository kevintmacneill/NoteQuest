/**
 * Compatibility adapter for the existing NoteQuest milestone-dragon canon.
 * Do not keep a second manually edited dragon identity record.
 * The canonical appearance and bytes remain owned by canon.v1.json and its art.
 */
import { CHARACTER_IDENTITY_SCHEMA, validateCharacterIdentity } from "./index.mjs";

export function fromNoteQuestDragonCanon(canon) {
  if (!canon || canon.schema !== "notequest.character.canon/1.0" ||
      canon.id !== "milestone-dragon") {
    throw new TypeError("Expected NoteQuest milestone-dragon canon v1");
  }
  const record = {
    schema: CHARACTER_IDENTITY_SCHEMA,
    id: canon.id,
    revision: 1,
    role: canon.canonicalRole,
    displayName: canon.displayName,
    original: {
      sha256: canon.original.sha256,
      width: canon.original.width,
      height: canon.original.height,
      repositoryStatus: canon.original.repositoryStatus
    },
    immutableMarkers: [...canon.immutableMarkers],
    assets: [{
      id: "canonical-reference-thumbnail",
      path: "milestone-dragon/" + canon.image.path,
      kind: "2d-raster",
      mediaType: canon.image.type,
      sha256: canon.image.sha256,
      sourceSha256: canon.original.sha256,
      width: canon.image.width,
      height: canon.image.height,
      approval: "OWNER_SELECTED_REFERENCE",
      purposes: ["reference"]
    }],
    future3d: { status: "NOT_CREATED" }
  };
  validateCharacterIdentity(record);
  return record;
}
