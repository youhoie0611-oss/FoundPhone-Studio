import { describe, expect, it } from "vitest";
import { initialRuntime, makeItem, type Work } from "./schema";
import { chooseV8, ensureV8, offerV8Confession } from "./brick3Relationships";
const work = {
  id: "between-the-lines-b-demo", mode: "story",
  phone: { date: "2026-11-06", time: "20:00" }, variables: {},
  data: { kakao: ["沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川"].map(title =>
    makeItem({ title, sender: title, body: "你好" })) }, nodes: [],
} as unknown as Work;
function fresh() { return initialRuntime(work); }
describe("V8 disclosure and negotiated relationship agreements", () => {
  it("a full disclosure tells only its recipient, not everyone", () => {
    const s = fresh();
    ensureV8(s).bonds["沈硯舟"].status = "dating";
    offerV8Confession(work, s, "裴知聿");
    const discussion = chooseV8(work, s, "brick3-v8:裴知聿:poly")!;
    const shared = chooseV8(work, discussion, "brick3-v8:裴知聿:full")!;
    expect(shared.brick3V8?.bonds["裴知聿"].knows["沈硯舟"]?.source).toBe("player-confession");
    expect(shared.brick3V8?.bonds["沈硯舟"].knows["裴知聿"]).toBeUndefined();
    expect(shared.messages.kakao?.some(m => m.outgoing && m.title === "裴知聿" &&
      m.body.includes("沈硯舟"))).toBe(true);
    expect(shared.brick3V8?.bonds["裴知聿"].status).toBe("single");
  });
  it("a deeply developed Pei can discuss polyamory conditionally, not auto-accept", () => {
    const s = fresh();
    s.variables.pei_trust = 82;
    const b = ensureV8(s).bonds["裴知聿"];
    b.core = 3;
    b.history.push({ at: 0, status: "ambiguous", reason: "shared-history" });
    offerV8Confession(work, s, "裴知聿");
    const discussion = chooseV8(work, s, "brick3-v8:裴知聿:poly")!;
    const proposed = chooseV8(work, discussion, "brick3-v8:裴知聿:full")!;
    expect(proposed.brick3V8?.negotiations["裴知聿"]?.status).toBe("conditional");
    expect(proposed.brick3V8?.bonds["裴知聿"].status).toBe("single");
  });
  it("disagreeing with boundaries never silently changes an existing partner", () => {
    const s = fresh();
    const b = ensureV8(s).bonds["沈硯舟"];
    b.status = "dating";
    b.exclusivity = "exclusive";
    offerV8Confession(work, s, "顧時安");
    const discussion = chooseV8(work, s, "brick3-v8:顧時安:poly")!;
    const proposed = chooseV8(work, discussion, "brick3-v8:顧時安:full")!;
    const rejected = chooseV8(work, proposed, "brick3-v8:顧時安:reject-boundaries")!;
    expect(rejected.brick3V8?.bonds["沈硯舟"].status).toBe("dating");
    expect(rejected.brick3V8?.bonds["沈硯舟"].exclusivity).toBe("exclusive");
    expect(rejected.brick3V8?.bonds["顧時安"].status).toBe("single");
  });
});
