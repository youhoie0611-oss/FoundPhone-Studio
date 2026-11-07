# 《磚3》祁野照片（玩家手動上傳）

這是祁野 `qi_ye` 的已規劃 WebP 事件照片目錄，屬於 `feature/character-autonomy-v3` 開發分支。

圖片由玩家手動上傳。未實際存在的 `.webp` **不可標示為已上傳**，也不可在玩家手機相簿中提前解鎖。

- 格式：`qi_ye_事件名稱_照片序號.webp`，如 `qi_ye_night_drive_chat_01.webp`。
- 相簿及聊天內容須在**照片事件真實發生／訊息送達**後依 `docs/brick3-photo-events-v1.json` 條件解鎖；若檔案缺失，按規範退化為純文字並記錄素材缺失。
- 角色視覺：以作者已確認的人物多角度參考圖為準，不重新捏臉。富裕感可以自然流露但不每張炫富。
- 此資料夾放的是故事照片素材，不代表照片已由祁野傳送，也不代表已發 Instagram。
- 照片拍攝者、入鏡人物、時間、地點、衣著、情緒、事件、分享決定與送達狀態須有各自紀錄。

[GitHub 上傳照片](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/qi_ye)

[祁野照片製作規則](../../../docs/brick3-qi-ye-photo-workflow-v1.md)

完整的事件 JSON 以 `docs/brick3-photo-events-v1.json` 為準。

## 新增好感度邀約活動（只需你上傳照片）
- 玩家真正參加並完成時，**玩家相簿唯一一張照片**：`qi_ye_city_lights_event_01.webp`
- 活動後隨機回訪時，**祁野拍下的私人 KKT 附件**：`qi_ye_city_lights_followup_01.webp`（沒有圖片則只顯示文字）
- 新活動詳細台詞與重邀門檻請見 [好感度重邀配置](../../../docs/brick3-repeat-invitations-v1.json)；舊活動照仍可在原劇情使用，別把不同用途的檔案混用。
- 每張照片務必放在本資料夾，保留完整小寫檔名、真正 WebP 格式，並推送到 `feature/character-autonomy-v3`。完成建置後對應劇情會自行顯示。

## 第一批 10 張照片（batch01，2026-11-06）

**固定出圖規則：每次產生 10 張獨立 WebP，附 10 個四選項事件配套；玩家只需要批次上傳照片。**

本批照片從同一次圖片生成的聯絡表畫面裁切、轉檔；**並非十張原生高解析單獨生成圖**。素材已交付作者，GitHub 圖檔仍需作者上傳。

| 檔名 | 主題 | 事件 ID |
| --- | --- | --- |
| `qi_ye_parked_car_selfie_01.webp` | 車行取車後自拍 | `photo_qi_batch01_parked_car_selfie` |
| `qi_ye_street_sport_chat_01.webp` | 街頭球場夕陽 | `photo_weekend_sport` |
| `qi_ye_postgame_sweat_01.webp` | 打球後的流汗自拍 | `photo_qi_batch01_postgame_sweat` |
| `qi_ye_design_desk_01.webp` | 設計桌草稿 | `photo_qi_batch01_design_desk` |
| `qi_ye_outfit_mirror_01.webp` | 出門前鏡自拍 | `photo_qi_batch01_outfit_mirror` |
| `qi_ye_night_burger_01.webp` | 宵夜漢堡 | `photo_qi_batch01_night_burger` |
| `qi_ye_night_drive_chat_01.webp` | 城市夜景 | `photo_night_view` |
| `qi_ye_late_sofa_01.webp` | 沙發疲憊自拍 | `photo_qi_batch01_late_sofa` |
| `qi_ye_camera_detail_01.webp` | 相機特寫 | `photo_qi_batch01_camera_detail` |
| `qi_ye_skate_break_01.webp` | 滑板場休息 | `photo_qi_batch01_skate_break` |

下載 ZIP 後先解壓縮，**一次全選十個 WebP（不要直接上傳 ZIP）**，拖曳到 [祁野照片 GitHub 上傳頁面](https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/qi_ye)，按一次 Commit changes 即可。

對話、四選項、分歧、觸發和相簿條件已提交 [照片事件配置](https://github.com/youhoie0611-oss/FoundPhone-Studio/blob/feature/character-autonomy-v3/docs/brick3-photo-events-v1.json)，由事件接入器在建置時編入 KKT；**實際照片檔未上傳前不能宣稱照片已顯示，完整遊戲測試也尚未完成。**

十張均為 KKT 私人聊天附件，不因傳送就自動複製到玩家的私人相簿；留存於對話歷史。相簿的手動收藏流程尚未實作，不能臆稱已自動解鎖。


## 手機照片尺寸與品質（2026-11-06 確認）

本規則適用於祁野後續的所有生成批次：

- **KKT 一般手機直式照片**：預設 **3:4**，建議交付 `1080×1440` WebP。
- **KKT 橫向手機照片**：確實適合橫幅構圖時，使用 **4:3**，建議 `1440×1080` WebP。
- **Instagram Story**：使用 **9:16**，建議 `1080×1920` WebP。
- **Instagram Post**：建議 **4:5**（`1080×1350`）或 **1:1**（`1080×1080`），以實際場景為準。
- **不可把五欄橫向拼貼圖直接裁成十張寬橫照片**；每張應是獨立、完整的真實手機攝影構圖，無拼圖邊框、資訊表、文字標籤、UI。
- 交付前應使用程式讀取並驗證十張的實際像素尺寸、WebP 格式與完整檔名，保持與 JSON 事件圖片路徑一致；10 張一次 ZIP（ZIP 解壓後全選 10 張上傳）。
- **不得以單純放大冒稱原生高解析**。若因現有拼圖裁切來源而造成素材細節不足，須明示，未來應優先逐張原生直式生成或重製。
- 不因修改照片構圖、像素尺寸而更換原已提交的 `assetId`、`eventId`、聊天選項或既有角色關係。

本次 batch01 初版約 900×600 橫圖，已另製作 **1080×1440 3:4 直式 WebP 的修正版十張**供作者批次上傳。修正版仍由拼圖生成來源重裁及重採樣，屬網頁遊戲用預覽品質，**不是原生 1080×1440 光學細節**。GitHub 上的圖片須由作者手動上傳後才算實際存在。



## V6 第一批獨立生成照片（已批准，待手動上傳）

本批 **10 張獨立 WebP** 已獲作者批准。劇情配置已同步到 `docs/brick3-photo-events-v1.json`，故事掛鉤已同步到 `scripts/brick3-photo-events.mjs`；本目錄圖片由作者自行手動批次上傳。**提交設定檔不是圖片已上傳，所有圖片上傳前不得視為可見相簿內容。**

請把 ZIP 先解壓縮，再全選以下 **10 張 .webp**，一次拖入 GitHub 上傳頁，按一次 Commit changes：

1. `qi_ye_parked_car_01.webp`
2. `qi_ye_basketball_rest_01.webp`
3. `qi_ye_basketball_after_01.webp`
4. `qi_ye_headphones_car_01.webp`
5. `qi_ye_parking_wait_01.webp`
6. `qi_ye_night_car_01.webp`
7. `qi_ye_sofa_rest_01.webp`
8. `qi_ye_hoodie_street_01.webp`
9. `qi_ye_daytime_car_01.webp`
10. `qi_ye_late_night_car_01.webp`

- 上傳連結：https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/qi_ye
- 事件配置：https://github.com/youhoie0611-oss/FoundPhone-Studio/blob/feature/character-autonomy-v3/docs/brick3-photo-events-v1.json
- 上傳後應確認所有檔名完全一致，遊戲重新建置後圖片才可能被讀取。
