/**
 * Compile-time bridge: authored Brick3 photo manifest -> native Work v1 story nodes.
 * Photos are uploaded separately; missing media never creates a false player memory.
 */
const anchors = {
  photo_design_review: "gu-life-01",
  photo_dinner_invite: "pei-day21-opening",
  photo_camera_walk: "shen-phase2-1-1-in",
  photo_practice_update: "shen-autonomy-v3-day2",
  photo_night_view: "qi-autonomy-v3-day2",
  photo_weekend_sport: "qi-autonomy-v3-day3",
};
const delayed = {
  photo_design_review: 90000,
  photo_dinner_invite: 120000,
  photo_camera_walk: 90000,
  photo_practice_update: 120000,
  photo_night_view: 120000,
  photo_weekend_sport: 180000,
};
const alternatives = {
  photo_dinner_invite: ["可以，妳到了再傳訊息給我。", "嗯，還是要先問妳願不願意。", "好，我自己吃也沒關係。", "只有吃飯。其他的事，妳沒答應我就不會擅自決定。"],
  photo_dinner_at_home: ["我也很高興，今晚就先好好吃飯。", "可以。妳願意的話，我牽妳。", "好，妳不想聊就先不聊。", "好，我幫妳把東西收一收。"],
  photo_camera_walk: ["那時候剛好夕陽出來，我也很喜歡。", "在活動附近的街口，我拍完就回學校了。", "可以，妳有空再約，不用勉強。", "沒關係，我也只是想分享今天看到的。"],
  photo_practice_update: ["有贏，最後一球差點沒投進。", "哈哈，現在累到只想坐著。", "有，不過剛打完球的樣子很狼狽。", "嗯，我去洗澡，晚點再說。"],
  photo_weekend_sport: ["誰說我不練？只是沒必要一直講。", "嗯，今天打得還行。", "有機會再說，得先看妳有沒有空。", "行，那妳先忙。"],
  photo_off_duty: ["嗯，今天工作排得很滿。", "是有點。現在終於能休息。", "我等一下再看，謝了。", "好，晚點聊。"],
  photo_commercial_shoot: ["工作上就是這樣。私底下沒那麼講究。", "服裝形象拍攝，還在整理成品。", "嗯，謝謝。", "好，妳先忙。"],
};
const isPhotoPath = (path) => /^public\/story-photos\/(shen_yanzhou|pei_zhiyu|qi_ye|gu_shian|lu_chenchuan)\/[a-z0-9_]+\.webp$/.test(path);
const node = (id, type, extra = {}) => ({ id, label: id, type, once: true, ...extra });
const unlock = (key) => ({ type: "unlock", key, value: true });
const setFlag = (key, value) => ({ type: "variable", key, value });
const photoMedia = (photo) => "./" + photo.path.slice("public/".length);

function replyFor(entry, option, index) {
  const specific = entry.onChoiceResponses?.[option.id]?.reply;
  if (Array.isArray(specific) && specific.length) return specific.join("\n");
  if (entry.eventId === "photo_night_view") {
    const key = ["night_view_inquiry", "night_view_tease", "night_view_care", "night_view_cool"][index];
    const text = entry.branchResponses?.[key]?.npcMessages;
    if (Array.isArray(text) && text.length) return text.join("\n");
  }
  return alternatives[entry.eventId]?.[index] ?? "我知道了，妳先忙自己的事。";
}
function addChat(chat, id, senderId, body, extra = {}) {
  chat.messages.push({ id, senderId, body, time: "21:18", title: "", hidden: true, ...extra });
}
function addAlbum(story, id, photo, character, folder) {
  if (!isPhotoPath(photo.path)) return null;
  story.content.photos ??= [];
  story.content.photos.push({
    id, title: character + "・" + folder, body: folder,
    sender: "妳", time: story.phone.date + " " + story.phone.time,
    kind: "image", media: photoMedia(photo), hidden: true, folder,
    meta: { assetId: photo.assetId, source: "brick3-photo-event" },
  });
  return id;
}
function findAnchor(story, messageId) {
  return story.events.find((event) =>
    (event.actions ?? []).some((action) => action.type === "unlock" && action.key === messageId));
}

/**
 * Isolated to the active Brick3 script. Other templates and versions are unchanged.
 * Calling twice on the same in-memory object is idempotent.
 */
export function injectBrick3PhotoEvents(story, manifest) {
  if (story.id !== "between-the-lines-b-demo") return story;
  if (story.events.some((e) => e.id === "brick3-photo-photo_morning_breakfast-arrive")) return story;
  if (!Array.isArray(manifest?.events)) return story;
  if (!(story.installedApps ?? []).some((a) => (typeof a === "string" ? a : a.id) === "photos")) return story;

  for (const entry of manifest.events) {
    if (!Array.isArray(entry.choices) || entry.choices.length !== 4) continue;
    const chat = story.chats.find((c) => c.app === "kakao" && c.title === entry.characterName);
    // Lu Chen-chuan is added only when his real introduction/contact exists.
    if (!chat) continue;
    const senderId = chat.participants.find((person) => person !== "owner");
    if (!senderId) continue;
    const prefix = "brick3-photo-" + entry.eventId;
    const arriveId = prefix + "-arrive";
    const arrivalActions = [];
    const visit = entry.eventId === "photo_dinner_at_home";
    const captionId = prefix + "-caption";
    addChat(chat, captionId, senderId,
      visit ? "妳到了？飯還熱，先進來吧。" : entry.message,
      { meta: { photoEventId: entry.eventId, source: "brick3-photo-event" } });
    arrivalActions.push(unlock(captionId));

    const uploadedImages = entry.images.filter((photo) => isPhotoPath(photo.path));
    if (visit) {
      uploadedImages.forEach((photo, index) => {
        const albumId = addAlbum(story, prefix + "-album-" + (index + 1), photo, entry.characterName, "裴知聿家・晚餐");
        // A hand-holding image requires a later explicit choice, never dinner attendance alone.
        if (albumId && !/hands/.test(photo.filename)) arrivalActions.push(unlock(albumId));
      });
    } else {
      uploadedImages.filter((photo) => photo.usage === "chat_attachment").forEach((photo, index) => {
        const assetId = prefix + "-image-" + (index + 1);
        addChat(chat, assetId, senderId, "照片", {
          kind: "image", media: photoMedia(photo),
          meta: { photoEventId: entry.eventId, assetId: photo.assetId, source: "brick3-photo-event" },
        });
        arrivalActions.push(unlock(assetId));
        if (entry.eventId === "photo_night_view") {
          const albumId = addAlbum(story, prefix + "-album-" + (index + 1), photo, entry.characterName, "祁野・夜景");
          if (albumId) arrivalActions.push(unlock(albumId));
        }
      });
    }
    arrivalActions.push({
      type: "notification", key: "",
      value: entry.characterName + "：" + (visit ? "晚餐已經準備好了。" : entry.message.replace(/\n/g, " ")),
    });
    story.events.push(node(arriveId, "action", {
      actions: arrivalActions,
      next: [prefix + "-options"],
    }));
    const optionIds = entry.choices.map((_, i) => prefix + "-choice-" + (i + 1));
    story.events.push(node(prefix + "-options", "choice", { next: optionIds }));
    entry.choices.forEach((option, index) => {
      const optionId = optionIds[index];
      const outgoingId = optionId + "-out";
      const responseId = optionId + "-response";
      const choiceText = visit && index === 1 ? "可以牽你的手嗎？" : option.text;
      addChat(chat, outgoingId, "owner", choiceText, {
        outgoing: true, meta: { source: "brick3-photo-event" },
      });
      addChat(chat, responseId, senderId, replyFor(entry, option, index), {
        meta: { source: "brick3-photo-event" },
      });
      const actions = [
        unlock(outgoingId),
        setFlag("brick3_photo_" + entry.eventId + "_choice", index + 1),
      ];
      if (entry.eventId === "photo_morning_breakfast" && index === 3)
        actions.push(setFlag("gu_no_early_unsolicited_photos", true));
      const next = [optionId + "-reply-wait"];
      if (entry.eventId === "photo_dinner_invite" && index === 0)
        next.push("brick3-photo-visit-travel");
      if (visit && index === 1) {
        // This choice is an explicitly authored request, not an automatic contact.
        // The asset is only saved after mutual consent is represented by this branch.
        const hands = uploadedImages.find((photo) => /hands/.test(photo.filename));
        const handsId = hands && prefix + "-album-" + (uploadedImages.indexOf(hands) + 1);
        if (handsId) actions.push(unlock(handsId));
      }
      story.events.push(node(optionId, "action", { label: choiceText, actions, next }));
      story.events.push(node(optionId + "-reply-wait", "delay", {
        delayMs: 1800, next: [optionId + "-reply-arrive"],
      }));
      story.events.push(node(optionId + "-reply-arrive", "action", {
        actions: [unlock(responseId)],
      }));
    });
    if (visit) {
      // Arrival is conditional on explicitly accepting the invitation.
      story.events.push(node("brick3-photo-visit-travel", "delay", {
        delayMs: 1200000, next: [arriveId],
      }));
      // No independent "start" or passive unlock for visited-home albums.
      continue;
    }
    if (entry.eventId === "photo_morning_breakfast") {
      // Only on a later actual morning, after Gu has already shared household life.
      story.events.push(node(prefix + "-morning-trigger", "event", {
        event: "time", target: "08:00",
        conditions: [
          { key: "completed:gu-life-09-arrive", op: "eq", value: true },
          { key: "gu_no_early_unsolicited_photos", op: "neq", value: true },
        ],
        next: [arriveId],
      }));
    } else {
      const origin = findAnchor(story, anchors[entry.eventId]);
      if (!origin) {
        // Without a verified canon anchor, don't invent a spontaneous event.
        story.events = story.events.filter((e) => !e.id.startsWith(prefix + "-"));
        chat.messages = chat.messages.filter((m) => !m.id.startsWith(prefix + "-"));
        continue;
      }
      const waitId = prefix + "-wait";
      story.events.push(node(waitId, "delay", {
        delayMs: delayed[entry.eventId] ?? 120000,
        next: [arriveId],
      }));
      origin.next ??= [];
      origin.next.push(waitId);
    }
  }
  story.revision = Math.max(story.revision, 42);
  return story;
}
