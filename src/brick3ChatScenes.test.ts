import { describe, expect, it } from "vitest";
import { advanceBrick3Chat } from "./brick3ChatScenes";
import { initialRuntime } from "./schema";
import { createWork } from "./demo";

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
    expect(next?.reply).toContain("選擇逃避");
    expect(state.variables["brick3:scene:裴知聿"]).toBe("conversation_open");
  });

});
