# Agent instructions

Check the working tree and remotes before editing. Preserve existing files and uncommitted work.

This is an existing interactive virtual phone framework. Users usually want to add a story, not rebuild the phone. Read docs/ARCHITECTURE.md, docs/PROGRESS.md, docs/AI_STORY_GUIDE.md and docs/STORY_SCHEMA.md.

Prefer editing stories/template/story.json. stories/blank/story.json remains a blank starting point. Keep story data separate from UI code and player saves. Accept natural language, chat records, images and event requirements as author input; convert them to validated structured story data. Ask about missing major plot decisions and use reasonable defaults for minor details.

Reuse the Phone Runtime, App registry and event engine. Do not rewrite App UI or shared engines merely to add content. For a new App follow docs/APP_DEVELOPMENT.md. Keep stable IDs and versioned schemas. Reject arbitrary scripts, HTML and executable imports. Never copy private account data into a story.

Run npm run story:validate, npm run story:test and npm run build after story changes. Add passing paths for every new ending, including passwords, hidden content, calls and cross-App events. Preview the result and check saves. For engine changes also run typecheck, lint, unit and relevant browser tests. Report unverified device behavior honestly; App registration is not complete app-specific fidelity.

Preserve MIT, dependency licenses and source copyright notices. Do not automatically Fork, Star, Push or publish. Inspect existing remotes before proposing a target repository. Forking is a user workflow, not an MIT requirement. Confirm public release scope before upload. Exclude local backups, private media, credentials, caches and development-only image assets.

## Character visual memory (required before image generation)

When generating character selfies, chat images, Instagram Story images or posts, read `docs/CHARACTER_VISUAL_MEMORY.md`, `assets/characters/visual-memory-registry.json`, and the specific character's `assets/characters/<id>/visual-memory.json`. Reuse their *actual confirmed reference image*, not only the character's name or a reworded face prompt. Preserve identity and distinguish fixed features from optional outfits/scenes. If the image reference cannot be accessed, say so instead of pretending it was used. Track whether assets were actually committed, and never claim a GitHub image path exists before verifying it. Qiye's current profile is `assets/characters/qiye/visual-memory.json`; the sheet itself awaits upload at `assets/characters/qiye/reference/qiye_reference_sheet_v1.jpg`.


For Gu Shian, use `assets/characters/gu_shian/visual-memory.json` and `assets/characters/gu_shian/reference/gu_shian_reference_sheet_v1.jpg` as the approved visual identity. Before any new character image, run `npm run visual-memory:brief -- <character_id> <chat|instagram_story|instagram_post>`, inspect the referenced image pixels, and file the result under the returned destination. Do not treat a brief's file path as equivalent to sending the pixels to the image generator.

For Pei Zhiyu, the authoritative character image is `assets/characters/pei_zhiyu/reference/pei_zhiyu_reference_sheet_v1.png`; load that image and `assets/characters/pei_zhiyu/visual-memory.json` before generating. The sheet has an obsolete name label, but the approved identity is Pei Zhiyu. The canonical registry is `assets/characters/visual-memory-registry.json`. `stories/visual-memory/` contains only earlier supplemental notes and is not an alternative registry; never prioritize it over the canonical registry.

## Brick2 offline photo asset rules (author-approved V3)

Read `stories/qiye/PHOTO_POLICY_V3.md` and `stories/qiye/photo-policy-v3.json` before authoring Qiye photography scenes. The runtime is a single-player, pre-authored game; generation occurs during content creation, not upon opening a chat. Persist three separate stages: captured → share decision → delivered/read, and reuse the original photo when the player revisits.

All characters: player replies via scripted choices, no player image upload, no player-with-NPC images, and no NPC request for the player's photos. NPCs may send already-authored photos while their chats are closed; unread state must persist. A real, known companion NPC can take Qiye's photo or appear in an NPC group image, with correct character/visual continuity. Do not invent companions. Qiye's photo-topic 30/25/20/15/10 and companion-photographer 50/20/30 values are long-term reference weights, never forced daily quotas. Until media assets and runtime events are integrated and verified, clearly label photo-policy data as authoring-only.

