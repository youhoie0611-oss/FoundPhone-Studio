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


## Gu Shian author-confirmed photo policy V1.0

Before creating or changing Gu Shian photos, story chat images, Instagram Story or Post, read `assets/characters/gu_shian/PHOTO_POLICY_V1.md` and `assets/characters/gu_shian/photo-policy-v1.json` in addition to his visual-memory file AND approved reference image. Canon: June 18 birthday, single, 85% golden-retriever warmth + 15% mature/reliable. Long-term content mix 25% selfies/style, 25% architecture/scenery, 20% food/pets/daily, 15% work, 15% friends/outdoor; NOT a daily quota. Known companion NPC capture mix 50% self, 20% companion takes, 30% group photo. Do not invent a companion or include the player. Capture, sharing decision, delivery/read must remain separate events. Existing authored photos are immutable; cross-post by original photoId. The file `assets/characters/gu_shian/photo-ledger-v1.json` is an authoring ledger, NOT evidence the runtime has a dynamic photography engine. Never report policy registration as full feature delivery.

Gu Shian's dog is now author-approved as a medium, short-haired, milk-tea-colored Taiwanese mixed-breed with white chest, semi-floppy ears and deep brown eyes; his glasses are translucent warm tea-color rounded-square frames, not always worn. New generated visual board has an unapproved pet-name label; never treat it as canon. Read `assets/characters/gu_shian/pet-memory.json` before creating dog photos. The original reference sheet remains facial canon.
