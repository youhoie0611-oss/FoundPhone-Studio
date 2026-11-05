import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";
import { compileStory } from "../src/story-engine/compiler.ts";
import { advance, choose, dispatch, visible } from "../src/engine.ts";
import { initialRuntime, safeMedia } from "../src/schema.ts";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const scene = (name) => "brick3-photo-" + name;
function preparedWork() {
  const script = readJson("stories/ambiguity-b/story.json");
  const manifest = readJson("docs/brick3-photo-events-v1.json");
  return compileStory(injectBrick3PhotoEvents(script, manifest)).work;
}
function startAt(w, eventId) {
  // Trigger the actual generated event through a test-only entry node.
  // This avoids having to skip twenty-one virtual days to exercise one branch.
  const node = {
    ...w.nodes[0],
    id: "test-photo-entry",
    label: "test-only photo entry",
    type: "event",
    event: "testPhotoEntry",
    target: "",
    once: true,
    next: [scene(eventId) + "-arrive"],
    conditions: [],
    actions: [],
  };
  const testWork = { ...w, nodes: [...w.nodes, node] };
  return dispatch(testWork, initialRuntime(testWork), "testPhotoEntry");
}
const isUnlocked = (s, id) => s.unlocked.includes(scene(id));

describe("Brick3 photo choices and gallery runtime", () => {
  it("offers four native KKT choices and keeps every album locked on invitation", () => {
    const w = preparedWork();
    const s = startAt(w, "photo_dinner_invite");
    const choices = s.choices.filter((c) => c.target.startsWith(scene("photo_dinner_invite") + "-choice-"));
    expect(choices.map((c) => c.label)).toEqual([
      "好啊，我等等過去。",
      "你居然會主動邀請我？",
      "今天不方便，下次吧。",
      "只有吃飯？",
    ]);
    for (const n of [1, 2, 3, 4]) {
      expect(isUnlocked(s, "photo_dinner_at_home-album-" + n)).toBe(false);
    }
    expect(isUnlocked(s, "photo_dinner_invite-caption")).toBe(true);
  });

  it("refusing dinner never unlocks a visit photo, even as time advances", () => {
    const w = preparedWork();
    const invited = startAt(w, "photo_dinner_invite");
    const declined = choose(w, invited, scene("photo_dinner_invite-choice-3"));
    expect(declined.variables.brick3_photo_photo_dinner_invite_choice).toBe(3);
    const later = advance(w, declined, 22 * 60 * 1000);
    expect(isUnlocked(later, "photo_dinner_at_home-caption")).toBe(false);
    for (const n of [1, 2, 3, 4])
      expect(isUnlocked(later, "photo_dinner_at_home-album-" + n)).toBe(false);
  });

  it("accepting dinner unlocks only actual visit photos, not unchosen intimacy", () => {
    const w = preparedWork();
    const invited = startAt(w, "photo_dinner_invite");
    const accepted = choose(w, invited, scene("photo_dinner_invite-choice-1"));
    expect(accepted.scheduled.some((n) => n.nodeId === "brick3-photo-visit-travel")).toBe(true);
    expect(isUnlocked(accepted, "photo_dinner_at_home-album-1")).toBe(false);
    const visited = advance(w, accepted, 22 * 60 * 1000);
    expect(isUnlocked(visited, "photo_dinner_at_home-caption")).toBe(true);
    for (const n of [1, 2, 3])
      expect(isUnlocked(visited, "photo_dinner_at_home-album-" + n)).toBe(true);
    expect(isUnlocked(visited, "photo_dinner_at_home-album-4")).toBe(false);
    expect(visited.choices.filter((c) => c.target.startsWith(scene("photo_dinner_at_home-choice-")))).toHaveLength(4);
  });

  it("persists delivered photos across state serialization without replay", () => {
    const w = preparedWork();
    const invited = startAt(w, "photo_dinner_invite");
    const stored = JSON.parse(JSON.stringify(invited));
    const resumed = dispatch(w, stored, "read", scene("photo_dinner_invite-caption"));
    expect(isUnlocked(resumed, "photo_dinner_invite-caption")).toBe(true);
    expect(resumed.notifications).toEqual(invited.notifications);
    expect(resumed.choices).toEqual(invited.choices);
  });

  it("accepts only bundled WebP asset paths, not remote URLs or traversal", () => {
    expect(safeMedia("./story-photos/pei_zhiyu/pei_zhiyu_dinner_chat_01.webp"))
      .toBe("./story-photos/pei_zhiyu/pei_zhiyu_dinner_chat_01.webp");
    expect(safeMedia("./story-photos/pei_zhiyu/../../private.webp")).toBe("");
    expect(safeMedia("https://example.com/image.webp")).toBe("");
    expect(safeMedia("javascript:alert(1)")).toBe("");
    const w = preparedWork();
    const photo = w.data.photos.find((i) => i.id === scene("photo_dinner_at_home-album-1"));
    const initial = initialRuntime(w);
    expect(visible(photo, initial)).toBe(false);
  });
});
