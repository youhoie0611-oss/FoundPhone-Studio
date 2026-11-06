/**
 * 《磚3》陸沉川新版相識：隔壁商辦大樓。
 * Fifth lead enters through an optional coffee invitation, not an unsolicited DM.
 * Scripted conversations stay independent of player chat-opening behavior.
 */
const prefix = "brick3-photo-";
const node = (id, type, extra = {}) => ({
  id, label: id, type, once: true, ...extra,
});
const unlock = (key) => ({ type: "unlock", key, value: true });
const set = (key, value) => ({ type: "variable", key, value });
const notice = (name, body) => ({
  type: "notification", key: "", value: name + "：" + body,
});
const optionNode = (key, index) => prefix + key + "-choice-" + (index + 1);
function addMessage(chat, id, senderId, body, choiceEvent = "", outgoing = false) {
  const meta = { source: "brick3-v7-lu" };
  if (choiceEvent) meta.photoEventId = choiceEvent;
  chat.messages.push({
    id, senderId, body, title: "", time: "21:18", hidden: true, outgoing, meta,
  });
}
/** Four in-character branches, with real outgoing player messages and delayed NPC responses. */
function addOptions(story, chat, key, entries, nextFor, senderId) {
  const ids = entries.map((_, i) => optionNode(key, i));
  story.events.push(node(prefix + key + "-options", "choice", { next: ids }));
  entries.forEach(([spoken, reply], i) => {
    const id = ids[i];
    addMessage(chat, id + "-out", "owner", spoken, "", true);
    addMessage(chat, id + "-response", senderId, reply);
    story.events.push(node(id, "action", {
      label: spoken,
      actions: [unlock(id + "-out"), set("brick3_" + key + "_choice", i + 1)],
      next: [id + "-reply-wait"],
    }));
    story.events.push(node(id + "-reply-wait", "delay", {
      delayMs: 1800, next: [id + "-reply-arrive"],
    }));
    story.events.push(node(id + "-reply-arrive", "action", {
      actions: [unlock(id + "-response")], next: nextFor(i),
    }));
  });
}
function addScene(story, chat, id, senderId, body, choiceKey, next = []) {
  addMessage(chat, id, senderId, body, choiceKey);
  story.events.push(node(id + "-arrive", "action", {
    actions: [unlock(id), notice(senderId === "linan" ? "林安" : "陸沉川", body.split("\n")[0])],
    next: [...next, ...(choiceKey ? [prefix + choiceKey + "-options"] : [])],
  }));
}
export function injectBrick3V7Lu(story) {
  if (story.id !== "between-the-lines-b-demo") return story;
  if (story.events.some(event => event.id === "v7-lu-group-invite-arrive")) return story;
  const group = story.chats.find(chat => chat.app === "kakao" && chat.title === "下班後五人組");
  const anchor = story.events.find(event => event.id === "friends-group-arrive-4");
  if (!group || !anchor) return story;

  story.contacts.push({
    id: "luchenchuan", name: "陸沉川", hidden: true,
    phone: "", avatar: "",
    bio: "26歲｜隔壁商辦大樓的集團副總裁。沉穩寡言，擅長鋼琴與料理。",
  });
  story.variables.lu_attraction ??= 0;
  story.variables.lu_trust ??= 0;
  story.variables.lu_jealousy ??= 0;
  story.variables.lu_met_near_office ??= false;
  story.variables.lu_private_contact ??= false;
  const lu = { id: "kkt-lu", app: "kakao", title: "陸沉川",
    participants: ["owner", "luchenchuan"], messages: [] };
  story.chats.push(lu);
  story.content.notes ??= [];
  story.content.notes.push({
    id: "v7-lu-first-encounter-note", title: "隔壁大樓的男人",
    body: "下班後，在兩棟商辦大樓之間的咖啡店遇見陸沉川。只知道他在隔壁大樓擔任高階主管，尚不知道他的江南陸家背景。", sender: "妳", time: "18:15", hidden: true,
  });
  addScene(story, group, "v7-lu-group-invite", "linan",
    "隔壁大樓新開了一間咖啡店。下班要不要一起去？\\n聽說那邊的甜點不錯。", "v7_lu_invite");
  story.events.push(node("v7-lu-group-invite-wait", "delay", {
    delayMs: 240000, next: ["v7-lu-group-invite-arrive"],
  }));
  anchor.next ??= [];
  anchor.next.push("v7-lu-group-invite-wait");
  addOptions(story, group, "v7_lu_invite", [
    ["好啊，下班去看看。", "行，我們下班在咖啡店外面碰面。"],
    ["在哪一棟？", "就在我們辦公室旁邊那棟商辦的一樓。妳有空再去。"],
    ["我今天想直接回家。", "好，妳先休息。下次再約。"],
    ["今天工作還沒忙完。", "沒事，別為了喝咖啡趕進度。"],
  ], i => i === 0 ? ["v7-lu-travel-wait"] : [], "linan");
  story.events.push(node("v7-lu-travel-wait", "delay", {
    delayMs: 1200000, next: ["v7-lu-venue-arrival-arrive"],
  }));
  addScene(story, group, "v7-lu-venue-arrival", "linan",
    "我到咖啡店門口了。妳要進來嗎？不方便也沒關係。", "v7_lu_arrival");
  addOptions(story, group, "v7_lu_arrival", [
    ["好，我進去。", "我在靠窗的位置。"],
    ["我還在路上，等我一下。", "好，慢慢來。"],
    ["臨時有事，先不去了。", "收到，下次再約。"],
    ["今天真的太累了。", "那回家休息吧，別勉強。"],
  ], i => i === 0 ? ["v7-lu-office-encounter"] : [], "linan");
  story.events.push(node("v7-lu-office-encounter", "action", {
    actions: [set("lu_met_near_office", true), unlock("v7-lu-first-encounter-note")],
    next: ["v7-lu-second-encounter-wait-1"],
  }));
  story.events.push(node("v7-lu-second-encounter-wait-1", "delay", {
    delayMs: 64800000, next: ["v7-lu-second-encounter-wait-2"],
  }));
  story.events.push(node("v7-lu-second-encounter-wait-2", "delay", {
    delayMs: 64800000, next: ["v7-lu-public-event-arrive"],
  }));
  addScene(story, group, "v7-lu-public-event", "linan",
    "那天咖啡店遇到的男人好像是隔壁大樓的副總。\\n我今天午休又看到他了，妳要一起去買咖啡嗎？", "v7_lu_public");
  addOptions(story, group, "v7_lu_public", [
    ["好啊，午休一起去。", "走吧，順便透透氣。"],
    ["副總？哪間公司的？", "我只知道他在隔壁那棟辦公，其他的也不清楚。"],
    ["我對他沒興趣。", "知道啦，喝咖啡而已。"],
    ["午休排滿了。", "好，那我自己去。"],
  ], i => i === 0 ? ["v7-lu-public-meeting-wait"] : [], "linan");
  story.events.push(node("v7-lu-public-meeting-wait", "delay", {
    delayMs: 900000, next: ["v7-lu-contact-offer-arrive"],
  }));
  addScene(story, group, "v7-lu-contact-offer", "linan",
    "剛才他問妳是不是也在附近上班。\\n如果妳想繼續聊，可以自己決定要不要交換聯絡方式。", "v7_lu_contact");
  addOptions(story, group, "v7_lu_contact", [
    ["可以，交換一下聯絡方式。", "好，妳自己問他就行。"],
    ["今天聊得不錯，但先不用。", "嗯，不用急。"],
    ["只是剛好碰到而已。", "也是，妳不用多想。"],
    ["不了，我先回辦公室。", "好，下午加油。"],
  ], i => i === 0 ? ["v7-lu-exchange-contact-wait"] : [], "linan");
  story.events.push(node("v7-lu-exchange-contact-wait", "delay", {
    delayMs: 60000, next: ["v7-lu-private-contact-arrive"],
  }));
  addMessage(lu, "v7-lu-private-1", "luchenchuan",
    "陸沉川。\\n剛才在咖啡店聊到妳工作的那棟樓。\\n這是我的聯絡方式。", "v7_lu_private");
  addOptions(story, lu, "v7_lu_private", [
    ["原來你真的在隔壁上班。", "嗯，走路過去大概兩分鐘。"],
    ["你平常都去那間咖啡店？", "偶爾。會議之間想找個安靜的地方。"],
    ["副總平常也這麼忙嗎？", "看情況。今天算還好。"],
    ["我先忙工作，晚點聊。", "好，妳先忙。"],
  ], () => [], "luchenchuan");
  story.events.push(node("v7-lu-private-contact-arrive", "action", {
    actions: [set("lu_private_contact", true), unlock("luchenchuan-card"),
      unlock("v7-lu-private-1"), notice("陸沉川", "陸沉川。剛才在咖啡店聊到妳工作的那棟樓。")],
    next: ["brick3-photo-v7_lu_private-options", "v7-lu-private-second-wait"],
  }));
  story.events.push(node("v7-lu-private-second-wait", "delay", {
    delayMs: 18000000, next: ["v7-lu-private-second-arrive"],
  }));
  addMessage(lu, "v7-lu-private-2", "luchenchuan",
    "剛開完會。\\n今天本來想早點回去煮飯。看來又得晚一點。", "v7_lu_evening");
  addOptions(story, lu, "v7_lu_evening", [
    ["你會自己煮飯？", "會。比一直吃外食方便。"],
    ["會議不順利嗎？", "不是，臨時多了幾件要處理的事。"],
    ["你也別忙到忘記吃飯。", "嗯，知道了。妳也是。"],
    ["那你先忙完。", "好，晚點再說。"],
  ], () => [], "luchenchuan");
  story.events.push(node("v7-lu-private-second-arrive", "action", {
    actions: [unlock("v7-lu-private-2")], next: ["brick3-photo-v7_lu_shoot-options"],
  }));
  story.revision = Math.max(story.revision, 44);
  return story;
}
