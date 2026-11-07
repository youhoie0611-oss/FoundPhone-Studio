import { describe, expect, it } from "vitest";
import { initialRuntime, type Work } from "./schema";
import { respondToBrick3InvitationText } from "./brick3RepeatInvites";

const work = {
  id: "between-the-lines-b-demo", mode: "story",
  phone: { date: "2026-11-07", time: "21:00" }, data: {},
} as unknown as Work;

function invited() {
  const s = initialRuntime(work);
  s.brick3Invites = {
    pei_dinner_outing: {
      phase: "invited", attempts: 1, nextThreshold: 70, retryAtMs: 0,
    },
  };
  return s;
}

describe("Brick3 natural-language invitation decisions", () => {
  it("accepts Pei's invitation even in a full conversational sentence", () => {
    const s = invited();
    expect(respondToBrick3InvitationText(s, "裴知聿", "好，我想過去吃晚餐。")).toBe(true);
    expect(s.brick3Invites?.pei_dinner_outing.responseMode).toBe("accept");
    expect(s.brick3Invites?.pei_dinner_outing.phase).toBe("reply_pending");
  });
  it("handles yes plus a time question as agreement with scheduling, not indecision", () => {
    const s = invited();
    expect(respondToBrick3InvitationText(s, "裴知聿", "我會過去，幾點比較方便？")).toBe(true);
    expect(s.brick3Invites?.pei_dinner_outing.responseMode).toBe("accept");
    expect(s.brick3Invites?.pei_dinner_outing.responseText).toMatch(/時間|下班/);
  });
  it("respects refusal even if it begins with 好", () => {
    const s = invited();
    expect(respondToBrick3InvitationText(s, "裴知聿", "好，但我今晚沒空，改天吧。")).toBe(true);
    expect(s.brick3Invites?.pei_dinner_outing.responseMode).toBe("decline");
  });
  it("answers the food question without pretending the player already accepted", () => {
    const s = invited();
    expect(respondToBrick3InvitationText(s, "裴知聿", "你打算煮什麼？")).toBe(true);
    expect(s.brick3Invites?.pei_dinner_outing.responseMode).toBe("details");
    expect(s.brick3Invites?.pei_dinner_outing.responseText).toMatch(/煮什麼|想吃/);
  });
  it("does not silently treat an unrelated reply as an invitation decision", () => {
    const s = invited();
    expect(respondToBrick3InvitationText(s, "裴知聿", "你今天在忙什麼？")).toBe(false);
    expect(s.brick3Invites?.pei_dinner_outing.phase).toBe("invited");
  });
});
