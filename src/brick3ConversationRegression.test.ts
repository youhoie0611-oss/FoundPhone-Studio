import { describe, expect, it } from "vitest";
import { brick3ContextReplies } from "./brick3ReplyOptions";
import { brick3ContextAnswer } from "./brick3DialogueReplies";
import { localNpcReply } from "./localNpc";
import { advanceBrick3Chat } from "./brick3ChatScenes";
import { initialRuntime } from "./schema";
import { createWork } from "./demo";

type Line = { body: string; outgoing: boolean };
const npc = (body: string): Line => ({ body, outgoing: false });
const player = (body: string): Line => ({ body, outgoing: true });
const answer = (thread: string, message: string, history: Line[]) =>
  localNpcReply({ storyId: "between-the-lines-b-demo", thread, message, playerId: "test", history:
    history.map(m => ({ ...m, sender: m.outgoing ? "我" : thread })) });

describe("Brick3 live dialogue regressions", () => {
  it("the dinner question beats Pei's older breakup thread", () => {
    const chat = [
      npc("我希望我們還有復合的可能。"),
      player("我們以後再談。"),
      npc("我想見妳，可以煮晚餐給妳吃。妳會來嗎？"),
      player("好，我想過去吃晚餐。"),
      npc("妳真的會來對吧？"),
    ];
    const options = brick3ContextReplies("裴知聿", chat);
    expect(options.some(x => /幾點|煮什麼/.test(x))).toBe(true);
    expect(options.some(x => /復合|分手/.test(x))).toBe(false);
    const reply = answer("裴知聿", "我會過去，但我們先確認幾點見。", chat);
    expect(reply.reply).toMatch(/時間|方便|確認/);
  });

  it("Qi actually addresses an attitude question instead of giving a generic reaction", () => {
    const chat = [npc("問啊，拐什麼彎。"), player("你有沒有認真想過自己的態度？"), npc("這問題挺有意思。")];
    const reply = answer("祁野", "你有沒有認真想過自己的態度？", chat);
    expect(reply.reply).toMatch(/剛剛|態度|我有想|說話/);
    expect(reply.reply).not.toMatch(/這問題挺有意思|問啊，拐什麼彎/);
    const options = brick3ContextReplies("祁野", chat);
    expect(options).not.toContain("你有沒有認真想過自己的態度？");
    expect(options.some(x => /剛才|道歉|不舒服/.test(x))).toBe(true);
  });

  it("does not recycle previously asked questions after another NPC response", () => {
    const chat = [npc("你想問什麼？"), player("你有沒有認真想過自己的態度？"),
      npc("問啊，拐什麼彎。"), player("我想聽你正面回答剛才的問題。"),
      npc("這問題挺有意思。")];
    const options = brick3ContextReplies("祁野", chat);
    expect(options).not.toContain("你有沒有認真想過自己的態度？");
    expect(options).not.toContain("我想聽你正面回答剛才的問題。");
    expect(new Set(options)).toHaveProperty("size", options.length);
  });

  it("Gu's introduction generates introductory choices, not imagined event consent", () => {
    const chat = [npc("嗨，妳好！我是顧時安，26歲，在做建築設計。")];
    const options = brick3ContextReplies("顧時安", chat);
    expect(options).toContain("你怎麼會有我的聯絡方式？");
    expect(options.some(x => /復合|煮飯|同意參加/.test(x))).toBe(false);
    const reply = answer("顧時安", "你怎麼會有我的聯絡方式？", chat);
    expect(reply.reply).toMatch(/聯絡|資料|來源/);
  });

  it("a player message or an explicit no-contact closure never shows an old choice", () => {
    expect(brick3ContextReplies("裴知聿", [npc("妳能來嗎？"), player("好，我會過去。")])).toEqual([]);
    expect(brick3ContextReplies("顧時安", [
      npc("你好，我是顧時安。"), player("不要再聯絡我。"),
      npc("抱歉突然打擾。我不再聯絡了。"),
    ])).toEqual([]);
  });

  it("Pei dinner acceptance does not mutate his reunion story state", () => {
    const state = initialRuntime(createWork());
    const scene = advanceBrick3Chat(state, "裴知聿", "好，我想過去吃晚餐。", [
      npc("我想見妳，可以煮飯。妳以前最喜歡的那道，我還記得。妳能來嗎？"),
    ]);
    expect(scene).toBeNull();
    expect(state.variables["brick3:scene:裴知聿"]).toBeUndefined();
  });

  it("saying no to an exhibit is not a request to sever all contact", () => {
    const state = initialRuntime(createWork());
    const scene = advanceBrick3Chat(state, "顧時安", "謝謝邀請，但我對這類活動沒興趣。", [
      npc("我是顧時安，做建築設計。想分享一場展覽。"),
    ]);
    expect(scene?.reply ?? "").not.toMatch(/不會再主動聯絡/);
    expect(state.variables["brick3:scene:顧時安"]).not.toBe("no_contact");
  });

  it("direct context handler explicitly distinguishes a soft delay from dinner consent", () => {
    const r = brick3ContextAnswer({
      playerId: "test", thread: "裴知聿", storyId: "between-the-lines-b-demo",
      message: "我還沒完全決定，給我一點時間。",
      history: [{ sender: "裴知聿", body: "我可以煮晚餐給妳吃。", outgoing: false }],
    });
    expect(r?.reply).toMatch(/不勉強|沒決定|今晚|不急|改變主意/);
    expect(r?.reply).not.toMatch(/妳願意來/);
  });
});
