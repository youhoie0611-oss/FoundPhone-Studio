# 顧時安｜KKT 生活照素材與劇情狀態

## 核心角色設定
顧時安，26 歲，183 cm／76 kg，建築學系畢業，職業為建築設計師。外貌以使用者提供的角色五視圖為準。已確認性格為溫柔沉穩、細膩、聰明、有主見。與成年女性玩家因工作專案認識。

未確定：完整家庭背景、分手史、感情觀、初始隱藏好感度。**不得自行定案。**

## 已在正式劇本內接入的照片（4 張）

| 來源 JPG | 編譯後遊戲路徑 | 使用情境 |
| --- | --- | --- |
| site_visit_selfie.jpg | ./characters/gu-shian-site-visit-selfie.jpg | 日間工地勘查 |
| studio_mirror_selfie.jpg | ./characters/gu-shian-studio-mirror-selfie.jpg | 工作室下班前 |
| late_night_studio.jpg | ./characters/gu-shian-late-night-studio.jpg | 深夜改圖 |
| bookstore_cafe.jpg | ./characters/gu-shian-bookstore-cafe.jpg | 休假書店咖啡館 |

四張 JPG 已在本目錄，`scripts/story.mjs` 於 `story:build` 時複製到 `public/characters/`。工作室自拍也作為顧時安聊天室頭像來源。

正式遊戲劇本：`stories/template/story.json`。顧時安有自己的 KKT 對話，每張照片均有獨立訊息節奏、4 個玩家回覆選項、16 條選擇後分支（各自對應 NPC 回答）。傳訊由開始事件與虛擬時間排程觸發，不依賴玩家先打開聊天室；個人生活分享需有先前互動許可，明確界線須保留。**關閉整個遊戲時虛擬時間會暫停，並非伺服器背景推播。**

KKT 四選項接線：`src/vendor/mymy/Apps.tsx` 會優先使用 `guScene` 所屬劇情節點的四個選項，玩家選擇需更新狀態後才顯示對應回答。

## 已有規劃但尚未正式啟用的第一人稱生活照（6 張）

`pov_photo_story_config.json` 保存 6 個場景與 24 個備選回覆：設計桌、雨後晚霞、工地、安全帽、拉麵、建築書、夜間街道。六張原始 JPG 尚未提交到 GitHub；因此未接入正式劇本的圖片訊息，避免遊戲顯示破圖。取得 JPG 後可擴展 `story.json` 並新增編譯複製規則。

## 遊戲劇情同步準則

- 對話中新確認的顧時安設定，要同步至**正式劇本**與相應角色說明，而非只新增旁支 JSON。
- 保持已發生劇情、玩家選擇和人物人格的連續性；不擅自為玩家決定感受或交往結果。
- 未開聊天室仍可依事件收到新訊息，但不能與正在進行的對話機械衝突或洗版。
- 發布前以 `npm run story:validate`、`npm run story:test`、`npm run build` 驗證。
- 本文件僅說明儲存庫已實作的範圍；未完成的圖片上傳、聊天 AI 行為與跨天真實背景推播不能假稱已完成。
