/**
 * Match the KKT bubble timeline when constructing an offline conversation.
 * Scripted and runtime messages use different timestamp formats. Ordering by
 * source collection instead of displayed time makes NPCs answer old messages.
 */
export function orderBrick3Chat<T extends { time: string }>(messages: readonly T[]): T[] {
  const clock = (value: string): number => {
    const time = value.match(/(\d{1,2}):(\d{2})(?::\d{2})?$/);
    const minute = time ? Number(time[1]) * 60 + Number(time[2]) : -1;
    const date = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return date
      ? Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3])) / 60000 + minute
      : minute;
  };
  return messages.map((message, index) => ({ message, index }))
    .sort((a, b) => clock(a.message.time) - clock(b.message.time) || a.index - b.index)
    .map(({ message }) => message);
}
