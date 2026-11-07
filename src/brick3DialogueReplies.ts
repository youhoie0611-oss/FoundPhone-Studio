import type { AiChatRequest, AiChatResponse } from "./aiChat";

/** Offline-first contextual answers for the choices actually displayed by Brick3. */
export function brick3ContextAnswer(request: AiChatRequest): AiChatResponse | null {
  const player = request.message.trim();
  const history = request.history.at(-1)?.outgoing && request.history.at(-1)?.body === player
    ? request.history.slice(0, -1) : request.history;
  let playerIndex = -1;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].outgoing) { playerIndex = i; break; }
  }
  const turn = history.slice(playerIndex + 1).filter(line => !line.outgoing).slice(-8)
    .map(line => line.body).join(" ");
  const recent = history.filter(line => !line.outgoing).at(-1)?.body ?? "";
  const context = turn || recent;
  const name = request.thread;
  const say = (reply: string): AiChatResponse => ({ reply, delayMs: 1200 });
  const stop = /不方便|改天|晚點|先不|先不要|不想|不要|不去了|改變主意|還沒.*決定|保持距離|先算了|不聊|停止|別|拒絕/;
  const details = /幾點|什麼時候|時間|在哪|哪裡|地點|地址|哪天/;

  if (name === "祁野" && /態度|太衝|說話|認真|回答剛才|不舒服|覺得自己|哪裡說得不對|道歉|玩笑帶過|聽我把話說完/.test(player)) {
    if (/算了|先不談|先停在這裡/.test(player)) return say("行。妳不想談，我就不追著問。");
    return say(/道歉/.test(player)
      ? "妳說得對。剛才我講話沒分寸，先跟妳道歉。我不該拿脾氣讓妳受氣。"
      : "有，我有想。剛剛那句話是我太衝，光說「我就這樣」不是理由。妳不舒服，我應該先聽完。");
  }
  if (name === "祁野" && /問啊|拐什麼彎|這問題挺有意思/.test(context) &&
      /你怎麼想|有在聽|講清楚|什麼意思|繼續說/.test(player))
    return say("我剛才故意用玩笑帶過了。妳問得很直接，我就正面答：我確實有時候太自以為是。");

  if (name === "裴知聿" &&
      /晚餐|煮飯|買菜|做菜|願意來|真的會來|過去吃|來我家/.test(context + " " + player)) {
    if (/還沒.*決定|再想想|給我.*時間|先確認/.test(player))
      return say("好，妳還沒決定，我先不把今晚的安排定下來。等妳想清楚再告訴我，不用急。");
    if (stop.test(player)) return say("……好。我知道妳改變主意了。今晚就不勉強妳，我不會擅自把妳算進安排。");
    if (/煮什麼|做什麼|準備什麼|吃什麼/.test(player))
      return say("我想做妳以前喜歡的菜，但還沒決定。妳現在想吃什麼？我照妳的口味準備。");
    if (/不用特別|簡單吃|不用準備/.test(player))
      return say("好，不弄得太正式。能一起吃頓飯就夠了，我不會把這當成妳答應其他事。");
    if (details.test(player)) return say("時間我們再確認一次吧。妳下班後方便的時段告訴我就好，不用為了我趕過來。");
    if (/好|願意|我會|可以|想過去|會過去|會來/.test(player))
      return say("我聽到了。妳願意來吃飯，我很高興。我先準備食材；時間我們再確認，不會臨時替妳決定。");
  }
  if (name === "裴知聿" && /復合|分手|以前|重新開始|當初的問題/.test(player)) {
    if (stop.test(player)) return say("好。妳不想談以前的事，我就不提。我知道那不是妳必須回應的問題。");
    if (/問題|想清楚|為什麼/.test(player))
      return say("我想過。但我不能把當初的事說成只是妳或我的錯。以前我太怕失去妳，常把自己的不安丟給妳承擔。妳願不願意聽我說是另一回事。");
    if (/復合|重新開始/.test(player))
      return say("是，我還想重新開始。但我知道妳沒有答應。分手後的事不能靠我一句想復合就算翻篇。");
    if (/願意聽|先說/.test(player)) return say("謝謝妳願意聽。我會把事情說清楚，不會把這當成妳已經原諒我。");
  }

  if (name === "顧時安" && /我是顧時安|建築設計|聯絡|認識/.test(context + player)) {
    if (stop.test(player)) return say("好，抱歉突然打擾。妳先忙，不需要現在回我。");
    if (/聯絡方式|怎麼會有我的|怎麼拿到|誰給|怎麼聯絡/.test(player))
      return say("這問題應該先交代清楚。目前我沒辦法確認聯絡資料的來源，不會編一個理由搪塞妳。我先核對，確定前不再打擾。");
    if (/哪裡認識|在哪裡認識|之前在哪|見過|怎麼認識/.test(player))
      return say("我們之前有工作專案上的接觸，但可能還沒正式聊過。抱歉我突然這樣自我介紹，應該先把來意說清楚。");
    if (/什麼案子|建築設計.*什麼|做什麼設計/.test(player))
      return say("我主要做建築設計。至於具體的工作案子，我先確認哪些內容方便說，再慢慢跟妳介紹。");
    if (/找我|什麼事|有事嗎|為什麼聯絡/.test(player))
      return say("原本想跟妳聊聊之前工作接觸過的事。不過我應該先問妳現在方不方便，而不是突然傳一長串。");
  }

  if (/吃飯|晚餐|買菜|煮飯|早餐|餐廳|邀約/.test(context + " " + player)) {
    if (stop.test(player)) return say(name === "祁野" ? "行，今晚就不約。妳有別的安排我不會追問。" : "知道了，這次先不算妳。等妳方便再說。");
    if (details.test(player)) return say("具體時間地點還沒有全部確認，我確認好再告訴妳，不會直接算妳答應。");
    if (/煮什麼|吃什麼|哪一家|哪間/.test(player))
      return say("還沒最後決定。妳有想吃的嗎？我們先選好再安排。");
    if (/不用特別|簡單吃/.test(player))
      return say("好，簡單吃就好。不用特別為了這頓飯改妳的行程。");
    if (/我會|可以|想去|我去|一起|有空/.test(player))
      return say("好，那先把時間和地點講清楚。妳確定方便再出發，不用趕。");
  }
  if (/照片|相機|拍到|自拍/.test(context + " " + player)) {
    if (/先不要|不希望|不公開|刪掉|不要|不想/.test(player))
      return say("好，我不會擅自傳給別人或公開。妳希望刪掉，我就處理。");
    if (/哪張|哪一張|哪裡拍|在哪拍/.test(player))
      return say("是之前一起提到的那個場合拍到的。我先把照片確認清楚，不會隨便說妳同意公開。");
    if (/給我看|傳給我|想看/.test(player))
      return say("好，妳是同意先自己看，不代表可以公開。我整理好再跟妳確認。");
  }
  if (/聚會|聚餐|市集|展覽|活動|邀請|週末|週五/.test(context + " " + player)) {
    if (stop.test(player)) return say("好，這次就先不算妳。妳有自己的安排，沒關係。");
    if (details.test(player) || /哪個活動|哪個展/.test(player))
      return say("我先把活動的正式時間、地點核對好再傳給妳，免得講錯。");
    if (/我先看看|還沒決定|需要時間/.test(player))
      return say("沒問題，不急著算妳答應。時間確定後我再問一次。");
  }
  if (/工作|加班|提案|改稿|設計圖|工地|會議|班表/.test(context + " " + player)) {
    if (stop.test(player)) return say("好，妳先處理自己的事。我這邊也先把工作收尾。");
    if (/工作遇到|什麼問題|後來怎麼|解決的方法/.test(player))
      return say(name === "顧時安" ? "我還在整理設計案的問題，先把對方真正想改的部分釐清，再決定怎麼修改。" :
        "還在處理，不算完全解決。我會先把能確認的部分處理好。");
    if (/辛苦|休息/.test(player)) return say("嗯，謝謝妳。我忙完就休息，妳也別太累。");
  }
  if (/今天有點累|今天過得|你最近在忙|怎麼突然問|你呢/.test(player)) {
    if (/你最近在忙|你呢/.test(player))
      return say(name === "沈硯舟" ? "最近在忙課業，也有抽空去打球。妳呢？" :
        name === "顧時安" ? "這幾天主要忙設計圖和現場的事，還算順利。" :
        name === "陸沉川" ? "集團這陣子有幾個會議要處理，忙完通常就直接回家。" :
        name === "裴知聿" ? "最近在忙研究所的事，也在試著把自己的生活整理好。" :
        "就是自己的日常，沒有什麼特別的大事。妳呢？");
    if (/累/.test(player)) return say("辛苦了。妳先休息，不用特地陪我聊天。");
    if (/突然問/.test(player)) return say("只是想知道妳最近過得怎麼樣。不是要妳現在交代什麼。");
  }
  if (/想先聽聽你的想法|更具體|釐清你剛剛|直接回答我的問題|我有在聽|繼續說|後來怎麼了|為什麼會這樣想/.test(player)) {
    const quote = recent.replace(/[。！？?!\n]+/g, " ").trim().slice(0, 34);
    return say(quote ? "妳是問我剛剛說的「" + quote + "」？我不想用一句話敷衍，妳比較想知道哪一部分？" :
      "我在聽。妳想先問哪一件事，我會直接回答。");
  }
  if (/謝謝|感謝/.test(player)) return say("不用客氣。這是我願意做的事。");
  if (stop.test(player)) return say(name === "祁野" ? "行，不煩妳。這件事就到這裡。" : "好，先不打擾妳。妳有空再說。");
  return null;
}
