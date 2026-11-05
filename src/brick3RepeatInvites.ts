import invitationConfig from "../docs/brick3-repeat-invitations-v1.json";
import { makeItem, type Runtime, type Work } from "./schema";

type Activity = (typeof invitationConfig.activities)[number];
type Phase = "idle" | "invited" | "reply_pending" | "travel" | "arrival" | "completed";
export type Brick3InviteProgress = {
  phase: Phase;
  attempts: number;
  nextThreshold: number;
  retryAtMs: number;
  responseAtMs?: number;
  responseText?: string;
  responseMode?: "accept" | "decline" | "details" | "arrival_yes" | "arrival_no";
  travelAtMs?: number;
  followUpAtMs?: number;
  followUpSent?: boolean;
  followUpVariant?: number;
  detailRequests?: number;
  /** Pei may send a separate anxious follow-up after a soft refusal. */
  anxiousFollowUpAtMs?: number;
  anxiousFollowUpStep?: number;
  completed?: boolean;
  /** Only set on a newly confirmed arrival, never a migrated old save. */
  completedAtMs?: number;
};

const PREFIX = "brick3-photo-";
const keys = invitationConfig.activities;
const MIN_COOLDOWN = invitationConfig.rules.refusalCooldownMinutes * 60000;
const TRAVEL_MS = invitationConfig.rules.travelMinutes * 60000;
const choicePrefix = (id: string) => `${PREFIX}${id}-choice-`;
const eventId = (a: Activity, atDoor: boolean) => atDoor ? a.id + "_arrival" : a.id;
const oncePhotoId = (a: Activity) => `${PREFIX}${a.id}-album-1`;
const photoPath = (a: Activity, filename: string) => `./story-photos/${a.characterId}/${filename}`;

/** A refusal at 30 can be reconsidered at 40; at 60, the next stage is 65. */
export function nextBrick3InvitationThreshold(affection: number): number {
  const score = Math.max(0, Math.min(100, Number.isFinite(affection) ? affection : 0));
  if (score < 60) return Math.ceil((score + 0.001) / 10) * 10;
  return Math.ceil((score + 0.001) / 5) * 5;
}

function progressFor(state: Runtime, a: Activity): Brick3InviteProgress {
  state.brick3Invites ??= {};
  return (state.brick3Invites[a.id] ??= {
    phase: "idle", attempts: 0, nextThreshold: a.minAffection, retryAtMs: 0,
  });
}
function now(state: Runtime): number { return state.elapsedMs ?? 0; }
function message(state: Runtime, a: Activity, suffix: string, body: string, outgoing = false, photoEvent = "") {
  const id = `brick3-repeat-${a.id}-${suffix}`;
  state.messages.kakao ??= [];
  if (state.messages.kakao.some((m) => m.id === id)) return;
  state.messages.kakao.push(makeItem({
    id, title: a.characterName,
    sender: outgoing ? "我" : a.characterName,
    body, outgoing, time: `${state.date ?? "2026-11-03"} ${state.time}`,
    meta: photoEvent ? { photoEventId: photoEvent, source: "brick3-repeat-invitation" } : { source: "brick3-repeat-invitation" },
  }));
  if (!outgoing) state.notifications.push(`${a.characterName}：${body.split("\n")[0]}`);
}
function photoMessage(state: Runtime, a: Activity, suffix: string, filename: string, album = false) {
  const id = album ? oncePhotoId(a) : `brick3-repeat-${a.id}-${suffix}`;
  const target = album ? "photos" : "kakao";
  state.messages[target] ??= [];
  if (state.messages[target].some((m) => m.id === id)) return;
  state.messages[target].push(makeItem({
    id, title: album ? a.albumTitle : a.characterName,
    sender: album ? "我" : a.characterName,
    body: album ? "一起出門時留下的唯一活動照片。" : "那天拍下的照片",
    time: `${state.date ?? "2026-11-03"} ${state.time}`,
    kind: "image", folder: album ? a.albumFolder : "",
    hidden: album, media: photoPath(a, filename),
    meta: { source: "brick3-repeat-invitation", photoEventId: album ? a.id : a.id + "_followup" },
  }));
  if (album && !state.unlocked.includes(id)) state.unlocked.push(id);
}
function offerOptions(s: Runtime, a: Activity, arrival: boolean) {
  const id = eventId(a, arrival);
  const choices = arrival ? a.arriveChoices : a.choices;
  const options = choices.map((label, i) => ({ label, target: choicePrefix(id) + (i + 1) }));
  s.choices = s.choices.filter(c => !c.target.startsWith(choicePrefix(id)));
  s.choices.push(...options);
}
function lastContactExists(w: Work, a: Activity): boolean {
  return (w.data.kakao ?? []).some(item => item.title === a.characterName);
}
function affinity(s: Runtime, a: Activity): number {
  const v = s.variables[a.affectionKey]; return typeof v === "number" ? v : 0;
}
function allowed(w: Work, s: Runtime, a: Activity): boolean {
  const flag = "requiresFlag" in a ? a.requiresFlag : undefined;
  return lastContactExists(w, a)
    && (!flag || s.variables[flag] === true);
}
function deferNext(s: Runtime, a: Activity, p: Brick3InviteProgress) {
  p.phase = "idle";
  p.nextThreshold = nextBrick3InvitationThreshold(affinity(s, a));
  p.retryAtMs = now(s) + MIN_COOLDOWN;
  p.responseAtMs = undefined;
  p.travelAtMs = undefined;
}
/** Invites are assessed by hidden favorability and game time, never by opening KKT. */
export function tickBrick3Invitations(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo") return s;
  // Existing v43 saves may contain a Pei dinner from the retired four-photo
  // sequence. Treat that attendance as complete; do not invite again.
  const oldDinner = "brick3-photo-photo_dinner_at_home-";
  const legacyDone = s.unlocked.some(id => id.startsWith(oldDinner + "album-"));
  if (legacyDone) {
    const pei = keys.find(a => a.id === "pei_dinner_outing");
    if (pei) {
      const prior = progressFor(s, pei);
      prior.completed = true;
      prior.phase = "completed";
      prior.followUpSent = true; // no artificial backdated message
    }
  }
  // Remove obsolete choices and abandoned old travel timers from pre-migration saves.
  s.choices = s.choices.filter(choice =>
    !choice.target.startsWith("brick3-photo-photo_dinner_invite-choice-") &&
    !choice.target.startsWith("brick3-photo-photo_dinner_at_home-choice-") &&
    !choice.target.startsWith("brick3-photo-photo_dinner_arrival-choice-"));
  s.scheduled = (s.scheduled ?? []).filter(t =>
    t.nodeId !== "brick3-photo-visit-travel" &&
    !t.nodeId.startsWith("brick3-photo-photo_dinner_"));
  for (const a of keys) {
    if (!allowed(w, s, a)) continue;
    const p = progressFor(s, a);
    if (!p.completed && s.unlocked.includes(oncePhotoId(a))) {
      p.completed = true; // Existing save: do not invite again for a collected photo.
      p.phase = "completed";
    }
    if (a.id === "pei_dinner_outing" && p.anxiousFollowUpAtMs !== undefined &&
        now(s) >= p.anxiousFollowUpAtMs) {
      const step = p.anxiousFollowUpStep ?? 0;
      const lines = [
        "我剛剛又看了一次妳的訊息。\\n……妳是不是不想再跟我單獨見面了？",
        "對不起，我又一直問。\\n我只是很怕，連見妳一面都變得不可能。",
      ];
      message(s, a, "anxious-followup-" + p.attempts + "-" + step,
        lines[step].replace(/\\n/g, "\\n"));
      p.anxiousFollowUpStep = step + 1;
      p.anxiousFollowUpAtMs = step === 0 ? now(s) + 45000 : undefined;
      continue;
    }
    if (p.completed) {
      if (!p.followUpSent && p.followUpAtMs !== undefined && now(s) >= p.followUpAtMs) {
        const selection = (p.followUpVariant ?? 0) % a.followUps.length;
        message(s, a, "aftercare-" + p.attempts, a.followUps[selection]);
        // The optional NPC snapshot appears in KKT only if the WebP is published.
        // Missing photo is filtered by useStoryPhotoAvailability without suppressing this text.
        photoMessage(s, a, "aftercare-photo-" + p.attempts, a.followUpPhoto);
        p.followUpSent = true;
      }
      continue;
    }
    if (p.phase === "reply_pending" && p.responseAtMs !== undefined && now(s) >= p.responseAtMs) {
      const detailSuffix = p.responseMode === "details" ? "-ask-" + (p.detailRequests ?? 0) : "";
      message(s, a, "response-" + p.attempts + "-" + p.responseMode + detailSuffix, p.responseText ?? "知道了。");
      const mode = p.responseMode;
      p.responseAtMs = undefined;
      if (mode === "accept") {
        p.phase = "travel";
        p.travelAtMs = now(s) + TRAVEL_MS;
      } else if (mode === "details") {
        p.phase = "invited";
        message(s, a, "details-followup-" + p.attempts + "-" + (p.detailRequests ?? 0), "所以，妳想一起去嗎？", false, a.id);
        offerOptions(s, a, false);
      } else if (mode === "arrival_yes") {
        p.phase = "completed";
        p.completed = true;
        p.completedAtMs = now(s);
        photoMessage(s, a, "one-gallery-photo", a.eventPhoto, true);
        const seed = Array.from(a.id).reduce((total, x) => total + x.charCodeAt(0), 0) + p.attempts * 13 + now(s);
        p.followUpVariant = Math.abs(seed) % a.followUps.length;
        const [minHour, maxHour] = invitationConfig.rules.followUpDelayHours;
        const hours = minHour + Math.abs(seed * 7 + 3) % (maxHour - minHour + 1);
        p.followUpAtMs = now(s) + hours * 3600000;
      } else if (mode === "arrival_no" || mode === "decline") {
        deferNext(s, a, p);
        if (a.id === "pei_dinner_outing" && mode === "decline") {
          p.anxiousFollowUpStep = 0;
          p.anxiousFollowUpAtMs = now(s) + 15000;
        }
      }
      p.responseMode = undefined;
      p.responseText = undefined;
      continue;
    }
    if (p.phase === "travel" && p.travelAtMs !== undefined && now(s) >= p.travelAtMs) {
      p.phase = "arrival";
      p.travelAtMs = undefined;
      message(s, a, "arrival-question-" + p.attempts, a.arrival, false, eventId(a, true));
      offerOptions(s, a, true);
      continue;
    }
    if (p.phase === "idle" && now(s) >= p.retryAtMs && affinity(s, a) >= p.nextThreshold) {
      const incomingDelivery = (s.ui?.scriptedThreadDelivery ?? {}) as Record<string, number>;
      const last = incomingDelivery[a.characterName] ?? -Infinity;
      if (now(s) - last < 120000) continue;
      p.phase = "invited";
      p.attempts++;
      const text = p.attempts === 1 ? a.invite : `之前那次沒約成。我沒有要催妳，只是想再問一次：${a.invite}`;
      message(s, a, "invitation-" + p.attempts, text, false, a.id);
      offerOptions(s, a, false);
      s.ui ??= {};
      s.ui.scriptedThreadDelivery = { ...incomingDelivery, [a.characterName]: now(s) };
    }
  }
  return s;
}
/** Returning null means it is not a repeat-invitation choice; normal story choices remain intact. */
export function chooseBrick3Invitation(w: Work, previous: Runtime, target: string): Runtime | null {
  if (w.id !== "between-the-lines-b-demo") return null;
  const a = keys.find(a => target.startsWith(choicePrefix(a.id)) || target.startsWith(choicePrefix(a.id + "_arrival")));
  if (!a) return null;
  if (!previous.choices.some(c => c.target === target)) return previous;
  const s = structuredClone(previous);
  const p = progressFor(s, a);
  const atDoor = target.startsWith(choicePrefix(a.id + "_arrival"));
  const prefix = choicePrefix(eventId(a, atDoor));
  const choice = Number(target.slice(prefix.length));
  if (!Number.isInteger(choice) || choice < 1 || choice > 4) return previous;
  if (p.phase !== (atDoor ? "arrival" : "invited")) return previous;
  s.choices = s.choices.filter(c => !c.target.startsWith(prefix));
  const playerText = (atDoor ? a.arriveChoices : a.choices)[choice - 1];
  message(s, a, (atDoor ? "arrival-choice-" : "choice-") + p.attempts + "-" + choice, playerText, true);
  p.phase = "reply_pending";
  p.responseAtMs = now(s) + 2200;
  p.responseText = (atDoor ? a.arrivalResponses : a.responses)[choice - 1];
  p.responseMode = atDoor
    ? choice === 1 ? "arrival_yes" : "arrival_no"
    : choice === 1 ? "accept" : choice === 3 ? "details" : "decline";
  if (p.responseMode === "details") p.detailRequests = (p.detailRequests ?? 0) + 1;
  return s;
}

/** A free-form reply is not silently treated as consenting to an outing. */
export function dismissBrick3InvitationOnCustomReply(s: Runtime, thread: string): void {
  for (const a of keys) {
    if (a.characterName !== thread) continue;
    const p = s.brick3Invites?.[a.id];
    if (!p || (p.phase !== "invited" && p.phase !== "arrival")) continue;
    const pending = [choicePrefix(a.id), choicePrefix(a.id + "_arrival")];
    if (!s.choices.some(c => pending.some(prefix => c.target.startsWith(prefix)))) continue;
    s.choices = s.choices.filter(c => !pending.some(prefix => c.target.startsWith(prefix)));
    deferNext(s, a, p);
    p.anxiousFollowUpAtMs = undefined;
    p.anxiousFollowUpStep = undefined;
  }
}
