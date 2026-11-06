import { makeItem, type Runtime, type Work } from "../schema";

/** Date-completion effects. Call only after a real completed date, never on invitation. */
const cast = {
  shen: { name: "沈硯舟", reply: "今天真的很開心。下次還能一起出去嗎？", ask: "我看到他的限動了。你們今天一起出去嗎？" },
  pei: { name: "裴知聿", reply: "到家了嗎？今天有幾個瞬間讓我想起以前。", ask: "我看到了他的貼文。你們現在是什麼關係？" },
  qi: { name: "祁野", reply: "今天還行。下次換個地方。", ask: "那張照片是你們一起拍的？" },
  gu: { name: "顧時安", reply: "今天謝謝妳陪我。到家跟我說一聲。", ask: "我看到那張照片了。方便聊聊嗎？" },
  lu: { name: "陸沉川", reply: "今天很愉快。到家後告訴我一聲。", ask: "我看見那則動態。你們今天一起出去了嗎？" },
} as const;
export type DateLead = keyof typeof cast;
const leads = Object.keys(cast) as DateLead[];
const stamp = (s: Runtime) => `${s.date ?? "2026-11-07"} ${s.time}`;
const number = (s: Runtime, key: string) => Number(s.variables[key] ?? 0) || 0;
const add = (s: Runtime, key: string, amount: number) => {
  s.variables[key] = Math.max(0, Math.min(100, number(s, key) + amount));
};
const deliver = (s: Runtime, app: string, name: string, body: string, id: string, kind: "text" | "post" = "text", media = "") => {
  if ((s.messages[app] ?? []).some(x => x.id === id)) return;
  const item = makeItem({ id, title: name, sender: name, body, time: stamp(s), kind, media });
  s.messages = { ...s.messages, [app]: [...(s.messages[app] ?? []), item] };
  if (app === "kakao") s.notifications.push(`${name}：${body}`);
};
const available = (w: Work, app: string) => w.apps.some(x => x.id === app && x.installed);
const asset = (w: Work, eventId: string, owner: "player" | "lead") =>
  Object.values(w.data).flat().filter(x => x.meta.dateEventId === eventId && x.meta.dateOwner === owner);

/** Returns a cloned save state, idempotent per eventId. Author must supply 3 photo items in work.data. */
export function completeDate(previous: Runtime, w: Work, lead: DateLead, eventId: string): Runtime {
  if (!leads.includes(lead) || !eventId || !/^[a-zA-Z0-9_-]{1,80}$/.test(eventId)) return previous;
  const marker = `z3_date_done_${eventId}`;
  if (previous.variables[marker] === true) return previous;
  const s = structuredClone(previous);
  s.variables[marker] = true;
  s.variables[`z3_date_last_${lead}`] = eventId;
  const photos = asset(w, eventId, "player").slice(0, 3);
  // Never fabricate images: unlock only authored, uploaded assets.
  for (const item of photos) if (!s.unlocked.includes(item.id)) s.unlocked.push(item.id);
  s.variables[`z3_date_photo_count_${eventId}`] = photos.length;
  if (available(w, "kakao"))
    deliver(s, "kakao", cast[lead].name, cast[lead].reply, `z3-date-followup-${eventId}`);
  // Reuse authored social photo; avoid creating a fake image or revealing player identity.
  const social = asset(w, eventId, "lead")[0];
  const app = available(w, "instagram") ? "instagram" : "";
  if (app) {
    if (social) {
      if (!s.unlocked.includes(social.id)) s.unlocked.push(social.id);
    } else {
      deliver(s, app, cast[lead].name, "今天的行程，值得記住。", `z3-date-post-${eventId}`, "post");
    }
  }
  // Other leads react only when an authored social visibility flag is true.
  // Individual detection may be delayed by the story scheduler.
  s.variables[`z3_date_social_event_${eventId}`] = !!app;
  s.variables[`z3_date_social_lead_${eventId}`] = lead;
  return s;
}

/** Call once per actual social view; never assume all leads saw the post. */
export function noticeDatePost(previous: Runtime, w: Work, eventId: string, viewer: DateLead): Runtime {
  const lead = previous.variables[`z3_date_social_lead_${eventId}`];
  if (!leads.includes(viewer) || lead === viewer || !previous.variables[`z3_date_social_event_${eventId}`]) return previous;
  const marker = `z3_date_seen_${eventId}_${viewer}`;
  if (previous.variables[marker]) return previous;
  const s = structuredClone(previous);
  s.variables[marker] = true;
  const jealousy = number(s, `z3_jealousy_${viewer}`);
  add(s, `z3_jealousy_${viewer}`, 8);
  if (jealousy >= 20 && available(w, "kakao")) {
    s.variables[`z3_date_question_${viewer}`] = eventId;
    deliver(s, "kakao", cast[viewer].name, cast[viewer].ask, `z3-date-question-${eventId}-${viewer}`);
  }
  return s;
}
export const dateReplyOptions = [
  { code: "explain", label: "坦誠說明" },
  { code: "reassure", label: "溫和安撫" },
  { code: "privacy", label: "設立私人界線" },
  { code: "provoke", label: "故意挑釁" },
] as const;
export function answerDateJealousy(previous: Runtime, viewer: DateLead, code: typeof dateReplyOptions[number]["code"]): Runtime {
  const eventId = String(previous.variables[`z3_date_question_${viewer}`] ?? "");
  if (!eventId || !leads.includes(viewer) || !dateReplyOptions.some(x => x.code === code)) return previous;
  const marker = `z3_date_answer_${eventId}_${viewer}`;
  if (previous.variables[marker]) return previous;
  const s = structuredClone(previous);
  s.variables[marker] = code;
  s.variables[`z3_date_question_${viewer}`] = "";
  const responses = {
    explain: "我知道了，謝謝妳直接告訴我。我還需要消化一下。",
    reassure: "嗯，我願意好好談。剛才確實有點在意。",
    privacy: "我明白妳有自己的生活。抱歉，我不該把問題問成審問。",
    provoke: "我不喜歡被拿來比較。我們先冷靜一下。",
  };
  add(s, `z3_jealousy_${viewer}`, { explain: -7, reassure: -12, privacy: 0, provoke: 15 }[code]);
  deliver(s, "kakao", cast[viewer].name, responses[code], `z3-date-answer-${eventId}-${viewer}`);
  // High jealousy marks a possible follow-up, not an automatic uninvited visit.
  if (number(s, `z3_jealousy_${viewer}`) >= 80)
    s.variables[`z3_date_high_jealousy_${viewer}`] = true;
  return s;
}

/** Player may publish an unlocked date photo. Each rival gets +10/+20 only on actual viewing. */
export function publishPlayerDatePhoto(previous:Runtime,w:Work,eventId:string,photoId:string):Runtime {
 const photo=asset(w,eventId,"player").find(x=>x.id===photoId);
 if(!photo||!previous.unlocked.includes(photoId)||!previous.variables[`z3_date_done_${eventId}`]||!available(w,"instagram"))return previous;
 const marker=`z3_date_player_post_${eventId}_${photoId}`;
 if(previous.variables[marker])return previous;
 const s=structuredClone(previous);
 s.variables[marker]=true;
 const media=photo.media;
 deliver(s,"instagram","我","今天的回憶。",marker,"post",media);
 return s;
}
export function noticePlayerDatePost(previous:Runtime,eventId:string,photoId:string,viewer:DateLead):Runtime {
 if(!leads.includes(viewer)||!previous.variables[`z3_date_player_post_${eventId}_${photoId}`])return previous;
 const lead=previous.variables[`z3_date_social_lead_${eventId}`];
 if(viewer===lead)return previous;
 const marker=`z3_date_player_seen_${eventId}_${photoId}_${viewer}`;
 if(previous.variables[marker])return previous;
 const s=structuredClone(previous);
 s.variables[marker]=true;
 add(s,`z3_jealousy_${viewer}`,number(s,`z3_affection_${viewer}`)>=50?20:10);
 if(number(s,`z3_jealousy_${viewer}`)>=40&&!s.variables[`z3_date_question_${viewer}`]){
   s.variables[`z3_date_question_${viewer}`]=eventId;
   deliver(s,"kakao",cast[viewer].name,cast[viewer].ask,`z3-player-post-question-${eventId}-${photoId}-${viewer}`);
 }
 return s;
}
