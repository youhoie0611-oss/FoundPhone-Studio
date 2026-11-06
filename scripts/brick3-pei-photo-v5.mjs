/** Compiles Pei Zhiyu's second photo set after actual WebP uploads. */
const ROOT="brick3-photo-pei_zhiyu_v5_";
const WIN=["22:00","14:00","16:00","23:00","21:00","18:00","19:30","22:30","20:00","22:45"];
const REFERENCE="brick3-photo-pei_zhiyu_v4_10-choice-";
const DAY=86400000;
const make=(id,type,props={})=>({id,label:id,type,once:true,...props});
const flag=(key,value)=>({type:"variable",key,value});
const unlock=(key)=>({type:"unlock",key,value:true});
const flagKey=n=>"pei_v5_ready_"+String(n).padStart(2,"0");
const pref=n=>ROOT+String(n).padStart(2,"0");
const fixedPath=/^\.\/story-photos\/pei_zhiyu\/pei_zhiyu_[a-z0-9_]+\.webp$/;
function addMessage(chat,id,senderId,body,options={}){
 chat.messages.push({id,senderId,body,time:"21:18",title:"",hidden:true,...options});
}
function cooldown(story,n,days){
 const base=pref(n)+"-cooldown";
 const found=story.events.find(e=>e.id===base);
 if(found)return base;
 for(let i=1;i<=days;i++){
  const id=i===1?base:base+"-"+i;
  const next=i===days?[base+"-ready"]:[base+"-"+(i+1)];
  story.events.push(make(id,"delay",{delayMs:DAY,next}));
 }
 story.events.push(make(base+"-ready","action",{actions:[flag(flagKey(n),true)]}));
 return base;
}
export function injectBrick3PeiPhotoV5(story,manifest){
 if(story.id!=="between-the-lines-b-demo")return story;
 if(story.events.some(e=>e.id===pref(1)+"-time"))return story;
 if(manifest?.batch!=="v5"||!Array.isArray(manifest.events)||manifest.events.length!==10)return story;
 const chat=story.chats.find(c=>c.app==="kakao"&&c.title==="裴知聿");
 const sender=chat?.participants.find(p=>p!=="owner");
 if(!chat||!sender)return story;
 const entries=manifest.events;
 if(entries.some((e,i)=>e.characterId!=="pei_zhiyu"||!fixedPath.test(e.asset)||e.choices?.length!==4||e.chatSequence?.length!==3||e.photoId!==manifest.photos?.[i]?.photoId))return story;
 const anchors=[1,2,3,4].map(n=>story.events.find(e=>e.id===REFERENCE+n+"-reply")).filter(Boolean);
 if(anchors.length!==4)return story;
 const first=cooldown(story,1,3);
 for(const a of anchors){
  a.next??=[];
  if(!a.next.includes(first))a.next.push(first);
 }
 // Saves that completed V4 before these nodes existed can still enter V5
 // on a later midnight tick, without pretending an earlier photo was sent.
 for(let i=1;i<=4;i++)story.events.push(make(pref(1)+"-retro-"+i,"event",{
  event:"time",target:"00:00",
  conditions:[{key:"completed:"+REFERENCE+i+"-reply",op:"eq",value:true},{key:flagKey(1),op:"neq",value:true}],
  next:[first]
 }));
 entries.forEach((entry,i)=>{
  const n=i+1,p=pref(n),day=entry.intimacyLevel;
  const checks=[
   {key:flagKey(n),op:"eq",value:true},
   {key:"pei_v4_contact_active",op:"eq",value:true},
   {key:"pei_v4_stop_all_photos",op:"neq",value:true}
  ];
  if(day==="L2"||day==="L3"){
   checks.push({key:"pei_v4_no_suggestive",op:"neq",value:true});
   checks.push({key:"pei_v4_photo_consent_level",op:"gt",value:day==="L2"?1:2});
  }
  if(entry.captureMethod.includes("selfie")){
   checks.push({key:"pei_v4_no_selfies",op:"neq",value:true});
  }
  story.events.push(make(p+"-time","event",{event:"time",target:WIN[i],conditions:checks,next:[p+"-open"]}));
  const photoEventId="pei_zhiyu_v5_"+String(n).padStart(2,"0");
  const meta={source:"brick3-pei-photo-v5",photoEventId};
  addMessage(chat,p+"-opening",sender,entry.chatSequence[0].body,{meta});
  addMessage(chat,p+"-picture",sender,"照片",{kind:"image",media:entry.asset,meta:{...meta,photoId:entry.photoId,photographerId:"pei_zhiyu",captureMethod:entry.captureMethod}});
  addMessage(chat,p+"-caption",sender,entry.chatSequence[2].body,{meta});
  story.events.push(make(p+"-open","action",{
   actions:[unlock(p+"-opening"),{type:"notification",key:"",value:"裴知聿："+entry.chatSequence[0].body}],
   next:[p+"-image-wait"]
  }));
  story.events.push(make(p+"-image-wait","delay",{delayMs:1700,next:[p+"-image-arrive"]}));
  story.events.push(make(p+"-image-arrive","action",{actions:[unlock(p+"-picture")],next:[p+"-caption-wait"]}));
  story.events.push(make(p+"-caption-wait","delay",{delayMs:1900,next:[p+"-caption-arrive"]}));
  story.events.push(make(p+"-caption-arrive","action",{actions:[unlock(p+"-caption")],next:[p+"-options"]}));
  const ids=entry.choices.map((_,i)=>p+"-choice-"+(i+1));
  story.events.push(make(p+"-options","choice",{next:ids}));
  entry.choices.forEach((choice,j)=>{
   const id=ids[j];
   addMessage(chat,id+"-out","owner",choice.playerText,{outgoing:true,meta:{source:"brick3-pei-photo-v5"}});
   addMessage(chat,id+"-in",sender,choice.peiReply,{meta:{source:"brick3-pei-photo-v5"}});
   const actions=[unlock(id+"-out"),flag("pei_v5_last_photo_choice",photoEventId+":"+(j+1))];
   if(choice.intent==="boundary")actions.push(flag("pei_v4_no_suggestive",true),flag("pei_v4_photo_consent_level",1));
   story.events.push(make(id,"action",{label:choice.playerText,actions,next:[id+"-wait"]}));
   story.events.push(make(id+"-wait","delay",{delayMs:2200,next:[id+"-reply"]}));
   story.events.push(make(id+"-reply","action",{
    actions:[unlock(id+"-in")],
    next:n<10?[cooldown(story,n+1,2)]:[]
   }));
  });
 });
 return story;
}
