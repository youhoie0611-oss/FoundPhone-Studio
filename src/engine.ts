import type { Action, Condition, Runtime, StoryNode, Work } from "./schema";
import { makeItem } from "./schema";
import { progressOvernight } from "./brick3/overnight";
import { completeDate, noticeDatePost, answerDateJealousy, publishPlayerDatePhoto, noticePlayerDatePost, type DateLead } from "./brick3/dateAftermath";
import { dateAffectionChanged, dateChoose } from "./brick3/dateStory";
export function testCondition(c: Condition, s: Runtime): boolean {
  const [scope, ...rest] = c.key.split(":");
  const key = rest.join(":");
  const lists: Record<string, string[]> = {
    visited: s.visited,
    read: s.read,
    clue: s.clues,
    unlocked: s.unlocked,
    completed: s.completed,
  };
  const actual =
    scope === "ui"
      ? s.ui?.[rest[0]]?.[rest.slice(1).join(":")]
      : lists[scope]
        ? lists[scope].includes(key)
        : s.variables[c.key];
  switch (c.op) {
    case "eq":
      return actual === c.value;
    case "neq":
      return actual !== c.value;
    case "gt":
      return typeof actual === "number" && actual > Number(c.value);
    case "lt":
      return typeof actual === "number" && actual < Number(c.value);
    case "includes":
      return String(actual ?? "").includes(String(c.value));
  }
}
function apply(a: Action, s: Runtime, w: Work) {
  switch (a.type) {
    case "date":
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(a.value))) s.date = String(a.value);
      break;
    case "variable":
      s.variables[a.key] = a.value;
      break;
    case "clearChoices":
      s.choices = s.choices.filter((choice) => !choice.target.startsWith(a.key));
      break;
    case "adjust": {
      const delta = Number(a.value);
      const current = s.variables[a.key];
      if (typeof current === "number" && Number.isFinite(delta))
        s.variables[a.key] = Math.max(0, Math.min(100, current + delta));
      break;
    }
    case "unlock":
      if (!s.unlocked.includes(a.key)) {
        s.unlocked.push(a.key);
        const item = Object.values(w.data).flat().find((entry) => entry.id === a.key);
        // Stamp both authored player choices and NPC messages at actual delivery time.
        if (item) {
          s.ui = { ...s.ui, deliveryTimes: { ...((s.ui?.deliveryTimes ?? {}) as Record<string, string>), [a.key]: String(s.date ?? w.phone.date ?? "2026-11-03") + " " + s.time }, deliveryElapsed: { ...((s.ui?.deliveryElapsed ?? {}) as Record<string, number>), [a.key]: s.elapsedMs ?? 0 } };
        }
      }
      break;
    case "hide":
      if (!s.hidden.includes(a.key)) s.hidden.push(a.key);
      break;
    case "notification":
      s.notifications.push(String(a.value));
      break;
    case "call":
      s.notifications.push(`${String(a.value)} 来电`);
      s.incomingCall = {
        caller: String(a.value),
        target: a.key,
        status: "ringing",
      };
      break;
    case "clue":
      if (!s.clues.includes(a.key)) s.clues.push(a.key);
      break;
    case "time":
      s.time = String(a.value);
      s.clockRemainderMs = 0;
      break;
    case "ending":
      if (!s.endings.includes(String(a.value))) s.endings.push(String(a.value));
      break;
    case "choice":
      if (!s.choices.some((c) => c.target === a.key))
        s.choices.push({ label: String(a.value), target: a.key });
      break;
    case "message":
      s.messages[a.key] = [
        ...(s.messages[a.key] ?? []),
        makeItem({
          id: `event-${a.key}-${s.completed.length}-${s.messages[a.key]?.length ?? 0}`,
          title: "新消息",
          sender: w.phone.owner,
          body: String(a.value),
        }),
      ];
      break;
  }
}
function runQueue(
  w: Work,
  s: Runtime,
  event: string,
  target: string,
  queue: string[],
  resuming = new Set<string>(),
) {
  const seen = new Set<string>();
  let steps = 0;
  while (queue.length && steps++ < 200) {
    const id = queue.shift()!;
    const n = w.nodes.find((n) => n.id === id);
    if (!n || seen.has(id) || (n.once && s.completed.includes(id))) continue;
    seen.add(id);
    const conditions = n.conditions.map((c) => testCondition(c, s));
    const pass =
      n.logic === "or"
        ? conditions.some(Boolean)
        : n.logic === "not"
          ? !conditions.every(Boolean)
          : conditions.every(Boolean);
    if (!pass) continue;
    if (n.type === "delay" && !resuming.has(id)) {
      s.scheduled ??= [];
      if (!s.scheduled.some((t) => t.nodeId === id))
        s.scheduled.push({
          nodeId: id,
          due: (s.elapsedMs ?? 0) + (n.delayMs ?? 1000),
        });
      s.trace.push(`delay:${n.delayMs ?? 1000}ms → ${n.label}`);
      continue;
    }
    // Never let autonomous story nodes flood a single conversation.
    // Reschedule later rather than overwrite the player's active dialogue.
    const incomingThreads = n.actions
      .filter((action) => action.type === "unlock")
      .map((action) => Object.values(w.data).flat().find((item) => item.id === action.key))
      .filter((item) => item && !item.outgoing)
      .map((item) => item!.title);
    const recentDeliveries = (s.ui?.scriptedThreadDelivery ?? {}) as Record<string, number>;
    const recentPlayerReplies = (s.ui?.lastFreeReply ?? {}) as Record<string, string>;
    const blocked = incomingThreads.some((thread) => {
      const last = recentDeliveries[thread];
      const playerTime = recentPlayerReplies[thread];
      const playerElapsed = playerTime === undefined ? undefined : Number(playerTime);
      return (last !== undefined && (s.elapsedMs ?? 0) - last < 120000)
        || (playerElapsed !== undefined && Number.isFinite(playerElapsed) && (s.elapsedMs ?? 0) - playerElapsed < 90000);
    });
    if (blocked) {
      s.scheduled ??= [];
      if (!s.scheduled.some((entry) => entry.nodeId === id))
        s.scheduled.push({ nodeId: id, due: (s.elapsedMs ?? 0) + 30000 });
      continue;
    }
    if (incomingThreads.length) {
      s.ui = { ...s.ui, scriptedThreadDelivery: {
        ...recentDeliveries,
        ...Object.fromEntries(incomingThreads.map((thread) => [thread, s.elapsedMs ?? 0])),
      } };
    }
    if (!s.completed.includes(id)) s.completed.push(id);
    s.trace.push(`${event}:${target} → ${n.label}`);
    // A scripted chat notification must describe the message unlocked by this event,
    // never a placeholder such as "稍後回覆了訊息".
    const unlockedIncoming = n.actions
      .filter((action) => action.type === "unlock")
      .map((action) => Object.values(w.data).flat().find((item) => item.id === action.key))
      .filter((item) => item && !item.outgoing && item.body.trim());
    for (const a of n.actions) {
      const previous =
        (a.type === "variable" || a.type === "adjust")
          ? s.variables[a.key]
          : a.type === "time"
            ? s.time
            : undefined;
      if (a.type === "notification" && /^KKT[：:]|(?:傳來新訊息|稍後回覆了訊息|回覆了訊息)/.test(String(a.value))) {
        const latest = unlockedIncoming.at(-1);
        if (latest) {
          const sender = latest.id.startsWith("friends-group-") ? "下班後五人組" : (latest.sender || latest.title);
          const body = latest.body.trim().split("\\n").filter(Boolean).at(-1) ?? latest.body.trim();
          s.notifications.push(`${sender}：${body}`);
        }
        // Do not show misleading generic text when no actual message was delivered.
      } else {
        apply(a, s, w);
      }
      if ((a.type === "variable" || a.type === "adjust") && previous !== s.variables[a.key])
        queue.push(
          ...w.nodes
            .filter(
              (n) =>
                n.event === "variable" && (!n.target || n.target === a.key),
            )
            .map((n) => n.id),
        );
      if (a.type === "time" && previous !== s.time)
        queue.push(
          ...w.nodes
            .filter(
              (n) => n.event === "time" && (!n.target || n.target === s.time),
            )
            .map((n) => n.id),
        );
    }
    if (
      n.type === "ending" &&
      !n.actions.some((a) => a.type === "ending") &&
      !s.endings.includes(n.label)
    )
      s.endings.push(n.label);
    if (n.type === "choice") {
      for (const id of n.next)
        if (!s.choices.some((c) => c.target === id))
          s.choices.push({
            label: w.nodes.find((n) => n.id === id)?.label ?? id,
            target: id,
          });
    } else queue.push(...n.next);
  }
  s.trace = s.trace.slice(-100);
  return s;
}
export function dispatch(
  w: Work,
  previous: Runtime,
  event: string,
  target = "",
): Runtime {
  const [dateLead, dateEvent, dateCode] = target.split(":");
  const validLead = ["shen", "pei", "qi", "gu", "lu"].includes(dateLead);
  if (event === "datePlayerPost") return publishPlayerDatePhoto(previous, w, dateLead, dateEvent);
  if (validLead && event === "datePlayerPostSeen") return noticePlayerDatePost(previous, dateEvent, dateCode, dateLead as DateLead);
  if (validLead && event === "dateChoice") return dateChoose(previous, w, dateLead as DateLead, dateEvent);
  if (validLead && event === "dateAffectionChanged") return dateAffectionChanged(previous, dateLead as DateLead, Number(dateEvent));
  if (validLead && event === "dateComplete") return completeDate(previous, w, dateLead as DateLead, dateEvent);
  if (validLead && event === "datePostSeen") return noticeDatePost(previous, w, dateEvent, dateLead as DateLead);
  if (validLead && event === "dateJealousyReply" && ["explain", "reassure", "privacy", "provoke"].includes(dateCode))
    return answerDateJealousy(previous, dateLead as DateLead, dateCode as "explain" | "reassure" | "privacy" | "provoke");
  const s = structuredClone(previous);
  if (event === "choose") {
    const group = w.nodes.find((node) => node.type === "choice" && node.next.includes(target));
    const siblings = new Set(group?.next ?? [target]);
    s.choices = s.choices.filter((choice) => !siblings.has(choice.target));
  }
  if (event === "openApp" && !s.visited.includes(target))
    s.visited.push(target);
  if (event === "read" && !s.read.includes(target)) s.read.push(target);
  if (w.mode === "explore") return s;
  const queue = w.nodes
    .filter(
      (n) =>
        (n.type === "start" && event === "start") ||
        (n.event === event && (!n.target || n.target === target)),
    )
    .map((n) => n.id);
  const next = runQueue(w, s, event, target, queue);
  return next;
}
export function advance(
  w: Work,
  previous: Runtime,
  milliseconds: number,
): Runtime {
  const s = structuredClone(previous);
  const delta = Number.isFinite(milliseconds)
    ? Math.max(0, Math.min(milliseconds, 86400000))
    : 0;
  const end = (s.elapsedMs ?? 0) + delta;
  s.elapsedMs ??= 0;
  s.clockRemainderMs ??= 0;
  s.scheduled ??= [];
  let resumes = 0;
  while (true) {
    s.scheduled.sort((a, b) => a.due - b.due);
    const due =
      w.mode !== "explore" && resumes < 200 ? s.scheduled[0] : undefined;
    const clockAt = s.elapsedMs + 60000 - s.clockRemainderMs;
    const next = Math.min(
      end,
      clockAt,
      due ? Math.max(s.elapsedMs, due.due) : Infinity,
    );
    s.clockRemainderMs += next - s.elapsedMs;
    s.elapsedMs = next;
    if (s.clockRemainderMs >= 60000) {
      s.clockRemainderMs -= 60000;
      const match = s.time.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        const value = (Number(match[1]) * 60 + Number(match[2]) + 1) % 1440;
        s.time =
          String(Math.floor(value / 60)).padStart(2, "0") +
          ":" +
          String(value % 60).padStart(2, "0");
        if (value === 0) {
          const currentDate = new Date(`${s.date ?? w.phone.date}T12:00:00Z`);
          if (!Number.isNaN(currentDate.getTime())) {
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            s.date = currentDate.toISOString().slice(0, 10);
            progressOvernight(s);
          }
        }
        if (w.mode !== "explore")
          runQueue(
            w,
            s,
            "time",
            s.time,
            w.nodes
              .filter(
                (n) => n.event === "time" && (!n.target || n.target === s.time),
              )
              .map((n) => n.id),
          );
      }
    }
    if (due && due.due <= s.elapsedMs) {
      const node = w.nodes.find((entry) => entry.id === due.nodeId);
      const following = node?.type === "delay"
        ? (node.next ?? []).flatMap((id) => w.nodes.find((entry) => entry.id === id)?.actions ?? [])
        : node?.actions ?? [];
      const incoming = following.filter((action) => action.type === "unlock")
        .map((action) => Object.values(w.data).flat().find((item) => item.id === action.key))
        .filter((item) => item && !item.outgoing);
      const lastReplies = (s.ui?.lastFreeReply ?? {}) as Record<string, string>;
      const isConversing = incoming.some((item) => {
        const last = lastReplies[item!.title];
        return last !== undefined && (s.elapsedMs ?? 0) - Number(last) < 90000;
      });
      if (isConversing) {
        due.due = (s.elapsedMs ?? 0) + 15000;
        continue;
      }

      s.scheduled.splice(s.scheduled.indexOf(due), 1);
      resumes++;
      runQueue(w, s, "timer", due.nodeId, [due.nodeId], new Set([due.nodeId]));
      continue;
    }
    if (s.elapsedMs >= end) break;
  }
  return s;
}
/** Preserve custom player text without silently choosing a scripted response. */
export function submitCustomReply(s: Runtime, raw: string, appId = "kakao", thread = ""): Runtime {
  if (!raw.trim()) return s;
  const history = Array.isArray(s.ui?.player?.customReplies)
    ? (s.ui.player.customReplies as string[])
    : [];
  const message = makeItem({
    id: `custom-reply-${history.length + 1}`,
    title: thread || "玩家自定義",
    sender: "我",
    body: raw,
    outgoing: true,
    time: `${s.date ?? "2026-11-03"} ${s.time}`,
  });
  return {
    ...s,
    ui: { ...s.ui, player: { ...s.ui?.player, customReplies: [...history, raw] }, lastFreeReply: { ...((s.ui?.lastFreeReply ?? {}) as Record<string, string>), [thread]: String(s.elapsedMs ?? 0) } },
    messages: {
      ...s.messages,
      [appId]: [...(s.messages[appId] ?? []), message],
    },
    // A free-text answer resolves the currently offered choices for this conversation.
    choices: s.choices.filter((choice) => {
      const target = choice.target;
      const belongs = (Object.entries({ "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi", "顧時安": "gu", "陸沉川": "lu" }).some(([name, key]) => thread === name && target.startsWith(`z3-long-${key}-`)))
        || (thread === "陸沉川" && target.startsWith("z3-lu-"))
        || thread === "林安" && target.startsWith("z3-lu-invite-")
        || thread === "林安" && target.startsWith("z3-lu-contact-")
        || thread === "林安" ? target.startsWith("lin-reply-")
        : thread === "沈硯舟" ? /^(reply-shen-|phase[23]-shen-|shen-r|shen-day|shen-major-event-)/.test(target)
        : thread === "裴知聿" ? /^(reply-pei-|phase[23]-pei-|pei-r|pei-day|pei-major-event-)/.test(target)
        : thread === "祁野" ? /^(reply-qi-|phase[23]-qi-|qi-r|qi-day|qi-major-event-)/.test(target)
        : false;
      return !belongs;
    }),
    trace: [...s.trace, `player-custom-reply:${message.id}`],
  };
}

export function choose(w: Work, s: Runtime, id: string) {
  const node = w.nodes.find((n) => n.id === id);
  if (!node || !s.choices.some((c) => c.target === id)) return s;
  return dispatch(
    {
      ...w,
      nodes: w.nodes.map((n) =>
        n.id === id ? { ...n, event: "choose", target: id } : n,
      ),
    },
    s,
    "choose",
    id,
  );
}
export function validateGraph(nodes: StoryNode[]) {
  const errors: string[] = [];
  for (const n of nodes) {
    for (const id of n.next)
      if (!nodes.some((x) => x.id === id))
        errors.push(`${n.label} 引用了不存在的节点 ${id}`);
    if (n.next.includes(n.id))
      errors.push(`${n.label} 存在自环（运行时会阻止循环）`);
  }
  const reachable = new Set<string>();
  const visit = (id: string) => {
    if (reachable.has(id)) return;
    reachable.add(id);
    nodes.find((n) => n.id === id)?.next.forEach(visit);
  };
  nodes
    .filter((n) => n.type === "start" || n.event)
    .forEach((n) => visit(n.id));
  nodes
    .filter((n) => n.type !== "comment" && !reachable.has(n.id))
    .forEach((n) => errors.push(`${n.label} 不可达`));
  return errors;
}
export function visible(
  item: { id: string; hidden: boolean; unlock: string },
  s: Runtime,
) {
  return (
    !s.hidden.includes(item.id) &&
    (!item.hidden || s.unlocked.includes(item.id)) &&
    (!item.unlock ||
      testCondition({ key: item.unlock, op: "eq", value: true }, s))
  );
}
