/**
 * Brick3 refresh: request a fresh deployment AND start the story with a clean
 * save on the next page load. The next load handles deletion so that a running
 * phone cannot recreate its old save between this click and navigation.
 */
export const BRICK3_WORK_ID = "between-the-lines-b-demo";
export const BRICK3_RESET_PARAM = "brick3-reset";

export type RefreshRegistration = { scope: string; unregister: () => Promise<boolean> };
export type RefreshCacheStore = { keys: () => Promise<string[]>; delete: (key: string) => Promise<boolean> };
export type RefreshEnvironment = {
  url: string;
  registrations?: () => Promise<readonly RefreshRegistration[]>;
  caches?: RefreshCacheStore;
  navigate: (url: string) => void;
  now?: () => number;
  timeoutMs?: number;
};

export function isBrick3ResetRequested(workId: string, search: string): boolean {
  return workId === BRICK3_WORK_ID && new URLSearchParams(search).get(BRICK3_RESET_PARAM) === "1";
}

export function clearBrick3ResetParam(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(BRICK3_RESET_PARAM);
  return url.toString();
}

/** Never let a stalled iOS Safari service-worker operation block navigation. */
export async function withRefreshDeadline(pending: Promise<unknown>, maxMs = 1200): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      pending,
      new Promise<void>(resolve => { timer = setTimeout(resolve, maxMs); }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function refreshBrick3Site(env: RefreshEnvironment): Promise<void> {
  const current = new URL(env.url);
  const basePath = new URL("./", current).pathname;
  // Request save deletion on the NEXT page load (before the save can be read).
  current.searchParams.set(BRICK3_RESET_PARAM, "1");
  // Bypass the browser's cached HTML on every click.
  current.searchParams.set("brick3-refresh", String((env.now ?? Date.now)()));

  if (env.registrations) {
    try {
      await withRefreshDeadline((async () => {
        const registrations = await env.registrations!();
        const active = registrations.filter(registration => current.href.startsWith(registration.scope));
        await Promise.allSettled(active.map(registration => registration.unregister()));
      })(), env.timeoutMs);
    } catch {
      // A failed unregister is not allowed to strand the user.
    }
  }
  if (env.caches) {
    try {
      await withRefreshDeadline((async () => {
        const keys = await env.caches!.keys();
        // Remove only this deployed game's Workbox caches, not other origins.
        const scoped = keys.filter(key =>
          key.includes(basePath) || key.includes(encodeURIComponent(basePath)));
        await Promise.allSettled(scoped.map(key => env.caches!.delete(key)));
      })(), env.timeoutMs);
    } catch {
      // Navigation with a cache-busting URL is still possible.
    }
  }

  env.navigate(current.toString());
}
