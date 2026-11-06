import { describe, expect, it } from "vitest";
import { initialRuntime, makeItem, type Work } from "./schema";
import { chooseV8Life, tickV8Life, askV8Psychology } from "./brick3V8Life";
import { ensureV8 } from "./brick3Relationships";
const work = { id: "between-the-lines-b-demo", mode: "story",
  phone: { date: "2026-11-06", time: "22:00" }, variables: {},
  data: { kakao: ["沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川"].map(name => makeItem({
    title: name, sender: name, body: "你好",
  })) },
} as unknown as Work;
function fresh() { const s = initialRuntime(work); s.time = "22:20"; return s; }
describe("V8 opt-in life scenes", () => {
  it("requires actual interaction and offers instead of fabricating a meeting", () => {
    const s = fresh();
    tickV8Life(work, s);
    expect(Object.keys(s.brick3V8Life?.nightOffers ?? {})).toEqual([]);
    s.messages.kakao = [makeItem({ title: "沈硯舟", sender: "我", outgoing: true, body: "今天忙嗎" })];
    tickV8Life(work, s);
    expect(s.brick3V8Life?.nightOffers.NIGHT_01).toBe("offered");
    expect(ensureV8(s).nights).toEqual([]);
    const accepted = chooseV8Life(work, s, "brick3-night:NIGHT_01:accept")!;
    expect(accepted.brick3V8Life?.nightOffers.NIGHT_01).toBe("completed");
    expect(accepted.brick3V8?.nights).toContain("NIGHT_01");
  });
  it("never unlocks four CORE stages from one message", () => {
    const s = fresh();
    s.messages.kakao = [makeItem({
      id: "single", title: "沈硯舟", sender: "沈硯舟",
      body: "攝影作品合作署名，課業和未來我真的想坦白自己的擔心",
    })];
    tickV8Life(work, s);
    expect(ensureV8(s).bonds["沈硯舟"].core).toBe(1);
    tickV8Life(work, s);
    expect(ensureV8(s).bonds["沈硯舟"].core).toBe(1);
  });
  it("psychology asks do not expose hidden affection values", () => {
    const s = fresh();
    expect(askV8Psychology(s, "裴知聿", "你最近怎麼樣")).toBe(true);
    const b = ensureV8(s).bonds["裴知聿"];
    expect(b.psychologicalObservation).toContain("前任關係");
    expect(b.psychologicalObservation).not.toMatch(/\d{2,3}|好感度/);
  });
});
