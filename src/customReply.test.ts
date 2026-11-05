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
  it("records a player's invitation decision without silently choosing a scripted branch", () => {
    const state = initialRuntime(testWork);
    state.messages.kakao = [{ id: "invite", title: "林安", sender: "林安", body: "週五聚餐要不要來？", outgoing: false } as never];
    state.choices = [{ label: "答應", target: "accept" }];
    const next = submitCustomReply(state, "這次我不去", "kakao", "林安");
    expect((next.ui?.player?.storyDecisions as unknown as Array<{ status: string; thread: string }>)[0]).toMatchObject({
      thread: "林安", status: "declined",
    });
    expect(next.choices).toEqual(state.choices);
  });
  it("routes a free-text refusal to an active invitation instead of leaving it stuck", () => {
    const state = initialRuntime(testWork);
    state.brick3Invites = { pei_dinner_outing: {
      phase: "invited", attempts: 1, nextThreshold: 30, retryAtMs: 0,
    } };
    state.choices = [{ label: "答應", target: "brick3-photo-pei_dinner_outing-choice-1" }];
    const next = submitCustomReply(state, "我不去", "kakao", "裴知聿");
    expect(next.brick3Invites?.pei_dinner_outing?.phase).toBe("reply_pending");
    expect(next.brick3Invites?.pei_dinner_outing?.responseMode).toBe("decline");
    expect(next.choices).toEqual([]);
    expect(next.ui?.scriptedInvitationReply?.["裴知聿"]).toBe(next.messages.kakao?.at(-1)?.id);
  });
});
