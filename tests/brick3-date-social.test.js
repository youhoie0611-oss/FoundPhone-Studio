import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { injectBrick3V7Lu } from "../scripts/brick3-v7-lu.mjs";
import { injectBrick3PhotoEvents } from "../scripts/brick3-photo-events.mjs";
import { injectBrick3Affinity } from "../scripts/brick3-affinity.mjs";
import invitationConfig from "../docs/brick3-repeat-invitations-v1.json";
import { compileStory } from "../src/story-engine/compiler.ts";
import { initialRuntime } from "../src/schema.ts";
import { advance, choose, submitCustomReply } from "../src/engine.ts";
import { tickBrick3DateSocial } from "../src/brick3DateSocial.ts";

const read = path => JSON.parse(readFileSync(path, "utf8"));
const prefix = "brick3-photo-";
function work() {
  const story = injectBrick3V7Lu(read("stories/ambiguity-b/story.json"));
  injectBrick3PhotoEvents(story, read("docs/brick3-photo-events-v1.json"));
  injectBrick3Affinity(story);
  return compileStory(story).work;
}
function socialAfterCompletion(w, activity, time = 1000, privateLu = false) {
  const s = initialRuntime(w);
  s.elapsedMs = time;
  s.variables.lu_private_contact = privateLu;
  s.brick3Invites = {
    [activity.id]: {
      phase: "completed", attempts: 1, nextThreshold: 30, retryAtMs: 0,
      completed: true, completedAtMs: time, followUpSent: true,
    },
  };
  tickBrick3DateSocial(w, s);
  return s;
}
const socialItems = s => (s.messages.instagram ?? []).filter(i => i.meta.source === "brick3-date-social");
const inquiries = s => (s.messages.kakao ?? []).filter(i => i.id.startsWith("brick3-social-") && i.id.includes("-inquiry-"));

describe("Brick3 five-lead completed outing -> Instagram -> jealousy -> private inquiries", () => {
  it("publishes exactly one dated Story or post for each of the five male leads", () => {
    const w = work();
    const leadKeys = ["shen", "pei", "qi", "gu", "lu"];
    for (const a of invitationConfig.activities) {
      const started = socialAfterCompletion(w, a, 10, true);
      expect(socialItems(started)).toHaveLength(0);
      const posted = advance(w, started, 3 * 3600000);
      const all = socialItems(posted);
      expect(all).toHaveLength(1);
      expect(all[0].sender).toBe(a.characterName);
      expect(all[0].media).toBe(`./story-photos/${a.characterId}/${a.eventPhoto}`);
      expect(["true", "false"]).toContain(all[0].meta.story);
      expect(posted.brick3DateSocial[a.id].posted).toBe(true);
      for (const viewer of leadKeys) {
        const score = Number(posted.variables[viewer + "_jealousy"] ?? 0);
        if (a.affectionKey.startsWith(viewer + "_")) expect(score).toBe(0);
        else expect(score).toBeGreaterThan(0);
      }
      const again = advance(w, posted, 12 * 3600000);
      expect(socialItems(again)).toHaveLength(1);
      for (const viewer of leadKeys)
        expect(again.variables[viewer + "_jealousy"]).toBe(posted.variables[viewer + "_jealousy"]);
    }
  });

  it("refused, cancelled, unfinished and migrated outings never generate IG or jealousy", () => {
    const w = work();
    const s = initialRuntime(w);
    s.variables.shen_attraction = 30;
    const offered = advance(w, s, 0);
    const refused = choose(w, offered, prefix + "shen_night_view_outing-choice-2");
    const afterRefusal = advance(w, refused, 3 * 3600000);
    expect(socialItems(afterRefusal)).toHaveLength(0);
    expect(afterRefusal.variables.pei_jealousy).toBeUndefined();
    const oldSave = initialRuntime(w);
    oldSave.brick3Invites = {
      pei_dinner_outing: {
        phase: "completed", attempts: 1, nextThreshold: 30, retryAtMs: 0,
        completed: true, followUpSent: true,
      },
    };
    expect(socialItems(advance(w, oldSave, 6 * 3600000))).toHaveLength(0);
  });

  it("never sends Lu a private KKT inquiry before contact exchange", () => {
    const w = work();
    // Scan deterministic timestamps; Lu's jealousy always reacts, but
    // the contact gate must block all unsolicited personal messages.
    for (let time = 1; time < 20; time++) {
      const s = socialAfterCompletion(w, invitationConfig.activities[0], time * 60000, false);
      const after = advance(w, s, 9 * 3600000);
      expect(Number(after.variables.lu_jealousy ?? 0)).toBeGreaterThan(0);
      expect(inquiries(after).filter(m => m.sender === "陸沉川")).toHaveLength(0);
    }
  });

  it("delivers delayed, varied jealousy questions with real four-choice answers", () => {
    const w = work();
    let found = false;
    for (let time = 1; time <= 35 && !found; time++) {
      const a = invitationConfig.activities[0];
      const started = socialAfterCompletion(w, a, time * 60000, true);
      const posted = advance(w, started, 3 * 3600000);
      const delivered = advance(w, posted, 5 * 3600000);
      const question = inquiries(delivered).find(m => m.sender === "裴知聿");
      if (!question) continue;
      found = true;
      const event = question.meta.photoEventId;
      const options = delivered.choices.filter(c => c.target.startsWith(prefix + event + "-choice-"));
      expect(options).toHaveLength(4);
      expect(question.body).toMatch(/看到|滑到|照片/);
      const answer = choose(w, delivered, options[2].target);
      expect(answer.choices.some(c => c.target.startsWith(prefix + event + "-choice-"))).toBe(false);
      expect(answer.messages.kakao.some(m => m.id.endsWith("-choice-pei") && m.outgoing)).toBe(true);
      const responded = advance(w, answer, 4000);
      expect(responded.messages.kakao.some(m => m.id.endsWith("-response-pei") && m.sender === "裴知聿")).toBe(true);
      expect(responded.brick3DateSocial[a.id].inquiries.pei.answered).toBe(true);
      const persisted = JSON.parse(JSON.stringify(responded));
      expect(socialItems(advance(w, persisted, 1000))).toHaveLength(1);
    }
    expect(found).toBe(true);
  });

  it("Pei speaks like a restrained, sharp ex rather than a politely detached friend", () => {
    const w = work(), a = invitationConfig.activities[0];
    let low, intense;
    for (let minute = 1; minute <= 35 && (!low || !intense); minute++) {
      const start = socialAfterCompletion(w, a, minute * 60000, true);
      const ordinary = advance(w, advance(w, start, 3 * 3600000), 5 * 3600000);
      if (!low && inquiries(ordinary).some(m => m.sender === "裴知聿")) low = ordinary;
      const dramaticStart = socialAfterCompletion(w, a, minute * 60000, true);
      dramaticStart.variables.pei_jealousy = 42;
      const dramatic = advance(w, advance(w, dramaticStart, 3 * 3600000), 5 * 3600000);
      if (!intense && inquiries(dramatic).some(m => m.sender === "裴知聿")) intense = dramatic;
    }
    expect(low).toBeDefined();
    expect(intense).toBeDefined();
    const lowQuestion = inquiries(low).find(m => m.sender === "裴知聿");
    expect(lowQuestion.body).toMatch(/限動|照片/);
    expect(lowQuestion.body).not.toMatch(/希望妳過得不錯|今天還順利嗎|祝妳/);
    const intenseQuestion = inquiries(intense).find(m => m.sender === "裴知聿");
    expect(intenseQuestion.body).toMatch(/喜歡的人|想到我/);
    const answered = advance(w,
      choose(w, intense, prefix + intenseQuestion.meta.photoEventId + "-choice-3"), 4000);
    expect(answered.messages.kakao.find(m => m.id.endsWith("-response-pei"))?.body)
      .toMatch(/我吃醋了/);
  });

  it("custom text dismisses the current question without silently choosing an answer", () => {
    const w = work();
    const a = invitationConfig.activities[0];
    let found = null;
    for (let time = 1; time <= 35 && !found; time++) {
      const s = advance(w, advance(w, socialAfterCompletion(w, a, time * 60000, true), 3 * 3600000), 5 * 3600000);
      if (inquiries(s).some(m => m.sender === "裴知聿")) found = s;
    }
    expect(found).not.toBeNull();
    const event = inquiries(found).find(m => m.sender === "裴知聿").meta.photoEventId;
    const custom = submitCustomReply(found, "我想保留一點私人空間", "kakao", "裴知聿");
    expect(custom.choices.some(c => c.target.startsWith(prefix + event + "-choice-"))).toBe(false);
    expect(custom.brick3DateSocial[a.id].inquiries.pei.answered).toBe(true);
    expect((custom.messages.kakao ?? []).some(m => m.id.endsWith("-choice-pei"))).toBe(false);
  });
});
