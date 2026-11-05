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
    const incoming = chat.messages.filter(m => m.senderId !== "owner");
    expect(incoming).toHaveLength(108);
    expect(Object.keys(peiDialogue)).toHaveLength(incoming.length);
    expect(incoming.every(m => Object.hasOwn(peiDialogue, m.id))).toBe(true);
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
  it("remains idempotent and preserves every scripted Pei branch", () => {
    const s = base();
    const original = s.events.map(e => ({ id: e.id, next: e.next, actions: e.actions?.filter(a => a.type !== "notification") }));
    injectBrick3PeiDialogue(s);
    const first = JSON.stringify(s.chats.find(c => c.title === "裴知聿"));
    injectBrick3PeiDialogue(s);
    expect(JSON.stringify(s.chats.find(c => c.title === "裴知聿"))).toBe(first);
    expect(s.events.map(e => ({ id: e.id, next: e.next, actions: e.actions?.filter(a => a.type !== "notification") }))).toEqual(original);
    const pei = s.chats.find(c => c.title === "裴知聿");
    const byId = new Map(pei.messages.map(m => [m.id, m.body]));
    for (const event of s.events) {
      const incoming = (event.actions ?? []).filter(a => a.type === "unlock" && byId.has(a.key) && pei.messages.find(m => m.id === a.key)?.senderId !== "owner");
      if (!incoming.length) continue;
      const preview = (event.actions ?? []).find(a => a.type === "notification" && a.value?.startsWith("裴知聿："));
      if (preview) expect(preview.value).toBe("裴知聿：" + byId.get(incoming.at(-1).key).replace(/\n/g, " "));
    }
    const bodies = Object.values(peiDialogue);
    expect(bodies.every(body => typeof body === "string" && body.trim().length > 0)).toBe(true);
    expect(bodies.some(body => /我還喜歡妳/.test(body))).toBe(true);
    expect(bodies.some(body => /不再提復合|不再提這個|那就不見/.test(body))).toBe(true);
  });
  it("keeps Pei's repeat dinner invitation and followups in the same heavy-attachment voice", () => {
    const activity = load("docs/brick3-repeat-invitations-v1.json").activities
      .find(a => a.id === "pei_dinner_outing");
    expect(activity.invite).toMatch(/想見妳/);
    expect(activity.responses[1]).toMatch(/不想見我|想妳/);
    expect(activity.arrival.split("\n").length).toBeGreaterThan(2);
    expect(activity.followUps).toHaveLength(3);
    expect(JSON.stringify(activity)).not.toMatch(/狐狸|狡黠|毒舌|鬥嘴/);
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
