/**
 * 《磚3》裴知聿 V4：將 10 組照片／四選一對話編譯成原生 Work 節點。
 * 圖片由玩家手動上傳；聊天附件不自動加入玩家相簿。
 * 不因玩家讀取聊天室、接受晚餐或高好感度而認定親密同意。
 */
const NAME = "裴知聿";
const ROOT = "brick3-photo-pei_zhiyu_v4_";
const IMG = /^public\/story-photos\/pei_zhiyu\/pei_zhiyu_[a-z0-9_]+\.webp$/;
const TIMES = ["22:25", "09:30", "22:10", "10:50", "15:40", "20:00", "22:45", "23:05", "19:00", "21:30"];
const HOURS = 86400000;
const node = (id, type, rest = {}) => ({ id, type, label: id, once: true, ...rest });
const set = (key, value) => ({ type: "variable", key, value });
const show = (key) => ({ type: "unlock", key, value: true });
const contact = { key: "pei_v4_contact_active", op: "eq", value: true };
function addMessage(chat, id, senderId, body, other = {}) {
  chat.messages.push({
    id, senderId, body, title: "", time: "21:18", hidden: true, ...other,
  });
}
export function injectBrick3PeiPhotoV4(story, manifest) {
  if (story.id !== "between-the-lines-b-demo") return story;
  if (story.events.some(e => e.id === ROOT + "01-time")) return story;
  if (!Array.isArray(manifest?.events) || manifest.events.length !== 10) return story;
  const chat = story.chats.find(c => c.app === "kakao" && c.title === NAME);
  if (!chat) return story;
  const sender = chat.participants.find(id => id !== "owner");
  if (!sender) return story;
  const scenes = manifest.events;
  if (scenes.some((e, i) =>
    e.characterId !== "pei_zhiyu" || e.choices?.length !== 4 ||
    e.images?.length !== 1 || !IMG.test(e.images[0].path) ||
    e.images[0].assetId !== e.images[0].originalPhotoId ||
    !e.chatSequence?.some(line => line.kind === "image") ||
    !Array.isArray(e.onChoiceResponses?.[e.choices[0].id]?.reply))) return story;

  // The player must have actually re-engaged; merely reading a message
  // or the NPC liking the player does not establish permission for photos.
  const entryPoints = ["reply-pei-1", "pei-day21-reply-1"]
    .map(id => story.events.find(e => e.id === id)).filter(Boolean);
  if (!entryPoints.length) return story;
  const readyKey = n => "pei_v4_photo_ready_" + String(n).padStart(2, "0");
  const photoId = n => "pei_zhiyu_v4_" + String(n).padStart(2, "0");
  const prefix = n => "brick3-photo-" + photoId(n);
  const push = n => { story.events.push(n); return n.id; };
  const gateNode = n => {
    const id = prefix(n) + "-cooldown";
    if (!story.events.some(e => e.id === id)) {
      push(node(id, "delay", { delayMs: HOURS, next: [id + "-ready"] }));
      push(node(id + "-ready", "action", { actions: [set(readyKey(n), true)] }));
    }
    return id;
  };
  for (const p of entryPoints) {
    p.next ??= [];
    const gate = gateNode(1);
    if (!p.next.includes(gate)) p.next.push(gate);
  }

  // Extra prompts record *explicit* player opt-in to L2 and L3 photos.
  // With no opt-in, those scenes never become eligible.
  function consentPrompt(level) {
    const key = "pei_zhiyu_v4_consent_" + level;
    const pre = "brick3-photo-" + key;
    const question = level === 2
      ? "我最近偶爾會拍運動後的照片。妳會介意我傳給妳嗎？"
      : "有些照片比平常更私密一點。妳不想看就直接說，我不會傳。";
    const options = level === 2
      ? [
        ["可以，運動後的自拍沒關係。", "知道了。哪天有拍再給妳看。", 2, 6],
        ["普通生活照就好。", "行，我記住了。", 1, 9],
        ["我不太想再收到自拍。", "好，不會再突然傳自拍。", 0, 9],
        ["先不要，之後再說。", "嗯，不急。", 1, 9],
      ]
      : [
        ["我可以接受，但別傳太露骨的。", "我有分寸。妳不舒服就直接說。", 3, 7],
        ["一般照片就好了。", "好，照妳的意思。", 1, 9],
        ["我現在還不確定。", "那就不傳。", 2, 9],
        ["不要再傳曖昧照片。", "知道了。以後不傳這一類。", 1, 9],
      ];
    addMessage(chat, pre + "-question", sender, question, {
      meta: { source: "brick3-pei-photo-v4", photoEventId: key },
    });
    push(node(pre + "-ask", "action", {
      actions: [show(pre + "-question")],
      next: [pre + "-options"],
    }));
    const choices = options.map((_, i) => pre + "-choice-" + (i + 1));
    push(node(pre + "-options", "choice", { next: choices }));
    options.forEach(([text, reply, levelChosen, nextScene], i) => {
      const id = choices[i];
      addMessage(chat, id + "-out", "owner", text, { outgoing: true, meta: { source: "brick3-pei-photo-v4" } });
      addMessage(chat, id + "-in", sender, reply, { meta: { source: "brick3-pei-photo-v4" } });
      const effects = [show(id + "-out"), set("pei_v4_photo_consent_level", levelChosen)];
      if (level === 2 && i === 2) effects.push(set("pei_v4_no_selfies", true));
      if (level === 3 && i === 3) effects.push(set("pei_v4_no_suggestive", true));
      push(node(id, "action", { label: text, actions: effects, next: [id + "-wait"] }));
      push(node(id + "-wait", "delay", { delayMs: 1800, next: [id + "-reply"] }));
      push(node(id + "-reply", "action", {
        actions: [show(id + "-in")], next: [gateNode(nextScene)],
      }));
    });
    const delayId = pre + "-wait-before-asking";
    push(node(delayId, "delay", { delayMs: level === 2 ? 7200000 : 3600000, next: [pre + "-ask"] }));
    return delayId;
  }
  const optInL2 = consentPrompt(2);
  const optInL3 = consentPrompt(3);

  scenes.forEach((entry, idx) => {
    const n = idx + 1;
    const key = photoId(n);
    const pre = prefix(n);
    const lines = entry.chatSequence.filter(l => l.kind === "text").map(l => l.body);
    const image = entry.images[0];
    const checks = [
      { key: readyKey(n), op: "eq", value: true },
      contact,
      { key: "pei_v4_stop_all_photos", op: "neq", value: true },
    ];
    if (n === 1 || n === 2 || n === 4 || n === 6 || n === 7 || n === 8) {
      checks.push({ key: "pei_v4_no_selfies", op: "neq", value: true });
    }
    if (n === 6 || n === 7 || n === 8) {
      checks.push({ key: "pei_v4_no_suggestive", op: "neq", value: true });
      checks.push({ key: "pei_v4_photo_consent_level", op: "gt", value: n === 6 ? 1 : 2 });
    }
    // A daily candidate: after the cooldown and only at a time suitable to
    // the authored scene. Never unlocked by opening the chat.
    push(node(pre + "-time", "event", {
      event: "time", target: TIMES[idx], conditions: checks,
      next: [pre + "-opening"],
    }));
    const meta = { source: "brick3-pei-photo-v4", photoEventId: key };
    const picMeta = { ...meta, assetId: image.assetId, photographerId: "pei_zhiyu", captureMethod: image.captureMethod };
    addMessage(chat, pre + "-text-1", sender, lines[0] || entry.message, { meta });
    addMessage(chat, pre + "-image", sender, "照片", {
      kind: "image", media: "./" + image.path.slice("public/".length), meta: picMeta,
    });
    addMessage(chat, pre + "-text-2", sender, lines.slice(1).join("\n") || entry.message, { meta });
    push(node(pre + "-opening", "action", {
      actions: [
        show(pre + "-text-1"),
        { type: "notification", key: "", value: NAME + "：" + (lines[0] || entry.message) },
      ],
      next: [pre + "-image-wait"],
    }));
    push(node(pre + "-image-wait", "delay", { delayMs: 1700, next: [pre + "-image-arrive"] }));
    push(node(pre + "-image-arrive", "action", {
      actions: [show(pre + "-image")], next: [pre + "-text-wait"],
    }));
    push(node(pre + "-text-wait", "delay", { delayMs: 1900, next: [pre + "-text-arrive"] }));
    push(node(pre + "-text-arrive", "action", {
      actions: [show(pre + "-text-2")], next: [pre + "-options"],
    }));
    const choices = entry.choices.map((_, i) => pre + "-choice-" + (i + 1));
    push(node(pre + "-options", "choice", { next: choices }));
    entry.choices.forEach((option, i) => {
      const id = choices[i];
      const outcome = entry.onChoiceResponses?.[option.id] ?? {};
      const text = Array.isArray(outcome.reply) && outcome.reply.length
        ? outcome.reply.join("\n") : "嗯，我知道了。";
      const effect = outcome.stateEffects ?? {};
      addMessage(chat, id + "-out", "owner", option.text, { outgoing: true, meta: { source: "brick3-pei-photo-v4" } });
      addMessage(chat, id + "-in", sender, text, { meta: { source: "brick3-pei-photo-v4" } });
      const actions = [show(id + "-out"), set("pei_v4_last_photo_choice", key + ":" + (i + 1))];
      const isBoundary = effect.respectBoundary === true && (effect.choiceIntent === "boundary" || effect.choiceIntent === "boundary-check");
      if (isBoundary && n >= 6 && n <= 8) {
        actions.push(set("pei_v4_no_suggestive", true), set("pei_v4_photo_consent_level", 1));
      }
      let follow = [];
      if (n < 5) follow = [gateNode(n + 1)];
      else if (n === 5) follow = effect.pause ? [gateNode(9)] : [optInL2];
      else if (n === 6) follow = isBoundary ? [gateNode(9)] : [optInL3];
      else if (n === 7) follow = isBoundary ? [gateNode(9)] : [gateNode(8)];
      else if (n === 8) follow = [gateNode(9)];
      else if (n === 9) follow = [gateNode(10)];
      push(node(id, "action", { label: option.text, actions, next: [id + "-wait"] }));
      push(node(id + "-wait", "delay", { delayMs: 2200, next: [id + "-reply"] }));
      push(node(id + "-reply", "action", { actions: [show(id + "-in")], next: follow }));
    });
  });
  // Do not increment the revision just for a backward-compatible addition:
  // doing so would erase valid local saves via the current Phone loader.
  return story;
}
