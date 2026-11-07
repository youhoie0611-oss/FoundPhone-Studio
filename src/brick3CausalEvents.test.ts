import { describe, expect, it } from "vitest";
import { addStoryEvent, advanceStoryClock, decideStoryEvent, eligibleFollowUps, emptyStoryLedger } from "./brick3CausalEvents";
const event = (id: string, start = "2026-11-13T18:00:00+08:00", end = "2026-11-13T20:00:00+08:00", prerequisites: string[] = []) => ({ id, characterId: "qi_ye", status: "not_started" as const, startsAt: start, endsAt: end, prerequisites, followUps: [] as string[], photoIds: [] as string[] });
describe("Brick3 causal events", () => {
 it("acceptance requires actual attendance; unanswered appointments become missed", () => {
  let l = addStoryEvent(emptyStoryLedger(), event("basketball"));
  l = decideStoryEvent(l, "basketball", "accept", "2026-11-11T12:00:00+08:00");
  expect(l.events.basketball.status).toBe("scheduled");
  expect(advanceStoryClock(l, "2026-11-14T00:00:00+08:00").events.basketball.status).toBe("missed");
 });
 it("refusal never becomes attendance", () => {
  const l = decideStoryEvent(addStoryEvent(emptyStoryLedger(), event("basketball")), "basketball", "decline", "2026-11-11T12:00:00+08:00");
  expect(() => decideStoryEvent(l, "basketball", "attend", "2026-11-13T19:00:00+08:00")).toThrow();
 });
 it("prevents overlapping appointments", () => {
  let l = addStoryEvent(emptyStoryLedger(), event("basketball"));
  l = addStoryEvent(l, event("exhibit", "2026-11-13T19:00:00+08:00", "2026-11-13T21:00:00+08:00"));
  l = decideStoryEvent(l, "basketball", "accept", "2026-11-11T12:00:00+08:00");
  expect(() => decideStoryEvent(l, "exhibit", "accept", "2026-11-11T12:00:00+08:00")).toThrow();
 });
 it("requires explicit new time after postponement", () => {
  let l = decideStoryEvent(addStoryEvent(emptyStoryLedger(), event("basketball")), "basketball", "postpone", "2026-11-11T12:00:00+08:00");
  expect(() => decideStoryEvent(l, "basketball", "accept", "2026-11-12T12:00:00+08:00")).toThrow();
  l = decideStoryEvent(l, "basketball", "accept", "2026-11-12T12:00:00+08:00", "2026-11-20T18:00:00+08:00", "2026-11-20T20:00:00+08:00");
  expect(l.events.basketball.startsAt).toContain("11-20");
 });
 it("tracks causal follow-ups without auto-delivery", () => {
  let l = addStoryEvent(emptyStoryLedger(), { ...event("basketball"), followUps: ["injury"] });
  l = addStoryEvent(l, event("injury", "2026-11-14T12:00:00+08:00", "2026-11-14T14:00:00+08:00", ["basketball"]));
  l = decideStoryEvent(l, "basketball", "accept", "2026-11-11T12:00:00+08:00");
  l = decideStoryEvent(l, "basketball", "attend", "2026-11-13T19:00:00+08:00");
  expect(eligibleFollowUps(l, "basketball")).toEqual(["injury"]);
 });
});
