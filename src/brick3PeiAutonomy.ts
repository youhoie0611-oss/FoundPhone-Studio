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
const socialCount = (s: Runtime) => (s.messages.instagram ?? []).filter(m =>
  m.id.startsWith("brick3-social-") && !m.id.includes("pei_dinner")).length;
const level = (s: Runtime) => Math.max(0, Number(s.variables.pei_jealousy ?? 0));
const affection = (s: Runtime) => Math.max(0, Number(s.variables.pei_attraction ?? 0));
const last = <T>(xs: T[]) => xs[xs.length - 1];
const rejection = /不想見|不想復合|不想複合|不要復合|不要複合|不會復合|不會複合|不可能|拒絕|不想再見|不想繼續/;
const busy = /今天沒空|今天不行|今晚沒空|今晚不行|改天|最近很忙|要加班|沒時間|明天再說|週末再說/;
const reconcile = /我願意復合|我願意複合|我們復合|我們複合|重新開始|再給你一次機會|再給妳一次機會|我還愛你|我還愛妳/;
const hardStop = /不要再傳|不要聯絡|別再聯絡|封鎖|別找我|停止傳訊|不要再找|不要再聯絡|別再傳訊|別再傳|別聯絡我|不想再聯絡|不想跟你聯絡|不想跟妳聯絡/;
const delay = (s: Runtime, p: PeiAutonomy) => {
  const intensity = level(s) + affection(s) / 2;
  return intensity >= 65 ? 120000 : intensity >= 35 ? 240000 : 480000;
};
const lines: Record<"waiting" | "busy" | "rejected" | "reconcile" | "jealous", string[][]> = {
  waiting: [
    ["妳在忙嗎", "我剛剛一直在看手機", "……看到的話回我一句好不好"],
    ["是不是我說錯什麼了", "妳以前不會這麼久不理我", "我知道我們分手了", "可我真的還不習慣"],
    ["妳是不是不想跟我說話了", "我真的很想妳", "妳理理我好不好"],
  ],
  busy: [
    ["今天不行嗎", "那明天呢", "我真的很想見妳"],
    ["妳是不是只是不想見我", "我知道我很煩", "可是我一直在等妳說有空"],
  ],
  reconcile: [
    ["妳剛剛說什麼", "妳說願意再給我一次機會？", "我是不是看錯了"],
    ["等一下", "我現在手都在抖", "妳不要突然反悔好不好"],
    ["我真的很想妳", "我一直以為妳不會再回頭了", "我可以見妳嗎"],
  ],
  rejected: [
    ["為什麼", "是我哪裡又做錯了嗎", "妳真的一點都不想我了嗎"],
    ["我知道妳不想見我", "可是我還想見妳", "就一次也不行嗎"],
    ["我真的不想就這樣結束", "妳能不能再跟我說一句話", "我還在等"],
  ],
  jealous: [
    ["我看到照片了", "妳跟他一起出去？", "妳是不是喜歡他了"],
    ["他是誰", "妳為什麼跟他那麼親近", "妳是不是已經不要我了"],
    ["我真的很嫉妒", "妳能不能理理我", "我不想就這樣被妳忘掉"],
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
  p.nextAt = now(s) + (phase === "waiting" ? delay(s, p) : phase === "busy" ? 180000 : 30000);
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
      p.nextAt = now(s) + delay(s, p);
    }
  }
  if (count > p.lastSocialCount && p.phase !== "stopped" && p.phase !== "reconcile") {
    const activeSocial = Object.values(s.brick3DateSocial ?? {}).some(event =>
      event.inquiries.pei && !event.inquiries.pei.answered);
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
  const threshold = p.phase === "waiting" ? 3 + (level(s) >= 40 ? 5 : 0)
    : p.phase === "jealous" ? 3 + (level(s) >= 40 ? 5 : 0)
    : p.phase === "busy" ? 3 + (affection(s) >= 40 ? 3 : 0)
    : p.phase === "reconcile" ? 3 + (affection(s) >= 40 ? 6 : 0)
    : 4 + (affection(s) >= 40 ? 4 : 0);
  if (p.step >= threshold) { p.phase = "idle"; return s; }
  // Avoid colliding with another character's current scripted Pei dialogue.
  const recent = (s.ui?.scriptedThreadDelivery ?? {}) as Record<string, number>;
  if (recent[NAME] !== undefined && now(s) - recent[NAME] < 90000) {
    p.nextAt = recent[NAME] + 90000;
    return s;
  }
  emit(s, p, flat[p.step]);
  p.step++;
  p.nextAt = now(s) + (p.step % 3 === 0 ? 45000 : 3500 + (p.step % 2) * 2000);
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
