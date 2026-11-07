/** Authored Brick3 choice/photo registry. Generated from the existing event configurations; does not unlock unpublished media. */
export interface Brick3CausalAuthoredEvent { id: string; characterId: string; kind: "photo" | "invitation"; photoIds: string[]; choices: { target: string; label: string; branch: string; topic: string }[] }
export const brick3AuthoredEvents: Brick3CausalAuthoredEvent[] = [
 {
  "id": "photo_morning_breakfast",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_breakfast_chat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_morning_breakfast-choice-1",
    "label": "你早餐都自己做？",
    "branch": "contextual_response",
    "topic": "gu_cooking_habits"
   },
   {
    "target": "brick3-photo-photo_morning_breakfast-choice-2",
    "label": "看起來很好吃。",
    "branch": "contextual_response",
    "topic": "gu_breakfast"
   },
   {
    "target": "brick3-photo-photo_morning_breakfast-choice-3",
    "label": "你是在炫耀廚藝嗎？",
    "branch": "contextual_response",
    "topic": "gu_light_banter"
   },
   {
    "target": "brick3-photo-photo_morning_breakfast-choice-4",
    "label": "我早上通常沒什麼時間聊天。",
    "branch": "contextual_response",
    "topic": "gu_morning_boundary"
   }
  ]
 },
 {
  "id": "photo_design_review",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_studio_chat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_design_review-choice-1",
    "label": "辛苦了，順利嗎？",
    "branch": "contextual_response",
    "topic": "gu_proposal_outcome"
   },
   {
    "target": "brick3-photo-photo_design_review-choice-2",
    "label": "模型做得很好看。",
    "branch": "contextual_response",
    "topic": "gu_architecture_process"
   },
   {
    "target": "brick3-photo-photo_design_review-choice-3",
    "label": "終於可以休息了吧？",
    "branch": "contextual_response",
    "topic": "gu_rest"
   },
   {
    "target": "brick3-photo-photo_design_review-choice-4",
    "label": "我晚點再找你。",
    "branch": "contextual_response",
    "topic": "gu_pause"
   }
  ]
 },
 {
  "id": "photo_dinner_invite",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_dinner_chat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_dinner_invite-choice-1",
    "label": "好啊，我等等過去。",
    "branch": "accept_visit",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_dinner_invite-choice-2",
    "label": "你居然會主動邀請我？",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_dinner_invite-choice-3",
    "label": "今天不方便，下次吧。",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_dinner_invite-choice-4",
    "label": "只有吃飯？",
    "branch": "contextual_response",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_dinner_at_home",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_dinner_visit_table_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_dinner_at_home-choice-1",
    "label": "今晚吃得很開心。",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_dinner_at_home-choice-2",
    "label": "可以牽你的手嗎？",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_dinner_at_home-choice-3",
    "label": "我們先別談以前。",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_dinner_at_home-choice-4",
    "label": "我差不多該回去了。",
    "branch": "contextual_response",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_camera_walk",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_photo_walk_chat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_camera_walk-choice-1",
    "label": "這張光線好好看。",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_camera_walk-choice-2",
    "label": "你在哪裡拍的？",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_camera_walk-choice-3",
    "label": "下次可以一起去嗎？",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_camera_walk-choice-4",
    "label": "我不太懂攝影欸。",
    "branch": "contextual_response",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_practice_update",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_basketball_chat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_practice_update-choice-1",
    "label": "贏了嗎？",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_practice_update-choice-2",
    "label": "你也太有精神。",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_practice_update-choice-3",
    "label": "有照片嗎？",
    "branch": "contextual_response",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_practice_update-choice-4",
    "label": "先去休息吧。",
    "branch": "contextual_response",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_night_view",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_night_drive_chat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_night_view-choice-1",
    "label": "這裡是哪？",
    "branch": "night_view_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_night_view-choice-2",
    "label": "你拍照居然還不錯。",
    "branch": "night_view_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_night_view-choice-3",
    "label": "這麼晚還在外面？注意安全。",
    "branch": "night_view_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_night_view-choice-4",
    "label": "嗯，還行。",
    "branch": "night_view_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_weekend_sport",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_street_sport_chat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_weekend_sport-choice-1",
    "label": "在哪個球場？",
    "branch": "weekend_sport_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_weekend_sport-choice-2",
    "label": "你今天又要跟人比輸贏？",
    "branch": "weekend_sport_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_weekend_sport-choice-3",
    "label": "天快黑了，記得補水。",
    "branch": "weekend_sport_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_weekend_sport-choice-4",
    "label": "好，那你去打吧。",
    "branch": "weekend_sport_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_parked_car_selfie",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_parked_car_selfie_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_parked_car_selfie-choice-1",
    "label": "是剛保養完的那台？",
    "branch": "photo_qi_batch01_parked_car_selfie_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_parked_car_selfie-choice-2",
    "label": "這張是停車合格證書嗎？",
    "branch": "photo_qi_batch01_parked_car_selfie_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_parked_car_selfie-choice-3",
    "label": "停好才拍的吧？",
    "branch": "photo_qi_batch01_parked_car_selfie_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_parked_car_selfie-choice-4",
    "label": "好，先這樣。",
    "branch": "photo_qi_batch01_parked_car_selfie_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_postgame_sweat",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_postgame_sweat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_postgame_sweat-choice-1",
    "label": "打了幾場？",
    "branch": "photo_qi_batch01_postgame_sweat_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_postgame_sweat-choice-2",
    "label": "不是說你很能打？",
    "branch": "photo_qi_batch01_postgame_sweat_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_postgame_sweat-choice-3",
    "label": "記得先補水。",
    "branch": "photo_qi_batch01_postgame_sweat_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_postgame_sweat-choice-4",
    "label": "那你先休息。",
    "branch": "photo_qi_batch01_postgame_sweat_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_design_desk",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_design_desk_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_design_desk-choice-1",
    "label": "這版想呈現什麼？",
    "branch": "photo_qi_batch01_design_desk_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_design_desk-choice-2",
    "label": "你居然真的有在做事。",
    "branch": "photo_qi_batch01_design_desk_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_design_desk-choice-3",
    "label": "弄太晚就先休息。",
    "branch": "photo_qi_batch01_design_desk_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_design_desk-choice-4",
    "label": "嗯，你忙你的。",
    "branch": "photo_qi_batch01_design_desk_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_outfit_mirror",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_outfit_mirror_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_outfit_mirror-choice-1",
    "label": "你今天去哪裡？",
    "branch": "photo_qi_batch01_outfit_mirror_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_outfit_mirror-choice-2",
    "label": "終於承認你會在意穿搭了？",
    "branch": "photo_qi_batch01_outfit_mirror_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_outfit_mirror-choice-3",
    "label": "談事情別太衝。",
    "branch": "photo_qi_batch01_outfit_mirror_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_outfit_mirror-choice-4",
    "label": "還行，路上小心。",
    "branch": "photo_qi_batch01_outfit_mirror_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_night_burger",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_night_burger_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_night_burger-choice-1",
    "label": "哪一家的？",
    "branch": "photo_qi_batch01_night_burger_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_night_burger-choice-2",
    "label": "你這叫吃一口？",
    "branch": "photo_qi_batch01_night_burger_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_night_burger-choice-3",
    "label": "這麼晚吃不怕胃不舒服？",
    "branch": "photo_qi_batch01_night_burger_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_night_burger-choice-4",
    "label": "看起來還好。",
    "branch": "photo_qi_batch01_night_burger_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_late_sofa",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_late_sofa_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_late_sofa-choice-1",
    "label": "家裡又在催你？",
    "branch": "photo_qi_batch01_late_sofa_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_late_sofa-choice-2",
    "label": "你也有不吵架的一天？",
    "branch": "photo_qi_batch01_late_sofa_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_late_sofa-choice-3",
    "label": "不想講就先休息。",
    "branch": "photo_qi_batch01_late_sofa_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_late_sofa-choice-4",
    "label": "好，那先不聊。",
    "branch": "photo_qi_batch01_late_sofa_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_camera_detail",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_camera_detail_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_camera_detail-choice-1",
    "label": "什麼型號？",
    "branch": "photo_qi_batch01_camera_detail_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_camera_detail-choice-2",
    "label": "富少連相機都玩古董？",
    "branch": "photo_qi_batch01_camera_detail_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_camera_detail-choice-3",
    "label": "還能正常拍嗎？",
    "branch": "photo_qi_batch01_camera_detail_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_camera_detail-choice-4",
    "label": "喔，還不錯。",
    "branch": "photo_qi_batch01_camera_detail_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_batch01_skate_break",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_skate_break_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_batch01_skate_break-choice-1",
    "label": "怎麼難滑？",
    "branch": "photo_qi_batch01_skate_break_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_skate_break-choice-2",
    "label": "滑板都能跟你作對？",
    "branch": "photo_qi_batch01_skate_break_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_skate_break-choice-3",
    "label": "沒受傷吧？",
    "branch": "photo_qi_batch01_skate_break_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_batch01_skate_break-choice-4",
    "label": "好，那你繼續玩。",
    "branch": "photo_qi_batch01_skate_break_cool",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_gu_batch01_dog_selfie",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_dog_selfie_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_dog_selfie-choice-1",
    "label": "牠是在催你帶牠出去嗎？",
    "branch": "photo_gu_batch01_dog_selfie_ask",
    "topic": "dog_selfie_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_dog_selfie-choice-2",
    "label": "你們兩個這張有點像耶。",
    "branch": "photo_gu_batch01_dog_selfie_tease",
    "topic": "dog_selfie_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_dog_selfie-choice-3",
    "label": "原來你真的有養狗！",
    "branch": "photo_gu_batch01_dog_selfie_dog",
    "topic": "dog_selfie_dog"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_dog_selfie-choice-4",
    "label": "你先陪牠吧，我晚點再聊。",
    "branch": "photo_gu_batch01_dog_selfie_boundary",
    "topic": "dog_selfie_boundary"
   }
  ]
 },
 {
  "id": "photo_gu_batch01_office_mirror",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_office_mirror_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_office_mirror-choice-1",
    "label": "今天工作還順利嗎？",
    "branch": "photo_gu_batch01_office_mirror_work",
    "topic": "office_mirror_work"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_office_mirror-choice-2",
    "label": "原來你會拍這種下班照。",
    "branch": "photo_gu_batch01_office_mirror_tease",
    "topic": "office_mirror_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_office_mirror-choice-3",
    "label": "這副眼鏡滿適合你的。",
    "branch": "photo_gu_batch01_office_mirror_compliment",
    "topic": "office_mirror_compliment"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_office_mirror-choice-4",
    "label": "你快下班吧，我先忙。",
    "branch": "photo_gu_batch01_office_mirror_boundary",
    "topic": "office_mirror_boundary"
   }
  ]
 },
 {
  "id": "photo_gu_batch01_workout_story",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_workout_story_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_workout_story-choice-1",
    "label": "你今天運動什麼？",
    "branch": "photo_gu_batch01_workout_story_ask",
    "topic": "workout_story_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_workout_story-choice-2",
    "label": "看起來是真的累。",
    "branch": "photo_gu_batch01_workout_story_care",
    "topic": "workout_story_care"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_workout_story-choice-3",
    "label": "原來你也有不想動的時候。",
    "branch": "photo_gu_batch01_workout_story_tease",
    "topic": "workout_story_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_workout_story-choice-4",
    "label": "運動愉快，記得補水。",
    "branch": "photo_gu_batch01_workout_story_kind",
    "topic": "workout_story_kind"
   }
  ]
 },
 {
  "id": "photo_gu_batch01_dog_walk_story",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_dog_walk_story_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_dog_walk_story-choice-1",
    "label": "牠看起來好開心！",
    "branch": "photo_gu_batch01_dog_walk_story_praise",
    "topic": "dog_walk_story_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_dog_walk_story-choice-2",
    "label": "平常你會帶牠走多久？",
    "branch": "photo_gu_batch01_dog_walk_story_ask",
    "topic": "dog_walk_story_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_dog_walk_story-choice-3",
    "label": "這張很像牠在催你快點。",
    "branch": "photo_gu_batch01_dog_walk_story_tease",
    "topic": "dog_walk_story_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_dog_walk_story-choice-4",
    "label": "散步注意安全。",
    "branch": "photo_gu_batch01_dog_walk_story_care",
    "topic": "dog_walk_story_care"
   }
  ]
 },
 {
  "id": "photo_gu_batch01_cooking_story",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_cooking_story_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_cooking_story-choice-1",
    "label": "你煮的是鮭魚嗎？",
    "branch": "photo_gu_batch01_cooking_story_ask",
    "topic": "cooking_story_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_cooking_story-choice-2",
    "label": "看起來很成功！",
    "branch": "photo_gu_batch01_cooking_story_praise",
    "topic": "cooking_story_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_cooking_story-choice-3",
    "label": "所以洗鍋誰負責？",
    "branch": "photo_gu_batch01_cooking_story_tease",
    "topic": "cooking_story_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_cooking_story-choice-4",
    "label": "小心別燙到。",
    "branch": "photo_gu_batch01_cooking_story_care",
    "topic": "cooking_story_care"
   }
  ]
 },
 {
  "id": "photo_gu_batch01_architecture_light_post",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_architecture_light_post_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_architecture_light_post-choice-1",
    "label": "這個光影真的很漂亮。",
    "branch": "photo_gu_batch01_architecture_light_post_praise",
    "topic": "architecture_light_post_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_architecture_light_post-choice-2",
    "label": "這是你設計的建築嗎？",
    "branch": "photo_gu_batch01_architecture_light_post_ask",
    "topic": "architecture_light_post_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_architecture_light_post-choice-3",
    "label": "建築師是不是連散步都在上班？",
    "branch": "photo_gu_batch01_architecture_light_post_tease",
    "topic": "architecture_light_post_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_architecture_light_post-choice-4",
    "label": "你很喜歡這種清水模的質感？",
    "branch": "photo_gu_batch01_architecture_light_post_professional",
    "topic": "architecture_light_post_professional"
   }
  ]
 },
 {
  "id": "photo_gu_batch01_sunset_post",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_sunset_post_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_sunset_post-choice-1",
    "label": "這個顏色太好看了。",
    "branch": "photo_gu_batch01_sunset_post_praise",
    "topic": "sunset_post_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_sunset_post-choice-2",
    "label": "你在哪個地方拍的？",
    "branch": "photo_gu_batch01_sunset_post_ask",
    "topic": "sunset_post_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_sunset_post-choice-3",
    "label": "你是不是很愛拍天空？",
    "branch": "photo_gu_batch01_sunset_post_tease",
    "topic": "sunset_post_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_sunset_post-choice-4",
    "label": "我今天也有看到漂亮的晚霞。",
    "branch": "photo_gu_batch01_sunset_post_share",
    "topic": "sunset_post_share"
   }
  ]
 },
 {
  "id": "photo_gu_batch01_cafe_portrait_post",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_cafe_portrait_post_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch01_cafe_portrait_post-choice-1",
    "label": "這家看起來很舒服。",
    "branch": "photo_gu_batch01_cafe_portrait_post_praise",
    "topic": "cafe_portrait_post_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_cafe_portrait_post-choice-2",
    "label": "你真的有在休息嗎？",
    "branch": "photo_gu_batch01_cafe_portrait_post_tease",
    "topic": "cafe_portrait_post_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_cafe_portrait_post-choice-3",
    "label": "你的眼鏡滿好看的。",
    "branch": "photo_gu_batch01_cafe_portrait_post_compliment",
    "topic": "cafe_portrait_post_compliment"
   },
   {
    "target": "brick3-photo-photo_gu_batch01_cafe_portrait_post-choice-4",
    "label": "週末愉快。",
    "branch": "photo_gu_batch01_cafe_portrait_post_neutral",
    "topic": "cafe_portrait_post_neutral"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_dorm_morning_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_dorm_morning_selfie-choice-1",
    "label": "也太亂了吧哈哈哈",
    "branch": "photo_shen_batch01_dorm_morning_selfie_response_1",
    "topic": "photo_shen_batch01_dorm_morning_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_dorm_morning_selfie-choice-2",
    "label": "你看起來還是很有精神",
    "branch": "photo_shen_batch01_dorm_morning_selfie_response_2",
    "topic": "photo_shen_batch01_dorm_morning_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_dorm_morning_selfie-choice-3",
    "label": "這麼早就起床？",
    "branch": "photo_shen_batch01_dorm_morning_selfie_response_3",
    "topic": "photo_shen_batch01_dorm_morning_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_dorm_morning_selfie-choice-4",
    "label": "你先去整理啦，晚點聊",
    "branch": "photo_shen_batch01_dorm_morning_selfie_response_4",
    "topic": "photo_shen_batch01_dorm_morning_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_classroom_bored_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_02"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_classroom_bored_selfie-choice-1",
    "label": "你又在偷玩手機",
    "branch": "photo_shen_batch01_classroom_bored_selfie_response_1",
    "topic": "photo_shen_batch01_classroom_bored_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_classroom_bored_selfie-choice-2",
    "label": "窗邊光線很好欸",
    "branch": "photo_shen_batch01_classroom_bored_selfie_response_2",
    "topic": "photo_shen_batch01_classroom_bored_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_classroom_bored_selfie-choice-3",
    "label": "你是不是其實很愛自拍",
    "branch": "photo_shen_batch01_classroom_bored_selfie_response_3",
    "topic": "photo_shen_batch01_classroom_bored_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_classroom_bored_selfie-choice-4",
    "label": "快上課了吧，你先收手機",
    "branch": "photo_shen_batch01_classroom_bored_selfie_response_4",
    "topic": "photo_shen_batch01_classroom_bored_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_gym_mirror_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_03"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_gym_mirror_selfie-choice-1",
    "label": "你流好多汗",
    "branch": "photo_shen_batch01_gym_mirror_selfie_response_1",
    "topic": "photo_shen_batch01_gym_mirror_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_gym_mirror_selfie-choice-2",
    "label": "今天練什麼？",
    "branch": "photo_shen_batch01_gym_mirror_selfie_response_2",
    "topic": "photo_shen_batch01_gym_mirror_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_gym_mirror_selfie-choice-3",
    "label": "鏡子自拍很熟練喔",
    "branch": "photo_shen_batch01_gym_mirror_selfie_response_3",
    "topic": "photo_shen_batch01_gym_mirror_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_gym_mirror_selfie-choice-4",
    "label": "記得休息，不要練過頭",
    "branch": "photo_shen_batch01_gym_mirror_selfie_response_4",
    "topic": "photo_shen_batch01_gym_mirror_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_cafe_editing_break",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_04"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_cafe_editing_break-choice-1",
    "label": "你很常一個人待咖啡店耶",
    "branch": "photo_shen_batch01_cafe_editing_break_response_1",
    "topic": "photo_shen_batch01_cafe_editing_break_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_cafe_editing_break-choice-2",
    "label": "這張氛圍很好",
    "branch": "photo_shen_batch01_cafe_editing_break_response_2",
    "topic": "photo_shen_batch01_cafe_editing_break_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_cafe_editing_break-choice-3",
    "label": "修照片累不累？",
    "branch": "photo_shen_batch01_cafe_editing_break_response_3",
    "topic": "photo_shen_batch01_cafe_editing_break_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_cafe_editing_break-choice-4",
    "label": "那你先忙，別分心了",
    "branch": "photo_shen_batch01_cafe_editing_break_response_4",
    "topic": "photo_shen_batch01_cafe_editing_break_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_basketball_sunset_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_05"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_basketball_sunset_selfie-choice-1",
    "label": "你看起來超累",
    "branch": "photo_shen_batch01_basketball_sunset_selfie_response_1",
    "topic": "photo_shen_batch01_basketball_sunset_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_basketball_sunset_selfie-choice-2",
    "label": "夕陽很好看耶",
    "branch": "photo_shen_batch01_basketball_sunset_selfie_response_2",
    "topic": "photo_shen_batch01_basketball_sunset_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_basketball_sunset_selfie-choice-3",
    "label": "今天有贏嗎？",
    "branch": "photo_shen_batch01_basketball_sunset_selfie_response_3",
    "topic": "photo_shen_batch01_basketball_sunset_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_basketball_sunset_selfie-choice-4",
    "label": "快去休息啦，等等又著涼",
    "branch": "photo_shen_batch01_basketball_sunset_selfie_response_4",
    "topic": "photo_shen_batch01_basketball_sunset_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_elevator_outfit_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_06"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_elevator_outfit_selfie-choice-1",
    "label": "今天穿搭不錯喔",
    "branch": "photo_shen_batch01_elevator_outfit_selfie_response_1",
    "topic": "photo_shen_batch01_elevator_outfit_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_elevator_outfit_selfie-choice-2",
    "label": "你真的很會找地方自拍",
    "branch": "photo_shen_batch01_elevator_outfit_selfie_response_2",
    "topic": "photo_shen_batch01_elevator_outfit_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_elevator_outfit_selfie-choice-3",
    "label": "你要去哪？",
    "branch": "photo_shen_batch01_elevator_outfit_selfie_response_3",
    "topic": "photo_shen_batch01_elevator_outfit_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_elevator_outfit_selfie-choice-4",
    "label": "路上小心，玩得開心",
    "branch": "photo_shen_batch01_elevator_outfit_selfie_response_4",
    "topic": "photo_shen_batch01_elevator_outfit_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_convenience_store_night_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_07"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_convenience_store_night_selfie-choice-1",
    "label": "你晚上還喝飲料？",
    "branch": "photo_shen_batch01_convenience_store_night_selfie_response_1",
    "topic": "photo_shen_batch01_convenience_store_night_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_convenience_store_night_selfie-choice-2",
    "label": "這張有點帥欸",
    "branch": "photo_shen_batch01_convenience_store_night_selfie_response_2",
    "topic": "photo_shen_batch01_convenience_store_night_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_convenience_store_night_selfie-choice-3",
    "label": "你這時間還在外面晃",
    "branch": "photo_shen_batch01_convenience_store_night_selfie_response_3",
    "topic": "photo_shen_batch01_convenience_store_night_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_convenience_store_night_selfie-choice-4",
    "label": "那快回去休息吧",
    "branch": "photo_shen_batch01_convenience_store_night_selfie_response_4",
    "topic": "photo_shen_batch01_convenience_store_night_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_rainy_neon_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_08"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_rainy_neon_selfie-choice-1",
    "label": "這種光線很適合你耶",
    "branch": "photo_shen_batch01_rainy_neon_selfie_response_1",
    "topic": "photo_shen_batch01_rainy_neon_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_rainy_neon_selfie-choice-2",
    "label": "有沒有淋濕？",
    "branch": "photo_shen_batch01_rainy_neon_selfie_response_2",
    "topic": "photo_shen_batch01_rainy_neon_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_rainy_neon_selfie-choice-3",
    "label": "你心情好像有點安靜",
    "branch": "photo_shen_batch01_rainy_neon_selfie_response_3",
    "topic": "photo_shen_batch01_rainy_neon_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_rainy_neon_selfie-choice-4",
    "label": "快回家，別感冒",
    "branch": "photo_shen_batch01_rainy_neon_selfie_response_4",
    "topic": "photo_shen_batch01_rainy_neon_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_izakaya_friends_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_09"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_izakaya_friends_selfie-choice-1",
    "label": "感覺很熱鬧",
    "branch": "photo_shen_batch01_izakaya_friends_selfie_response_1",
    "topic": "photo_shen_batch01_izakaya_friends_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_izakaya_friends_selfie-choice-2",
    "label": "你今天看起來很開心",
    "branch": "photo_shen_batch01_izakaya_friends_selfie_response_2",
    "topic": "photo_shen_batch01_izakaya_friends_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_izakaya_friends_selfie-choice-3",
    "label": "你有喝酒嗎？",
    "branch": "photo_shen_batch01_izakaya_friends_selfie_response_3",
    "topic": "photo_shen_batch01_izakaya_friends_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_izakaya_friends_selfie-choice-4",
    "label": "那你先好好玩，晚點聊",
    "branch": "photo_shen_batch01_izakaya_friends_selfie_response_4",
    "topic": "photo_shen_batch01_izakaya_friends_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_shen_batch01_late_night_desk_selfie",
  "characterId": "shen_yanzhou",
  "kind": "photo",
  "photoIds": [
   "shen_yanzhou_batch01_10"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_shen_batch01_late_night_desk_selfie-choice-1",
    "label": "你又熬夜了",
    "branch": "photo_shen_batch01_late_night_desk_selfie_response_1",
    "topic": "photo_shen_batch01_late_night_desk_selfie_reaction_1"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_late_night_desk_selfie-choice-2",
    "label": "這張很有深夜感",
    "branch": "photo_shen_batch01_late_night_desk_selfie_response_2",
    "topic": "photo_shen_batch01_late_night_desk_selfie_reaction_2"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_late_night_desk_selfie-choice-3",
    "label": "要不要先休息一下？",
    "branch": "photo_shen_batch01_late_night_desk_selfie_response_3",
    "topic": "photo_shen_batch01_late_night_desk_selfie_reaction_3"
   },
   {
    "target": "brick3-photo-photo_shen_batch01_late_night_desk_selfie-choice-4",
    "label": "太晚了，做完就快去睡",
    "branch": "photo_shen_batch01_late_night_desk_selfie_response_4",
    "topic": "photo_shen_batch01_late_night_desk_selfie_reaction_4"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_parked_car_selfie",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_parked_car_selfie_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_parked_car_selfie-choice-1",
    "label": "今天去哪裡了？",
    "branch": "photo_gu_batch02_parked_car_selfie_ask",
    "topic": "gu_batch02_parked_car_selfie_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_parked_car_selfie-choice-2",
    "label": "看起來塞車塞得很累。",
    "branch": "photo_gu_batch02_parked_car_selfie_care",
    "topic": "gu_batch02_parked_car_selfie_care"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_parked_car_selfie-choice-3",
    "label": "你這張像在打卡證明自己到了。",
    "branch": "photo_gu_batch02_parked_car_selfie_tease",
    "topic": "gu_batch02_parked_car_selfie_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_parked_car_selfie-choice-4",
    "label": "你先忙你的事吧。",
    "branch": "photo_gu_batch02_parked_car_selfie_boundary",
    "topic": "gu_batch02_parked_car_selfie_boundary"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_site_check",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_site_check_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_site_check-choice-1",
    "label": "現在還在施工嗎？",
    "branch": "photo_gu_batch02_site_check_ask",
    "topic": "gu_batch02_site_check_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_site_check-choice-2",
    "label": "這看起來滿壯觀的。",
    "branch": "photo_gu_batch02_site_check_praise",
    "topic": "gu_batch02_site_check_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_site_check-choice-3",
    "label": "記得戴安全帽。",
    "branch": "photo_gu_batch02_site_check_care",
    "topic": "gu_batch02_site_check_care"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_site_check-choice-4",
    "label": "你先專心工作吧。",
    "branch": "photo_gu_batch02_site_check_boundary",
    "topic": "gu_batch02_site_check_boundary"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_dog_cuddle",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_dog_cuddle_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_dog_cuddle-choice-1",
    "label": "牠看起來好幸福。",
    "branch": "photo_gu_batch02_dog_cuddle_praise",
    "topic": "gu_batch02_dog_cuddle_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_dog_cuddle-choice-2",
    "label": "你們兩個也太黏了吧。",
    "branch": "photo_gu_batch02_dog_cuddle_tease",
    "topic": "gu_batch02_dog_cuddle_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_dog_cuddle-choice-3",
    "label": "牠平常也這麼愛撒嬌嗎？",
    "branch": "photo_gu_batch02_dog_cuddle_ask",
    "topic": "gu_batch02_dog_cuddle_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_dog_cuddle-choice-4",
    "label": "那你好好休息。",
    "branch": "photo_gu_batch02_dog_cuddle_boundary",
    "topic": "gu_batch02_dog_cuddle_boundary"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_desk_sketch",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_desk_sketch_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_desk_sketch-choice-1",
    "label": "你是不是還在意被退件的事？",
    "branch": "photo_gu_batch02_desk_sketch_care",
    "topic": "gu_batch02_desk_sketch_care"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_desk_sketch-choice-2",
    "label": "這個配置和之前不一樣？",
    "branch": "photo_gu_batch02_desk_sketch_ask",
    "topic": "gu_batch02_desk_sketch_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_desk_sketch-choice-3",
    "label": "畫這麼多張，眼睛都要花了。",
    "branch": "photo_gu_batch02_desk_sketch_tease",
    "topic": "gu_batch02_desk_sketch_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_desk_sketch-choice-4",
    "label": "你先休息，我明天再看。",
    "branch": "photo_gu_batch02_desk_sketch_boundary",
    "topic": "gu_batch02_desk_sketch_boundary"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_climbing_story",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_climbing_story_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_climbing_story-choice-1",
    "label": "你也會攀岩喔？",
    "branch": "photo_gu_batch02_climbing_story_ask",
    "topic": "gu_batch02_climbing_story_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_climbing_story-choice-2",
    "label": "這表情看起來真的累。",
    "branch": "photo_gu_batch02_climbing_story_care",
    "topic": "gu_batch02_climbing_story_care"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_climbing_story-choice-3",
    "label": "下次要不要挑戰更難的？",
    "branch": "photo_gu_batch02_climbing_story_tease",
    "topic": "gu_batch02_climbing_story_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_climbing_story-choice-4",
    "label": "休息一下吧。",
    "branch": "photo_gu_batch02_climbing_story_neutral",
    "topic": "gu_batch02_climbing_story_neutral"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_clam_pasta_story",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_clam_pasta_story_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_clam_pasta_story-choice-1",
    "label": "你自己煮的？",
    "branch": "photo_gu_batch02_clam_pasta_story_ask",
    "topic": "gu_batch02_clam_pasta_story_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_clam_pasta_story-choice-2",
    "label": "看起來很有餐廳的感覺。",
    "branch": "photo_gu_batch02_clam_pasta_story_praise",
    "topic": "gu_batch02_clam_pasta_story_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_clam_pasta_story-choice-3",
    "label": "有沒有留一口給我？",
    "branch": "photo_gu_batch02_clam_pasta_story_tease",
    "topic": "gu_batch02_clam_pasta_story_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_clam_pasta_story-choice-4",
    "label": "先去好好吃飯啦。",
    "branch": "photo_gu_batch02_clam_pasta_story_neutral",
    "topic": "gu_batch02_clam_pasta_story_neutral"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_riverside_sunset_story",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_riverside_sunset_story_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_riverside_sunset_story-choice-1",
    "label": "這個顏色真的很好看。",
    "branch": "photo_gu_batch02_riverside_sunset_story_praise",
    "topic": "gu_batch02_riverside_sunset_story_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_riverside_sunset_story-choice-2",
    "label": "你在哪裡拍的？",
    "branch": "photo_gu_batch02_riverside_sunset_story_ask",
    "topic": "gu_batch02_riverside_sunset_story_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_riverside_sunset_story-choice-3",
    "label": "你是不是又忍不住停下來拍照了？",
    "branch": "photo_gu_batch02_riverside_sunset_story_tease",
    "topic": "gu_batch02_riverside_sunset_story_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_riverside_sunset_story-choice-4",
    "label": "下班還能看到這個，挺好的。",
    "branch": "photo_gu_batch02_riverside_sunset_story_neutral",
    "topic": "gu_batch02_riverside_sunset_story_neutral"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_wood_exhibit_post",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_wood_exhibit_post_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_wood_exhibit_post-choice-1",
    "label": "這個展覽感覺很有趣。",
    "branch": "photo_gu_batch02_wood_exhibit_post_praise",
    "topic": "gu_batch02_wood_exhibit_post_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_wood_exhibit_post-choice-2",
    "label": "這種木構造是用來做什麼的？",
    "branch": "photo_gu_batch02_wood_exhibit_post_ask",
    "topic": "gu_batch02_wood_exhibit_post_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_wood_exhibit_post-choice-3",
    "label": "你是不是每去一個展都會研究半天？",
    "branch": "photo_gu_batch02_wood_exhibit_post_tease",
    "topic": "gu_batch02_wood_exhibit_post_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_wood_exhibit_post-choice-4",
    "label": "你最喜歡哪個部分？",
    "branch": "photo_gu_batch02_wood_exhibit_post_question",
    "topic": "gu_batch02_wood_exhibit_post_question"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_mountain_hike_post",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_mountain_hike_post_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_mountain_hike_post-choice-1",
    "label": "你爬哪裡呀？",
    "branch": "photo_gu_batch02_mountain_hike_post_ask",
    "topic": "gu_batch02_mountain_hike_post_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_mountain_hike_post-choice-2",
    "label": "這張看起來心情很好。",
    "branch": "photo_gu_batch02_mountain_hike_post_praise",
    "topic": "gu_batch02_mountain_hike_post_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_mountain_hike_post-choice-3",
    "label": "那你明天腿應該會痠吧？",
    "branch": "photo_gu_batch02_mountain_hike_post_tease",
    "topic": "gu_batch02_mountain_hike_post_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_mountain_hike_post-choice-4",
    "label": "注意安全，早點下山。",
    "branch": "photo_gu_batch02_mountain_hike_post_care",
    "topic": "gu_batch02_mountain_hike_post_care"
   }
  ]
 },
 {
  "id": "photo_gu_batch02_coffee_camera_post",
  "characterId": "gu_shian",
  "kind": "photo",
  "photoIds": [
   "gu_shian_coffee_camera_post_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_gu_batch02_coffee_camera_post-choice-1",
    "label": "你這台是底片相機嗎？",
    "branch": "photo_gu_batch02_coffee_camera_post_ask",
    "topic": "gu_batch02_coffee_camera_post_ask"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_coffee_camera_post-choice-2",
    "label": "這塊蛋糕好像很好吃。",
    "branch": "photo_gu_batch02_coffee_camera_post_praise",
    "topic": "gu_batch02_coffee_camera_post_praise"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_coffee_camera_post-choice-3",
    "label": "相機被你冷落了。",
    "branch": "photo_gu_batch02_coffee_camera_post_tease",
    "topic": "gu_batch02_coffee_camera_post_tease"
   },
   {
    "target": "brick3-photo-photo_gu_batch02_coffee_camera_post-choice-4",
    "label": "假日就好好享受吧。",
    "branch": "photo_gu_batch02_coffee_camera_post_neutral",
    "topic": "gu_batch02_coffee_camera_post_neutral"
   }
  ]
 },
 {
  "id": "photo_off_duty",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_office_late_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_off_duty-choice-1",
    "label": "還沒忙完啊？",
    "branch": "contextual_response",
    "topic": "office_late"
   },
   {
    "target": "brick3-photo-photo_off_duty-choice-2",
    "label": "你看起來很專注。",
    "branch": "contextual_response",
    "topic": "office_late"
   },
   {
    "target": "brick3-photo-photo_off_duty-choice-3",
    "label": "最近都是這麼晚嗎？",
    "branch": "contextual_response",
    "topic": "office_late"
   },
   {
    "target": "brick3-photo-photo_off_duty-choice-4",
    "label": "那你先忙，我不打擾。",
    "branch": "contextual_response",
    "topic": "office_late"
   }
  ]
 },
 {
  "id": "photo_lu_office_evening",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_city_window_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_office_evening-choice-1",
    "label": "今晚也加班？",
    "branch": "contextual_response",
    "topic": "city_window"
   },
   {
    "target": "brick3-photo-photo_lu_office_evening-choice-2",
    "label": "這張背影拍得很好。",
    "branch": "contextual_response",
    "topic": "city_window"
   },
   {
    "target": "brick3-photo-photo_lu_office_evening-choice-3",
    "label": "你會常常這樣看夜景嗎？",
    "branch": "contextual_response",
    "topic": "city_window"
   },
   {
    "target": "brick3-photo-photo_lu_office_evening-choice-4",
    "label": "快回家休息吧。",
    "branch": "contextual_response",
    "topic": "city_window"
   }
  ]
 },
 {
  "id": "photo_lu_home_dinner",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_home_dinner_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_home_dinner-choice-1",
    "label": "這叫簡單做？你對簡單是不是有什麼誤解？",
    "branch": "contextual_response",
    "topic": "home_dinner"
   },
   {
    "target": "brick3-photo-photo_lu_home_dinner-choice-2",
    "label": "看起來很好吃，你平常都自己煮嗎？",
    "branch": "contextual_response",
    "topic": "home_dinner"
   },
   {
    "target": "brick3-photo-photo_lu_home_dinner-choice-3",
    "label": "忙到這麼晚還自己煮飯，不會很累？",
    "branch": "contextual_response",
    "topic": "home_dinner"
   },
   {
    "target": "brick3-photo-photo_lu_home_dinner-choice-4",
    "label": "辛苦了，早點休息吧。",
    "branch": "contextual_response",
    "topic": "home_dinner"
   }
  ]
 },
 {
  "id": "photo_lu_piano_evening",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_piano_evening_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_piano_evening-choice-1",
    "label": "原來你會彈鋼琴？",
    "branch": "contextual_response",
    "topic": "piano_evening"
   },
   {
    "target": "brick3-photo-photo_lu_piano_evening-choice-2",
    "label": "你彈琴的時候很安靜。",
    "branch": "contextual_response",
    "topic": "piano_evening"
   },
   {
    "target": "brick3-photo-photo_lu_piano_evening-choice-3",
    "label": "平常都彈什麼？",
    "branch": "contextual_response",
    "topic": "piano_evening"
   },
   {
    "target": "brick3-photo-photo_lu_piano_evening-choice-4",
    "label": "那你繼續練，我不吵你。",
    "branch": "contextual_response",
    "topic": "piano_evening"
   }
  ]
 },
 {
  "id": "photo_lu_gym_selfie",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_gym_selfie_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_gym_selfie-choice-1",
    "label": "難得看到你運動自拍。",
    "branch": "contextual_response",
    "topic": "gym_selfie"
   },
   {
    "target": "brick3-photo-photo_lu_gym_selfie-choice-2",
    "label": "你平常都練什麼？",
    "branch": "contextual_response",
    "topic": "gym_selfie"
   },
   {
    "target": "brick3-photo-photo_lu_gym_selfie-choice-3",
    "label": "工作後還有體力運動？",
    "branch": "contextual_response",
    "topic": "gym_selfie"
   },
   {
    "target": "brick3-photo-photo_lu_gym_selfie-choice-4",
    "label": "好好練，別分心回我。",
    "branch": "contextual_response",
    "topic": "gym_selfie"
   }
  ]
 },
 {
  "id": "photo_lu_friend_dinner",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_friend_dinner_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_friend_dinner-choice-1",
    "label": "難得你會跟朋友合照。",
    "branch": "contextual_response",
    "topic": "friend_dinner"
   },
   {
    "target": "brick3-photo-photo_lu_friend_dinner-choice-2",
    "label": "你朋友看起來很開心。",
    "branch": "contextual_response",
    "topic": "friend_dinner"
   },
   {
    "target": "brick3-photo-photo_lu_friend_dinner-choice-3",
    "label": "你們認識很久了嗎？",
    "branch": "contextual_response",
    "topic": "friend_dinner"
   },
   {
    "target": "brick3-photo-photo_lu_friend_dinner-choice-4",
    "label": "那你們好好聚。",
    "branch": "contextual_response",
    "topic": "friend_dinner"
   }
  ]
 },
 {
  "id": "photo_lu_sunset_walk",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_sunset_walk_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_sunset_walk-choice-1",
    "label": "這個時間的光很好看。",
    "branch": "contextual_response",
    "topic": "sunset_walk"
   },
   {
    "target": "brick3-photo-photo_lu_sunset_walk-choice-2",
    "label": "你也會隨手拍風景？",
    "branch": "contextual_response",
    "topic": "sunset_walk"
   },
   {
    "target": "brick3-photo-photo_lu_sunset_walk-choice-3",
    "label": "這是哪裡？",
    "branch": "contextual_response",
    "topic": "sunset_walk"
   },
   {
    "target": "brick3-photo-photo_lu_sunset_walk-choice-4",
    "label": "好好散步，晚點聊。",
    "branch": "contextual_response",
    "topic": "sunset_walk"
   }
  ]
 },
 {
  "id": "photo_lu_friends_cat",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_friends_cat_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_friends_cat-choice-1",
    "label": "牠好像很黏你。",
    "branch": "contextual_response",
    "topic": "friends_cat"
   },
   {
    "target": "brick3-photo-photo_lu_friends_cat-choice-2",
    "label": "你喜歡貓嗎？",
    "branch": "contextual_response",
    "topic": "friends_cat"
   },
   {
    "target": "brick3-photo-photo_lu_friends_cat-choice-3",
    "label": "牠叫什麼名字？",
    "branch": "contextual_response",
    "topic": "friends_cat"
   },
   {
    "target": "brick3-photo-photo_lu_friends_cat-choice-4",
    "label": "你陪牠玩吧。",
    "branch": "contextual_response",
    "topic": "friends_cat"
   }
  ]
 },
 {
  "id": "photo_lu_coffee_break",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_coffee_break_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_coffee_break-choice-1",
    "label": "難得看到你偷閒。",
    "branch": "contextual_response",
    "topic": "coffee_break"
   },
   {
    "target": "brick3-photo-photo_lu_coffee_break-choice-2",
    "label": "你喝的是什麼？",
    "branch": "contextual_response",
    "topic": "coffee_break"
   },
   {
    "target": "brick3-photo-photo_lu_coffee_break-choice-3",
    "label": "今天的會議結束了？",
    "branch": "contextual_response",
    "topic": "coffee_break"
   },
   {
    "target": "brick3-photo-photo_lu_coffee_break-choice-4",
    "label": "那你先好好休息。",
    "branch": "contextual_response",
    "topic": "coffee_break"
   }
  ]
 },
 {
  "id": "photo_lu_quiet_night",
  "characterId": "lu_chenchuan",
  "kind": "photo",
  "photoIds": [
   "lu_chenchuan_quiet_night_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_lu_quiet_night-choice-1",
    "label": "你看起來真的累了。",
    "branch": "contextual_response",
    "topic": "quiet_night"
   },
   {
    "target": "brick3-photo-photo_lu_quiet_night-choice-2",
    "label": "這張有點不像平常的你。",
    "branch": "contextual_response",
    "topic": "quiet_night"
   },
   {
    "target": "brick3-photo-photo_lu_quiet_night-choice-3",
    "label": "明天還要早起嗎？",
    "branch": "contextual_response",
    "topic": "quiet_night"
   },
   {
    "target": "brick3-photo-photo_lu_quiet_night-choice-4",
    "label": "那晚安，別回了。",
    "branch": "contextual_response",
    "topic": "quiet_night"
   }
  ]
 },
 {
  "id": "photo_qi_v6_parked_car",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_parked_car_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_parked_car-choice-1",
    "label": "車子保養好了？",
    "branch": "photo_qi_v6_parked_car_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_parked_car-choice-2",
    "label": "你還記得要停在線內啊。",
    "branch": "photo_qi_v6_parked_car_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_parked_car-choice-3",
    "label": "車停好才拿手機的吧？",
    "branch": "photo_qi_v6_parked_car_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_parked_car-choice-4",
    "label": "好，我先忙。",
    "branch": "photo_qi_v6_parked_car_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_basketball_rest",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_basketball_rest_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_basketball_rest-choice-1",
    "label": "今天打幾場？",
    "branch": "photo_qi_v6_basketball_rest_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_basketball_rest-choice-2",
    "label": "你也有打到喊累的一天？",
    "branch": "photo_qi_v6_basketball_rest_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_basketball_rest-choice-3",
    "label": "先喝水休息吧。",
    "branch": "photo_qi_v6_basketball_rest_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_basketball_rest-choice-4",
    "label": "那你休息。",
    "branch": "photo_qi_v6_basketball_rest_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_basketball_after",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_basketball_after_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_basketball_after-choice-1",
    "label": "所以最後有贏嗎？",
    "branch": "photo_qi_v6_basketball_after_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_basketball_after-choice-2",
    "label": "差點沒進還敢炫耀。",
    "branch": "photo_qi_v6_basketball_after_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_basketball_after-choice-3",
    "label": "你手沒受傷吧？",
    "branch": "photo_qi_v6_basketball_after_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_basketball_after-choice-4",
    "label": "知道了，我有事。",
    "branch": "photo_qi_v6_basketball_after_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_headphones_car",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_headphones_car_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_headphones_car-choice-1",
    "label": "在等誰？",
    "branch": "photo_qi_v6_headphones_car_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_headphones_car-choice-2",
    "label": "難得看到你這麼有耐心。",
    "branch": "photo_qi_v6_headphones_car_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_headphones_car-choice-3",
    "label": "是不是有點睏？",
    "branch": "photo_qi_v6_headphones_car_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_headphones_car-choice-4",
    "label": "那你先等吧。",
    "branch": "photo_qi_v6_headphones_car_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_parking_wait",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_parking_wait_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_parking_wait-choice-1",
    "label": "對方遲到了？",
    "branch": "photo_qi_v6_parking_wait_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_parking_wait-choice-2",
    "label": "少爺也會被放鴿子？",
    "branch": "photo_qi_v6_parking_wait_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_parking_wait-choice-3",
    "label": "別一直待車上悶著。",
    "branch": "photo_qi_v6_parking_wait_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_parking_wait-choice-4",
    "label": "嗯，那我先走了。",
    "branch": "photo_qi_v6_parking_wait_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_night_car",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_night_car_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_night_car-choice-1",
    "label": "今天在忙什麼？",
    "branch": "photo_qi_v6_night_car_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_night_car-choice-2",
    "label": "終於知道分身乏術了？",
    "branch": "photo_qi_v6_night_car_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_night_car-choice-3",
    "label": "事情處理完就早點回去。",
    "branch": "photo_qi_v6_night_car_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_night_car-choice-4",
    "label": "那不打擾你。",
    "branch": "photo_qi_v6_night_car_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_sofa_rest",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_sofa_rest_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_sofa_rest-choice-1",
    "label": "今天怎麼了？",
    "branch": "photo_qi_v6_sofa_rest_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_sofa_rest-choice-2",
    "label": "你也會乖乖躺著不頂嘴？",
    "branch": "photo_qi_v6_sofa_rest_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_sofa_rest-choice-3",
    "label": "先休息，不用急著解釋。",
    "branch": "photo_qi_v6_sofa_rest_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_sofa_rest-choice-4",
    "label": "那你休息吧。",
    "branch": "photo_qi_v6_sofa_rest_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_hoodie_street",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_hoodie_street_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_hoodie_street-choice-1",
    "label": "外面下雨了嗎？",
    "branch": "photo_qi_v6_hoodie_street_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_hoodie_street-choice-2",
    "label": "你這樣包得跟要去躲債一樣。",
    "branch": "photo_qi_v6_hoodie_street_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_hoodie_street-choice-3",
    "label": "別著涼了。",
    "branch": "photo_qi_v6_hoodie_street_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_hoodie_street-choice-4",
    "label": "嗯，我先忙。",
    "branch": "photo_qi_v6_hoodie_street_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_daytime_car",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_daytime_car_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_daytime_car-choice-1",
    "label": "剛去哪裡？",
    "branch": "photo_qi_v6_daytime_car_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_daytime_car-choice-2",
    "label": "又在巡你的停車線？",
    "branch": "photo_qi_v6_daytime_car_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_daytime_car-choice-3",
    "label": "累的話別勉強開車。",
    "branch": "photo_qi_v6_daytime_car_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_daytime_car-choice-4",
    "label": "知道了。",
    "branch": "photo_qi_v6_daytime_car_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "photo_qi_v6_late_night_car",
  "characterId": "qi_ye",
  "kind": "photo",
  "photoIds": [
   "qi_ye_late_night_car_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-photo_qi_v6_late_night_car-choice-1",
    "label": "事情都處理完了？",
    "branch": "photo_qi_v6_late_night_car_normal_inquiry",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_late_night_car-choice-2",
    "label": "這種時間才下班，真不像少爺。",
    "branch": "photo_qi_v6_late_night_car_tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_late_night_car-choice-3",
    "label": "很晚了，先回去休息。",
    "branch": "photo_qi_v6_late_night_car_care",
    "topic": ""
   },
   {
    "target": "brick3-photo-photo_qi_v6_late_night_car-choice-4",
    "label": "那先這樣。",
    "branch": "photo_qi_v6_late_night_car_distance",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_01",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_01"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_01-choice-1",
    "label": "你今天很累？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_01-choice-2",
    "label": "這張看起來很乖。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_01-choice-3",
    "label": "怎麼突然傳自拍？",
    "branch": "probe",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_01-choice-4",
    "label": "先好好休息。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_02",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_02"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_02-choice-1",
    "label": "昨晚又熬夜了？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_02-choice-2",
    "label": "頭髮完全沒整理。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_02-choice-3",
    "label": "這張還挺好看。",
    "branch": "compliment",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_02-choice-4",
    "label": "快去吃早餐。",
    "branch": "casual",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_03",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_03"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_03-choice-1",
    "label": "是什麼研究？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_03-choice-2",
    "label": "你看起來快崩潰了。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_03-choice-3",
    "label": "要不要先休息？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_03-choice-4",
    "label": "我也不太懂這些。",
    "branch": "neutral",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_04",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_04"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_04-choice-1",
    "label": "加油，會順利的。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_04-choice-2",
    "label": "你今天穿得很好看。",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_04-choice-3",
    "label": "怎麼看起來很緊張？",
    "branch": "open",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_04-choice-4",
    "label": "你先去忙吧。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_05",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_05"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_05-choice-1",
    "label": "結果怎麼樣？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_05-choice-2",
    "label": "杯子比人搶鏡。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_05-choice-3",
    "label": "辛苦了。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_05-choice-4",
    "label": "我先忙我的。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_06",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_06"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_06-choice-1",
    "label": "練得怎麼樣？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_06-choice-2",
    "label": "你有在挑角度吧？",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_06-choice-3",
    "label": "記得補水。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_06-choice-4",
    "label": "別再傳這種身形照。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_07",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_07"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_07-choice-1",
    "label": "你故意拍這樣？",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_07-choice-2",
    "label": "先把頭髮吹乾。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_07-choice-3",
    "label": "這種照片不是太私密嗎？",
    "branch": "boundary",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_07-choice-4",
    "label": "我不想再收到這類照片。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_08",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_08"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_08-choice-1",
    "label": "你故意讓我看這個？",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_08-choice-2",
    "label": "真的有不舒服嗎？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_08-choice-3",
    "label": "你又在試探我？",
    "branch": "probe",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_08-choice-4",
    "label": "不要再傳裸上身的照片。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_09",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_09"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_09-choice-1",
    "label": "你在做什麼菜？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_09-choice-2",
    "label": "那你幹嘛不穿衣服？",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_09-choice-3",
    "label": "小心燙到。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_09-choice-4",
    "label": "我不太想收到這個角度。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_10",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_10"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_10-choice-1",
    "label": "你還在外面？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_10-choice-2",
    "label": "你嘴裡那個是什麼？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_10-choice-3",
    "label": "這張有點像電影。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_10-choice-4",
    "label": "路上小心。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_11",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_11"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_11-choice-1",
    "label": "你還不起來？",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_11-choice-2",
    "label": "昨天睡不好？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_11-choice-3",
    "label": "這張很像你。",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_11-choice-4",
    "label": "再睡一下也沒關係。",
    "branch": "casual",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_12",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_12"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_12-choice-1",
    "label": "你在看什麼書？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_12-choice-2",
    "label": "你每次都能看那麼久？",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_12-choice-3",
    "label": "不要太累。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_12-choice-4",
    "label": "我先工作了。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_13",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_13"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_13-choice-1",
    "label": "今天做什麼？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_13-choice-2",
    "label": "這張角度挑得很好。",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_13-choice-3",
    "label": "有拉筋嗎？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_13-choice-4",
    "label": "我不想看這種自拍。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_14",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_14"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_14-choice-1",
    "label": "你又在煮飯？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_14-choice-2",
    "label": "看起來好像不錯。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_14-choice-3",
    "label": "你可以拍成料理教學了。",
    "branch": "humor",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_14-choice-4",
    "label": "記得吃飽。",
    "branch": "care",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_15",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_15"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_15-choice-1",
    "label": "在想什麼？",
    "branch": "probe",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_15-choice-2",
    "label": "夜景挺好看的。",
    "branch": "casual",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_15-choice-3",
    "label": "這是在暗示什麼？",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_15-choice-4",
    "label": "今天不想聊過去。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_16",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_16"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_16-choice-1",
    "label": "你是不是故意的？",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_16-choice-2",
    "label": "快去穿衣服。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_16-choice-3",
    "label": "照片有點太私密。",
    "branch": "boundary",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_16-choice-4",
    "label": "別再傳這樣的照片。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_17",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_17"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_17-choice-1",
    "label": "那就不要想工作了。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_17-choice-2",
    "label": "你這張像被棉被吃掉。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_17-choice-3",
    "label": "晚安。",
    "branch": "pause",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_17-choice-4",
    "label": "你最近壓力很大？",
    "branch": "open",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_18",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_18"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_18-choice-1",
    "label": "這是你家的貓？",
    "branch": "fact",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_18-choice-2",
    "label": "牠好可愛。",
    "branch": "warm",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_18-choice-3",
    "label": "你居然會拍貓。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_18-choice-4",
    "label": "先讓牠睡吧。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_19",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_19"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_19-choice-1",
    "label": "你還要忙多久？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_19-choice-2",
    "label": "筆記好密。",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_19-choice-3",
    "label": "你又沒好好吃飯？",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_19-choice-4",
    "label": "那你先忙。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_20",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_20"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_20-choice-1",
    "label": "去哪裡？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_20-choice-2",
    "label": "你穿黑色真的很適合。",
    "branch": "memory",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_20-choice-3",
    "label": "你看起來很有精神。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_20-choice-4",
    "label": "路上小心。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_21",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_21"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_21-choice-1",
    "label": "你在想什麼？",
    "branch": "probe",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_21-choice-2",
    "label": "看起來很想撒嬌。",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_21-choice-3",
    "label": "早點睡吧。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_21-choice-4",
    "label": "我今天不想聊天。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_22",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_22"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_22-choice-1",
    "label": "找到想要的了嗎？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_22-choice-2",
    "label": "你好像很喜歡圖書館。",
    "branch": "neutral",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_22-choice-3",
    "label": "別一直坐著。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_22-choice-4",
    "label": "你先讀。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_23",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_23"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_23-choice-1",
    "label": "你受傷了嗎？",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_23-choice-2",
    "label": "怎麼又拍這種？",
    "branch": "probe",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_23-choice-3",
    "label": "這張挺好看的。",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_23-choice-4",
    "label": "以後只傳普通照片。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_24",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_24"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_24-choice-1",
    "label": "這個角度是誰拍的？",
    "branch": "provenance",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_24-choice-2",
    "label": "你到底在煮什麼？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_24-choice-3",
    "label": "記得穿件衣服。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_24-choice-4",
    "label": "我不想看這種背影照。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_25",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_25"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_25-choice-1",
    "label": "那就睡一下。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_25-choice-2",
    "label": "你今天也太懶了。",
    "branch": "tease",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_25-choice-3",
    "label": "這張拍得好近。",
    "branch": "casual",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_25-choice-4",
    "label": "我先去忙。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_26",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_26"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_26-choice-1",
    "label": "今天練得不錯？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_26-choice-2",
    "label": "你很會拍這種角度。",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_26-choice-3",
    "label": "手臂看起來很酸。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_26-choice-4",
    "label": "別傳這種身形照了。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_27",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_27"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_27-choice-1",
    "label": "哪一首？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_27-choice-2",
    "label": "你又在想以前的事？",
    "branch": "memory",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_27-choice-3",
    "label": "看起來心情不錯。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_27-choice-4",
    "label": "我先忙。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_28",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_28"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_28-choice-1",
    "label": "你真的很故意。",
    "branch": "flirt",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_28-choice-2",
    "label": "你不用特地這樣。",
    "branch": "reflect",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_28-choice-3",
    "label": "先去把衣服穿好。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_28-choice-4",
    "label": "我不想再看這種照片。",
    "branch": "boundary",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_29",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_29"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_29-choice-1",
    "label": "恭喜，辛苦了。",
    "branch": "care",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_29-choice-2",
    "label": "終於可以休息了？",
    "branch": "curious",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_29-choice-3",
    "label": "你說的是報告還是別的？",
    "branch": "probe",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_29-choice-4",
    "label": "晚點再聊。",
    "branch": "pause",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_zhiyu_v6_30",
  "characterId": "pei_zhiyu",
  "kind": "photo",
  "photoIds": [
   "pei_zhiyu_v6_30"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_zhiyu_v6_30-choice-1",
    "label": "你現在想說什麼？",
    "branch": "reconcile",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_30-choice-2",
    "label": "你是不是又在試探？",
    "branch": "probe",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_30-choice-3",
    "label": "我現在不想談復合。",
    "branch": "boundary",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_zhiyu_v6_30-choice-4",
    "label": "先平常聊天就好。",
    "branch": "neutral",
    "topic": ""
   }
  ]
 },
 {
  "id": "shen_night_view_outing",
  "characterId": "shen_yanzhou",
  "kind": "invitation",
  "photoIds": [
   "shen_yanzhou_night_view_event_01.webp",
   "shen_yanzhou_night_view_followup_01.webp"
  ],
  "choices": [
   {
    "target": "brick3-photo-shen_night_view_outing-choice-1",
    "label": "好啊，我想去看看。",
    "branch": "accept",
    "topic": ""
   },
   {
    "target": "brick3-photo-shen_night_view_outing-choice-2",
    "label": "今天先不要，我最近比較忙。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-shen_night_view_outing-choice-3",
    "label": "是什麼地方？我還想想。",
    "branch": "details",
    "topic": ""
   },
   {
    "target": "brick3-photo-shen_night_view_outing-choice-4",
    "label": "這次先不去了，下次再說。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-shen_night_view_outing_arrival-choice-1",
    "label": "我到了，一起上去吧。",
    "branch": "attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-shen_night_view_outing_arrival-choice-2",
    "label": "我還在路上，今天來不及了。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-shen_night_view_outing_arrival-choice-3",
    "label": "我改變主意了，今天先不去了。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-shen_night_view_outing_arrival-choice-4",
    "label": "臨時有事，我要先回家。",
    "branch": "not_attend",
    "topic": ""
   }
  ]
 },
 {
  "id": "pei_dinner_outing",
  "characterId": "pei_zhiyu",
  "kind": "invitation",
  "photoIds": [
   "pei_zhiyu_dinner_visit_table_01.webp",
   "pei_zhiyu_dinner_chat_01.webp"
  ],
  "choices": [
   {
    "target": "brick3-photo-pei_dinner_outing-choice-1",
    "label": "好，我想過去吃晚餐。",
    "branch": "accept",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_dinner_outing-choice-2",
    "label": "先不了，我還需要一點時間。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_dinner_outing-choice-3",
    "label": "你怎麼突然想約我？",
    "branch": "details",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_dinner_outing-choice-4",
    "label": "今天沒空，改天再說。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_dinner_outing_arrival-choice-1",
    "label": "我到了，現在進去。",
    "branch": "attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_dinner_outing_arrival-choice-2",
    "label": "我還在路上，今天趕不上了。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_dinner_outing_arrival-choice-3",
    "label": "臨時有事，我今天不去了。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-pei_dinner_outing_arrival-choice-4",
    "label": "想了想，我還是先不要去了。",
    "branch": "not_attend",
    "topic": ""
   }
  ]
 },
 {
  "id": "qi_city_lights_outing",
  "characterId": "qi_ye",
  "kind": "invitation",
  "photoIds": [
   "qi_ye_city_lights_event_01.webp",
   "qi_ye_city_lights_followup_01.webp"
  ],
  "choices": [
   {
    "target": "brick3-photo-qi_city_lights_outing-choice-1",
    "label": "可以，一起去看看。",
    "branch": "accept",
    "topic": ""
   },
   {
    "target": "brick3-photo-qi_city_lights_outing-choice-2",
    "label": "這次不想出去。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-qi_city_lights_outing-choice-3",
    "label": "在哪裡？先說清楚。",
    "branch": "details",
    "topic": ""
   },
   {
    "target": "brick3-photo-qi_city_lights_outing-choice-4",
    "label": "今天有事，下次再問我吧。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-qi_city_lights_outing_arrival-choice-1",
    "label": "我到了，走吧。",
    "branch": "attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-qi_city_lights_outing_arrival-choice-2",
    "label": "我今天可能趕不上。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-qi_city_lights_outing_arrival-choice-3",
    "label": "臨時不想去了。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-qi_city_lights_outing_arrival-choice-4",
    "label": "有事要回家，先不去了。",
    "branch": "not_attend",
    "topic": ""
   }
  ]
 },
 {
  "id": "gu_architecture_walk",
  "characterId": "gu_shian",
  "kind": "invitation",
  "photoIds": [
   "gu_shian_architecture_walk_event_01.webp",
   "gu_shian_architecture_walk_followup_01.webp"
  ],
  "choices": [
   {
    "target": "brick3-photo-gu_architecture_walk-choice-1",
    "label": "有興趣，我跟你一起去。",
    "branch": "accept",
    "topic": ""
   },
   {
    "target": "brick3-photo-gu_architecture_walk-choice-2",
    "label": "這週不方便，下次吧。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-gu_architecture_walk-choice-3",
    "label": "導覽會看什麼？",
    "branch": "details",
    "topic": ""
   },
   {
    "target": "brick3-photo-gu_architecture_walk-choice-4",
    "label": "這次先不參加。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-gu_architecture_walk_arrival-choice-1",
    "label": "我到了，一起進去吧。",
    "branch": "attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-gu_architecture_walk_arrival-choice-2",
    "label": "我來不及到集合點。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-gu_architecture_walk_arrival-choice-3",
    "label": "我臨時有事不能去了。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-gu_architecture_walk_arrival-choice-4",
    "label": "今天想自己休息，改天。",
    "branch": "not_attend",
    "topic": ""
   }
  ]
 },
 {
  "id": "lu_piano_recital",
  "characterId": "lu_chenchuan",
  "kind": "invitation",
  "photoIds": [
   "lu_chenchuan_piano_recital_event_01.webp",
   "lu_chenchuan_piano_recital_followup_01.webp"
  ],
  "choices": [
   {
    "target": "brick3-photo-lu_piano_recital-choice-1",
    "label": "可以，一起去看。",
    "branch": "accept",
    "topic": ""
   },
   {
    "target": "brick3-photo-lu_piano_recital-choice-2",
    "label": "這次先不了。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-lu_piano_recital-choice-3",
    "label": "展覽主題是什麼？",
    "branch": "details",
    "topic": ""
   },
   {
    "target": "brick3-photo-lu_piano_recital-choice-4",
    "label": "我近期很忙，等之後吧。",
    "branch": "decline",
    "topic": ""
   },
   {
    "target": "brick3-photo-lu_piano_recital_arrival-choice-1",
    "label": "我到入口了，走吧。",
    "branch": "attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-lu_piano_recital_arrival-choice-2",
    "label": "我今天趕不上。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-lu_piano_recital_arrival-choice-3",
    "label": "臨時沒辦法過去。",
    "branch": "not_attend",
    "topic": ""
   },
   {
    "target": "brick3-photo-lu_piano_recital_arrival-choice-4",
    "label": "今天改變心意，不去了。",
    "branch": "not_attend",
    "topic": ""
   }
  ]
 }
];
export const brick3ChoiceMap = new Map(brick3AuthoredEvents.flatMap(e => e.choices.map(choice => [choice.target,{event:e,choice}] as const)));
export const brick3PhotoMap = new Map(brick3AuthoredEvents.map(e => [e.id,e] as const));
