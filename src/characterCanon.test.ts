import { describe, expect, it } from "vitest";
import { CHARACTER_CANON, PLAYER_CANON, canonViolations, enforceCanon } from "./characterCanon";

describe("character canon", () => {
  it("preserves immutable character histories", () => {
    expect(CHARACTER_CANON["沈硯舟"].age).toBe(24);
    expect(CHARACTER_CANON["裴知聿"].connection).toContain("前男友");
    expect(CHARACTER_CANON["祁野"].initialAffection).toBe(0);
    expect(CHARACTER_CANON["陸沉川"].identity).toContain("集團副總裁");
    expect(CHARACTER_CANON["陸沉川"].connection).toContain("隔壁大樓");
    expect(CHARACTER_CANON["陸沉川"].initialAffection).toBe(0);
    expect(PLAYER_CANON.identity).toContain("上班族");
  });
  it("flags history contradictions", () => {
    expect(canonViolations("裴知聿", "我們從來沒有交往過")).toContain("character-history");
    expect(canonViolations("陸沉川", "我在男模會館上班")).toContain("character-history");
    expect(canonViolations("陸沉川", "我現在做商業模特兒")).toContain("character-history");
    expect(canonViolations("陸沉川", "我不是男公關，我在集團擔任副總裁")).toEqual([]);
  });
  it("rejects forced player feelings", () => {
    expect(canonViolations("祁野", "妳已經愛上我")).toContain("player-agency");
    expect(enforceCanon("祁野", "妳已經愛上我")).not.toContain("愛上我");
  });
});
