import type { Item } from "./schema";

type ChatLine = Pick<Item, "body" | "outgoing">;
const normalize = (s: string) => s.trim().replace(/\s+/g, "").replace(/[。！!？?，、]+$/g, "");

/**
 * The choices belong to the last unanswered NPC turn, not to a character's
 * permanent topic. Old messages must never revive a completed invitation or
 * cause a player to repeat a question the NPC has just ignored.
 */
export function brick3ContextReplies(thread: string, messages: readonly ChatLine[]): string[] {
  const last = messages.at(-1);
  if (!last || last.outgoing) return [];

  let lastPlayerIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].outgoing) { lastPlayerIndex = i; break; }
  }
  const turn = messages.slice(lastPlayerIndex + 1).filter(m => !m.outgoing)
    .slice(-8).map(m => m.body).join(" ");
  const latest = last.body;
  const previousPlayer = messages.filter(m => m.outgoing).slice(-20).map(m => normalize(m.body));
  const recentPlayer = [...messages].slice(0, lastPlayerIndex + 1).reverse()
    .find(m => m.outgoing)?.body ?? "";
  const said = (re: RegExp) => re.test(turn);
  const stop = "我現在不方便聊，我們改天再說。";
  let options: string[];
  let alternatives: string[] = [];

  if (/不要再聯絡|別再聯絡|別找我|封鎖|不要再傳/.test(recentPlayer) &&
      /不再打擾|不會再聯絡|不再聯絡|不再找|不再傳/.test(latest)) return [];

  // A current meal invitation always wins over older breakup/romance history.
  if (said(/晚餐|吃飯|買菜|煮飯|做菜|早餐|一起吃|來我家|妳會來|妳真的會|願意來|會過來|要來嗎|過來吃|來吃|會來對吧/)) {
    if (said(/今晚|晚餐|買菜|煮飯|做菜|願意來|會來|過來吃|來吃|會來對吧/)) {
      options = ["我會過去，但我們先確認幾點見。", "你打算煮什麼？我想先知道。", "我還沒完全決定，給我一點時間。", "抱歉，我改變主意了，今晚不去了。"];
      alternatives = ["你先別急著買菜，時間還沒敲定。", "我們先確認今天彼此的安排好嗎？", "你不用一直確認，我會告訴你我的決定。"];
    } else {
      options = ["你想約哪一天吃飯？", "時間和地點確定了嗎？", "你比較想吃什麼？", "這次我不方便，我們改天再約。"];
    }
  } else if (thread === "祁野" && (/態度|說話太衝|認真想|道歉|拐什麼彎|這問題挺有意思|問啊/.test(turn) ||
      /態度|剛才說話/.test(recentPlayer))) {
    options = ["我想聽你正面回答剛才的問題。", "你剛才那樣說話，真的讓人不舒服。", "你覺得自己哪裡說得不對？", "這件事先不談了。"];
    alternatives = ["不要再用玩笑帶過，我是在認真問你。", "你先聽我把話說完，好嗎？", "如果你願意道歉，我會聽。"];
  } else if (thread === "裴知聿" && said(/分手|復合|複合|重新開始|以前的問題|還喜歡|感情|原諒/)) {
    options = ["你聯絡我，是想重新開始嗎？", "我們分手的問題，你真的想清楚了嗎？", "我可以聽你說，但不代表答應復合。", "我現在不想談以前的事。"];
    alternatives = ["你先說說現在和以前有什麼不一樣。", "我還需要時間，不想現在給你答案。"];
  } else if (thread === "沈硯舟" && said(/照片|相機|入鏡|拍到|公開|傳給妳/)) {
    options = ["你說的是哪一張照片？", "可以先讓我自己看看嗎？", "我不希望你公開有我的照片。", "我們先聊別的吧。"];
    alternatives = ["照片的事先別急，我想確認清楚。", "你是在活動現場拍到的嗎？"];
  } else if (thread === "顧時安" && said(/我是顧時安|建築設計|初次|認識|聯絡方式|第一次聯絡/)) {
    options = ["你好，我們之前在哪裡認識？", "你怎麼會有我的聯絡方式？", "你找我有什麼事嗎？", "我現在在忙，改天再聊。"];
    alternatives = ["你可以先說明聯絡我的原因嗎？", "你提到建築設計，是什麼案子？"];
  } else if (said(/提案|改稿|設計圖|建築|工地|會議|工作|加班|研究室|課業/)) {
    options = ["你剛才說工作上的事，遇到什麼問題？", "後來有找到解決方法嗎？", "辛苦了，你先休息一下。", stop];
    alternatives = ["你現在是忙完了嗎？", "需要我聽你說說嗎？"];
  } else if (said(/邀請|約會|聚會|聚餐|週末|週五|市集|展覽|活動|一起去/)) {
    options = ["你說的是哪一個活動？", "時間和地點已經確定了嗎？", "我先看看自己的安排。", "這次我不方便參加。"];
    alternatives = ["你想約的是哪一天？", "可以先把活動資訊給我嗎？"];
  } else if (said(/照片|相機|拍照|自拍|傳一張/)) {
    options = ["你說的是哪張照片？", "那張照片是在哪裡拍的？", "你先說說照片的內容。", "先不要傳照片給我。"];
  } else if (said(/還好嗎|最近|今天過得|累嗎|忙嗎/)) {
    options = ["我今天有點累，你呢？", "我還好，你最近在忙什麼？", "你怎麼突然這樣問？", stop];
  } else if (said(/妳想|妳要|妳能|妳可以|要不要|會不會|好嗎|對吧|嗎[？?]|[？?]/)) {
    options = ["我想先聽聽你的想法。", "你能把剛剛的問題說清楚嗎？", "我還沒決定，讓我想想。", stop];
    alternatives = ["我想先確認你問的是哪件事。", "你可以先說說自己的看法嗎？"];
  } else if (said(/你好|嗨|早安|晚安|在嗎/)) {
    options = ["嗨，你今天過得怎麼樣？", "你找我有什麼事嗎？", "我剛好有空，你說吧。", stop];
  } else {
    options = ["你剛剛說的那件事，後來怎麼樣了？", "你為什麼會這樣想？", "我有在聽，你可以繼續說。", stop];
    alternatives = ["你可以把剛剛那句話說清楚嗎？", "先說說你現在的想法吧。"];
  }

  const results: string[] = [];
  for (const candidate of [...options, ...alternatives]) {
    const value = normalize(candidate);
    if (!value || previousPlayer.includes(value) || results.some(x => normalize(x) === value)) continue;
    results.push(candidate);
    if (results.length === 4) break;
  }
  // Exhausted choices are not recycled simply to fill four buttons.
  return results;
}
