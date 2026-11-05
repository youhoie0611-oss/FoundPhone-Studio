import { describe, expect, it } from "vitest";
import { CHARACTER_CANON, PLAYER_CANON, canonViolations, enforceCanon } from "./characterCanon";

describe("character canon", () => {
  it("preserves immutable character histories", () => {
    expect(CHARACTER_CANON["沈硯舟"].age).toBe(24);
    expect(CHARACTER_CANON["裴知聿"].connection).toContain("前男友");
    expect(CHARACTER_CANON["裴知聿"].temperament).toContain("陰濕重力系");
    expect(CHARACTER_CANON["裴知聿"].temperament).not.toMatch(/狐狸|狡黠|調侃/);
    expect(CHARACTER_CANON["祁野"].initialAffection).toBe(0);
    expect(CHARACTER_CANON["顧時安"].identity).toBe("建築設計師");
    expect(PLAYER_CANON.identity).toContain("上班族");
  });
  it("flags history contradictions", () => {
    expect(canonViolations("裴知聿", "我們從來沒有交往過")).toContain("character-history");
  });
  it("keeps Pei emotionally recognizable when a reply violates boundaries", () => {
    const reply = enforceCanon("裴知聿", "不准妳跟其他男人見面");
    expect(reply).toMatch(/放不下|太急/);
    expect(reply).not.toMatch(/不准|禁止/);
  });
  it("rejects forced player feelings", () => {
    expect(canonViolations("祁野", "妳已經愛上我")).toContain("player-agency");
    expect(enforceCanon("祁野", "妳已經愛上我")).not.toContain("愛上我");
  });
});
