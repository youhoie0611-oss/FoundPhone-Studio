/**
 * 《磚3》裴知聿的隱藏好感度及情境式手機照片決策。
 * 純函式：供故事事件引擎呼叫；不依賴真人參考照片、外部 API 或玩家照片。
 * 本模組負責生成照片描述與排程候選，不會假裝已產生圖片像素。
 */
export const PEI_ZHIYU_ID = "peizhiyu";
export const PEI_INITIAL_AFFECTION = 70;
export type PeiPhotoLevel = 0 | 1 | 2 | 3;
export type PeiMood = "ordinary" | "longing" | "jealous" | "tired" | "upset" | "relaxed";
export type PeiLocation = "home" | "bathroom" | "gym" | "campus" | "kitchen" | "outside";
export type PeiCapture = "front-selfie" | "mirror-selfie" | "timer" | "friend" | "rear-camera";

export interface PeiState {
  affection: number;
  trust: number;
  jealousy: number;
  relationship: "ex" | "reconnecting" | "dating" | "distant";
  photoBoundary: "allowed" | "no-flirting";
  lastPhotoIds: string[];
}
export interface PeiPhotoContext {
  eventId: string;
  timestamp: string;
  location: PeiLocation;
  mood: PeiMood;
  activity: "studying" | "commuting" | "cooking" | "showering" | "exercising" | "resting" | "out-with-friends";
  isAlone: boolean;
  hasPresentPhotographer: boolean;
  outfitId: string;
  visualMemoryId: string;
  seed: number;
}
export interface PeiPhotoPlan {
  photoId: string;
  characterId: typeof PEI_ZHIYU_ID;
  eventId: string;
  capturedAt: string;
  level: PeiPhotoLevel;
  captureMethod: PeiCapture;
  outfitId: string;
  visualMemoryId: string;
  mood: PeiMood;
  prompt: string;
  intendedAudience: "private-chat";
  status: "planned";
}
export type PeiReaction = "compliment" | "friendly" | "tease" | "neutral" | "cold" | "reject-flirting" | "reject-contact";

export function initialPeiState(): PeiState {
  return { affection: PEI_INITIAL_AFFECTION, trust: 30, jealousy: 0, relationship: "ex", photoBoundary: "allowed", lastPhotoIds: [] };
}
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export function applyPeiReaction(state: PeiState, reaction: PeiReaction): PeiState {
  const changes: Record<PeiReaction, [number, number, number]> = {
    compliment: [2, 1, -1], friendly: [1, 2, -1], tease: [1, 0, 0],
    neutral: [0, 0, 0], cold: [-2, -1, 2],
    "reject-flirting": [-2, -1, 0], "reject-contact": [-5, -3, 0],
  };
  const [a, t, j] = changes[reaction];
  return {
    ...state, affection: clamp(state.affection + a), trust: clamp(state.trust + t),
    jealousy: clamp(state.jealousy + j),
    photoBoundary: reaction === "reject-flirting" || reaction === "reject-contact" ? "no-flirting" : state.photoBoundary,
    relationship: reaction === "reject-contact" ? "distant" : state.relationship,
  };
}
function random(seed: number): number {
  const n = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return n - Math.floor(n);
}
const CAMERA_STYLE = "真實手機隨手拍、自然曝光與暗部數位雜訊、允許輕微手震和不完美裁切；非棚拍、非商業寫真、非過度修圖。";
const IDENTITY = "人物必須嚴格沿用裴知聿既有視覺記憶庫（臉、髮型、膚色、體態、肩背手臂比例、既有特徵）；不得模仿真人參考照片的臉、不得新增刺青疤痕。";
const STYLE: Record<string, string> = {
  showering: "浴室鏡子裡的洗澡後隨手自拍；頭髮微濕，毛巾自然遮住部分頭部，肩臂線條，普通浴室背景。",
  exercising: "運動後的手機鏡拍，運動服或上半身側背角度，肩背手臂線條自然，不誇張增肌。",
  cooking: "昏暖廚房、鍋具與普通雜物；做飯中的自然背影或圍裙肩臂特寫，拍攝角度符合實際機位。",
  resting: "在家沙發或鏡前的慵懶自拍，普通居家光線，可能局部遮臉，非擺拍。",
  studying: "研究室桌面、筆記、文獻、普通自拍，真實研究生生活。",
  commuting: "通勤途中的街景或普通自拍，符合交通與時間。",
  "out-with-friends": "真實外出活動或朋友合照，同行者必須已在劇情中出現。",
};
export function planPeiPhoto(state: PeiState, ctx: PeiPhotoContext): PeiPhotoPlan | null {
  if (!ctx.eventId || !ctx.timestamp || !ctx.visualMemoryId || !ctx.outfitId) return null;
  const activityLocations: Record<PeiPhotoContext["activity"], PeiLocation[]> = {
    studying: ["campus", "home"], commuting: ["outside"], cooking: ["kitchen"],
    showering: ["bathroom"], exercising: ["gym", "home"], resting: ["home"],
    "out-with-friends": ["outside"],
  };
  if (!activityLocations[ctx.activity].includes(ctx.location)) return null;
  const id = `brick3-pei-photo-${ctx.eventId}`;
  if (state.lastPhotoIds.includes(id)) return null;
  // 沒有事件動機時允許完全不拍照；每次事件以固定 seed 決定，重進聊天室不重抽。
  if (random(ctx.seed) < 0.35) return null;
  const wantsFlirt = state.photoBoundary === "allowed" && state.relationship !== "distant" &&
    ["showering", "exercising", "cooking", "resting"].includes(ctx.activity) &&
    (ctx.mood === "longing" || ctx.mood === "jealous" || random(ctx.seed + 1) > 0.75);
  const level: PeiPhotoLevel = wantsFlirt ? (random(ctx.seed + 2) > 0.45 ? 3 : 2) :
    ctx.activity === "showering" || ctx.activity === "exercising" ? 1 : 0;
  let captureMethod: PeiCapture = ctx.activity === "showering" || ctx.activity === "exercising"
    ? "mirror-selfie" : "front-selfie";
  if (ctx.activity === "cooking") {
    // 背後機位只能是定時自拍或真實在場的人；不得憑空出現攝影師。
    captureMethod = ctx.hasPresentPhotographer && !ctx.isAlone ? "friend" : "timer";
  }
  if (ctx.activity === "out-with-friends") {
    if (ctx.isAlone) return null;
    captureMethod = ctx.hasPresentPhotographer ? "friend" : "front-selfie";
  }
  const prompt = [
    IDENTITY, CAMERA_STYLE, STYLE[ctx.activity],
    level >= 2 ? "有私人曖昧感，像刻意挑了好看角度卻裝作隨手傳；可自然呈現上半身背面或側面，但不露骨。" :
      "普通真實生活紀錄，不刻意誘惑。",
    `場景：${ctx.location}；活動：${ctx.activity}；拍攝方式：${captureMethod}；服裝連續性ID：${ctx.outfitId}。`,
    "禁止露骨性行為、私密部位特寫、玩家入鏡、虛構同行者、專業棚拍、鏡面反射錯誤。",
  ].join(" ");
  return {
    photoId: id, characterId: PEI_ZHIYU_ID, eventId: ctx.eventId,
    capturedAt: ctx.timestamp, level, captureMethod,
    outfitId: ctx.outfitId, visualMemoryId: ctx.visualMemoryId,
    mood: ctx.mood, prompt, intendedAudience: "private-chat", status: "planned",
  };
}
export function recordPeiPhoto(state: PeiState, plan: PeiPhotoPlan): PeiState {
  return { ...state, lastPhotoIds: [...state.lastPhotoIds, plan.photoId].slice(-200) };
}
