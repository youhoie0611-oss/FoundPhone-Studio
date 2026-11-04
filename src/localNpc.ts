import { enforceCanon } from "./characterCanon";
import type { AiChatRequest, AiChatResponse } from "./aiChat";

type Intent = "stop" | "refuse" | "gift" | "question" | "greeting" | "meeting" | "work" | "thanks" | "affection" | "other";
const people: Record<string, { name: string; responses: Record<Intent, string[]> }> = {
  "沈硯舟": { name: "沈硯舟", responses: {
    stop: ["好，我不再傳了。", "知道了，我會尊重妳的意思。"],
    refuse: ["好，那就不勉強。", "明白，我不會再提這件事。"],
    gift: ["巧克力？妳怎麼突然想到送我這個？", "欸，真的要給我？我先說，我會收下。"],
    question: ["妳問的這個，我得想一下。", "怎麼突然問這個？"],
    greeting: ["欸，妳還沒睡？", "嗨，今天過得怎麼樣？"],
    meeting: ["我得先看一下課表，晚點跟妳說行不行。", "這週有報告要交，時間可能得再約。"],
    work: ["今天工作很忙嗎？", "那妳先忙，等有空再聊。"],
    thanks: ["不客氣，真的只是順手。", "不用這麼客氣。"],
    affection: ["妳這樣說，我一時不知道怎麼接。", "妳是認真的嗎？"],
    other: ["嗯？妳繼續說。", "等等，我想確認一下妳的意思。"],
  }},
  "裴知聿": { name: "裴知聿", responses: {
    stop: ["好。我不再打擾妳。", "我聽到了，不會再追問。"],
    refuse: ["我知道了。", "好，這件事到此為止。"],
    gift: ["妳要送我東西？我有點意外。", "是送給我的？"],
    question: ["妳想知道哪一部分？", "這件事我可以回答，但我不想敷衍妳。"],
    greeting: ["妳好。", "沒想到妳會主動傳訊息。"],
    meeting: ["我可以配合，但如果妳不想見，也沒關係。", "妳定時間吧，我先確認行程。"],
    work: ["那妳先處理工作。", "妳最近似乎很忙。"],
    thanks: ["不用謝。", "這本來就是我該做的。"],
    affection: ["我不想誤會妳的意思。", "妳知道這句話對我意味著什麼嗎？"],
    other: ["我在看。妳說。", "妳想談的是哪件事？"],
  }},
  "祁野": { name: "祁野", responses: {
    stop: ["行，不煩妳。", "知道了，收手。"],
    refuse: ["不想就算了。", "行，妳說了算。"],
    gift: ["送我的？妳眼光怎麼樣，我得驗貨。", "喲，突然送禮？"],
    question: ["問啊，拐什麼彎。", "這問題挺有意思。"],
    greeting: ["喲，想起我了？", "在，說吧。"],
    meeting: ["時間地點發來，我看看能不能到。", "這兩天有事，改天行不行？"],
    work: ["又加班？那妳忙完再說。", "行，先工作。"],
    thanks: ["口頭謝謝就完了？開玩笑的。", "得了，別這麼客氣。"],
    affection: ["妳這話有點犯規啊。", "再說一遍？我剛才沒看錯吧。"],
    other: ["然後呢？", "妳這話有後半句吧？"],
  }},
  "周予晴": { name: "周予晴", responses: {
    stop: ["好，先不打擾妳。"], refuse: ["那我們改天再約，妳先忙。"],
    gift: ["真的嗎？謝謝妳想到我。"], question: ["妳想問哪件事？我看一下。"],
    greeting: ["嗨，妳今天過得怎麼樣？"], meeting: ["好呀，週末一起去逛！妳下班後再跟我說時間就好。"],
    work: ["工作辛苦了，先忙完再說。"], thanks: ["不客氣啦。"],
    affection: ["突然這樣說，我有點意外。"], other: ["今天改稿改到眼睛快花了，妳呢？"],
  }},
  "陳以衡": { name: "陳以衡", responses: {
    stop: ["好，先不打擾妳。"], refuse: ["沒關係，我先不算妳的人數。"],
    gift: ["真的嗎？謝謝妳想到我。"], question: ["妳想問哪件事？我看一下。"],
    greeting: ["嗨，妳今天過得怎麼樣？"], meeting: ["好，我先確認訂位，晚點把餐廳資訊傳妳。"],
    work: ["工作辛苦了，先忙完再說。"], thanks: ["不客氣啦。"],
    affection: ["突然這樣說，我有點意外。"], other: ["最近在忙新菜單企劃，還算順利。"],
  }},
  "許棠": { name: "許棠", responses: {
    stop: ["好，先不打擾妳。"], refuse: ["好，妳不用勉強。"],
    gift: ["真的嗎？謝謝妳想到我。"], question: ["妳想問哪件事？我看一下。"],
    greeting: ["嗨，妳今天過得怎麼樣？"], meeting: ["好啊，等我排班確定再跟妳說。"],
    work: ["工作辛苦了，先忙完再說。"], thanks: ["不客氣啦。"],
    affection: ["突然這樣說，我有點意外。"], other: ["我剛下班，打算先補眠，晚點再聊。"],
  }},
  "下班後五人組": { name: "下班後五人組", responses: {
    stop: ["好，先不打擾妳。"], refuse: ["沒關係，下次再一起約。"],
    gift: ["真的嗎？謝謝妳想到我。"], question: ["妳想問哪件事？我看一下。"],
    greeting: ["嗨，妳今天過得怎麼樣？"], meeting: ["好，那我先幫妳留位置。時間有變再說一聲。"],
    work: ["工作辛苦了，先忙完再說。"], thanks: ["不客氣啦。"],
    affection: ["突然這樣說，我有點意外。"], other: ["大家今天各自忙什麼？我先去訂位。"],
  }},
  "林安": { name: "林安", responses: {
    stop: ["好，我先不吵妳。", "收到，晚點聊。"],
    refuse: ["好啊，沒事。", "那就算啦。"],
    gift: ["哇，送禮物？給誰的？", "巧克力！哪家買的？"],
    question: ["妳說，我聽著。", "這題我得想想。"],
    greeting: ["嗨！", "怎麼啦？"],
    meeting: ["我看一下時間，等等回妳。", "可以先說想約哪天嗎？"],
    work: ["辛苦啦，先把工作處理完。", "又忙起來了？"],
    thanks: ["我們之間還客氣什麼。", "小事啦。"],
    affection: ["哇，怎麼突然這麼說？", "妳今天怎麼了？"],
    other: ["真的假的？繼續說。", "等等，讓我理一下。"],
  }},
};
export function classifyMessage(raw: string): Intent {
  const s = raw.trim().toLowerCase();
  if (/別再|不要再|停止|住手|別聯絡|不想聊|stop|leave me alone/.test(s)) return "stop";
  if (/不想|不要|拒絕|不行|算了|沒興趣|不用了|no thanks/.test(s)) return "refuse";
  if (/送你|送妳|給你|給妳|禮物|巧克力|gift|chocolate/.test(s)) return "gift";
  if (/見面|約會|吃飯|出來|週末|明天見|約個|meet/.test(s)) return "meeting";
  if (/工作|加班|上班|忙|開會|報告|work/.test(s)) return "work";
  if (/謝謝|感謝|thanks|thank you/.test(s)) return "thanks";
  if (/喜歡你|喜歡妳|想你|想妳|愛你|愛妳|miss you|love you/.test(s)) return "affection";
  if (/你好|嗨|哈囉|早安|晚安|hello|^hi$/.test(s)) return "greeting";
  if (/[?？]|為什麼|怎麼|什麼|是否|可不可以|嗎$/.test(s)) return "question";
  return "other";
}
function stableHash(value: string): number {
  let h = 2166136261;
  for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}
export function localNpcReply(request: AiChatRequest): AiChatResponse {
  const person = people[request.thread];
  if (!person) throw new Error("此角色尚未支援免費對話");
  // Answer a direct follow-up from the current conversational context before using generic templates.
  const recent = request.history.filter(x => !x.outgoing).at(-1)?.body ?? "";
  const input = request.message.trim();
  if (request.thread === "裴知聿" && /^(幹嘛|找我幹嘛|什麼事|有事嗎|找我什麼事)[？?！!。\\s]*$/.test(input)) {
    const aboutPast = /照片|收據|以前|分手|整理|想起/.test(recent);
    return {
      reply: aboutPast
        ? "我整理舊東西時看到我們以前的照片，才想聯絡妳。不是要妳立刻回頭，也不是想拿回憶逼妳做決定。"
        : "想問妳最近過得好不好，也想找個機會把以前沒說清楚的事講明白。如果妳不想聊，我會尊重。",
      delayMs: 1600,
    };
  }
  if (request.thread === "裴知聿" && /哪件事|什麼照片|哪張照片|什麼收據/.test(input)) {
    return { reply: "是我們以前常去那家店的收據，夾在舊相冊裡。我不是故意翻出來讓妳難受。", delayMs: 1800 };
  }
  if (request.thread === "周予晴" && /^(好呀|好啊|好|可以|有興趣|想去)[！!。\\s]*$/.test(input)) {
    return { reply: "那就約週末！我先看看市集的時間，晚點把資訊傳妳。", delayMs: 1500 };
  }
  if (request.thread === "林安") {
    if (/在哪(?:裡|裏|儿)|哪(?:裡|裏|儿)遇到|在哪看到/.test(input) && /裴知聿|前男友|公司附近|咖啡店|停車場/.test(request.history.map(x => x.body).slice(-12).join(" "))) {
      return { reply: "就在妳公司附近的咖啡店門口。我剛好路過看到他，沒跟他說話。", delayMs: 1700 };
    }
    if (/加班|不能去|沒辦法去|不一定能去|先不答應/.test(input) && /聚餐|週五|七點半|吃飯|約/.test(request.history.map(x => x.body).slice(-12).join(" "))) {
      return { reply: "收到，那我先不把妳算進確定人數。妳忙完再跟我說就好，別趕。", delayMs: 1400 };
    }
  }
  const intent = classifyMessage(request.message);
  const choices = person.responses[intent];
  const previousNpc = request.history.filter(x => !x.outgoing).at(-1)?.body;
  const candidates = choices.filter(x => x !== previousNpc);
  const pool = candidates.length ? candidates : choices;
  const index = stableHash(request.playerId + request.thread + request.message + request.history.length) % pool.length;
  return { reply: enforceCanon(request.thread, pool[index]), delayMs: intent === "stop" ? 800 : 1300 + stableHash(request.message) % 1900 };
}
