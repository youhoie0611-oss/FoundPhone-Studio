import { describe, expect, it } from "vitest";
import { syncBrick3KktEvents, recordBrick3KktScene } from "./brick3KktEventBridge";
import type { Runtime, Work } from "./schema";

const work = { id: "between-the-lines-b-demo", phone: { date: "2026-11-07" } } as Work;
const state = (): Runtime => ({
  workId: work.id, revision: 0, date: "2026-11-07", elapsedMs: 0, time: "18:00",
  variables: {}, visited: [], read: [], clues: [], unlocked: [], hidden: [],
  completed: [], notifications: [], endings: [], choices: [], messages: {},
  trace: [],
});
const progress = (phase: "invited" | "travel" | "arrival" | "completed" | "idle") =>
  ({ phase, attempts: 1, nextThreshold: 10, retryAtMs: 0 });
describe("Brick3 KKT event integration", () => {
  it("records invite -> accepted -> arrival -> confirmed completion without opening KKT", () => {
    const s = state();
    s.brick3Invites = { qi_basketball: progress("invited") };
    syncBrick3KktEvents(work, s);
    expect(s.brick3Ledger?.events["kkt:invitation:qi_basketball"].status).toBe("active");
    s.brick3Invites.qi_basketball.phase = "travel";
    syncBrick3KktEvents(work, s);
    expect(s.brick3Ledger?.events["kkt:invitation:qi_basketball"].status).toBe("scheduled");
    s.brick3Invites.qi_basketball.phase = "arrival";
    syncBrick3KktEvents(work, s);
    expect(s.brick3Ledger?.events["kkt:invitation:qi_basketball"].status).toBe("active");
    s.brick3Invites.qi_basketball.phase = "completed";
    s.brick3Invites.qi_basketball.completed = true;
    s.brick3Invites.qi_basketball.completedAtMs = 90000;
    syncBrick3KktEvents(work, s);
    expect(s.brick3Ledger?.events["kkt:invitation:qi_basketball"].status).toBe("completed");
    expect(s.brick3Ledger?.events["kkt:invitation:qi_basketball"].attended).toBe(true);
  });
  it("records refusal without inventing attendance", () => {
    const s = state();
    s.brick3Invites = { pei_dinner_outing: { ...progress("invited"), responseMode: "decline" } };
    syncBrick3KktEvents(work, s);
    expect(s.brick3Ledger?.events["kkt:invitation:pei_dinner_outing"].status).toBe("declined");
    expect(s.brick3Ledger?.events["kkt:invitation:pei_dinner_outing"].attended).toBe(false);
  });
  it("does not treat legacy saved photos as verified attendance", () => {
    const s = state();
    s.brick3Invites = { pei_dinner_outing: { ...progress("completed"), completed: true } };
    syncBrick3KktEvents(work, s);
    expect(s.brick3Ledger?.events["kkt:invitation:pei_dinner_outing"]).toBeUndefined();
  });
  it("records character replies as separate event outcomes", () => {
    const s = state();
    recordBrick3KktScene(s, "陸沉川", "work_explained");
    recordBrick3KktScene(s, "裴知聿", "distance");
    expect(s.brick3Ledger?.events["kkt:scene:陸沉川:work_explained"].status).toBe("active");
    expect(s.brick3Ledger?.events["kkt:scene:裴知聿:distance"].status).toBe("declined");
  });
  it("does not modify unrelated FoundPhone stories", () => {
    const s = state();
    s.brick3Invites = { qi_basketball: progress("invited") };
    syncBrick3KktEvents({ ...work, id: "another-game" }, s);
    expect(s.brick3Ledger).toBeUndefined();
  });
});
