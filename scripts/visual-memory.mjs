import { readFile, stat } from "node:fs/promises";
import { join, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const registryPath = "assets/characters/visual-memory-registry.json";
const [command = "check", characterId, rawDestination = "chat"] = process.argv.slice(2);
const destinations = { chat: "kkt", kkt: "kkt", instagram_story: "instagramStory", instagramStory: "instagramStory", instagram_post: "instagramPost", instagramPost: "instagramPost" };
const loadJson = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));
const fail = (message) => { throw new Error(message); };
function safePath(path) {
  if (typeof path !== "string" || !path.startsWith("assets/characters/")) fail("Path must be under assets/characters/");
  const resolved = resolve(root, path);
  if (!relative(root, resolved) || relative(root, resolved).startsWith(".." + sep)) fail("Path escapes repository");
  return resolved;
}
async function exists(path) {
  try { const s = await stat(safePath(path)); return s.isFile(); } catch { return false; }
}
const registry = await loadJson(registryPath);
if (![1, 2].includes(registry.version) || !registry.characters || typeof registry.characters !== "object") fail("Invalid visual-memory registry");
async function inspect(id, opts = {}) {
  const entry = registry.characters[id];
  if (!entry) fail("Unregistered character: " + id);
  if (entry.status !== "confirmed_visual_identity") {
    if (opts.allowPending) return { id, status: "pending" };
    fail(id + " has no author-confirmed visual identity; do not generate by name alone");
  }
  if (!entry.memoryFile) fail("Missing memoryFile: " + id);
  const memory = await loadJson(entry.memoryFile);
  if (memory.characterId !== id || memory.visualIdentityStatus !== "confirmed") fail("Identity mismatch: " + id);
  for (const key of ["immutableAppearance","typicalWardrobe","cameraHabits","commonScenes","photoDestinations","mandatoryGenerationChecklist"]) {
    if (!memory[key]) fail(id + ": missing " + key);
  }
  const referenceFile = entry.referenceAssetPath;
  const present = !!referenceFile && await exists(referenceFile);
  if (opts.requireReference && !present) fail(id + ": actual reference image is missing; cannot safely generate");
  if (entry.referenceAssetStatus === "available_on_github" && !present) fail(id + ": registry says uploaded but image missing");
  return { id, entry, memory, referenceFile, referenceExists:present };
}
try {
  if (command === "check") {
    let verified = 0, pending = 0;
    for (const id of Object.keys(registry.characters)) {
      const result = await inspect(id, { allowPending:true });
      if (result.status === "pending") { console.log("PENDING " + id + " (author confirmation needed)"); pending++; continue; }
      if (result.referenceExists) { console.log("OK " + id + " : " + result.referenceFile); verified++; }
      else { console.log("WARNING " + id + " : reference image not uploaded; generation prohibited"); pending++; }
    }
    console.log(`Visual memory: ${verified} reference(s) verified, ${pending} pending.`);
  } else if (command === "brief") {
    if (!characterId) fail("Usage: node scripts/visual-memory.mjs brief <character_id> <chat|instagram_story|instagram_post>");
    const key = destinations[rawDestination];
    if (!key) fail("Unknown destination: " + rawDestination);
    const { entry, memory, referenceFile } = await inspect(characterId, { requireReference:true });
    const destination = memory.photoDestinations[key];
    if (!destination) fail("Missing destination: " + key);
    console.log(JSON.stringify({
      character:memory.name,characterId,referenceVersion:entry.approvedReferenceVersion,
      requiredReferenceFile:referenceFile,requiredReferenceAbsolutePath:safePath(referenceFile),
      referenceMustBeAttachedToImageGenerator:true,
      immutableAppearance:memory.immutableAppearance,
      typicalWardrobe:memory.typicalWardrobe,
      cameraHabits:memory.cameraHabits,
      commonScenes:memory.commonScenes,
      destinationKind:key,destinationPath:destination,
      checklist:memory.mandatoryGenerationChecklist
    },null,2));
  } else fail("Unknown command; use check or brief");
} catch (error) {
  console.error("Visual memory error: " + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
}
