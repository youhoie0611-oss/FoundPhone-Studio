// Dedicated Shen Batch01 KKT browser fixture.
// Build ONLY the source story plus authored photo events, without injecting
// unrelated character packages. This does not replace production compilation.
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { injectBrick3PhotoEvents } from "./brick3-photo-events.mjs";
const base = JSON.parse(await readFile("stories/ambiguity-b/story.json", "utf8"));
const manifest = JSON.parse(await readFile("docs/brick3-photo-events-v1.json", "utf8"));
const shen = manifest.events.filter((entry) => entry.batchId === "shen_yanzhou_batch01");
if (shen.length !== 10) throw Error("Expected ten Shen Batch01 photo events");
injectBrick3PhotoEvents(base, { ...manifest, events: shen });
const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, entries: [] },
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { compileStory } = await server.ssrLoadModule("/src/story-engine/compiler.ts");
  const { work } = compileStory(base);
  const photos = work.data.kakao.filter((m) =>
    /^brick3-photo-photo_shen_batch01_/.test(m.id) && m.kind === "image"
  );
  if (photos.length !== 10) throw Error("Fixture did not compile ten Shen photos, found " + photos.length);
  await writeFile("public/work.json", JSON.stringify(work, null, 2) + "\n");
  console.log("Shen KKT isolated browser fixture compiled: " + photos.length + " photo messages.");
} finally {
  await server.close();
}
