import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async path => JSON.parse(await readFile(resolve(root, path), "utf8"));
const index = await readJson("stories/visual-memory/index.json");
if (index.schemaVersion !== 1 || !Array.isArray(index.characters)) throw Error("Invalid visual-memory index");
const seen = new Set();
for (const item of index.characters) {
  if (!item.characterId || seen.has(item.characterId)) throw Error("Duplicate or invalid characterId");
  seen.add(item.characterId);
  const memory = await readJson(item.manifest);
  if (memory.characterId !== item.characterId || memory.lockStatus !== "approved_locked") throw Error("Invalid manifest for " + item.characterId);
  const ref = memory.identityReference;
  if (item.canonicalImage !== ref.repositoryPath || !ref.gitBlobSha) throw Error("Broken image reference for " + item.characterId);
  const bytes = await readFile(resolve(root, ref.repositoryPath));
  const hash = createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0")).update(bytes).digest("hex");
  if (hash !== ref.gitBlobSha || hash !== item.gitBlobSha) throw Error("Locked visual reference modified without approval: " + item.characterId);
  console.log("OK " + item.characterId + " → " + ref.repositoryPath);
}
console.log("Visual memory validated: " + seen.size + " approved characters.");
