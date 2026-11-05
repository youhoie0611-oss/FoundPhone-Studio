import type { Item } from "./schema";

export type ScriptedReplyOption = { label: string; target: string };

/**
 * Resolve the latest unanswered photo-event prompt in one KKT thread.
 * An independent NPC message can arrive after the photo without erasing the
 * player's four scripted choices; another conversation never leaks into it.
 *
 * The choice list is the source of truth: once a choice has been used (or a
 * custom reply has dismissed it), there is nothing left to offer.
 */
export function pendingBrick3PhotoOptions(
  messages: readonly Pick<Item, "outgoing" | "meta">[],
  choices: readonly ScriptedReplyOption[],
): ScriptedReplyOption[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.outgoing) continue;
    const eventId = message.meta?.photoEventId;
    if (!eventId || !/^[a-z][a-z0-9_]*$/.test(eventId)) continue;
    const prefix = `brick3-photo-${eventId}-choice-`;
    const matches = choices.filter(
      (choice) => choice.target.startsWith(prefix) &&
        /^[1-4]$/.test(choice.target.slice(prefix.length)),
    );
    if (matches.length === 4) return matches;
  }
  return [];
}
