export const relationshipLeads = ["沈硯舟", "裴知聿", "祁野", "顧時安", "陸沉川"] as const;
export type RelationshipLead = (typeof relationshipLeads)[number];
export type RelationshipRuntime = {
  variables: Record<string, string | number | boolean>;
  clues: string[];
};
const publicStatuses = new Set([
  "關係尚未確認", "未確認戀愛關係", "朋友", "普通朋友", "曖昧", "交往中",
  "戀人", "前任", "已分手", "復合", "已復合", "秘密戀情",
]);
const publicFieldSuffixes = {
  status: ["relationshipStatus", "relationship_status", "relationship", "關係", "关系"],
  exclusivity: ["exclusivityAgreement", "exclusivity_agreement", "排他性約定"],
  confession: ["confessionStatus", "confession_status", "告白狀態"],
  negotiation: ["negotiationStatus", "negotiation_status", "協商狀態"],
} as const;
const visibleAgreements = new Set(["未約定", "已約定", "雙方同意", "非排他", "排他", "待協商"]);
const visibleConfessions = new Set(["尚未告白", "待回覆告白", "已接受", "已拒絕", "已撤回"]);
const visibleNegotiations = new Set(["尚未協商", "協商中", "已達成共識", "已結束"]);
function publicValue(runtime: RelationshipRuntime | undefined, name: RelationshipLead, field: keyof typeof publicFieldSuffixes) {
  if (!runtime) return undefined;
  const keys = publicFieldSuffixes[field].flatMap((suffix) => [
    name + "_" + suffix, suffix + "_" + name, name + "." + suffix,
  ]);
  const key = keys.find((k) => Object.prototype.hasOwnProperty.call(runtime.variables, k));
  const value = key ? runtime.variables[key] : undefined;
  if (typeof value !== "string") return undefined;
  const allowed = field === "status" ? publicStatuses : field === "exclusivity"
    ? visibleAgreements : field === "confession" ? visibleConfessions : visibleNegotiations;
  return allowed.has(value.trim()) ? value.trim() : undefined;
}
export function visibleRelationship(runtime: RelationshipRuntime | undefined, name: RelationshipLead) {
  // Clues are runtime-unlocked IDs. Only explicitly character-scoped IDs count;
  // opaque IDs and hidden flags are not exposed or guessed from their contents.
  const clues = (runtime?.clues ?? []).filter((id) =>
    id.startsWith(name + ":") || id.startsWith(name + "/") ||
    id.startsWith("core:" + name + ":") || id.startsWith("clue:" + name + ":")
  );
  return {
    name,
    status: publicValue(runtime, name, "status") ?? "未確認戀愛關係",
    exclusivity: publicValue(runtime, name, "exclusivity"),
    confession: publicValue(runtime, name, "confession"),
    negotiation: publicValue(runtime, name, "negotiation"),
    clueCount: new Set(clues).size,
  };
}
