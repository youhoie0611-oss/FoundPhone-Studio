import { describe, expect, it } from "vitest";
import { relationshipLeads, visibleRelationship } from "./relationships";

describe("《磚3》通訊錄：我的關係", () => {
  it("shows all five leads without exposing initial hidden values", () => {
    expect(relationshipLeads).toHaveLength(5);
    for (const name of relationshipLeads) {
      const result = visibleRelationship({
        variables: { [name + "_affection"]: 99, [name + "_trust"]: 90,
          [name + "_jealousy"]: 85, [name + "_關係"]: "99" },
        clues: [],
      }, name);
      expect(result.status).toBe("未確認戀愛關係");
      expect(JSON.stringify(result)).not.toMatch(/affection|trust|jealousy|99|90|85/);
    }
  });
  it("reads explicitly public state, agreements, confession and negotiation", () => {
    const result = visibleRelationship({
      variables: {
        "裴知聿_relationshipStatus": "前任",
        "裴知聿_exclusivityAgreement": "待協商",
        "裴知聿_confessionStatus": "待回覆告白",
        "裴知聿_negotiationStatus": "協商中",
      },
      clues: ["core:裴知聿:one", "core:裴知聿:one", "祁野:other", "opaque_secret"],
    }, "裴知聿");
    expect(result).toEqual({
      name: "裴知聿", status: "前任", exclusivity: "待協商",
      confession: "待回覆告白", negotiation: "協商中", clueCount: 1,
    });
  });
  it("updates from the current runtime and never prints raw clue IDs", () => {
    const runtime = { variables: { "沈硯舟_關係": "朋友" }, clues: ["沈硯舟:core-1"] };
    expect(visibleRelationship(runtime, "沈硯舟").status).toBe("朋友");
    expect(visibleRelationship(runtime, "沈硯舟").clueCount).toBe(1);
    runtime.variables["沈硯舟_關係"] = "交往中";
    runtime.clues.push("沈硯舟:core-2");
    expect(visibleRelationship(runtime, "沈硯舟").status).toBe("交往中");
    expect(visibleRelationship(runtime, "沈硯舟").clueCount).toBe(2);
    expect(JSON.stringify(visibleRelationship(runtime, "沈硯舟"))).not.toContain("core-1");
  });
});
