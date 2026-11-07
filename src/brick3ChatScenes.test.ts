import { describe, expect, it } from "vitest";
import { advanceBrick3Chat } from "./brick3ChatScenes";
import { initialRuntime } from "./schema";
import { createWork } from "./demo";
import { tickBrick3SceneEvents } from "./brick3SceneScheduler";

describe("brick3 scene progression", () => {
  it("honors Shen's photo boundary and persists the outcome", () => {
    const state = initialRuntime(createWork());
    const result = advanceBrick3Chat(state, "沈硯舟", "我不太想讓照片被傳來傳去。", [
      { body: "我有照片拍到妳，介意我傳給妳確認嗎？", outgoing: false },
    ]);
    expect(result?.reply).toContain("不會把照片傳給任何人");
    expect(state.variables["brick3:scene:沈硯舟"]).toBe("privacy_boundary");
  });
  it("does not interpret a refusal as consent", () => {
    const state = initialRuntime(createWork());
    const result = advanceBrick3Chat(state, "沈硯舟", "不要傳給我", [
      { body: "我可以傳照片給妳嗎？", outgoing: false },
    ]);
    expect(result?.reply).not.toContain("等我整理好再問");
    expect(state.variables["brick3:scene:沈硯舟"]).toBe("privacy_boundary");
  });
  it("keeps the ex-boyfriend's reunion intent separate from consent", () => {
    const state = initialRuntime(createWork());
    const result = advanceBrick3Chat(state, "裴知聿", "你想復合嗎？", [
      { body: "我們分手以後一直沒有好好談。", outgoing: false },
    ]);
    expect(result?.reply).toContain("希望還有重新開始的可能");
    expect(state.variables["brick3:scene:裴知聿"]).toBe("intent_revealed");
  });
  it("moves from photo privacy boundary into a different conversation", () => {
    const state = initialRuntime(createWork());
    const history = [{ body: "我有一張活動照片拍到妳。", outgoing: false }];
    advanceBrick3Chat(state, "沈硯舟", "我不想照片被傳來傳去", history);
    const next = advanceBrick3Chat(state, "沈硯舟", "我們聊別的吧", history);
    expect(next?.reply).toContain("相機背帶");
    expect(state.variables["brick3:scene:沈硯舟"]).toBe("conversation_redirected");
  });
  it("advances the ex-boyfriend's confession only after the player agrees to listen", () => {
    const state = initialRuntime(createWork());
    const history = [{ body: "我們分手後很久沒聯絡。", outgoing: false }];
    advanceBrick3Chat(state, "裴知聿", "你想復合嗎？", history);
    const next = advanceBrick3Chat(state, "裴知聿", "我願意聽你說", history);
    expect(next?.reply).toContain("是妳提出分手");
    expect(next?.reply).not.toContain("選擇逃避");
    expect(state.variables["brick3:scene:裴知聿"]).toBe("conversation_open");
  });


  it("does not treat accepting a dinner invitation as agreeing to reconcile", () => {
    const state = initialRuntime(createWork());
    const reply = advanceBrick3Chat(state, "裴知聿", "可以，明天一起吃晚餐。", [
      { body: "我們分手後一直沒好好聊。", outgoing: false },
      { body: "妳想吃晚餐嗎？", outgoing: false },
    ]);
    expect(reply).toBeNull();
    expect(state.variables["brick3:scene:裴知聿"]).toBeUndefined();
  });

  it("does not interpret declining a Gu exhibition as banning all future contact", () => {
    const state = initialRuntime(createWork());
    const reply = advanceBrick3Chat(state, "顧時安", "這次展覽我不想去。", [
      { body: "我是顧時安，在做建築設計，想找妳聊聊展覽。", outgoing: false },
    ]);
    expect(reply).toBeNull();
    expect(state.variables["brick3:scene:顧時安"]).toBeUndefined();
  });

  it("does not treat accepting a meal as consent for a photo", () => {
    const state = initialRuntime(createWork());
    const reply = advanceBrick3Chat(state, "沈硯舟", "可以一起去吃飯。", [
      { body: "我有張照片拍到妳，介意嗎？", outgoing: false },
    ]);
    expect(reply).toBeNull();
    expect(state.variables["brick3:scene:沈硯舟"]).toBeUndefined();
  });

  it("sends a scheduled next-day follow-up only once", () => {
    const work = { ...createWork(), id: "between-the-lines-b-demo" };
    const state = initialRuntime(work);
    advanceBrick3Chat(state, "裴知聿", "你想復合嗎？", [
      { body: "我們分手以後一直沒談。", outgoing: false },
    ]);
    expect(state.brick3SceneEvents?.length).toBe(1);
    state.elapsedMs = 86400000;
    tickBrick3SceneEvents(work, state);
    expect(state.messages.kakao?.some(m => m.body.includes("不是一句話"))).toBe(true);
    const count = state.messages.kakao?.length;
    tickBrick3SceneEvents(work, state);
    expect(state.messages.kakao?.length).toBe(count);
  });

});
