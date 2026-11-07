/**
 * Reload Brick3 without deleting its IndexedDB game save.
 * Service workers can stall on iOS Safari; cache cleanup is best effort and
 * must never prevent a fresh navigation.
 */
export type RefreshRegistration = { scope: string; unregister: () => Promise<boolean> };
export type RefreshCacheStore = { keys: () => Promise<string[]>; delete: (key: string) => Promise<boolean> };
export type RefreshEnvironment = {
  url: string;
  registrations?: () => Promise<readonly RefreshRegistration[]>;
  caches?: RefreshCacheStore;
  navigate: (url: string) => void;
  now?: () => number;
};

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
  // Avoid unregistering service workers for unrelated apps under this origin.
  if (env.registrations) {
    try {
      await withRefreshDeadline((async () => {
        const registrations = await env.registrations!();
        const active = registrations.filter(registration =>
          current.href.startsWith(registration.scope));
        await Promise.allSettled(active.map(registration => registration.unregister()));
      })());
    } catch {
      // An unavailable service worker must not prevent the reload.
    }
  }
  if (env.caches) {
    try {
      await withRefreshDeadline((async () => {
        const keys = await env.caches!.keys();
        // Workbox uses the site scope in its cache names. Do not delete other
        // same-origin applications' caches or the IndexedDB story save.
        const scoped = keys.filter(key => key.includes(basePath) ||
          key.includes(encodeURIComponent(basePath)));
        await Promise.allSettled(scoped.map(key => env.caches!.delete(key)));
      })());
    } catch {
      // A blocked CacheStorage API must not strand the game on a spinner.
    }
  }
  current.searchParams.set("brick3-refresh", String((env.now ?? Date.now)()));
  env.navigate(current.toString());
}
