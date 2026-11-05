# 《磚3》顧時安｜劇情照片手動上傳資料夾

此資料夾只存放 `gu_shian` 的**實際遊戲照片 WebP 檔**，由作者／玩家手動上傳。編輯劇情 JSON 不等同圖片已上傳，也不代表遊戲已載入。

- 指定分支：`feature/character-autonomy-v3`
- 事件基準：`docs/brick3-photo-events-v1.json`
- 存檔根目錄：`public/story-photos/gu_shian/`
- 檔名格式：`gu_shian_{event_slug}_{shot_number}.webp`
- 原始外貌：以顧時安經作者確認的五視圖為準；維持深棕色眼睛、深棕黑短髮、身形比例。配戴眼鏡時使用半透明暖茶色圓角方框。
- 寵物：已設定有養奶茶色、白胸、半垂耳的中型米克斯犬；**名字、年齡與性別尚未確認，不得擅自編寫**。
- 住家與工作環境：延續已發生事件；住家未正式確立的細節不得自動補成固定設定。
- 每張圖片要對應一個 `assetId`、`eventId`、劇情時間地點與拍攝者，且跟 `docs/brick3-photo-events-v1.json` 的 `filename` 完全一致。

## 目前列入配置、等待手動上傳的照片

| 事件 ID | 預定 WebP | 是否已上傳 |
| --- | --- | --- |
| `photo_morning_breakfast` | `gu_shian_breakfast_chat_01.webp` | **尚未於此操作上傳** |
| `photo_design_review` | `gu_shian_studio_chat_01.webp` | **尚未於此操作上傳** |

聊天照片**預設不自動匯入玩家相簿**。必須有真正的遊戲事件／訊息送達才能出現，不因玩家打開聊天室而重新觸發；若缺圖則只顯示文字，不可破圖。

新的劇情照片必須先根據當下 NPC 行程、情緒、角色視覺記憶和玩家實際選擇產製完整事件配置。玩家拒絕邀約或尚未實際抵達，不得生成她出席活動的照片；不可預設親密互動。

此資料夾的 README 僅供上傳與整理，並不表示上述 WebP 已存在或已進入正式 Runtime。
