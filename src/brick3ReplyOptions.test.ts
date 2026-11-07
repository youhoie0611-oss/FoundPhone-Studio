import { describe, expect, it } from "vitest";
import { brick3ContextReplies } from "./brick3ReplyOptions";
import { localNpcReply } from "./localNpc";

const npc = (body: string) => ({ body, outgoing: false });
const player = (body: string) => ({ body, outgoing: true });

describe("Brick3 screenshot conversation regressions", () => {
  it("answers Pei's dinner confirmation with dinner choices, never old reunion buttons", () => {
    const history = [
      npc("我想見妳。我可以煮飯。妳以前最喜歡的那道，我一直記得。妳能來嗎？"),
      player("好，我想過去吃晚餐。"),
      npc("真的嗎？妳願意來？"),
      npc("我現在去買菜。"),
      npc("等等，我再問一次。妳真的會來對吧？"),
    ];
    const options = brick3ContextReplies("裴知聿", history);
    expect(options).toHaveLength(4);
    expect(options.some(option => /幾點|煮什麼|改天/.test(option))).toBe(true);
    expect(options.join(" ")).not.toMatch(/復合|分手/);
    expect(localNpcReply({
      thread: "裴知聿", playerId: "test", message: options[0],
      history: history.map(line => ({ ...line, sender: line.outgoing ? "我" : "裴知聿" })),
    }).reply).toMatch(/時間|下班|安排/);
  });

  it("requires Qi to answer criticism instead of a generic question", () => {
    const message = "你有沒有認真想過自己的態度？";
    const response = localNpcReply({
      thread: "祁野", playerId: "test", message,
      history: [{ ...npc("問啊，拐什麼彎。"), sender: "祁野" }],
    }).reply;
    expect(response).toMatch(/有|剛才|說話|太衝/);
    expect(response).not.toMatch(/這問題挺有意思|拐什麼彎/);
    const options = brick3ContextReplies("祁野", [
      player(message), npc("這問題挺有意思。")
    ]);
    expect(options).toHaveLength(4);
    expect(options.join(" ")).not.toContain(message);
  });

  it("gives Gu concrete introduction responses and preserves contact-source uncertainty", () => {
    const prompt = "嗨，妳好！我是顧時安，26歲，在做建築設計。";
    const options = brick3ContextReplies("顧時安", [npc(prompt)]);
    expect(options).toHaveLength(4);
    expect(options).toContain("你怎麼會有我的聯絡方式？");
    const answer = localNpcReply({
      thread: "顧時安", playerId: "test", message: "你怎麼會有我的聯絡方式？",
      history: [{ ...npc(prompt), sender: "顧時安" }],
    }).reply;
    expect(answer).toMatch(/聯絡|來源|資料/);
    expect(answer).not.toMatch(/朋友給|同事給/);
  });

  it("does not offer another button before the NPC answers the player", () => {
    expect(brick3ContextReplies("祁野", [npc("欸。"), player("你最近還好嗎？")])).toEqual([]);
  });


  it("does not change the shared fallback for unrelated FoundPhone stories", () => {
    const request = {
      thread: "祁野", playerId: "test", message: "你有沒有認真想過自己的態度？",
      history: [{ ...npc("問啊，拐什麼彎。"), sender: "祁野" }],
    };
    const brick3 = localNpcReply({ ...request, storyId: "between-the-lines-b-demo" }).reply;
    const unrelated = localNpcReply({ ...request, storyId: "unrelated-story" }).reply;
    expect(brick3).toMatch(/說話|太衝|剛才/);
    expect(unrelated).not.toBe(brick3);
  });

  it("all main characters and friends can receive four distinct contextual choices", () => {
    for (const name of ["沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川",
      "林安", "周予晴", "陳以衡", "許棠", "下班後五人組"]) {
      const options = brick3ContextReplies(name, [npc("今天忙了一整天，剛剛才回家。")]);
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
    }
  });
});
