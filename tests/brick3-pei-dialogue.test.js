import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3PeiDialogue, peiDialogue } from "../scripts/brick3-pei-dialogue.mjs";
import { injectBrick3V7Lu } from "../scripts/brick3-v7-lu.mjs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";
import { injectBrick3Affinity } from "../scripts/brick3-affinity.mjs";
import { compileStory } from "../src/story-engine/compiler.ts";

const load = p => JSON.parse(readFileSync(p, "utf8"));
const base = () => load("stories/ambiguity-b/story.json");
describe("Pei complete dialogue reconstruction", () => {
  it("updates the canonical Pei chat across main, daily, autonomy and rumor branches", () => {
    const s = base();
    const chat = s.chats.find(c => c.title === "裴知聿");
    const old = new Map(chat.messages.map(m => [m.id, m.body]));
    injectBrick3PeiDialogue(s);
    expect(Object.keys(peiDialogue).length).toBeGreaterThanOrEqual(50);
    for (const [id, body] of Object.entries(peiDialogue)) {
      expect(chat.messages.find(m => m.id === id)?.body).toBe(body);
      expect(old.get(id)).not.toBe(body);
    }
    expect(chat.messages.filter(m => m.senderId === "owner").every(m => m.body === old.get(m.id))).toBe(true);
    expect(peiDialogue["pei-r27-a-in"]).toMatch(/重新開始/);
    expect(peiDialogue["pei-r29-a-in"]).toMatch(/吃醋/);
    expect(peiDialogue["pei-r24-a-in"]).toMatch(/不該突然出現/);
    expect(peiDialogue["drama5-pei2-in-1"]).toMatch(/共同報告|沒有要跟她發展/);
  });
  it("preserves original event IDs, player choices and work compilation", () => {
    const s = base();
    const originalEvents = JSON.stringify(s.events);
    const originalPlayer = JSON.stringify(s.chats.find(c => c.title === "裴知聿").messages.filter(m => m.senderId === "owner"));
    injectBrick3V7Lu(s);
    injectBrick3PeiDialogue(s);
    injectBrick3PhotoEvents(s, load("docs/brick3-photo-events-v1.json"));
    injectBrick3Affinity(s);
    expect(JSON.stringify(s.chats.find(c => c.title === "裴知聿").messages.filter(m => m.senderId === "owner"))).toBe(originalPlayer);
    expect(JSON.stringify(s.events.slice(0,base().events.length).map(e=>e.id)))
      .toBe(JSON.stringify(base().events.map(e=>e.id)));
    expect(originalEvents).toContain("reply-pei-1");
    expect(() => compileStory(s)).not.toThrow();
  });
  it("does not touch any other character or story", () => {
    const s = base();
    const others = JSON.stringify(s.chats.filter(c => c.title !== "裴知聿"));
    injectBrick3PeiDialogue(s);
    expect(JSON.stringify(s.chats.filter(c => c.title !== "裴知聿"))).toBe(others);
    const blank = { id: "unrelated", chats: [] };
    expect(injectBrick3PeiDialogue(blank)).toBe(blank);
  });
});
