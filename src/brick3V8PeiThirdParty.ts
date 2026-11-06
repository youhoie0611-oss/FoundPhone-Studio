import { makeItem, type Runtime, type Work } from "./schema";
import { ensureV8, offerV8Confession, V8_LEADS } from "./brick3Relationships";

/**
 * Pei's third-party route requires actual knowledge and a long-standing
 * interpersonal history. Silence is NOT consent, and a no-contact request
 * permanently halts this branch until the player explicitly reinitiates it.
 */
export type V8PeiThirdParty = {
  phase: "unaware" | "aware" | "testing" | "waiting" | "offered" | "stopped";
  currentPartner: string;
  knowledgeSource: string;
  noticedAt: number;
  nextAt: number;
  sentIds: string[];
  lastPlayerMessageId: string;
};
const NAME = "裴知聿";
const DAY = 86400000;
const now = (s: Runtime) => s.elapsedMs ?? 0;
const hardStop = /不要再傳|不要聯絡|不要再聯絡|不想再聯絡|別再找|別找我|封鎖|停止傳訊|不想再談|不要追我/;
const consent = /^(好啊|願意|同意|可以|我願意)/;
const genuineContact = (s: Runtime) => (s.messages.kakao ?? []).filter(m =>
  m.title === NAME && m.outgoing && m.meta.source !== "brick3-v8-player" &&
  !m.id.startsWith("brick3-v8-disclosure-"));
const last = <T>(a: T[]) => a[a.length - 1];
function send(s: Runtime, body: string, id: string) {
  s.messages.kakao ??= [];
  if (s.messages.kakao.some(m => m.id === id)) return;
  s.messages.kakao.push(makeItem({
    id, title: NAME, sender: NAME, body,
    time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-v8-pei-third-party" },
  }));
  s.notifications.push(`${NAME}：${body}`);
}
function findKnowledge(s: Runtime) {
  const v = ensureV8(s);
  const pei = v.bonds[NAME];
  for (const lead of V8_LEADS) {
    if (lead === NAME || !["dating", "secret"].includes(v.bonds[lead].status)) continue;
    const known = pei.knows[lead];
    // Explicitly disclosed relationship or evidence-backed recognition only.
    if (known && known.source && known.source !== "rumor") return { lead, source: known.source };
  }
  return null;
}
export function tickV8PeiThirdParty(work: Work, s: Runtime): Runtime {
  if (work.id !== "between-the-lines-b-demo" || work.mode === "explore") return s;
  const v = ensureV8(s);
  const relationship = v.bonds[NAME];
  const conf = v.confessions[NAME];
  const currentReply = last(genuineContact(s));
  const p = s.brick3V8PeiThirdParty ??= {
    phase: "unaware", currentPartner: "", knowledgeSource: "",
    noticedAt: now(s), nextAt: now(s) + DAY,
    sentIds: [], lastPlayerMessageId: currentReply?.id ?? "",
  };
  // Respect a permanent no-contact boundary even across reloads.
  const stopped = genuineContact(s).some(m => hardStop.test(m.body));
  if (p.phase === "stopped" || stopped || (v.events ?? []).includes("boundary:裴知聿")) {
    p.phase = "stopped"; p.nextAt = Infinity;
    return s;
  }
  if (relationship.status === "dating" || relationship.status === "secret" ||
      conf?.status === "accepted" || conf?.status === "declined" ||
      conf?.status === "withdrawn" || conf?.status === "discussing") return s;
  const fact = findKnowledge(s);
  if (!fact) return s;
  const messages = genuineContact(s);
  // No automated pursuit before actual player-authored conversation.
  if (messages.length < 3 || !(s.messages.kakao ?? []).some(m => m.title === NAME && !m.outgoing)) return s;
  // Being ignored cannot increase affection or count as another affirmative reply.
  const attraction = Number(s.variables.pei_attraction ?? 0);
  if (attraction < 35 || !Number.isFinite(attraction)) return s;
  if (p.currentPartner !== fact.lead) {
    p.currentPartner = fact.lead;
    p.knowledgeSource = fact.source;
    p.noticedAt = now(s);
    p.nextAt = now(s) + DAY;
    p.phase = "aware";
  }
  // Silence pauses new persuasion. At most one initial observation and
  // one later question; the confession is still optional for him.
  if (now(s) < p.nextAt) return s;
  if (p.phase === "aware") {
    const id = `brick3-v8-pei-third-party-aware-${fact.lead}`;
    send(s, "我知道妳現在有交往的人。我其實一直在想，要怎麼跟妳說話才不會讓妳困擾。", id);
    p.sentIds.push(id);
    p.phase = "testing";
    p.nextAt = now(s) + 2 * DAY;
    return s;
  }
  if (p.phase === "testing") {
    const id = `brick3-v8-pei-third-party-testing-${fact.lead}`;
    send(s, "我還是會在意妳。不過我也知道，不能只因為我放不下，就要妳給我答案。", id);
    p.sentIds.push(id);
    p.phase = "waiting";
    p.nextAt = now(s) + DAY;
    return s;
  }
  if (p.phase === "waiting") {
    // No response since these messages: don't escalate to a secret offer.
    const repliedAfter = messages.some(m => m.id !== p.lastPlayerMessageId &&
      (s.messages.kakao ?? []).findIndex(x => x.id === m.id) >
      (s.messages.kakao ?? []).findIndex(x => x.id === p.sentIds[p.sentIds.length - 1]));
    if (!repliedAfter) return s;
    p.lastPlayerMessageId = last(messages)?.id ?? p.lastPlayerMessageId;
    if (attraction < 50) return s;
    // Pei can willingly lower his requirements, but only asks; never sets a bond.
    if (offerV8Confession(work, s, NAME, "secret-offer")) {
      p.phase = "offered"; p.nextAt = Infinity;
    }
  }
  return s;
}
/** Player reply can only stop pursuit or keep an already existing route alive. */
export function observeV8PeiThirdPartyReply(s: Runtime, raw: string) {
  const p = s.brick3V8PeiThirdParty;
  if (!p) return;
  if (hardStop.test(raw)) {
    p.phase = "stopped"; p.nextAt = Infinity;
    return;
  }
  // Only player-authored statements may establish known relationship facts.
  // The player's own bond record is not automatically visible to Pei.
  const v = ensureV8(s);
  for (const lead of V8_LEADS) {
    if (lead === NAME || !["dating", "secret"].includes(v.bonds[lead].status)) continue;
    const normalized = raw.replace(/\s+/g, "");
    const explicitPartner = normalized.includes(`我和${lead}在交往`) ||
      normalized.includes(`我跟${lead}交往中`) ||
      normalized.includes(`我跟${lead}在一起`) ||
      normalized.includes(`${lead}是我男朋友`) ||
      normalized.includes(`${lead}是我的男友`) ||
      normalized.includes(`${lead}是我的戀人`);
    if (explicitPartner)
      v.bonds[NAME].knows[lead] = { status: v.bonds[lead].status, source: "player-message", at: now(s) };
  }
  // Explicit consent to speak is not consent to date or kiss.
  if (consent.test(raw) && p.phase === "waiting") p.nextAt = Math.min(p.nextAt, now(s));
}
