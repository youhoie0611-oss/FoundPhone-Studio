import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3V7Lu } from "../scripts/brick3-v7-lu.mjs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";
import { injectBrick3Affinity } from "../scripts/brick3-affinity.mjs";
import { compileStory } from "../src/story-engine/compiler.ts";
import { dispatch, choose, visible } from "../src/engine.ts";
import { initialRuntime, safeMedia } from "../src/schema.ts";

const load = (name) => JSON.parse(readFileSync(name, "utf8"));
const preparedWork = () => {
  const story = injectBrick3V7Lu(load("stories/ambiguity-b/story.json"));
  injectBrick3PhotoEvents(story, load("docs/brick3-photo-events-v1.json"));
  injectBrick3Affinity(story);
  return compileStory(story).work;
};
function deliver(w, eventId) {
  const node = {
    ...w.nodes[0], id: "test-photo-delivery", label: "test photo delivery", type: "event",
    event: "testPhotoDelivery", target: "", once: true,
    next: ["brick3-photo-" + eventId + "-arrive"], conditions: [], actions: [],
  };
  const work = { ...w, nodes: [...w.nodes, node] };
  return { work, state: dispatch(work, initialRuntime(work), "testPhotoDelivery") };
}

describe("Brick3 independent NPC photo messages", () => {
  it("keeps one image per ordinary photo event, four native reply choices and no gallery auto-import", () => {
    const w = preparedWork();
    const { state } = deliver(w, "photo_camera_walk");
    expect(state.choices.filter(c => c.target.startsWith("brick3-photo-photo_camera_walk-choice-"))).toHaveLength(4);
    const attachments = w.data.kakao.filter(i => i.id.startsWith("brick3-photo-photo_camera_walk-image-"));
    expect(attachments).toHaveLength(1);
    expect(state.unlocked).toContain(attachments[0].id);
    expect((w.data.photos ?? []).some(i => i.id.startsWith("brick3-photo-photo_camera_walk-album-"))).toBe(false);
  });

  it("keeps the old Pei invitation disabled and exposes only one dinner reward in the new manifest", () => {
    const w = preparedWork();
    expect(w.nodes.some(n => n.id === "brick3-photo-photo_dinner_invite-arrive")).toBe(false);
    const manifest = load("docs/brick3-photo-events-v1.json");
    expect(manifest.events.find(e => e.eventId === "photo_dinner_at_home").images).toHaveLength(1);
  });

  it("delivers scripted messages without requiring the player to open the thread", () => {
    const w = preparedWork();
    const { state } = deliver(w, "photo_night_view");
    const photo = w.data.kakao.find(i => i.id === "brick3-photo-photo_night_view-image-1");
    expect(visible(photo, state)).toBe(true);
    expect(state.read).not.toContain(photo.id);
    expect((w.data.photos ?? []).some(i => i.id.startsWith("brick3-photo-photo_night_view-album-"))).toBe(false);
  });

  it("only permits local safe WebP paths; unuploaded images remain eligible for missing-asset filtering", () => {
    expect(safeMedia("./story-photos/shen_yanzhou/shen_yanzhou_night_view_event_01.webp"))
      .toBe("./story-photos/shen_yanzhou/shen_yanzhou_night_view_event_01.webp");
    expect(safeMedia("./story-photos/shen_yanzhou/../private.webp")).toBe("");
    expect(safeMedia("https://example.com/photo.webp")).toBe("");
  });
});
