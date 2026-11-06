import { existsSync } from "node:fs";
/**
 * Compile-time bridge: authored Brick3 photo manifest -> native Work v1 story nodes.
 * Photos are uploaded separately; missing media never creates a false player memory.
 */
const anchors = {
  photo_design_review: "gu-life-01",
  photo_gu_batch01_dog_selfie: "gu-life-18",
  photo_gu_batch01_office_mirror: "gu-life-13",
  photo_gu_batch02_dog_cuddle: "gu-life-07",
  photo_gu_batch02_desk_sketch: "gu-life-05",
  photo_dinner_invite: "pei-day21-opening",
  photo_camera_walk: "shen-phase2-1-1-in",
  photo_practice_update: "shen-autonomy-v3-day1",
  photo_shen_batch01_dorm_morning_selfie: "shen-r4-a-in",
  photo_shen_batch01_classroom_bored_selfie: "shen-r5-a-in",
  photo_shen_batch01_gym_mirror_selfie: "shen-r8-a-in",
  photo_shen_batch01_cafe_editing_break: "shen-r13-a-in",
  photo_shen_batch01_basketball_sunset_selfie: "shen-autonomy-v3-day1",
  photo_shen_batch01_elevator_outfit_selfie: "shen-r15-a-in",
  photo_shen_batch01_convenience_store_night_selfie: "shen-r17-a-in",
  photo_shen_batch01_rainy_neon_selfie: "shen-r22-a-in",
  photo_shen_batch01_izakaya_friends_selfie: "shen-r12-a-in",
  photo_shen_batch01_late_night_desk_selfie: "shen-autonomy-v3-day2",
  photo_night_view: "qi-autonomy-v3-day2",
  photo_weekend_sport: "qi-autonomy-v3-day3",
  photo_qi_batch01_parked_car_selfie: "qi-day11-opening",
  photo_qi_batch01_postgame_sweat: "brick3-photo-photo_weekend_sport-caption",
  photo_qi_batch01_design_desk: "qi-r18-a-in",
  photo_qi_batch01_outfit_mirror: "qi-r19-b-in",
  photo_qi_batch01_night_burger: "qi-autonomy-v3-day3",
  photo_qi_batch01_late_sofa: "qi-autonomy-v3-reply-2-next-day",
  photo_qi_batch01_camera_detail: "qi-r17-b-in",
  photo_qi_batch01_skate_break: "qi-autonomy-v3-day1",
  photo_off_duty: "v7-lu-private-1",
  photo_lu_office_evening: "v7-lu-private-2",
};
const delayed = {
  photo_design_review: 90000,
  photo_gu_batch01_dog_selfie: 120000,
  photo_gu_batch01_office_mirror: 120000,
  photo_gu_batch02_dog_cuddle: 360000,
  photo_gu_batch02_desk_sketch: 180000,
  photo_dinner_invite: 120000,
  photo_camera_walk: 90000,
  photo_practice_update: 120000,
  photo_shen_batch01_dorm_morning_selfie: 3600000,
  photo_shen_batch01_classroom_bored_selfie: 3600000,
  photo_shen_batch01_gym_mirror_selfie: 7200000,
  photo_shen_batch01_cafe_editing_break: 5400000,
  photo_shen_batch01_basketball_sunset_selfie: 10800000,
  photo_shen_batch01_elevator_outfit_selfie: 14400000,
  photo_shen_batch01_convenience_store_night_selfie: 25200000,
  photo_shen_batch01_rainy_neon_selfie: 28800000,
  photo_shen_batch01_izakaya_friends_selfie: 21600000,
  photo_shen_batch01_late_night_desk_selfie: 32400000,
  photo_night_view: 120000,
  photo_weekend_sport: 86400000,
  photo_qi_batch01_parked_car_selfie: 5400000,
  photo_qi_batch01_postgame_sweat: 10800000,
  photo_qi_batch01_design_desk: 7200000,
  photo_qi_batch01_outfit_mirror: 32400000,
  photo_qi_batch01_night_burger: 7200000,
  photo_qi_batch01_late_sofa: 7200000,
  photo_qi_batch01_camera_detail: 9000000,
  photo_qi_batch01_skate_break: 7200000,
  photo_off_duty: 180000,
  photo_lu_office_evening: 240000,
};
const alternatives = {
  photo_dinner_invite: ["可以，妳到了再傳訊息給我。", "嗯，還是要先問妳願不願意。", "好，我自己吃也沒關係。", "只有吃飯。其他的事，妳沒答應我就不會擅自決定。"],
  photo_dinner_at_home: ["我也很高興，今晚就先好好吃飯。", "可以。妳願意的話，我牽妳。", "好，妳不想聊就先不聊。", "好，我幫妳把東西收一收。"],
  photo_camera_walk: ["那時候剛好夕陽出來，我也很喜歡。", "在活動附近的街口，我拍完就回學校了。", "可以，妳有空再約，不用勉強。", "沒關係，我也只是想分享今天看到的。"],
  photo_practice_update: ["有贏，最後一球差點沒投進。", "哈哈，現在累到只想坐著。", "有，不過剛打完球的樣子很狼狽。", "嗯，我去洗澡，晚點再說。"],
  photo_weekend_sport: ["誰說我不練？只是沒必要一直講。", "嗯，今天打得還行。", "有機會再說，得先看妳有沒有空。", "行，那妳先忙。"],
  photo_off_duty: ["算不上什麼大菜。只是想吃點熱的。", "有時間就自己煮。做飯比開會容易讓人放鬆。", "是有點累。但回家做點吃的，反而能把工作放下。", "嗯，妳也早點休息。"],
  photo_lu_office_evening: ["還有幾份資料要確認。不會待太晚。", "偶爾會站在窗邊看一會兒。今晚剛好拍了張。", "算順利。只是比預計久了一點。", "好，妳先忙。"],
};
const luPhotoOrder = ["photo_off_duty", "photo_lu_office_evening", "photo_lu_home_dinner", "photo_lu_piano_evening", "photo_lu_gym_selfie", "photo_lu_friend_dinner", "photo_lu_sunset_walk", "photo_lu_friends_cat", "photo_lu_coffee_break", "photo_lu_quiet_night"];
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
    // Instagram photos belong to the social feed, never to KKT just because they are in the photo manifest.
    // Their social publish/choice events require a separate verified Instagram adapter.
    if (entry.characterId === "gu_shian" && (entry.platform === "instagram_story" || entry.platform === "instagram_post")) continue;
    // Dinner is now one affinity-gated, repeatable invitation with a single
    // gallery reward and an explicit attendance confirmation.
    // Never also deliver the old fixed-day invitation/4-photo visit.
    if (entry.eventId === "photo_dinner_invite" || entry.eventId === "photo_dinner_at_home") continue;
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

    const uploadedImages = entry.images.filter((photo) => isPhotoPath(photo.path) && (entry.characterId !== "lu_chenchuan" || existsSync(photo.path)));
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
        // A chat attachment stays in KKT; it is not silently copied to the player's private gallery.
      });
    }
    arrivalActions.push({
      type: "notification", key: "",
      value: entry.characterName + "：" + (visit ? "晚餐已經準備好了。" : entry.message.replace(/\n/g, " ")),
    });
    // Author-approved Shen Batch01: a small follow-up after the photo, then
    // four reply choices. Other character events retain their original pacing.
    const shenBatch01 = entry.batchId === "shen_yanzhou_batch01";
    const luPhoto = entry.characterId === "lu_chenchuan";
    const followUp = shenBatch01
      ? entry.chatSequence?.find((part, i) =>
          part.kind === "text" && i > 0)?.body
      : luPhoto ? entry.chatSequence?.filter(part => part.kind === "text").at(-1)?.body : null;
    if ((shenBatch01 || luPhoto) && followUp) {
      const followupId = prefix + "-followup-text";
      addChat(chat, followupId, senderId, followUp, {
        meta: { photoEventId: entry.eventId, source: "brick3-shen-photo-batch01" },
      });
      story.events.push(node(prefix + "-followup-wait", "delay", {
        delayMs: luPhoto ? 2500 : 3500, next: [prefix + "-followup-arrive"],
      }));
      story.events.push(node(prefix + "-followup-arrive", "action", {
        actions: [unlock(followupId)],
        next: [prefix + "-options"],
      }));
    }
    story.events.push(node(arriveId, "action", {
      actions: arrivalActions,
      next: [prefix + ((shenBatch01 || luPhoto) && followUp ? "-followup-wait" : "-options")],
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
      const replyActions = [unlock(responseId)];
      if (visit && index === 1) {
        // Unlock a hand-holding photo only after the player's explicit request
        // AND the NPC's consenting response has arrived.
        const hands = uploadedImages.find((photo) => /hands/.test(photo.filename));
        const handsId = hands && prefix + "-album-" + (uploadedImages.indexOf(hands) + 1);
        if (handsId) replyActions.push(unlock(handsId));
      }
      story.events.push(node(optionId, "action", { label: choiceText, actions, next }));
      story.events.push(node(optionId + "-reply-wait", "delay", {
        delayMs: 1800, next: [optionId + "-reply-arrive"],
      }));
      story.events.push(node(optionId + "-reply-arrive", "action", {
        actions: replyActions,
      }));
    });
    if (visit) {
      // Accepting an invitation is not the same as arriving. An explicit choice
      // is required before player-taken gallery images become visible.
      const travelId = "brick3-photo-visit-travel";
      const checkpoint = "brick3-photo-visit-checkpoint";
      const arrivalScene = "photo_dinner_arrival";
      const arrivalPrefix = "brick3-photo-" + arrivalScene;
      const arrivalPromptId = arrivalPrefix + "-prompt";
      addChat(chat, arrivalPromptId, senderId,
        "我把晚餐留著了。妳現在到門口了嗎？",
        { meta: { photoEventId: arrivalScene, source: "brick3-photo-event" } });
      story.events.push(node(travelId, "delay", {
        delayMs: 1200000, next: [checkpoint],
      }));
      story.events.push(node(checkpoint, "action", {
        actions: [unlock(arrivalPromptId)],
        next: [arrivalPrefix + "-options"],
      }));
      const arrivalOptions = [
        ["我到了，現在進去。", "門沒鎖，進來吧。飯還熱著。", true],
        ["我還在路上，今天可能來不及。", "沒關係。妳先顧好自己，不用趕。", false],
        ["臨時有事，今晚沒辦法過去。", "嗯，知道了。改天再說。", false],
        ["我改變主意了，今晚先不去了。", "好。妳不用勉強。", false],
      ];
      const arrivalIds = arrivalOptions.map((_, i) => arrivalPrefix + "-choice-" + (i + 1));
      story.events.push(node(arrivalPrefix + "-options", "choice", { next: arrivalIds }));
      arrivalOptions.forEach(([reply, response, actuallyArrived], index) => {
        const id = arrivalIds[index];
        const outgoingId = id + "-out";
        const incomingId = id + "-reply";
        addChat(chat, outgoingId, "owner", reply, {
          outgoing: true, meta: { photoEventId: arrivalScene, source: "brick3-photo-event" },
        });
        addChat(chat, incomingId, senderId, response, {
          meta: { photoEventId: arrivalScene, source: "brick3-photo-event" },
        });
        story.events.push(node(id, "action", {
          label: reply,
          actions: [
            unlock(outgoingId),
            setFlag("brick3_photo_dinner_arrived", Boolean(actuallyArrived)),
          ],
          next: [id + "-reply-wait"],
        }));
        story.events.push(node(id + "-reply-wait", "delay", {
          delayMs: 1800, next: [id + "-reply-arrive"],
        }));
        story.events.push(node(id + "-reply-arrive", "action", {
          actions: [unlock(incomingId)],
          next: actuallyArrived ? [arriveId] : [],
        }));
      });
      // The visit has no independent start or timed auto-completion path.
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
    } else if (luPhoto && luPhotoOrder.indexOf(entry.eventId) > 1) {
      const previous = luPhotoOrder[luPhotoOrder.indexOf(entry.eventId) - 1];
      const predecessors = [1, 2, 3, 4].map(i => story.events.find(e =>
        e.id === "brick3-photo-" + previous + "-choice-" + i + "-reply-arrive")).filter(Boolean);
      if (predecessors.length !== 4) {
        story.events = story.events.filter(e => !e.id.startsWith(prefix + "-"));
        chat.messages = chat.messages.filter(m => !m.id.startsWith(prefix + "-"));
        continue;
      }
      const waitId = prefix + "-wait";
      story.events.push(node(waitId, "delay", {
        delayMs: 86400000 + luPhotoOrder.indexOf(entry.eventId) * 1800000,
        conditions: [
          { key: "lu_private_contact", op: "eq", value: true },
          { key: "lu_photo_sharing_opt_out", op: "neq", value: true },
        ],
        next: [arriveId],
      }));
      predecessors.forEach(origin => { origin.next ??= []; origin.next.push(waitId); });
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
        ...(luPhoto ? { conditions: [
          { key: "lu_private_contact", op: "eq", value: true },
          { key: "lu_photo_sharing_opt_out", op: "neq", value: true },
        ] } : {}),
      }));
      origin.next ??= [];
      origin.next.push(waitId);
    }
  }
  story.revision = Math.max(story.revision, 42);
  return story;
}
