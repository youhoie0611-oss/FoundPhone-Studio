# 《磚3》陸沉川 劇情照片

請將 WebP 圖片上傳至這個資料夾，使用劇情配置中的**完整檔名**。不要只更改副檔名，實際檔案必須是 WebP。

## 已配置照片檔名

- `lu_chenchuan_after_work_chat_01.webp`
- `lu_chenchuan_shoot_chat_01.webp`

相片傳送及相簿解鎖由編譯時的 `docs/brick3-photo-events-v1.json` 和 `scripts/brick3-photo-events.mjs` 控制。遊戲先確認故事事件與玩家選擇，再檢查照片是否已在已部署的網站中存在。缺圖時不會顯示破圖。

陸沉川已接入 V7 SE-004《今晚有人陪妳》。玩家可以拒絕活動，也可以在公開攝影活動後拒絕交換聯絡方式；**只有明確選擇交換聯絡**，才會解鎖私人 KKT 並依時間送達照片。上傳圖片本身不會觸發初次見面、愛情或劇情。\n\n[V7 陸沉川角色與劇情規則](../../../stories/ambiguity-b/characters/lu-chenchuan.md)

[上傳陸沉川照片](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/lu_chenchuan)

[查看照片配置](../../../docs/brick3-photo-events-v1.json)

## 新增好感度邀約活動（只需你上傳照片）
- 玩家真正參加並完成時，**玩家相簿唯一一張照片**：`lu_chenchuan_photo_exhibit_event_01.webp`
- 活動後隨機回訪時，**陸沉川拍下的私人 KKT 附件**：`lu_chenchuan_photo_exhibit_followup_01.webp`（沒有圖片則只顯示文字）
- 新活動詳細台詞與重邀門檻請見 [好感度重邀配置](../../../docs/brick3-repeat-invitations-v1.json)；舊活動照仍可在原劇情使用，別把不同用途的檔案混用。
- 每張照片務必放在本資料夾，保留完整小寫檔名、真正 WebP 格式，並推送到 `feature/character-autonomy-v3`。完成建置後對應劇情會自行顯示。
