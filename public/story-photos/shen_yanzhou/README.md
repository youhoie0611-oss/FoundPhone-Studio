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

## 《磚3》沈硯舟：一次 10 張照片（新批次固定流程）

依照 [批次照片流程 V1.0](../../../docs/brick3-shen-photo-batch-workflow-v1.md)，往後一次生成 **10 張獨立 WebP＋完整遊戲事件、四選項回覆、分歧及相簿規則**。助手負責編排劇情、命名、輸出檔案及 GitHub 配置提交；作者**只負責上傳圖檔**，無須改 JSON 或逐張建事件。

**一次上傳方式：**下載本批圖片 ZIP → 解壓縮 → 打開 [GitHub Upload files](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/shen_yanzhou) → 同時選取／拖入全部 10 張 `.webp` → 按一次 **Commit changes**。**不要直接上傳 ZIP**，GitHub 不會自動解壓給遊戲引用。

檔名由助手提供，遵守 `shen_yanzhou_事件名稱_01.webp` 等格式。尚未生成的批次不應被說成已經上傳或接入遊戲；圖片未上傳時，既有遊戲可按缺圖規則只顯示文字。

## Batch01｜10 張圖片（2026-11-06）

本批 **10 組聊天照片＋40 個玩家回覆分支** 的 JSON 已提交到 [照片事件主配置](../../../docs/brick3-photo-events-v1.json)；編譯入口已接上 `scripts/brick3-photo-events.mjs`。**作者只需要上傳以下 10 個 WebP，不需要上傳 JSON、README 或修改程式。**

1. `shen_yanzhou_dorm_morning_selfie_01.webp` — 平日晨起的租屋處，睡醒後亂髮自拍
2. `shen_yanzhou_classroom_bored_selfie_02.webp` — 教室課間靠窗坐著的慵懶自拍
3. `shen_yanzhou_gym_mirror_selfie_03.webp` — 健身房練完腿後，在鏡前自然自拍
4. `shen_yanzhou_cafe_editing_break_04.webp` — 校外咖啡館整理活動相片的短暫休息
5. `shen_yanzhou_basketball_sunset_selfie_05.webp` — 下午和朋友打完球，夕陽下拿手機自拍
6. `shen_yanzhou_elevator_outfit_selfie_06.webp` — 參加朋友聚會前，電梯裡順手拍穿搭
7. `shen_yanzhou_convenience_store_night_selfie_07.webp` — 晚上短暫到便利商店買飲料，用玻璃反光自拍
8. `shen_yanzhou_rainy_neon_selfie_08.webp` — 雨夜撐傘走在城市街邊的自拍
9. `shen_yanzhou_izakaya_friends_selfie_09.webp` — 和實際同行的大學朋友在餐廳聚會，自己拿手機合照
10. `shen_yanzhou_late_night_desk_selfie_10.webp` — 深夜在租屋處趕課堂報告與整理照片時的疲倦自拍

一次上傳入口：[Upload files](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/shen_yanzhou)。

請在 ZIP **解壓後一次選取全部十張 WebP**，確認上傳的是個別 WebP 不是 ZIP。本批相片是沈硯舟的私人生活分享，不因玩家看到照片就自動解鎖共同回憶相簿。若玩家沒開 KKT，他仍可依劇情節點主動傳送；實際發訊觸發仍需編譯與遊戲回歸測試。**圖片實際上傳前，十張的 GitHub 影像檔案仍處於 pending 狀態。**

