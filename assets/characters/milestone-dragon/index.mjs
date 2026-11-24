/** NoteQuest canonical milestone dragon identity (pure visual registry; no game rules). */
export const MILESTONE_DRAGON_ID = "milestone-dragon";
export const MILESTONE_DRAGON = Object.freeze({
  id: MILESTONE_DRAGON_ID,
  role: "journey-milestone-guide",
  // Character is intentionally unnamed until Kevin provides a name.
  displayName: null,
  assetUrl: new URL("./reference-v1.webp", import.meta.url).href,
  width: 256,
  height: 320,
  imageSha256: "688d0ec3bebc18b4b7c1f36b174cf661c7b7114635144fc92ee7c2e36c7a9bb9",
  sourceOriginalSha256: "1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052",
  altText: "Smiling ivory-white dragon with violet eyes, pink wings, pastel swirls, and a purple diamond necklace."
});
/**
 * Create the same source-controlled dragon image every time.
 * This DOES NOT cause a milestone, mark an assessment, or modify the learner.
 * Do not set a custom src, apply hue/flip filters, or paint over identifying marks.
 */
export function createMilestoneDragonImage({className = "", decorative = false, loading = "lazy"} = {}) {
  if (typeof document === "undefined") throw new Error("Milestone dragon image requires a browser document");
  const img = document.createElement("img");
  img.src = MILESTONE_DRAGON.assetUrl;
  img.width = MILESTONE_DRAGON.width;
  img.height = MILESTONE_DRAGON.height;
  img.decoding = "async";
  img.loading = loading === "eager" ? "eager" : "lazy";
  img.className = className;
  img.alt = decorative ? "" : MILESTONE_DRAGON.altText;
  if (decorative) img.setAttribute("aria-hidden", "true");
  return img;
}
