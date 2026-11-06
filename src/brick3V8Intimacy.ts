import { makeItem, type Runtime, type Work } from "./schema";
import { V8_LEADS, ensureV8, type V8Lead } from "./brick3Relationships";

/** Player-consented intimacy is an explicit scene outcome, never inferred from NPC text. */
export type V8IntimacyEvent = {
  id: string;
  actor: V8Lead;
  at: number;
  gameDate: string;
  status: "kissed";
  disclosedTo: V8Lead[];
  sourceOuting: string;
};
export type V8IntimacyOffer = {
  outing: string;
  actor: V8Lead;
  at: number;
  status: "offered" | "accepted" | "declined" | "postponed";
};
export type V8IntimacyState = {
  offers: V8IntimacyOffer[];
  events: V8IntimacyEvent[];
  disclosures: { eventId: string; recipient: V8Lead; at: number }[];
  suspicions?: { eventId: string; observer: V8Lead; publicSource: string; at: number }[];
  nextId: number;
};
const now = (s: Runtime) => s.elapsedMs ?? 0;
const hasStop = (s: Runtime, lead: V8Lead) => (s.messages.kakao ?? [])
  .filter(m => m.title === lead && m.outgoing).slice(-1)
  .some(m => /不要再聯絡|不要聯絡|別再找|不要再傳|封鎖/.test(m.body));
export function ensureV8Intimacy(s: Runtime): V8IntimacyState {
  return s.brick3V8Intimacy ??= { offers: [], events: [], disclosures: [], nextId: 0 };
}
function send(s: Runtime, lead: V8Lead, body: string, id: string, outgoing = false) {
  s.messages.kakao ??= [];
  if (s.messages.kakao.some(m => m.id === id)) return;
  s.messages.kakao.push(makeItem({
    id, title: lead, sender: outgoing ? "我" : lead, body, outgoing,
    time: `${s.date ?? "2026-11-06"} ${s.time}`,
    meta: { source: "brick3-v8-intimacy" },
  }));
  if (!outgoing) s.notifications.push(`${lead}：${body}`);
}
const outings: Record<string, V8Lead> = {
  shen_night_view_outing: "沈硯舟",
  pei_dinner_outing: "裴知聿",
  qi_city_lights_outing: "祁野",
  gu_architecture_walk: "顧時安",
  lu_photo_exhibit: "陸沉川",
};
const dialogue: Record<V8Lead, string> = {
  "沈硯舟": "今天跟妳在一起很開心。我有點想親妳……可以嗎？",
  "裴知聿": "我知道我們現在的關係不一樣了……可是我還是想問，可以親妳嗎？",
  "祁野": "我不是開玩笑。我想親妳，可以嗎？",
  "顧時安": "可以讓我親妳一下嗎？妳不用現在答應。",
  "陸沉川": "我想吻妳。但妳不願意的話，我不會靠近。",
};
/** Only after a player-confirmed outing, with a meaningful relationship. */
export function tickV8Intimacy(work: Work, s: Runtime): Runtime {
  if (work.id !== "between-the-lines-b-demo" || work.mode === "explore") return s;
  const state = ensureV8Intimacy(s), v = ensureV8(s);
  // Evidence-gated suspicion: publicly posted outing can prompt a question,
  // but NEVER reveal that a kiss occurred or change relationship knowledge.
  // Chance grows with elapsed game days; no public evidence means no discovery.
  state.suspicions ??= [];
  for (const e of state.events) {
    if (now(s) - e.at < 86400000) continue;
    if (!s.brick3DateSocial?.[e.sourceOuting]?.posted) continue;
    const publicPost = (s.messages.instagram ?? []).find(m =>
      m.id === `brick3-social-${e.sourceOuting}-instagram` && !m.outgoing);
    if (!publicPost) continue;
    for (const recipient of V8_LEADS) {
      if (recipient === e.actor || e.disclosedTo.includes(recipient) ||
          !["dating", "secret"].includes(v.bonds[recipient].status) ||
          hasStop(s, recipient) ||
          state.suspicions.some(x => x.eventId === e.id && x.observer === recipient)) continue;
      const days = Math.floor((now(s) - e.at) / 86400000);
      const seed = [...(`${e.id}:${recipient}`)].reduce((n, c) =>
        (Math.imul(n, 33) + c.charCodeAt(0)) >>> 0, 5381) % 100;
      if (seed >= Math.min(85, 12 + days * 9)) continue;
      state.suspicions.push({
        eventId: e.id, observer: recipient, at: now(s), publicSource: publicPost.id,
      });
      send(s, recipient, recipient === "裴知聿"
        ? `我看到${e.actor}那天的公開限動了。妳們是不是變得很親近？我有點在意。`
        : `我看見${e.actor}那天公開的動態了。你們現在的關係是什麼？`,
        `brick3-v8-kiss-suspicion-${e.id}-${recipient}`);
      // This is a question, not a declaration of discovering a kiss.
      break;
    }
  }
  for (const [outing, lead] of Object.entries(outings) as [string, V8Lead][]) {
    const visit = s.brick3Invites?.[outing];
    if (!visit?.completed || visit.completedAtMs === undefined) continue;
    if (now(s) < visit.completedAtMs + 15 * 60000) continue;
    if (state.offers.some(x => x.outing === outing)) continue;
    if (hasStop(s, lead)) continue;
    const bond = v.bonds[lead];
    const base: Record<V8Lead, string> = {
      "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi",
      "顧時安": "gu", "陸沉川": "lu",
    };
    const closeness = Number(s.variables[base[lead] + "_attraction"] ?? 0);
    if (!["ambiguous", "dating", "secret"].includes(bond.status) && closeness < 70) continue;
    state.offers.push({ outing, actor: lead, at: now(s), status: "offered" });
    send(s, lead, dialogue[lead], `brick3-v8-intimacy-offer-${outing}`);
    s.choices.push(...([
      ["accept", "願意親吻"],
      ["decline", "拒絕親吻"],
      ["postpone", "想再慢慢來"],
    ] as const).map(([action, label]) => ({
      target: `brick3-intimacy:${outing}:${action}`,
      label: `${lead}｜${label}`,
    })));
  }
  return s;
}
function activePartners(s: Runtime) {
  const v = ensureV8(s);
  return V8_LEADS.filter(lead => ["dating", "secret"].includes(v.bonds[lead].status));
}
/** State transition only from a displayed, explicit option. */
export function chooseV8Intimacy(work: Work, previous: Runtime, target: string): Runtime | null {
  if (!target.startsWith("brick3-intimacy:")) return null;
  if (work.id !== "between-the-lines-b-demo" || !previous.choices.some(c => c.target === target))
    return previous;
  const [, outing, action] = target.split(":");
  if (!["accept", "decline", "postpone"].includes(action)) return previous;
  const s = structuredClone(previous), state = ensureV8Intimacy(s);
  const offer = state.offers.find(x => x.outing === outing && x.status === "offered");
  if (!offer || hasStop(s, offer.actor)) return previous;
  s.choices = s.choices.filter(c => !c.target.startsWith(`brick3-intimacy:${outing}:`));
  offer.status = action === "accept" ? "accepted" : action === "decline" ? "declined" : "postponed";
  const lead = offer.actor;
  send(s, lead,
    action === "accept" ? "我願意。" : action === "decline" ? "我不想親吻。" : "我想再慢慢來。",
    `brick3-v8-intimacy-player-${outing}`, true);
  if (action !== "accept") {
    ensureV8(s).pending.push({
      id: `brick3-v8-intimacy-answer-${outing}`, lead,
      due: now(s) + 3500, index: 0,
      lines: [action === "decline" ? "我知道了，不會勉強妳。" : "好，我們照妳舒服的步調來。"],
    });
    return s;
  }
  const id = `brick3-v8-kiss-${++state.nextId}`;
  state.events.push({
    id, actor: lead, at: now(s), gameDate: s.date ?? work.phone.date ?? "",
    status: "kissed", disclosedTo: [], sourceOuting: outing,
  });
  const v = ensureV8(s);
  v.events.push(`kiss:${lead}:${id}`);
  v.pending.push({
    id: `brick3-v8-intimacy-answer-${outing}`, lead,
    due: now(s) + 3500, index: 0,
    lines: [lead === "裴知聿" ? "……妳真的願意。剛剛那一刻，我差點不敢相信。" : "謝謝妳願意。這件事對我很重要。"],
  });
  return s;
}
/** Disclosure is optional; other partners do not learn by magic. */
export function discloseV8Kiss(previous: Runtime, id: string, recipient: V8Lead): Runtime | null {
  const s = structuredClone(previous), state = ensureV8Intimacy(s);
  const e = state.events.find(x => x.id === id);
  if (!e || recipient === e.actor || !activePartners(s).includes(recipient) ||
      e.disclosedTo.includes(recipient)) return null;
  e.disclosedTo.push(recipient);
  state.disclosures.push({ eventId: id, recipient, at: now(s) });
  send(s, recipient, `我想主動告訴你，我和${e.actor}在${e.gameDate}接吻了。`,
    `brick3-v8-kiss-disclose-${id}-${recipient}`, true);
  const v = ensureV8(s), bond = v.bonds[recipient];
  bond.knows[e.actor] = { status: "kissed", source: "player-confession", at: now(s) };
  if (bond.exclusivity === "exclusive") {
    bond.exclusivity = "unresolved";
    if (!v.events.includes(`kiss-broken-exclusivity:${recipient}:${id}`))
      v.events.push(`kiss-broken-exclusivity:${recipient}:${id}`);
  }
  v.pending.push({
    id: `brick3-v8-kiss-recipient-${id}-${recipient}`,
    lead: recipient, due: now(s) + 5000, index: 0,
    lines: [recipient === "裴知聿"
      ? "……我知道了。我很在意，可是我現在需要一點時間。"
      : "謝謝妳自己告訴我。我需要先想想我們原本的約定。"],
  });
  return s;
}
