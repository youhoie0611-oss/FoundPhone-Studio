import { describe, expect, it } from "vitest";
import { initialRuntime, type Work } from "./schema";
import { restoreBrick3Save } from "./brick3SaveMigration";

const work = {
  id: "between-the-lines-b-demo", updatedAt: 200,
  nodes: [{ id: "current-scene" }],
  data: { kakao: [{ id: "new-message" }] },
  variables: { lu_private_contact: false, lu_met_near_office: false, lu_attraction: 0 },
  phone: { time: "09:00", date: "2026-11-06" },
} as unknown as Work;

describe("Brick3 old-save compatibility", () => {
  it("retains relationship scores and private chat history but drops obsolete scenes", () => {
    const old = initialRuntime(work);
    old.revision = 100;
    old.variables = { lu_attraction: 42, lu_private_contact: true, lu_met_in_service: true };
    old.completed = ["v7-lu-service-encounter", "current-scene"];
    old.scheduled = [{ nodeId: "v7-lu-service-encounter", due: 100 }, { nodeId: "current-scene", due: 200 }];
    old.choices = [{ label: "obsolete", target: "v7-lu-service-encounter" }];
    old.messages.kakao = [{ id: "personal-message", title: "陸沉川", body: "晚點聊", sender: "陸沉川" } as never];
    const next = restoreBrick3Save(work, old)!;
    expect(next.revision).toBe(200);
    expect(next.variables.lu_attraction).toBe(42);
    expect(next.variables.lu_private_contact).toBe(true);
    expect(next.variables.lu_met_near_office).toBe(false);
    expect(next.variables.lu_met_in_service).toBeUndefined();
    expect(next.completed).toEqual(["current-scene"]);
    expect(next.scheduled).toHaveLength(1);
    expect(next.choices).toHaveLength(0);
    expect(next.messages.kakao[0].body).toBe("晚點聊");
  });
  it("does not migrate a save from another story", () => {
    const old = initialRuntime(work);
    old.workId = "another-story";
    expect(restoreBrick3Save(work, old)).toBeNull();
  });
});
