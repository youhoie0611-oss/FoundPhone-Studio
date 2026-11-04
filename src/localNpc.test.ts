import { describe, expect, it } from "vitest";
import { classifyMessage, localNpcReply } from "./localNpc";

const request = (thread: string, message: string) => ({
  playerId: "player-a", thread, message, history: [],
});

describe("free NPC chat", () => {
  it("understands a chocolate gift without needing an API key", () => {
    expect(classifyMessage("送你巧克力")).toBe("gift");
    expect(localNpcReply(request("沈硯舟", "送你巧克力")).reply).toMatch(/巧克力|給我/);
  });
  it("prioritizes stop and refusal over affection", () => {
    expect(classifyMessage("我喜歡你，但不要再聯絡我")).toBe("stop");
    expect(localNpcReply(request("祁野", "不要再聯絡我")).reply).toMatch(/不煩|收手/);
  });
  it("has distinct character responses", () => {
    expect(localNpcReply(request("沈硯舟", "送你巧克力")).reply)
      .not.toBe(localNpcReply(request("祁野", "送你巧克力")).reply);
  });
  it("rejects unsupported characters rather than fabricating an identity", () => {
    expect(() => localNpcReply(request("陌生人", "你好"))).toThrow();
  });
});
