import type { Item } from "../schema";

export type StoryReply = { label: string; target: string };
const actorKey: Record<string, string> = {
  "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi",
  "顧時安": "gu", "陸沉川": "lu",
};

/** Attach four authored action nodes only to the incoming message which opened them.
 * Avoid global stale choices and never manufacture a fallback one-line AI reply.
 */
export function authoredReplies(
  thread: string,
  last: Pick<Item, "id" | "outgoing" | "meta"> | undefined,
  choices: readonly StoryReply[],
): StoryReply[] {
  if (!last || last.outgoing) return [];
  const key = actorKey[thread];
  const id = last.id;
  let prefix = "";
  const long = /^z3-long-(shen|pei|qi|gu|lu)-c\d+-(?:lead|follow)$/.exec(id);
  const intro = /^z3-v6-(shen|pei|qi|gu|lu)-(?:lead|follow)$/.exec(id);
  const pair = /^z3-pair-((?:shen|pei|qi|gu|lu)-(?:shen|pei|qi|gu|lu))-lead$/.exec(id);
  if (long && long[1] === key) prefix = id.replace(/-(?:lead|follow)$/, "-choice-");
  else if (intro && intro[1] === key) prefix = "z3-v6-" + key + "-choice-";
  else if (pair && pair[1].split("-")[0] === key) prefix = "z3-pair-" + pair[1] + "-choice-";
  else if (key === "pei" && /^pei-intro-(?:lead|context)$/.test(id)) prefix = "pei-intro-choice-";
  else if (key === "gu" && last.meta.guScene) prefix = last.meta.guScene + "-choice-";
  else if (key === "lu" && /^z3-lu-private-(?:intro|context)$/.test(id)) prefix = "z3-lu-private-choice-";
  else if (key === "lu" && id === "z3-lu-rel-question") prefix = "z3-lu-rel-choice-";
  else if (thread === "林安" && id === "z3-lin-night-invite") prefix = "z3-lu-invite-";
  else if (thread === "林安" && id === "z3-lin-night-after") prefix = "z3-lu-contact-";
  if (!prefix) return [];
  const matches = choices.filter(c => c.target.startsWith(prefix));
  return matches.length === 4 ? matches : [];
}
