import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";

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
    for (const scene of ["photo_morning_breakfast", "photo_design_review", "photo_dinner_invite", "photo_camera_walk", "photo_practice_update", "photo_night_view", "photo_weekend_sport"]) {
      const options = story.events.find((n) => n.id === "brick3-photo-" + scene + "-options");
      expect(options?.next).toHaveLength(4);
      expect(options.next.every((id) => story.events.some((n) => n.id === id))).toBe(true);
    }
  });

  it("does not import a dinner visit merely for receiving an invitation", () => {
    const story = makeStory();
    const invite = story.events.find((n) => n.id === "brick3-photo-photo_dinner_invite-arrive");
    const accept = story.events.find((n) => n.id === "brick3-photo-photo_dinner_invite-choice-1");
    const reject = story.events.find((n) => n.id === "brick3-photo-photo_dinner_invite-choice-3");
    const visit = story.events.find((n) => n.id === "brick3-photo-photo_dinner_at_home-arrive");
    const hands = "brick3-photo-photo_dinner_at_home-album-4";
    expect(actions(invite).some((a) => a.key === hands)).toBe(false);
    expect(accept.next).toContain("brick3-photo-visit-travel");
    expect(reject.next).not.toContain("brick3-photo-visit-travel");
    expect(hasUnlock(visit, hands)).toBe(false);
    expect(hasUnlock(story.events.find((n) => n.id === "brick3-photo-photo_dinner_at_home-choice-2-reply-arrive"), hands)).toBe(true);
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

  it("does not mutate other stories and is safe to invoke twice", () => {
    const source = readJson("stories/blank/story.json");
    expect(injectBrick3PhotoEvents(source, readJson("docs/brick3-photo-events-v1.json"))).toBe(source);
    const once = makeStory();
    const length = once.events.length;
    injectBrick3PhotoEvents(once, readJson("docs/brick3-photo-events-v1.json"));
    expect(once.events.length).toBe(length);
  });
});
