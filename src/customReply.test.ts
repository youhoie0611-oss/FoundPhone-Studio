import { describe, expect, it } from "vitest";
import { submitCustomReply } from "./engine";
import { initialRuntime, type Work } from "./schema";
const testWork = { id: "test", updatedAt: 1, phone: { date: "2026-11-03", time: "10:00" } } as Work;

describe("custom player reply", () => {
  it("preserves the exact input and does not silently select a scripted branch", () => {
    const state = initialRuntime(testWork);
    state.choices = [{ label: "答應", target: "accept" }];
    const next = submitCustomReply(state, "我不想復合。  請不要再問。");
    expect(next.ui?.player?.customReplies).toEqual(["我不想復合。  請不要再問。"]);
    expect(next.choices).toEqual(state.choices);
    expect(next.messages.kakao?.at(-1)?.body).toBe("我不想復合。  請不要再問。");
    expect(next.messages.kakao?.at(-1)?.outgoing).toBe(true);
  });

  it("ignores blank input and leaves runtime unchanged", () => {
    const state = initialRuntime(testWork);
    state.choices = [{ label: "拒絕", target: "decline" }];
    expect(submitCustomReply(state, "   ")).toBe(state);
  });
});
