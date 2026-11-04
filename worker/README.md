# AI 聊天服務部署

前端位於 GitHub Pages，不能安全保存 OpenAI API Key，因此使用獨立 Cloudflare Worker。

## 1. 部署 Worker
1. 在 Cloudflare Workers 建立 Worker，使用 `worker/ai-chat.js`。
2. 設定 Secret `OPENAI_API_KEY`（只放在 Cloudflare，**不要提交 GitHub**）。
3. 設定環境變數 `ALLOWED_ORIGIN=https://youhoie0611-oss.github.io`（不得包含尾端斜線）。
4. 可選設定 `OPENAI_MODEL=gpt-4.1-mini`。
5. 部署並記下 Worker HTTPS URL。

## 2. 配置前端
在 GitHub Actions 的建置環境加入 `VITE_CHAT_API_URL=https://你的-worker.workers.dev`，並重新建置、部署 GitHub Pages。若使用其他建置系統，將同名變數注入 Vite build。不要使用 `VITE_OPENAI_API_KEY`。

## 3. 目前能力及限制
- 玩家在 Kakao 聊天輸入任意文字，前端會保存原文並呼叫 Worker，成功時追加 NPC 訊息。
- 服務未設定時只保存玩家訊息，並顯示錯誤；不偽造 AI 回覆。
- 目前是最小可用原型：NPC 的長期記憶、獨立時程、離線主動傳訊、已讀觸發、玩家認證、配額與速率限制尚未完成。
- Worker 收到的是玩家自報的匿名 ID，不是可靠身分驗證；公開上線前必須加入伺服器驗證、速率限制、濫用防護、費用上限及每位玩家資料隔離。僅 CORS 限制不足以阻擋惡意請求。
- AI 服務會收到最近對話內容；應提供玩家隱私告知及資料處理政策。
- 現階段不應宣稱已完成所有劇情規則或通過自動化測試。
