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

  // Resolve Pei's exact subject before falling back to generic empathy.
  // His psychology training is not permission to diagnose the player or invent
  // an explanation for the breakup, which remains unresolved in canon.
  if (name === "裴知聿") {
    if (/不要再聯絡|別再聯絡|別找我|不要再找我|封鎖|停止聯絡|不要再傳訊息/.test(player))
      return say("……我知道了。妳已經說得很清楚，我會停止聯絡。");
    if (/我不想跟你復合|我不想復合|不會跟你復合|不會復合|別再提復合/.test(player))
      return say("……我聽見了。妳不用說第二次。說不難受是假的，但我不會把妳的拒絕當作沒聽到。");
    if (/我現在還不能給你答案|需要時間想清楚|還需要時間|先別急著談以後/.test(player) &&
        /復合|重新開始|秘密交往|地下情人|不能公開|還想修復/.test(context + " " + player))
      return say("……好，妳還沒決定，就是沒答應。我會難受，也會不甘心，但我不會替妳決定。");
    if (/你明知道我.*(?:男朋友|男友|戀人)|你知道我.*(?:交往|有男朋友)/.test(player))
      return say("我知道。妳不用提醒我第二次。可我知道妳跟他在一起，跟我能不能放下，是兩回事。");
    if (/地下情人|第三者|秘密交往|不能公開|名分|偷偷交往|不甘心.*要求/.test(player)) {
      if (/不會答應|不想|不要|拒絕/.test(player))
        return say("……我聽懂妳的拒絕了。我不會再提這件事。可是妳要我現在就不難過，我做不到。");
      if (/不甘心|要求降到/.test(player))
        return say("有。我不甘心。想到妳身邊已經有別人，我還是難受。……但降低要求是我自己的事，不是要妳負責。");
      return say("我想過。只能偷偷見面、不能讓別人知道，我都想過。可我說得出口，不代表我真的能忍受他站在妳身邊。……妳不答應也沒關係，這是我自己提出來的。");
    }
    if (/是在吃醋|你吃醋|妳吃醋/.test(player))
      return say("……是。我就是在吃醋。看到他站在妳身邊，我難受得要命。妳是想聽我說不在意嗎？我說不出口。");
    if (/只是我的朋友|只是朋友|別亂猜/.test(player))
      return say("……只是朋友？好，我聽見了。是我看了照片就在亂猜，但要我立刻不在意，我做不到。");
    if (/我跟誰見面|我和誰見面|沒資格質問|沒有立場質問/.test(player))
      return say("我知道妳跟誰見面是妳的自由。妳不用一直告訴我。可是我看見的那一刻，真的很想問他到底是誰。");
    if (/我現在不想討論這件事|這件事我暫時不想談|我今天不想談這些|先只談過去/.test(player))
      return say("……好，今天先不談。我的話還沒說完，但我知道妳現在不想聽。");
    if (/江若寧|學姊|學姐|傳聞|只是合作|憑照片猜測/.test(player) &&
        /研究|學姊|學姐|江若寧|傳聞|合作/.test(context + " " + player)) {
      if (/不想|不介入|不想.*猜/.test(player))
        return say("嗯，不用從一張照片推斷什麼。我自己的研究室人際關係，我會處理。");
      if (/傳聞/.test(player))
        return say("有些人看見我們在研究室討論，就開始猜。這是研究合作，我不希望妳只能從別人口中聽到。妳想問我可以直接說。");
      return say("我們有研究上的合作，最近為了資料和報告碰過面。妳想知道的是合作內容，還是妳看到的那張照片？");
    }
    if (/研究進度|論文|文獻|研究室|指導老師|學校的事|學校.*處理|什麼事情讓你.*煩|報告/.test(player) &&
        /研究所|研究室|論文|文獻|報告|老師|資料|研究進度/.test(context + " " + player)) {
      if (/先把|先去|不用急|晚點/.test(player))
        return say("嗯，我先把手上的資料整理完。……謝謝妳還願意關心我。");
      if (/煩|困擾|卡/.test(player))
        return say("最近研究資料有幾個地方一直對不上，跟老師討論前還得再查。我不是故意不回妳，只是腦袋有點亂。");
      return say("還在整理文獻和研究資料，有些地方要再跟老師確認。比我預期的慢一點。妳今天工作還順利嗎？");
    }
    if (/你想復合的原因|你有想過當初|你怎麼看當初|我們分手的事.*怎麼看|為什麼想復合/.test(player))
      return say("因為我還放不下妳。……但當初是妳提出分手，我一直想問妳那時候真正的感受。我不敢說自己已經把原因想明白了。");
    if (/我可以先聽你說|我可以聽你說|我願意聽你說|我想先知道你怎麼看/.test(player))
      return say("好。……我會先說我記得的事，也想聽妳記得的是什麼。我不會把妳肯聽當成願意復合。");
  }

  if (name === "裴知聿" &&
      /晚餐|煮飯|買菜|做菜|願意來|真的會來|過去吃|來我家/.test(context + " " + player)) {
    if (/還沒.*決定|再想想|給我.*時間/.test(player))
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
      return say("我一直在想。當初是妳提出分手，我知道。可真正讓我們走到那一步的原因，我不想只憑自己的記憶下結論。……妳如果願意，我想聽妳怎麼看。");
    if (/復合|重新開始/.test(player))
      return say("是，我還想復合。……我沒辦法假裝已經放下妳，但我也知道，這不是我說想就能重新開始的事。");
    if (/願意聽|先說/.test(player)) return say("……好，我說。我先講自己記得的部分。妳不用因為願意聽就給我答案。");
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
