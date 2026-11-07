import { describe, expect, it } from "vitest";
import { initialRuntime, type Work } from "./schema";
import { chooseFlirt, tickFlirt } from "./brick3Flirt";
const work = { id: "between-the-lines-b-demo", mode: "story", phone: { date: "2026-11-06", time: "20:00" }, data: { kakao: [] } } as unknown as Work;
const setup = (score: number) => {
  const s = initialRuntime(work); s.variables.shen_attraction = score; s.elapsedMs = 2 * 86400000;
  tickFlirt(work, s); return s;
};
describe("Brick3 affection-gated flirting", () => {
  it("starts flirting at 40 but not 39", () => {
    expect(setup(39).brick3Flirt?.leads["沈硯舟"]?.seq).toBe(0);
    const s = setup(40);
    expect(s.choices.some(x => x.target === "brick3-flirt:沈硯舟:flirt_yes")).toBe(true);
    expect((s.messages.kakao ?? []).some(x => x.kind === "image" && x.title === "沈硯舟")).toBe(false);
  });
  it("only sends a real image after photo consent at 50", () => {
    const s = setup(50);
    expect((s.messages.kakao ?? []).some(x => x.kind === "image" && x.title === "沈硯舟")).toBe(false);
    const next = chooseFlirt(work, s, "brick3-flirt:沈硯舟:photo_yes")!;
    expect((next.messages.kakao ?? []).some(x => x.media.endsWith("shen_yanzhou_gym_mirror_selfie_03.webp"))).toBe(true);
    expect(next.choices.filter(x => x.target.startsWith("brick3-flirt:沈硯舟:"))).toHaveLength(4);
  });
  it("two photo compliments at 60 unlock an evening date without an automatic overnight", () => {
    let s = setup(60);
    s = chooseFlirt(work, s, "brick3-flirt:沈硯舟:photo_yes")!;
    s = chooseFlirt(work, s, "brick3-flirt:沈硯舟:praise")!;
    expect(s.brick3Flirt?.leads["沈硯舟"]?.compliments).toBe(1);
    s.date = "2026-11-07"; s.elapsedMs = (s.elapsedMs ?? 0) + 86400000; tickFlirt(work, s);
    s = chooseFlirt(work, s, "brick3-flirt:沈硯舟:flirt_neutral")!;
    s.date = "2026-11-08"; s.elapsedMs = (s.elapsedMs ?? 0) + 86400000; tickFlirt(work, s);
    s = chooseFlirt(work, s, "brick3-flirt:沈硯舟:photo_yes")!;
    s = chooseFlirt(work, s, "brick3-flirt:沈硯舟:praise")!;
    expect(s.choices.some(x => x.target === "brick3-flirt:沈硯舟:date_yes")).toBe(true);
    expect(s.brick3Overnight?.records ?? []).toHaveLength(0);
  });
  it("photo refusal blocks further photo progression", () => {
    const s = chooseFlirt(work, setup(60), "brick3-flirt:沈硯舟:photo_no")!;
    s.date = "2026-11-07"; s.elapsedMs = (s.elapsedMs ?? 0) + 86400000; tickFlirt(work, s);
    expect(s.brick3Flirt?.leads["沈硯舟"]?.muted).toBe(true);
    expect(s.choices.some(x => x.target.includes("photo_yes"))).toBe(false);
  });
  it("player can ask to stay at 60 without pretending arrival", () => {
    const s = setup(60);
    const next = chooseFlirt(work, s, "brick3-flirt:沈硯舟:overnight_ask")!;
    expect(next.brick3Overnight?.records[0].phase).toBe("invited");
  });
});
