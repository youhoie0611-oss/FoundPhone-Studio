/** 《磚3》裴知聿 V6：30 張照片的動態排程，保留舊版 StoryNode 上限。 */
import authored from "../docs/brick3-pei-zhiyu-photo-events-v6.json";
import {makeItem, type Runtime, type Work} from "./schema";

export type PeiV6Phase="waiting"|"image"|"caption"|"choice"|"reply"|"finished";
export interface PeiPhotoV6State {
 index:number;phase:PeiV6Phase;nextAt:number;selected:number|null;
 sentPhotoIds:string[];skippedPhotoIds:string[];
}
type Scene={
 id:string;photoId:string;imageAssetPath:string;intimacyLevel:string;localTimeWindow:string;
 kktMessages:Array<{kind:string;body?:string}>;
 choices:Array<{text:string;peiReply:string;intent:string}>;
 captureMethod:string;locationId:string;
};
const scenes=authored.events as Scene[];
const NAME="裴知聿", PREFIX="brick3-photo-pei_zhiyu_v6_";
const HARD_STOP=/不要再聯絡|別再聯絡|不想再聯絡|別找我|不要再找我|不要傳任何照片|一張照片都不要|別再傳訊息|停止聯絡/;
function eligible(w:Work,s:Runtime){
 if(w.id!=="between-the-lines-b-demo"||w.mode==="explore"||w.variables.pei_v6_assets_ready!==true)return false;
 if(s.peiAutonomy?.phase==="stopped"||s.variables.pei_v4_stop_all_photos===true)return false;
 if((s.messages.kakao??[]).some(m=>m.title===NAME&&m.outgoing&&HARD_STOP.test(m.body)))return false;
 if(!w.nodes.some(n=>n.id==="brick3-photo-pei_zhiyu_v5_10-time"))return false;
 return [1,2,3,4].some(i=>s.completed.includes("brick3-photo-pei_zhiyu_v5_10-choice-"+i+"-reply"));
}
function clockFits(window:string,clock:string){
 const a=window.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
 if(!a||! /^\d{2}:\d{2}$/.test(clock))return false;
 const minutes=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3));
 const x=minutes(a[1]),y=minutes(a[2]),n=minutes(clock);
 return x<=y?n>=x&&n<=y:n>=x||n<=y;
}
function excluded(s:Runtime,scene:Scene){
 if(scene.intimacyLevel==="L2"||scene.intimacyLevel==="L3"){
  if(s.variables.pei_v4_no_suggestive===true)return true;
  if(Number(s.variables.pei_v4_photo_consent_level??0)<(scene.intimacyLevel==="L2"?2:3))return true;
 }
 if(s.variables.pei_v4_no_selfies===true&&/(selfie|mirror|timer)/.test(scene.captureMethod))return true;
 return false;
}
function deliver(s:Runtime,scene:Scene,suffix:string,body:string,image=false){
 s.messages.kakao??=[];
 const id="pei_v6_"+scene.photoId+"_"+suffix;
 if(s.messages.kakao.some(m=>m.id===id))return;
 s.messages.kakao.push(makeItem({
  id,title:NAME,sender:NAME,body,time:(s.date??"2026-11-06")+" "+s.time,
  kind:image?"image":"text",media:image?scene.imageAssetPath:"",
  meta:{source:"brick3-pei-photo-v6",photoEventId:scene.photoId,photoId:scene.photoId,
   captureMethod:scene.captureMethod,locationId:scene.locationId,photographerId:"pei_zhiyu"}
 }));
 s.ui??={};
 s.ui.scriptedThreadDelivery={...s.ui.scriptedThreadDelivery,[NAME]:s.elapsedMs??0};
 s.notifications.push(image?NAME+"傳來一張照片":NAME+"："+body);
}
function skipBlocked(s:Runtime,st:PeiPhotoV6State){
 while(st.index<scenes.length&&excluded(s,scenes[st.index])){
  const id=scenes[st.index].photoId;
  if(!st.skippedPhotoIds.includes(id))st.skippedPhotoIds.push(id);
  st.index++;
 }
 if(st.index>=scenes.length)st.phase="finished";
}
export function tickPeiPhotoV6(w:Work,s:Runtime):Runtime{
 if(!eligible(w,s))return s;
 if(!s.brick3PeiV6){
  s.brick3PeiV6={index:0,phase:"waiting",nextAt:(s.elapsedMs??0)+21600000,
   selected:null,sentPhotoIds:[],skippedPhotoIds:[]};
  return s;
 }
 const st=s.brick3PeiV6;
 if(st.phase==="choice"||st.phase==="finished")return s;
 const now=s.elapsedMs??0;
 if(now<st.nextAt)return s;
 if(st.phase==="waiting"){
  skipBlocked(s,st);
  if(st.phase==="finished")return s;
  const last=Number((s.ui?.scriptedThreadDelivery??{})[NAME]??-Infinity);
  const reply=Number((s.ui?.lastFreeReply??{})[NAME]??-Infinity);
  if(now-last<120000||now-reply<90000){st.nextAt=now+30000;return s;}
  const scene=scenes[st.index];
  if(!clockFits(scene.localTimeWindow,s.time))return s;
  deliver(s,scene,"opening",scene.kktMessages[0].body??"");
  st.phase="image";st.nextAt=now+1700;
 }else if(st.phase==="image"){
  const scene=scenes[st.index];
  deliver(s,scene,"photo","照片",true);
  if(!st.sentPhotoIds.includes(scene.photoId))st.sentPhotoIds.push(scene.photoId);
  st.phase="caption";st.nextAt=now+1900;
 }else if(st.phase==="caption"){
  const scene=scenes[st.index];deliver(s,scene,"caption",scene.kktMessages[2].body??"");
  const options=scene.choices.map((c,i)=>({label:c.text,target:PREFIX+String(st.index+1).padStart(2,"0")+"-choice-"+(i+1)}));
  s.choices=s.choices.filter(c=>!c.target.startsWith(PREFIX)).concat(options);
  st.phase="choice";
 }else if(st.phase==="reply"){
  const scene=scenes[st.index],choice=scene.choices[st.selected??0];
  deliver(s,scene,"reply_"+st.selected,choice.peiReply);
  if(choice.intent==="boundary"&&(scene.intimacyLevel==="L2"||scene.intimacyLevel==="L3")){
   s.variables.pei_v4_no_suggestive=true;s.variables.pei_v4_photo_consent_level=1;
  }
  s.variables.pei_v6_last_photo=scene.photoId;
  s.variables.pei_v6_last_player_reaction=choice.intent;
  st.index++;st.selected=null;
  st.phase=st.index<scenes.length?"waiting":"finished";
  st.nextAt=now+(scene.intimacyLevel==="L3"?96:48)*3600000;
 }
 return s;
}
export function choosePeiPhotoV6(_w:Work,previous:Runtime,target:string):Runtime|null{
 const found=target.match(/^brick3-photo-pei_zhiyu_v6_(\d{2})-choice-([1-4])$/);
 if(!found)return null;
 const state=previous.brick3PeiV6;
 if(!state||state.phase!=="choice"||state.index+1!==Number(found[1])||
   !previous.choices.some(c=>c.target===target))return previous;
 const s=structuredClone(previous),st=s.brick3PeiV6!;
 const selected=Number(found[2])-1,scene=scenes[st.index];
 s.messages.kakao??=[];
 s.messages.kakao.push(makeItem({id:"pei_v6_"+scene.photoId+"_out_"+selected,title:NAME,
  sender:"我",outgoing:true,body:scene.choices[selected].text,
  time:(s.date??"2026-11-06")+" "+s.time,meta:{source:"brick3-pei-photo-v6",photoEventId:scene.photoId}}));
 st.selected=selected;st.phase="reply";st.nextAt=(s.elapsedMs??0)+2400;
 s.choices=s.choices.filter(c=>!c.target.startsWith(PREFIX));
 return s;
}
export function dismissPeiPhotoV6(s:Runtime,thread:string):void{
 if(thread!==NAME||!s.brick3PeiV6||s.brick3PeiV6.phase!=="choice")return;
 const st=s.brick3PeiV6,photoId=scenes[st.index].photoId;
 if(!st.skippedPhotoIds.includes(photoId))st.skippedPhotoIds.push(photoId);
 s.choices=s.choices.filter(c=>!c.target.startsWith(PREFIX));
 st.index++;st.phase=st.index<scenes.length?"waiting":"finished";
 st.nextAt=(s.elapsedMs??0)+48*3600000;
}
