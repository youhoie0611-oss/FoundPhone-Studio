/** Brick3 causal event ledger. No UI or FoundPhone core dependencies. */
export type EventStatus = "not_started" | "scheduled" | "active" | "completed" | "declined" | "missed" | "cancelled" | "postponed" | "expired";
export type PlayerDecision = "accept" | "decline" | "postpone" | "attend" | "miss" | "cancel";
export interface StoryEvent {
  id: string; characterId: string; status: EventStatus;
  startsAt: string; endsAt: string; prerequisites: string[];
  playerChoice?: PlayerDecision; attended?: boolean;
  outcome?: string; choiceId?: string; choiceLabel?: string; topic?: string; sourceMessageIds?: string[];
  followUps: string[]; photoIds: string[];
  history: { at: string; status: EventStatus; choice?: PlayerDecision }[];
}
export interface StoryLedger { events: Record<string, StoryEvent>; delivered: string[]; }
export const emptyStoryLedger = (): StoryLedger => ({ events: {}, delivered: [] });
const transitions: Record<EventStatus, Partial<Record<PlayerDecision, EventStatus>>> = {
  not_started: { accept: "scheduled", decline: "declined", postpone: "postponed", cancel: "cancelled" },
  scheduled: { attend: "completed", miss: "missed", postpone: "postponed", cancel: "cancelled", decline: "declined" },
  active: { attend: "completed", miss: "missed", cancel: "cancelled", postpone: "postponed" },
  postponed: { accept: "scheduled", decline: "declined", cancel: "cancelled" },
  completed: {}, declined: {}, missed: {}, cancelled: {}, expired: {},
};
const timestamp = (value: string) => {
  const n = Date.parse(value);
  if (!Number.isFinite(n)) throw new Error("Invalid event timestamp: " + value);
  return n;
};
export function addStoryEvent(ledger: StoryLedger, event: Omit<StoryEvent, "history">): StoryLedger {
  if (ledger.events[event.id]) throw new Error("Duplicate event " + event.id);
  if (timestamp(event.endsAt) <= timestamp(event.startsAt)) throw new Error("Invalid event interval");
  return { ...ledger, events: { ...ledger.events, [event.id]: { ...event, history: [] } } };
}
export function decideStoryEvent(ledger: StoryLedger, id: string, choice: PlayerDecision, at: string, newStart?: string, newEnd?: string): StoryLedger {
  const event = ledger.events[id];
  if (!event) throw new Error("Unknown event " + id);
  const status = transitions[event.status][choice];
  if (!status) throw new Error("Illegal event transition: " + event.status + " -> " + choice);
  if (choice === "attend" && (timestamp(at) < timestamp(event.startsAt) || timestamp(at) > timestamp(event.endsAt))) throw new Error("Attendance outside event window");
  if (choice === "accept" && event.prerequisites.some(dep => ledger.events[dep]?.status !== "completed")) throw new Error("Prerequisites incomplete");
  if (choice === "accept" && Object.values(ledger.events).some(other => other.id !== id && other.status === "scheduled" && other.attended !== false && timestamp(other.startsAt) < timestamp(event.endsAt) && timestamp(event.startsAt) < timestamp(other.endsAt))) throw new Error("Conflicting player appointment");
  if (choice === "accept" && event.status === "postponed" && (!newStart || !newEnd)) throw new Error("Postponed event needs a new date");
  const startsAt = newStart ?? event.startsAt, endsAt = newEnd ?? event.endsAt;
  if (timestamp(endsAt) <= timestamp(startsAt)) throw new Error("Invalid reschedule");
  return { ...ledger, events: { ...ledger.events, [id]: { ...event, status, startsAt, endsAt, playerChoice: choice, attended: choice === "attend" ? true : choice === "miss" || choice === "decline" ? false : event.attended, history: [...event.history, { at, status, choice }] } } };
}
export function advanceStoryClock(ledger: StoryLedger, now: string): StoryLedger {
  const events = { ...ledger.events };
  for (const event of Object.values(events)) {
    if (event.status === "scheduled" && timestamp(now) > timestamp(event.endsAt)) {
      events[event.id] = { ...event, status: "missed", attended: false, history: [...event.history, { at: now, status: "missed" }] };
    } else if (event.status === "not_started" && timestamp(now) > timestamp(event.endsAt)) {
      events[event.id] = { ...event, status: "expired", history: [...event.history, { at: now, status: "expired" }] };
    }
  }
  return { ...ledger, events };
}
export function eligibleFollowUps(ledger: StoryLedger, id: string): string[] {
  const event = ledger.events[id];
  if (!event || !["completed", "declined", "missed", "cancelled"].includes(event.status)) return [];
  return event.followUps.filter(next => ledger.events[next]?.prerequisites.includes(id) && !ledger.delivered.includes(next));
}
