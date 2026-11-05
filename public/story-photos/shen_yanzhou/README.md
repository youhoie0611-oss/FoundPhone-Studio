# 《磚3》沈硯舟 劇情照片

請將 WebP 圖片上傳至這個資料夾，使用劇情配置中的**完整檔名**。不要只更改副檔名，實際檔案必須是 WebP。

## 已配置照片檔名

- `shen_yanzhou_photo_walk_chat_01.webp`
- `shen_yanzhou_basketball_chat_01.webp`

相片傳送及相簿解鎖由編譯時的 `docs/brick3-photo-events-v1.json` 和 `scripts/brick3-photo-events.mjs` 控制。遊戲先確認故事事件與玩家選擇，再檢查照片是否已在已部署的網站中存在。缺圖時不會顯示破圖。

[上傳沈硯舟照片](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/shen_yanzhou)

[查看照片配置](../../../docs/brick3-photo-events-v1.json)

## 新增好感度邀約活動（只需你上傳照片）
- 玩家真正參加並完成時，**玩家相簿唯一一張照片**：`shen_yanzhou_night_view_event_01.webp`
- 活動後隨機回訪時，**沈硯舟拍下的私人 KKT 附件**：`shen_yanzhou_night_view_followup_01.webp`（沒有圖片則只顯示文字）
- 新活動詳細台詞與重邀門檻請見 [好感度重邀配置](../../../docs/brick3-repeat-invitations-v1.json)；舊活動照仍可在原劇情使用，別把不同用途的檔案混用。
- 每張照片務必放在本資料夾，保留完整小寫檔名、真正 WebP 格式，並推送到 `feature/character-autonomy-v3`。完成建置後對應劇情會自行顯示。
