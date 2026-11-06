import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { injectBrick3PeiPhotoV5 } from "./brick3-pei-photo-v5.mjs";
const json=JSON.parse(readFileSync(new URL("../docs/brick3-pei-zhiyu-photo-events-v5.json",import.meta.url),"utf8"));
function fixture(){
 return {id:"between-the-lines-b-demo",
  events:Array.from({length:4},(_,i)=>({id:"brick3-photo-pei_zhiyu_v4_10-choice-"+(i+1)+"-reply",type:"action",actions:[],next:[]})),
  chats:[{app:"kakao",title:"裴知聿",participants:["owner","peizhiyu"],messages:[]}],content:{photos:[]},variables:{pei_attraction:70}};
}
test("second ten photos wire 40 distinct KKT branches without gallery side effects",()=>{
 const s=fixture();
 injectBrick3PeiPhotoV5(s,json);
 assert.equal(s.events.filter(e=>/^brick3-photo-pei_zhiyu_v5_\d\d-time$/.test(e.id)).length,10);
 assert.equal(s.chats[0].messages.filter(m=>m.kind==="image").length,10);
 assert.equal(s.chats[0].messages.filter(m=>m.outgoing).length,40);
 assert.equal(s.content.photos.length,0);
 for(let n=1;n<=10;n++){
  const key="brick3-photo-pei_zhiyu_v5_"+String(n).padStart(2,"0");
  const choices=s.events.find(e=>e.id===key+"-options");
  assert.equal(choices.next.length,4);
 }
});
test("L2/L3 depend on explicit prior permission and preserve no-contact boundaries",()=>{
 const s=fixture();injectBrick3PeiPhotoV5(s,json);
 for(const [n,threshold] of [[9,1],[10,2]]){
  const id="brick3-photo-pei_zhiyu_v5_"+String(n).padStart(2,"0")+"-time";
  const e=s.events.find(e=>e.id===id);
  assert.equal(e.conditions.find(c=>c.key==="pei_v4_photo_consent_level").value,threshold);
  assert.ok(e.conditions.some(c=>c.key==="pei_v4_no_suggestive"));
 }
 assert.ok(s.events.every(e=>e.type!=="delay"||e.delayMs<=86400000));
});
test("V5 remains idempotent and isolated to the active Brick3 script",()=>{
 const s=fixture();injectBrick3PeiPhotoV5(s,json);const count=s.events.length;injectBrick3PeiPhotoV5(s,json);assert.equal(s.events.length,count);
 const other=fixture();other.id="other";injectBrick3PeiPhotoV5(other,json);assert.equal(other.events.length,4);
});
