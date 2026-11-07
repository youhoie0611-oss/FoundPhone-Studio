import { brick3ChoiceMap, brick3PhotoMap } from "./brick3CausalRegistry";
import { emptyStoryLedger, type StoryEvent, type EventStatus } from "./brick3CausalEvents";
import type { Item, Runtime, Work } from "./schema";

const LEADS: Record<string, string> = {
  "沈硯舟": "shen_yanzhou", "裴知聿": "pei_zhiyu", "祁野": "qi_ye",
  "顧時安": "gu_shian", "陸沉川": "lu_chenchuan",
};
function at(s: Runtime, w?: Work) {
  return `${s.date ?? w?.phone.date ?? "2026-11-03"}T${/^\d{2}:\d{2}$/.test(s.time) ? s.time : "12:00"}:00+08:00`;
}
function ensure(s: Runtime, id: string, characterId: string, status: EventStatus, timestamp: string): StoryEvent {
  s.brick3Ledger ??= emptyStoryLedger();
  const prior = s.brick3Ledger.events[id];
  if (prior) return prior;
  const created: StoryEvent = {
    id, characterId, status, startsAt: timestamp, endsAt: timestamp,
    prerequisites: [], followUps: [], photoIds: [], history: [{ at: timestamp, status }],
  };
  s.brick3Ledger.events[id] = created;
  return created;
}
function transition(e: StoryEvent, status: EventStatus, timestamp: string) {
  if (e.status === status || e.status === "completed" || e.status === "declined" || e.status === "missed") return;
  e.status = status;
  e.history.push({ at: timestamp, status });
}
const eventKey = (id: string) => `kkt:photo:${id}`;
function knownChoice(target: string) {
  const authored = brick3ChoiceMap.get(target);
  if (authored) return { characterId: authored.event.characterId, eventId: authored.event.id, kind: authored.event.kind, branch: authored.choice.branch, topic: authored.choice.topic };
  // Other pre-existing Brick3 scripted relationship and character choices are also retained.
  const explicit = Object.entries(LEADS).find(([name, code]) => target.includes(name) || target.includes(code) || target.includes(code.split("_")[0]));
  if (explicit) return { characterId: explicit[1], eventId: target.replace(/-(choice|option|reply)-.*$/, ""), kind: "choice", branch: "", topic: "" };
  if (/^(brick3-(?:v8:|clash:|intimacy:|night:)|reply-(?:shen|pei|qi|gu|lu)-|phase[23]-(?:shen|pei|qi|gu|lu)-)/.test(target))
    return { characterId: "shared", eventId: target.split(":").slice(0,-1).join(":") || target, kind: "choice", branch: "", topic: "" };
  return null;
}
/** Persist actual player-selected choices, including dynamically offered character options. */
export function recordBrick3AuthoredChoice(w: Work, previous: Runtime, next: Runtime, target: string): Runtime {
  if (w.id !== "between-the-lines-b-demo" || next === previous || !previous.choices.some(c => c.target === target)) return next;
  const match = knownChoice(target);
  if (!match) return next;
  const label = previous.choices.find(c => c.target === target)?.label ?? "";
  const timestamp = at(next,w);
  const id = match.kind === "photo" ? eventKey(match.eventId) :
    match.kind === "invitation" ? `kkt:invitation:${match.eventId}` : `kkt:branch:${match.eventId}`;
  const event = ensure(next,id,match.characterId,"active",timestamp);
  // Never overwrite actual attendance with a choice to accept an invitation.
  const declined = /^(decline|boundary|not_attend)$/.test(match.branch) || /不想|不要|先不|不方便|保持距離|不去了|來不及/.test(label);
  if (match.kind !== "invitation") transition(event,declined ? "declined" : "completed",timestamp);
  event.outcome = match.branch || target;
  event.choiceId = target;
  event.choiceLabel = label;
  if (match.topic) event.topic = match.topic;
  const targetNode = w.nodes.find(node => node.id === target);
  if (targetNode) event.nextNodeIds = [...new Set([...(event.nextNodeIds ?? []),...targetNode.next])];
  const released = next.unlocked.filter(id => !previous.unlocked.includes(id));
  const published = Object.entries(next.messages).flatMap(([app,items]) =>
    items.filter(item => !(previous.messages[app] ?? []).some(old => old.id === item.id)).map(item => item.id));
  event.resultMessageIds = [...new Set([...(event.resultMessageIds ?? []),...released,...published])];
  event.history.push({ at: timestamp, status: event.status });
  next.brick3Ledger!.delivered = [...new Set([...next.brick3Ledger!.delivered, `choice:${target}`])];
  return next;
}
function attachMedia(s: Runtime, timestamp: string, item: Item) {
  if (item.outgoing || item.kind !== "image") return;
  const id = item.meta?.photoEventId || item.meta?.photoId;
  if (!id) return;
  const meta = brick3PhotoMap.get(id);
  const lead = LEADS[item.title] ?? LEADS[item.sender] ?? meta?.characterId;
  if (!lead) return;
  const ev = ensure(s,eventKey(id),lead,"active",timestamp);
  if (ev.status === "not_started") transition(ev,"active",timestamp);
  const photoId = item.meta?.photoId || meta?.photoIds[0] || item.id;
  if (!ev.photoIds.includes(photoId)) ev.photoIds.push(photoId);
  if (!ev.sourceMessageIds?.includes(item.id)) ev.sourceMessageIds = [...(ev.sourceMessageIds ?? []),item.id];
}
/** Connect only media actually delivered in KKT; registry entries alone are not photos or memories. */
export function reconcileBrick3KktMedia(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo") return s;
  const timestamp = at(s,w);
  for (const item of s.messages.kakao ?? []) attachMedia(s,timestamp,item);
  // Skipped V6 scenes cannot be treated as player-viewed photographs.
  for (const id of s.brick3PeiV6?.skippedPhotoIds ?? []) {
    if (s.brick3Ledger?.events[eventKey(id)]) continue;
    const skipped = ensure(s,eventKey(id),"pei_zhiyu","expired",timestamp);
    skipped.outcome = "skipped_without_player_response";
  }
  for (const item of w.data.kakao ?? []) {
    if (item.hidden && !s.unlocked.includes(item.id)) continue;
    if (s.hidden.includes(item.id)) continue;
    attachMedia(s,timestamp,item);
  }
  return s;
}
/** Free-form KKT replies must be bound to currently pending authored photo questions. */
export function recordBrick3PhotoTextReply(s: Runtime, thread: string, text: string, beforeChoices: {label:string;target:string}[]): void {
  if (!LEADS[thread]) return;
  const activePhotoId = [...(s.messages.kakao ?? [])].reverse().find(m =>
    !m.outgoing && m.title === thread && !!m.meta?.photoEventId)?.meta?.photoEventId;
  const latest = [...beforeChoices].reverse().find(c => {
    const match = brick3ChoiceMap.get(c.target);
    return match?.event.kind === "photo" && match.event.characterId === LEADS[thread] &&
      (!activePhotoId || match.event.id === activePhotoId);
  });
  if (!latest) return;
  const match = brick3ChoiceMap.get(latest.target)!;
  const timestamp = at(s);
  const event = ensure(s,eventKey(match.event.id),LEADS[thread],"active",timestamp);
  const declined = /不要再傳|別再傳|不要聯絡|別找我|不想看|別傳照片|保持距離/.test(text);
  transition(event,declined ? "declined" : "completed",timestamp);
  event.outcome = declined ? "player_boundary" : "player_free_reply";
  event.choiceLabel = text;
}
