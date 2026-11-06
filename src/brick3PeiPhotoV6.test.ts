import {describe,expect,it} from "vitest";
import {initialRuntime,type Work} from "./schema";
import {tickPeiPhotoV6,choosePeiPhotoV6,dismissPeiPhotoV6} from "./brick3PeiPhotoV6";
import config from "../docs/brick3-pei-zhiyu-photo-events-v6.json";
const makeWork=(ready=true)=>({id:"between-the-lines-b-demo",mode:"mixed",
 variables:{pei_v6_assets_ready:ready},
 nodes:[{id:"brick3-photo-pei_zhiyu_v5_10-time"}],
 phone:{date:"2026-11-06",time:"22:00"}}) as unknown as Work;
function setup(ready=true){
 const w=makeWork(ready),s=initialRuntime(w);
 s.time="22:00";s.elapsedMs=0;s.completed=["brick3-photo-pei_zhiyu_v5_10-choice-1-reply"];
 s.variables.pei_v4_photo_consent_level=3;
 return {w,s};
}
describe("Pei V6 photo runtime",()=>{
 it("has 30 distinct photos and 120 authored responses",()=>{
  expect(config.photos).toHaveLength(30);
  expect(new Set(config.photos.map(p=>p.filename)).size).toBe(30);
  expect(config.events.reduce((n,e)=>n+e.choices.length,0)).toBe(120);
  expect(config.photos.every(p=>p.repositoryPath.startsWith("public/story-photos/pei_zhiyu/"))).toBe(true);
 });
 it("never delivers any photo before actual assets are present or earlier story finishes",()=>{
  const {w,s}=setup(false);
  tickPeiPhotoV6(w,s);expect(s.brick3PeiV6).toBeUndefined();
  const a=setup();a.s.completed=[];
  tickPeiPhotoV6(a.w,a.s);expect(a.s.brick3PeiV6).toBeUndefined();
 });
 it("sends one photo with ordered messages and offers four replies; no gallery import",()=>{
  const {w,s}=setup();tickPeiPhotoV6(w,s);
  expect(s.brick3PeiV6?.phase).toBe("waiting");
  s.elapsedMs=21600001;tickPeiPhotoV6(w,s);
  expect(s.messages.kakao?.at(-1)?.kind).toBe("text");
  s.elapsedMs+=2000;tickPeiPhotoV6(w,s);
  expect(s.messages.kakao?.at(-1)?.kind).toBe("image");
  s.elapsedMs+=2000;tickPeiPhotoV6(w,s);
  expect(s.choices.filter(c=>c.target.includes("pei_zhiyu_v6_01-choice-"))).toHaveLength(4);
  const target=s.choices.find(c=>c.target.endsWith("-choice-2"))!.target;
  const chosen=choosePeiPhotoV6(w,s,target)!;
  expect(chosen.brick3PeiV6?.phase).toBe("reply");
  expect(chosen.choices.some(c=>c.target===target)).toBe(false);
  expect(choosePeiPhotoV6(w,chosen,target)).toBe(chosen);
  chosen.elapsedMs+=2500;tickPeiPhotoV6(w,chosen);
  expect(chosen.brick3PeiV6?.index).toBe(1);
  expect(chosen.messages.kakao?.filter(m=>m.kind==="image")).toHaveLength(1);
 });
 it("respects intimate photo refusal and explicit no-contact",()=>{
  const {w,s}=setup();tickPeiPhotoV6(w,s);
  s.brick3PeiV6!.index=6;s.brick3PeiV6!.phase="waiting";s.brick3PeiV6!.nextAt=0;
  s.variables.pei_v4_photo_consent_level=1;
  s.elapsedMs=21600001;tickPeiPhotoV6(w,s);
  expect(s.brick3PeiV6!.skippedPhotoIds).toContain("pei_zhiyu_v6_07");
  s.peiAutonomy={phase:"stopped"} as NonNullable<typeof s.peiAutonomy>;
  const before=s.messages.kakao?.length??0;
  tickPeiPhotoV6(w,s);expect(s.messages.kakao?.length??0).toBe(before);
 });
 it("free text clears unanswered scripted photo choices",()=>{
  const {w,s}=setup();tickPeiPhotoV6(w,s);
  s.elapsedMs=21600001;tickPeiPhotoV6(w,s);
  s.elapsedMs+=2000;tickPeiPhotoV6(w,s);
  s.elapsedMs+=2000;tickPeiPhotoV6(w,s);
  dismissPeiPhotoV6(s,"裴知聿");
  expect(s.choices.some(c=>c.target.startsWith("brick3-photo-pei_zhiyu_v6_"))).toBe(false);
  expect(s.brick3PeiV6?.index).toBe(1);
 });
});
