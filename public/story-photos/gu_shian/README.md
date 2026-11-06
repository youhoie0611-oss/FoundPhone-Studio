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

## 新增好感度邀約活動（只需你上傳照片）
- 玩家真正參加並完成時，**玩家相簿唯一一張照片**：`gu_shian_architecture_walk_event_01.webp`
- 活動後隨機回訪時，**顧時安拍下的私人 KKT 附件**：`gu_shian_architecture_walk_followup_01.webp`（沒有圖片則只顯示文字）
- 新活動詳細台詞與重邀門檻請見 [好感度重邀配置](../../../docs/brick3-repeat-invitations-v1.json)；舊活動照仍可在原劇情使用，別把不同用途的檔案混用。
- 每張照片務必放在本資料夾，保留完整小寫檔名、真正 WebP 格式，並推送到 `feature/character-autonomy-v3`。完成建置後對應劇情會自行顯示。


## 第一批 10 張照片（batch01，2026-11-06）

固定批次規格：**4 Chat + 3 Instagram Story + 3 Instagram Post**，共 10 張獨立 WebP，40 個玩家回覆選項、各自分支、事件條件與照片相簿政策。玩家僅需手動上傳照片本體。

| # | 用途 | WebP 檔名 | 事件 ID | 主題 |
|---|---|---|---|---|
| 01 | Chat | gu_shian_dog_selfie_01.webp | photo_gu_batch01_dog_selfie | 自家米克斯與顧時安合照 |
| 02 | Chat | gu_shian_breakfast_chat_01.webp | photo_morning_breakfast | 自做早餐 |
| 03 | Chat | gu_shian_studio_chat_01.webp | photo_design_review | 建築設計模型 |
| 04 | Chat | gu_shian_office_mirror_01.webp | photo_gu_batch01_office_mirror | 下班鏡前自拍 |
| 05 | Story | gu_shian_workout_story_01.webp | photo_gu_batch01_workout_story | 運動後自拍 |
| 06 | Story | gu_shian_dog_walk_story_01.webp | photo_gu_batch01_dog_walk_story | 帶狗散步 |
| 07 | Story | gu_shian_cooking_story_01.webp | photo_gu_batch01_cooking_story | 下廚煎鮭魚 |
| 08 | Post | gu_shian_architecture_light_post_01.webp | photo_gu_batch01_architecture_light_post | 建築樹影 |
| 09 | Post | gu_shian_sunset_post_01.webp | photo_gu_batch01_sunset_post | 晚霞街景 |
| 10 | Post | gu_shian_cafe_portrait_post_01.webp | photo_gu_batch01_cafe_portrait_post | 咖啡館近況自拍 |

**[直接開啟 GitHub 十張照片批次上傳頁面](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/gu_shian)**

作法：下載 ZIP → 解壓縮 → 全選 10 個 WebP → 拖曳到上方 GitHub 網頁 → 一次 Commit changes。**請勿上傳 ZIP 壓縮檔本身。**

完整配套：
- [十張專屬獨立 JSON](../../../docs/brick3-gu-shian-batch01.json)
- [遊戲採用的全角色照片事件主表](../../../docs/brick3-photo-events-v1.json)

圖片來源與解析度：從一張 AI 生成的 1536×1024 十格聯絡表逐格裁切、去標籤、縮放轉檔；不代表十張原生高解析。Story 以柔焦同源影像補成 9:16，Post 4:5。

**照片狀態：** 尚未由本次操作把 10 個 WebP 寫入 GitHub。**劇情狀態：** KKT 原有早餐與模型事件、兩個新增自拍事件已列在接入器的時間錨點中；Instagram Story/Post 6 個事件的四選項目前是完整企劃配置，尚未宣稱 IG UI 可以直接選擇。

**玩家相簿：** 10 張均不自動匯入私人相簿。Chat 附件保留在 KKT 聊天中；社群照片在 Instagram 發布事件發生後才能看見，且不因玩家開啟 App 而假造已發布。

外貌、眼鏡、狗狗與生活場景必須延續原參考圖，狗名、性別及年齡未確認。不能替玩家決定接受邀約或出席。


## 第二批 10 張照片（batch02，2026-11-06）

維持 4 Chat／3 Instagram Story／3 Instagram Post、10 個新事件及 40 個玩家回覆選項，所有選項都有不同 NPC 後續回覆。

| # | 用途 | WebP 檔名 | 事件 ID | 主題 |
| --- | --- | --- | --- | --- |
| 01 | Chat | gu_shian_parked_car_selfie_01.webp | photo_gu_batch02_parked_car_selfie | 停妥車內自拍 |
| 02 | Chat | gu_shian_site_check_01.webp | photo_gu_batch02_site_check | 實際工地勘查 |
| 03 | Chat | gu_shian_dog_cuddle_01.webp | photo_gu_batch02_dog_cuddle | 和自家狗狗靠在一起 |
| 04 | Chat | gu_shian_desk_sketch_01.webp | photo_gu_batch02_desk_sketch | 提案退回後修正圖面 |
| 05 | Story | gu_shian_climbing_story_01.webp | photo_gu_batch02_climbing_story | 攀岩後自拍 |
| 06 | Story | gu_shian_clam_pasta_story_01.webp | photo_gu_batch02_clam_pasta_story | 在家做蛤蜊義大利麵 |
| 07 | Story | gu_shian_riverside_sunset_story_01.webp | photo_gu_batch02_riverside_sunset_story | 下班路上河岸晚霞 |
| 08 | Post | gu_shian_wood_exhibit_post_01.webp | photo_gu_batch02_wood_exhibit_post | 木構造展覽 |
| 09 | Post | gu_shian_mountain_hike_post_01.webp | photo_gu_batch02_mountain_hike_post | 週末登山自拍 |
| 10 | Post | gu_shian_coffee_camera_post_01.webp | photo_gu_batch02_coffee_camera_post | 底片相機與甜點 |

**[一次拖曳上傳 10 張 WebP 的 GitHub 頁面](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/gu_shian)**

操作：解壓 ZIP → **全選十張 .webp** → 拖曳到上述頁面 → 按一次 Commit changes。不要上傳 ZIP 本身。

- [第 2 批十張完整 JSON（含四選項分支／照片生命週期／相簿規則）](../../../docs/brick3-gu-shian-batch02.json)
- [全角色照片事件配置](../../../docs/brick3-photo-events-v1.json)
- 角色的所有照片都保持原始參考臉型、暖茶色眼鏡、已確認的自家奶茶色白胸米克斯犬，不擅自命名犬隻或改動既有住家、專案外觀。
- **本批 WebP 尚待玩家手動上傳**；只有 JSON、檔名、用途與事件配置已進 GitHub。
- Chat：`dog_cuddle` 與 `desk_sketch` 已有既存生活事件錨點（生活與劇情連續性仍需執行階段驗證）；`parked_car_selfie` 和 `site_check` 必須等真實的車程或工地事件確定，暫不硬接故事。
- Story/Post 六筆**已有完整配套**，但 Instagram 發布與四選項互動需另行實作社群適配器，不得誤作 KKT 訊息或假裝已發布。
- **玩家私人相簿：十張皆不自動匯入。** Chat 相片保留在 KKT，社群照片只有實際發布後才會在 IG 顯示。
- 本批影像是從 AI 生成的 1536×1024 聯絡表裁切的十張獨立 WebP，並非 10 張原生高解析照片；Story 與 Post 有模糊延展背景以適應直式版型。
