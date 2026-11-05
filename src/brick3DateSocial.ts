import invitationConfig from "../docs/brick3-repeat-invitations-v1.json";
import { makeItem, type Runtime, type Work } from "./schema";

/**
 * A completed outing may be shared as an Instagram Story or post.
 * All four other leads feel some jealousy, but inquiries are optional,
 * delayed, and private-contact gated. Nothing exposes affection values.
 */
type DateActivity = (typeof invitationConfig.activities)[number];
type Lead = { key: string; name: string; contactFlag?: string; questions: string[]; responses: string[] };
const leads: Lead[] = [
  {
    key: "shen", name: "沈硯舟",
    questions: [
      "剛滑到那則限動。你們去的地方看起來很適合拍照，妳玩得開心嗎？",
      "我看到他發的那張照片了。光線真的不錯。妳也有一起去嗎？",
    ],
    responses: [
      "原來如此。我只是好奇那個地方，沒有要追問妳。",
      "嗯，我知道。跟誰出去是妳自己的安排。",
      "欸……有一點吧。不過妳不用因為這個解釋什麼。",
      "好，抱歉。那我不問了。",
    ],
  },
  {
    key: "pei", name: "裴知聿",
    questions: [
      "我看到那則動態了。照片倒是拍得不錯。至於配文……他挺會讓人多想的。妳跟他去的？",
      "他那篇貼文寫得很巧。明明沒提名字，卻又像生怕別人看不懂。妳怎麼看？",
    ],
    responses: [
      "我猜到了。倒是他，挺會挑時間發文的。",
      "我有說你們不是朋友嗎？妳倒是先替他澄清了。",
      "妳明知道，還要我親口說？",
      "好。既然不想談，就當我沒問。",
    ],
  },
  {
    key: "qi", name: "祁野",
    questions: [
      "欸，我看到那傢伙發的限動了。妳跟他出去玩？",
      "剛滑到他的貼文。那地方我也去過，妳今天也在？",
    ],
    responses: [
      "喔，這樣啊。那地方確實還行。",
      "知道啦。我又沒說妳不能去。",
      "嘖，被妳發現了？算我多嘴。",
      "行，不問了。妳不用跟我報備。",
    ],
  },
  {
    key: "gu", name: "顧時安",
    questions: [
      "剛好看到那則貼文，景色很漂亮。妳今天也一起去了嗎？",
      "那張限動的取景很不錯，想到妳可能會喜歡。今天過得還好嗎？",
    ],
    responses: [
      "原來是這樣。那天氣看起來很好，真替妳開心。",
      "理解。和朋友出去走走本來就很正常。",
      "哈哈，有一點在意。不過我不想讓妳有壓力。",
      "沒問題，我尊重妳。換個話題吧。",
    ],
  },
  {
    key: "lu", name: "陸沉川", contactFlag: "lu_private_contact",
    questions: [
      "剛好看到那張貼文。現場的光線處理得不錯，妳也去了？",
      "看見那則動態。那個地方我之前工作經過過，妳覺得怎麼樣？",
    ],
    responses: [
      "了解。那個場景很有意思，謝謝妳分享。",
      "嗯，妳不需要跟我交代行程。",
      "也許有一點在意，但我不會拿這件事要求妳什麼。",
      "好。我不會追問。",
    ],
  },
];
// Higher jealousy sharpens Pei's questions; he gets quieter, not louder.
const peiIntenseQuestions = [
  "我看到那則動態了。妳應該知道，我在意的不是照片拍得好不好。……你們現在很常一起出去？",
  "他發那篇貼文，留了不少讓人猜的空間。我倒是想知道，妳怎麼看待你們現在的關係。",
];
const replies = [
  "嗯，我們剛好一起去走走。",
  "只是朋友出門，沒有別的意思。",
  "你是不是有點在意？",
  "我不太想聊這件事。",
];
const captions: Record<string, string> = {
  shen_night_view_outing: "晚上的城市比想像中漂亮。今天有個人陪我一起看，拍照也變得不一樣了。",
  pei_dinner_outing: "今天煮了晚餐。難得不是一個人吃，挺好的。",
  qi_city_lights_outing: "本來只想隨便走走。有人同行，這晚還不錯。",
  gu_architecture_walk: "老屋街區的細節很迷人。謝謝今天一起走完導覽的人。",
  lu_photo_exhibit: "非工作日的攝影展。有人一起討論作品，是不同的體驗。",
};

export type Brick3JealousInquiry = {
  atMs: number;
  sent: boolean;
  answered: boolean;
  replyAtMs?: number;
  replyText?: string;
};
export type Brick3DateSocialProgress = {
  postAtMs: number;
  posted: boolean;
  format: "story" | "post";
  inquiries: Record<string, Brick3JealousInquiry>;
};

const now = (s: Runtime) => s.elapsedMs ?? 0;
const time = (s: Runtime) => `${s.date ?? "2026-11-03"} ${s.time}`;
const clamp = (n: number) => Math.max(0, Math.min(100, n));
function stableRoll(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
const pick = (s: Runtime, a: DateActivity, key: string) =>
  stableRoll(`${a.id}:${s.brick3Invites?.[a.id]?.completedAtMs ?? 0}:${key}`);
const eventName = (a: DateActivity, observer: Lead) => `jealous_${a.id}_${observer.key}`;
const optionPrefix = (a: DateActivity, observer: Lead) =>
  `brick3-photo-${eventName(a, observer)}-choice-`;
function delivered(s: Runtime, id: string): boolean {
  return (s.messages.kakao ?? []).some(i => i.id === id);
}
function sendKkt(s: Runtime, lead: Lead, id: string, body: string, optionsEvent = "", outgoing = false) {
  if (delivered(s, id)) return;
  s.messages.kakao ??= [];
  s.messages.kakao.push(makeItem({
    id, title: lead.name, sender: outgoing ? "我" : lead.name, body,
    outgoing, time: time(s),
    meta: { source: "brick3-date-social", ...(optionsEvent ? { photoEventId: optionsEvent } : {}) },
  }));
  if (!outgoing) s.notifications.push(`${lead.name}：${body}`);
}
function canMessage(w: Work, s: Runtime, lead: Lead) {
  return (!lead.contactFlag || s.variables[lead.contactFlag] === true)
    && (w.data.kakao ?? []).some(item => item.title === lead.name);
}
export function tickBrick3DateSocial(w: Work, s: Runtime): Runtime {
  if (w.id !== "between-the-lines-b-demo") return s;
  for (const a of invitationConfig.activities) {
    const invitation = s.brick3Invites?.[a.id];
    // A migrated legacy photo never creates a fake, retroactive public date.
    if (!invitation?.completed || invitation.completedAtMs === undefined) continue;
    s.brick3DateSocial ??= {};
    let state = s.brick3DateSocial[a.id];
    if (!state) {
      const format = pick(s, a, "format") % 2 === 0 ? "story" : "post";
      state = {
        format, posted: false,
        postAtMs: invitation.completedAtMs + (15 + pick(s, a, "post-delay") % 96) * 60000,
        inquiries: {},
      };
      s.brick3DateSocial[a.id] = state;
    }
    if (!state.posted && now(s) >= state.postAtMs) {
      state.posted = true;
      const isStory = state.format === "story";
      const postId = `brick3-social-${a.id}-instagram`;
      s.messages.instagram ??= [];
      if (!s.messages.instagram.some(item => item.id === postId)) {
        s.messages.instagram.push(makeItem({
          id: postId, title: a.characterName + (isStory ? "｜限時動態" : "｜貼文"),
          sender: a.characterName, body: captions[a.id] ?? "今天一起出門，留下了很好的回憶。",
          kind: "post", time: time(s), folder: isStory ? "Story" : "",
          // Reuse the ONE event photo. When absent, the IG text post remains visible.
          media: `./story-photos/${a.characterId}/${a.eventPhoto}`,
          meta: { source: "brick3-date-social", story: String(isStory), activityId: a.id },
        }));
      }
      for (const observer of leads) {
        if (observer.name === a.characterName) continue;
        const key = observer.key + "_jealousy";
        const prev = typeof s.variables[key] === "number" ? Number(s.variables[key]) : 0;
        const delta = 4 + pick(s, a, observer.key + "-jealousy") % 6;
        s.variables[key] = clamp(prev + delta);
        // Independent chance; not all four need to question the player.
        if (!canMessage(w, s, observer)) continue;
        const closeness = typeof s.variables[observer.key + "_attraction"] === "number"
          ? Number(s.variables[observer.key + "_attraction"]) : 0;
        const chance = Math.min(80, 45 + Math.floor(closeness / 5));
        if (pick(s, a, observer.key + "-inquire") % 100 >= chance) continue;
        state.inquiries[observer.key] = {
          atMs: now(s) + (25 + pick(s, a, observer.key + "-delay") % 176) * 60000,
          sent: false, answered: false,
        };
      }
    }
    for (const observer of leads) {
      const pending = state.inquiries[observer.key];
      if (!pending) continue;
      if (!pending.sent && now(s) >= pending.atMs) {
        // Keep a small gap when the same NPC has just started another dialogue.
        const recent = (s.ui?.scriptedThreadDelivery ?? {}) as Record<string, number>;
        if (recent[observer.name] !== undefined && now(s) - recent[observer.name] < 120000) continue;
        pending.sent = true;
        const jealousy = Number(s.variables[observer.key + "_jealousy"] ?? 0);
        const questionPool = observer.key === "pei" && jealousy >= 40
          ? peiIntenseQuestions : observer.questions;
        const body = questionPool[pick(s, a, observer.key + "-line") % questionPool.length];
        sendKkt(s, observer, `brick3-social-${a.id}-inquiry-${observer.key}`, body, eventName(a, observer));
        s.choices.push(...replies.map((label, i) => ({
          label, target: optionPrefix(a, observer) + (i + 1),
        })));
        s.ui ??= {};
        s.ui.scriptedThreadDelivery = { ...recent, [observer.name]: now(s) };
      }
      if (pending.replyAtMs !== undefined && now(s) >= pending.replyAtMs) {
        pending.replyAtMs = undefined;
        sendKkt(s, observer, `brick3-social-${a.id}-response-${observer.key}`,
          pending.replyText ?? "知道了，我不再問了。");
        pending.replyText = undefined;
      }
    }
  }
  return s;
}

/** Returns null for unrelated choices; never interprets a player reply as date consent. */
export function chooseBrick3JealousyInquiry(w: Work, previous: Runtime, target: string): Runtime | null {
  if (w.id !== "between-the-lines-b-demo") return null;
  for (const a of invitationConfig.activities) for (const observer of leads) {
    const prefix = optionPrefix(a, observer);
    if (!target.startsWith(prefix)) continue;
    if (!previous.choices.some(c => c.target === target)) return previous;
    const index = Number(target.slice(prefix.length)) - 1;
    const pending = previous.brick3DateSocial?.[a.id]?.inquiries[observer.key];
    if (!pending?.sent || pending.answered || !Number.isInteger(index) || index < 0 || index >= 4) return previous;
    const s = structuredClone(previous);
    const p = s.brick3DateSocial![a.id].inquiries[observer.key];
    p.answered = true;
    p.replyAtMs = now(s) + 2200;
    p.replyText = observer.responses[index];
    s.choices = s.choices.filter(c => !c.target.startsWith(prefix));
    sendKkt(s, observer, `brick3-social-${a.id}-choice-${observer.key}`, replies[index], "", true);
    // A reassuring or teasing answer may change jealousy slightly, never revealing it.
    const key = observer.key + "_jealousy";
    const previousJealousy = typeof s.variables[key] === "number" ? Number(s.variables[key]) : 0;
    s.variables[key] = clamp(previousJealousy + (index === 1 ? -2 : index === 2 ? 1 : 0));
    return s;
  }
  return null;
}
export function dismissBrick3JealousyOnCustomReply(s: Runtime, thread: string): void {
  const lead = leads.find(item => item.name === thread);
  if (!lead) return;
  for (const a of invitationConfig.activities) {
    const pending = s.brick3DateSocial?.[a.id]?.inquiries[lead.key];
    if (!pending?.sent || pending.answered) continue;
    const prefix = optionPrefix(a, lead);
    if (!s.choices.some(choice => choice.target.startsWith(prefix))) continue;
    pending.answered = true;
    s.choices = s.choices.filter(choice => !choice.target.startsWith(prefix));
  }
}
