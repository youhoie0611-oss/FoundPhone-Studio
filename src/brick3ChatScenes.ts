import type { Runtime } from "./schema";
import type { AiChatResponse } from "./aiChat";

type Scene = "photo" | "reunion" | "first_meeting" | "parking" | "off_duty";
const maleLeads: Record<string, Scene> = {
  "沈硯舟": "photo", "裴知聿": "reunion", "顧時安": "first_meeting",
  "祁野": "parking", "陸沉川": "off_duty",
};
type ChatLine = { body: string; outgoing: boolean };
type Branch = { outcome: string; reply: string };
const refuses = /不想|不要|不用|別|不方便|介意|擔心|拒絕|先不|不願意|保持距離|不太想/;
const accepts = /可以|好啊|好呀|願意|想看|傳給我|給我看|我們談談|說吧|想聽/;
const photoContext = /照片|相片|入鏡|相機|拍到|傳給妳|公開/;
const stories: Record<Scene, (text: string, context: string) => Branch | null> = {
  photo(text, context) {
    if (!photoContext.test(context) && !photoContext.test(text)) return null;
    if (/刪掉|刪除/.test(text)) return { outcome: "delete_requested", reply: "好。既然妳希望刪掉，我就不再留著那張照片。|抱歉，之前沒有先問妳。" };
    if (refuses.test(text) && (/照片|相片|傳|公開|拍|介意|擔心/.test(text) || photoContext.test(context)))
      return { outcome: "privacy_boundary", reply: "我知道了。|我不會把照片傳給任何人，也不會公開。|如果妳希望我刪掉，可以直接跟我說。" };
    if (accepts.test(text) && /照片|傳|看看|拍/.test(text + context))
      return { outcome: "view_agreed", reply: "好，我先確認照片沒有其他人的個資。|等我整理好再問妳一次，不會直接公開或轉傳。" };
    if (/哪一張|哪張|拍到什麼|什麼照片/.test(text))
      return { outcome: "details_requested", reply: "是活動現場妳協調流程的那張。|妳站在工作人員旁邊，剛好入鏡。|我先不傳，妳決定要不要看。" };
    if (/認出|認得|記得我|怎麼知道/.test(text))
      return { outcome: "recognized", reply: "那天妳在活動現場幫忙處理流程。|我拿相機經過時跟妳打過照面。|後來整理照片才認出妳。妳介意我留著那張照片嗎？" };
    return null;
  },
  reunion(text, context) {
    if (!/分手|復合|以前|聯絡|找我|見面/.test(text + context)) return null;
    if (refuses.test(text)) return { outcome: "distance", reply: "我知道我們已經分手。|妳不想談，我不會逼妳。|以前的問題是我該面對的，不該要妳替我收拾。" };
    if (/復合|為什麼找|想說什麼|聯絡/.test(text))
      return { outcome: "intent_revealed", reply: "我想過我們分手的事。|我確實希望還有重新開始的可能。|但我知道，光說想復合沒有用。妳願意先聽我說說我當時做錯了什麼嗎？" };
    if (accepts.test(text)) return { outcome: "conversation_open", reply: "謝謝妳願意聽。|我不會把這當成妳答應復合。|我們先從當初沒說清楚的事情談起。" };
    return null;
  },
  first_meeting(text, context) {
    if (!/聯絡|認識|找我|見過|電話|建築/.test(text + context)) return null;
    if (refuses.test(text)) return { outcome: "no_contact", reply: "抱歉突然打擾妳。|我尊重妳的意思，不會再主動聯絡。" };
    if (/聯絡方式|怎麼有|誰給|哪裡來|怎麼知道/.test(text))
      return { outcome: "source_unverified", reply: "妳問得合理。|我目前不能確認聯絡資料的來源，所以不會隨便編一個理由。|我會先查清楚；確認前不再打擾妳。" };
    return null;
  },
  parking(text, context) {
    if (!/停車|擋路|那天|道歉/.test(text + context)) return null;
    if (/道歉|擋到|不對|生氣/.test(text)) return { outcome: "apology_owed", reply: "那天是我擋到妳的路。|我先道歉，這件事我做得不對。|妳不接受也沒關係。" };
    if (refuses.test(text)) return { outcome: "distance", reply: "行，我不繼續煩妳。|那天的事我會記著。" };
    return null;
  },
  off_duty(text, context) {
    if (!/工作|下班|拍攝|見面|聯絡/.test(text + context)) return null;
    if (refuses.test(text)) return { outcome: "distance", reply: "明白。|妳不想談，我就不追問。" };
    if (/工作|拍攝|為什麼|找我/.test(text)) return { outcome: "work_explained", reply: "我剛結束工作。|有些事情不方便在現場說。|不過妳想知道哪一部分，我可以先說清楚。" };
    return null;
  },
};
/** Deterministic scene gates take priority over fallback chat and persist in the save. */
export function advanceBrick3Chat(state: Runtime, thread: string, message: string, history: ChatLine[]): AiChatResponse | null {
  const scene = maleLeads[thread];
  if (!scene) return null;
  const context = history.filter(item => !item.outgoing).slice(-5).map(item => item.body).join(" ");
  const branch = stories[scene](message, context);
  if (!branch) return null;
  const key = `brick3:scene:${thread}`;
  state.variables[key] = branch.outcome;
  state.trace.push(`brick3-scene:${thread}:${branch.outcome}`);
  return { reply: branch.reply.replaceAll("|", "。\n"), delayMs: 1200 };
}
