import { describe, expect, it } from "vitest";
import { brick3AuthoredEvents, brick3ChoiceMap } from "./brick3CausalRegistry";
import { reconcileBrick3KktMedia, recordBrick3AuthoredChoice, recordBrick3PhotoTextReply } from "./brick3CausalIntegration";
import { makeItem, type Runtime, type Work } from "./schema";

const work = { id: "between-the-lines-b-demo", phone: { date: "2026-11-07" }, data: { kakao: [] } } as unknown as Work;
function runtime(): Runtime {
 return { workId: work.id, revision: 0, date: "2026-11-07", time: "18:00", elapsedMs: 0,
  variables: {}, visited: [], read: [], clues: [], unlocked: [], hidden: [], completed: [],
  notifications: [], endings: [], choices: [], messages: {}, trace: [] };
}
describe("Brick3 five-lead causal photo index", () => {
 it("indexes all five leads with unique choice identifiers", () => {
  expect(new Set(brick3AuthoredEvents.map(x => x.characterId)).size).toBe(5);
  const choices = brick3AuthoredEvents.flatMap(x=>x.choices.map(c=>c.target));
  expect(new Set(choices).size).toBe(choices.length);
  expect(choices.length).toBeGreaterThanOrEqual(400);
 });
 it("each authored photo response writes a separate player choice and does not imply attendance", () => {
  for (const lead of ["shen_yanzhou","pei_zhiyu","qi_ye","gu_shian","lu_chenchuan"]) {
   const authored = brick3AuthoredEvents.find(x=>x.characterId===lead && x.kind==="photo" && x.choices.length);
   expect(authored).toBeDefined();
   const item = authored!.choices[0];
   const previous = runtime();
   previous.choices=[{label:item.label,target:item.target}];
   const next=recordBrick3AuthoredChoice(work,previous,structuredClone(previous),item.target);
   const result=next.brick3Ledger?.events["kkt:photo:"+authored!.id];
   expect(result?.choiceId).toBe(item.target);
   expect(result?.attended).not.toBe(true);
   expect(result?.characterId).toBe(lead);
  }
 });
 it("does not add an unpublished asset from its registry alone", () => {
  const s=runtime();
  reconcileBrick3KktMedia(work,s);
  expect(s.brick3Ledger?.events).toBeUndefined();
 });
 it("registers only an actual received KKT image with provenance", () => {
  const s=runtime();
  s.messages.kakao=[makeItem({id:"photo-actual",title:"顧時安",sender:"顧時安",
    kind:"image",media:"./story-photos/gu_shian/gu_shian_breakfast_chat_01.webp",
    meta:{photoEventId:"photo_morning_breakfast",photoId:"gu_shian_breakfast_chat_01"}})];
  reconcileBrick3KktMedia(work,s);
  const photo=s.brick3Ledger!.events["kkt:photo:photo_morning_breakfast"];
  expect(photo.sourceMessageIds).toEqual(["photo-actual"]);
  expect(photo.photoIds).toContain("gu_shian_breakfast_chat_01");
  reconcileBrick3KktMedia(work,s);
  expect(photo.sourceMessageIds).toEqual(["photo-actual"]);
 });
 it("free text respects the active photo and a boundary", () => {
  const s=runtime();
  const first=brick3ChoiceMap.get("brick3-photo-photo_morning_breakfast-choice-1");
  expect(first).toBeDefined();
  s.choices=[{target:"brick3-photo-photo_morning_breakfast-choice-1",label:first!.choice.label}];
  s.messages.kakao=[makeItem({title:"顧時安",sender:"顧時安",body:"早餐",meta:{photoEventId:"photo_morning_breakfast"}})];
  recordBrick3PhotoTextReply(s,"顧時安","別再傳照片",s.choices);
  expect(s.brick3Ledger!.events["kkt:photo:photo_morning_breakfast"].status).toBe("declined");
 });
 it("does not touch the shared FoundPhone runtime", () => {
  const s=runtime();
  s.messages.kakao=[makeItem({title:"顧時安",sender:"顧時安",kind:"image",meta:{photoEventId:"photo_morning_breakfast"}})];
  reconcileBrick3KktMedia({ ...work,id:"other-story" },s);
  expect(s.brick3Ledger).toBeUndefined();
 });
});
