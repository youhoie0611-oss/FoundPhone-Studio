import { makeItem, type Runtime, type Work } from "./schema";
import { ensureV8, type V8Lead } from "./brick3Relationships";

export type OvernightPhase = "invited" | "accepted" | "arrived" | "morning" | "departed" | "declined";
export type OvernightRecord = {
  id: string; lead: V8Lead; phase: OvernightPhase; createdAt: number;
  arrivedAt?: number; arrivedDate?: string; morningAt?: number; departedAt?: number;
  morningChoice?: "a" | "b" | "c" | "d"; followUpSent?: boolean;
};
export type OvernightState = { version: 1; records: OvernightRecord[] };
const MIN_SLEEP = 6 * 3600000;
const leads: Record<string, V8Lead> = {
  shen_night_view_outing: "沈硯舟", pei_dinner_outing: "裴知聿",
  qi_city_lights_outing: "祁野", gu_architecture_walk: "顧時安",
  // The legacy outing ID does not validate its outdated photo-exhibition story.
  lu_photo_exhibit: "陸沉川",
};
const scenes: Record<V8Lead, { opening: string[]; options: [string, string, string][]; follow: string }> = {
  "沈硯舟": { opening: ["妳醒了？", "我本來想先去買早餐，結果鬧鐘被我按掉兩次。"],
    options: [["你不是說今天早八？", "十點才有課。昨天說早八的是下週。", "a"], ["那我們一起去買吧。", "好，樓下那間蛋餅妳想吃嗎？", "b"], ["你繼續睡，我先走了。", "等一下，我送妳下樓就回來睡。", "c"], ["你是不是故意賴床？", "被妳發現了。但真的只多睡了十分鐘。", "d"]],
    follow: "妳到家了嗎？今天的照片我還在整理。" },
  "裴知聿": { opening: ["妳還是會把水杯放在床頭那邊。", "……我以為妳早就改了。"],
    options: [["這只是習慣而已。", "嗯。我知道。只是我記得。", "a"], ["你一直記得這些？", "有些事不是想忘就忘得掉。", "b"], ["我們不要再提以前了。", "好。那就不提。", "c"], ["你今天不用去研究室？", "下午才有討論。上午的時間是空的。", "d"]],
    follow: "到了嗎？不用急著回我。" },
  "祁野": { opening: ["冰箱沒什麼東西。", "樓下有早餐店。妳要吃什麼？"],
    options: [["你不是說不用特別準備？", "順便買的，不行？", "a"], ["你會買早餐？", "我又不是不會走路。", "b"], ["我先回去，今天有事。", "行。要我叫車嗎？", "c"], ["你要不要一起吃？", "走啊。我又沒說不去。", "d"]],
    follow: "早餐店那個東西還不錯。下次妳自己挑。" },
  "顧時安": { opening: ["我先把咖啡煮好了。", "妳今天幾點要出門？"],
    options: [["九點半之前。", "那時間夠，先吃一點再走？", "a"], ["你今天不用去工地？", "下午才去現場，上午先整理圖面。", "b"], ["我想再睡一下。", "好。我在書房，不吵妳。", "c"], ["昨晚那件事，我想再談談。", "可以。妳想先從哪裡說？", "d"]],
    follow: "今天工作還順利嗎？" },
  "陸沉川": { opening: ["醒了？", "早餐在廚房。", "我九點有會議，妳不用跟著早起。"],
    options: [["你每天都這麼早起？", "工作日差不多。週末沒這麼準時。", "a"], ["你做了什麼早餐？", "吐司、煎蛋。咖啡還沒煮，妳要喝再開。", "b"], ["那我再睡一下，等你出門。", "嗯。門不用反鎖。", "c"], ["我也差不多該回去了。", "好。我送妳到樓下。", "d"]],
    follow: "醒了嗎？早餐有吃？" },
};
export function ensureOvernight(s: Runtime): OvernightState {
  return s.brick3Overnight ??= { version: 1, records: [] };
}
function send(s: Runtime, lead: V8Lead, body: string, id: string, outgoing = false) {
  s.messages.kakao ??= [];
  if (s.messages.kakao.some(m => m.id === id)) return;
  s.messages.kakao.push(makeItem({ id, title: lead, sender: outgoing ? "我" : lead, body, outgoing,
    time: `${s.date ?? "2026-11-06"} ${s.time}`, meta: { source: "brick3-overnight" } }));
  if (!outgoing) s.notifications.push(`${lead}：${body}`);
}
function options(s: Runtime, record: OvernightRecord, choices: [string, string][]) {
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-overnight:${record.id}:`));
  s.choices.push(...choices.map(([action, label]) => ({ target: `brick3-overnight:${record.id}:${action}`, label: `${record.lead}｜${label}` })));
}
function stopped(s: Runtime, lead: V8Lead) {
  return (s.messages.kakao ?? []).filter(m => m.title === lead && m.outgoing).slice(-1)
    .some(m => /不要再聯絡|不要聯絡|別再找|封鎖|停止聯絡/.test(m.body));
}
export function tickOvernight(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo" || w.mode === "explore") return s;
  const state = ensureOvernight(s), now = s.elapsedMs ?? 0;
  for (const [outing, lead] of Object.entries(leads)) {
    const visit = s.brick3Invites?.[outing];
    if (!visit?.completed || visit.completedAtMs === undefined || now < visit.completedAtMs + 60000 ||
      state.records.some(r => r.id === outing) || stopped(s, lead)) continue;
    const bond = ensureV8(s).bonds[lead];
    if (!["ambiguous", "dating", "secret"].includes(bond.status)) continue;
    const record: OvernightRecord = { id: outing, lead, phase: "invited", createdAt: now };
    state.records.push(record);
    send(s, lead, "今晚如果妳願意，可以留下來。妳不想也沒關係。", `brick3-overnight-${outing}-invite`);
    options(s, record, [["accept", "考慮留下過夜"], ["decline", "今晚先回去"]]);
  }
  for (const record of state.records) {
    if (record.phase === "arrived" && record.arrivedAt !== undefined && now >= record.arrivedAt + MIN_SLEEP && record.arrivedDate !== (s.date ?? w.phone.date)) {
      record.phase = "morning"; record.morningAt = now;
      scenes[record.lead].opening.forEach((line, i) => send(s, record.lead, line, `brick3-overnight-${record.id}-morning-${i}`));
      options(s, record, scenes[record.lead].options.map(([label, , key]) => [key, label]));
    }
    if (record.phase === "departed" && record.departedAt !== undefined &&
      !record.followUpSent && now >= record.departedAt + 3 * 3600000 && !stopped(s, record.lead)) {
      record.followUpSent = true;
      send(s, record.lead, scenes[record.lead].follow, `brick3-overnight-${record.id}-followup`);
    }
  }
  return s;
}
export function chooseOvernight(w: Work, previous: Runtime, target: string): Runtime | null {
  if (!target.startsWith("brick3-overnight:")) return null;
  if (w.id !== "between-the-lines-b-demo" || !previous.choices.some(c => c.target === target)) return previous;
  const [, id, action] = target.split(":");
  const s = structuredClone(previous), record = ensureOvernight(s).records.find(r => r.id === id);
  if (!record || stopped(s, record.lead)) return previous;
  const now = s.elapsedMs ?? 0;
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-overnight:${id}:`));
  if (record.phase === "invited") {
    if (action !== "accept" && action !== "decline") return previous;
    record.phase = action === "accept" ? "accepted" : "declined";
    send(s, record.lead, action === "accept" ? "我可以留下，但還要確認安排。" : "我今晚先回去。", `brick3-overnight-${id}-player-invite`, true);
    send(s, record.lead, action === "accept" ? "好。妳確定要留下，再告訴我。" : "好，路上小心。", `brick3-overnight-${id}-answer`);
    if (action === "accept") options(s, record, [["arrive", "確認今晚確實留下"], ["cancel", "改變主意，今晚離開"]]);
  } else if (record.phase === "accepted") {
    if (action !== "arrive" && action !== "cancel") return previous;
    record.phase = action === "arrive" ? "arrived" : "declined";
    if (action === "arrive") { record.arrivedAt = now; record.arrivedDate = s.date ?? w.phone.date; }
    send(s, record.lead, action === "arrive" ? "我今晚會留下。" : "我改變主意，今晚還是回去。", `brick3-overnight-${id}-player-arrival`, true);
    send(s, record.lead, action === "arrive" ? "好。要不要先喝點水？" : "好，我尊重妳的決定。", `brick3-overnight-${id}-arrival-answer`);
   } else if (record.phase === "morning" && record.morningChoice) {
    if (action !== "leave" && action !== "stay") return previous;
    if (action === "leave") { record.phase = "departed"; record.departedAt = now; }
    else send(s, record.lead, "好，妳慢慢來。", `brick3-overnight-${id}-stay`);
  } else if (record.phase === "morning") {
    const choice = scenes[record.lead].options.find(x => x[2] === action);
    if (!choice) return previous;
    record.morningChoice = action as OvernightRecord["morningChoice"];
    send(s, record.lead, choice[0], `brick3-overnight-${id}-player-morning`, true);
    send(s, record.lead, choice[1], `brick3-overnight-${id}-morning-answer`);
    const leaving = (record.lead === "陸沉川" && action === "d") ||
      (record.lead === "沈硯舟" && action === "c") || (record.lead === "祁野" && action === "c");
    if (leaving) { record.phase = "departed"; record.departedAt = now; }
    else options(s, record, [["leave", "確認離開"], ["stay", "再待一會"]]);
  }
  return s;
}
