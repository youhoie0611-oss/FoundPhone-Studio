import { describe, it, expect } from "vitest";
import { initialRuntime, type Runtime } from "../schema";
import { createWork } from "../demo";
import { overnightAction, overnightPanelFor, progressOvernight } from "./overnight";

function fresh() {
  const s=initialRuntime(createWork());
  s.date="2026-11-06";s.time="22:10";
  for(const k of ["shen","pei","qi","gu","lu"]){
    s.variables["z3_affection_"+k]=24;
    s.variables["z3_trust_"+k]=42;
    s.variables["z3_relation_"+k]="acquaintance";
  }
  s.variables.z3_lu_private_contact=true;
  return s;
}
function sleep(s:Runtime,name:string) {
  const offer=overnightAction(s,name,"invite");
  const accepted=overnightAction(offer,name,"accept");
  return overnightAction(accepted,name,"stay");
}
describe("磚3 五位男主過夜與床伴",()=>{
  it("five distinct men require player confirmation before any overnight happens",()=>{
    for(const [name,k] of [["沈硯舟","shen"],["裴知聿","pei"],["祁野","qi"],["顧時安","gu"],["陸沉川","lu"]]){
      const offer=overnightAction(fresh(),name,"invite");
      expect(offer.variables["z3_ov_night_"+k]).not.toBe(true);
      const accepted=overnightAction(offer,name,"accept");
      expect(accepted.variables["z3_ov_night_"+k]).not.toBe(true);
      const stayed=overnightAction(accepted,name,"stay");
      expect(stayed.variables["z3_ov_night_"+k]).toBe(true);
      expect(stayed.variables["z3_ov_status_"+k]).toBe("fwb");
    }
  });
  it("Lu Chenchuan's overnight dialogue follows the vice-president canon",()=>{
    const s=fresh();
    const invited=overnightAction(s,"陸沉川","invite");
    const dialog=invited.messages.kakao?.filter(x=>x.sender==="陸沉川").map(x=>x.body).join(" ")??"";
    expect(dialog).toContain("職位");
    expect(dialog).not.toMatch(/會館|男公關|模特兒|費用|拍攝|陪酒/);
  });
  it("a refused NPC invitation never assigns an overnight nor relationship",()=>{
    const s=fresh();s.variables.z3_ov_pending_shen="offer";
    const stopped=overnightAction(s,"沈硯舟","decline");
    expect(stopped.variables.z3_ov_night_shen).not.toBe(true);
    expect(stopped.variables.z3_ov_pending_shen).toBe("");
    expect(s.variables.z3_ov_pending_shen).toBe("offer");
  });
  it("first overnight uses affection before that night to classify FWB",()=>{
    const s=fresh();s.variables.z3_affection_shen=50;
    const slept=sleep(s,"沈硯舟");
    expect(slept.variables.z3_ov_status_shen).toBe("fwb");
    expect(slept.variables.z3_affection_shen).toBe(68);
    expect(slept.variables.z3_ov_night_count_shen).toBe(1);
    slept.date="2026-11-07";progressOvernight(slept);
    expect(slept.variables.z3_ov_pending_shen).not.toBe("commit");
  });
  it("NPC sends background invitation without opening KKT",()=>{
    const s=fresh();
    s.date="2026-11-07";progressOvernight(s);
    s.date="2026-11-08";progressOvernight(s);
    expect(s.variables.z3_ov_pending_shen).toBe("offer");
    expect(s.messages.kakao?.some(m=>m.sender==="沈硯舟")).toBe(true);
  });
  it("FWB increase in affection triggers exclusive conversation, not automatic dating",()=>{
    let s=fresh();
    s=sleep(s,"裴知聿");
    s=sleep(s,"裴知聿");
    s=sleep(s,"裴知聿");
    expect(s.variables.z3_ov_status_pei).toBe("fwb");
    s.date="2026-11-07";progressOvernight(s);
    expect(s.variables.z3_ov_pending_pei).toBe("commit");
    expect(s.variables.z3_ov_partner_pei).not.toBe(true);
    const yes=overnightAction(s,"裴知聿","date_yes");
    expect(yes.variables.z3_ov_partner_pei).toBe(true);
  });
  it("secret FWB increases an undisclosed formal partner's suspicion, public consent prevents it",()=>{
    const s=fresh();s.variables.z3_ov_partner_shen=true;s.variables.z3_relation_shen="partner";
    let x=overnightAction(s,"陸沉川","invite");
    x=overnightAction(x,"陸沉川","accept");
    x=overnightAction(x,"陸沉川","stay");
    expect(x.variables.z3_ov_pending_lu).toBe("disclose");
    expect(x.variables.z3_ov_night_lu).not.toBe(true);
    x=overnightAction(x,"陸沉川","secret_yes");
    expect(x.variables.z3_ov_status_lu).toBe("fwb");
    expect(x.variables.z3_ov_suspicion_shen).toBe(22);
    const publicState=fresh();publicState.variables.z3_ov_partner_shen=true;publicState.variables.z3_relation_shen="partner";publicState.variables.z3_ov_open_shen=true;
    const open=sleep(publicState,"陸沉川");
    expect(open.variables.z3_ov_suspicion_shen).toBeUndefined();
  });
  it("someone with firm boundaries can refuse secret intimacy",()=>{
    const s=fresh();s.variables.z3_ov_partner_shen=true;s.variables.z3_relation_shen="partner";
    let x=overnightAction(s,"顧時安","invite");
    x=overnightAction(x,"顧時安","accept");
    x=overnightAction(x,"顧時安","stay");
    x=overnightAction(x,"顧時安","secret_yes");
    expect(x.variables.z3_ov_night_gu).not.toBe(true);
  });
  it("reasonable privacy lowers low suspicion; poor denial hits 100 and triggers showdown",()=>{
    const s=fresh();s.variables.z3_ov_partner_shen=true;s.variables.z3_relation_shen="partner";
    s.variables.z3_ov_pending_shen="suspect";s.variables.z3_ov_suspicion_shen=30;s.variables.z3_ov_rival_shen="lu";
    const calm=overnightAction(s,"沈硯舟","cover");
    expect(calm.variables.z3_ov_suspicion_shen).toBe(17);
    s.variables.z3_ov_suspicion_shen=86;
    const exposed=overnightAction(s,"沈硯舟","deny");
    expect(exposed.variables.z3_ov_suspicion_shen).toBe(100);
    expect(exposed.variables.z3_ov_discovered_shen).toBe(true);
    expect(exposed.variables.z3_ov_pending_shen).toBe("showdown");
  });
  it("the original partner must independently agree to public polyamory",()=>{
    const s=fresh();s.variables.z3_ov_partner_qi=true;s.variables.z3_relation_qi="partner";
    const refused=overnightAction(s,"祁野","ask_open");
    expect(refused.variables.z3_ov_open_qi).not.toBe(true);
    s.variables.z3_trust_qi=85;s.variables.z3_affection_qi=72;
    const approved=overnightAction(s,"祁野","ask_open");
    expect(approved.variables.z3_ov_open_qi).toBe(true);
  });
  it("the UI does not disclose hidden suspicion numbers",()=>{
    const s=fresh();s.variables.z3_ov_suspicion_shen=93;s.variables.z3_ov_pending_shen="suspect";
    const panel=overnightPanelFor(s.variables,"沈硯舟");
    expect(JSON.stringify(panel)).not.toContain("93");
    expect(panel?.items).toHaveLength(4);
  });
});
