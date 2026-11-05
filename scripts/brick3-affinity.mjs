/**
 * 《磚3》：只把玩家實際選擇過的角色對話算入隱藏好感度。
 * 舊劇情的 trust/curiosity 是各自的敘事旗標，不是累積好感度。
 * 不讓 NPC 自己發的生活訊息、讀取聊天室或重複載入存檔增加分數。
 */
const leads = new Map([
  ["沈硯舟", "shen"], ["裴知聿", "pei"], ["祁野", "qi"],
  ["顧時安", "gu"], ["陸沉川", "lu"],
]);
const distance = /不想|沒空|不用|保持距離|算了|沒興趣|拒絕|先不要|先不|暫時|不願意|我先忙|改天|不舒服|別再|無法|不方便|不去|取消/;
const warm = /想|一起|謝謝|可以|好啊|好呀|有空|關心|放心|喜歡|願意|陪|好看|辛苦|怎麼樣|還好|記得|你呢|支持|了解/;

export function injectBrick3Affinity(story) {
  if (story.id !== "between-the-lines-b-demo") return story;
  if (story.events.some(event => (event.actions ?? []).some(action => action.type === "affinity"))) return story;
  const choices = new Map();
  for (const chat of story.chats) {
    const prefix = leads.get(chat.title);
    if (!prefix || chat.app !== "kakao") continue;
    for (const item of chat.messages) {
      if (item.outgoing || item.senderId === "owner")
        choices.set(item.id, { prefix, body: item.body || "" });
    }
  }
  for (const event of story.events) {
    if (event.type !== "action") continue;
    const unlocks = (event.actions ?? []).filter(action => action.type === "unlock");
    const selected = unlocks.map(action => choices.get(action.key)).find(Boolean);
    if (!selected) continue;
    const body = selected.body;
    // Meaningful warmth increases closeness; setting boundaries remains neutral.
    const value = distance.test(body) ? 0 : warm.test(body) ? 4 : 2;
    if (value > 0)
      event.actions.push({ type: "affinity", key: selected.prefix + "_attraction", value });
  }
  return story;
}
