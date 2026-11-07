import { makeItem, type Runtime, type Work } from "./schema";
import { V8_LEADS, type V8Lead } from "./brick3Relationships";
import { ensureOvernight } from "./brick3Overnight";

type Stage = "flirt" | "tease";
type LeadProgress = { lastDay?: string; stage?: Stage; compliments: number; lastPhotoId?: string; dateOffered?: boolean; muted?: boolean; seq: number };
export type FlirtState = { version: 1; leads: Partial<Record<V8Lead, LeadProgress>> };
const prefix: Record<V8Lead, string> = { "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi", "顧時安": "gu", "陸沉川": "lu" };
const content: Record<V8Lead, { flirt: string; tease: string; image: string; caption: string; praise: string; neutral: string; refuse: string; invite: string }> = {
  "沈硯舟": { flirt: "剛剛路過那間店，想到妳上次說想去。", tease: "今天打完球，妳要不要看看我現在的樣子？", image: "shen_yanzhou_gym_mirror_selfie_03.webp", caption: "這張是不是拍得還可以？", praise: "妳這樣講，我會真的很開心欸。", neutral: "哈哈，好啦，不鬧妳。", refuse: "好，我以後先問妳。", invite: "晚上有空嗎？想跟妳一起出去走走。" },
  "裴知聿": { flirt: "看到妳以前喜歡的那家店，還是會想到妳。", tease: "今天運動完拍了一張。妳想看嗎？", image: "pei_zhiyu_post_workout_01.webp", caption: "……妳覺得怎麼樣？", praise: "妳真的這麼覺得？我有點不知道怎麼回。", neutral: "嗯，我只是想聽妳的想法。", refuse: "抱歉。我不會再突然傳這種照片。", invite: "今晚能不能一起吃個飯？只是我們兩個。" },
  "祁野": { flirt: "喂，今天看到個東西，感覺妳會喜歡。", tease: "今天這身怎樣？別敷衍。", image: "qi_ye_outfit_mirror_01.webp", caption: "說真的，妳覺得好不好看？", praise: "眼光不錯。那下次穿這身見妳。", neutral: "行，我知道了。", refuse: "知道了。以後不亂發。", invite: "今晚有空？帶妳去個地方，妳自己決定要不要來。" },
  "顧時安": { flirt: "剛下班，看到一間很安靜的咖啡館。下次想帶妳去。", tease: "今天換了件襯衫。妳之前說過喜歡這種顏色。", image: "gu_shian_office_mirror_01.webp", caption: "妳覺得適合我嗎？", praise: "謝謝。被妳這樣說，心情確實好不少。", neutral: "嗯，妳的意見我收到了。", refuse: "抱歉，我會注意分寸。", invite: "今晚要不要一起吃飯？如果妳下班後還有精神。" },
  "陸沉川": { flirt: "剛結束會議。看到妳上次提過的甜點，順手記下店名了。", tease: "今天難得提早離開公司。妳要看我現在穿什麼嗎？", image: "lu_chenchuan_gym_selfie_01.webp", caption: "不是工作照。妳覺得呢？", praise: "妳的評價，我會記得。", neutral: "嗯。那我不打擾妳。", refuse: "明白。之後不會擅自傳這類照片。", invite: "今晚有時間嗎？我想邀妳吃飯，不談工作。" },
};
const DAY = 86400000;
function progress(s: Runtime, lead: V8Lead): LeadProgress {
  const state = s.brick3Flirt ??= { version: 1, leads: {} };
  return state.leads[lead] ??= { compliments: 0, seq: 0 };
}
function send(s: Runtime, lead: V8Lead, body: string, id: string, outgoing = false, media = "") {
  s.messages.kakao ??= [];
  if (s.messages.kakao.some(m => m.id === id)) return;
  s.messages.kakao.push(makeItem({ id, title: lead, sender: outgoing ? "我" : lead, body, outgoing,
    kind: media ? "image" : "text", media, time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-flirt", ...(media ? { photographerId: prefix[lead] } : {}) } }));
  if (!outgoing) s.notifications.push(media ? `${lead}傳來一張照片` : `${lead}：${body}`);
}
function choices(s: Runtime, lead: V8Lead, actions: [string, string][]) {
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-flirt:${lead}:`));
  s.choices.push(...actions.map(([action, label]) => ({ target: `brick3-flirt:${lead}:${action}`, label: `${lead}｜${label}` })));
}
function affection(s: Runtime, lead: V8Lead) {
  return Number(s.variables[`${prefix[lead]}_attraction`] ?? 0);
}
function blocked(s: Runtime, lead: V8Lead) {
  return progress(s, lead).muted;
}
function offerDate(s: Runtime, lead: V8Lead) {
  const p = progress(s, lead);
  if (p.dateOffered || blocked(s, lead)) return;
  p.dateOffered = true;
  send(s, lead, content[lead].invite, `brick3-flirt-${lead}-date-${p.seq}`);
  choices(s, lead, [["date_yes", "答應今晚約會"], ["date_no", "今晚不方便"]]);
}
export function tickFlirt(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo" || w.mode === "explore") return s;
  for (const lead of V8_LEADS) {
    const a = affection(s, lead), p = progress(s, lead), day = s.date ?? w.phone.date ?? "";
    if (a < 40 || p.lastDay === day || blocked(s, lead)) continue;
    if (s.choices.some(c => c.target.startsWith(`brick3-flirt:${lead}:`))) continue;
    // Do not compete with an ongoing overnight scene or photo consent decision.
    if (ensureOvernight(s).records.some(r => r.lead === lead && ["invited", "accepted", "arrived", "morning"].includes(r.phase))) continue;
    if ((s.elapsedMs ?? 0) < DAY && p.seq > 0) continue;
    p.lastDay = day; p.seq++;
    if (a >= 50 && p.seq % 2 === 1) {
      p.stage = "tease";
      send(s, lead, content[lead].tease, `brick3-flirt-${lead}-tease-${p.seq}`);
      choices(s, lead, [["photo_yes", "想看照片"], ["photo_no", "先不要傳照片"]]);
    } else {
      p.stage = "flirt";
      send(s, lead, content[lead].flirt, `brick3-flirt-${lead}-opening-${p.seq}`);
      choices(s, lead, [["flirt_yes", "回應他的曖昧"], ["flirt_neutral", "正常聊天"], ["flirt_no", "保持距離"], ...(a >= 60 ? [["overnight_ask", "主動詢問今晚能不能過夜"] as [string, string]] : [])]);
    }
  }
  return s;
}
export function chooseFlirt(w: Work, previous: Runtime, target: string): Runtime | null {
  if (!target.startsWith("brick3-flirt:")) return null;
  if (w.id !== "between-the-lines-b-demo" || !previous.choices.some(c => c.target === target)) return previous;
  const [, leadName, action] = target.split(":");
  if (!V8_LEADS.includes(leadName as V8Lead)) return previous;
  const lead = leadName as V8Lead, s = structuredClone(previous), p = progress(s, lead);
  if (blocked(s, lead)) return previous;
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-flirt:${lead}:`));
  const id = `brick3-flirt-${lead}-${p.seq}-${action}`;
  const reply = (player: string, npc: string) => { send(s, lead, player, id + "-player", true); send(s, lead, npc, id + "-answer"); };
  if (action === "photo_yes") {
    reply("可以啊，傳來看看。", "好，給妳看。");
    const media = `./story-photos/${prefix[lead] === "shen" ? "shen_yanzhou" : prefix[lead] === "pei" ? "pei_zhiyu" : prefix[lead] === "qi" ? "qi_ye" : prefix[lead] === "gu" ? "gu_shian" : "lu_chenchuan"}/${content[lead].image}`;
    p.lastPhotoId = id;
    send(s, lead, "照片", id + "-photo", false, media);
    send(s, lead, content[lead].caption, id + "-caption");
    choices(s, lead, [["praise", "稱讚他很好看"], ["tease", "調侃他一下"], ["neutral", "正常回覆"], ["refuse", "表示不想再收到這類照片"], ...(affection(s, lead) >= 60 ? [["overnight_ask", "主動詢問今晚能不能過夜"] as [string, string]] : [])]);
  } else if (action === "photo_no" || action === "refuse") {
    p.muted = true; p.compliments = 0;
    reply(action === "photo_no" ? "先不要傳照片。" : "我不想再收到這種照片。", content[lead].refuse);
  } else if (action === "praise" || action === "tease" || action === "neutral") {
    if (!p.lastPhotoId) return previous;
    if (action === "praise") p.compliments++;
    else if (action === "neutral") p.compliments = Math.max(0, p.compliments - 1);
    reply(action === "praise" ? "真的很好看，我很喜歡。" : action === "tease" ? "你是不是故意拍給我看的？" : "我看到了。", action === "praise" ? content[lead].praise : content[lead].neutral);
    p.lastPhotoId = undefined;
    if (affection(s, lead) >= 60 && p.compliments >= 2) offerDate(s, lead);
  } else if (action === "flirt_yes" || action === "flirt_neutral" || action === "flirt_no") {
    reply(action === "flirt_yes" ? "下次我們一起去。" : action === "flirt_no" ? "我們先當朋友就好。" : "嗯，我知道了。", action === "flirt_yes" ? "好，我記住了。" : action === "flirt_no" ? "我明白，會注意分寸。" : "好，妳先忙。");
  } else if (action === "date_yes") {
    reply("今晚可以一起出去。", "好，那我們晚點確認時間和地點。");
    choices(s, lead, [["overnight_ask", "主動詢問今晚能不能過夜"], ["date_only", "今晚只約會，不過夜"]]);
  } else if (action === "date_no" || action === "date_only") {
    reply(action === "date_no" ? "今晚不方便。" : "今晚約會就好，我不過夜。", "好，照妳的安排。");
  } else if (action === "overnight_ask") {
    reply("如果今晚約會順利，我可以留下過夜嗎？", "可以先一起吃飯，晚一點再確認彼此的安排。");
    const overnight = ensureOvernight(s);
    const recordId = `flirt_${prefix[lead]}_${p.seq}`;
    if (!overnight.records.some(r => r.id === recordId)) {
      overnight.records.push({ id: recordId, lead, phase: "invited", createdAt: s.elapsedMs ?? 0 });
      s.choices.push({ target: `brick3-overnight:${recordId}:accept`, label: `${lead}｜確認過夜安排` },
        { target: `brick3-overnight:${recordId}:decline`, label: `${lead}｜今晚還是回去` });
    }
  } else return previous;
  return s;
}
