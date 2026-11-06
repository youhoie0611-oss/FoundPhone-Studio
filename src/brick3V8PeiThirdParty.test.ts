import { describe, expect, it } from "vitest";
import { makeItem, initialRuntime, type Runtime, type Work } from "./schema";
import { ensureV8, tickV8 } from "./brick3Relationships";
import { tickV8PeiThirdParty, observeV8PeiThirdPartyReply } from "./brick3V8PeiThirdParty";

const work = {
  id: "between-the-lines-b-demo", mode: "story",
  phone: { date: "2026-11-06", time: "20:00" },
  variables: {},
  data: { kakao: ["沈硯舟", "裴知聿"].map(title => makeItem({
    title, sender: title, body: "嗨",
  })) }, nodes: [],
} as unknown as Work;
const DAY = 86400000;
function fresh() {
  const s = initialRuntime(work);
  s.variables.pei_attraction = 55;
  ensureV8(s).bonds["沈硯舟"].status = "dating";
  s.messages.kakao = [
    makeItem({ id: "pei-hello", title: "裴知聿", sender: "裴知聿", body: "妳在嗎" }),
    ...["最近過得好嗎？", "有事可以找我。", "謝謝你前幾天的關心。"].map((body, i) =>
      makeItem({ id: `pei-player-${i}`, title: "裴知聿", sender: "我",
        outgoing: true, body })),
  ];
  return s;
}
function incoming(s: Runtime) {
  return (s.messages.kakao ?? []).filter(m => m.meta.source === "brick3-v8-pei-third-party");
}
describe("Pei slow-burn third-party arc", () => {
  it("does not read a hidden boyfriend from relationship variables", () => {
    const s = fresh();
    tickV8PeiThirdParty(work, s);
    s.elapsedMs = 5 * DAY;
    tickV8PeiThirdParty(work, s);
    expect(incoming(s)).toHaveLength(0);
    expect(ensureV8(s).confessions["裴知聿"]).toBeUndefined();
  });
  it("stages two messages and does not treat silence as permission for a proposal", () => {
    const s = fresh();
    tickV8PeiThirdParty(work, s);
    observeV8PeiThirdPartyReply(s, "沈硯舟是我的男友");
    expect(ensureV8(s).bonds["裴知聿"].knows["沈硯舟"].source).toBe("player-message");
    tickV8PeiThirdParty(work, s);
    s.elapsedMs = DAY;
    tickV8PeiThirdParty(work, s);
    expect(incoming(s)).toHaveLength(1);
    s.elapsedMs = 3 * DAY;
    tickV8PeiThirdParty(work, s);
    expect(incoming(s)).toHaveLength(2);
    s.elapsedMs = 10 * DAY;
    tickV8PeiThirdParty(work, s);
    expect(incoming(s)).toHaveLength(2);
    expect(ensureV8(s).confessions["裴知聿"]).toBeUndefined();
  });
  it("may ask for a secret relationship only after the player reengages", () => {
    const s = fresh();
    tickV8PeiThirdParty(work, s);
    observeV8PeiThirdPartyReply(s, "我跟沈硯舟在一起");
    tickV8PeiThirdParty(work, s);
    s.elapsedMs = DAY;
    tickV8PeiThirdParty(work, s);
    s.elapsedMs = 3 * DAY;
    tickV8PeiThirdParty(work, s);
    s.messages.kakao!.push(makeItem({
      id: "reengage", title: "裴知聿", sender: "我", outgoing: true, body: "我願意跟你談談",
    }));
    s.elapsedMs = 4 * DAY;
    tickV8PeiThirdParty(work, s);
    expect(ensureV8(s).confessions["裴知聿"]?.kind).toBe("secret-offer");
    expect(ensureV8(s).bonds["裴知聿"].status).toBe("single");
  });
  it("explicit no-contact permanently ends this autonomous pursuit", () => {
    const s = fresh();
    tickV8PeiThirdParty(work, s);
    observeV8PeiThirdPartyReply(s, "沈硯舟是我男朋友");
    observeV8PeiThirdPartyReply(s, "不要再聯絡我");
    s.elapsedMs = 20 * DAY;
    tickV8PeiThirdParty(work, s);
    expect(s.brick3V8PeiThirdParty?.phase).toBe("stopped");
    expect(incoming(s)).toEqual([]);
  });
  it("does not let high attraction alone trigger an unsolicited Pei proposal", () => {
    const s = fresh();
    s.variables.pei_attraction = 90;
    tickV8(work, s);
    expect(ensureV8(s).confessions["裴知聿"]).toBeUndefined();
  });
});
