import { makeItem, type Runtime, type Work } from "../schema";
import { ARCS, ARC_BY_ID, type Arc, type Actor } from "./continuityData";

export type EventStatus = "not_started"|"scheduled"|"active"|"completed"|"declined"|"missed"|"cancelled"|"postponed"|"expired";
type Step = "offer"|"scheduled"|"arrival"|"scene"|"closed";
export type EventTrace = { at: string; action: string; status: EventStatus; detail: string };
export type EventRecord = {
 id:string; actor:Actor; status:EventStatus; stage:Step;
 dependsOn:string[]; next:string[]; dueDate:string; dueTime:string; venue:string;
 playerJoined:boolean; playerChoice:string; npcReaction:string; outcome:string;
 promiseOpen:boolean; afterDate:string; followupSent:boolean; photoId:string;
 relatedActors:string[]; knownTo:string[]; log:EventTrace[];
};
export type ContinuitySave = {
 version:1; startDate:string; lastTick:string;
 events:Record<string,EventRecord>; ledger:EventTrace[]; sequence:number;
};
export type ContextChoice = { code:string; label:string };
const pad=(n:number)=>String(n).padStart(2,"0");
const validDate=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v);
export function addDays(day:string,n:number):string{
 const date=new Date(day+"T12:00:00Z");
 if(Number.isNaN(date.getTime()))return day;
 date.setUTCDate(date.getUTCDate()+n);
 return date.toISOString().slice(0,10);
}
function diffDays(a:string,b:string):number{
 const aa=Date.parse(a+"T12:00:00Z"),bb=Date.parse(b+"T12:00:00Z");
 return Number.isFinite(aa)&&Number.isFinite(bb)?Math.round((aa-bb)/86400000):0;
}
function timeOf(s:Runtime){return (s.date??"")+" "+s.time;}
function modify(s:Runtime,record:EventRecord,status:EventStatus,action:string,detail:string){
 record.status=status;
 const entry={at:timeOf(s),action,status,detail};
 record.log.push(entry);
 s.continuity!.ledger.push(entry);
 if(s.continuity!.ledger.length>250)s.continuity!.ledger.splice(0,s.continuity!.ledger.length-250);
}
function send(s:Runtime,actor:Actor,body:string,record:EventRecord,opts:{outgoing?:boolean;media?:string;context?:string}={}){
 const n=++s.continuity!.sequence;
 const item=makeItem({id:"z3-cont-"+record.id+"-"+n,title:actor,sender:opts.outgoing?"我":actor,body,
  outgoing:!!opts.outgoing,time:timeOf(s),kind:opts.media?"image":"text",media:opts.media??"",
  meta:{continuity:"true",eventId:record.id,context:opts.context??"",author:actor}});
 s.messages.kakao=[...(s.messages.kakao??[]),item];
 if(!opts.outgoing)s.notifications.push(actor+"："+body.slice(0,65));
 return item;
}
function adjust(s:Runtime,actor:Actor,dimension:"trust"|"affection"|"jealousy",value:number){
 const key=({祁野:"qi",沈硯舟:"shen",裴知聿:"pei",顧時安:"gu",陸沉川:"lu"} as Record<string,string>)[actor];
 if(!key)return;
 const field="z3_"+dimension+"_"+key;
 const old=typeof s.variables[field]==="number"?s.variables[field] as number:0;
 s.variables[field]=Math.max(0,Math.min(100,old+value));
}
function nextFor(arc:Arc){
 const related=ARCS.filter(x=>x.actor===arc.actor),i=related.findIndex(x=>x.id===arc.id);
 return related[i+1]?[related[i+1].id]:[];
}
function photoContext(arc:Arc,rec:EventRecord,s:Runtime){
 if(!arc.photo)return;
 const photo=arc.photo;
 send(s,arc.actor,photo.context+"。"+photo.observation,rec);
 const item=send(s,arc.actor,"現場拍攝的照片",rec,{media:photo.media,context:photo.clue});
 rec.photoId=item.id;
 rec.knownTo=Array.from(new Set([...rec.knownTo,"玩家"]));
}
function followup(s:Runtime,arc:Arc,r:EventRecord){
 if(r.followupSent||!r.afterDate||diffDays(s.date??"",r.afterDate)<0)return;
 r.followupSent=true;
 const text=["declined","expired","missed"].includes(r.outcome)?arc.solo
   :r.outcome==="cancelled"?arc.cancelled
   :r.outcome==="remote"?"妳上次說願意聽我說，我記得。"+arc.consequences.support
   :r.outcome==="attended_silent"?"上次的事我自己繼續處理了。"+arc.consequences.leave
   :arc.consequences[r.outcome as keyof Arc["consequences"]]??arc.solo;
 send(s,arc.actor,text,r);
 modify(s,r,r.status,"background-followup","選擇 "+(r.playerChoice||"無")+"；實際後續已送達。");
}
function ready(s:Runtime,rec:EventRecord,arc:Arc){
 rec.status="active";rec.stage="offer";rec.dueDate=addDays(s.date!,2);rec.dueTime=arc.hour;
 rec.venue=arc.venue;rec.promiseOpen=false;rec.knownTo=[arc.actor,"玩家"];
 modify(s,rec,"active","offer","邀約 "+arc.venue+"，候選時間 "+rec.dueDate+" "+rec.dueTime);
 const previous=rec.dependsOn.map(id=>s.continuity?.events[id]).find(Boolean);
 const opening=previous?.outcome==="investigate"?"上次妳問的事情後來有進展。"
  :previous?.outcome==="support"?"上次妳提出的協助我有記得。"
  :previous?.outcome==="boundary"?"我記得妳希望保持私人界線。這次只是公開活動，可以自由決定。"
  :previous?.outcome==="leave"?"上次的事我自己處理了，這回有新的安排。"
  :previous?.status==="declined"?"上次妳沒空，我有照自己的行程去。這次還是由妳決定。"
  :previous?.status==="missed"?"之前約定沒見到妳。新活動我會再確認，並不預設妳會到。"
  :previous?.outcome==="remote"?"上次雖然沒見面，謝謝妳願意聽我說。"
  :"";
 send(s,arc.actor,opening+arc.invitation+"\n預計："+rec.dueDate+" "+arc.hour+"｜"+arc.venue,rec);
}
export function isBrick3(w:Work){return w.title.trim()==="磚3";}
function bootstrap(s:Runtime){
 if(s.continuity)return;
 const day=validDate(s.date??"")?s.date!:"2026-11-07";
 const events=Object.fromEntries(ARCS.map(a=>[a.id,{
   id:a.id,actor:a.actor,status:"not_started" as EventStatus,stage:"closed" as Step,
   dependsOn:ARCS.filter(x=>x.actor===a.actor&&x.offset<a.offset).slice(-1).map(x=>x.id),
   next:nextFor(a),dueDate:"",dueTime:a.hour,venue:a.venue,playerJoined:false,playerChoice:"",
   npcReaction:"",outcome:"",promiseOpen:false,afterDate:"",followupSent:false,
   photoId:"",relatedActors:[],knownTo:[],log:[]
 } satisfies EventRecord]));
 s.continuity={version:1,startDate:day,lastTick:"",events,ledger:[],sequence:0};
}
function ongoing(r:EventRecord){return ["active","scheduled","postponed"].includes(r.status);}
function canOpen(rec:EventRecord,m:ContinuitySave){
 return rec.dependsOn.every(id=>{
   const parent=m.events[id];
   return parent&&!ongoing(parent)&&parent.status!=="not_started"&&parent.followupSent;
 });
}
/** Drive autonomous stories from game date and clock, without opening conversations. */
export function progressContinuity(w:Work,s:Runtime):void{
 if(!isBrick3(w)||!validDate(s.date??""))return;
 bootstrap(s);
 const m=s.continuity!,hour=Number(s.time.slice(0,2));
 if(!Number.isInteger(hour))return;
 const tick=(s.date??"")+"T"+pad(hour);
 if(m.lastTick===tick)return;
 m.lastTick=tick;
 for(const arc of ARCS){
  const r=m.events[arc.id];
  if(r.afterDate)followup(s,arc,r);
  if(r.status==="active"&&r.stage==="offer"&&diffDays(s.date!,r.dueDate)>0){
   r.stage="closed";r.outcome="expired";r.afterDate=addDays(s.date!,1);
   modify(s,r,"expired","unanswered","玩家未回應的邀約到期，NPC自行活動");
   send(s,arc.actor,arc.solo,r);r.followupSent=true;
  }
  if((r.status==="scheduled"||r.status==="postponed")&&r.stage==="scheduled"){
   if(diffDays(s.date!,r.dueDate)>0){
    r.promiseOpen=false;r.outcome="missed";r.npcReaction="玩家已答應但未出席";
    r.afterDate=addDays(s.date!,1);r.stage="closed";
    modify(s,r,"missed","missed","已答應的時間經過，沒有收到玩家出席確認");
    adjust(s,arc.actor,"trust",-9);
    send(s,arc.actor,"上次約好的 "+r.dueDate+" "+r.dueTime+"，我沒有等到妳。妳沒事吧？我先處理自己的行程了。",r);
   }else if(diffDays(s.date!,r.dueDate)===0&&s.time>=r.dueTime){
    r.stage="arrival";r.npcReaction="NPC按時赴約，玩家仍須自行選擇是否出席";
    modify(s,r,"active","npc-arrived","NPC按自己的行程抵達，尚未確認玩家在場");
    send(s,arc.actor,"我到"+r.venue+"了。之前約的是今天 "+r.dueTime+"，妳有要過來嗎？不方便可以直接說。",r);
   }
  }
  if(r.status==="active"&&r.stage==="arrival"&&diffDays(s.date!,r.dueDate)>0){
   r.stage="closed";r.promiseOpen=false;r.outcome="missed";r.afterDate=addDays(s.date!,1);
   modify(s,r,"missed","no-show","玩家未確認出席，約定已過");
   adjust(s,arc.actor,"trust",-9);
   send(s,arc.actor,"昨天妳沒來，我不知道發生什麼事。先不追問，但我會記得這次失約。",r);
  }
  if(r.status==="active"&&r.stage==="scene"&&diffDays(s.date!,r.dueDate)>0){
   r.stage="closed";r.promiseOpen=false;r.outcome="attended_silent";r.afterDate=s.date!;
   modify(s,r,"completed","scene-closed","玩家確實到場，卻沒有替玩家決定現場態度");
   followup(s,arc,r);
  }
 }
 const days=diffDays(s.date!,m.startDate);
 const already=Object.values(m.events).some(r=>r.log.some(x=>x.action==="offer"&&x.at.slice(0,10)===s.date));
 if(already)return;
 const candidate=ARCS.find(a=>a.offset<=days&&m.events[a.id].status==="not_started"&&canOpen(m.events[a.id],m)
   && (a.actor!=="陸沉川"||s.variables.z3_lu_private_contact===true)
   && (a.actor!=="裴知聿"||s.variables.pei_no_contact!==true));
 if(candidate)ready(s,m.events[candidate.id],candidate);
}
function occupancy(m:ContinuitySave,r:EventRecord,date:string,hour:string){
 return Object.values(m.events).filter(other=>other.id!==r.id&&other.dueDate===date&&other.dueTime===hour
 && (other.status==="scheduled"||other.status==="postponed"||(other.status==="active"&&["arrival","scene"].includes(other.stage))));
}
function free(m:ContinuitySave,r:EventRecord,date:string){return occupancy(m,r,date,r.dueTime).length===0;}
function updateAction(s:Runtime,r:EventRecord,text:string){
 send(s,r.actor,text,r,{outgoing:true});r.playerChoice=text;
}
export function continuityChoices(memory:ContinuitySave|undefined,thread:string):ContextChoice[]{
 if(!memory)return [];
 const records=Object.values(memory.events).filter(r=>r.actor===thread);
 const rec=records.find(r=>r.status==="active"&&r.stage==="scene")
   ??records.find(r=>r.status==="active"&&r.stage==="arrival")
   ??records.find(r=>r.status==="active"&&r.stage==="offer")
   ??records.find(r=>["scheduled","postponed"].includes(r.status)&&r.stage==="scheduled");
 if(!rec)return [];
 const item=(action:string,label:string)=>({code:rec.id+":"+action,label});
 if(rec.stage==="offer")return [item("accept","接受，保留這個時間"),item("decline","拒絕邀約，讓對方自行安排"),item("postpone","提出改期並確認新日期"),item("remote","不赴約，但願意遠端關心進展")];
 if(rec.stage==="scheduled")return [item("cancel","取消這次約定"),item("postpone","將活動改到其他日期"),item("shift","保留日期，將時間往後調"),item("prepare","事先討論現場重點與分工")];
 if(rec.stage==="arrival")return [item("attend","我已到場，參加活動"),item("late","通知會晚一點到"),item("postpone","現在無法赴約，提出改天"),item("cancel","今天不去了，向對方說明")];
 const arc=ARC_BY_ID.get(rec.id)!;
 return [item("investigate",arc.question),item("support",arc.support),item("boundary",arc.limit),item("leave","這件事先讓你自己處理")];
}
export function continuityAction(previous:Runtime,w:Work,thread:string,command:string):Runtime{
 if(!isBrick3(w)||!previous.continuity)return previous;
 const separator=command.lastIndexOf(":");
 if(separator<0)return previous;
 const id=command.slice(0,separator),choice=command.slice(separator+1);
 const arc=ARC_BY_ID.get(id);
 if(!arc||arc.actor!==thread||!continuityChoices(previous.continuity,thread).some(x=>x.code===command))return previous;
 const s=structuredClone(previous),r=s.continuity!.events[id],m=s.continuity!;
 const put=(text:string)=>updateAction(s,r,text);
 if(choice==="remote"&&r.stage==="offer"){
  put("這次不去現場，但我願意聽你說後續。");
  r.stage="closed";r.playerJoined=false;r.promiseOpen=false;
  r.playerChoice="remote";r.outcome="remote";r.afterDate=addDays(s.date!,1);
  r.npcReaction="接受遠端關心，並自行參與活動";
  modify(s,r,"completed","remote-support","不發生現場相遇，改由後續私訊保持聯絡");
  adjust(s,arc.actor,"trust",3);
  send(s,arc.actor,"可以。妳不用為這件事特地跑一趟，我會照自己的安排處理，之後再跟妳說。",r);
  return s;
 }
 if(choice==="shift"&&r.stage==="scheduled"){
  const [h,min]=r.dueTime.split(":").map(Number);
  const time=String(Math.min(h+1,22)).padStart(2,"0")+":"+String(min).padStart(2,"0");
  if(time===r.dueTime){send(s,arc.actor,"已經是晚上比較晚的時段了，改天或取消都可以。",r);return s;}
  if(!occupancy(m,r,r.dueDate,time).length){
   put("日期可以，但希望見面時間往後一點。");
   r.dueTime=time;r.playerChoice="time-shifted";r.npcReaction="同意同日改時間";
   modify(s,r,r.status,"time-shift","保留 "+r.dueDate+"，見面時間改至 "+time);
   send(s,arc.actor,"可以，我把同一天的時間改成 "+time+"。不會在原本的時間等妳。",r);
  }else{
   put("如果晚一點會衝到別的行程，我們就改天。");
   send(s,arc.actor,"那個時間妳已有安排，我們先保留其他選擇，不會替妳答應兩場活動。",r);
   modify(s,r,r.status,"time-conflict","改時間與既有約定衝突，仍保留原約定");
  }
  return s;
 }
 if(choice==="prepare"&&r.stage==="scheduled"){
  put("赴約之前，我想先知道這次活動最需要注意的重點。");
  r.playerChoice="prepared";r.npcReaction="提前分享事實背景";
  s.variables["z3_cont_prepared_"+id]=true;
  adjust(s,arc.actor,"trust",2);
  modify(s,r,r.status,"prepared","玩家預先詢問細節；後續現場依已知資訊互動");
  send(s,arc.actor,"主要是這件事："+arc.invitation+" 妳不需要替我解決，我們見面再看具體情況。",r);
  return s;
 }
 if(choice==="accept"&&r.stage==="offer"){
  if(!free(m,r,r.dueDate)){
   const occupied=occupancy(m,r,r.dueDate,r.dueTime)[0];
   put("我好像跟別人約到同一時段，先確認一下。");
   send(s,arc.actor,"原來那天妳已經有約了。先處理妳跟"+occupied.actor+"的安排，或我們改天。",r);
   modify(s,r,"active","calendar-conflict","與 "+occupied.id+" 時間衝突；沒有自動重複赴約");
   return s;
  }
  put("好，這個時間我可以，先約好。");
  r.stage="scheduled";r.promiseOpen=true;r.playerChoice="accepted";r.npcReaction="確認約定";
  modify(s,r,"scheduled","accept",r.dueDate+" "+r.dueTime+" "+r.venue+" 雙方確認");
  send(s,arc.actor,"好，記下了。"+r.dueDate+" "+r.dueTime+" 見。臨時有事先說。",r);
  return s;
 }
 if(choice==="postpone"&&["offer","scheduled","arrival"].includes(r.stage)){
  let next=addDays(r.dueDate||s.date!,2),safety=0;
  while(!free(m,r,next)&&safety++<15)next=addDays(next,1);
  put("這個時間我不方便，可以改天嗎？");
  r.dueDate=next;r.stage="scheduled";r.promiseOpen=true;r.playerChoice="postponed";
  r.npcReaction="同意重新確認日期";
  modify(s,r,"postponed","reschedule","改約 "+next+" "+r.dueTime+"，原約定不再有效");
  send(s,arc.actor,"那改成 "+next+" "+r.dueTime+"，一樣在"+r.venue+"。不會照原本那天等妳。",r);
  return s;
 }
 if((choice==="decline"&&r.stage==="offer")||(choice==="cancel"&&["scheduled","arrival"].includes(r.stage))){
  put(choice==="decline"?"這次我不參加，你照自己的行程就好。":"抱歉，我今天不能赴約了。");
  r.stage="closed";r.promiseOpen=false;r.playerChoice=choice;r.outcome=choice==="decline"?"declined":"cancelled";
  r.afterDate=addDays(s.date!,1);r.npcReaction="尊重拒絕，不預設玩家在場";
  modify(s,r,choice==="decline"?"declined":"cancelled",choice,"玩家沒有出席，NPC維持獨立生活");
  send(s,arc.actor,choice==="decline"?"知道了，我會照原本計畫去，不用因為我改行程。":"好，收到。妳沒來我不會當成妳有出席。",r);
  return s;
 }
 if(choice==="late"&&r.stage==="arrival"){
  put("我會晚一點到，先跟你說。");
  r.npcReaction="知道玩家會遲到，仍未確認見面";r.playerChoice="late";
  adjust(s,arc.actor,"trust",-2);
  modify(s,r,"active","late","NPC被通知遲到，沒有強制記錄玩家到場");
  send(s,arc.actor,"知道了。我會在附近等一會，有變動再說。",r);
  return s;
 }
 if(choice==="attend"&&r.stage==="arrival"){
  put("我到"+r.venue+"了，現在可以見面。");
  r.stage="scene";r.playerJoined=true;r.promiseOpen=false;r.playerChoice="attended";
  r.npcReaction="已收到玩家到場確認";
  r.knownTo=Array.from(new Set([...r.knownTo,"玩家"]));
  modify(s,r,"active","attend","玩家在 "+r.dueDate+" 到場；場景開始");
  send(s,arc.actor,(s.variables["z3_cont_prepared_"+id]===true?"上次先跟妳說過一些背景。現在現場的狀況是：":"")+arc.scene,r);
  photoContext(arc,r,s);
  return s;
 }
 if(r.stage==="scene"&&["investigate","support","boundary","leave"].includes(choice)){
  const options={investigate:arc.question,support:arc.support,boundary:arc.limit,leave:"這件事你先處理，我暫時不介入。"};
  const reply={investigate:arc.answer,support:"謝謝妳願意說。這件事我會自己想清楚，也會記得妳的意見。",
    boundary:"我明白妳的意思，妳不用替我的問題負責。",leave:"好，我知道。妳先忙，剩下的我自己處理。"};
  put(options[choice as keyof typeof options]);
  send(s,arc.actor,reply[choice as keyof typeof reply],r);
  r.playerChoice=choice;r.outcome=choice;r.stage="closed";
  r.npcReaction=reply[choice as keyof typeof reply];r.afterDate=addDays(s.date!,1);
  if(choice==="investigate"){
   adjust(s,arc.actor,"trust",5);
   if(arc.photo&&!s.clues.includes(arc.photo.clue))s.clues.push(arc.photo.clue);
   if(arc.photo&&r.photoId){
    const photo=s.messages.kakao.find(x=>x.id===r.photoId);
    if(photo&&!(s.messages.photos??[]).some(x=>x.id===r.photoId+"-saved"))
     s.messages.photos=[...(s.messages.photos??[]),{...photo,id:r.photoId+"-saved",title:arc.actor,meta:{...photo.meta,sourceId:r.photoId}}];
   }
  }else if(choice==="support")adjust(s,arc.actor,"trust",7);
  else if(choice==="boundary")adjust(s,arc.actor,"trust",2);
  else adjust(s,arc.actor,"affection",-1);
  modify(s,r,"completed","outcome:"+choice,"事件完成，將於 "+r.afterDate+" 引發不同後續");
  return s;
 }
 return previous;
}
/** NPC can independently cancel an agreed event for a genuine scheduling reason. */
export function npcCancel(previous:Runtime,w:Work,id:string):Runtime{
 if(!isBrick3(w)||!previous.continuity)return previous;
 const arc=ARC_BY_ID.get(id),r=previous.continuity.events[id];
 if(!arc||!r||!["scheduled","postponed"].includes(r.status))return previous;
 const s=structuredClone(previous),rec=s.continuity!.events[id];
 rec.stage="closed";rec.promiseOpen=false;rec.outcome="cancelled";rec.afterDate=addDays(s.date!,1);
 modify(s,rec,"cancelled","npc-cancel","NPC因自身行程取消；不假定玩家赴約");
 send(s,arc.actor,arc.cancelled,rec);
 return s;
}
