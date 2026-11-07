import { makeItem, type Runtime, type Work } from "./schema";

/** Autonomous Pei reactions are saved with the game, not tied to opening KKT. */
export type PeiAutonomy = {
  lastPlayerId: string;
  lastPeiId: string;
  lastSocialCount: number;
  phase: "idle" | "waiting" | "busy" | "rejected" | "reconcile" | "jealous" | "stopped";
  pendingChoice?: string;
  startedAt: number;
  step: number;
  nextAt: number;
  cycle: number;
};

const NAME = "裴知聿";
const now = (s: Runtime) => s.elapsedMs ?? 0;
const all = (s: Runtime) => s.messages.kakao ?? [];
const player = (s: Runtime) => all(s).filter(m => m.title === NAME && m.outgoing);
const incoming = (s: Runtime) => all(s).filter(m => m.title === NAME && !m.outgoing);
// A generic photo of another lead is not proof that the player went on a date.
// Pei can only react to information that actually identifies her publicly.
const socialCount = (s: Runtime) => (s.messages.instagram ?? []).filter(m =>
  m.id.startsWith("brick3-social-") && m.sender !== NAME &&
  /妳是我(?:的)?女朋友|妳是我的戀人|我(?:和|跟)妳(?:已經)?在交往|我(?:和|跟)妳(?:已經)?在一起/.test(m.body)).length;
const level = (s: Runtime) => Math.max(0, Number(s.variables.pei_jealousy ?? 0));
const affection = (s: Runtime) => Math.max(0, Number(s.variables.pei_attraction ?? 0));
const last = <T>(xs: T[]) => xs[xs.length - 1];
const rejection = /不想見|不想復合|不想複合|不要復合|不要複合|不會復合|不會複合|不可能|拒絕|不想再見|不想繼續/;
const busy = /今天沒空|今天不行|今晚沒空|今晚不行|改天|最近很忙|要加班|沒時間|明天再說|週末再說/;
const reconcile = /我願意復合|我願意複合|我們復合|我們複合|重新開始|再給你一次機會|再給妳一次機會|我還愛你|我還愛妳/;
const hardStop = /不要再傳|不要聯絡|別再聯絡|封鎖|別找我|停止傳訊|不要再找|不要再聯絡|別再傳訊|別再傳|別聯絡我|不想再聯絡|不想跟你聯絡|不想跟妳聯絡/;
const delay = (s: Runtime) => {
  const intensity = level(s) + affection(s) / 2;
  return intensity >= 65 ? 120000 : intensity >= 35 ? 240000 : 480000;
};
const lines: Record<"waiting" | "busy" | "rejected" | "reconcile" | "jealous", string[][]> = {
  waiting: [
    ["妳在忙嗎", "……沒事。看到再回就好"],
    ["我剛剛又想起以前的事", "不過我知道妳現在有自己的安排"],
  ],
  busy: [
    ["好，今天就先不約了", "……我確實想見妳，但妳不用急著給我另一個日期"],
  ],
  reconcile: [
    ["妳剛剛說什麼", "妳說願意再給我一次機會？", "我是不是看錯了"],
    ["等一下", "我現在手都在抖", "妳不要突然反悔好不好"],
    ["我真的很想妳", "我一直以為妳不會再回頭了", "我可以見妳嗎"],
  ],
  rejected: [
    ["……我聽懂了。", "我還是會難過，但不會繼續逼妳改變答案。"],
  ],
  jealous: [
    ["我看到公開的消息了", "……所以妳真的跟他在一起了。"],
    ["我知道我們已經分手", "但說我完全不在意，那是騙妳的。"],
  ],
};

function emit(s: Runtime, p: PeiAutonomy, body: string) {
  const id = `brick3-pei-autonomy-${p.cycle}-${p.phase}-${p.step}`;
  if (all(s).some(m => m.id === id)) return;
  s.messages.kakao ??= [];
  s.messages.kakao.push(makeItem({
    id, title: NAME, sender: NAME, body,
    time: `${s.date ?? "2026-11-03"} ${s.time}`,
    meta: { source: "brick3-pei-autonomy" },
  }));
  s.notifications.push(`${NAME}：${body}`);
  p.lastPeiId = id;
}

function begin(s: Runtime, p: PeiAutonomy, phase: PeiAutonomy["phase"]) {
  p.phase = phase;
  p.startedAt = now(s);
  p.step = 0;
  p.cycle++;
  p.nextAt = now(s) + (phase === "waiting" ? delay(s) : phase === "busy" ? 180000 : 30000);
}

export function tickPeiAutonomy(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo" || w.mode === "explore") return s;
  const p = s.peiAutonomy;
  const latestPlayer = last(player(s));
  const latestPei = last(incoming(s));
  const count = socialCount(s);
  if (!p) {
    // Never fabricate retroactive messages when loading an old save.
    s.peiAutonomy = {
      lastPlayerId: latestPlayer?.id ?? "", lastPeiId: latestPei?.id ?? "",
      lastSocialCount: count, phase: "idle", startedAt: now(s),
      step: 0, nextAt: Infinity, cycle: 0,
    };
    return s;
  }
  // An ongoing dinner invitation already owns this conversation.
  // Do not interleave unrelated anxious/autonomous messages while the player
  // and Pei are negotiating whether, when, and where to meet.
  if (["invited", "reply_pending", "travel", "arrival"].includes(
    s.brick3Invites?.pei_dinner_outing?.phase ?? ""
  )) {
    p.lastPlayerId = latestPlayer?.id ?? p.lastPlayerId;
    p.lastPeiId = latestPei?.id ?? p.lastPeiId;
    p.lastSocialCount = count;
    p.phase = "idle";
    p.nextAt = Infinity;
    return s;
  }
  if (latestPlayer && latestPlayer.id !== p.lastPlayerId) {
    p.lastPlayerId = latestPlayer.id;
    const body = latestPlayer.body.trim();
    if (hardStop.test(body)) {
      p.phase = "stopped";
      p.nextAt = Infinity;
    } else if (reconcile.test(body)) begin(s, p, "reconcile");
    else if (busy.test(body)) begin(s, p, "busy");
    else if (rejection.test(body)) begin(s, p, "rejected");
    else {
      p.phase = "idle";
      p.nextAt = Infinity;
    }
  } else if (latestPei && latestPei.id !== p.lastPeiId) {
    p.lastPeiId = latestPei.id;
    // A scripted reply or active conversation supersedes any queued autonomous texts.
    if (!latestPei.id.startsWith("brick3-pei-autonomy-") && p.phase !== "stopped") {
      p.phase = "waiting";
      p.step = 0;
      p.startedAt = now(s);
      p.nextAt = now(s) + delay(s);
    }
  }
  if (count > p.lastSocialCount && p.phase !== "stopped" && p.phase !== "reconcile") {
    const activeSocial = Object.values(s.brick3DateSocial ?? {}).some(event =>
      event.inquiries.pei?.sent);
    if (activeSocial) { p.lastSocialCount = count; return s; }
    const lastContact = Number((s.ui?.lastFreeReply ?? {})[NAME] ?? -Infinity);
    if (now(s) - lastContact > 60000) begin(s, p, "jealous");
  }
  p.lastSocialCount = count;
  if (p.phase === "idle" || p.phase === "stopped") return s;
  if (now(s) < p.nextAt) return s;
  const pool = lines[p.phase];
  if (!pool || p.step >= pool.flat().length) {
    p.phase = "idle";
    return s;
  }
  // Send one bubble per tick. Do not overwhelm a chat with a single monologue.
  const flat = pool.flat();
  const threshold = p.phase === "waiting" ? (level(s) >= 40 ? 2 : 1)
    : p.phase === "jealous" ? 2
    : p.phase === "busy" ? 1
    : p.phase === "reconcile" ? 3 + (affection(s) >= 40 ? 3 : 0)
    : 1;
  if (p.step >= threshold) { p.phase = "idle"; return s; }
  // Avoid colliding with another character's current scripted Pei dialogue.
  const recent = (s.ui?.scriptedThreadDelivery ?? {}) as Record<string, number>;
  if (recent[NAME] !== undefined && now(s) - recent[NAME] < 90000) {
    p.nextAt = recent[NAME] + 90000;
    return s;
  }
  emit(s, p, flat[p.step]);
  p.step++;
  // Subsequent emotional messages are spaced out; one unanswered KKT bubble
  // must not cascade into a rapid series of pleading messages.
  p.nextAt = now(s) + (p.phase === "reconcile" ? 5500 : 30 * 60000);
  if (p.step >= threshold) p.nextAt = Infinity;
  return s;
}

export function stopPeiAutonomyOnPlayerReply(s: Runtime, thread: string) {
  if (thread !== NAME || !s.peiAutonomy) return;
  const p = s.peiAutonomy;
  const reply = last(player(s));
  if (reply && hardStop.test(reply.body)) {
    p.phase = "stopped";
    p.nextAt = Infinity;
  } else if (reply && reconcile.test(reply.body)) begin(s, p, "reconcile");
  else if (reply && busy.test(reply.body)) begin(s, p, "busy");
  else if (reply && rejection.test(reply.body)) begin(s, p, "rejected");
  else { p.phase = "idle"; p.nextAt = Infinity; }
  p.lastPlayerId = reply?.id ?? p.lastPlayerId;
}
