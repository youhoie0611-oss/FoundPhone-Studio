import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";
import { injectBrick3V7Lu } from "../scripts/brick3-v7-lu.mjs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const makeStory = () => injectBrick3PhotoEvents(
  readJson("stories/ambiguity-b/story.json"),
  readJson("docs/brick3-photo-events-v1.json"),
);
const actions = (node) => node.actions ?? [];
const hasUnlock = (node, key) => actions(node).some((a) => a.type === "unlock" && a.key === key);

describe("Brick3 photo event integration", () => {
  it("adds four native choices for each reachable NPC photo event", () => {
    const story = makeStory();
    const nodeIds = story.events.map((n) => n.id);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    for (const scene of ["photo_morning_breakfast", "photo_design_review", "photo_camera_walk", "photo_practice_update", "photo_night_view", "photo_weekend_sport"]) {
      const options = story.events.find((n) => n.id === "brick3-photo-" + scene + "-options");
      expect(options?.next).toHaveLength(4);
      expect(options.next.every((id) => story.events.some((n) => n.id === id))).toBe(true);
    }
  });

  it("leaves Pei's former fixed-day dinner to the affinity-based invitation runtime", () => {
    const story = makeStory();
    expect(story.events.some((e) => e.id === "brick3-photo-photo_dinner_invite-arrive")).toBe(false);
    expect(story.events.some((e) => e.id === "brick3-photo-photo_dinner_at_home-arrive")).toBe(false);
    const manifest = readJson("docs/brick3-photo-events-v1.json");
    expect(manifest.events.find((e) => e.eventId === "photo_dinner_at_home").images).toHaveLength(1);
  });

  it("keeps missing images as external safe assets and the fifth lead gated", () => {
    const story = makeStory();
    const media = [
      ...story.chats.flatMap((c) => c.messages),
      ...(story.content.photos ?? []),
    ].filter((item) => item.id.startsWith("brick3-photo-") && item.media);
    expect(media.length).toBeGreaterThan(5);
    expect(media.every((item) => /^\.\/story-photos\/[a-z_]+\/[a-z0-9_]+\.webp$/.test(item.media))).toBe(true);
    expect(story.chats.some((c) => c.title === "陸沉川")).toBe(false);
    expect(story.events.some((n) => n.id === "brick3-photo-photo_off_duty-arrive")).toBe(false);
  });

  it("keeps Lu photo events in the new VP canon with distinct replies and private-contact gates", () => {
    const manifest = readJson("docs/brick3-photo-events-v1.json");
    const lu = manifest.events.filter(e => e.characterId === "lu_chenchuan");
    expect(lu).toHaveLength(2);
    for (const event of lu) {
      expect(event.trigger.requiresEstablishedPrivateContact).toBe(true);
      expect(event.choices).toHaveLength(4);
      expect(new Set(event.choices.map(c => c.text)).size).toBe(4);
      expect(event.choices.every(c => event.onChoiceResponses[c.id]?.reply.length > 0)).toBe(true);
      expect(event.images[0].path.startsWith("public/story-photos/lu_chenchuan/")).toBe(true);
      expect(event.images[0].filename.startsWith("lu_chenchuan_")).toBe(true);
      expect(event.images[0].filename.endsWith(".webp")).toBe(true);
      expect(event.gallery.entersPlayerAlbum).toBe(false);
      expect(event.images[0].uploadStatus).toBe("pending_player_manual_upload");
    }
    // The production build injects Lu before photo events; test that actual order.
    const raw = readJson("stories/ambiguity-b/story.json");
    injectBrick3V7Lu(raw);
    const story = injectBrick3PhotoEvents(raw, manifest);
    for (const event of lu) {
      const wait = story.events.find(n => n.id === `brick3-photo-${event.eventId}-wait`);
      expect(wait?.conditions).toContainEqual({ key: "lu_private_contact", op: "eq", value: true });
      expect(story.events.some(n => n.id === `brick3-photo-${event.eventId}-followup-wait`)).toBe(true);
    }
  });

  it("does not mutate other stories and is safe to invoke twice", () => {
    const source = readJson("stories/blank/story.json");
    expect(injectBrick3PhotoEvents(source, readJson("docs/brick3-photo-events-v1.json"))).toBe(source);
    const once = makeStory();
    const length = once.events.length;
    injectBrick3PhotoEvents(once, readJson("docs/brick3-photo-events-v1.json"));
    expect(once.events.length).toBe(length);
  });
});
