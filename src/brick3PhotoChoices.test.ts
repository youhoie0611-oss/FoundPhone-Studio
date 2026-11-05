import { describe, expect, it } from "vitest";
import { pendingBrick3PhotoOptions } from "./brick3PhotoChoices";

const four = (id: string) => Array.from({ length: 4 }, (_, i) => ({
  target: `brick3-photo-${id}-choice-${i + 1}`,
  label: `回答 ${i + 1}`,
}));
const message = (event?: string, outgoing = false) =>
  ({ outgoing, meta: event ? { photoEventId: event } : {} });

describe("Brick3 photo reply selection for one KKT thread", () => {
  it("keeps four real options when the NPC sends another ordinary message", () => {
    const choices = four("photo_camera_walk");
    const messages = [message("photo_camera_walk"), message(undefined), message(undefined)];
    expect(pendingBrick3PhotoOptions(messages, choices)).toEqual(choices);
  });

  it("selects the newest pending scene rather than an older unanswered scene", () => {
    const old = four("photo_morning_breakfast");
    const recent = four("photo_design_review");
    expect(pendingBrick3PhotoOptions([
      message("photo_morning_breakfast"), message("photo_design_review"),
    ], [...old, ...recent])).toEqual(recent);
  });

  it("does not offer choices from a different thread or a completed scene", () => {
    const choices = four("photo_night_view");
    expect(pendingBrick3PhotoOptions([message("photo_camera_walk")], choices)).toEqual([]);
    expect(pendingBrick3PhotoOptions([message("photo_night_view")], [])).toEqual([]);
    expect(pendingBrick3PhotoOptions([message("photo_night_view")], choices.slice(1))).toEqual([]);
  });

  it("supports the V7 private-contact scene and ignores outgoing photo prompts", () => {
    const choices = four("v7_lu_private");
    expect(pendingBrick3PhotoOptions([message("v7_lu_private")], choices)).toEqual(choices);
    expect(pendingBrick3PhotoOptions([message("v7_lu_private", true)], choices)).toEqual([]);
  });

  it("rejects malformed scripted scene IDs and unrelated target IDs", () => {
    const bogus = [
      { target: "brick3-photo-photo_night_view-choice-10", label: "wrong" },
      { target: "brick3-photo-photo_night_view-choice-1-extra", label: "wrong" },
    ];
    expect(pendingBrick3PhotoOptions([message("photo_night_view")], bogus)).toEqual([]);
    expect(pendingBrick3PhotoOptions([message("../bad")], four("photo_night_view"))).toEqual([]);
  });
});
