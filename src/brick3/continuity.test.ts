import { describe, expect, it } from "vitest";
import { createWork } from "../demo";
import { initialRuntime, safeMedia } from "../schema";
import { addDays, continuityAction, continuityChoices, npcCancel, progressContinuity } from "./continuity";

function fresh(){
  const w=createWork();
  w.title="磚3";w.phone.date="2026-11-04";w.phone.time="10:00";
  const s=initialRuntime(w);
  s.variables.z3_trust_qi=50;s.variables.z3_lu_met=false;s.variables.z3_lu_private_contact=false;
  return {w,s};
}
function start(){
 const state=fresh();progressContinuity(state.w,state.s);return state;
}
function action(w:ReturnType<typeof createWork>,s:ReturnType<typeof initialRuntime>,actor:string,code:string){
 return continuityAction(s,w,actor,code);
}
describe("磚3 跨事件、共同日程與真實後果",()=>{
  it("starts a recorded causal graph without opening KKT; actors continue autonomously",()=>{
    const {w,s}=start();
    expect(s.visited).toEqual([]);
    expect(s.continuity?.events["qi-court"].status).toBe("active");
    expect(s.continuity?.events["qi-court"].stage).toBe("offer");
    expect(s.continuity?.events["shen-portfolio"].status).toBe("not_started");
    expect(s.continuity?.events["qi-court"].next).toContain("qi-design");
    expect(Object.keys(s.continuity?.events??{}).length).toBeGreaterThanOrEqual(18);
    expect(s.messages.kakao.some(i=>i.title==="祁野")).toBe(true);
    expect(continuityChoices(s.continuity,"祁野")).toHaveLength(4);
    for(let day=1;day<=6;day++){
      s.date=addDays("2026-11-04",day);s.time="10:00";
      progressContinuity(w,s);
    }
    expect(s.visited).toEqual([]);
    expect(s.continuity?.events["qi-court"].status).toBe("expired");
    expect(s.messages.kakao.some(i=>i.title==="沈硯舟")).toBe(true);
    expect(s.messages.kakao.some(i=>i.title==="裴知聿")).toBe(true);
    expect(s.messages.kakao.some(i=>i.title==="顧時安")).toBe(true);
    expect(s.messages.kakao.some(i=>i.title==="下班後五人組")).toBe(true);
    expect(s.messages.kakao.some(i=>i.title==="陸沉川")).toBe(false);
  });
  it("accept creates a real promise, while attendance only occurs by explicit player confirmation",()=>{
    const {w,s:initial}=start(); let s=initial;
    s=action(w,s,"祁野","qi-court:accept");
    const record=s.continuity!.events["qi-court"];
    expect(record.status).toBe("scheduled");
    expect(record.promiseOpen).toBe(true);
    expect(record.playerJoined).toBe(false);
    expect(record.log.some(x=>x.action==="accept")).toBe(true);
    s.date=record.dueDate;s.time=record.dueTime;progressContinuity(w,s);
    expect(s.continuity!.events["qi-court"].stage).toBe("arrival");
    expect(s.continuity!.events["qi-court"].playerJoined).toBe(false);
    s=action(w,s,"祁野","qi-court:attend");
    expect(s.continuity!.events["qi-court"].stage).toBe("scene");
    expect(s.continuity!.events["qi-court"].playerJoined).toBe(true);
    expect(s.messages.kakao.some(x=>x.meta.eventId==="qi-court"&&x.kind==="image")).toBe(true);
    expect(safeMedia("./characters/qi-court.jpg")).toBe("./characters/qi-court.jpg");
    const options=continuityChoices(s.continuity,"祁野");
    expect(options[0].label).toContain("膝蓋");
    s=action(w,s,"祁野","qi-court:investigate");
    expect(s.continuity!.events["qi-court"].status).toBe("completed");
    expect(s.continuity!.events["qi-court"].outcome).toBe("investigate");
    expect(s.clues).toContain("qi-court-location");
    expect(s.messages.photos?.some(x=>x.media==="./characters/qi-court.jpg")).toBe(true);
    expect(continuityChoices(s.continuity,"祁野")).toEqual([]);
    s.date=addDays(record.dueDate,1);s.time="08:00";progressContinuity(w,s);
    expect(s.continuity!.events["qi-court"].followupSent).toBe(true);
    expect(s.messages.kakao.some(x=>x.body.includes("去檢查了"))).toBe(true);
  });
  it("declining does not imply attending; actor still acts and reports follow-up",()=>{
    const {w,s:initial}=start(); let s=initial;
    s=action(w,s,"祁野","qi-court:decline");
    expect(s.continuity!.events["qi-court"].status).toBe("declined");
    expect(s.continuity!.events["qi-court"].playerJoined).toBe(false);
    expect(s.continuity!.events["qi-court"].promiseOpen).toBe(false);
    s.date=addDays(s.date!,1);s.time="09:00";progressContinuity(w,s);
    expect(s.continuity!.events["qi-court"].followupSent).toBe(true);
    expect(s.messages.kakao.some(x=>x.body.includes("今天球打完了"))).toBe(true);
    expect(s.messages.photos?.length??0).toBe(0);
  });
  it("a postponement replaces the original date, no phantom attendance",()=>{
    const {w,s:initial}=start(); let s=initial;
    const original=s.continuity!.events["qi-court"].dueDate;
    s=action(w,s,"祁野","qi-court:postpone");
    const rescheduled=s.continuity!.events["qi-court"].dueDate;
    expect(rescheduled).toBe(addDays(original,2));
    expect(s.continuity!.events["qi-court"].status).toBe("postponed");
    s.date=original;s.time="19:00";progressContinuity(w,s);
    expect(s.continuity!.events["qi-court"].stage).toBe("scheduled");
    expect(s.continuity!.events["qi-court"].playerJoined).toBe(false);
    s.date=rescheduled;s.time="19:00";progressContinuity(w,s);
    expect(s.continuity!.events["qi-court"].stage).toBe("arrival");
  });
  it("all four offered options have distinct recorded outcomes",()=>{
    const expected=[
      ["accept","scheduled","accepted"],
      ["decline","declined","declined"],
      ["postpone","postponed","postponed"],
      ["remote","completed","remote"],
    ] as const;
    const snapshots=new Set<string>();
    for(const [command,status] of expected){
      const {w,s}=start();
      const result=action(w,s,"祁野","qi-court:"+command);
      const record=result.continuity!.events["qi-court"];
      expect(record.status).toBe(status);
      expect(record.playerChoice).toBe(command==="accept"?"accepted":command==="decline"?"decline":command==="postpone"?"postponed":"remote");
      if(command==="remote"){
        expect(record.playerJoined).toBe(false);
        expect(record.afterDate).not.toBe("");
        expect(result.variables.z3_trust_qi).toBe(53);
      }
      snapshots.add(JSON.stringify([record.status,record.dueDate,record.outcome,record.playerChoice,record.promiseOpen]));
      expect(result.messages.kakao.some(m=>m.title==="祁野"&&m.outgoing)).toBe(true);
    }
    expect(snapshots.size).toBe(4);
  });
  it("four scheduled choices produce cancel, new date, new time or prepared scene",()=>{
    const seen=new Set<string>();
    for(const c of ["cancel","postpone","shift","prepare"]){
      const {w,s:initial}=start(); let s=initial;
      s=action(w,s,"祁野","qi-court:accept");
      expect(continuityChoices(s.continuity,"祁野").length).toBe(4);
      s=action(w,s,"祁野","qi-court:"+c);
      const rec=s.continuity!.events["qi-court"];
      if(c==="cancel")expect(rec.status).toBe("cancelled");
      if(c==="postpone")expect(rec.dueDate).toBe("2026-11-08");
      if(c==="shift")expect(rec.dueTime).toBe("20:00");
      if(c==="prepare")expect(s.variables["z3_cont_prepared_qi-court"]).toBe(true);
      seen.add(JSON.stringify([rec.status,rec.dueDate,rec.dueTime,rec.playerChoice]));
    }
    expect(seen.size).toBe(4);
  });
  it("each of the four scene answers leads to distinct persisted consequences",()=>{
    const endings=new Set<string>();
    for(const c of ["investigate","support","boundary","leave"]){
      const {w,s:initial}=start(); let s=initial;
      s=action(w,s,"祁野","qi-court:accept");
      s.date=s.continuity!.events["qi-court"].dueDate;
      s.time="19:00";progressContinuity(w,s);
      s=action(w,s,"祁野","qi-court:attend");
      expect(continuityChoices(s.continuity,"祁野")).toHaveLength(4);
      s=action(w,s,"祁野","qi-court:"+c);
      const rec=s.continuity!.events["qi-court"];
      expect(rec.outcome).toBe(c);
      expect(rec.status).toBe("completed");
      expect(rec.log.some(x=>x.action==="outcome:"+c)).toBe(true);
      s.date=addDays(s.date!,1);s.time="08:00";progressContinuity(w,s);
      expect(rec.outcome).toBe(c);
      endings.add(s.messages.kakao.filter(x=>x.meta.eventId==="qi-court").at(-1)!.body);
    }
    expect(endings.size).toBe(4);
  });
  it("outgoing text-entry field is never required to progress a branch",()=>{
    const {w,s}=start();
    const options=continuityChoices(s.continuity,"祁野");
    expect(options.map(x=>x.code)).toEqual([
      "qi-court:accept","qi-court:decline","qi-court:postpone","qi-court:remote",
    ]);
    const after=continuityAction(s,w,"祁野",options[0].code);
    expect(after.continuity!.events["qi-court"].status).toBe("scheduled");
  });
  it("an accepted but missed engagement lowers trust and never creates a fake scene or image",()=>{
    const {w,s:initial}=start(); let s=initial;
    s=action(w,s,"祁野","qi-court:accept");
    s.date=addDays(s.continuity!.events["qi-court"].dueDate,1);s.time="09:00";
    progressContinuity(w,s);
    expect(s.continuity!.events["qi-court"].status).toBe("missed");
    expect(s.continuity!.events["qi-court"].playerJoined).toBe(false);
    expect(s.variables.z3_trust_qi).toBe(41);
    expect(s.messages.kakao.some(x=>x.body.includes("沒有等到妳"))).toBe(true);
    expect(s.messages.kakao.some(x=>x.meta.eventId==="qi-court"&&x.kind==="image")).toBe(false);
  });
  it("shared calendar blocks overlapping accepted invitations across characters",()=>{
    const {w,s:initial}=start(); let s=initial;
    s=action(w,s,"祁野","qi-court:accept");
    const r=s.continuity!.events["shen-portfolio"];
    r.status="active";r.stage="offer";r.dueDate=s.continuity!.events["qi-court"].dueDate;r.dueTime="19:00";
    const next=action(w,s,"沈硯舟","shen-portfolio:accept");
    expect(next.continuity!.events["shen-portfolio"].status).toBe("active");
    expect(next.continuity!.events["shen-portfolio"].log.some(x=>x.action==="calendar-conflict")).toBe(true);
    expect(next.continuity!.events["shen-portfolio"].playerJoined).toBe(false);
  });
  it("NPC can cancel a confirmed appointment and keeps its own agency",()=>{
    const {w,s:initial}=start(); let s=initial;
    s=action(w,s,"祁野","qi-court:accept");
    s=npcCancel(s,w,"qi-court");
    expect(s.continuity!.events["qi-court"].status).toBe("cancelled");
    expect(s.continuity!.events["qi-court"].promiseOpen).toBe(false);
    expect(s.continuity!.events["qi-court"].playerJoined).toBe(false);
    expect(s.messages.kakao.some(x=>x.body.includes("場地臨時被借走"))).toBe(true);
  });
  it("independent actor knowledge is not telepathically shared with rivals",()=>{
    const {w,s:initial}=start(); let s=initial;
    s=action(w,s,"祁野","qi-court:accept");
    s.date=s.continuity!.events["qi-court"].dueDate;s.time="19:00";progressContinuity(w,s);
    s=action(w,s,"祁野","qi-court:attend");
    s=action(w,s,"祁野","qi-court:investigate");
    expect(s.continuity!.events["qi-court"].knownTo).toContain("祁野");
    expect(s.continuity!.events["qi-court"].knownTo).not.toContain("沈硯舟");
    expect(s.variables.z3_jealousy_shen??0).toBe(0);
  });
  it("Lu receives no unsolicited invitation before consensual private contact",()=>{
    const {w,s}=start();
    s.date=addDays("2026-11-04",8);s.time="12:00";
    progressContinuity(w,s);
    expect(s.continuity!.events["lu-board"].status).toBe("not_started");
    // Explicitly making contact does not create an already-met or already-dated memory.
    s.variables.z3_lu_private_contact=true;
    s.date=addDays("2026-11-04",9);s.time="12:00";progressContinuity(w,s);
    expect(s.continuity!.events["lu-board"].playerJoined).toBe(false);
  });
  it("does not alter other game versions or overwrite old save data",()=>{
    const w=createWork();const s=initialRuntime(w);progressContinuity(w,s);
    expect(s.continuity).toBeUndefined();
    expect(s.messages).toEqual({});
  });
});
