export function playerSaveKey(workId: string, playerId: string): string {
  return `player:${encodeURIComponent(playerId)}:work:${encodeURIComponent(workId)}`;
}

/** Anonymous local identity for free chat. Not an authentication credential. */
export function activePlayerId(): string {
  const key = "foundphone:active-player-id";
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(key, id);
    return id;
  } catch {
    return "anonymous";
  }
}
