import { makeItem, type Work, type Runtime } from "./schema";
import { V8_LEADS, ensureV8, discoverV8Core, type V8Lead } from "./brick3Relationships";

/** Scene scheduling and progression are independent of KKT opening. */
export type V8LifeState = {
  observedIds: string[];
  nightOffers: Record<string, "offered" | "accepted" | "declined" | "completed">;
  lastOfferAt: number;
  lastObservedAt: Record<string, number>;
  lastNightDate: string;
};
type Night = { id: string; lead: V8Lead; start: number; end: number; lines: string[]; scene: string };
const NIGHTS: Night[] = [
  { id: "NIGHT_01", lead: "沈硯舟", start: 21, end: 23, lines: ["剛結束今天的拍攝。", "還在整理素材，便利商店的燈都快比我的電腦亮了。", "妳今天還好嗎？"], scene: "攝影工作的深夜近況" },
  { id: "NIGHT_02", lead: "裴知聿", start: 22, end: 24, lines: ["研究的資料終於整理完了。", "剛剛不小心想到我們以前的一件事。", "現在提這個會不會太突然？"], scene: "研究與前任回憶的深夜對話" },
  { id: "NIGHT_03", lead: "祁野", start: 22, end: 24, lines: ["今天家裡又有一堆事情。", "我現在還不想回去。", "妳不用特地安慰我，我只是想找個人講兩句。"], scene: "家族壓力與個人選擇" },
  { id: "NIGHT_04", lead: "顧時安", start: 21, end: 24, lines: ["剛把最後一份提案收起來。", "今天改了不少細節。", "妳通常會怎麼讓自己從工作裡抽離？"], scene: "設計工作與現實妥協" },
  { id: "NIGHT_05", lead: "陸沉川", start: 21, end: 23, lines: ["剛結束最後一場會議。", "回到家打算簡單煮點東西。", "妳今天工作還順利嗎？"], scene: "集團副總的晚間生活與料理" },
  { id: "NIGHT_06", lead: "沈硯舟", start: 22, end: 24, lines: ["今晚活動有個人也在拍攝。", "我們聊到一些作品的事。", "原來大家對照片的想法差這麼多。"], scene: "跨角色的夜間攝影交集" },
  { id: "NIGHT_07", lead: "裴知聿", start: 23, end: 24, lines: ["之前的事……我其實還沒有想明白。", "我不想裝作什麼都沒發生。", "妳如果願意，我們可以改天談談。"], scene: "重大衝突後未說出口的事" },
];
const hour = (s: Runtime) => Number((s.time ?? "12:00").split(":")[0]);
const clamp = (n: number) => Math.min(100, Math.max(0, n));
const now = (s: Runtime) => s.elapsedMs ?? 0;
function init(s: Runtime): V8LifeState {
  return s.brick3V8Life ??= {
    observedIds: [], nightOffers: {}, lastOfferAt: -2 * 86400000,
    lastObservedAt: {}, lastNightDate: "",
  };
}
function add(s: Runtime, lead: V8Lead, body: string, id: string) {
  s.messages.kakao ??= [];
  if (s.messages.kakao.some(m => m.id === id)) return;
  s.messages.kakao.push(makeItem({
    id, title: lead, sender: lead, body, time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-v8-life" },
  }));
  s.notifications.push(`${lead}：${body}`);
}
const topics: Record<V8Lead, [RegExp, RegExp, RegExp, RegExp]> = {
  "沈硯舟": [/攝影|照片|拍攝/, /署名|合作|作品/, /學業|課業|未來/, /擔心|真正|坦白/],
  "裴知聿": [/分手|以前|復合/, /回憶|訊息|當年/, /不安|不想失去|很怕/, /真相|坦白|說清楚/],
  "祁野": [/家族|祁家|家裡/, /合作|安排|生意/, /聯姻|自由|選擇/, /坦白|真的想要|決定/],
  "顧時安": [/建築|設計|提案/, /工作|合作|倫理/, /原則|選擇|妥協/, /坦白|理想|真正/],
  "陸沉川": [/集團|副總|會議|辦公室/, /鋼琴|料理|下廚|工作/, /陸家|家族|繼承|界線/, /坦白|真心|想要/],
};
const psychological: Record<V8Lead, string> = {
  "沈硯舟": "近期拍攝與課業安排可能讓他分身乏術；先確認實際發生了什麼。",
  "裴知聿": "近期前任關係可能讓他不安；先聽他自己怎麼解釋，不能用猜測代替事實。",
  "祁野": "他提過家族安排與個人選擇有衝突，可以問他真正希望怎麼辦。",
  "顧時安": "他最近的設計提案似乎有工作壓力，可以先關心專案進展。",
  "陸沉川": "陸家繼承責任與個人生活需要平衡；他對人有距離感，不能把禮貌當成感情承諾。",
};
const keys: Record<V8Lead, [string, string, string]> = {
  "沈硯舟": ["攝影", "運動", "影像企劃"],
  "裴知聿": ["研究", "訪談", "學術合作"],
  "祁野": ["品牌", "設計", "活動"],
  "顧時安": ["建築", "專案", "設計倫理"],
  "陸沉川": ["集團經營", "鋼琴", "料理"],
};
function observeKnownEvents(s: Runtime) {
  const life = init(s), v = ensureV8(s);
  // Only actual received material counts; player statements are not proof of NPC secrets.
  for (const entry of [...(s.messages.kakao ?? []), ...(s.messages.instagram ?? [])]) {
    if (life.observedIds.includes(entry.id) || entry.outgoing) continue;
    const lead = V8_LEADS.find(n => entry.title === n || entry.sender === n);
    if (!lead) continue;
    life.observedIds.push(entry.id);
    const b = v.bonds[lead], text = entry.body;
    const gates: readonly RegExp[] = topics[lead];
    for (let i = 0; i < gates.length; i++) {
      // A single incoming item cannot skip core stages or reveal all four truths.
      if (i === b.core && gates[i]?.test(text)) {
        discoverV8Core(s, lead, `CORE_${i + 1}:${entry.id}`);
        break;
      }
    }
    for (const skill of keys[lead]) {
      if (!text.includes(skill)) continue;
      const base = b.careerExperience[skill] ?? 0;
      b.careerExperience[skill] = clamp(base + 10);
      const totalSpecializations = Object.values(b.specialization).reduce((sum, level) => sum + level, 0);
      if (base >= 100 && totalSpecializations < 3)
        b.specialization[skill] = (b.specialization[skill] ?? 0) + 1;
    }
    if (b.core >= 2 && !b.psychologicalObservation)
      b.psychologicalObservation = psychological[lead];
    if (b.core === 4 && !v.endings.includes("END_09")) {
      v.endings.push("END_09");
      if (!s.endings.includes("END_09")) s.endings.push("END_09");
    }
  }
  life.observedIds = life.observedIds.slice(-1500);
}
const deeperLines: Record<V8Lead, string[]> = {
  "沈硯舟": ["我平常好像都裝得很有精神。", "其實有些事我也會在意，不是什麼都能笑一笑就過去。"],
  "裴知聿": ["我一直以為只要妳肯再理我，我就能滿足。", "可是我知道自己還是會嫉妒……我不想裝作不在乎。"],
  "祁野": ["我一直覺得有些事只要努力就能贏。", "可家裡的事不是這樣，妳的選擇也不是。"],
  "顧時安": ["我通常會先把事情想清楚再說。", "但這次我想承認，我也有自己的私心和界線。"],
  "陸沉川": ["我從小就知道很多事會被人當成理所當然。", "但我想跟妳相處，是我自己的決定，不是陸家的安排。"],
};
function tickRevelations(w: Work, s: Runtime) {
  const v = ensureV8(s);
  for (const lead of V8_LEADS) {
    const b = v.bonds[lead];
    const prefix: Record<V8Lead, string> = { "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi", "顧時安": "gu", "陸沉川": "lu" };
    const trust = Number(s.variables[prefix[lead] + "_trust"] ?? 0);
    const mutualHistory = (s.messages.kakao ?? []).filter(m => m.title === lead && m.outgoing).length;
    if (!b.revelation && b.core >= 2 && mutualHistory >= 3 && trust >= 60) {
      b.revelation = { due: now(s) + 3 * 86400000, delivered: false };
    }
    if (b.revelation && !b.revelation.delivered && now(s) >= b.revelation.due &&
      enoughContact(w, s, lead)) {
      b.revelation.delivered = true;
      add(s, lead, deeperLines[lead][0], `brick3-v8-revelation-${lead}-first`);
      v.pending.push({
        id: `brick3-v8-revelation-${lead}-followup`, lead,
        lines: deeperLines[lead].slice(1), due: now(s) + 5500, index: 0,
      });
    }
  }
}
function enoughContact(w: Work, s: Runtime, lead: V8Lead) {
  return (w.data.kakao ?? []).some(m => m.title === lead)
    && (s.messages.kakao ?? []).some(m => m.title === lead && m.outgoing)
    && !(s.messages.kakao ?? []).filter(m => m.title === lead && m.outgoing).slice(-1)
      .some(m => /不要聯絡|不要再傳|不要再找|別再找|封鎖/.test(m.body));
}
export function tickV8Life(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo" || w.mode === "explore") return s;
  const life = init(s);
  observeKnownEvents(s);
  tickRevelations(w, s);
  // Night scenes are opt-in dialogue branches, not fabricated meetings.
  if (now(s) - life.lastOfferAt < 2 * 86400000) return s;
  for (const n of NIGHTS) {
    if (life.nightOffers[n.id] || !enoughContact(w, s, n.lead)) continue;
    const h = hour(s);
    if (!(h >= n.start && h <= n.end)) continue;
    if (n.id === "NIGHT_07" && !(s.brick3Memory ?? []).some(m => m.thread === n.lead && m.topic === "conflict")) continue;
    if (n.id === "NIGHT_06" && V8_LEADS.filter(x => enoughContact(w, s, x)).length < 2) continue;
    life.nightOffers[n.id] = "offered";
    life.lastOfferAt = now(s);
    add(s, n.lead, n.lines[0], `brick3-v8-night-${n.id}-opening`);
    s.choices.push(
      { label: `${n.lead}｜聊聊今晚的事`, target: `brick3-night:${n.id}:accept` },
      { label: `${n.lead}｜今晚先不聊`, target: `brick3-night:${n.id}:decline` },
    );
    break;
  }
  return s;
}
export function chooseV8Life(w: Work, state: Runtime, id: string): Runtime | null {
  if (!id.startsWith("brick3-night:")) return null;
  if (w.id !== "between-the-lines-b-demo") return state;
  if (!state.choices.some(c => c.target === id)) return state;
  const [, eventId, option] = id.split(":");
  const n = NIGHTS.find(e => e.id === eventId);
  if (!n) return state;
  const s = structuredClone(state), life = init(s);
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-night:${eventId}:`));
  life.nightOffers[eventId] = option === "accept" ? "completed" : "declined";
  if (option === "accept") {
    const v = ensureV8(s);
    v.pending.push({ id: `brick3-v8-night-${eventId}-reply`, lead: n.lead,
      lines: n.lines.slice(1), due: now(s) + 3500, index: 0 });
    if (!v.nights.includes(eventId)) v.nights.push(eventId);
  }
  return s;
}
/** A deeper observation requires two verified clues or an actual conversation. */
export function askV8Psychology(s: Runtime, lead: V8Lead, question: string) {
  if (!/你想要什麼|你需要什麼|你怎麼了|最近怎麼樣/.test(question)) return false;
  const v = ensureV8(s), b = v.bonds[lead];
  if (!b.psychologicalObservation) b.psychologicalObservation = psychological[lead];
  return true;
}
