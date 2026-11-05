import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3V7Lu } from "../scripts/brick3-v7-lu.mjs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";
import { compileStory } from "../src/story-engine/compiler.ts";
import { initialRuntime } from "../src/schema.ts";
import { choose, advance, dispatch, visible } from "../src/engine.ts";

const read = (file) => JSON.parse(readFileSync(file, "utf8"));
function v7Work() {
  const source = injectBrick3V7Lu(read("stories/ambiguity-b/story.json"));
  const joined = injectBrick3PhotoEvents(source, read("docs/brick3-photo-events-v1.json"));
  return compileStory(joined).work;
}
function invoke(work, nextId) {
  const testNode = {
    ...work.nodes[0],
    id: "v7-test-entry",
    label: "isolated test entry",
    type: "event",
    event: "v7Test",
    target: nextId,
    once: true,
    next: [nextId],
    actions: [],
    conditions: [],
  };
  const w = { ...work, nodes: [...work.nodes, testNode] };
  return { w, state: dispatch(w, initialRuntime(w), "v7Test", nextId) };
}
const has = (s, id) => s.unlocked.includes(id);
const four = (s, event) => s.choices.filter((c) => c.target.startsWith("brick3-photo-" + event + "-choice-"));

describe("Brick3 V7 Lu Chenchuan entry respects boundaries", () => {
  it("is isolated, idempotent, and hides private contact before any encounter", () => {
    const blank = read("stories/blank/story.json");
    expect(injectBrick3V7Lu(blank)).toBe(blank);
    const story = injectBrick3V7Lu(read("stories/ambiguity-b/story.json"));
    const count = story.events.length;
    expect(injectBrick3V7Lu(story).events.length).toBe(count);
    const w = v7Work(), s = initialRuntime(w);
    const contact = w.data.contacts.find((i) => i.id === "luchenchuan-card");
    expect(contact).toBeDefined();
    expect(visible(contact, s)).toBe(false);
    const privateMessages = w.data.kakao.filter((i) => i.title === "陸沉川");
    expect(privateMessages.length).toBeGreaterThan(2);
    expect(privateMessages.every((i) => !visible(i, s))).toBe(true);
    expect(s.variables.lu_attraction).toBe(0);
    expect(s.variables.lu_jealousy).toBe(0);
  });

  it("offers an optional group invitation; refusing never forces a first meeting", () => {
    const work = v7Work();
    const { w, state } = invoke(work, "v7-lu-group-invite-arrive");
    expect(four(state, "v7_lu_invite")).toHaveLength(4);
    const declined = choose(w, state, "brick3-photo-v7_lu_invite-choice-4");
    const later = advance(w, declined, 20 * 60 * 1000);
    expect(later.variables.lu_met_in_service).toBe(false);
    expect(later.variables.lu_private_contact).toBe(false);
    expect(has(later, "v7-lu-first-encounter-note")).toBe(false);
  });

  it("does not mark a visit unless the player actively enters the venue", () => {
    const work = v7Work();
    const { w, state } = invoke(work, "v7-lu-venue-arrival-arrive");
    expect(four(state, "v7_lu_arrival")).toHaveLength(4);
    const left = choose(w, state, "brick3-photo-v7_lu_arrival-choice-3");
    expect(left.variables.lu_met_in_service).toBe(false);
    const entered = choose(w, state, "brick3-photo-v7_lu_arrival-choice-1");
    const after = advance(w, entered, 4_000);
    expect(after.variables.lu_met_in_service).toBe(true);
    expect(has(after, "v7-lu-first-encounter-note")).toBe(true);
    expect(after.variables.lu_private_contact).toBe(false);
  });

  it("unlocks private KKT and its photo anchors only after contact exchange", () => {
    const work = v7Work();
    const { w, state } = invoke(work, "v7-lu-contact-offer-arrive");
    expect(four(state, "v7_lu_contact")).toHaveLength(4);
    const notExchanged = advance(w,
      choose(w, state, "brick3-photo-v7_lu_contact-choice-2"), 4_000);
    expect(has(notExchanged, "v7-lu-private-1")).toBe(false);
    const accepted = choose(w, state, "brick3-photo-v7_lu_contact-choice-1");
    const reached = advance(w, accepted, 70_000);
    expect(reached.variables.lu_private_contact).toBe(true);
    expect(has(reached, "luchenchuan-card")).toBe(true);
    expect(has(reached, "v7-lu-private-1")).toBe(true);
    expect(four(reached, "v7_lu_private")).toHaveLength(4);
    const chosen = choose(w, reached, "brick3-photo-v7_lu_private-choice-1");
    expect(chosen.variables.brick3_v7_lu_private_choice).toBe(1);
    expect(chosen.unlocked.includes("brick3-photo-v7_lu_private-choice-1-out")).toBe(true);
    const firstPrivate = w.nodes.find((n) => n.id === "v7-lu-private-contact-arrive");
    expect(firstPrivate?.next.some((x) => x === "brick3-photo-photo_off_duty-wait")).toBe(true);
    expect(has(reached, "brick3-photo-photo_off_duty-image-1")).toBe(false);
  });
});
