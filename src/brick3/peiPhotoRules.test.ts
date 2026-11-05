import { describe, expect, it } from "vitest";
import { applyPeiReaction, initialPeiState, planPeiPhoto, recordPeiPhoto, type PeiPhotoContext } from "./peiPhotoRules";

const base: PeiPhotoContext = {
  eventId: "evening-1", timestamp: "2026-11-05T21:00:00+08:00",
  location: "bathroom", mood: "longing", activity: "showering",
  isAlone: true, hasPresentPhotographer: false, outfitId: "home-1",
  visualMemoryId: "pei-existing-visual-memory", seed: 3,
};
describe("《磚3》裴知聿好感度與照片規則", () => {
  it("starts with hidden affection 70, still an ex", () => {
    expect(initialPeiState()).toMatchObject({ affection: 70, relationship: "ex" });
  });
  it("changes affection without automatically reconciling", () => {
    const s = applyPeiReaction(initialPeiState(), "compliment");
    expect(s.affection).toBe(72);
    expect(s.relationship).toBe("ex");
  });
  it("respects refusal of flirt photos", () => {
    const s = applyPeiReaction(initialPeiState(), "reject-flirting");
    expect(s.photoBoundary).toBe("no-flirting");
    const p = planPeiPhoto(s, base);
    if (p) expect(p.level).toBeLessThan(2);
  });
  it("never generates a photo for an impossible location", () => {
    expect(planPeiPhoto(initialPeiState(), { ...base, location: "campus" })).toBeNull();
  });
  it("keeps photo id stable and avoids duplicates", () => {
    const p = planPeiPhoto(initialPeiState(), base);
    if (!p) return;
    expect(planPeiPhoto(initialPeiState(), base)?.photoId).toBe(p.photoId);
    expect(planPeiPhoto(recordPeiPhoto(initialPeiState(), p), base)).toBeNull();
  });
  it("uses a physically plausible cooking camera", () => {
    const p = planPeiPhoto(initialPeiState(), {
      ...base, location: "kitchen", activity: "cooking", seed: 4,
    });
    if (p) expect(p.captureMethod).toBe("timer");
  });
});
