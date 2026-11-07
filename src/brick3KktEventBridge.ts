import { reconcileBrick3KktMedia } from "./brick3CausalIntegration";
import { emptyStoryLedger, type EventStatus, type StoryEvent } from "./brick3CausalEvents";
import type { Runtime, Work } from "./schema";

/** Bridges legacy KKT activity flows to a durable Brick3 event ledger.
 * Existing chat scheduling remains authoritative until date-specific event plans are authored.
 */
const cast: Record<string, string> = {
  "沈硯舟": "shen_yanzhou", "裴知聿": "pei_zhiyu", "祁野": "qi_ye",
  "顧時安": "gu_shian", "陸沉川": "lu_chenchuan",
};
function clock(s: Runtime, w: Work): string {
  const date = s.date ?? w.phone.date;
  const time = /^\d{2}:\d{2}$/.test(s.time) ? s.time : "12:00";
  return `${date}T${time}:00+08:00`;
}
function record(s: Runtime, id: string, characterId: string, status: EventStatus, at: string, choice?: "accept" | "decline" | "attend" | "miss" | "postpone") {
  s.brick3Ledger ??= emptyStoryLedger();
  const previous = s.brick3Ledger.events[id];
  if (previous?.status === status && previous.playerChoice === choice) return;
  const next: StoryEvent = previous
    ? { ...previous, status, playerChoice: choice ?? previous.playerChoice, attended: status === "completed" ? true : status === "declined" || status === "missed" ? false : previous.attended,
      history: [...previous.history, { at, status, choice }] }
    : { id, characterId, status, startsAt: at, endsAt: at, prerequisites: [], followUps: [], photoIds: [],
      playerChoice: choice, attended: status === "completed" ? true : status === "declined" || status === "missed" ? false : undefined,
      history: [{ at, status, choice }] };
  s.brick3Ledger.events[id] = next;
}
/** Called after each choice, free-text reply, and game-clock tick; works with closed chats. */
export function syncBrick3KktEvents(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo") return s;
  const at = clock(s, w);
  for (const [id, p] of Object.entries(s.brick3Invites ?? {})) {
    // Legacy restored completions have no verified attendance record.
    if (p.completed && p.completedAtMs === undefined && !s.brick3Ledger?.events[`kkt:invitation:${id}`]) continue;
    const key = `kkt:invitation:${id}`;
    const prior = s.brick3Ledger?.events[key];
    let status: EventStatus;
    let choice: "accept" | "decline" | "attend" | undefined;
    if (p.completed && p.completedAtMs !== undefined) { status = "completed"; choice = "attend"; }
    else if (p.responseMode === "decline" || (p.phase === "idle" && p.responseMode === undefined && p.responseAtMs === undefined && prior?.status === "declined")) { status = "declined"; choice = "decline"; }
    else if (p.responseMode === "accept" || p.phase === "travel") { status = "scheduled"; choice = "accept"; }
    else if (p.phase === "arrival" || p.responseMode === "arrival_yes" || p.responseMode === "arrival_no") { status = "active"; }
    else if (p.phase === "invited" || p.phase === "reply_pending") { status = "active"; }
    else if (p.phase === "idle" && prior?.status === "active") { status = "declined"; choice = "decline"; }
    else continue;
    const thread = (s.messages.kakao ?? []).find(m => m.meta?.photoEventId === id)?.title ?? "";
    const characterId = cast[thread] ?? prior?.characterId ?? id.split("_")[0];
    record(s, key, characterId, status, at, choice);
    // The previous system handles message timing and photos; this ledger never invents attendance.
  }
  return reconcileBrick3KktMedia(w, s);
}
/** Save deterministic character-scene decisions made through the KKT composer. */
export function recordBrick3KktScene(s: Runtime, thread: string, outcome: string): void {
  if (!cast[thread]) return;
  const date = s.date ?? "2026-11-03";
  const at = `${date}T${s.time}:00+08:00`;
  const status: EventStatus = /distance|boundary|no_contact|delete_requested/.test(outcome) ? "declined" : "active";
  record(s, `kkt:scene:${thread}:${outcome}`, cast[thread], status, at);
}
