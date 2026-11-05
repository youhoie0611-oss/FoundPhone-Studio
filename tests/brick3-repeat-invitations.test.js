import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3V7Lu } from "../scripts/brick3-v7-lu.mjs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";
import { injectBrick3Affinity } from "../scripts/brick3-affinity.mjs";
import { compileStory } from "../src/story-engine/compiler.ts";
import { initialRuntime } from "../src/schema.ts";
import { choose, advance, dispatch, submitCustomReply } from "../src/engine.ts";
import { tickBrick3Invitations, nextBrick3InvitationThreshold } from "../src/brick3RepeatInvites.ts";

const read = path => JSON.parse(readFileSync(path, "utf8"));
const makeWork = () => {
  const raw = injectBrick3V7Lu(read("stories/ambiguity-b/story.json"));
  injectBrick3PhotoEvents(raw, read("docs/brick3-photo-events-v1.json"));
  injectBrick3Affinity(raw);
  return compileStory(raw).work;
};
const prefix = "brick3-photo-";
const choices = (s, activity, part = "") =>
  s.choices.filter(c => c.target.startsWith(prefix + activity + part + "-choice-"));
function begin(w, score, activity = "shen_night_view_outing", key = "shen_attraction") {
  const s = initialRuntime(w);
  s.variables[key] = score;
  tickBrick3Invitations(w, s);
  expect(choices(s, activity)).toHaveLength(4);
  return s;
}
function goToDoor(w, state, activity = "shen_night_view_outing") {
  const accepting = choose(w, state, prefix + activity + "-choice-1");
  const onWay = advance(w, accepting, 3000);
  expect(onWay.brick3Invites[activity].phase).toBe("travel");
  const atDoor = advance(w, onWay, 21 * 60 * 1000);
  expect(choices(atDoor, activity, "_arrival")).toHaveLength(4);
  return atDoor;
}
describe("Brick3 affection-gated repeatable invitations", () => {
  it("advances 30→40, 40→50, 60→65 and 65→70 on refusal", () => {
    expect(nextBrick3InvitationThreshold(30)).toBe(40);
    expect(nextBrick3InvitationThreshold(40)).toBe(50);
    expect(nextBrick3InvitationThreshold(60)).toBe(65);
    expect(nextBrick3InvitationThreshold(65)).toBe(70);
  });

  it("refusing at 30 never cancels the event permanently; only at 40 and after cooldown does it reappear", () => {
    const w = makeWork();
    const offered = begin(w, 30);
    const refused = choose(w, offered, prefix + "shen_night_view_outing-choice-2");
    const resolved = advance(w, refused, 3000);
    expect(resolved.brick3Invites.shen_night_view_outing.nextThreshold).toBe(40);
    resolved.variables.shen_attraction = 39;
    const stillClosed = advance(w, resolved, 4 * 60 * 60 * 1000);
    expect(choices(stillClosed, "shen_night_view_outing")).toHaveLength(0);
    stillClosed.variables.shen_attraction = 40;
    const repeated = advance(w, stillClosed, 1000);
    expect(choices(repeated, "shen_night_view_outing")).toHaveLength(4);
    expect(repeated.brick3Invites.shen_night_view_outing.attempts).toBe(2);
  });

  it("if the first invitation happens at 60, refusal needs 65 not a ten-point leap", () => {
    const w = makeWork();
    const state = begin(w, 60);
    const declined = advance(w, choose(w, state, prefix + "shen_night_view_outing-choice-4"), 3000);
    expect(declined.brick3Invites.shen_night_view_outing.nextThreshold).toBe(65);
    declined.variables.shen_attraction = 64;
    const waiting = advance(w, declined, 4 * 60 * 60 * 1000);
    expect(choices(waiting, "shen_night_view_outing")).toHaveLength(0);
    waiting.variables.shen_attraction = 65;
    const second = advance(w, waiting, 1000);
    expect(choices(second, "shen_night_view_outing")).toHaveLength(4);
  });

  it("only explicit arrival awards a single photo and stops further invitations even when affection increases", () => {
    const w = makeWork();
    const atDoor = goToDoor(w, begin(w, 60));
    expect(atDoor.messages.photos ?? []).toHaveLength(0);
    const confirmed = choose(w, atDoor, prefix + "shen_night_view_outing_arrival-choice-1");
    const completed = advance(w, confirmed, 3000);
    const rewards = (completed.messages.photos ?? []).filter(i => i.id.startsWith("brick3-photo-shen_night_view_outing-album-"));
    expect(rewards).toHaveLength(1);
    expect(rewards[0].media).toBe("./story-photos/shen_yanzhou/shen_yanzhou_night_view_event_01.webp");
    expect(completed.unlocked).toContain(rewards[0].id);
    completed.variables.shen_attraction = 100;
    const later = advance(w, completed, 4 * 60 * 60 * 1000);
    expect(choices(later, "shen_night_view_outing")).toHaveLength(0);
    expect(later.brick3Invites.shen_night_view_outing.attempts).toBe(1);
  });

  it("cancelling at the venue keeps the gallery empty and permits retry at a later stage", () => {
    const w = makeWork();
    const atDoor = goToDoor(w, begin(w, 30));
    const cancelled = advance(w, choose(w, atDoor, prefix + "shen_night_view_outing_arrival-choice-3"), 3000);
    expect(cancelled.messages.photos ?? []).toHaveLength(0);
    expect(cancelled.brick3Invites.shen_night_view_outing.nextThreshold).toBe(40);
    expect(cancelled.brick3Invites.shen_night_view_outing.completed).not.toBe(true);
  });

  it("delivers one random delayed aftercare without opening KKT; NPC photo is not auto-imported into gallery", () => {
    const w = makeWork();
    const confirmed = choose(w, goToDoor(w, begin(w, 60)), prefix + "shen_night_view_outing_arrival-choice-1");
    let s = advance(w, confirmed, 3000);
    for (let i = 0; i < 4; i++) s = advance(w, s, 24 * 60 * 60 * 1000);
    const texts = (s.messages.kakao ?? []).filter(m => m.id.startsWith("brick3-repeat-shen_night_view_outing-aftercare-") && m.kind === "text");
    const npcPictures = (s.messages.kakao ?? []).filter(m => m.id.startsWith("brick3-repeat-shen_night_view_outing-aftercare-photo-"));
    expect(texts).toHaveLength(1);
    expect(npcPictures).toHaveLength(1);
    expect(npcPictures[0].media).toBe("./story-photos/shen_yanzhou/shen_yanzhou_night_view_followup_01.webp");
    expect((s.messages.photos ?? []).filter(m => m.id.startsWith("brick3-photo-shen_night_view_outing-album-"))).toHaveLength(1);
  });

  it("private Lu invitations remain locked until contact exchange despite high attraction", () => {
    const w = makeWork();
    const s = initialRuntime(w);
    s.variables.lu_attraction = 90;
    tickBrick3Invitations(w, s);
    expect(choices(s, "lu_photo_exhibit")).toHaveLength(0);
    s.variables.lu_private_contact = true;
    tickBrick3Invitations(w, s);
    expect(choices(s, "lu_photo_exhibit")).toHaveLength(4);
  });

  it("uses hidden Pei affection for dinner, with a single reward and no old fixed-day invitation", () => {
    const w = makeWork();
    expect(w.nodes.some(n => n.id === "brick3-photo-photo_dinner_invite-arrive")).toBe(false);
    const s = initialRuntime(w);
    s.variables.pei_attraction = 29;
    tickBrick3Invitations(w, s);
    expect(choices(s, "pei_dinner_outing")).toHaveLength(0);
    s.variables.pei_attraction = 30;
    tickBrick3Invitations(w, s);
    expect(choices(s, "pei_dinner_outing")).toHaveLength(4);
    const atDoor = goToDoor(w, s, "pei_dinner_outing");
    const confirmed = advance(w, choose(w, atDoor, prefix + "pei_dinner_outing_arrival-choice-1"), 3000);
    const rewards = (confirmed.messages.photos ?? []).filter(i => i.id.startsWith(prefix + "pei_dinner_outing-album-"));
    expect(rewards).toHaveLength(1);
    expect(rewards[0].media).toBe("./story-photos/pei_zhiyu/pei_zhiyu_dinner_visit_table_01.webp");
  });

  it("Pei responds to soft refusal with separate delayed, emotionally vulnerable messages", () => {
    const w = makeWork();
    const s = begin(w, 30, "pei_dinner_outing", "pei_attraction");
    const declined = advance(w, choose(w, s, prefix + "pei_dinner_outing-choice-2"), 3000);
    const received = () => declined.messages.kakao.filter(m => m.id.includes("anxious-followup"));
    expect(received()).toHaveLength(0);
    const first = advance(w, declined, 15000);
    const one = first.messages.kakao.filter(m => m.id.includes("anxious-followup"));
    expect(one).toHaveLength(1);
    expect(one[0].body).toMatch(/妳還在嗎/);
    const second = advance(w, first, 45000);
    expect(second.messages.kakao.filter(m => m.id.includes("anxious-followup")).length).toBeGreaterThanOrEqual(2);
    expect(second.brick3Invites.pei_dinner_outing.anxiousFollowUpAtMs).toBeUndefined();
    expect(second.messages.photos ?? []).toHaveLength(0);
  });

  it("Pei stops scheduled anxious followups when the player answers in free text", () => {
    const w = makeWork();
    const s = begin(w, 30, "pei_dinner_outing", "pei_attraction");
    const declined = advance(w, choose(w, s, prefix + "pei_dinner_outing-choice-2"), 3000);
    const replied = submitCustomReply(declined, "我不想繼續談這件事", "kakao", "裴知聿");
    const later = advance(w, replied, 120000);
    expect(later.messages.kakao.filter(m => m.id.includes("anxious-followup"))).toHaveLength(0);
  });

  it("respects old saves that already unlocked a Pei dinner photo", () => {
    const w = makeWork();
    const s = initialRuntime(w);
    s.variables.pei_attraction = 80;
    s.unlocked.push("brick3-photo-photo_dinner_at_home-album-1");
    s.choices.push({ label: "舊邀請", target: "brick3-photo-photo_dinner_invite-choice-1" });
    tickBrick3Invitations(w, s);
    expect(s.brick3Invites.pei_dinner_outing.completed).toBe(true);
    expect(choices(s, "pei_dinner_outing")).toHaveLength(0);
    expect(s.choices.some(c => c.target.includes("photo_dinner_invite"))).toBe(false);
  });

  it("a free-form answer does not count as consent and will not award an event photo", () => {
    const w = makeWork();
    const s = begin(w, 30);
    const text = submitCustomReply(s, "今天先不去了", "kakao", "沈硯舟");
    expect(choices(text, "shen_night_view_outing")).toHaveLength(0);
    expect(text.brick3Invites.shen_night_view_outing.nextThreshold).toBe(40);
    expect(text.messages.photos ?? []).toHaveLength(0);
  });

  it("player choices increase hidden attraction only once; NPC autonomous messages do not", () => {
    const w = makeWork();
    const node = w.nodes.find(n => n.id === "reply-shen-1");
    expect(node.actions.some(a => a.type === "affinity" && a.key === "shen_attraction")).toBe(true);
    const entry = { ...w.nodes[0], id: "test-affinity-trigger", type: "event",
      event: "testAffinity", target: "", once: true, actions: [], conditions: [], next: ["reply-shen-1"] };
    const isolated = { ...w, nodes: [...w.nodes, entry] };
    const s = initialRuntime(isolated);
    const chosen = dispatch(isolated, s, "testAffinity");
    expect(chosen.variables.shen_attraction).toBeGreaterThan(10);
    const repeat = dispatch(isolated, chosen, "testAffinity");
    expect(repeat.variables.shen_attraction).toBe(chosen.variables.shen_attraction);
  });
});
