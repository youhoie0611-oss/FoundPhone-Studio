// Shen Yanzhou V1.0 asset/identity contract checks.
// This validates author-authored story files; it does NOT replace image-model
// reference conditioning or claim to enforce visual similarity at runtime.
import { existsSync, readFileSync } from "node:fs";

const load = (path) => JSON.parse(readFileSync(path, "utf8"));
const story = load("stories/ambiguity-b/story.json");
const memory = load("stories/ambiguity-b/visual-memory/shen-yanzhou.json");
const index = load("stories/ambiguity-b/characters/shen-yanzhou-photo-index.json");
const policy = readFileSync("stories/ambiguity-b/characters/shen-yanzhou-photo-rules-v1.md", "utf8");
const failures = [];
const check = (pass, message) => { if (!pass) failures.push(message); };
const exists = (path) => existsSync(path);

check(index.policyVersion === "1.0", "photo index must use the approved V1.0 policy");
check(index.characterId === "shenyanzhou", "photo index character must be shenyanzhou");
check(memory.characterId === "shenyanzhou" && memory.status === "locked", "Shen visual identity must be locked");
check(memory.photoGenerationPolicy?.forbidden?.askPlayerToSendAnyPhoto === true, "Never ask the player to send private photos");
check(memory.photoGenerationPolicy?.forbidden?.appliesAtAllRelationshipStages === true, "Photo-request ban applies at every relationship stage");
check(memory.photoGenerationPolicy?.rulesPath === index.ruleFile, "Visual memory and photo registry must use the same policy");
check(policy.includes("永久禁令") && policy.includes("40%"), "Approved source policy is missing permanent restrictions or selfie mix");
const ref = memory.referenceImages.find((x) => x.role === "author-approved-master-sheet");
check(Boolean(ref?.repositoryPath) && exists(ref.repositoryPath), "Approved canonical visual reference must exist in repository");

const weights = memory.photoGenerationPolicy?.mixWeights ?? {};
const total = Object.values(weights).reduce((sum, x) => sum + x, 0);
check(Math.abs(total - 1) < 0.0001 && weights.selfie === 0.40, "Suggested long-term photo weights must sum to 100% with selfie at 40%");
const withOthers = memory.photoGenerationPolicy?.withOthersConditionalWeights ?? {};
check(Math.abs(Object.values(withOthers).reduce((s, n) => s + n, 0) - 1) < 0.0001, "Conditional outing photo weights must sum to 100%");

const chat = story.chats.find((x) => x.id === "kkt-shen");
check(Boolean(chat), "Shen KKT chat is missing");
const items = new Map(chat?.messages.map((item) => [item.id, item]) ?? []);
const events = new Map(story.events.map((event) => [event.id, event]));
const unique = new Set();
for (const photo of index.photos) {
  check(!unique.has(photo.photoId), `Duplicate photoId: ${photo.photoId}`);
  unique.add(photo.photoId);
  const item = items.get(photo.photoId);
  check(Boolean(item), `Photo item is missing: ${photo.photoId}`);
  if (item) {
    check(item.kind === "image", `Photo kind must be image: ${photo.photoId}`);
    check(item.media === photo.mediaPath, `Photo media mismatch: ${photo.photoId}`);
    check(item.meta?.photoId === photo.photoId, `Photo metadata ID mismatch: ${photo.photoId}`);
    check(item.meta?.photoPolicy === "V1.0", `Photo policy metadata mismatch: ${photo.photoId}`);
  }
  check(photo.repoPath.startsWith("public/") && photo.mediaPath === "./" + photo.repoPath.slice(7), `Media path and asset path differ: ${photo.photoId}`);
  check(exists(photo.repoPath), `Image asset missing from repository: ${photo.repoPath}`);
  const event = events.get(photo.eventId);
  check(Boolean(event) && event.actions?.some((action) => action.type === "unlock" && action.key === photo.photoId), `Image delivery event missing: ${photo.photoId}`);
}

const forbiddenRequests = [
  /(?:妳|你).{0,10}(?:自拍|照片|相片|圖片).{0,10}(?:傳給我|傳我|給我看|回傳)/u,
  /(?:妳|你).{0,8}拍(?:一張|張|個自拍).{0,10}(?:給我|傳我|看看)/u,
  /(?:自拍|照片|相片|圖片).{0,8}(?:換妳|換你|回傳給我|回傳我)/u,
  /(?:我都傳了|我傳給妳了).{0,18}(?:妳|你).{0,12}(?:傳|拍|給我)/u,
  /(?:拍一張|拍張).{0,8}(?:給我|傳我|我看)/u,
  /(?:換妳|換你).{0,8}(?:拍|傳|給我|自拍)/u,
  /(?:傳|發).{0,5}(?:自拍|生活照|照片|相片).{0,8}(?:給我|傳我|我看)/u,
];
for (const item of chat?.messages ?? []) {
  if (item.senderId !== "shenyanzhou") continue;
  if (forbiddenRequests.some((pattern) => pattern.test(item.body ?? "")))
    failures.push(`Possible player photo request in ${item.id}: ${item.body}`);
}
if (failures.length) {
  console.error("Shen photo V1.0 validation failed:\n" + failures.map((x) => " - " + x).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Shen photo V1.0 validated: ${unique.size} registered image assets, no forbidden photo-request patterns detected.`);
}
