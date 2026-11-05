// 《磚3》角色視覺記憶一致性檢查（不修改其他版本）
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative, sep } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const registry = JSON.parse(await readFile(resolve(projectRoot, "磚3/visual-memory/registry.json"), "utf8"));
const targetName = process.argv[2] || "裴知聿";
const entry = registry.characters?.[targetName];
if (!entry) throw new Error("《磚3》未登錄此角色：" + targetName);
if (!entry.visualMemoryFile) throw new Error(targetName + " 尚未核准外貌，不得只用名字生成。");

const manifest = JSON.parse(await readFile(resolve(projectRoot, entry.visualMemoryFile), "utf8"));
if (manifest.characterName !== targetName) throw new Error("角色名稱與記憶索引不一致。");
const ref = manifest.reference;
if (!ref || !ref.sourceImageSha256 || !ref.expectedRepositoryPath) throw new Error("尚無完整人物原圖參考資訊。");

const imagePath = resolve(projectRoot, ref.expectedRepositoryPath);
if (!imagePath.startsWith(projectRoot + sep)) throw new Error("禁止讀取專案之外的參考圖。");
let bytes;
try { bytes = await readFile(imagePath); }
catch { throw new Error("參考圖尚未存在 GitHub/工作目錄："+ref.expectedRepositoryPath+"；請上傳已核准原始照片，不可退回使用舊版人物圖。"); }

const imageSha256 = createHash("sha256").update(bytes).digest("hex");
if (imageSha256 !== ref.sourceImageSha256) throw new Error("人物參考圖 SHA256 不符；不得默默替換。");
if (entry.sourceVisualSha256 !== imageSha256) throw new Error("註冊索引與人物檔雜湊不同。");
if (!["approved_latest_visual","available_on_github"].includes(manifest.identityStatus)) throw new Error("人物尚未核准外觀。");

console.log("通過：" + targetName + " 視覺參考 " + relative(projectRoot, imagePath));
console.log("生成時仍須實際把該圖片像素提供給圖片生成模型；通過此腳本不等於已完成視覺一致性比對。");
