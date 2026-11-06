import { describe, expect, it } from "vitest";
import { initialRuntime, makeItem, type Work } from "./schema";
import { ensureV8 } from "./brick3Relationships";
import { chooseV8Conflict, tickV8Conflict } from "./brick3V8Conflict";
const w = { id: "between-the-lines-b-demo", mode: "story",
  phone: { date: "2026-11-06", time: "22:00" }, variables: {},
  data: { kakao: [] } } as unknown as Work;
function pair() {
  const s = initialRuntime(w);
  const v = ensureV8(s);
  v.bonds["裴知聿"].status = "secret";
  v.bonds["沈硯舟"].status = "dating";
  v.bonds["裴知聿"].knows["沈硯舟"] = {
    status: "dating", source: "player-disclosure", at: 0,
  };
  s.messages.kakao = [
    makeItem({ id: "p", title: "裴知聿", sender: "裴知聿", body: "寶貝，妳還在嗎" }),
    makeItem({ id: "s", title: "沈硯舟", sender: "沈硯舟", body: "寶貝，我剛剛看到妳的照片" }),
  ];
  s.messages.instagram = [makeItem({ id: "public-shen", title: "沈硯舟", sender: "沈硯舟", body: "寶貝，今天拍得很好" })];
  return s;
}
describe("V8 shura requires source evidence", () => {
  it("does not invent knowledge or public encounters", () => {
    const s = pair();
    tickV8Conflict(w, s);
    expect(s.brick3V8Conflict?.encounters).toEqual([]);
    s.brick3DateSocial = { outing: { posted: true } } as typeof s.brick3DateSocial;
    tickV8Conflict(w, s);
    expect(s.brick3V8Conflict?.encounters).toHaveLength(1);
    expect(s.choices.filter(x => x.target.startsWith("brick3-clash:"))).toHaveLength(4);
  });
  it("allows an honest response without automatically ending an existing romance", () => {
    const s = pair();
    s.brick3DateSocial = { outing: { posted: true } } as typeof s.brick3DateSocial;
    tickV8Conflict(w, s);
    const id = s.choices.find(x => x.target.endsWith(":honest"))!.target;
    const next = chooseV8Conflict(w, s, id)!;
    expect(next.brick3V8?.bonds["沈硯舟"].status).toBe("dating");
    expect(next.brick3V8?.bonds["裴知聿"].status).toBe("secret");
    expect(next.messages.kakao?.some(m => m.outgoing && m.body.includes("關係"))).toBe(true);
    expect(next.brick3V8Conflict?.encounters[0].status).toBe("honest");
  });
});
