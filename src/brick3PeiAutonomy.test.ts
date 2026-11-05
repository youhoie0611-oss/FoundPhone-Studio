import { describe, expect, it } from "vitest";
import { initialRuntime, makeItem, type Work } from "./schema";
import { tickPeiAutonomy, stopPeiAutonomyOnPlayerReply } from "./brick3PeiAutonomy";

const work = { id: "between-the-lines-b-demo", mode: "story" } as Work;
function setup() {
  const s = initialRuntime({ ...work, phone: { date: "2026-11-03", time: "10:00" }, variables: {} } as Work);
  s.messages.kakao = [makeItem({ id: "pei-hello", title: "裴知聿", sender: "裴知聿", body: "妳在嗎" })];
  tickPeiAutonomy(work, s);
  return s;
}
const autonomous = (s: ReturnType<typeof setup>) =>
  (s.messages.kakao ?? []).filter(m => m.id.startsWith("brick3-pei-autonomy-"));

describe("Pei autonomous emotional pacing", () => {
  it("does not backfill old saves or flood an unopened conversation", () => {
    const s = setup();
    expect(autonomous(s)).toHaveLength(0);
    tickPeiAutonomy(work, s);
    expect(autonomous(s)).toHaveLength(0);
    s.messages.kakao.push(makeItem({ id: "pei-new", title: "裴知聿", sender: "裴知聿", body: "我想妳" }));
    tickPeiAutonomy(work, s);
    s.elapsedMs = 479999;
    tickPeiAutonomy(work, s);
    expect(autonomous(s)).toHaveLength(0);
    s.elapsedMs = 480000;
    tickPeiAutonomy(work, s);
    expect(autonomous(s).map(m => m.body)).toEqual(["妳在忙嗎"]);
    s.elapsedMs += 5500;
    tickPeiAutonomy(work, s);
    expect(autonomous(s)).toHaveLength(2);
  });
  it("escalates rejection over time, but stops on a reply", () => {
    const s = setup();
    s.messages.kakao.push(makeItem({ id: "player-reject", title: "裴知聿", sender: "我", body: "我不想復合", outgoing: true }));
    tickPeiAutonomy(work, s);
    s.elapsedMs = 30000;
    tickPeiAutonomy(work, s);
    expect(autonomous(s)[0].body).toBe("為什麼");
    s.messages.kakao.push(makeItem({ id: "player-response", title: "裴知聿", sender: "我", body: "我先去忙了", outgoing: true }));
    stopPeiAutonomyOnPlayerReply(s, "裴知聿");
    s.elapsedMs = 86400000;
    tickPeiAutonomy(work, s);
    expect(autonomous(s)).toHaveLength(1);
  });
  it("honors explicit no-contact even when jealousy rises", () => {
    const s = setup();
    s.messages.kakao.push(makeItem({ id: "stop", title: "裴知聿", sender: "我", body: "不要再傳訊息給我", outgoing: true }));
    stopPeiAutonomyOnPlayerReply(s, "裴知聿");
    s.messages.instagram = [makeItem({ id: "brick3-social-qi-instagram", title: "祁野", sender: "祁野" })];
    s.variables.pei_jealousy = 90;
    s.elapsedMs = 86400000;
    tickPeiAutonomy(work, s);
    expect(autonomous(s)).toHaveLength(0);
    expect(s.peiAutonomy?.phase).toBe("stopped");
  });
  it("reacts to another lead's IG event with delayed jealousy and no affection leak", () => {
    const s = setup();
    s.variables.pei_jealousy = 70;
    s.messages.instagram = [makeItem({ id: "brick3-social-shen-instagram", title: "沈硯舟", sender: "沈硯舟" })];
    tickPeiAutonomy(work, s);
    s.elapsedMs = 30000;
    tickPeiAutonomy(work, s);
    expect(autonomous(s)[0].body).toBe("我看到照片了");
    expect(autonomous(s)[0].body).not.toMatch(/70|好感度|嫉妒值/);
  });
});
