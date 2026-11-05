/**
 * 《磚3》V7 SE-004「今晚有人陪妳」.
 * Fifth lead enters through an optional group invitation, not an unsolicited DM.
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
  if (story.events.some((event) => event.id === "v7-lu-group-invite-arrive")) return story;
  const group = story.chats.find((chat) => chat.app === "kakao" && chat.title === "下班後五人組");
  const anchor = story.events.find((event) => event.id === "friends-group-arrive-4");
  if (!group || !anchor) return story;

  story.contacts.push({
    id: "luchenchuan", name: "陸沉川", hidden: true,
    phone: "", avatar: "",
    bio: "26歲｜商業模特兒、視覺傳達設計背景；私人生活與工作有清楚界線。",
  });
  story.variables.lu_attraction ??= 0;
  story.variables.lu_trust ??= 0;
  story.variables.lu_jealousy ??= 0;
  story.variables.lu_met_in_service ??= false;
  story.variables.lu_private_contact ??= false;

  const lu = {
    id: "kkt-lu", app: "kakao", title: "陸沉川",
    participants: ["owner", "luchenchuan"], messages: [],
  };
  story.chats.push(lu);
  // The player can discover this only after the actual meeting, not by reading KKT.
  story.content.notes ??= [];
  story.content.notes.push({
    id: "v7-lu-first-encounter-note",
    title: "今晚有人陪妳",
    body: "下班後，我在林安提過的會館見到陸沉川。他是接待我的工作人員，言談得體，但我們沒有交換私人聯絡方式。工作上的親切不代表感情。",
    sender: "妳", time: "21:18", hidden: true,
  });

  // The invitation comes from a friend group on its own schedule.
  addScene(story, group, "v7-lu-group-invite", "linan",
    "我剛知道一間高端男模會館。下班後要不要一起去看看？\n不用勉強，妳不想去我們就換別的活動。",
    "v7_lu_invite");
  story.events.push(node("v7-lu-group-invite-wait", "delay", {
    delayMs: 240000, next: ["v7-lu-group-invite-arrive"],
  }));
  anchor.next ??= [];
  anchor.next.push("v7-lu-group-invite-wait");
  addOptions(story, group, "v7_lu_invite", [
    ["可以，陪妳去看看。", "好，那我們下班在入口碰面。妳到了再決定要不要進去。"],
    ["先跟我說是什麼地方？", "有正式的接待與服務規則。我把公開資訊傳妳，不想去就別去。"],
    ["這種場合我不太有興趣。", "知道了，那下次換個地方。我不會替妳做決定。"],
    ["今天不去了，你們玩。", "好，妳下班就好好休息。"],
  ], (i) => i === 0 ? ["v7-lu-travel-wait"] : [], "linan");

  story.events.push(node("v7-lu-travel-wait", "delay", {
    delayMs: 1200000, next: ["v7-lu-venue-arrival-arrive"],
  }));
  addScene(story, group, "v7-lu-venue-arrival", "linan",
    "我到門口了。妳要進去嗎？如果臨時改變主意，我們可以直接回家。",
    "v7_lu_arrival");
  addOptions(story, group, "v7_lu_arrival", [
    ["嗯，我們進去看看。", "好。先坐一會兒，不自在就直接跟我說。"],
    ["先等等，我還在考慮。", "沒問題。妳決定好了再說，不急。"],
    ["我不太自在，今天先回家。", "好，我陪妳走到外面。"],
    ["算了，改天吧。", "知道了，我不會勉強妳。"],
  ], (i) => i === 0 ? ["v7-lu-service-encounter"] : [], "linan");

  // The actual first meeting happens only after an affirmative venue choice.
  story.events.push(node("v7-lu-service-encounter", "action", {
    actions: [
      set("lu_met_in_service", true),
      unlock("v7-lu-first-encounter-note"),
    ],
    next: ["v7-lu-second-encounter-wait-1"],
  }));
  // A later, separate public creative event; no intimacy or private DM is assumed.
  story.events.push(node("v7-lu-second-encounter-wait-1", "delay", {
    delayMs: 64800000, next: ["v7-lu-second-encounter-wait-2"],
  }));
  story.events.push(node("v7-lu-second-encounter-wait-2", "delay", {
    delayMs: 64800000, next: ["v7-lu-public-event-arrive"],
  }));
  addScene(story, group, "v7-lu-public-event", "linan",
    "我看到一場公開的商業攝影交流活動。上次會館那位陸沉川也會參與。\n這是公開活動，不用購買他的服務。有興趣再去。",
    "v7_lu_public");
  addOptions(story, group, "v7_lu_public", [
    ["好，我想去看看攝影活動。", "可以。先看活動時間，妳有空再過來。"],
    ["他在現場做什麼？", "好像是模特兒兼分享視覺設計經驗。詳情我再查。"],
    ["我對這次活動沒有興趣。", "了解，不用每場都跟。"],
    ["我最近太忙，改天吧。", "妳先忙工作，別為了活動趕行程。"],
  ], (i) => i === 0 ? ["v7-lu-public-meeting-wait"] : [], "linan");
  story.events.push(node("v7-lu-public-meeting-wait", "delay", {
    delayMs: 900000, next: ["v7-lu-contact-offer-arrive"],
  }));
  addScene(story, group, "v7-lu-contact-offer", "linan",
    "活動結束了。剛才你們聊的是攝影構圖吧？\n如果妳想延續話題，可以自己決定要不要交換聯絡方式。",
    "v7_lu_contact");
  addOptions(story, group, "v7_lu_contact", [
    ["我想跟他交換聯絡方式。", "好，妳可以直接問他。我不替妳作主。"],
    ["今天聊得不錯，但先不用。", "嗯，聊得來也不用急著交換。"],
    ["我只想參加活動，沒有其他意思。", "當然。這樣就很好。"],
    ["不了，我想先回家。", "好，路上注意。"],
  ], (i) => i === 0 ? ["v7-lu-exchange-contact-wait"] : [], "linan");

  story.events.push(node("v7-lu-exchange-contact-wait", "delay", {
    delayMs: 60000, next: ["v7-lu-private-contact-arrive"],
  }));
  addMessage(lu, "v7-lu-private-1", "luchenchuan",
    "是陸沉川。\n妳剛剛提到那個構圖角度，我後來又想了一下。\n如果妳還有興趣，改天可以聊。");
  story.events.push(node("v7-lu-private-contact-arrive", "action", {
    actions: [
      set("lu_private_contact", true),
      unlock("luchenchuan-card"),
      unlock("v7-lu-private-1"),
      notice("陸沉川", "是陸沉川。關於剛剛聊的攝影構圖。"),
    ],
    next: ["v7-lu-private-second-wait"],
  }));
  story.events.push(node("v7-lu-private-second-wait", "delay", {
    delayMs: 18000000, next: ["v7-lu-private-second-arrive"],
  }));
  addMessage(lu, "v7-lu-private-2", "luchenchuan",
    "今天有個商業攝影要收尾。\n工作的照片整理完，如果可以分享，我再傳給妳。");
  story.events.push(node("v7-lu-private-second-arrive", "action", {
    actions: [unlock("v7-lu-private-2")],
  }));
  // Preserve prior saves only when the actual author revision changes.
  story.revision = Math.max(story.revision, 43);
  return story;
}
