import { describe, expect, it } from "vitest";
import { safeMedia } from "../schema";
import { brick3AvatarFor, brick3AvatarPaths } from "./avatars";

const expected = [
  "沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川",
  "林安", "周予晴", "陳以衡", "許棠", "江敘白", "下班後五人組",
];
describe("《磚3》全部人物與群組頭像", () => {
  it("maps all 11 character and group names to bundled JPEGs", () => {
    expect(Object.keys(brick3AvatarPaths).sort()).toEqual([...expected].sort());
    for (const name of expected) {
      const path = brick3AvatarFor(name);
      expect(path).toMatch(/^\.\/characters\/[a-z0-9-]+-avatar\.jpg$/);
      expect(safeMedia(path)).toBe(path);
    }
  });
  it("uses the canonical photo even when a story has an outdated path", () => {
    expect(brick3AvatarFor("裴知聿", "./characters/old-avatar.png")).toBe(
      "./characters/pei-zhiyu-avatar.jpg",
    );
  });
  it("does not override unrelated people or user-selected images", () => {
    expect(brick3AvatarFor("其他聯絡人", "data:image/png;base64,AAAA")).toBe(
      "data:image/png;base64,AAAA",
    );
  });
});
