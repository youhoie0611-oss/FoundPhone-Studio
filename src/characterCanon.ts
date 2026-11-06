/** Immutable narrative canon shared by the offline dialogue engine and story checks.
 * Relationship progress is mutable; historical identity is not.
 */
export const CHARACTER_CANON = {
  "沈硯舟": { age: 24, identity: "大學生", connection: "活動認識", initialAffection: 10, temperament: "溫暖細心、真誠、有原則" },
  "裴知聿": { age: 25, identity: "心理學研究所碩士生", connection: "女主角主動提出分手的前男友", initialAffection: 0, temperament: "陰濕重力系、依戀沉重、敏感多疑、強烈佔有慾；希望復合但尊重拒絕" },
  "祁野": { age: 23, identity: "祁家次子、富家子弟", connection: "因緣際會認識", initialAffection: 0, temperament: "張揚直球、好勝、尊重界線" },
  "顧時安": { age: 26, identity: "建築設計師", connection: "工作專案認識", initialAffection: 0, temperament: "溫暖沉穩、專業有原則" },
  "陸沉川": { age: 26, identity: "江南陸家繼承人、家族集團副總裁", connection: "玩家公司隔壁大樓工作；由日常偶遇或合理商務交流慢慢認識，初見不主動揭露繼承人身分", initialAffection: 0, temperament: "黑貓65%＋狐狸35%，冷靜慢熱、自律有教養、擅長料理與鋼琴，重視私人界線" },
  "林安": { identity: "女主角的朋友", connection: "朋友圈", temperament: "有自己的生活與工作" },
  "周予晴": { identity: "女主角的朋友", connection: "五人朋友圈", temperament: "有自己的生活與感情" },
  "陳以衡": { identity: "女主角的朋友", connection: "五人朋友圈", temperament: "有自己的生活與感情" },
  "許棠": { identity: "女主角的朋友", connection: "五人朋友圈", temperament: "有自己的生活與感情" },
} as const;

export const PLAYER_CANON = Object.freeze({
  identity: "上班族女性",
  agency: "由玩家自行決定感情、回覆與行動",
  friendship: "有獨立朋友圈與日常生活",
});

const contradictoryClaims: Record<string, RegExp[]> = {
  "沈硯舟": [/我(?:已經|現在)?(?:是|當了)(?:妳的)?(?:前男友|同事|高中生)/, /我(?:從來)?沒(?:有)?上(?:過)?大學/],
  "裴知聿": [/我們(?:從來)?沒(?:有)?交往過/, /我(?:不是|從來不是)妳(?:的)?前男友/, /我(?:是|還是)妳(?:的)?同事/],
  "祁野": [/我(?:是|還在讀)大三/, /我(?:是|還在讀)高中/, /我(?:是|當了)妳(?:的)?前男友/],
  "陸沉川": [/我(?:是|還在讀)高中/, /我(?:現在)?(?:是|在|做|從事|接)[^。！\n]{0,16}(?:男公關|男模|會館|模特兒)/],
};
const agencyViolations = /(?:妳|你)(?:已經|一定|必須)(?:愛上|喜歡上|答應跟|原諒|選擇了)(?:我|他|我們)/;
const boundaryViolations = /(?:不准|禁止)(?:妳|你)(?:跟|和)(?:別人|其他男人)(?:見面|說話|聯絡)/;

export function canonViolations(character: string, reply: string): string[] {
  const errors: string[] = [];
  if ((contradictoryClaims[character] ?? []).some((pattern) => pattern.test(reply))) errors.push("character-history");
  if (agencyViolations.test(reply)) errors.push("player-agency");
  if (boundaryViolations.test(reply)) errors.push("relationship-boundary");
  return errors;
}

export function enforceCanon(character: string, reply: string): string {
  if (!canonViolations(character, reply).length) return reply;
  if (character === "裴知聿") return "我不想替妳決定什麼。妳願意聊，我就好好聽。";
  if (character === "祁野") return "我有我的想法，但妳要怎麼選，是妳的自由。";
  if (character === "沈硯舟") return "我想先聽妳怎麼想，不會替妳做決定。";
  if (character === "陸沉川") return "妳自己決定。想聊的時候再說。";
  if (character === "顧時安") return "我尊重妳的想法，也希望我們能說清楚。";
  return "妳可以照自己的想法來，我尊重妳。";
}
