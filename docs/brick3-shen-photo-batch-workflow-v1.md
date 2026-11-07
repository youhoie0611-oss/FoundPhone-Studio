# 《磚3》沈硯舟｜每批 10 張照片與完整劇情配套流程 V1.0

## 一、作者只負責上傳照片

每當作者要求「生成沈硯舟照片」時，除非明確更改數量，**預設一次創作 10 張**，連同每張圖對應的照片 ID、KKT 聊天、四個玩家回答、每個回答的 NPC 後續、事件觸發、條件分歧、Instagram Story/Post（有需要時）、相簿解鎖與可整合的 JSON 一次完成。**玩家只需上傳圖片，無須手動填 JSON、命名、寫台詞、建分支或一個個提交劇情檔。**

> 每次 10 張指的是 **10 個獨立的 WebP 照片檔案**，不是一張 10 格拼貼、10 張重複圖或 10 張沒有劇情引用的照片；可以另外提供縮圖總覽與 ZIP 方便檢查與搬運。

## 二、分工與執行順序

1. 助手先讀 《磚3》最新設定、沈硯舟已定稿的五視角外貌參考及既有事件，核對日期、課業、朋友、情緒、玩家關係和先前照片。同一張圖片再次使用時，不重新生成。
2. 助手規劃 10 張**不重複**且符合他當時生活的照片：自拍、隨手拍、朋友／運動活動、攝影作品。長期以 40% 自拍、25% 隨手拍、20% 朋友／運動、15% 攝影作參考；10 張一批無法精確分配 25%／15%，應在不同批次調整，且真實事件優先於比例。
3. 助手生成 10 個獨立的真實手機感圖片檔；核對人物相貌、服裝、拍攝者和活動連續性，必要時補圖。**不接受把 10 格拼圖直接當作 10 個事件資產。**
4. 助手**自己**給每張圖命名、分配穩定 photoId / eventId、指定用途（chat、instagram_story、instagram_post、shared_gallery）。圖片固定路徑：`public/story-photos/shen_yanzhou/`；檔名 `shen_yanzhou_<event_name>_<01-10>.webp`。姓名以 `shen_yanzhou` 為固定角色代碼，不使用舊版 `shen-yanzhou` 路徑。
5. 助手為每張圖完成「拍照事件／傳送或發文決定／時間／觸發／若缺圖文字降級／聊天節奏／四個不同回覆選項及對應答覆／隱藏關係變化／是否能進玩家相簿」等配置，保留 NPC 主動生活與聊天未開啟仍送達的規則。
6. 助手在可使用 GitHub 寫入時，**自己提交所有配置、登錄表與劇情引用**到 `feature/character-autonomy-v3`，提供實際 commit；不可讓作者手動處理 JSON。未有寫入能力時提供整包可直接整合的 JSON 配置，明確說明尚未提交。
7. 助手提供 **10 張 WebP 原檔與可選的 ZIP**、檔名對照表、GitHub 批次上傳入口及本批 commit 連結。圖片由作者手動上傳一次即可。
8. **作者唯一的 GitHub 動作**：下載 ZIP、解壓縮後，於同一個 GitHub `Upload files` 頁面**一次選取／拖入 10 個 WebP**，按一次 `Commit changes`。**不能直接把 ZIP 上傳到 GitHub 期待自動解壓**，那只會存成 ZIP，遊戲無法透過個別 WebP 路徑載入。
9. 照片上傳後，遊戲已有事件配置依名稱尋找檔案。尚未上傳時保持 `assetMissing: show_text_only_and_log_missing_asset`，不得顯示破圖。圖片實際部署、事件觸發和相簿限制仍須測試後才可宣稱運行成功。

GitHub 批次上傳入口：

https://github.com/youhoie0611-oss/FoundPhone-Studio/upload/feature/character-autonomy-v3/public/story-photos/shen_yanzhou

照片資料夾：

https://github.com/youhoie0611-oss/FoundPhone-Studio/tree/feature/character-autonomy-v3/public/story-photos/shen_yanzhou

## 三、每張照片不可缺少的配套

每張照片的事件資料必須包含：`photoId`、`eventId`、`characterId`、`filename`、`path`、`usage`、`visualPrompt`、`photographerId`、`captureContext`、`trigger`、`chatSequence` 或 IG 發布資料、`choices[4]`、`onChoiceResponses` 或對應分支、`photoLifecycle`、`gallery`、`assetMissingBehavior`。

- **私聊照片**：四個玩家選項與各自的後續答覆，避免只有四個選項字面不同、實際分支一樣。
- **IG Story／Post**：照片可由 NPC 自主發布，但公開／私人可見性與內容必須正確；若玩家回覆限動進入私訊，該互動再提供四個可用選項與答覆。
- **共同回憶**：只有玩家確實同意、出席及事件真正完成，才能解鎖玩家相簿；單純被邀請、未回覆或 NPC 自拍不解鎖。
- **不要求回傳照片**：沈硯舟不會主動向玩家索取自拍、生活照或其他私人照片；所有關係階段均有效。
- **獨立生活**：即使玩家未開聊天室，沈硯舟仍照常上課、健身、拍攝、和朋友見面及發社群；沒有合理拍攝條件可不拍，不為滿足配額硬改事件。

## 四、每批交付清單

- 10 張不同的單張 WebP，另附縮圖總覽及方便一次下載的 ZIP（依工具實際可提供的格式為準）
- 10 張檔名、用途（CHAT / STORY / POST / GALLERY）、拍攝者、事件 ID 與情境對照
- 完整聊天與四個玩家回覆、分歧、發送／發佈時序及相簿規則
- 已提交且可查驗的 GitHub 配置 commit，或明確標示尚未提交的配置稿
- **唯一需要作者處理的步驟**：一次上傳 10 個 WebP。完成後若需驗證，作者只要回報「上傳完成」或 GitHub 提交連結。

## 五、與既有引擎整合

以 `docs/brick3-photo-events-v1.json` 的既有事件格式與 `scripts/brick3-photo-events.mjs` 為基準，優先使用現成欄位而不是隨意發明新事件型別。新批次事件如需加入引擎，應同步調整 runtime、驗證、相容性。本文本身只是**流程規範**，不是一組已生成的 10 張照片或已啟用的 10 組遊戲事件。
