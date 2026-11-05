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


describe("磚3 group conversation regression", () => {
  const group = (message: string, context = "林安：大家週五晚上有空嗎？要不要一起吃飯？") =>
    localNpcReply({ playerId: "player-a", thread: "下班後五人組", message,
      history: [{ sender: "林安", body: context, outgoing: false }] }).reply;

  it("answers a challenge to a sudden topic change instead of repeating generic filler", () => {
    expect(group("你怎麼突然提起這件事？")).toMatch(/林安：.*週五聚餐/);
  });
  it("does not invent a confirmed restaurant or time", () => {
    expect(group("餐廳在哪裡？幾點？")).toMatch(/還沒訂/);
  });
  it("does not treat an undecided invitation as a confirmed RSVP", () => {
    expect(group("好啊，時間地點呢？")).toMatch(/還沒訂/);
  });
  it("respects a refusal and does not reserve a place", () => {
    expect(group("我可能要加班，先別算我。")).toMatch(/先不算妳/);
  });
  it("identifies a human group speaker", () => {
    expect(group("還有誰會去？")).toMatch(/^林安：/);
  });
});
