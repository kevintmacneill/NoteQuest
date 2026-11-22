/**
 * Portable, read-only character identity contract.
 * This module selects versioned source files; it NEVER synthesizes artwork,
 * changes a character, upscales rasters, or grants game rewards.
 */
export const CHARACTER_IDENTITY_SCHEMA = "character.identity/1.0";
const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MODEL_TYPES = new Set(["model/gltf+json", "model/gltf-binary"]);
const APPROVALS = new Set(["OWNER_SELECTED_REFERENCE", "OWNER_APPROVED", "CANDIDATE"]);

function requireThat(value, description) {
  if (!value) throw new TypeError("Character identity: " + description);
}
function validPath(value) {
  return typeof value === "string" && value.length > 0 &&
    !value.startsWith("/") && !value.startsWith("\\") &&
    !/^[a-z]+:\/\//i.test(value) &&
    !value.includes("\\") && !/[?#]/.test(value) &&
    value.split("/").every(part => part !== "" && part !== "." && part !== "..");
}
function positiveInt(value) {
  return Number.isSafeInteger(value) && value > 0;
}
/** Reject malformed/ambiguous identity and asset manifests. Does not read files. */
export function validateCharacterIdentity(record) {
  requireThat(record && typeof record === "object" && !Array.isArray(record), "record must be an object");
  requireThat(record.schema === CHARACTER_IDENTITY_SCHEMA, "unsupported schema");
  requireThat(typeof record.id === "string" && ID.test(record.id), "invalid stable id");
  requireThat(positiveInt(record.revision), "revision must be a positive integer");
  requireThat(typeof record.role === "string" && record.role.trim(), "role is required");
  requireThat(record.displayName === null ||
    (typeof record.displayName === "string" && record.displayName.trim()), "displayName must be text or null");
  const original = record.original;
  requireThat(original && SHA256.test(original.sha256), "original SHA-256 is required");
  requireThat(positiveInt(original.width) && positiveInt(original.height), "original dimensions required");
  requireThat(typeof original.repositoryStatus === "string" && original.repositoryStatus.trim(), "original repository status required");
  requireThat(Array.isArray(record.immutableMarkers) && record.immutableMarkers.length > 0 &&
    record.immutableMarkers.every(m => typeof m === "string" && m.trim()), "immutable markers required");
  requireThat(Array.isArray(record.assets) && record.assets.length > 0, "at least one file asset is required");
  requireThat(record.future3d && ["NOT_CREATED", "CONCEPT_ONLY", "APPROVED"].includes(record.future3d.status),
    "future3d.status must declare model readiness");
  const ids = new Set();
  for (const asset of record.assets) {
    requireThat(asset && typeof asset === "object", "asset must be an object");
    requireThat(typeof asset.id === "string" && ID.test(asset.id) && !ids.has(asset.id), "asset ids must be unique slugs");
    ids.add(asset.id);
    requireThat(validPath(asset.path), "asset path must be a safe relative path");
    requireThat(SHA256.test(asset.sha256) && SHA256.test(asset.sourceSha256), "asset hash and source hash required");
    requireThat(asset.sourceSha256 === original.sha256, "asset must trace to the locked source original");
    requireThat(APPROVALS.has(asset.approval), "asset approval must be explicit");
    requireThat(Array.isArray(asset.purposes) && asset.purposes.length > 0 &&
      asset.purposes.every(p => typeof p === "string" && ID.test(p)), "asset purposes required");
    if (asset.kind === "2d-raster") {
      requireThat(["image/png", "image/jpeg", "image/webp"].includes(asset.mediaType), "raster media type mismatch");
      requireThat(positiveInt(asset.width) && positiveInt(asset.height), "raster dimensions required");
    } else if (asset.kind === "2d-vector") {
      requireThat(asset.mediaType === "image/svg+xml", "vector must be SVG");
    } else if (asset.kind === "3d-model") {
      requireThat(MODEL_TYPES.has(asset.mediaType), "model must be glTF");
      requireThat(asset.approval !== "OWNER_SELECTED_REFERENCE", "3D models require separate owner approval");
    } else {
      throw new TypeError("Character identity: unsupported asset kind");
    }
  }
  if (record.future3d.status === "APPROVED") {
    requireThat(record.assets.some(a => a.kind === "3d-model" && a.approval === "OWNER_APPROVED"),
      "approved 3D status requires an approved model asset");
  }
  return true;
}

/**
 * Return an approved, traceable asset choice, not generated pixels.
 * minWidth/minHeight apply to rasters; vectors are resolution-independent.
 * The reference-only approval state can NEVER be selected for gameplay/video.
 */
export function selectCharacterAsset(record, {
  purpose = "reference", minWidth = 0, minHeight = 0
} = {}) {
  validateCharacterIdentity(record);
  requireThat(typeof purpose === "string" && ID.test(purpose), "purpose must be a slug");
  requireThat(Number.isSafeInteger(minWidth) && minWidth >= 0 &&
    Number.isSafeInteger(minHeight) && minHeight >= 0, "minimum dimensions must be nonnegative integers");
  const eligible = record.assets.filter(asset => {
    if (!asset.purposes.includes(purpose)) return false;
    if (asset.approval !== "OWNER_APPROVED" &&
        !(purpose === "reference" && asset.approval === "OWNER_SELECTED_REFERENCE")) return false;
    if (asset.kind === "2d-raster" &&
        (asset.width < minWidth || asset.height < minHeight)) return false;
    if (asset.kind === "3d-model" && (minWidth || minHeight)) return false;
    return true;
  }).sort((a,b) => {
    const aPixels = a.kind === "2d-raster" ? a.width*a.height : Number.MAX_SAFE_INTEGER;
    const bPixels = b.kind === "2d-raster" ? b.width*b.height : Number.MAX_SAFE_INTEGER;
    return aPixels - bPixels || a.id.localeCompare(b.id);
  });
  if (!eligible.length) throw new RangeError(
    "Character identity: no approved " + purpose + " asset for requested use/resolution; do not regenerate or upscale silently"
  );
  const asset = eligible[0];
  return Object.freeze({
    characterId: record.id,
    revision: record.revision,
    assetId: asset.id,
    path: asset.path,
    sha256: asset.sha256,
    sourceSha256: asset.sourceSha256,
    mediaType: asset.mediaType,
    kind: asset.kind,
    width: asset.width ?? null,
    height: asset.height ?? null
  });
}
