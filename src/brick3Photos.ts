import photoManifest from "../docs/brick3-photo-events-v1.json";
import { itemSchema, nodeSchema, type Action, type Item, type StoryNode, type Work } from "./schema";

/**
 * 《磚3》照片素材約定。圖片由作者上傳 public/story-photos；
 * 文字與選項從配置稿編成真正可遊玩的事件，不在瀏覽器中呼叫圖片 AI。
 */
type PhotoScene = {
  eventId: string;
  characterId: string;
  characterName: string;
  type: string;
  message: string;
  choices: { id: string; text: string }[];
  images: { filename: string; path: string; usage: string; unlock?: Record<string, unknown> }[];
  onChoiceResponses?: Record<string, { reply?: string[]; stateEffects?: { setFlag?: string; flagValue?: boolean } }>;
  branchResponses?: Record<string, { npcMessages?: string[]; conditions?: { requiresChoiceId?: string } }>;
};
const scenes = photoManifest.events as PhotoScene[];
const PREFIX = "brick3-photo-";
export const isBrick3Photo = (media: string) => /^\.\/story-photos\/[a-z0-9_]+\/[a-z0-9_]+\.webp$/.test(media);
export const brick3PhotoPaths = (work: Work) =>
  [...new Set(Object.values(work.data).flat().map((item) => item.media).filter(isBrick3Photo))];

const defaults: Record<string, string[]> = {
  photo_dinner_invite: [
    "好，到了再跟我說一聲。路上注意。",
    "妳以為我只會叫外送？今天剛好有空。",
    "嗯，改天再說。不是非得今天。",
    "妳想多了。至少先吃飯，好嗎？",
  ],
  photo_camera_walk: [
    "那時候光剛好照進巷子裡，我站在原地等了好一會。",
    "活動旁邊那條老街。下午去剛好會有那個光。",
    "可以啊，時間對得上再一起去。",
    "不用懂啊，妳喜不喜歡比較重要。",
  ],
  photo_practice_update: [
    "小贏兩分，最後一球差點沒進。",
    "今天打完真的累，但很過癮。",
    "有拍一張球場的，剛才傳給妳的就是。",
    "好，我去沖澡。晚點再聊。",
  ],
  photo_weekend_sport: [
    "不然呢，我也是會想打贏的。",
    "嗯，今天打得滿痛快。",
    "有機會啊，但我要先問一起打球的朋友。",
    "行，妳先忙。",
  ],
  photo_off_duty: [
    "還行。只是後面臨時加了一場。",
    "看得出來？那我今天真的累了。",
    "等等隨便吃點。妳不用特地替我安排。",
    "嗯。改天聊。",
  ],
  photo_commercial_shoot: [
    "畢竟是在工作。鏡頭前跟平常不太一樣。",
    "服裝形象照。完整的成品還不能公開。",
    "謝了。今天進度很順。",
    "好，妳先忙。",
  ],
  photo_dinner_at_home: [
    "妳能來就好，菜還熱著。",
    "以前記得的事，不代表我覺得妳現在都一樣。",
    "好，我不會逼妳談。",
    "我送妳到門口，路上小心。",
  ],
};
const elapsedForScene: Record<string, number> = {
  photo_camera_walk: 55 * 60 * 1000,
  photo_night_view: 80 * 60 * 1000,
  photo_practice_update: 18 * 60 * 60 * 1000,
  photo_weekend_sport: 19 * 60 * 60 * 1000,
  photo_morning_breakfast: 10 * 60 * 60 * 1000,
  photo_design_review: 24 * 60 * 60 * 1000,
  photo_dinner_invite: 22 * 60 * 60 * 1000,
  photo_off_duty: 4 * 60 * 60 * 1000,
  photo_commercial_shoot: 20 * 60 * 60 * 1000,
};
const answer = (scene: PhotoScene, choice: { id: string; text: string }, i: number): string => {
  const exact = scene.onChoiceResponses?.[choice.id]?.reply;
  if (exact?.length) return exact.join("\n");
  const qi = Object.values(scene.branchResponses ?? {}).find((r) => r.conditions?.requiresChoiceId === choice.id);
  if (qi?.npcMessages?.length) return qi.npcMessages.join("\n");
  return defaults[scene.eventId]?.[i] ?? "嗯，知道了。";
};

export function extendBrick3PhotoWork(work: Work): Work {
  if (work.id !== "between-the-lines-b-demo") return work;
  const data: Work["data"] = { ...work.data, kakao: [...(work.data.kakao ?? [])], photos: [...(work.data.photos ?? [])] };
  const nodes: StoryNode[] = [...work.nodes];
  const knownItems = new Set(Object.values(data).flat().map((i) => i.id));
  const knownNodes = new Set(nodes.map((n) => n.id));
  const createdAt = `${work.phone.date ?? "2026-11-03"} ${work.phone.time}`;
  const put = (app: "kakao" | "photos", raw: Partial<Item> & { id: string; title: string; body: string }) => {
    if (knownItems.has(raw.id)) return;
    knownItems.add(raw.id);
    data[app].push(itemSchema.parse({
      sender: app === "photos" ? work.phone.owner : raw.title,
      time: createdAt,
      hidden: true,
      ...raw,
    }));
  };
  const node = (raw: { id: string; label: string; type: StoryNode["type"]; event?: string; target?: string; next?: string[]; actions?: Action[]; delayMs?: number; conditions?: StoryNode["conditions"] }) => {
    if (knownNodes.has(raw.id)) return;
    knownNodes.add(raw.id);
    nodes.push(nodeSchema.parse({ event: "", target: "", conditions: [], logic: "and", next: [], actions: [], once: true, x: 0, y: 0, ...raw }));
  };
  const unlock = (key: string): Action => ({ type: "unlock", key, value: true });
  const notify = (who: string, msg: string): Action => ({ type: "notification", key: "", value: `${who}：${msg.split("\n")[0]}` });
  const labelFor = (id: string) => `${PREFIX}${id}`;
  const imageId = (id: string, file: string) => `${labelFor(id)}-asset-${file.replace(/\.webp$/, "")}`;
  const addText = (eventId: string, title: string, id: string, body: string, outgoing = false) => {
    put("kakao", { id, title, body, sender: outgoing ? work.phone.owner : title, outgoing, meta: { photoEventId: eventId } });
  };
  const buildChoices = (sceneId: string, title: string, options: string[], response: (n: number) => string, effects?: (n: number) => Action[], next?: (n: number) => string[]) => {
    const root = labelFor(sceneId), optionsNode = `${root}-choices`;
    const ids = options.map((_, i) => `${root}-option-${i + 1}`);
    node({ id: optionsNode, label: title + "：選擇回覆", type: "choice", next: ids });
    options.forEach((text, index) => {
      const id = ids[index], outgoingId = `${id}-player`, npcId = `${id}-npc`;
      addText(sceneId, title, outgoingId, text, true);
      const body = response(index);
      if (body) addText(sceneId, title, npcId, body);
      const responseDelay = `${id}-response-delay`, arrival = `${id}-response`;
      node({
        id, label: text, type: "action",
        actions: [unlock(outgoingId), { type: "variable", key: `photo_choice_${sceneId}`, value: index + 1 }, ...(effects?.(index) ?? [])],
        next: body ? [responseDelay] : (next?.(index) ?? []),
      });
      if (body) {
        node({ id: responseDelay, label: title + "稍後回覆", type: "delay", delayMs: title === "裴知聿" ? 2200 : 1400, next: [arrival] });
        node({ id: arrival, label: title + "回覆到達", type: "action", actions: [unlock(npcId)], next: next?.(index) ?? [] });
      }
    });
    return optionsNode;
  };
  const schedule = (sceneId: string, milliseconds: number, finalId: string) => {
    const root = labelFor(sceneId);
    const waits: { id: string; ms: number }[] = [];
    let left = milliseconds;
    while (left > 0) {
      const ms = Math.min(left, 86400000);
      waits.push({ id: `${root}-timer-${waits.length}`, ms });
      left -= ms;
    }
    node({ id: `${root}-bootstrap`, label: sceneId + "自主發送排程", type: "event", event: "brick3PhotoBootstrap", next: waits.length ? [waits[0].id] : [finalId] });
    waits.forEach((w, i) => node({ id: w.id, label: sceneId + "等待適當時間", type: "delay", delayMs: w.ms, next: [waits[i + 1]?.id ?? finalId] }));
  };
  const isChatAvailable = (name: string) => (data.kakao ?? []).some((i) => i.title === name && !i.id.startsWith(PREFIX));

  for (const scene of scenes) {
    if (!isChatAvailable(scene.characterName)) continue; // 陸沉川未交換私人聯絡方式前，不擅自出現 KKT
    const root = labelFor(scene.eventId);
    if (scene.type === "conditional_visit") continue;
    const textId = `${root}-intro`, arrival = `${root}-arrive`;
    addText(scene.eventId, scene.characterName, textId, scene.message);
    const actions: Action[] = [unlock(textId)];
    for (const img of scene.images) {
      if (img.usage !== "chat_attachment") continue;
      const id = imageId(scene.eventId, img.filename);
      put("kakao", {
        id, title: scene.characterName, body: "", sender: scene.characterName,
        kind: "image", media: "./" + img.path.replace(/^public\//, ""),
        meta: { photoEventId: scene.eventId, assetFilename: img.filename },
      });
      actions.push(unlock(id));
    }
    actions.push(notify(scene.characterName, scene.message));
    const additional = scene.eventId === "photo_dinner_invite" ? (i: number) => i === 0 ? [`${root}-travel-delay`] : [] : undefined;
    const responses = scene.choices.map((c, i) => answer(scene, c, i));
    const choicesId = buildChoices(scene.eventId, scene.characterName, scene.choices.map((c) => c.text), (i) => responses[i], (i) => {
      const flag = scene.onChoiceResponses?.[scene.choices[i].id]?.stateEffects;
      return flag?.setFlag ? [{ type: "variable", key: flag.setFlag, value: flag.flagValue ?? true }] : [];
    }, additional);
    node({ id: arrival, label: scene.characterName + "傳送生活照片事件", type: "action", actions, next: [choicesId] });
    schedule(scene.eventId, elapsedForScene[scene.eventId] ?? 3600000, arrival);
  }

  // 餐敘照片：只有玩家答應、確認到達並完成相處後，才會出現在手機相簿。
  const visit = scenes.find((s) => s.eventId === "photo_dinner_at_home");
  if (visit && isChatAvailable(visit.characterName)) {
    const root = labelFor("photo_dinner_invite"), albumIds: string[] = [];
    for (const img of visit.images) {
      const id = imageId(visit.eventId, img.filename);
      put("photos", {
        id, title: img.filename.includes("hands") ? "晚餐後的牽手" : "裴知聿家裡的晚餐",
        body: "那天在裴知聿家留下的回憶", sender: work.phone.owner,
        kind: "image", media: "./" + img.path.replace(/^public\//, ""),
        folder: "裴知聿", meta: { photoEventId: visit.eventId, assetFilename: img.filename },
      });
      albumIds.push(id);
    }
    const arriveTextId = `${root}-arrival-question`;
    addText("photo_dinner_arrival", "裴知聿", arriveTextId, "晚餐還熱著。妳到了再說一聲。");
    node({ id: `${root}-travel-delay`, label: "玩家決定前往，保留路途時間", type: "delay", delayMs: 120000, next: [`${root}-arrival-notify`] });
    node({ id: `${root}-arrival-notify`, label: "確認是否實際抵達", type: "action", actions: [unlock(arriveTextId)], next: [`${labelFor("photo_dinner_arrival")}-choices`] });
    buildChoices("photo_dinner_arrival", "裴知聿",
      ["我到門口了，現在進去。", "我還在路上，稍等一下。", "臨時有事，今天沒辦法過去。", "我想了想，改天再吃吧。"],
      (i) => ["門沒鎖，進來吧。", "不急，我把菜保溫。", "知道了，妳先處理事情。", "好，妳不用勉強。"][i],
      undefined,
      (i) => i === 0 ? [`${root}-visit-delay`] : []
    );
    const dinnerTextId = `${root}-at-home-message`;
    addText(visit.eventId, "裴知聿", dinnerTextId, "飯吃完了。要不要坐一下再走？");
    node({ id: `${root}-visit-delay`, label: "確實到達與晚餐相處", type: "delay", delayMs: 90000, next: [`${root}-visit-arrive`] });
    node({ id: `${root}-visit-arrive`, label: "晚餐回憶加入相簿", type: "action",
      actions: [...albumIds.slice(0, 3).map(unlock), unlock(dinnerTextId)], next: [`${labelFor(visit.eventId)}-choices`] });
    buildChoices(visit.eventId, "裴知聿", visit.choices.map((c) => c.text),
      (i) => answer(visit, visit.choices[i], i),
      undefined,
      (i) => i <= 1 ? [`${root}-hand-question`] : []
    );
    const handTextId = `${root}-hand-message`;
    addText("photo_dinner_hand", "裴知聿", handTextId, "他伸出手，停在妳面前，沒有繼續靠近。");
    node({ id: `${root}-hand-question`, label: "詢問是否願意牽手", type: "action", actions: [unlock(handTextId)], next: [`${labelFor("photo_dinner_hand")}-choices`] });
    buildChoices("photo_dinner_hand", "裴知聿",
      ["我握住他的手。", "先不要，我們慢慢來。", "我們現在還不適合這樣。", "我該回去了。"],
      (i) => ["他輕輕回握，沒有說話。", "好，我不急。", "嗯，我明白。", "好，我送妳到門口。"][i],
      (i) => i === 0 && albumIds[3] ? [unlock(albumIds[3])] : []
    );
  }

  return { ...work, data, nodes };
}
