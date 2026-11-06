/** 《磚3》五位男主角的統一頭像路徑。
 * 靜態資產需放在 public/characters/；圖片包單獨提供，不能把缺失的圖片當作已上傳。
 * 使用 ./ 相對路徑以相容 GitHub Pages 專案子路徑。
 */
const BRICK3_AVATARS: Record<string, string> = {
  "沈硯舟": "./characters/shen-yanzhou-avatar.jpg",
  "裴知聿": "./characters/pei-zhiyu-avatar.jpg",
  "祁野": "./characters/qi-ye-avatar.jpg",
  "顧時安": "./characters/gu-shian-avatar.jpg",
  "陸沉川": "./characters/lu-chenchuan-avatar.jpg",
};
export function brick3AvatarFor(name: string, current = ""): string {
  return BRICK3_AVATARS[name.trim()] ?? current;
}
export const brick3AvatarPaths = BRICK3_AVATARS;
