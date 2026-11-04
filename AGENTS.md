# Agent instructions

Check the working tree and remotes before editing. Preserve existing files and uncommitted work.

This is an existing interactive virtual phone framework. Users usually want to add a story, not rebuild the phone. Read docs/ARCHITECTURE.md, docs/PROGRESS.md, docs/AI_STORY_GUIDE.md and docs/STORY_SCHEMA.md.

Prefer editing stories/template/story.json. stories/blank/story.json remains a blank starting point. Keep story data separate from UI code and player saves. Accept natural language, chat records, images and event requirements as author input; convert them to validated structured story data. Ask about missing major plot decisions and use reasonable defaults for minor details.

Reuse the Phone Runtime, App registry and event engine. Do not rewrite App UI or shared engines merely to add content. For a new App follow docs/APP_DEVELOPMENT.md. Keep stable IDs and versioned schemas. Reject arbitrary scripts, HTML and executable imports. Never copy private account data into a story.

Run npm run story:validate, npm run story:test and npm run build after story changes. Add passing paths for every new ending, including passwords, hidden content, calls and cross-App events. Preview the result and check saves. For engine changes also run typecheck, lint, unit and relevant browser tests. Report unverified device behavior honestly; App registration is not complete app-specific fidelity.

Preserve MIT, dependency licenses and source copyright notices. Do not automatically Fork, Star, Push or publish. Inspect existing remotes before proposing a target repository. Forking is a user workflow, not an MIT requirement. Confirm public release scope before upload. Exclude local backups, private media, credentials, caches and development-only image assets.

## Character visual memory (required before image generation)

When generating character selfies, chat images, Instagram Story images or posts, read `docs/CHARACTER_VISUAL_MEMORY.md`, `assets/characters/visual-memory-registry.json`, and the specific character's `assets/characters/<id>/visual-memory.json`. Reuse their *actual confirmed reference image*, not only the character's name or a reworded face prompt. Preserve identity and distinguish fixed features from optional outfits/scenes. If the image reference cannot be accessed, say so instead of pretending it was used. Track whether assets were actually committed, and never claim a GitHub image path exists before verifying it. Qiye's current profile is `assets/characters/qiye/visual-memory.json`; the sheet itself awaits upload at `assets/characters/qiye/reference/qiye_reference_sheet_v1.jpg`.
