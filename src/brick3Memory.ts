import { makeItem, type Runtime, type Work } from "./schema";

export type Brick3Memory = {
  thread: string;
  topic: "invitation" | "conflict" | "jealousy" | "personal";
  status: string;
  text: string;
  at: number;
  followUpAt?: number;
  followedUp?: boolean;
  resolution?: "reconciled" | "boundary" | "unresolved";
};
const cast = new Set(["沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川", "林安", "周予晴", "陳以衡", "許棠", "下班後五人組"]);
const followUps: Record<string, Record<string, string>> = {
  "沈硯舟": { conflict: "我想了想剛才的事。妳不舒服的地方，我會記住。下次我先問清楚。", jealousy: "關於那張照片，我不該讓妳覺得需要向我交代。", invitation: "之前提到的安排，妳不用急著答應。有確定時間我們再說。" },
  "裴知聿": { conflict: "妳說的話我有認真想過。以前我總想替妳做決定，這次我不會。", jealousy: "我知道我沒有資格干涉妳和誰出去。剛才那樣問，是我失了分寸。", invitation: "上次的邀約我記得。妳的決定我會尊重，不會當作沒聽見。" },
  "祁野": { conflict: "上次那件事，是我說話太衝。妳不想再提我就不提。", jealousy: "那天我說話有點酸，妳別誤會，我沒打算管妳。", invitation: "那個約我沒忘。妳要是不方便，就改天再說。" },
  "林安": { conflict: "昨天妳說的我想過了。我不會再替妳做決定。", invitation: "之前那攤聚會，我先照妳的意思安排。時間有變會再告訴妳。" },
};
function classify(raw: string, context: string): Brick3Memory["topic"] | null {
  if (/吵架|生氣|道歉|對不起|傷害|騙我|說謊|不尊重|失望|冷靜/.test(raw)) return "conflict";
  if (/吃醋|嫉妒|他是誰|她是誰|跟誰出去|在意他|在意她/.test(raw)) return "jealousy";
  if (/邀約|聚餐|聚會|約會|吃飯|見面|市集|展覽|週五|週末|活動/.test(context) &&
      /不去|不能去|沒空|不方便|不想|改天|下次|先不|我去|我會去|可以|好啊|幾點|時間|在哪|地點/.test(raw)) return "invitation";
  if (/我喜歡|我討厭|我害怕|我最近|我工作|我生日|我住在/.test(raw)) return "personal";
  return null;
}
export function rememberBrick3Reply(state: Runtime, thread: string, raw: string, context: string): void {
  if (!cast.has(thread)) return;
  const prior = (state.brick3Memory ?? []).find(m => m.thread === thread && (m.topic === "conflict" || m.topic === "jealousy"));
  const topic = classify(raw, context) ?? (prior && /原諒|沒關係|保持距離|不要再問|我們談談/.test(raw) ? prior.topic : null);
  if (!topic) return;
  const now = state.elapsedMs ?? 0;
  const status = /不去|不能去|沒空|不方便|不想|不要|拒絕|改天|下次|先不/.test(raw) ? "declined"
    : /對不起|抱歉/.test(raw) ? "apologized"
    : /幾點|時間|在哪|地點/.test(raw) ? "asked_details"
    : /^(好|好啊|好呀|可以|我去|我會去)/.test(raw) ? "interested" : "expressed";
  const records = state.brick3Memory ?? [];
  // A new decision supersedes the previous one for the same topic and character.
  const updated = records.filter(m => !(m.thread === thread && m.topic === topic));
  const resolution = /保持距離|不要再問|不想聊|不要聯絡/.test(raw) ? "boundary" : /原諒|沒關係|抱歉|對不起|我們談談/.test(raw) ? "reconciled" : "unresolved";
  updated.push({ thread, topic, status, text: raw, at: now, resolution,
    followUpAt: topic === "personal" || resolution === "boundary" ? undefined : now + 86400000 });
  if (topic === "conflict" || topic === "jealousy") state.variables[`brick3:relationship:${thread}:${topic}`] = resolution;
  state.brick3Memory = updated.slice(-80);
}
export function tickBrick3Memory(work: Work, state: Runtime): Runtime {
  if (work.id !== "between-the-lines-b-demo") return state;
  const now = state.elapsedMs ?? 0;
  for (const memory of state.brick3Memory ?? []) {
    if (memory.followedUp || memory.followUpAt === undefined || now < memory.followUpAt) continue;
    memory.followedUp = true;
    const styles: Record<string, [string, string]> = {
      "沈硯舟": ["我有聽進去妳說的話。下次我會先問清楚。", "我想了一晚，還是想好好聽妳說。"],
      "裴知聿": ["妳願意談，我很珍惜。但以前的問題不會因為一句話就消失。", "分手的原因我沒有忘。妳不需要現在就回答我。"],
      "祁野": ["行，妳說的我聽到了。我也有不對的地方。", "那天我嘴太快了。妳要生氣就生氣，我不會催妳。"],
    };
    const pair = styles[memory.thread];
    const line = memory.topic === "conflict" && pair
      ? pair[memory.resolution === "reconciled" ? 0 : 1]
      : followUps[memory.thread]?.[memory.topic];
    if (!line) continue;
    // Avoid an automatic follow-up after the player asked for no further contact.
    if (/不要再聯絡|別再傳|不要聯絡|別找我/.test(memory.text)) continue;
    const body = memory.topic === "invitation" && memory.status === "declined"
      ? memory.thread === "裴知聿" ? "上次妳說不想去，我記得。我不會再催妳。" : "上次妳說不方便，我記得。這次先不算妳，之後有變再說。"
      : line;
    state.messages.kakao ??= [];
    const id = `brick3-memory-${memory.thread}-${memory.topic}-${memory.at}`;
    if (state.messages.kakao.some(item => item.id === id)) continue;
    state.messages.kakao.push(makeItem({ id, title: memory.thread, sender: memory.thread, body,
      time: `${state.date ?? work.phone.date ?? "2026-11-03"} ${state.time}` }));
    state.notifications.push(`${memory.thread}：${body}`);
  }
  return state;
}
