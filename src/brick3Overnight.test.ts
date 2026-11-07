import { describe, expect, it } from "vitest";
import { initialRuntime, type Work } from "./schema";
import { ensureV8 } from "./brick3Relationships";
import { chooseOvernight, tickOvernight } from "./brick3Overnight";
const work = { id: "between-the-lines-b-demo", mode: "story", phone: { date: "2026-11-06", time: "22:00" }, data: { kakao: [] } } as unknown as Work;
function setup() {
  const s = initialRuntime(work);
  s.elapsedMs = 1_000_000;
  ensureV8(s).bonds["陸沉川"].status = "dating";
  s.brick3Invites = { lu_photo_exhibit: { phase: "completed", completed: true, completedAtMs: 0, attempts: 1, retryAtMs: 0, nextThreshold: 60 } };
  tickOvernight(work, s);
  return s;
}
describe("Brick3 overnight continuation", () => {
  it("does not infer arrival from accepting an invitation", () => {
    const s = setup();
    const a = chooseOvernight(work, s, "brick3-overnight:lu_photo_exhibit:accept")!;
    expect(a.brick3Overnight?.records[0].phase).toBe("accepted");
    a.elapsedMs = (a.elapsedMs ?? 0) + 24 * 3600000; a.date = "2026-11-07";
    tickOvernight(work, a);
    expect(a.brick3Overnight?.records[0].phase).toBe("accepted");
  });
  it("refusal never creates a morning", () => {
    const s = chooseOvernight(work, setup(), "brick3-overnight:lu_photo_exhibit:decline")!;
    s.elapsedMs = (s.elapsedMs ?? 0) + 30 * 3600000; s.date = "2026-11-08";
    tickOvernight(work, s);
    expect(s.brick3Overnight?.records[0].phase).toBe("declined");
  });
  it("next day morning has matching four choices and departure prevents stay-at-home follow-up", () => {
    let s = chooseOvernight(work, setup(), "brick3-overnight:lu_photo_exhibit:accept")!;
    s = chooseOvernight(work, s, "brick3-overnight:lu_photo_exhibit:arrive")!;
    s.elapsedMs = (s.elapsedMs ?? 0) + 8 * 3600000; s.date = "2026-11-07"; s.time = "08:00";
    tickOvernight(work, s);
    expect(s.brick3Overnight?.records[0].phase).toBe("morning");
    expect(s.choices.filter(x => x.target.startsWith("brick3-overnight:lu_photo_exhibit:"))).toHaveLength(4);
    s = chooseOvernight(work, s, "brick3-overnight:lu_photo_exhibit:d")!;
    expect(s.brick3Overnight?.records[0].phase).toBe("departed");
    expect(s.choices.some(x => x.target.endsWith(":c"))).toBe(false);
    tickOvernight(work, s);
    expect((s.messages.kakao ?? []).filter(m => m.id.includes("morning-answer"))).toHaveLength(1);
  });
  it("old option is not actionable after it was consumed", () => {
    let s = chooseOvernight(work, setup(), "brick3-overnight:lu_photo_exhibit:accept")!;
    const old = chooseOvernight(work, s, "brick3-overnight:lu_photo_exhibit:decline")!;
    expect(old.brick3Overnight?.records[0].phase).toBe("accepted");
  });
});
