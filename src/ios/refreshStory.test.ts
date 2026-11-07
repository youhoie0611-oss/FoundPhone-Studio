import { describe, expect, it, vi } from "vitest";
import {
  BRICK3_WORK_ID,
  clearBrick3ResetParam,
  isBrick3ResetRequested,
  refreshBrick3Site,
  withRefreshDeadline,
} from "./refreshStory";

describe("Brick3 update and clean restart", () => {
  const url = "https://example.test/FoundPhone-Studio/?player=1";

  it("refreshes the latest story with a one-time save-reset request", async () => {
    const navigate = vi.fn();
    const unregister = vi.fn(async () => true);
    const del = vi.fn(async () => true);
    await refreshBrick3Site({
      url,
      now: () => 12345,
      registrations: async () => [{ scope: "https://example.test/FoundPhone-Studio/", unregister }],
      caches: { keys: async () => ["workbox-precache-https://example.test/FoundPhone-Studio/", "other-app-cache"], delete: del },
      navigate,
    });
    const next = new URL(navigate.mock.calls[0][0] as string);
    expect(next.searchParams.get("brick3-refresh")).toBe("12345");
    expect(next.searchParams.get("brick3-reset")).toBe("1");
    expect(isBrick3ResetRequested(BRICK3_WORK_ID, next.search)).toBe(true);
    expect(isBrick3ResetRequested("other-story", next.search)).toBe(false);
    expect(unregister).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledOnce();
    expect(del).toHaveBeenCalledWith("workbox-precache-https://example.test/FoundPhone-Studio/");
  });

  it("only deletes one-time reset marker after new game start", () => {
    const cleaned = clearBrick3ResetParam(url + "&brick3-reset=1&brick3-refresh=12345");
    expect(isBrick3ResetRequested(BRICK3_WORK_ID, new URL(cleaned).search)).toBe(false);
    expect(new URL(cleaned).searchParams.get("brick3-refresh")).toBe("12345");
  });

  it("never hangs if service worker and browser cache operations stall", async () => {
    const navigate = vi.fn();
    const never = new Promise<never>(() => undefined);
    await refreshBrick3Site({
      url,
      registrations: () => never,
      caches: { keys: () => never, delete: async () => true },
      navigate,
      timeoutMs: 5,
    });
    expect(navigate).toHaveBeenCalledOnce();
    expect(isBrick3ResetRequested(BRICK3_WORK_ID, new URL(navigate.mock.calls[0][0] as string).search)).toBe(true);
  });

  it("bounded waiting resolves without waiting indefinitely", async () => {
    await withRefreshDeadline(new Promise<never>(() => undefined), 5);
  });

  it("still navigates when cache cleanup fails", async () => {
    const navigate = vi.fn();
    await refreshBrick3Site({
      url,
      registrations: async () => { throw Error("service worker unavailable"); },
      caches: { keys: async () => { throw Error("cache unavailable"); }, delete: async () => false },
      navigate,
      now: () => 987,
    });
    expect(navigate).toHaveBeenCalledOnce();
    expect(new URL(navigate.mock.calls[0][0] as string).searchParams.get("brick3-refresh")).toBe("987");
  });
});
