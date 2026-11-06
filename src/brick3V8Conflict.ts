import { makeItem, type Runtime, type Work } from "./schema";
import { ensureV8, V8_LEADS, type V8Lead } from "./brick3Relationships";

type Encounter = {
  id: string;
  lead: V8Lead;
  other: V8Lead;
  nickname: string;
  status: "awaiting" | "honest" | "pause" | "vague" | "boundary";
  at: number;
};
export type V8ConflictState = { encounters: Encounter[] };
const nicknames = ["寶貝", "親愛的", "老婆", "小朋友", "笨蛋"];
const now = (s: Runtime) => s.elapsedMs ?? 0;
function store(s: Runtime) { return s.brick3V8Conflict ??= { encounters: [] }; }
const priorIncoming = (s: Runtime, lead: V8Lead) => (s.messages.kakao ?? []).filter(
  m => m.title === lead && !m.outgoing && !!m.body.trim(),
);
const hardStop = (s: Runtime, lead: V8Lead) => (s.messages.kakao ?? [])
  .filter(m => m.title === lead && m.outgoing).slice(-1)
  .some(m => /不要再聯絡|不要聯絡|不要再傳|別再找|封鎖/.test(m.body));
function send(s: Runtime, lead: V8Lead, body: string, id: string, outgoing = false) {
  s.messages.kakao ??= [];
  if (s.messages.kakao.some(m => m.id === id)) return;
  s.messages.kakao.push(makeItem({
    id, title: lead, sender: outgoing ? "我" : lead, body, outgoing,
    time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-v8-clash" },
  }));
  if (!outgoing) s.notifications.push(`${lead}：${body}`);
}
/**
 * A clash requires (1) both romances, (2) a documented information source,
 * (3) the same nickname in messages actually delivered to the player, and
 * (4) public/shared exposure. No mind reading or fabricated encounters.
 */
export function tickV8Conflict(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo" || w.mode === "explore") return s;
  const v = ensureV8(s), state = store(s);
  const leads = V8_LEADS.filter(lead => ["dating", "secret"].includes(v.bonds[lead].status));
  const sharedEvidence = (Object.values(s.brick3DateSocial ?? {})).some(x => x.posted);
  if (!sharedEvidence) return s;
  for (const lead of leads) {
    if (hardStop(s, lead)) continue;
    for (const other of leads) {
      if (lead === other || !v.bonds[lead].knows[other]) continue;
      const id = `same-nickname:${lead}:${other}`;
      if (state.encounters.some(e => e.id === id)) continue;
      const nickname = nicknames.find(word => priorIncoming(s, lead).some(m => m.body.includes(word)) &&
        priorIncoming(s, other).some(m => m.body.includes(word)));
      if (!nickname) continue;
      state.encounters.push({ id, lead, other, nickname, status: "awaiting", at: now(s) });
      send(s, lead, `剛才我聽到${other}也叫妳「${nickname}」。為什麼他也這樣叫妳？`,
        `brick3-v8-clash-${id}`);
      s.choices.push(...([
        ["honest", "說清楚目前的關係"],
        ["pause", "請他先冷靜，之後再談"],
        ["vague", "先模糊帶過"],
        ["boundary", "不在公開場合解釋"],
      ] as const).map(([option, label]) => ({
        label: `${lead}｜${label}`, target: `brick3-clash:${id}:${option}`,
      })));
      return s; // At most one new confrontation per tick.
    }
  }
  return s;
}
export function chooseV8Conflict(w: Work, previous: Runtime, target: string): Runtime | null {
  if (!target.startsWith("brick3-clash:")) return null;
  if (w.id !== "between-the-lines-b-demo") return previous;
  if (!previous.choices.some(c => c.target === target)) return previous;
  const s = structuredClone(previous), v = ensureV8(s), state = store(s);
  const parts = target.split(":");
  const id = parts.slice(1, -1).join(":");
  const action = parts.at(-1);
  const encounter = state.encounters.find(e => e.id === id && e.status === "awaiting");
  if (!encounter || !["honest", "pause", "vague", "boundary"].includes(action ?? "")) return previous;
  encounter.status = action as Encounter["status"];
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-clash:${id}:`));
  const player: Record<string, string> = {
    honest: "我會把我們目前的關係說清楚。",
    pause: "我們先不要在這裡爭論，找時間好好談。",
    vague: "只是平常的稱呼，不一定代表什麼。",
    boundary: "我現在不想在公開場合談這些事。",
  };
  const npc: Record<string, string> = {
    honest: "好，我會聽妳說。但我們原本說好的事，也需要一起面對。",
    pause: "……好。我先冷靜一下，但我們之後還是要談。",
    vague: "我聽見妳這樣說了。可我沒有完全釋懷。",
    boundary: "那我們不要在這裡說。等妳願意再談吧。",
  };
  send(s, encounter.lead, player[action], `brick3-v8-clash-player-${id}`, true);
  // Queue replies through the existing paced autonomy engine.
  v.pending.push({ id: `brick3-v8-clash-reply-${v.sequence++}`,
    lead: encounter.lead, due: now(s) + 5000,
    lines: [npc[action]], index: 0 });
  v.events.push(`clash:${id}:${action}`);
  const b = v.bonds[encounter.lead];
  if (action === "honest" && b.exclusivity === "exclusive" &&
    v.bonds[encounter.other].status === "secret") {
    b.exclusivity = "unresolved";
    if (!v.endings.includes("END_03")) v.endings.push("END_03");
    if (!s.endings.includes("END_03")) s.endings.push("END_03");
  }
  return s;
}
