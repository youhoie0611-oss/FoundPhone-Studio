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
    const history = [{ sender: "林安", outgoing: false, body: "對了，我們週五那攤聚會時間改成七點半。" }];
    const reply = localNpcReply({ ...request("林安", "活動是幾點開始？"), history }).reply;
    expect(reply).toMatch(/七點半/);
    expect(reply).not.toMatch(/想想|哪件事/);
  });
  it("explains how Shen recognized the player instead of evading", () => {
    const history = [{ sender: "沈硯舟", outgoing: false, body: "欸，妳是上次活動現場的那位吧？" }];
    const reply = localNpcReply({ ...request("沈硯舟", "你怎麼認出我的？"), history }).reply;
    expect(reply).toMatch(/現場|照片/);
    expect(reply).toMatch(/認出|同一個人/);
  });
  it("treats a question containing event keywords as a question", () => {
    expect(classifyMessage("活動是幾點開始？")).toBe("question");
  });
  it.each([
    ["周予晴", "週末一起逛市集嗎？", "這次我不去", /先不約/],
    ["陳以衡", "我先確認餐廳訂位", "餐廳在哪裡？", /餐廳|地址/],
    ["許棠", "等我排班確定再約", "哪天有空？", /班表|休假/],
    ["下班後五人組", "週末要聚餐嗎？", "我不能去", /人數/],
    ["顧時安", "提案被退回來了", "發生什麼事？", /提案|修改/],
  ])("uses %s's established scene to answer a meaningful player choice", (thread, body, message, expected) => {
    const reply = localNpcReply({
      ...request(thread, message),
      history: [{ outgoing: false, body }],
    }).reply;
    expect(reply).toMatch(expected);
  });
});
