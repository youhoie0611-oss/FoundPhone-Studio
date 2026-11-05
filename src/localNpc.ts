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
    question: ["妳問的是剛才那件事嗎？我可以把細節說清楚。"],
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
  if (/[?？]|為什麼|怎麼|什麼|是否|可不可以|嗎$|幾點|几点|何時|何时/.test(s)) return "question";
  if (/見面|約會|吃飯|出來|週末|明天見|約個|meet/.test(s)) return "meeting";
  if (/工作|加班|上班|忙|開會|報告|work/.test(s)) return "work";
  if (/謝謝|感謝|thanks|thank you/.test(s)) return "thanks";
  if (/喜歡你|喜歡妳|想你|想妳|愛你|愛妳|miss you|love you/.test(s)) return "affection";
  if (/你好|嗨|哈囉|早安|晚安|hello|^hi$/.test(s)) return "greeting";
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
  const context = request.history.filter(x => !x.outgoing).slice(-8).map(x => x.body).join(" ");
  // Explicit opening-scene questions must resolve to facts and a next action.
  // Do not fall back to vague "let me think" messages for these story gates.
  if (request.thread === "沈硯舟" && /還記得我|記得我嗎|你還記得|認得我|認出我|怎麼認出|怎麼認得/.test(input)) {
    if (/還記得我|記得我嗎|你還記得/.test(input)) {
      return { reply: "記得。上次活動妳在現場幫忙處理流程，我拿相機經過時跟妳打過照面。後來整理照片又看到妳。其實我一直想問，那張有拍到妳的照片，妳想看看嗎？", delayMs: 1700 };
    }
    return { reply: "那天妳在活動現場幫忙處理流程，我拿相機經過時有跟妳打過照面。後來整理照片才又認出妳。說起來，我有張照片拍到妳，妳介意我傳給妳確認嗎？", delayMs: 1700 };
  }
  if (request.thread === "顧時安" && /聯絡方式|聯繫方式|電話|怎麼有我的|怎麼會有我的|怎麼知道我的|從哪.*找到|誰給你的|為什麼.*聯絡/.test(input)) {
    return { reply: "妳問得對，我應該先交代清楚，不該突然傳訊息。現在我沒辦法確認聯絡資料的來源，所以先不拿別的理由搪塞妳。我會去核對，確認前不再打擾妳；如果妳不願意我聯絡，我就到此為止。", delayMs: 1600 };
  }
  if (request.thread === "沈硯舟" && /對|是我|我還記得|記得那天/.test(input) && /活動|現場|照片|相機/.test(context)) {
    return { reply: "太好了，我還怕認錯人。那天妳一直忙著協調現場，我沒好意思打擾。對了，我整理出一張有妳入鏡的照片，妳想先看看，還是我不要傳？", delayMs: 1600 };
  }
  // Scene facts take precedence over generic question templates for every contact.

  const asksTime = /(?:幾點|几点|什麼時候|什么时候|何時|何时|時間|时间).*(?:開始|开始|聚|活動|活动|見面|见面)?|(?:活動|活动|聚餐|聚會|聚会).*(?:幾點|几点|時間|时间)/.test(input);
  if (asksTime && /七點半|7[:：]30|19[:：]30|七点半/.test(context) && /活動|聚餐|聚會|聚会|週五|周五|時間|时间/.test(context)) {
    return { reply: request.thread === "林安"
      ? "週五晚上七點半開始。我剛才說改到七點半，妳有空過來嗎？不行我就先不算妳。"
      : "前面說的是晚上七點半開始。妳要我再確認地點嗎？", delayMs: 1400 };
  }
  if (request.thread === "沈硯舟" && /怎麼認出|怎麼知道是我|怎麼認得|怎么认出|怎麼認識/.test(input) && /活動|現場|相機|照片|入鏡/.test(context)) {
    return { reply: "上次活動妳在幫忙處理現場流程，我拿相機經過時有跟妳打過照面。後來整理照片看到妳，才認出是同一個人。妳還記得那天嗎？", delayMs: 1500 };
  }
  if (request.thread === "林安" && /(?:活動|聚餐|聚會|聚会).*(?:哪|什麼|什么)|(?:哪|什麼|什么).*(?:活動|聚餐|聚會|聚会)/.test(input) && /聚餐|聚會|聚会|週五|周五/.test(context)) {
    return { reply: "就是我剛提的週五聚會，不是另一場活動。時間改成晚上七點半了，妳要來嗎？", delayMs: 1400 };
  }
  if (/^(?:活動是幾點開始|活动是几点开始)[？?]?$/.test(input) && !/七點半|七点半|7[:：]30|19[:：]30/.test(context)) {
    return { reply: "我還沒拿到確定的開始時間，確認後再告訴妳，不想亂報時間。", delayMs: 1400 };
  }
  // Supporting cast: resolve the actual scene and player decision, not a reusable filler line.
  const affirmative = /^(好|好啊|好呀|可以|行|我去|我會去|算我一個)[！!。\\s]*$/.test(input);
  const decline = /不去|沒空|不能去|不方便|不想去|先不要|改天|下次|沒興趣/.test(input);
  const details = /在哪|哪裡|地點|地址|幾點|時間|哪天|什麼時候|怎麼去|什麼展|哪個/.test(input);
  const eventContext = /聚餐|聚會|市集|展覽|餐廳|訂位|約|週末|週五|活動|排班/.test(context);
  if (request.thread === "周予晴" && /市集|週末|逛/.test(context)) {
    if (details) return { reply: "我還在確認市集的時間跟地點，確定後把資訊傳妳。妳想先保留週末哪一天？", delayMs: 1400 };
    if (decline) return { reply: "好，那這次先不約妳。等有別的市集我再問，不用勉強。", delayMs: 1200 };
    if (affirmative) return { reply: "那我先把妳列進週末市集的邀約，等時間確認再跟妳敲定，不會直接算妳答應整天。", delayMs: 1400 };
  }
  if (request.thread === "陳以衡" && /餐廳|訂位|新菜單|吃飯|聚餐/.test(context)) {
    if (details) return { reply: "餐廳和訂位細節我還在確認，現在不想報錯。等店家回覆我就把地址跟時間一起傳妳。", delayMs: 1500 };
    if (decline) return { reply: "知道了，我先不把妳算進訂位人數，免得佔了位置。", delayMs: 1300 };
    if (affirmative) return { reply: "好，我先記下妳有意願，訂位成功再跟妳確認一次時間。", delayMs: 1400 };
    if (/菜單|企劃|進度/.test(input)) return { reply: "還在調整新菜單的搭配，主要卡在試菜和成本。我想先把這兩件事處理好。", delayMs: 1500 };
  }
  if (request.thread === "許棠" && /排班|下班|補眠|值班|約/.test(context)) {
    if (details) return { reply: "我班表還沒完全排定，確定休假日再跟妳約，不想先答應又臨時取消。", delayMs: 1400 };
    if (decline) return { reply: "好，這次先不約。等我們兩個都有空再說。", delayMs: 1200 };
    if (affirmative && eventContext) return { reply: "好，等我班表出來就跟妳確認，現在還不能保證哪天能休。", delayMs: 1300 };
    if (/累|辛苦|休息|睡/.test(input)) return { reply: "真的有點累，我先補眠。醒來再看訊息，妳也別太晚睡。", delayMs: 1200 };
  }
  if (request.thread === "下班後五人組" && eventContext) {
    if (details) return { reply: "時間地點還要等大家確認，我先在群組統一整理，確定了再通知，避免有人跑錯。", delayMs: 1300 };
    if (decline) return { reply: "收到，這次先不把妳算進人數；之後想來再說。", delayMs: 1200 };
    if (affirmative) return { reply: "先記妳有意願！等大家時間對好，再正式確認人數。", delayMs: 1200 };
  }
  if (request.thread === "顧時安" && /提案|改稿|設計圖|展覽/.test(context)) {
    if (/提案|被退|怎麼了|發生什麼/.test(input)) return { reply: "提案被退回來了，我還在整理修改意見。最難的是對方只說方向不對，卻沒說哪裡不對。", delayMs: 1400 };
    if (/需要幫忙|幫你|給我看|看看/.test(input)) return { reply: "謝謝妳。我先把可以公開的部分整理出來，再問妳對版面有沒有想法。", delayMs: 1500 };
    if (/展覽/.test(context) && details) return { reply: "是城市空間和建築設計相關的展覽。我先確認日期、場地和票務再傳妳，不想給錯資訊。", delayMs: 1500 };
    if (decline) return { reply: "好，不勉強。那我先把手邊的圖改完，有空再聊。", delayMs: 1300 };
  }
  if (request.thread === "林安" && eventContext && decline) {
    return { reply: "好，那我先不把妳算進聚會人數。時間確定後我會告訴妳，妳再決定就好。", delayMs: 1300 };
  }
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
  if (request.thread === "顧時安" && /提案被退|失落|心情其實不太好/.test(recent)) {
    if (/發生什麼|聊聊/.test(input)) return { reply: "工作提案被退回來了，我有點失落。謝謝妳願意聽我說。", delayMs: 1500 };
    if (/打算|怎麼做/.test(input)) return { reply: "先休息，明天整理意見再修改。這次不想硬撐。", delayMs: 1500 };
    if (/休息|不用急/.test(input)) return { reply: "好，我先休息。謝謝妳。", delayMs: 1400 };
    if (/改天|有點累/.test(input)) return { reply: "沒問題，妳也早點休息。有空再聊。", delayMs: 1200 };
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
