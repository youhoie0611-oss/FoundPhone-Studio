import type { Item } from "./schema";

/** Suggestions refer to the latest delivered turn, never a permanent menu for a character. */
export function brick3ContextReplies(thread: string, messages: readonly Pick<Item, "body" | "outgoing">[]): string[] {
  const latest = messages.at(-1);
  if (!latest || latest.outgoing) return [];
  const lastOutgoing = messages.findLast(message => message.outgoing)?.body ?? "";
  const lastPlayerIndex = messages.findLastIndex(message => message.outgoing);
  const turn = messages.slice(lastPlayerIndex + 1).filter(message => !message.outgoing)
    .slice(-7).map(message => message.body).join(" ");
  const dialogue = turn + " " + latest.body;
  const previousPlayer = messages.filter(message => message.outgoing).slice(-3).map(message => message.body);
  const stop = "我現在不方便聊，晚點再說。";
  let replies: string[];

  if (/吃飯|晚餐|買菜|煮飯|做菜|早餐|來我家|願意來|會來|過來/.test(dialogue) &&
      !/我們分手|不想再聯絡/.test(dialogue)) {
    replies = /今晚|晚上|晚餐|買菜|煮飯|做菜|願意來|會來/.test(dialogue)
      ? ["我會過去，幾點比較方便？", "你不用特別準備太多，我們簡單吃就好。", "你打算煮什麼？", "抱歉，我想改天再約。"]
      : ["你想約哪一天？", "可以先告訴我時間和地點嗎？", "你想吃哪一家？", "這次我可能沒辦法去。"];
  } else if (thread === "祁野" && /態度|拐什麼彎|這問題挺有意思|問啊/.test(dialogue + lastOutgoing)) {
    replies = ["我是在問你，有沒有覺得自己剛才說話太衝？", "你自己覺得哪裡需要改？", "我希望你先認真聽我說。", "算了，這件事先不談。"];
  } else if (thread === "裴知聿" && /分手|復合|重新開始|以前|還喜歡|再給一次機會/.test(dialogue)) {
    replies = ["你現在聯絡我，是希望復合嗎？", "當初的問題你有認真想過嗎？", "我願意聽你說，但不代表復合。", "我現在不想談以前的事。"];
  } else if (thread === "沈硯舟" && /照片|相機|入鏡|拍到|傳給妳/.test(dialogue)) {
    replies = ["你說的是哪張照片？", "可以先讓我看看嗎？", "我不希望你把有我的照片公開。", "我們先聊別的吧。"];
  } else if (thread === "顧時安" && /我是顧時安|建築設計|認識|第一次聯絡|聯絡方式/.test(dialogue)) {
    replies = ["你好，我們之前在哪裡認識？", "你怎麼會有我的聯絡方式？", "你找我是有什麼事情嗎？", "我現在不方便聊天，改天再說。"];
  } else if (/提案|改稿|設計圖|建築|工地|會議|工作|加班/.test(dialogue)) {
    replies = ["你剛剛說的工作遇到什麼問題？", "後來有找到解決的方法嗎？", "辛苦了，你先休息一下。", stop];
  } else if (/邀請|約會|聚會|聚餐|週末|週五|市集|展覽|活動|出門|一起去/.test(dialogue)) {
    replies = ["你說的是哪個活動？", "時間和地點確定了嗎？", "我先看看自己的安排。", "這次我不方便參加。"];
  } else if (/照片|相機|拍照|自拍/.test(dialogue)) {
    replies = ["你說的是哪張照片？", "那張照片是在哪裡拍的？", "我想先看一下再決定。", "先不要傳照片給我。"];
  } else if (/還好嗎|最近|今天過得|累嗎|忙嗎/.test(dialogue)) {
    replies = ["今天有點累，你呢？", "還好，你最近在忙什麼？", "你怎麼突然問這個？", stop];
  } else if (/妳想|妳要|妳能|妳可以|要不要|會不會|好嗎|對吧|嗎[？?]|[？?]/.test(dialogue)) {
    replies = ["我想先聽聽你的想法。", "你能說得更具體一點嗎？", "我還沒決定，讓我想想。", "我現在不方便回答。"];
  } else if (/你好|嗨|早安|晚安|在嗎/.test(dialogue)) {
    replies = ["嗨，你今天過得怎麼樣？", "找我有什麼事嗎？", "剛好有空，你說吧。", stop];
  } else {
    replies = ["你剛剛說的那件事，後來怎麼了？", "你為什麼會這樣想？", "我有在聽，你繼續說。", stop];
  }
  // The exact same button must not reappear immediately after being sent.
  const fresh = replies.filter(reply => !previousPlayer.includes(reply));
  if (fresh.length === 4) return fresh;
  const alternatives = ["我想先釐清你剛剛那句話。", "你可以直接回答我的問題嗎？",
    "那我們換個話題吧。", "我需要一點時間想想。", "我們改天再聊。"];
  for (const alternative of alternatives) {
    if (fresh.length >= 4) break;
    if (!previousPlayer.includes(alternative) && !fresh.includes(alternative)) fresh.push(alternative);
  }
  return fresh.slice(0, 4);
}
