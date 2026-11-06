import { describe, expect, it } from "vitest";
import { initialRuntime, makeItem, type Work } from "./schema";
import { choose } from "./engine";
import { ensureV8, offerV8Confession, chooseV8, tickV8, observeV8Reply, discoverV8Core, endV8Relationship } from "./brick3Relationships";

const work = {
  id: "between-the-lines-b-demo",
  mode: "story",
  phone: { date: "2026-11-06", time: "20:00" },
  variables: {},
  data: { kakao: ["沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川"].map((title, i) =>
    makeItem({ id: `lead-${i}`, title, sender: title, body: "你好" })) },
  nodes: [],
} as unknown as Work;
function fresh() { return initialRuntime(work); }

describe("V8 relationship persistence", () => {
  it("starts without inventing historical romances", () => {
    const s = fresh();
    const v = ensureV8(s);
    expect(v.bonds["裴知聿"].status).toBe("single");
    expect(v.bonds["沈硯舟"].history).toEqual([]);
    expect(JSON.parse(JSON.stringify(s)).brick3V8.version).toBe(8);
  });
  it("protects an existing partner from a second confession", () => {
    const s = fresh();
    ensureV8(s).bonds["沈硯舟"].status = "dating";
    expect(offerV8Confession(work, s, "裴知聿")).toBe(true);
    const chosen = choose(work, s, "brick3-v8:裴知聿:only");
    expect(chosen.brick3V8?.bonds["沈硯舟"].status).toBe("dating");
    expect(chosen.brick3V8?.bonds["裴知聿"].status).toBe("single");
    expect(chosen.brick3V8?.confessions["裴知聿"]?.status).toBe("discussing");
  });
  it("ends one romance explicitly without deleting another and resumes unresolved proposal", () => {
    const s = fresh();
    ensureV8(s).bonds["沈硯舟"].status = "dating";
    offerV8Confession(work, s, "裴知聿");
    const deferred = chooseV8(work, s, "brick3-v8:裴知聿:only")!;
    expect(deferred.brick3V8?.confessions["裴知聿"]?.status).toBe("discussing");
    expect(endV8Relationship(deferred, "沈硯舟")).toBe(true);
    expect(deferred.brick3V8?.bonds["沈硯舟"].status).toBe("separated");
    expect(deferred.brick3V8?.bonds["裴知聿"].status).toBe("single");
    expect(deferred.brick3V8?.confessions["裴知聿"]?.status).toBe("pending");
    expect(deferred.choices.some(c => c.target === "brick3-v8:裴知聿:only")).toBe(true);
  });
  it("allows Pei secret route only when player consents", () => {
    const s = fresh();
    ensureV8(s).bonds["沈硯舟"].status = "dating";
    offerV8Confession(work, s, "裴知聿", "secret-offer");
    expect(ensureV8(s).bonds["裴知聿"].status).toBe("single");
    const next = chooseV8(work, s, "brick3-v8:裴知聿:secret")!;
    expect(next.brick3V8?.bonds["裴知聿"].status).toBe("secret");
    expect(next.messages.kakao?.some(m => m.title === "裴知聿" && m.outgoing && m.body.includes("秘密"))).toBe(true);
    expect(next.brick3V8?.bonds["沈硯舟"].status).toBe("dating");
    expect(next.brick3V8?.events).toContain("secret-started:裴知聿");
  });
  it("does not turn a poly proposal into automatic consent", () => {
    const s = fresh();
    offerV8Confession(work, s, "裴知聿");
    const discuss = chooseV8(work, s, "brick3-v8:裴知聿:poly")!;
    const refused = chooseV8(work, discuss, "brick3-v8:裴知聿:full")!;
    expect(refused.brick3V8?.negotiations["裴知聿"]?.status).toBe("rejected");
    expect(refused.brick3V8?.bonds["裴知聿"].status).toBe("single");
  });
  it("keeps 14-day pending offer when choosing to think", () => {
    const s = fresh();
    offerV8Confession(work, s, "顧時安");
    const later = chooseV8(work, s, "brick3-v8:顧時安:later")!;
    expect(later.brick3V8?.confessions["顧時安"]?.status).toBe("pending");
    expect(later.messages.kakao?.some(m => m.title === "顧時安" && m.outgoing && m.body.includes("時間"))).toBe(true);
    expect(later.choices.some(x => x.target === "brick3-v8:顧時安:reject")).toBe(true);
    later.elapsedMs = 15 * 86400000;
    tickV8(work, later);
    expect(later.brick3V8?.confessions["顧時安"]?.status).toBe("withdrawn");
  });
  it("stops pending emotional messages on a no-contact reply", () => {
    const s = fresh();
    offerV8Confession(work, s, "裴知聿");
    s.messages.kakao ??= [];
    s.messages.kakao.push(makeItem({ title: "裴知聿", sender: "我", outgoing: true, body: "不要再聯絡我" }));
    observeV8Reply(s, "裴知聿", "不要再聯絡我");
    s.elapsedMs = 5000;
    tickV8(work, s);
    expect(s.brick3V8?.pending).toHaveLength(0);
    expect(s.brick3V8?.confessions["裴知聿"]?.status).toBe("withdrawn");
  });
  it("delivers separate KKT bubbles without opening the conversation", () => {
    const s = fresh();
    offerV8Confession(work, s, "沈硯舟");
    tickV8(work, s);
    expect(s.messages.kakao.filter(m => m.meta.source === "brick3-v8")).toHaveLength(1);
    s.elapsedMs = 4300;
    tickV8(work, s);
    expect(s.messages.kakao.filter(m => m.meta.source === "brick3-v8")).toHaveLength(2);
  });
  it("keeps core clues distinct per lead", () => {
    const s = fresh();
    expect(discoverV8Core(s, "祁野", "family_conflict")).toBe(1);
    expect(discoverV8Core(s, "祁野", "family_conflict")).toBe(1);
    expect(ensureV8(s).bonds["顧時安"].core).toBe(0);
  });
});
