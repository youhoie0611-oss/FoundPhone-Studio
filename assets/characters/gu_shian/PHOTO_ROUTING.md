# 顧時安｜圖片分類與 GitHub 提交規則

自 2026-11-04 起，凡本專屬對話新增的顧時安照片，**先依角色使用行為決定唯一主資料夾，生成後標註去向，實際上傳成功後提供正確的 GitHub 資料夾連結及 Commit**。

## 三個固定主資料夾

1. **KKT／聊天私訊**：`assets/characters/gu_shian/chat/`
   - 傳給玩家的一對一照片；可作為訊息事件或圖片泡泡。
   - 既有素材與劇情配置繼續沿用，不重新搬移或覆蓋。
   - 攝影方向依對話情境：自拍需合理；生活分享優先本人拿手機親自拍攝的主觀視角。
2. **Instagram Story**：`assets/characters/gu_shian/instagram/story/`
   - 顧時安自行上傳的公開或限時社群紀錄；預設 9:16，偏自然隨手拍。
3. **Instagram Post**：`assets/characters/gu_shian/instagram/post/`
   - 顧時安自主決定公開的正式貼文或輪播；預設 4:5，構圖完整。

## 每次新照片的紀錄格式

- 角色：顧時安
- 類別：Chat / Instagram Story / Instagram Post
- 照片主題與場景：例如「下班後雨景」
- 拍攝視角：他親自拍攝／自拍；若非本人拍攝要有合理劇情原因
- 預定檔名、建議保存的相對路徑
- 預定觸發：發送或發布前所需的生活事件、時間、資訊與玩家關係條件
- 可搭配的訊息／動態文案（不預先替玩家作選擇）
- GitHub 狀態：未生成／已生成但尚未上傳／已上傳且已驗證
- 真正已上傳後：資料夾連結、實際圖片檔連結與 Commit

## 核心防錯規則

- 不因使用者沒開聊天室而停止角色自主訊息；但不能干擾現有話題，不能洗版或憑空知道私人資訊。
- 同一張照片出現在不同平台時，保留**主檔位置**，其他地方以事件引用；若需不同裁切輸出，使用各自檔名與合理版本。
- 不要只寫 JSON/README 就宣稱 JPEG／PNG 已上傳；必須確認二進位圖片在遠端可讀。
- 不能將媒體已存 GitHub 等同「遊戲內已發布」：需要同步正式故事資料並確認遊戲能載入圖片與事件。
- 用戶於此對話已確認的人物核心與歷史優先，未決定的感情觀、家庭背景與隱藏好感度不得擅自編寫成既定事實。

## GitHub 路徑

- [聊天照片資料夾](https://github.com/youhoie0611-oss/FoundPhone-Studio/tree/main/assets/characters/gu_shian/chat)
- [Instagram Story 資料夾](https://github.com/youhoie0611-oss/FoundPhone-Studio/tree/main/assets/characters/gu_shian/instagram/story)
- [Instagram Post 資料夾](https://github.com/youhoie0611-oss/FoundPhone-Studio/tree/main/assets/characters/gu_shian/instagram/post)

## 正式視覺記憶基準

所有新生成的顧時安照片必須先讀取 `assets/characters/gu_shian/visual-memory.json` 和 `assets/characters/gu_shian/reference/gu_shian_reference_sheet_v1.jpg`。**原始五視圖優先於先前由 AI 生成的生活照**；不得沿用生成結果慢慢變成另一張臉。

## V1.0 正式照片政策（作者已確認）

正式完整規則：[`PHOTO_POLICY_V1.md`](./PHOTO_POLICY_V1.md)；機器可讀規格：[`photo-policy-v1.json`](./photo-policy-v1.json)；照片階段紀錄：[`photo-ledger-v1.json`](./photo-ledger-v1.json)。

顧時安不是只拍建築、咖啡或夕陽：自拍／穿搭、建築攝影、生活食物與動物、工作及朋友活動的長期權重分別為 **25／25／20／15／15**，不是每日配額；任何照片必須先有合理行程與情緒動機。熟悉階段與玩家意願決定分享界線。生日 6/18、感情狀態單身、黃金獵犬 85%＋成熟可靠 15% 已正式確認。

同一張照片跨 Chat／IG Story／IG Post 重用**相同 photoId**；拍攝、決定分享、實際送達為三個分立事件；尚未整合到引擎的記錄不得假裝已在遊戲送達。已生成的原圖不重新生成另一版本。照片作者端生成並驗證提交，非單機遊戲運行時 AI 生成。
