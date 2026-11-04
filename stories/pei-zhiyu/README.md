# 裴知聿｜個人設定補充與遊戲同步

本目錄為《磚2》裴知聿專屬設定來源；本對話框通常用來補充人物資料，**不是**玩家角色在劇中傳出的訊息。只把已確認的角色事實轉成遊戲資料，不自行補寫未確定的情節。

## 檔案分工
- `character-profile.json`：最新確認的人物核心設定，衝突時以使用者較新的明確設定為優先。
- `stories/ambiguity-b/characters/pei-zhiyu.md`：較完整的 B 版人物核心，補充既有性格、生活、界線與復合分支；不得與最新使用者確認內容牴觸。
- `chat-photo-events.json`：四張第一人稱生活照及各自的四選項劇情配置；**此檔本身不會自動在遊戲執行**。
- `stories/template/story.json`：預設遊戲的正式可玩腳本，包含裴知聿聯絡人、KKT 聊天入口與首段四選項互動；要讓生活照與後續補充劇情實際生效，必須在這裡加入對應訊息、事件及測試。

## 更新準則
1. 在本對話中由使用者明確確立的設定，當次對話若具備 GitHub 寫入能力，應同步修改相應的角色設定和可玩腳本，回報 commit 與未完成項；**聊天不會在背景自動推送**。
2. 保留年齡 25 歲、心理學研究所碩士生、玩家前男友、玩家主動分手、希望修復關係、初始隱藏好感 0；不擅自決定分手具體原因。
3. 照片由他自己隨手拍；同一人、同一台手機般的觀察視角與生活用品要有連續性，不要棚拍或第三人稱跟拍。新圖未上傳時不以舊圖冒充已替換。
4. 正式遊戲回覆採四個態度／意圖有實質差異的選項；須區分分支、回覆停頓、未讀推送，尊重拒絕與斷聯。
5. 不用用戶在此補充的元訊息冒充女主角 KKT 發言。避免壓迫式復合、未同意親密接觸與強行好感跳升。
6. 提交後應檢查腳本引用與劇情連續性；未完成 npm 驗證／瀏覽器測試時必須明確標示。

## 照片分類資料夾（自 2026-11-04 起）
- **KKT 私訊／聊天**：`public/assets/characters/pei-zhiyu/chat/`（既有資料夾；原本檔案保留）。
- **Instagram Story**：`public/assets/characters/pei-zhiyu/instagram/story/`（新增，用於限時動態）。
- **Instagram Post**：`public/assets/characters/pei-zhiyu/instagram/post/`（新增，用於正式貼文）。

從現在起，本對話框每次要求產生裴知聿照片時，依照片的**劇情用途**決定應放的資料夾，並在交付中主動標示：照片用途、檔名、生活事件、實際上傳路徑、GitHub 資料夾連結、提交紀錄。若同張圖片要同時用於聊天及 Instagram，需另有合理的劇情原因，不預設跨平台重複使用；Story/貼文不是傳給玩家的 KKT 私訊。

新生成素材應符合裴知聿本人拍攝、自然隨手記錄的感覺，光線、生活用品與視角具連續性。不能把「已生成」等同「已上傳」；提交之後才提供真實資料夾連結並回報 commit。素材清單與規則另見 `photo-asset-index.json`、`public/assets/characters/pei-zhiyu/README.md`。

## 視覺記憶鎖定
最新正式視覺參考：`assets/characters/pei_zhiyu/reference/pei_zhiyu_reference_sheet_v1.png`（與 `public/characters/pei-zhiyu.png` 為同一 Git blob）；人物視覺記憶：`assets/characters/pei_zhiyu/visual-memory.json`。每次生成照片前必須同時讀取此檔與圖片，核對本人的五官、髮型、衣著習慣、手機拍攝視角與生活情境。圖片原標籤「沈硯舟」不影響本角色身分。其他角色不可套用此參考圖。
