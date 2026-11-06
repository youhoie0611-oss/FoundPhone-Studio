import { makeItem, type Runtime, type Work } from "../schema";
import { completeDate, type DateLead } from "./dateAftermath";

export const dateLeads = ["shen", "pei", "qi", "gu", "lu"] as const;
const names: Record<DateLead, string> = { shen:"沈硯舟", pei:"裴知聿", qi:"祁野", gu:"顧時安", lu:"陸沉川" };
const value = (s:Runtime,k:string) => Number(s.variables[k] ?? 0) || 0;
const stage = (s:Runtime,k:DateLead) => String(s.variables[`z3_date_stage_${k}`] ?? "");
const put = (s:Runtime,k:DateLead,v:string) => {s.variables[`z3_date_stage_${k}`] = v;};
const note = (s:Runtime,k:DateLead,body:string,player=false) => {
 const id=`z3-date-chat-${k}-${value(s,"z3_date_seq")+1}`;
 s.variables.z3_date_seq=value(s,"z3_date_seq")+1;
 s.messages={...s.messages,kakao:[...(s.messages.kakao??[]),makeItem({id,title:names[k],sender:player?"我":names[k],outgoing:player,body,time:`${s.date??"2026-11-07"} ${s.time}`})]};
 if(!player)s.notifications.push(`${names[k]}：${body}`);
};
const dialog:Record<DateLead,{touch:string;walk:string;home:string}>={
 shen:{touch:"走到一半，他的手背輕輕碰上妳的手背，抬眼看妳。",walk:"要不要一起走回去？我還想跟妳聊一會。",home:"到家了。今天真的過得很快。"},
 pei:{touch:"他伸手替妳擋開人潮，手停在妳身旁，沒有擅自握住。",walk:"要我送妳回去嗎？如果妳願意的話。",home:"已經到了。妳不用急著說再見。"},
 qi:{touch:"他走在妳旁邊，手背碰到妳時沒有立刻移開。",walk:"走吧，我送妳。還是妳想再繞一圈？",home:"到了。妳今天倒是比我想的還能逛。"},
 gu:{touch:"他走近一步，手背輕碰妳，隨即留意妳的反應。",walk:"如果妳不介意，我陪妳走回去。",home:"到家了，今天謝謝妳。"},
 lu:{touch:"他放慢步伐，手背偶爾擦過妳的手，沒有急著越過界線。",walk:"我送妳回去，還是妳想再散散步？",home:"到家了。今天和妳相處得很愉快。"}
};
export const dateStages:Record<string,{code:string;label:string;min?:number}[]>={
 touch:[{code:"ignore",label:"裝作沒發現"},{code:"accept",label:"回應他的靠近"},{code:"decline",label:"稍微拉開距離"},{code:"flirt",label:"主動回撩",min:20}],
 return:[{code:"ride",label:"讓他送我回家"},{code:"walk",label:"一起散步回去"},{code:"alone",label:"自己回家"},{code:"initiative",label:"主動牽住他的手",min:40}],
 doorstep:[{code:"bye",label:"道別"},{code:"invite",label:"邀請他進屋坐坐"},{code:"chat",label:"再聊一會"},{code:"kiss",label:"主動親吻",min:60}],
 inside:[{code:"snack",label:"一起煮宵夜"},{code:"talk",label:"坐下來聊天"},{code:"closer",label:"主動靠近",min:40},{code:"night",label:"詢問他是否願意留下過夜",min:60}],
 inside_after:[{code:"bye",label:"送他離開"},{code:"talk",label:"再聊一會"},{code:"night",label:"討論過夜與彼此界線",min:60},{code:"kiss",label:"主動親吻",min:60}]
};
export function dateOptions(s:Runtime,k:DateLead) {
 const affection=value(s,`z3_affection_${k}`);
 return (dateStages[stage(s,k)]??[]).filter(x=>affection>=(x.min??0));
}
/** Trigger only on an upward crossing of an authored affection milestone. */
export function dateAffectionChanged(previous:Runtime,k:DateLead,oldValue:number):Runtime {
 const affection=value(previous,`z3_affection_${k}`);
 const milestone=[20,40,60,80].find(t=>oldValue<t&&affection>=t&&!previous.variables[`z3_date_milestone_${k}_${t}`]);
 if(!milestone||stage(previous,k))return previous;
 const s=structuredClone(previous);
 s.variables[`z3_date_milestone_${k}_${milestone}`]=true;
 s.variables[`z3_date_active_${k}`]=`${k}_aff${milestone}`;
 put(s,k,"touch");
 note(s,k,`有空嗎？想約妳出去走走。`);
 note(s,k,affection>=40?"他走在妳身邊，慢慢朝妳伸出手。":dialog[k].touch);
 return s;
}
export function dateChoose(previous:Runtime,w:Work,k:DateLead,code:string):Runtime {
 const current=stage(previous,k),options=dateOptions(previous,k);
 if(!options.some(x=>x.code===code))return previous;
 const s=structuredClone(previous),affection=value(s,`z3_affection_${k}`);
 const responses:Record<string,string>={
 ignore:"他察覺妳沒有回應，便自然地繼續走著。",accept:"他看見妳的回應，笑意明顯了一點。",
 decline:"他收回手，留出妳舒服的距離。",flirt:"他愣了一瞬，隨即笑著回應妳。",
 ride:"好，我送妳到家。",walk:dialog[k].walk,alone:"好，到家跟我說一聲。",
 initiative:"他握住妳伸來的手，配合妳的步伐。",bye:"晚安，下次見。",
 invite:"可以，我坐一會就好。",chat:"好，我還有時間。",
 kiss:"他確認妳的意思後，輕輕回吻。",
 snack:"我來幫忙，妳負責指揮。",talk:"好，我想聽妳說說今天的事。",
 closer:"他靠近一些，仍留意妳是否願意。",night:"我們先把彼此的想法和界線說清楚。"
 };
 const player:Record<string,string>={ignore:"我裝作沒發現。",accept:"我輕輕回應他的靠近。",decline:"我暫時不想這麼親密。",flirt:"我反過來靠近他。",ride:"你送我回家好嗎？",walk:"我們散步回去吧。",alone:"我想自己回去。",initiative:"我主動牽住他的手。",bye:"今天就到這裡，晚安。",invite:"要進來坐一下嗎？",chat:"再聊一會好嗎？",kiss:"我想親你。",snack:"要一起煮點宵夜嗎？",talk:"我們聊聊天吧。",closer:"我想再靠近你一點。",night:"你願意留下來過夜嗎？我們先談清楚。"};
 note(s,k,player[code],true);note(s,k,responses[code]);
 if(current==="touch") {put(s,k,"return");note(s,k,dialog[k].walk);}
 else if(current==="return") {put(s,k,"doorstep");note(s,k,dialog[k].home);}
 else if(current==="doorstep") {
   if(code==="invite"){put(s,k,"inside");}
   else if(code==="chat"){put(s,k,"inside_after");}
   else {put(s,k,"");return completeDate(s,w,k,String(s.variables[`z3_date_active_${k}`]));}
 } else if(current==="inside"||current==="inside_after"){
   if(code==="night"){
     // Consent/overnight module owns the actual transition; never auto-start intimacy.
     s.variables[`z3_date_overnight_offer_${k}`]=true;
     put(s,k,"");
     return completeDate(s,w,k,String(s.variables[`z3_date_active_${k}`]));
   }
   if(code==="bye"){put(s,k,"");return completeDate(s,w,k,String(s.variables[`z3_date_active_${k}`]));}
   put(s,k,"inside_after");
 }
 if(affection<40&&code==="accept")s.variables[`z3_date_soft_touch_${k}`]=true;
 return s;
}
