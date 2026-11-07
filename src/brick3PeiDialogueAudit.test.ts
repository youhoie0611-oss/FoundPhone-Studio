import { describe, expect, it } from "vitest";
import { brick3ContextReplies } from "./brick3ReplyOptions";
import { localNpcReply } from "./localNpc";
import { advanceBrick3Chat } from "./brick3ChatScenes";
import { createWork } from "./demo";
import { initialRuntime } from "./schema";

const npc = (body: string) => ({ body, outgoing: false });
const player = (body: string) => ({ body, outgoing: true });
const answer = (message: string, history: Array<{ body: string; outgoing: boolean }>) =>
  localNpcReply({
    storyId: "between-the-lines-b-demo",
    playerId: "pei-audit",
    thread: "裴知聿",
    message,
    history: history.map(m => ({
      ...m, sender: m.outgoing ? "我" : "裴知聿",
    })),
  }).reply;

describe("Brick3 Pei dialogue and four-player-choice audit", () => {
  it("responds to jealousy rather than treating the photo as a meal or reunion", () => {
    const history = [npc("我看到照片了。妳跟他出去了？")];
    const choices = brick3ContextReplies("裴知聿", history);
    expect(choices).toHaveLength(4);
    expect(choices).toContain("你是在吃醋嗎？");
    expect(choices.join(" ")).not.toMatch(/煮什麼|復合/);
    expect(answer(choices[0], history)).toMatch(/是|在意|分手/);
    expect(answer(choices[1], history)).toMatch(/照片|自己想|亂猜|解釋/);
    expect(answer(choices[2], history)).toMatch(/自由|資格|見面/);
  });

  it("keeps an offer of a secret relationship distinct from consent", () => {
    const history = [npc("就算只能偷偷交往，不能公開……我也想過。")];
    const choices = brick3ContextReplies("裴知聿", history);
    expect(choices).toHaveLength(4);
    expect(choices).toContain("我不會答應跟你秘密交往。");
    expect(answer(choices[0], history)).toMatch(/偷偷|嫉妒|義務/);
    expect(answer(choices[1], history)).toMatch(/不甘心/);
    expect(answer(choices[2], history)).toMatch(/拒絕|不再提/);
    expect(answer(choices[3], history)).toMatch(/不會|決定/);
  });

  it("answers the actual research question instead of pretending Pei has an office job", () => {
    const history = [npc("我明天要跟指導老師討論報告，有些資料還沒對好。")];
    const choices = brick3ContextReplies("裴知聿", history);
    expect(choices).toHaveLength(4);
    expect(choices[0]).toMatch(/研究進度/);
    expect(answer(choices[0], history)).toMatch(/文獻|資料|老師/);
    expect(answer(choices[1], history)).toMatch(/研究|資料|老師/);
    expect(answer(choices[2], history)).toMatch(/整理完|學校/);
  });

  it("responds to research partner rumours without inventing evidence", () => {
    const history = [npc("有人把我和江若寧在研究室討論的照片拿去亂傳。")];
    const choices = brick3ContextReplies("裴知聿", history);
    expect(choices).toHaveLength(4);
    expect(choices[0]).toMatch(/江若寧/);
    expect(answer(choices[0], history)).toMatch(/研究|合作/);
    expect(answer(choices[1], history)).toMatch(/研究|猜|傳/);
  });

  it("does not offer the same initial confession prompt after Pei already confessed", () => {
    const history = [npc("我還想跟妳重新開始，但妳沒有答應我。")];
    const choices = brick3ContextReplies("裴知聿", history);
    expect(choices).toHaveLength(4);
    expect(choices).toContain("你想復合的原因是什麼？");
    expect(choices).not.toContain("你聯絡我，是想重新開始嗎？");
    expect(answer(choices[0], history)).toMatch(/放不下|分手/);
  });

  it("closes the unanswered choice panel after an explicit refusal was acknowledged", () => {
    expect(brick3ContextReplies("裴知聿", [
      npc("我還想復合。"),
      player("我不想跟你復合。"),
      npc("好，我聽到了。不會再提復合。"),
    ])).toEqual([]);
    expect(brick3ContextReplies("裴知聿", [
      npc("我想見妳。"),
      player("不要再聯絡我。"),
      npc("好，我不會再聯絡妳。"),
    ])).toEqual([]);
  });

  it("does not assume the real breakup cause when the player agrees to listen", () => {
    const history = [npc("我們分手後一直沒好好談。")];
    const s = initialRuntime(createWork());
    advanceBrick3Chat(s, "裴知聿", "你想復合嗎？", history);
    const result = advanceBrick3Chat(s, "裴知聿", "我願意聽你說", history);
    expect(result?.reply).toMatch(/是妳提出分手|我記得/);
    expect(result?.reply).not.toMatch(/選擇逃避|讓妳一個人承受/);
    expect(s.variables["brick3:scene:裴知聿"]).toBe("conversation_open");
  });

  it("after a player message, older Pei choices stay hidden until his next reply", () => {
    expect(brick3ContextReplies("裴知聿", [
      npc("最近在改論文。"),
      player("你最近的研究進度還順利嗎？"),
    ])).toEqual([]);
  });
});
