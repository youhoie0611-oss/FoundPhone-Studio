# 沈硯舟｜圖片素材索引

遊戲角色：沈硯舟（`stories/ambiguity-b/characters/shen-yanzhou.md`）。本目錄依**圖片要出現在哪一個遊戲界面**分類，而不是單純按拍攝地點分類。

**生成前必讀：** [沈硯舟照片規則 V1.0](../../../../stories/ambiguity-b/characters/shen-yanzhou-photo-rules-v1.md)、[視覺記憶庫](../../../../stories/ambiguity-b/visual-memory/shen-yanzhou.json)、[唯一照片登錄表](../../../../stories/ambiguity-b/characters/shen-yanzhou-photo-index.json)。固定外貌參考存在 [visual-reference/](./visual-reference/)；40% 自拍是長期生成權重，不是已完成庫存比率。所有關係階段永久禁止向玩家索取照片。

| 分類 | GitHub 目錄 | 用途 |
| --- | --- | --- |
| **CHAT** | [chat/](./chat/) | 私下傳給玩家的 KKT 對話照片 |
| **IG STORY** | [instagram-story/](./instagram-story/) | 沈硯舟自己的 Instagram 限時動態 |
| **IG POST** | [instagram-post/](./instagram-post/) | 沈硯舟自己的 Instagram 一般貼文／多圖貼文 |

## 往後生成、分類與提交的固定流程

1. 每次生成前先判定使用場景是 **CHAT / IG STORY / IG POST**；若玩家指定位置，以玩家指定為準。同一張圖若需多處使用，明確註記各使用位置，不要無意複製成不同素材。
2. 遵循 V1.0：他很愛自拍與分享，自拍／隨手拍／朋友與活動／風景的長期權重為 40/25/20/15，劇情情緒優先；遇到有確實同行者的情境可以他人幫拍或合照，不能憑空捏造攝影者或玩家到場。
3. 為每張圖標註：**分類、情境、檔名、相對路徑、是否已接入劇情**。
4. 將圖片上傳所屬目錄到 `feature/ambiguity-b-prototype`，確認圖片檔案存在與 GitHub commit 成功；必要時再更新 `stories/ambiguity-b/story.json` 的媒體路徑及互動事件。
5. 每次成功上傳之後，回覆作者**實際上傳的資料夾 GitHub 連結與 commit 連結**。若上傳失敗，必須明確寫「未成功提交」，不能提供假連結或宣稱圖片已接入遊戲。

## 舊素材相容性

這三個分類資料夾是新增的。原先直接存放在本目錄下的 `shenyanzhou_*.png` 與 `shenyanzhou_pov_*.webp` 已被部分聊天事件引用，因此在未同步調整劇情和媒體載入前保留原位，不擅自移動、刪除或改名。

這套規則供後續角色對話圖片創作沿用。單純建立目錄**不代表已產生或發布新照片**。
