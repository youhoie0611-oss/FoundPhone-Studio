# 《磚2》B 版｜角色視覺記憶庫

依據 [全域視覺記憶規範](../../../docs/VISUAL_MEMORY.md)，每位人物在作者**第一次定稿外貌**後保存獨立 `<角色ID>.json`。生成圖片前應讀取該 JSON 與實際參考圖，而非只使用姓名或臨時文字提示。

| 角色 | 角色 ID | 狀態 | 視覺記憶檔 |
| --- | --- | --- | --- |
| 沈硯舟 | `shenyanzhou` | 作者外貌已確立，已建立記憶檔 | [shen-yanzhou.json](./shen-yanzhou.json) |
| 裴知聿 | `peizhiyu` | 尚待在本規範下確認參考圖 | 未建立 |
| 祁野 | `qiye` | 尚待在本規範下確認參考圖 | 未建立 |
| 林安 | `linan` | 尚待在本規範下確認參考圖 | 未建立 |

現有遊戲中的角色圖片、頭像不等於作者已批准「作為日後所有圖片唯一臉部基準」。只有作者定稿後才新增／鎖定該角色。

### 檔案整理

- `shen-yanzhou.json`：沈硯舟的結構化視覺記憶，包含參考圖指向、外型、服裝、拍攝風格與場景
- [角色設定](../characters/shen-yanzhou.md)：沈硯舟的性格、劇情關係與生活（若與圖片註記相異，以現行遊戲關係為準）
- [沈硯舟素材分類](../../../public/assets/characters/shen-yanzhou/README.md)：`chat/`、`instagram-story/`、`instagram-post/`

後續擴充時複製 [模板](./_template.json) 並填入實際資料，不可將模板中的占位內容直接當作某角色的正式外觀。
