# 角色視覺記憶庫（所有角色通用）

這是《磚2》生成角色照片時的前置工作規範。人物外貌必須有固定視覺來源，而不是每次只輸入姓名後重新隨機生成外貌。

## 建立流程

1. 作者第一次確認某位角色的長相時，建立 `assets/characters/<character_id>/visual-memory.json`，並在 `assets/characters/visual-memory-registry.json` 登記。
2. 把作者確認的人物參考圖片放在 `assets/characters/<character_id>/reference/`；參考圖片可包含正面、側面、背面、表情、髮型及飾品細節。
3. 記錄四大類資料：固定外觀、日常穿搭、攝影習慣、常見生活場景。將「作者已確認的既定設定」與「可供生成的建議情境」分開。
4. 每次生成前，**同時讀取 visual-memory.json 與實際參考圖片**。不能只看角色名字或文字描述；若圖片尚未取得，應說明無法驗證與原圖的一致性。
5. 生成完成後，為每張照片指定唯一主要用途與檔名：KKT 私訊、Instagram Story 或 Instagram Post。附上 GitHub 上傳資料夾 URL；實際上傳成功才提供檔案 URL 與 commit。
6. 若作者修訂角色外觀，增加新版參考圖和版本，保留舊版歷史，不要無聲替換已被確認的人物。

## 祁野（已確認）

視覺檔案：`assets/characters/qiye/visual-memory.json`。

首張基準圖來自本對話作者上傳的角色設定板（五視角、表情、髮型、細節）。原圖的 GitHub 預定路徑是 `assets/characters/qiye/reference/qiye_reference_sheet_v1.jpg`。**在確認圖片已上傳 GitHub 之前，不得視該路徑為已存在。**

祁野設定以 23 歲、祁家次子為準，設定板上的 21 歲／大三生欄位只是原始示意，不能覆寫人物背景。

## 裴知聿（已確認，原圖已在 GitHub）

- 人物視覺記憶：`assets/characters/pei_zhiyu/visual-memory.json`。
- 已鎖定高畫質多視角人物圖：`assets/characters/pei_zhiyu/reference/pei_zhiyu_reference_sheet_v1.png`（從既有 `public/characters/pei-zhiyu.png` 以相同 Git blob 複用，無壓縮或畫質損失）。
- 圖上的舊名字「沈硯舟」、年齡與職業欄不代表裴知聿設定；角色正史仍為 25 歲心理學研究所碩士生、玩家前男友。
- 每次生成前讀取本人實際參考圖與外貌、服飾、拍攝習慣、場景，再選擇 `public/assets/characters/pei-zhiyu/chat/`、`instagram/story/` 或 `instagram/post/`。生成後附資料夾連結；實際提交後才能附 commit。
- 可透過 `npm run visual-memory:brief -- pei_zhiyu chat` 或 `... instagram_story`、`... instagram_post` 取得引用路徑與檢查項；此工具不會自動提供像素給圖片生成模型。


## 生成品質檢查

- 保留**同一張臉**：髮型、臉部輪廓、五官、飾品與辨識特徵。
- 有合理變化：服裝、動作、光線、當日場景可以不同。
- 角色本人視角：私人訊息照片不可是無由來的第三人稱棚拍。
- 不把每張候選照片當成已發生的故事事件。
- 人物若還沒確立外貌，登記為 pending，不自行填寫想像的固定外觀。

詳見 `assets/characters/visual-memory-registry.json` 及各角色的 `visual-memory.json`。

## 顧時安（已確認，參考圖已存入 GitHub）

- 人物視覺記憶：`assets/characters/gu_shian/visual-memory.json`。
- 作者原始設定全覽：`assets/characters/gu_shian/reference/gu_shian_reference_sheet_v1.jpg`（1213×1296，保留原圖）。
- 快速預覽：`assets/characters/gu_shian/reference/gu_shian_reference_preview_v1.jpg`。
- 身分：26 歲，183 cm／76 kg，建築學系畢業，建築設計師，因工作專案認識玩家。
- 固定人物長相以五視圖、臉部特寫、髮型、體態為準；穿搭和場景的候選變化不可取代已確認特徵。
- 聊天、Instagram Story、Instagram Post 三種目標資料夾都在 `assets/characters/gu_shian/` 下，詳見 `PHOTO_ROUTING.md`。

### 檢查與生成前讀取

```bash
npm run visual-memory:check
npm run visual-memory:brief -- gu_shian chat
npm run visual-memory:brief -- gu_shian instagram_story
npm run visual-memory:brief -- gu_shian instagram_post
```

指令只檢查檔案是否存在、讀取角色設定並輸出**應引用的實際參考圖路徑**。圖片生成工具仍須實際接收參考圖片像素；不會因為呼叫此指令就自動將圖片傳給生成模型。角色或參考圖缺失時不得只靠名字生成。

## V3.0 單機照片與傳送共通限制（2026-11-04）

以 `stories/qiye/PHOTO_POLICY_V3.md` 中第十、十一、十二節為參考：圖片由作者製作並保存，遊戲運行時只引用既有素材；已發生事件、照片與未讀必須持久記錄，玩家開啟聊天室不得造成重新生成或重寫。

- 所有角色不得要求玩家拍照／上傳真實照片，不建立玩家與 NPC 合照或交換照片。
- 玩家以劇情選項回覆，NPC 自主事件與送照不因聊天室關閉而停止。
- 自拍／自攝為基本形式；已有合理同行 NPC 時，允許第三人稱幫拍照或 NPC 合照，但須記錄拍攝者、同行者與相應視覺參考圖。
- 同一張已保存圖片只使用原圖，不重新生成第二版冒充同一事件。

**祁野專屬**拍攝題材權重、情緒／關係變化與說話方式以 V3.0 文件為準，不擅自套用到其他角色。

## 顧時安照片政策 V1.0（2026-11-04 作者確認）

- 完整規格：`assets/characters/gu_shian/PHOTO_POLICY_V1.md`。
- 結構化規格：`assets/characters/gu_shian/photo-policy-v1.json`。
- 照片紀錄簿：`assets/characters/gu_shian/photo-ledger-v1.json`。
- 新設定：6 月 18 日出生、單身，陽光真誠，黃金獵犬 85%＋成熟可靠 15%；自拍、建築、動物、食物、工作與朋友活動有明確長期權重。
- 當天行程、情緒與劇情連續性高於題材權重；同一原始 photoId 不重生；KKT／IG Story／IG Post 分開保存，是否分享是獨立事件。
- 規則檔建立後**不等於**遊戲在執行階段已能動態拍照；需素材與事件都已整合才算功能完成。
