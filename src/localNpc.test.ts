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
  it("answers Lin An's event time from established dialogue", () => {
    const history = [{ outgoing: false, body: "對了，我們週五那攤聚會時間改成七點半。" }];
    const reply = localNpcReply({ ...request("林安", "活動是幾點開始？"), history }).reply;
    expect(reply).toMatch(/七點半/);
    expect(reply).not.toMatch(/想想|哪件事/);
  });
  it("explains how Shen recognized the player instead of evading", () => {
    const history = [{ outgoing: false, body: "欸，妳是上次活動現場的那位吧？" }];
    const reply = localNpcReply({ ...request("沈硯舟", "你怎麼認出我的？"), history }).reply;
    expect(reply).toMatch(/現場|照片/);
    expect(reply).toMatch(/認出|同一個人/);
  });
  it("treats a question containing event keywords as a question", () => {
    expect(classifyMessage("活動是幾點開始？")).toBe("question");
  });
});
