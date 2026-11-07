import { recordBrick3KktScene } from "./brick3KktEventBridge";
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
    // An old photo in the chat must not turn acceptance of dinner into photo consent.
    const addressesPhoto = /照片|相片|拍到|拍照|刪掉|刪除|公開|入鏡|哪一張|哪張|認出|認得|傳給我|別傳/.test(text);
    const shortAnswer = /^(好|好啊|好呀|可以|可以啊|想看)[！!。，\s]*$/.test(text);
    if ((!addressesPhoto && !shortAnswer) || (!photoContext.test(context) && !addressesPhoto)) return null;
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
    // A meal, vague "okay", or willingness to listen is never consent to date.
    // The player initiated the breakup; its actual causes remain undetermined.
    const explicit = /分手|復合|複合|重新開始|以前的問題|我們的關係|前男友/.test(text);
    const listens = /願意聽|可以聽|先聽|先說|你說吧|我們談談|可以談/.test(text) &&
      /分手|復合|複合|重新開始|以前的問題|當初/.test(context + " " + text);
    if (!explicit && !listens) return null;
    if (refuses.test(text)) return { outcome: "distance", reply: "……我知道妳不想談。|我會尊重，不再追問這件事。|只是有些話，我一直沒能好好說出口。" };
    if (listens) return { outcome: "conversation_open", reply: "……好。|我先說我記得的部分，也想聽妳記得的是什麼。|我不會把妳願意聽當成答應復合。" };
    if (/當初.*為什麼|分手.*原因|分手.*問題|分手.*怎麼看/.test(text))
      return { outcome: "breakup_question", reply: "我想過很多次。|是妳提出分手，我記得。|但真正讓我們走到那一步的原因，我不想單方面替妳下結論。" };
    if (/復合|複合|重新開始|我們的關係/.test(text))
      return { outcome: "intent_revealed", reply: "……是，我還想跟妳重新開始。|但我知道妳沒有答應。|妳願意先跟我談談我們以前沒說清楚的事嗎？" };
    return null;
  },
  first_meeting(text, context) {
    if (!/聯絡|認識|找我|見過|電話|建築/.test(text + context)) return null;
    if (/不要再聯絡|別聯絡|別再找|不想聯絡|不想認識|不想聊天|保持距離/.test(text)) return { outcome: "no_contact", reply: "抱歉突然打擾妳。|我尊重妳的意思，不會再主動聯絡。" };
    if (/聯絡方式|怎麼有|誰給|哪裡來|怎麼知道/.test(text))
      return { outcome: "source_unverified", reply: "妳問得合理。|我目前不能確認聯絡資料的來源，所以不會隨便編一個理由。|我會先查清楚；確認前不再打擾妳。" };
    return null;
  },
  parking(text, context) {
    if (!/停車|擋路|那天|道歉/.test(text + context)) return null;
    if (/道歉|擋到|不對|生氣/.test(text)) return { outcome: "apology_owed", reply: "那天是我擋到妳的路。|我先道歉，這件事我做得不對。|妳不接受也沒關係。" };
    if (/不要再提|別再講|不想談|保持距離|不想聯絡/.test(text)) return { outcome: "distance", reply: "行，我不繼續煩妳。|那天的事我會記著。" };
    return null;
  },
  off_duty(text, context) {
    if (!/工作|下班|會議|副總|集團|鋼琴|煮飯|料理|陸家|見面|聯絡/.test(text + context)) return null;
    if (/不要再聯絡|別聯絡|不想聊天|保持距離|不想談這件事/.test(text)) return { outcome: "distance", reply: "明白。|妳不想談，我就不追問。" };
    if (/鋼琴|彈琴/.test(text)) return { outcome: "piano_shared", reply: "從小就有練。|現在有空還是會彈一會兒。|妳平常會聽鋼琴曲嗎？" };
    if (/煮飯|料理|下廚/.test(text)) return { outcome: "cooking_shared", reply: "會自己做。|工作忙的時候，煮飯反而能讓我安靜下來。|妳平常喜歡吃什麼？" };
    if (/副總|集團|工作|會議|為什麼|找我/.test(text)) return { outcome: "work_explained", reply: "我在隔壁大樓工作，主要負責集團的營運決策。|剛開完會。|如果妳想知道哪部分，可以直接問。" };
    return null;
  },
};
/** Deterministic scene gates take priority over fallback chat and persist in the save. */
export function advanceBrick3Chat(state: Runtime, thread: string, message: string, history: ChatLine[]): AiChatResponse | null {
  const scene = maleLeads[thread];
  if (!scene) return null;
  const context = history.filter(item => !item.outgoing).slice(-2).map(item => item.body).join(" ");
  const prior = String(state.variables[`brick3:scene:${thread}`] ?? "");
  // A previous decision must change the next turn, not restart the opening scene.
  if (scene === "photo") {
    if (prior === "delete_requested" && /照片|傳|看看|刪/.test(message)) {
      return { reply: "我已經照妳的要求處理。\n不會再用那張照片打擾妳。", delayMs: 1000 };
    }
    if (prior === "privacy_boundary" && /謝謝|聊別的|其他|那天|還拍/.test(message)) {
      state.variables[`brick3:scene:${thread}`] = "conversation_redirected";
      return { reply: "嗯，這件事就先到這裡。\n那天活動結束後，妳是不是還留下來幫忙收拾？\n我後來有回去找落下的相機背帶。", delayMs: 1300 };
    }
    if (prior === "view_agreed" && /照片|傳|看看|給我/.test(message)) {
      return { reply: "我記得妳願意看。\n不過目前還沒有能在聊天室直接傳送的照片檔案，我不會假裝已經傳給妳。\n等照片功能接好再讓妳確認。", delayMs: 1100 };
    }
  }
  if (scene === "reunion") {
    if (prior === "distance" && /分手|復合|以前|想說|聯絡/.test(message) && !/我們談談|願意聽/.test(message))
      return { reply: "我記得妳要我保持距離。\n不會再逼妳談復合。", delayMs: 1100 };
    if (prior === "intent_revealed" && /願意聽|先說|你說|談談/.test(message)) {
      state.variables[`brick3:scene:${thread}`] = "conversation_open";
      return { reply: "……好，我先說。\n當初是妳提出分手，我記得。\n可是那時候我們到底哪一步走錯了，我一直想跟妳重新談一次。妳不用急著回答。", delayMs: 1500 };
    }
  }
  const branch = stories[scene](message, context);
  if (!branch) return null;
  const key = `brick3:scene:${thread}`;
  state.variables[key] = branch.outcome;
  recordBrick3KktScene(state, thread, branch.outcome);
  state.brick3SceneEvents = [...(state.brick3SceneEvents ?? []).filter(e => e.thread !== thread || e.sent), { thread, outcome: branch.outcome, due: (state.elapsedMs ?? 0) + 86400000 }].slice(-50);
  state.trace.push(`brick3-scene:${thread}:${branch.outcome}`);
  return { reply: branch.reply.replaceAll("|", "\n"), delayMs: 1200 };
}
