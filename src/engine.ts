import { tickBrick3SceneEvents } from "./brick3SceneScheduler";
import { chooseV8, observeV8Reply, tickV8 } from "./brick3Relationships";
import { chooseV8Life, tickV8Life, askV8Psychology } from "./brick3V8Life";
import { chooseV8Conflict, tickV8Conflict } from "./brick3V8Conflict";
import { rememberBrick3Reply, tickBrick3Memory } from "./brick3Memory";
import type { Action, Condition, Runtime, StoryNode, Work } from "./schema";
import { makeItem } from "./schema";
import { tickPeiAutonomy, stopPeiAutonomyOnPlayerReply } from "./brick3PeiAutonomy";
import { tickBrick3Invitations, chooseBrick3Invitation, dismissBrick3InvitationOnCustomReply, respondToBrick3InvitationText } from "./brick3RepeatInvites";
import { tickBrick3DateSocial, chooseBrick3JealousyInquiry, dismissBrick3JealousyOnCustomReply } from "./brick3DateSocial";
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
    case "affinity": {
      // Hidden favorability is cumulative, bounded and never shown in UI.
      const previous = typeof s.variables[a.key] === "number" ? Number(s.variables[a.key]) : 0;
      const delta = typeof a.value === "number" ? a.value : 0;
      s.variables[a.key] = Math.max(0, Math.min(100, previous + delta));
      break;
    }
    case "unlock":
      if (!s.unlocked.includes(a.key)) {
        s.unlocked.push(a.key);
        const item = Object.values(w.data).flat().find((entry) => entry.id === a.key);
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
    const immediatePhotoResponse = n.id.startsWith("brick3-photo-")
      && (/-option-\d+-response$/.test(n.id) || n.id === "brick3-photo-photo_dinner_at_home-arrive" || /-(arrival-notify|visit-arrive|hand-question)$/.test(n.id) || n.id.endsWith("-reply-arrive"));
    const blocked = !immediatePhotoResponse
      ? incomingThreads.some((thread) => {
      const last = recentDeliveries[thread];
      const playerTime = recentPlayerReplies[thread];
      const playerElapsed = playerTime === undefined ? undefined : Number(playerTime);
      return (last !== undefined && (s.elapsedMs ?? 0) - last < 120000)
        || (playerElapsed !== undefined && Number.isFinite(playerElapsed) && (s.elapsedMs ?? 0) - playerElapsed < 90000);
    }) : false;
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
        (a.type === "variable" || a.type === "affinity")
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
      // A delivered message may open reply options without being viewed.
      // Reading the chat remains a separate user action.
      if (a.type === "unlock") {
        const item = Object.values(w.data).flat().find((i) => i.id === a.key);
        if (item && !item.outgoing && /^(?:shen|pei|qi|lin)-/.test(item.id))
          queue.push(...w.nodes.filter((node) => node.event === "read" && node.target === a.key).map((node) => node.id));
      }
      if ((a.type === "variable" || a.type === "affinity") && previous !== s.variables[a.key])
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
  if (event === "start") {
    const initial = Object.values(w.data).flat().filter((item) => !item.hidden && !item.outgoing && /^(?:shen|pei|qi|lin)-/.test(item.id));
    const triggers = initial.flatMap((item) => w.nodes.filter((node) => node.event === "read" && node.target === item.id).map((node) => node.id));
    runQueue(w, next, "arrival", "", triggers);
  }
  return tickV8Conflict(w, tickV8Life(w, tickV8(w, tickBrick3SceneEvents(w, tickBrick3Memory(w, tickPeiAutonomy(w, tickBrick3DateSocial(w, tickBrick3Invitations(w, next))))))));
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
  return tickV8Conflict(w, tickV8Life(w, tickV8(w, tickBrick3SceneEvents(w, tickBrick3Memory(w, tickPeiAutonomy(w, tickBrick3DateSocial(w, tickBrick3Invitations(w, s))))))));
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
  const context = (s.messages[appId] ?? []).filter((item) => item.title === thread && !item.outgoing).slice(-5).map((item) => item.body).join(" ");
  const isInvitation = /邀請|聚餐|聚會|約會|吃飯|見面|市集|展覽|週五|週末|活動/.test(context);
  const refusal = /不去|不能去|沒空|不方便|不想|不要|拒絕|改天|下次|先不/.test(raw);
  const acceptance = /^(好|好啊|好呀|可以|我去|我會去|算我一個|有空|願意)[！!。\\s]*$/.test(raw.trim());
  const detailRequest = /幾點|時間|在哪|哪裡|地點|地址|什麼時候|哪天/.test(raw);
  const decision = isInvitation && (refusal || acceptance || detailRequest)
    ? { thread, event: "invitation", status: refusal ? "declined" : acceptance ? "interested" : "details_requested", text: raw, at: s.elapsedMs ?? 0 }
    : null;
  const priorDecisions = Array.isArray(s.ui?.player?.storyDecisions) ? s.ui.player.storyDecisions as NonNullable<typeof decision>[] : [];
  const next = {
    ...s,
    ui: { ...s.ui, player: { ...s.ui?.player, customReplies: [...history, raw], storyDecisions: decision ? [...priorDecisions, decision] : priorDecisions }, lastFreeReply: { ...((s.ui?.lastFreeReply ?? {}) as Record<string, string>), [thread]: String(s.elapsedMs ?? 0) } },
    messages: {
      ...s.messages,
      [appId]: [...(s.messages[appId] ?? []), message],
    },
    // A free-text answer resolves the currently offered choices for this conversation.
    choices: s.choices.filter((choice) => {
      const target = choice.target;
      const photoScenes: Record<string, string[]> = {
        "顧時安": ["photo_morning_breakfast", "photo_design_review"],
        "裴知聿": ["photo_dinner_invite", "photo_dinner_arrival", "photo_dinner_at_home", "photo_dinner_hand"],
        "沈硯舟": ["photo_camera_walk", "photo_practice_update"],
        "祁野": ["photo_night_view", "photo_weekend_sport"],
        "陸沉川": ["photo_off_duty", "photo_commercial_shoot"],
      };
      const belongsToPhoto = (photoScenes[thread] ?? []).some((id) =>
        target.startsWith(`brick3-photo-${id}-choice-`));
      const belongs = belongsToPhoto || (thread === "林安" ? target.startsWith("lin-reply-")
        : thread === "沈硯舟" ? /^(reply-shen-|phase[23]-shen-|shen-r|shen-day|shen-major-event-)/.test(target)
        : thread === "裴知聿" ? /^(reply-pei-|phase[23]-pei-|pei-r|pei-day|pei-major-event-)/.test(target)
        : thread === "祁野" ? /^(reply-qi-|phase[23]-qi-|qi-r|qi-day|qi-major-event-)/.test(target)
        : false);
      return !belongs;
    }),
    trace: [...s.trace, `player-custom-reply:${message.id}`],
  } as Runtime;
  rememberBrick3Reply(next, thread, raw, context);
  observeV8Reply(next, thread, raw);
  if (thread === "沈硯舟" || thread === "裴知聿" || thread === "祁野" || thread === "顧時安" || thread === "陸沉川") askV8Psychology(next, thread, raw);
  stopPeiAutonomyOnPlayerReply(next, thread);
  const handledInvitation = appId === "kakao" && respondToBrick3InvitationText(next, thread, raw);
  if (handledInvitation) {
    next.ui = { ...next.ui, scriptedInvitationReply: { ...((next.ui?.scriptedInvitationReply ?? {}) as Record<string, string>), [thread]: message.id } };
  } else {
    dismissBrick3InvitationOnCustomReply(next, thread);
  }
  dismissBrick3JealousyOnCustomReply(next, thread);
  return next;
}

export function choose(w: Work, s: Runtime, id: string) {
  const clash = chooseV8Conflict(w, s, id);
  if (clash !== null) return clash;
  const v8life = chooseV8Life(w, s, id);
  if (v8life !== null) return v8life;
  const v8 = chooseV8(w, s, id);
  if (v8 !== null) return v8;
  const social = chooseBrick3JealousyInquiry(w, s, id);
  if (social !== null) return social;
  const special = chooseBrick3Invitation(w, s, id);
  if (special !== null) return special;
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
