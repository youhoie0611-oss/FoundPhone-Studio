import { describe, expect, it } from "vitest";
import { initialRuntime, makeItem, type Runtime, type Work } from "./schema";
import { ensureV8, type V8Lead } from "./brick3Relationships";
import { chooseV8Intimacy, discloseV8Kiss, ensureV8Intimacy, tickV8Intimacy } from "./brick3V8Intimacy";
const work = {
  id: "between-the-lines-b-demo", mode: "story", phone: { date: "2026-11-06", time: "22:00" },
  data: { kakao: [] }, variables: {},
} as unknown as Work;
function state(lead: V8Lead = "裴知聿"): Runtime {
  const s = initialRuntime(work);
  s.elapsedMs = 1_000_000;
  s.variables.pei_attraction = 75;
  s.brick3Invites = { pei_dinner_outing: {
    phase: "completed", completed: true, completedAtMs: 0,
    attempts: 1, retryAtMs: 0, nextThreshold: 60,
  }};
  ensureV8(s).bonds[lead].status = "dating";
  return s;
}
describe("V8 intimacy requires player consent", () => {
  it("offers only after a confirmed outing and never logs an automatic kiss", () => {
    const s = state();
    tickV8Intimacy(work, s);
    expect(ensureV8Intimacy(s).offers).toHaveLength(1);
    expect(ensureV8Intimacy(s).events).toEqual([]);
    expect(s.choices.map(c => c.target)).toContain("brick3-intimacy:pei_dinner_outing:accept");
  });
  it("explicit refusal prevents any intimate event and is remembered", () => {
    const s = state();
    tickV8Intimacy(work, s);
    const next = chooseV8Intimacy(work, s, "brick3-intimacy:pei_dinner_outing:decline")!;
    expect(next.brick3V8Intimacy?.events).toEqual([]);
    expect(next.brick3V8Intimacy?.offers[0].status).toBe("declined");
    tickV8Intimacy(work, next);
    expect(next.brick3V8Intimacy?.offers).toHaveLength(1);
  });
  it("records a kiss only after acceptance and leaves other relationships untouched", () => {
    const s = state();
    ensureV8(s).bonds["沈硯舟"].status = "dating";
    tickV8Intimacy(work, s);
    const next = chooseV8Intimacy(work, s, "brick3-intimacy:pei_dinner_outing:accept")!;
    expect(next.brick3V8Intimacy?.events).toHaveLength(1);
    expect(next.brick3V8?.bonds["沈硯舟"].status).toBe("dating");
    expect(next.brick3V8?.bonds["裴知聿"].status).toBe("dating");
    expect(next.brick3V8?.bonds["沈硯舟"].knows["裴知聿"]).toBeUndefined();
  });
  it("manual kiss disclosure preserves evidence and respects separate partner knowledge", () => {
    const s = state();
    ensureV8(s).bonds["沈硯舟"].status = "dating";
    ensureV8(s).bonds["沈硯舟"].exclusivity = "exclusive";
    tickV8Intimacy(work, s);
    const accepted = chooseV8Intimacy(work, s, "brick3-intimacy:pei_dinner_outing:accept")!;
    const id = accepted.brick3V8Intimacy!.events[0].id;
    expect(discloseV8Kiss(accepted, id, "裴知聿")).toBeNull();
    const shared = discloseV8Kiss(accepted, id, "沈硯舟")!;
    expect(shared.brick3V8Intimacy?.events[0].disclosedTo).toEqual(["沈硯舟"]);
    expect(shared.brick3V8?.bonds["沈硯舟"].knows["裴知聿"]?.source).toBe("player-confession");
    expect(shared.brick3V8?.bonds["沈硯舟"].exclusivity).toBe("unresolved");
    expect((shared.messages.kakao ?? []).some(m => m.outgoing && m.body.includes("接吻"))).toBe(true);
    expect(discloseV8Kiss(shared, id, "沈硯舟")).toBeNull();
  });
  it("requires an actual public post for delayed suspicion without leaking a kiss", () => {
    const s = state();
    ensureV8(s).bonds["沈硯舟"].status = "dating";
    tickV8Intimacy(work, s);
    const accepted = chooseV8Intimacy(work, s, "brick3-intimacy:pei_dinner_outing:accept")!;
    accepted.elapsedMs = 5 * 86400000;
    tickV8Intimacy(work, accepted);
    expect(accepted.brick3V8Intimacy?.suspicions).toEqual([]);
    accepted.brick3DateSocial = { pei_dinner_outing: {
      posted: true, postAtMs: 0, format: "story", inquiries: {},
    } };
    accepted.messages.instagram = [makeItem({
      id: "brick3-social-pei_dinner_outing-instagram",
      sender: "裴知聿", title: "裴知聿", kind: "post",
      body: "今天有個人陪我吃飯。",
    })];
    tickV8Intimacy(work, accepted);
    expect(accepted.brick3V8Intimacy?.suspicions?.some(x =>
      x.observer === "沈硯舟" && x.publicSource.includes("instagram"))).toBe(true);
    expect(accepted.brick3V8?.bonds["沈硯舟"].knows["裴知聿"]).toBeUndefined();
    expect((accepted.messages.kakao ?? []).find(m => m.id.includes("kiss-suspicion"))?.body)
      .not.toContain("接吻");
  });
  it("respects no-contact before proposing intimacy", () => {
    const s = state();
    s.messages.kakao = [makeItem({ title: "裴知聿", sender: "我", body: "不要再聯絡我", outgoing: true })];
    tickV8Intimacy(work, s);
    expect(s.brick3V8Intimacy?.offers).toEqual([]);
  });
});
