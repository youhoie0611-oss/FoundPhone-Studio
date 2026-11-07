import { describe, expect, it } from "vitest";
import { orderBrick3Chat } from "./brick3ChatTimeline";

describe("Brick3 KKT timeline", () => {
  it("orders authored and generated messages by their on-screen delivery time", () => {
    const authored = { id: "scripted", time: "2026-11-07 21:18" };
    const reply = { id: "player", time: "2026-11-07 21:19" };
    const response = { id: "npc", time: "2026-11-07 21:20" };
    expect(orderBrick3Chat([response, authored, reply]).map(x => x.id)).toEqual(["scripted", "player", "npc"]);
  });
  it("keeps stable speech order within the same minute", () => {
    const bubbles = ["first", "second", "third"].map(id => ({ id, time: "2026-11-07 21:18" }));
    expect(orderBrick3Chat(bubbles).map(x => x.id)).toEqual(["first", "second", "third"]);
  });
});
