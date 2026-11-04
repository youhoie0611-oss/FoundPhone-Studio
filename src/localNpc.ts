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
  "顧時安": { name: "顧時安", responses: {
    stop: ["好，妳先忙！"], refuse: ["沒問題，完全不用勉強。"],
    gift: ["欸，謝謝妳想到我！"], question: ["妳想知道哪部分？"],
    greeting: ["嗨！今天過得還好嗎？"], meeting: ["走啊！不過先確認彼此的時間。"],
    work: ["辛苦啦！我也在趕設計圖。"], thanks: ["能幫上忙就好！"],
    affection: ["欸，妳這樣說我真的會開心。"], other: ["哈哈，我剛好在整理模型，妳今天有什麼新鮮事嗎？"],
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
  if (request.thread === "周予晴" && /^(好呀|好啊|好|可以|有興趣|想去)[！!。\s]*$/.test(input)) {
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
  if (request.thread === "顧時安" && /城市展覽|建築設計|這類活動/.test(recent)) {
    if (/沒興趣|不想|不用|不方便|不要/.test(input))
      return { reply: "收到！那我就不繼續推展覽啦。突然打擾妳不好意思！", delayMs: 1300 };
    if (/怎麼有|怎麼知道|怎麼找到|認識/.test(input))
      return { reply: "妳問得對，我應該先把聯絡的緣由說清楚。抱歉我剛剛太突然了。", delayMs: 1500 };
    if (/有興趣|想聽|介紹|什麼展/.test(input))
      return { reply: "是城市空間和建築相關的展覽！我平常做設計，看到這種活動就想分享。妳喜歡看建築嗎？", delayMs: 1500 };
    if (/忙|晚點|改天/.test(input))
      return { reply: "沒問題，妳先忙！我也還有張圖要改，有空再聊。", delayMs: 1400 };
  }
  // Resolve character-specific opening scenes before generic intent classification.
  if (request.thread === "沈硯舟" && /介意我傳|入鏡|上次活動/.test(recent)) {
    if (/可以|傳給我|傳來|看看/.test(input))
      return { reply: "好，我先挑那張妳入鏡的照片給妳看。放心，我不會擅自公開。", delayMs: 1300 };
    if (/不太想|不要|不用|不方便/.test(input))
      return { reply: "好，那我不傳，也不會把有妳的照片公開。抱歉，應該先確認妳的意思。", delayMs: 1200 };
    if (/哪一張|哪張|拍到/.test(input))
      return { reply: "是活動現場那張合照的邊角，妳剛好在協助處理流程。我還沒把照片傳給別人。", delayMs: 1400 };
    if (/怎麼知道|怎麼認出|認得/.test(input))
      return { reply: "那天我拿相機在現場跑來跑去，看到妳幫忙處理流程。整理照片時才又想起來。", delayMs: 1400 };
    if (/認錯|不是我/.test(input))
      return { reply: "啊，那可能是我認錯了。抱歉突然打擾妳，我先不傳照片。", delayMs: 1200 };
  }
  if (request.thread === "裴知聿" && /分手|照片|聯絡|還好嗎/.test(recent)) {
    if (/說好|先不要聯絡|不想聊|保持距離/.test(input))
      return { reply: "我記得。是我先打破約定，對不起。我不會再逼妳回應。", delayMs: 1500 };
    if (/想說什麼|找我|什麼事/.test(input))
      return { reply: "我整理東西時翻到我們以前的照片，想問妳過得好不好。也知道我不該突然打擾妳。", delayMs: 1500 };
    if (/最近還好|你呢/.test(input))
      return { reply: "我還好，工作照常忙。謝謝妳願意回我，妳不用為了我勉強多說。", delayMs: 1600 };
  }
  if (request.thread === "祁野" && /停車場|擋路|生氣/.test(recent)) {
    if (/擋到|應該先道歉/.test(input))
      return { reply: "行，這件事是我不對。那天車擋到妳，我跟妳道歉。", delayMs: 1100 };
    if (/怎麼知道|怎麼認出/.test(input))
      return { reply: "後來在同一場活動又看到妳，我才把人對上。不是故意查妳。", delayMs: 1200 };
    if (/算了|別再提/.test(input))
      return { reply: "行，不提了。下次我會注意，不會再擋妳的路。", delayMs: 1000 };
  }
  if (/下班|工作/.test(recent) && /剛下班|還沒|今天.*累|晚點再聊/.test(input)) {
    return { reply: /晚點再聊/.test(input) ? "好，妳先忙，等妳有空再說。" : /還沒/.test(input) ? "那妳先把工作忙完，別急著回訊息。" : "辛苦了，先吃點東西休息一下。", delayMs: 1400 };
  }
  // Resolve the player's actual question before any generic intent templates.
  // Never invent a location, promise, or completed event from a vague prompt.
  const recentContext = request.history.filter(x => !x.outgoing).slice(-4).map(x => x.body).join(" ");
  if (request.thread === "祁野") {
    if (/沒發現|沒看到|沒注意|根本沒發現/.test(input))
      return { reply: "我知道。妳當時根本沒看見我，我還以為妳故意裝沒看到。", delayMs: 1400 };
    if (/停車場|擋到|擋路|那天/.test(input))
      return { reply: "上次停車場那件事，我記得。妳想問哪一段？", delayMs: 1500 };
  }
  if (request.thread === "沈硯舟") {
    if (/週五|星期五|禮拜五/.test(input) && /活動|現場|球場|相機/.test(recentContext))
      return { reply: "妳是問週五的活動嗎？我還沒確認會不會去，確認後再跟妳說。", delayMs: 1500 };
    if (/照片|傳給我|給我看|拍到/.test(input))
      return { reply: "有拍到幾張，不過我還沒整理完。整理好再傳給妳看。", delayMs: 1600 };
  }
  if (request.thread === "裴知聿") {
    if (/^(幹嘛|幹嘛[？?]|找我幹嘛|什麼事|有事嗎)[！!。\\s]*$/.test(input))
      return { reply: "想問妳最近過得好不好。知道這樣突然聯絡很冒昧，妳不想聊我就不打擾。", delayMs: 1600 };
    if (/不是說好|說好.*不.*聯絡|不要聯絡|為什麼.*聯絡/.test(input))
      return { reply: "是，我記得我們說好先不要聯絡。這次是我越界了，對不起。妳不想繼續，我就停在這裡。", delayMs: 1700 };
  }
  if (/[？?]|怎麼|為什麼|哪裡|哪裏|哪天|什麼時候|是不是/.test(input)) {
    if (/哪裡|哪裏|在哪|什麼地方/.test(input))
      return { reply: request.thread === "祁野" ? "妳問的是哪次？我不想隨便說個地點敷衍妳。" : "妳說的是哪一次？我先確認，免得答錯。", delayMs: 1400 };
    if (/為什麼|怎麼會|怎麼突然/.test(input))
      return { reply: "妳問得對。我想先把事情說清楚，不想用一句話帶過。妳是指剛剛那件事嗎？", delayMs: 1500 };
  }
  const intent = classifyMessage(request.message);
  const choices = person.responses[intent];
  const previousNpc = request.history.filter(x => !x.outgoing).at(-1)?.body;
  const candidates = choices.filter(x => x !== previousNpc);
  const pool = candidates.length ? candidates : choices;
  const index = stableHash(request.playerId + request.thread + request.message + request.history.length) % pool.length;
  return { reply: enforceCanon(request.thread, pool[index]), delayMs: intent === "stop" ? 800 : 1300 + stableHash(request.message) % 1900 };
}
