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
  /** Queued Pei KKT bubbles; delivered by game time, even with the chat closed. */
  peiQueue?: { suffix: string; parts: string[]; index: number; nextAtMs: number; photoEvent: string };
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
function speak(state: Runtime, a: Activity, suffix: string, body: string, photoEvent = "") {
  if (a.id !== "pei_dinner_outing") {
    message(state, a, suffix, body, false, photoEvent);
    return;
  }
  const parts = body.split("\n").map(v => v.trim()).filter(Boolean);
  if (parts.length <= 1) {
    message(state, a, suffix, body, false, photoEvent);
    return;
  }
  const p = progressFor(state, a);
  message(state, a, suffix + "-part-1", parts[0], false, photoEvent);
  p.peiQueue = { suffix, parts, index: 1, nextAtMs: now(state) + 2500, photoEvent };
}
function tickPeiQueue(state: Runtime, a: Activity, p: Brick3InviteProgress) {
  const q = p.peiQueue;
  if (!q || now(state) < q.nextAtMs) return;
  message(state, a, q.suffix + "-part-" + (q.index + 1), q.parts[q.index], false, q.photoEvent);
  q.index++;
  q.nextAtMs = now(state) + 2500 + (q.index % 2) * 1200;
  if (q.index >= q.parts.length) p.peiQueue = undefined;
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
    if (a.id === "pei_dinner_outing") tickPeiQueue(s, a, p);
    if (!p.completed && s.unlocked.includes(oncePhotoId(a))) {
      p.completed = true; // Existing save: do not invite again for a collected photo.
      p.phase = "completed";
    }
    if (a.id === "pei_dinner_outing" && p.anxiousFollowUpAtMs !== undefined &&
        now(s) >= p.anxiousFollowUpAtMs) {
      const step = p.anxiousFollowUpStep ?? 0;
      const lines = [
        "妳還在嗎\\n我剛剛又看了一次妳的訊息\\n妳是不是不想再見我了",
        "我真的很想妳\\n妳可以再跟我說一句話嗎\\n不要就這樣不理我",
      ];
      speak(s, a, "anxious-followup-" + p.attempts + "-" + step,
        lines[step].replace(/\\n/g, "\n"));
      p.anxiousFollowUpStep = step + 1;
      p.anxiousFollowUpAtMs = step === 0 ? now(s) + 45000 : undefined;
      continue;
    }
    if (p.completed) {
      if (!p.followUpSent && p.followUpAtMs !== undefined && now(s) >= p.followUpAtMs) {
        const selection = (p.followUpVariant ?? 0) % a.followUps.length;
        speak(s, a, "aftercare-" + p.attempts, a.followUps[selection]);
        // The optional NPC snapshot appears in KKT only if the WebP is published.
        // Missing photo is filtered by useStoryPhotoAvailability without suppressing this text.
        photoMessage(s, a, "aftercare-photo-" + p.attempts, a.followUpPhoto);
        p.followUpSent = true;
      }
      continue;
    }
    if (p.phase === "reply_pending" && p.responseAtMs !== undefined && now(s) >= p.responseAtMs) {
      const detailSuffix = p.responseMode === "details" ? "-ask-" + (p.detailRequests ?? 0) : "";
      speak(s, a, "response-" + p.attempts + "-" + p.responseMode + detailSuffix, p.responseText ?? "知道了。");
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
      speak(s, a, "arrival-question-" + p.attempts, a.arrival, eventId(a, true));
      offerOptions(s, a, true);
      continue;
    }
    if (p.phase === "idle" && now(s) >= p.retryAtMs && affinity(s, a) >= p.nextThreshold) {
      const incomingDelivery = (s.ui?.scriptedThreadDelivery ?? {}) as Record<string, number>;
      const last = incomingDelivery[a.characterName] ?? -Infinity;
      if (now(s) - last < 120000) continue;
      p.phase = "invited";
      p.attempts++;
      const text = p.attempts === 1 ? a.invite : a.id === "pei_dinner_outing" ? `上次沒約成。\\n我後來又想了很久。\\n這次妳願意來嗎？\\n……我還是想見妳。`.replace(/\\n/g, "\n") : `之前那次沒約成。我沒有要催妳，只是想再問一次：${a.invite}`;
      speak(s, a, "invitation-" + p.attempts, text, a.id);
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
  p.peiQueue = undefined;
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

/** Route a free-text decision into the same invitation state machine as scripted choices.
 * Returns true only when a live invitation was consumed; callers must not queue a second NPC reply.
 */
export function respondToBrick3InvitationText(s: Runtime, thread: string, raw: string): boolean {
  const a = keys.find(activity => activity.characterName === thread &&
    (s.brick3Invites?.[activity.id]?.phase === "invited" || s.brick3Invites?.[activity.id]?.phase === "arrival"));
  if (!a) return false;
  const p = s.brick3Invites?.[a.id];
  if (!p) return false;
  const atDoor = p.phase === "arrival";
  const refused = /不去|不能去|沒空|不方便|不想|不要|拒絕|改天|下次|先不|不會去|沒辦法去/.test(raw);
  const mealQuestion = /煮什麼|做什麼|吃什麼|哪道菜|什麼菜|準備什麼/.test(raw);
  const details = /幾點|時間|在哪|哪裡|地點|地址|什麼時候|哪天|怎麼去/.test(raw) ||
    (a.id === "pei_dinner_outing" && (mealQuestion || /不用特別|不用特地|簡單吃/.test(raw)));
  // Treat a natural reply ("好，我想過去吃晚餐") as acceptance, not an unrelated text.
  // Explicit refusal always wins, even if the sentence contains "好".
  const accepted = !refused && (
    /^(好|好啊|好呀|可以|行|我去|我會去|算我一個|有空|願意)[！!。，、\s]*$/.test(raw.trim()) ||
    /我(?:會|想|可以)(?:過去|來|去|參加|一起)|想去|我會到|一起去|我可以去|我願意去/.test(raw) ||
    (atDoor && /我到了|到門口了|現在進去|我已經到了/.test(raw))
  );
  if (!refused && !details && !accepted) return false;
  const choice = atDoor ? (accepted ? 1 : 2) : refused ? 2 : accepted ? 1 : 3;
  const prefix = choicePrefix(eventId(a, atDoor));
  s.choices = s.choices.filter(option => !option.target.startsWith(prefix));
  p.peiQueue = undefined;
  p.anxiousFollowUpAtMs = undefined;
  p.anxiousFollowUpStep = undefined;
  p.phase = "reply_pending";
  p.responseAtMs = now(s) + 2200;
  p.responseText = (atDoor ? a.arrivalResponses : a.responses)[choice - 1];
  if (a.id === "pei_dinner_outing" && !atDoor) {
    if (accepted && details)
      p.responseText = "妳願意來，我真的很高興。\n具體時間我們再確認，妳下班後方便再過來就好。";
    else if (mealQuestion)
      p.responseText = "我還在想要煮什麼。\n妳現在有特別想吃的嗎？我不想擅自替妳決定。";
    else if (details && /不用特別|不用特地|簡單吃/.test(raw))
      p.responseText = "好，簡單吃就好。\n不過妳還沒確定要不要來，我先不替妳安排。";
  }
  p.responseMode = atDoor ? (accepted ? "arrival_yes" : "arrival_no")
    : refused ? "decline" : accepted ? "accept" : "details";
  if (p.responseMode === "details") p.detailRequests = (p.detailRequests ?? 0) + 1;
  return true;
}

/** A free-form reply is not silently treated as consenting to an outing. */
export function dismissBrick3InvitationOnCustomReply(s: Runtime, thread: string): void {
  for (const a of keys) {
    if (a.characterName !== thread) continue;
    const p = s.brick3Invites?.[a.id];
    if (!p) continue;
    p.anxiousFollowUpAtMs = undefined;
    p.anxiousFollowUpStep = undefined;
    p.peiQueue = undefined;
    if (p.phase !== "invited" && p.phase !== "arrival") continue;
    const pending = [choicePrefix(a.id), choicePrefix(a.id + "_arrival")];
    if (!s.choices.some(c => pending.some(prefix => c.target.startsWith(prefix)))) continue;
    s.choices = s.choices.filter(c => !pending.some(prefix => c.target.startsWith(prefix)));
    deferNext(s, a, p);
    p.anxiousFollowUpAtMs = undefined;
    p.anxiousFollowUpStep = undefined;
  }
}
