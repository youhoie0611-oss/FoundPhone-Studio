import { initialRuntime, type Runtime, type Work } from "./schema";

/**
 * Reconcile a prior Brick3 save with a newer compiled story.
 * Never execute obsolete queued events or re-award old male-host encounters.
 * Keep personal chat history and unrelated progress whenever IDs remain valid.
 */
export function restoreBrick3Save(work: Work, saved: Runtime): Runtime | null {
  if (work.id !== "between-the-lines-b-demo" || saved.workId !== work.id) return null;
  if (saved.revision === work.updatedAt) return saved;
  const base = initialRuntime(work);
  const nodeIds = new Set(work.nodes.map(n => n.id));
  const itemIds = new Set(Object.values(work.data).flat().map(i => i.id));
  const valid = (ids: string[]) => (ids ?? []).filter(id => itemIds.has(id) || nodeIds.has(id));
  const variables = { ...base.variables, ...saved.variables };
  // Obsolete occupation/encounter facts must not be carried into the new canon.
  delete variables.lu_met_in_service;
  const luWasMet = Boolean(saved.variables?.lu_met_near_office);
  variables.lu_met_near_office = luWasMet;
  // Existing private conversations remain private; never auto-grant new access.
  variables.lu_private_contact = Boolean(saved.variables?.lu_private_contact);
  const messages: Runtime["messages"] = {};
  for (const [app, items] of Object.entries(saved.messages ?? {})) {
    if (!(app in work.data)) continue;
    messages[app] = items.filter(item => !/^v7-lu-service|^brick3-photo-photo_commercial_shoot/.test(item.id));
  }
  return {
    ...base,
    date: saved.date ?? base.date,
    time: saved.time ?? base.time,
    elapsedMs: saved.elapsedMs ?? 0,
    clockRemainderMs: saved.clockRemainderMs ?? 0,
    variables,
    visited: valid(saved.visited),
    read: valid(saved.read),
    clues: saved.clues ?? [],
    unlocked: valid(saved.unlocked),
    hidden: valid(saved.hidden),
    completed: (saved.completed ?? []).filter(id => nodeIds.has(id)),
    notifications: saved.notifications ?? [],
    endings: saved.endings ?? [],
    messages,
    ui: saved.ui ?? {},
    // Rebuild pending events from the current story rather than firing removed scenes.
    scheduled: (saved.scheduled ?? []).filter(x => nodeIds.has(x.nodeId)),
    choices: (saved.choices ?? []).filter(x => nodeIds.has(x.target)),
    trace: saved.trace ?? [],
    brick3V8: saved.brick3V8,
    brick3V8Life: saved.brick3V8Life,
    brick3V8Intimacy: saved.brick3V8Intimacy,
    brick3V8Conflict: saved.brick3V8Conflict,
    brick3V8PeiThirdParty: saved.brick3V8PeiThirdParty,
    peiAutonomy: saved.peiAutonomy,
    brick3Invites: saved.brick3Invites,
    brick3DateSocial: saved.brick3DateSocial,
    brick3Memory: saved.brick3Memory,
    brick3SceneEvents: saved.brick3SceneEvents,
    brick3PeiV6: saved.brick3PeiV6,
  };
}
