# Agent instructions

Check the working tree and remotes before editing. Preserve existing files and uncommitted work.

This is an existing interactive virtual phone framework. Users usually want to add a story, not rebuild the phone. Read docs/ARCHITECTURE.md, docs/PROGRESS.md, docs/AI_STORY_GUIDE.md and docs/STORY_SCHEMA.md.

Prefer editing stories/template/story.json. stories/blank/story.json remains a blank starting point. Keep story data separate from UI code and player saves. Accept natural language, chat records, images and event requirements as author input; convert them to validated structured story data. Ask about missing major plot decisions and use reasonable defaults for minor details.

Reuse the Phone Runtime, App registry and event engine. Do not rewrite App UI or shared engines merely to add content. For a new App follow docs/APP_DEVELOPMENT.md. Keep stable IDs and versioned schemas. Reject arbitrary scripts, HTML and executable imports. Never copy private account data into a story.

Run npm run story:validate, npm run story:test and npm run build after story changes. Add passing paths for every new ending, including passwords, hidden content, calls and cross-App events. Preview the result and check saves. For engine changes also run typecheck, lint, unit and relevant browser tests. Report unverified device behavior honestly; App registration is not complete app-specific fidelity.

Preserve MIT, dependency licenses and source copyright notices. Do not automatically Fork, Star, Push or publish. Inspect existing remotes before proposing a target repository. Forking is a user workflow, not an MIT requirement. Confirm public release scope before upload. Exclude local backups, private media, credentials, caches and development-only image assets.

## 角色圖片定稿與沈硯舟 V1.0

所有角色第一次確立外貌後依 `docs/VISUAL_MEMORY.md` 建立並使用角色鎖定參考。創作《磚2》沈硯舟圖片／聊天／Instagram 時，**必須先讀** `stories/ambiguity-b/visual-memory/shen-yanzhou.json`、`stories/ambiguity-b/characters/shen-yanzhou-photo-rules-v1.md` 與 `stories/ambiguity-b/characters/shen-yanzhou-photo-index.json`；不要只依姓名生成。沈硯舟是愛自拍（長期照片權重 40%）、聒噪而活潑的大學生，情緒與劇情能讓照片變多或變少。永久禁止他主動要求玩家傳任何私人照片，任何關係階段都不例外。實際資產上傳、引用劇情與 CI 驗證是不同步驟，僅完成的部分才可回報成功。
