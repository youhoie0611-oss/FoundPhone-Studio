import { makeItem, type Runtime, type Work } from "./schema";

/** V8 save-backed relationship engine. No singleton "current boyfriend" field. */
export const V8_LEADS = [
  "沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川",
] as const;
export type V8Lead = typeof V8_LEADS[number];
export type Bond = "single" | "ambiguous" | "dating" | "secret" | "separated";
export type Exclusivity = "unspecified" | "exclusive" | "nonexclusive" | "unresolved";
export type Relationship = {
  status: Bond;
  exclusivity: Exclusivity;
  since: number;
  history: { at: number; status: Bond; reason: string }[];
  knows: Record<string, { status: string; source: string; at: number }>;
  core: 0 | 1 | 2 | 3 | 4;
  discoveries: string[];
  specialization: Record<string, number>;
  careerExperience: Record<string, number>;
  revelation?: { due: number; delivered: boolean };
  psychologicalObservation?: string;
};
export type Confession = {
  from: V8Lead;
  at: number;
  deadline: number;
  status: "pending" | "accepted" | "declined" | "withdrawn" | "discussing";
  kind: "confession" | "secret-offer";
  resolutionIntent?: "only";
};
export type Negotiation = {
  lead: V8Lead;
  approach: "full" | "status" | "test";
  status: "pending" | "accepted" | "conditional" | "needs-time" | "rejected";
  at: number;
};
export type V8RelationshipState = {
  version: 8;
  createdAt: number;
  bonds: Record<V8Lead, Relationship>;
  confessions: Partial<Record<V8Lead, Confession>>;
  negotiations: Partial<Record<V8Lead, Negotiation>>;
  pending: { id: string; lead: V8Lead; due: number; lines: string[]; index: number }[];
  events: string[];
  endings: string[];
  nights: string[];
  lastDay: string;
  sequence: number;
  legacyReview?: { candidates: V8Lead[]; reviewed: V8Lead[]; completed: boolean };
  undo?: { at: number; snapshot: Record<V8Lead, Relationship>; used: boolean; messageCount: number; outgoingId?: string };
};
const DAY = 86400000;
const NOW = (s: Runtime) => s.elapsedMs ?? 0;
const stopPattern = /不要再傳|不要再聯絡|不要聯絡|別聯絡|不要再找|別再找|封鎖|停止傳訊|不要追我/;
const nameKnown = (w: Work, lead: string) => (w.data.kakao ?? []).some(m => m.title === lead);
const hasStop = (s: Runtime, lead: string) => (s.messages.kakao ?? [])
  .filter(m => m.outgoing && m.title === lead).slice(-1).some(m => stopPattern.test(m.body));
const neutral = (): Relationship => ({
  status: "single", exclusivity: "unspecified", since: 0, history: [],
  knows: {}, core: 0, discoveries: [], specialization: {}, careerExperience: {},
});
export function ensureV8(s: Runtime): V8RelationshipState {
  if (!s.brick3V8) {
    // Old saves: never invent existing relationships or erase existing chat history.
    s.brick3V8 = {
      version: 8, createdAt: NOW(s),
      bonds: Object.fromEntries(V8_LEADS.map(n => [n, neutral()])) as Record<V8Lead, Relationship>,
      confessions: {}, negotiations: {}, pending: [], events: [], endings: [],
      nights: [], lastDay: s.date ?? "", sequence: 0,
    };
    const prefixes: Record<V8Lead, string> = {
      "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi", "顧時安": "gu", "陸沉川": "lu",
    };
    // Only explicit legacy relationship markers may enter restoration review.
    // Ambiguous affection, jealousy or numeric progress never proves dating.
    const candidates = V8_LEADS.filter(n => {
      const value = String(s.variables[prefixes[n] + "_relationship_definition"] ?? "");
      return /^(dating|partner|exclusive|lover|正式交往|戀人)$/i.test(value);
    });
    if (candidates.length) s.brick3V8.legacyReview = {
      candidates, reviewed: [], completed: false,
    };
  }
  // Incremental migration: V8 saves from earlier development snapshots may
  // contain fewer than five leads or omit newly added collections. Preserve
  // every existing relationship and conversation as-is.
  const v = s.brick3V8;
  v.bonds ??= {} as Record<V8Lead, Relationship>;
  v.confessions ??= {};
  v.negotiations ??= {};
  v.pending ??= [];
  v.events ??= [];
  v.endings ??= [];
  v.nights ??= [];
  v.sequence ??= 0;
  v.createdAt ??= NOW(s);
  v.lastDay ??= s.date ?? "";
  for (const lead of V8_LEADS) {
    v.bonds[lead] ??= neutral();
    const b = v.bonds[lead];
    b.history ??= [];
    b.knows ??= {};
    b.core ??= 0;
    b.discoveries ??= [];
    b.specialization ??= {};
    b.careerExperience ??= {};
    b.exclusivity ??= "unspecified";
    b.since ??= NOW(s);
  }
  return v;
}
function unique(s: Runtime, name: V8Lead, body: string, id: string) {
  s.messages.kakao ??= [];
  if (s.messages.kakao.some(m => m.id === id)) return;
  s.messages.kakao.push(makeItem({
    id, title: name, sender: name, body, time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-v8" },
  }));
  s.notifications.push(`${name}：${body}`);
}
function queue(s: Runtime, lead: V8Lead, lines: string[], wait = 4000) {
  const v = ensureV8(s);
  v.pending.push({
    id: `v8-${++v.sequence}`, lead, due: NOW(s) + wait,
    lines, index: 0,
  });
}
function choices(s: Runtime, lead: V8Lead, entries: [string, string][]) {
  s.choices = s.choices.filter(x => !x.target.startsWith(`brick3-v8:${lead}:`));
  s.choices.push(...entries.map(([suffix, label]) => ({
    label: `${lead}｜${label}`, target: `brick3-v8:${lead}:${suffix}`,
  })));
}
function saveUndo(s: Runtime) {
  const v = ensureV8(s);
  v.undo = { at: NOW(s), snapshot: structuredClone(v.bonds), used: false, messageCount: (s.messages.kakao ?? []).filter(m => m.meta.source === "brick3-v8" && !m.outgoing).length };
}
function change(s: Runtime, lead: V8Lead, status: Bond, reason: string, exclusivity?: Exclusivity) {
  const v = ensureV8(s), b = v.bonds[lead];
  if (b.status !== status) {
    b.status = status;
    b.since = NOW(s);
    b.history.push({ at: NOW(s), status, reason });
  }
  if (exclusivity) b.exclusivity = exclusivity;
}
function event(s: Runtime, id: string) {
  const v = ensureV8(s);
  if (!v.events.includes(id)) v.events.push(id);
}
const live = (b: Relationship) => b.status === "dating" || b.status === "secret";
function partners(v: V8RelationshipState, except?: V8Lead) {
  return V8_LEADS.filter(n => n !== except && live(v.bonds[n]));
}
export function offerV8Confession(w: Work, s: Runtime, lead: V8Lead, kind: Confession["kind"] = "confession"): boolean {
  if (w.id !== "between-the-lines-b-demo" || !nameKnown(w, lead) || hasStop(s, lead)) return false;
  const v = ensureV8(s);
  if (v.confessions[lead]?.status === "pending" || live(v.bonds[lead])) return false;
  const at = NOW(s);
  v.confessions[lead] = { from: lead, at, deadline: at + 14 * DAY, status: "pending", kind };
  const opening = kind === "secret-offer"
    ? ["我知道妳已經有男朋友了。", "我沒有資格要求妳選我。", "可是……如果只能不公開地在一起，我也想問妳願不願意。"]
    : lead === "裴知聿"
      ? ["我還想和妳重新開始。", "不是要妳現在就原諒我。", "妳願意再給我們一次機會嗎？"]
      : [`我想把我們的關係說清楚。`, "我喜歡妳。", "妳願意和我交往嗎？"];
  queue(s, lead, opening, 0);
  choices(s, lead, [
    ["only", "選擇他，另行處理現有關係"],
    ["poly", "提議公開非排他關係"],
    ["later", "先維持現狀，之後答覆"],
    ["reject", "拒絕"],
    ["secret", "提議秘密交往"],
    ["ambiguous", "先維持曖昧"],
  ]);
  event(s, `confession:${lead}:${at}`);
  return true;
}
function beginNegotiation(s: Runtime, lead: V8Lead) {
  choices(s, lead, [["full", "全部坦白"], ["status", "先說明已有戀人"], ["test", "先試探想法"]]);
}
function reconcilePoly(s: Runtime, lead: V8Lead, approach: Negotiation["approach"]) {
  const v = ensureV8(s), b = v.bonds[lead];
  // Characters may change their minds after substantial trust and revealed
  // history. Scores alone never guarantee assent; only a conditional TALK.
  const prefix: Record<V8Lead, string> = {
    "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi",
    "顧時安": "gu", "陸沉川": "lu",
  };
  const trust = Number(s.variables[prefix[lead] + "_trust"] ?? 0);
  const earnedFlexibility = b.core >= 3 && trust >= 75 &&
    b.history.some(h => h.status === "ambiguous" || h.status === "dating");
  const response: Negotiation["status"] =
    approach === "test" ? "needs-time"
    : lead === "祁野" || lead === "裴知聿" ?
      earnedFlexibility && approach === "full" ? "conditional" : "rejected"
    : lead === "沈硯舟" ? "conditional"
    : approach === "full" ? "conditional" : "needs-time";
  v.negotiations[lead] = { lead, approach, status: response, at: NOW(s) };
  const words: Record<Negotiation["status"], string[]> = {
    accepted: ["我願意談談我們怎麼安排。"],
    conditional: ["我不是完全不能理解。", "可是我需要知道我們各自的界線，不能什麼都不說清楚。"],
    "needs-time": ["我聽到了。", "我還需要時間想想，現在不能答應妳。"],
    rejected: lead === "裴知聿"
      ? ["我做不到那麼大方。", "我知道自己會一直在意……我不想騙妳我能接受。"]
      : ["我不願意用這樣的方式交往。", "妳不用因為我的決定放棄自己的選擇。"],
    pending: [],
  };
  queue(s, lead, words[response]);
  // Conditions are not consent: only explicit subsequent confirmation may update the bond.
  if (response === "conditional") {
    b.exclusivity = "unresolved";
    choices(s, lead, [["agree-boundaries", "接受他的界線，繼續協商"], ["reject-boundaries", "不接受條件"]]);
  }
  event(s, `negotiation:${lead}:${response}`);
}
function recordV8PlayerMessage(s: Runtime, lead: V8Lead, body: string): string {
  const v = ensureV8(s);
  const id = `brick3-v8-player-${++v.sequence}`;
  s.messages.kakao ??= [];
  s.messages.kakao.push(makeItem({
    id, title: lead, sender: "我", body, outgoing: true,
    time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-v8-player" },
  }));
  if (v.undo && !v.undo.used && v.undo.at === NOW(s)) v.undo.outgoingId = id;
  return id;
}
export function chooseV8(w: Work, previous: Runtime, target: string): Runtime | null {
  if (!target.startsWith("brick3-v8:")) return null;
  const s = structuredClone(previous), v = ensureV8(s);
  if (w.id !== "between-the-lines-b-demo") return s;
  const [, leadName, action] = target.split(":");
  if (!V8_LEADS.includes(leadName as V8Lead) || !s.choices.some(c => c.target === target)) return s;
  const lead = leadName as V8Lead;
  const conf = v.confessions[lead];
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-v8:${lead}:`));
  if (action === "agree-boundaries" || action === "reject-boundaries") {
    recordV8PlayerMessage(s, lead, action === "agree-boundaries" ? "我願意和你一起把界線談清楚。" : "這些條件我無法接受。");
    const n = v.negotiations[lead];
    if (!n || n.status !== "conditional") return s;
    if (action === "reject-boundaries") {
      n.status = "rejected";
      queue(s, lead, ["我知道了。", "那我們暫時不要勉強彼此。"]);
    } else {
      n.status = "accepted";
      // Existing partners must still separately consent before any agreement becomes global.
      const others = partners(v, lead);
      const allAgree = others.every(x =>
        (v.negotiations[x]?.status === "accepted" || v.bonds[x].exclusivity === "nonexclusive") &&
        V8_LEADS.filter(y => y !== x && (y === lead || others.includes(y)))
          .every(y => !!v.bonds[x].knows[y]));
      if (allAgree) {
        saveUndo(s);
        change(s, lead, "dating", "mutually-agreed-poly", "nonexclusive");
        others.forEach(x => { v.bonds[x].exclusivity = "nonexclusive"; });
        queue(s, lead, ["我願意試著和妳一起把界線說清楚。", "但如果有不舒服的地方，我們要能再談。"]);
      } else queue(s, lead, ["我願意試試。", "不過其他當事人也需要自己決定，不能只靠我們說了算。"]);
    }
    return s;
  }
  if (action === "full" || action === "status" || action === "test") {
    const knownPartners = partners(v, lead);
    const disclosure = knownPartners.length
      ? `我想坦白，我和${knownPartners.join("、")}目前也有戀愛關係。`
      : "我想坦白自己對戀愛關係的期待。";
    recordV8PlayerMessage(s, lead, action === "full" ? disclosure : action === "status" ?
      "我目前也有其他戀愛關係，想和你談談。" : "你怎麼看非排他關係？");
    if (action === "full") {
      // Explicitly revealing the names updates knowledge for THIS listener only.
      for (const other of knownPartners)
        v.bonds[lead].knows[other] = {
          status: v.bonds[other].status, source: "player-confession", at: NOW(s),
        };
    }
    reconcilePoly(s, lead, action); return s;
  }
  if (action === "undo") {
    undoV8Decision(s, lead);
    return s;
  }
  if (!conf || conf.status !== "pending") return s;
  // A decision interrupts the question sequence; NPC must wait for the player.
  v.pending = v.pending.filter(p => p.lead !== lead);
  if (NOW(s) > conf.deadline) { conf.status = "withdrawn"; return s; }
  if (action === "later") {
    recordV8PlayerMessage(s, lead, "我需要一點時間考慮，現在還無法答覆。");
    // Remains pending until the 14-day deadline; do not erase a real choice.
    queue(s, lead, ["……好。", "我會給妳一點時間。"]);
    choices(s, lead, [["only", "選擇他"], ["poly", "協商非排他關係"], ["reject", "拒絕"], ["secret", "秘密交往"], ["ambiguous", "先維持曖昧"]]);
    return s;
  }
  if (action === "poly") {
    recordV8PlayerMessage(s, lead, "我想和你討論能不能建立非排他的戀愛關係。");
    conf.status = "discussing";
    beginNegotiation(s, lead);
    return s;
  }
  if (action === "reject") {
    recordV8PlayerMessage(s, lead, "謝謝你告訴我，但我不能接受這份告白。");
    conf.status = "declined";
    queue(s, lead, lead === "裴知聿" ? ["……我知道了。", "我現在有點難受。", "我不會當成妳還答應了什麼。"] : ["我明白了。", "謝謝妳願意直接告訴我。"]);
    event(s, `rejected:${lead}`);
    return s;
  }
  if (action === "ambiguous") {
    conf.status = "discussing";
    saveUndo(s);
    recordV8PlayerMessage(s, lead, "我對你有好感，但現在不想確認交往。");
    change(s, lead, "ambiguous", "player-ambiguous");
    queue(s, lead, ["好，那就先這樣。", "我們不用現在把話說死。"]);
    return s;
  }
  if (action === "only") {
    // Refuse silent replacement. Do not commit new exclusive relationship while another is active.
    if (partners(v, lead).length) {
      recordV8PlayerMessage(s, lead, "我想選擇你，但得先處理原本的關係。");
      conf.status = "discussing";
      conf.resolutionIntent = "only";
      queue(s, lead, ["我聽見妳的意思了。", "不過妳現在的關係還在。", "我們把事情說清楚，再決定要不要正式交往。"]);
      event(s, `relationship-must-resolve:${lead}`);
      return s;
    }
    saveUndo(s);
    recordV8PlayerMessage(s, lead, "我願意和你正式交往。");
    conf.status = "accepted";
    change(s, lead, "dating", "player-accepted", "exclusive");
    queue(s, lead, ["妳是認真的嗎？", "……我很高興。", "那我們好好開始。"]);
    choices(s, lead, [["undo", "撤銷今日尚未對外公開的關係標記"]]);
    return s;
  }
  if (action === "secret") {
    // Candidate can refuse on their own terms.
    if (lead === "顧時安" || lead === "沈硯舟") {
      recordV8PlayerMessage(s, lead, "我想先秘密交往，你願意嗎？");
      conf.status = "declined";
      queue(s, lead, ["我不想讓其他人一直被蒙在鼓裡。", "我願意談清楚，但不能直接答應秘密交往。"]);
    } else {
      saveUndo(s);
      recordV8PlayerMessage(s, lead, "我想先秘密地和你交往，你願意嗎？");
      conf.status = "accepted";
      change(s, lead, "secret", "explicit-mutual-secret-choice", "unresolved");
      queue(s, lead, lead === "裴知聿"
        ? ["……真的可以嗎？", "我知道這不公平。", "可是我還是想留在妳身邊。"]
        : ["我知道妳現在的狀況。", "我們都需要想清楚這件事會有什麼後果。"]);
      event(s, `secret-started:${lead}`);
    }
    return s;
  }
  return s;
}
/** Available as a direct, game-time event hook, never tied to opening a chat. */
export function tickV8(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo" || w.mode === "explore") return s;
  const v = ensureV8(s);
  const now = NOW(s);
  for (const lead of V8_LEADS) {
    const c = v.confessions[lead];
    if (c && c.status === "pending" && now > c.deadline) {
      c.status = "withdrawn";
      s.choices = s.choices.filter(x => !x.target.startsWith(`brick3-v8:${lead}:`));
      queue(s, lead, ["我想了很久。", "之前那個問題不用回答了。", "我也需要把自己的日子過好。"]);
      event(s, `expired:${lead}`);
    }
  }
  // Autonomous delivery of one bubble at a time, with no KKT-open requirement.
  for (const p of v.pending.slice()) {
    if (p.due > now) continue;
    if (hasStop(s, p.lead)) {
      v.pending = v.pending.filter(x => x.id !== p.id); continue;
    }
    const body = p.lines[p.index];
    if (body) unique(s, p.lead, body, `${p.id}-${p.index}`);
    p.index++;
    if (p.index >= p.lines.length) v.pending = v.pending.filter(x => x.id !== p.id);
    else p.due = now + 4200;
  }
  // Confessions require an actual history of interaction, not affection alone.
  for (const lead of V8_LEADS) {
    const b = v.bonds[lead];
    if (live(b) || v.confessions[lead] || hasStop(s, lead) || !nameKnown(w, lead)) continue;
    const outgoing = (s.messages.kakao ?? []).filter(m => m.outgoing && m.title === lead);
    const evidence = (s.brick3Memory ?? []).some(m => m.thread === lead && m.topic !== "invitation");
    const prefix: Record<V8Lead, string> = { "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi", "顧時安": "gu", "陸沉川": "lu" };
    const attraction = Number(s.variables[prefix[lead] + "_attraction"] ?? 0);
    const asked = outgoing.some(m => /我們交往|願意和我交往|願意跟我交往|我們復合|我們複合|正式在一起/.test(m.body));
    const wellKnown = outgoing.length >= 3 && evidence && attraction >= 75;
    if (asked || (wellKnown && !(lead === "裴知聿" && partners(v, lead).length > 0))) {
      const secret = lead === "裴知聿" && partners(v, lead).length > 0 && attraction >= 50;
      offerV8Confession(w, s, lead, secret ? "secret-offer" : "confession");
    }
  }
  if (s.date && s.date !== v.lastDay) {
    v.lastDay = s.date;
    const active = partners(v);
    if (active.length === 1 && v.bonds[active[0]].status === "dating") markEnding(s, "END_01");
    if (active.length >= 2 && active.every(n => v.bonds[n].status === "dating" &&
      v.bonds[n].exclusivity === "nonexclusive")) markEnding(s, "END_02");
    for (const lead of V8_LEADS) {
      const b = v.bonds[lead], confession = v.confessions[lead];
      if (b.status === "secret" && active.length >= 2) markEnding(s, "END_11", lead);
      if (confession?.status === "withdrawn" && v.events.some(e => e.startsWith(`expired:${lead}`)))
        markEnding(s, "END_05");
      if (confession?.status === "declined" && b.status === "single" &&
        now - confession.at >= 7 * DAY &&
        (s.messages.kakao ?? []).filter(m => m.title === lead && m.outgoing).length >= 3)
        markEnding(s, "END_06");
    }
    if (v.bonds["裴知聿"].status === "dating" &&
      (v.bonds["裴知聿"].history.some(h => h.status === "separated") ||
        s.variables["brick3:scene:裴知聿"] === "conversation_open"))
      markEnding(s, "END_04");
    if (active.length === 0 && now - v.createdAt >= 30 * DAY &&
      (s.messages.kakao ?? []).some(m => m.outgoing)) markEnding(s, "END_07");
    if ((s.brick3Memory ?? []).some(m =>
      m.topic === "conflict" && m.resolution === "reconciled") &&
      (s.brick3DateSocial && Object.keys(s.brick3DateSocial).length > 0))
      markEnding(s, "END_08");
    // END_10 is reserved for a completed five-lead crossover event, not
    // simply having received one message from each male lead.
    if (v.events.includes("large-event:five-leads:completed"))
      markEnding(s, "END_10");
  }
  return s;
}
function markEnding(s: Runtime, id: string, lead?: V8Lead) {
  const v = ensureV8(s);
  if (id === "END_11" && lead !== "裴知聿") return;
  if (!v.endings.includes(id)) v.endings.push(id);
  if (!s.endings.includes(id)) s.endings.push(id);
}
export function observeV8Reply(s: Runtime, thread: string, raw: string) {
  if (!V8_LEADS.includes(thread as V8Lead)) return;
  const lead = thread as V8Lead, v = ensureV8(s), b = v.bonds[lead];
  if (stopPattern.test(raw)) {
    v.pending = v.pending.filter(x => x.lead !== lead);
    const c = v.confessions[lead];
    if (c?.status === "pending") c.status = "withdrawn";
    s.choices = s.choices.filter(x => !x.target.startsWith(`brick3-v8:${lead}:`));
    event(s, `boundary:${lead}`);
    return;
  }
  // The player can start a discussion, but not make a one-sided relationship official.
  if (/公開|告訴他|跟他坦白|和他坦白/.test(raw) && b.status === "secret") {
    queue(s, lead, ["妳想把我們的關係說清楚嗎？", "我願意聽，但我也有自己的顧慮。"]);
  }
}
/** The player's discovery, not a debug view of an NPC's private thoughts. */
export function discoverV8Core(s: Runtime, lead: V8Lead, clue: string) {
  const b = ensureV8(s).bonds[lead];
  if (!clue || b.discoveries.includes(clue)) return b.core;
  b.discoveries.push(clue);
  b.core = Math.min(4, b.discoveries.length) as Relationship["core"];
  return b.core;
}

/** Retract an unsent relationship update; never erase another person's memory. */
export function undoV8Decision(s: Runtime, lead?: V8Lead): boolean {
  const v = ensureV8(s), undo = v.undo;
  if (!undo || undo.used || NOW(s) - undo.at >= DAY) return false;
  const affected = V8_LEADS.filter(n => JSON.stringify(v.bonds[n]) !== JSON.stringify(undo.snapshot[n]));
  if (!affected.length || (lead && !affected.includes(lead))) return false;
  // As soon as a response arrived, rollback must use an explicit story checkpoint instead.
  const hasDeliveredReaction = (s.messages.kakao ?? []).filter(m => m.meta.source === "brick3-v8" && !m.outgoing).length !== undo.messageCount;
  if (hasDeliveredReaction) return false;
  v.bonds = structuredClone(undo.snapshot);
  if (undo.outgoingId) {
    const message = (s.messages.kakao ?? []).find(m => m.id === undo.outgoingId);
    if (message) message.body = "已撤回這次關係決定";
  }
  v.pending = v.pending.filter(p => !affected.includes(p.lead));
  affected.forEach(n => {
    if (v.confessions[n]?.status === "accepted") {
      v.confessions[n]!.status = "pending";
      choices(s, n, [
        ["only", "選擇他"], ["poly", "協商非排他關係"],
        ["reject", "拒絕"], ["secret", "秘密交往"], ["ambiguous", "先維持曖昧"],
      ]);
    }
  });
  undo.used = true;
  event(s, "undo-unpublished-relationship");
  return true;
}
/** Player-initiated disclosure from the private relationship card. */
export function discloseV8Relationship(s: Runtime, to: V8Lead): boolean {
  const v = ensureV8(s), partner = v.bonds[to];
  if (!live(partner)) return false;
  const other = partners(v, to);
  const undisclosed = other.filter(name => !partner.knows[name]);
  if (!undisclosed.length) return false;
  // A disclosure is a real player-authored KKT statement, not NPC telepathy.
  const body = `我想跟你說清楚，我和${undisclosed.join("、")}也有感情關係。`;
  s.messages.kakao ??= [];
  s.messages.kakao.push(makeItem({
    id: `brick3-v8-disclosure-${to}-${NOW(s)}`, title: to, sender: "我", body,
    outgoing: true, time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-v8-player-disclosure" },
  }));
  for (const name of undisclosed) {
    partner.knows[name] = { status: v.bonds[name].status, source: "player-confession", at: NOW(s) };
  }
  const lines = to === "裴知聿"
    ? ["……妳有別人了。", "我知道妳說出來不是容易的事。", "可是我真的會在意，我現在需要想一想。"]
    : to === "祁野"
    ? ["妳現在才告訴我？", "我得想清楚我們要怎麼辦。"]
    : ["謝謝妳自己告訴我。", "我需要時間想想現在的關係和我們原本的約定。"];
  queue(s, to, lines);
  if (partner.exclusivity === "exclusive") {
    partner.exclusivity = "unresolved";
    event(s, `broken-exclusive-promise:${to}`);
    if (!v.endings.includes("END_03")) v.endings.push("END_03");
    if (!s.endings.includes("END_03")) s.endings.push("END_03");
  }
  event(s, `disclosed:${to}:${undisclosed.join("+")}`);
  return true;
}

/** Existing lovers can initiate their own negotiation without a fresh confession. */
export function requestV8Negotiation(s: Runtime, lead: V8Lead): boolean {
  const v = ensureV8(s);
  if (!live(v.bonds[lead])) return false;
  beginNegotiation(s, lead);
  event(s, `requested-negotiation:${lead}`);
  return true;
}

/** One-time, evidence-based recovery for old relationship markers. */
export function reviewV8LegacyRelationship(s: Runtime, lead: V8Lead, confirm: boolean): boolean {
  const v = ensureV8(s), review = v.legacyReview;
  if (!review || review.completed || !review.candidates.includes(lead) ||
    review.reviewed.includes(lead)) return false;
  review.reviewed.push(lead);
  if (confirm) change(s, lead, "dating", "legacy-confirmed-by-player", "unresolved");
  if (review.reviewed.length === review.candidates.length) review.completed = true;
  event(s, `legacy-reviewed:${lead}:${confirm ? "yes" : "no"}`);
  return true;
}

/** A consensual player-initiated breakup, scoped to one partner only. */
export function endV8Relationship(s: Runtime, lead: V8Lead): boolean {
  const v = ensureV8(s), b = v.bonds[lead];
  if (!(b.status === "dating" || b.status === "secret")) return false;
  const previousExclusivity = b.exclusivity;
  // Relationship termination is a delivered message, not reversible by the day's local undo.
  recordV8PlayerMessage(s, lead, "我想清楚了，我希望我們結束交往。");
  v.undo = undefined;
  change(s, lead, "separated", "player-explicit-breakup", "unspecified");
  v.pending = v.pending.filter(p => p.lead !== lead);
  queue(s, lead, lead === "裴知聿"
    ? ["……妳真的決定了？", "我很難接受。", "可是我聽到了，不能當作妳沒有說。"]
    : previousExclusivity === "exclusive"
      ? ["我知道了。", "我需要時間消化，但會尊重妳的決定。"]
      : ["我們需要重新整理這段關係。", "我知道了。"]);
  for (const conf of Object.values(v.confessions)) {
    if (conf?.status === "discussing" && conf.resolutionIntent === "only" &&
      !partners(v, conf.from).length && !hasStop(s, conf.from)) {
      conf.status = "pending";
      conf.deadline = NOW(s) + 14 * DAY;
      choices(s, conf.from, [
        ["only", "確認選擇他"], ["later", "再考慮一下"], ["reject", "拒絕告白"],
      ]);
    }
  }
  event(s, `breakup:${lead}:${NOW(s)}`);
  return true;
}
