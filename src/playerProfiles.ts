export function playerSaveKey(workId: string, playerId: string): string {
  return `player:${encodeURIComponent(playerId)}:work:${encodeURIComponent(workId)}`;
}
