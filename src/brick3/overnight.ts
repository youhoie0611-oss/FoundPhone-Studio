import { makeItem, type Runtime } from "../schema";

export const NIGHT_KEYS = ["shen", "pei", "qi", "gu", "lu"] as const;
export type NightKey = typeof NIGHT_KEYS[number];
type Profile = { name:string; minimum:number; invite:string; agree:string; doubt:string; morning:string; commit:string; secrecy:string; openTrust:number; clue:string };
const profile:Record<NightKey,Profile>={
  shen:{name:"沈硯舟",minimum:10,invite:"拍攝剛收工。如果妳願意，今晚想不想再多陪我一會，甚至留下來過夜？不方便也沒關係。",agree:"我想好好珍惜今晚，但不希望妳是不好意思拒絕我。",doubt:"就算只過夜，我也想先說清楚彼此的想法。",morning:"早！我買了早餐。昨晚的事我不會當作沒發生，但妳不用急著給我答案。",commit:"我不想一直只是妳的床伴了。我是真的想和妳交往，想知道妳怎麼想。",secrecy:"……我會在意。但妳坦白說了，我也得自己決定能不能繼續。這次我願意。",openTrust:45,clue:"攝影活動結束那晚，有人說在附近看到妳。我知道這不代表什麼，但還是想問。"},
  pei:{name:"裴知聿",minimum:0,invite:"還醒著嗎？我今天一直在想以前的事。如果妳願意，今晚能不能留下來？",agree:"妳確定？我只是怕明天醒來，妳又跟我說什麼都不算。",doubt:"我可以接受今晚還沒有名分，但我不一定永遠能接受。",morning:"醒了嗎？……我其實一直沒睡好。我不想連問妳昨晚算不算數的資格都沒有。",commit:"我不要再只能在妳有空時見到妳。我想和妳重新在一起，不想永遠只是地下的床伴。妳願意嗎？",secrecy:"我知道妳有別人。我說不難受是假的。可我還是想留下來，至少現在是這樣。",openTrust:80,clue:"我們以前交往過。我不想拿熟悉當權利，但妳最近幾次時間說法對不上，我很難不在意。"},
  qi:{name:"祁野",minimum:8,invite:"今天那些家裡的事煩死了。妳今晚要不要一起待著？過夜也行。不要就直接說。",agree:"喂，妳確定？我不是跟妳賭輸贏，不想就算了。",doubt:"我不想當備案。就算只是今晚，也要講明白。",morning:"起床了？我訂了兩份早餐。別誤會，我沒說妳一定要留下。",commit:"我不想再被叫成『偶爾過夜的朋友』。我想正式跟妳交往，不是在開玩笑。",secrecy:"靠，原來妳有男朋友。妳說清楚我才會答應，別以為我永遠不吃醋。",openTrust:65,clue:"朋友說夜間活動附近看到妳，但那天妳說沒安排。我想問清楚。"},
  gu:{name:"顧時安",minimum:12,invite:"專案總算告一段落。妳如果願意，今晚可以多陪彼此一會，也可以留下來過夜。",agree:"我希望今晚是我們都真心願意的選擇。後面的關係可以慢慢談。",doubt:"我重視彼此的界線。親密不代表自動交往，但也不該只是隨意帶過。",morning:"早安。咖啡已經準備好了。昨晚如果有什麼想說的，我願意聽。",commit:"我以為自己可以不急著定義我們，但現在我想要穩定的伴侶關係。我希望妳認真考慮。",secrecy:"如果妳的專一伴侶還不知情，我不能答應。先處理好原有約定。",openTrust:35,clue:"幾次晚間安排和我們約定的時間有衝突。我不想猜，可以談談嗎？"},
  lu:{name:"陸沉川",minimum:7,invite:"下班了。現在不是會館的工作時間。妳如果想見面，我可以留下來過夜。妳自己決定。",agree:"這次不是工作，也沒有任何費用。妳不用用今晚來交換什麼。",doubt:"我分得清工作上的曖昧和私下的關係。妳也先想好。",morning:"醒了？我等會有拍攝。昨晚的事，我不打算用工作話術帶過。",commit:"原本以為我們都只想輕鬆相處。現在不同了。我想認真跟妳交往，不想再用床伴敷衍自己。",secrecy:"我可以接受不公開，但我們得知道彼此的界線。這不是會館服務，我有自己的感受。",openTrust:40,clue:"有熟人在品牌活動附近看到妳。我不是要查行程，但妳的說法讓我有點困惑。"}
};
const key=(k:NightKey,p:string)=>"z3_ov_"+p+"_"+k;
const str=(s:Runtime,k:string)=>String(s.variables[k]??"");
const num=(s:Runtime,k:string)=>typeof s.variables[k]==="number" ? s.variables[k] as number : 0;
const has=(s:Runtime,k:string)=>s.variables[k]===true;
const set=(s:Runtime,k:string,v:string|boolean|number)=>{s.variables[k]=v;};
const add=(s:Runtime,k:string,n:number)=>{set(s,k,Math.max(0,Math.min(100,num(s,k)+n)));};
const fromName=(name:string):NightKey|undefined=>NIGHT_KEYS.find(k=>profile[k].name===name);
function note(s:Runtime,k:NightKey,body:string,player=false){
  const seq=num(s,"z3_ov_sequence")+1;
  set(s,"z3_ov_sequence",seq);
  const who=profile[k].name;
  const item=makeItem({id:"z3-night-"+seq,title:who,sender:player?"我":who,
    body,outgoing:player,time:String(s.date??"2026-11-06")+" "+s.time,meta:{overnight:"true"}});
  s.messages={...s.messages,kakao:[...(s.messages.kakao??[]),item]};
  if(!player)s.notifications=[...s.notifications,who+"："+body.slice(0,60)];
}
function pending(s:Runtime,k:NightKey){return str(s,key(k,"pending"));}
function status(s:Runtime,k:NightKey){return str(s,key(k,"status"));}
function clear(s:Runtime,k:NightKey){set(s,key(k,"pending"),"");}
export function isNightPartner(s:Runtime,k:NightKey){
  return has(s,key(k,"partner"))||
    ["partner","confirmed_partner","dating","in_relationship","exclusive_relationship","nonexclusive_partner","couple","reconciled"].includes(str(s,"z3_relation_"+k));
}
function isOpen(s:Runtime,k:NightKey){
  return has(s,key(k,"open"))||str(s,"z3_exclusivity_"+k)==="consensual_nonexclusive";
}
function undisclosed(s:Runtime,except:NightKey){
  return NIGHT_KEYS.filter(k=>k!==except&&isNightPartner(s,k)&&!isOpen(s,k));
}
function reveal(s:Runtime,k:NightKey){
  if(has(s,key(k,"discovered")))return;
  set(s,key(k,"discovered"),true);
  set(s,key(k,"pending"),"showdown");
  set(s,key(k,"suspicion"),100);
  add(s,"z3_trust_"+k,-35);
  add(s,"z3_jealousy_"+k,25);
  const rival=str(s,key(k,"rival"));
  const name=NIGHT_KEYS.includes(rival as NightKey)?profile[rival as NightKey].name:"另一個人";
  note(s,k,"我把幾次行程、公開場合的線索都對起來了。我知道妳和"+name+"有秘密的關係。我想聽妳親口說。");
  if(NIGHT_KEYS.includes(rival as NightKey)){
    note(s,rival as NightKey,"我知道事情被發現了。先把你們之間的事談清楚，我也會面對自己的選擇。");
  }
}
function beginNight(s:Runtime,k:NightKey){
  clear(s,k);
  set(s,key(k,"night"),true);
  set(s,key(k,"morning"),true);
  set(s,key(k,"night_date"),String(s.date??""));
  add(s,"z3_affection_"+k,18);
  add(s,"z3_intimacy_"+k,22);
  add(s,"z3_trust_"+k,5);
  if(!isNightPartner(s,k)){
    const affection=num(s,"z3_affection_"+k);
    if(status(s,k)!=="fwb"&&status(s,k)!=="romantic")set(s,key(k,"status"),affection<55?"fwb":"romantic");
  }
  const secret=undisclosed(s,k);
  set(s,key(k,"secret"),secret.length>0);
  for(const partner of secret){
    add(s,key(partner,"suspicion"),22);
    add(s,key(partner,"clues"),1);
    set(s,key(partner,"rival"),k);
    if(num(s,key(partner,"suspicion"))>=100)reveal(s,partner);
  }
  note(s,k,"今晚就照我們說好的方式。其他事情等明天再談，不會因為過夜就擅自替妳決定關係。");
}
function question(s:Runtime,k:NightKey){
  if(pending(s,k)||has(s,key(k,"discovered")))return;
  const suspicion=num(s,key(k,"suspicion"));
  if(suspicion<20)return;
  set(s,key(k,"pending"),"suspect");
  if(suspicion>=75)note(s,k,"幾次公開場合的線索和妳說的時間一直對不上。我不想自己繼續猜了，想聽妳解釋。");
  else if(suspicion>=45)note(s,k,"有朋友說在附近看過妳和別人一起離開。我沒打算查妳手機，但我真的會在意。");
  else note(s,k,profile[k].clue);
}
/** 時鐘跨日觸發 NPC 自主邀約、次日談話、懷疑追問；不需先開聊天室。 */
export function progressOvernight(s:Runtime){
  const date=String(s.date??"");
  if(!date||str(s,"z3_ov_day_checked")===date)return;
  set(s,"z3_ov_day_checked",date);
  const day=num(s,"z3_ov_days")+1;
  set(s,"z3_ov_days",day);
  for(const k of NIGHT_KEYS){
    if(has(s,key(k,"morning"))){
      set(s,key(k,"morning"),false);
      note(s,k,profile[k].morning);
      if(status(s,k)==="fwb"&&num(s,"z3_affection_"+k)>=70&&!has(s,key(k,"commit_once"))){
        set(s,key(k,"commit_once"),true);
        set(s,key(k,"pending"),"commit");
        note(s,k,profile[k].commit);
      }
    }
  }
  for(const k of NIGHT_KEYS){
    if(!isNightPartner(s,k)||isOpen(s,k)||has(s,key(k,"discovered")))continue;
    const suspicion=num(s,key(k,"suspicion"));
    if(suspicion<=0)continue;
    if(pending(s,k)==="suspect")add(s,key(k,"suspicion"),3);
    else if(suspicion>=45)add(s,key(k,"suspicion"),2);
    if(num(s,key(k,"suspicion"))>=100){reveal(s,k);continue;}
    const gap=suspicion>=75?1:suspicion>=45?2:3;
    if(day%gap===0)question(s,k);
  }
  // 每個遊戲日輪流評估一位男主，避免一天五人同時邀約。
  if(day<2)return;
  const k=NIGHT_KEYS[(day-2)%NIGHT_KEYS.length];
  if(pending(s,k)||(k==="pei"&&has(s,"pei_no_contact"))||(k==="lu"&&!has(s,"z3_lu_private_contact")))return;
  if(num(s,"z3_affection_"+k)<Math.max(10,profile[k].minimum)&&status(s,k)!=="fwb"&&!isNightPartner(s,k))return;
  if(num(s,key(k,"invite_day"))>0&&day-num(s,key(k,"invite_day"))<7)return;
  set(s,key(k,"invite_day"),day);
  set(s,key(k,"pending"),"offer");
  note(s,k,profile[k].invite);
}
export function overnightAction(previous:Runtime,name:string,command:string):Runtime{
  const k=fromName(name);if(!k)return previous;
  const s=structuredClone(previous),stage=pending(s,k),p=profile[k];
  if(command==="invite"&&!stage){
    note(s,k,"今晚要不要一起過夜？我們可以先談彼此的界線。",true);
    if(k==="pei"&&has(s,"pei_no_contact")){note(s,k,"妳說過不想聯絡，我會尊重。");return s;}
    if(k==="lu"&&!has(s,"z3_lu_private_contact")){note(s,k,"私人邀約不在會館工作範圍。先正常認識再說。");return s;}
    if(num(s,"z3_affection_"+k)<p.minimum&&!isNightPartner(s,k)&&status(s,k)!=="fwb"){
      note(s,k,p.doubt+" 我們再熟一點，今晚先不要。");return s;
    }
    set(s,key(k,"pending"),"confirm");note(s,k,p.agree);return s;
  }
  if(command==="ask_open"&&!stage){
    note(s,k,"我想談談公開的非排他關係。你可以拒絕，我想知道你的想法。",true);
    if(!isNightPartner(s,k)){note(s,k,"我們還沒有確認交往，可以先聊想法，但不算正式約定。");return s;}
    if(num(s,"z3_trust_"+k)>=p.openTrust&&num(s,"z3_affection_"+k)>=40){
      set(s,key(k,"open"),true);set(s,"z3_exclusivity_"+k,"consensual_nonexclusive");
      add(s,key(k,"suspicion"),-18);
      note(s,k,"我願意在坦誠且界線清楚的前提下嘗試。如果有不舒服，我們還是要再談。");
    }else note(s,k,"我理解，但現在無法同意。喜歡妳不代表我一定能接受這種安排。");
    return s;
  }
  const allowed:Record<string,string[]>={
    offer:["accept","decline","later","boundary"],confirm:["accept","decline","later","boundary"],
    boundary:["accept","decline","later","boundary"],night_check:["stay","postpone","talk","stop"],
    disclose:["secret_yes","postpone","stop","conditions"],
    commit:["date_yes","stay_fwb","think","end_fwb"],
    suspect:["cover","deny","later","truth"],
    showdown:["repair","break_up","open_after","cooldown"]
  };
  if(!allowed[stage]?.includes(command))return previous;
  const player:Record<string,string>={
    accept:"我願意，再確認一下今晚的安排。",decline:"我今晚不過夜。",later:"我們改天再說。",
    boundary:"我想先把彼此的界線談清楚。",stay:"我願意，今晚一起留下來。",postpone:"我改主意了，先不要。",
    talk:"我今晚只想聊天。",stop:"我想取消邀約。",secret_yes:"我已經有伴侶，而且沒有公開這段關係，你知道後還願意嗎？",
    conditions:"我想先談清楚秘密關係對你意味著什麼。",date_yes:"我願意跟你正式交往，但其他約定也要處理。",
    stay_fwb:"我現在還想維持床伴關係。",think:"我需要時間考慮。",end_fwb:"我不想再維持床伴關係。",
    cover:"那晚確實有私人安排，我不想現在談全部細節。",deny:"根本沒有這回事，你想太多。",
    truth:"我確實跟別人過夜，我願意把事實說清楚。",repair:"我知道隱瞞傷害了你，我願意談後果。",
    break_up:"我想結束我們的伴侶關係。",open_after:"我想談公開多戀，但我知道這無法抵銷欺騙。",
    cooldown:"我們先各自冷靜，之後再談。"
  };
  note(s,k,player[command]??command,true);
  if(["offer","confirm","boundary"].includes(stage)){
    if(command==="accept"){set(s,key(k,"pending"),"night_check");note(s,k,p.doubt+" 如果妳還願意，我們再確認一次。");}
    else if(command==="boundary"){set(s,key(k,"pending"),"boundary");note(s,k,"可以。不會有人被迫留下，過夜也不自動等於交往。");}
    else{clear(s,k);note(s,k,"好，妳可以改變主意，我尊重。");}
    return s;
  }
  if(stage==="night_check"){
    if(command==="stay"){
      if(undisclosed(s,k).length){set(s,key(k,"pending"),"disclose");note(s,k,"如果妳已有正式伴侶而他還不知道，我需要先知道這件事。");}
      else beginNight(s,k);
    }else{clear(s,k);note(s,k,command==="talk"?"好，今晚只聊聊。":"好，不勉強。");}
    return s;
  }
  if(stage==="disclose"){
    if(command==="conditions"){note(s,k,"我有權知道既有約定，也有權在不舒服時停止。");return s;}
    if(command!=="secret_yes"){clear(s,k);note(s,k,"好，那今天先到這裡。");return s;}
    if(k==="gu"){clear(s,k);note(s,k,p.secrecy);return s;}
    note(s,k,p.secrecy);set(s,key(k,"aware_partner"),true);beginNight(s,k);return s;
  }
  if(stage==="commit"){
    clear(s,k);
    if(command==="date_yes"){
      set(s,key(k,"partner"),true);set(s,key(k,"status"),"partner");
      set(s,"z3_relation_"+k,"partner");set(s,"z3_exclusivity_"+k,"undiscussed");
      add(s,"z3_trust_"+k,8);
      note(s,k,"我會認真看待我們的關係。但原本的交往與界線，也得說清楚。");
    }else if(command==="stay_fwb"){
      add(s,"z3_jealousy_"+k,12);note(s,k,"我知道了。我不逼妳，但也要考慮自己還能不能接受。");
    }else if(command==="end_fwb"){
      set(s,key(k,"status"),"friends");note(s,k,"好，先回到朋友，彼此留點空間。");
    }else note(s,k,"可以考慮。我已經把自己的想法說出來了。");
    return s;
  }
  if(stage==="suspect"){
    clear(s,k);
    const suspicion=num(s,key(k,"suspicion"));
    if(command==="truth"){reveal(s,k);return s;}
    if(command==="cover"){add(s,key(k,"suspicion"),suspicion>=75?5:-13);note(s,k,suspicion>=75?"我尊重妳的隱私，但矛盾還在。":"好，我暫時不追問。但我希望重要事情妳能主動說。");}
    else if(command==="deny"){add(s,key(k,"suspicion"),suspicion>=40?24:10);note(s,k,"我不能只因為一句『想太多』就不去面對疑點。");}
    else{add(s,key(k,"suspicion"),8);note(s,k,"我可以等，但這些問題不會因此消失。");}
    if(num(s,key(k,"suspicion"))>=100)reveal(s,k);
    return s;
  }
  if(stage==="showdown"){
    clear(s,k);
    if(command==="repair"){set(s,key(k,"status"),"repairing");add(s,"z3_trust_"+k,4);note(s,k,"我願意聽妳說，但能不能繼續，我還需要時間。");}
    else if(command==="break_up"){set(s,key(k,"partner"),false);set(s,"z3_relation_"+k,"former_partner");note(s,k,"我接受分手。我們的生活不會因此停止。");}
    else if(command==="open_after"){set(s,key(k,"status"),"open_discussion");note(s,k,"公開不代表能抹掉隱瞞。我可能不會接受。");}
    else{set(s,key(k,"status"),"cooldown");note(s,k,"好，先冷靜。等能好好談的時候再說。");}
    return s;
  }
  return s;
}
type Choice={label:string;code:string};
export function overnightPanelFor(variables:Record<string,string|number|boolean>,name:string):{pending:boolean;title:string;items:Choice[]}|null{
  const k=fromName(name);if(!k)return null;
  const stage=String(variables[key(k,"pending")]??"");
  const four:Record<string,{title:string;items:Choice[]}>={
    offer:{title:"今晚的邀約",items:[{label:"願意先確認",code:"accept"},{label:"拒絕",code:"decline"},{label:"改天再說",code:"later"},{label:"先談界線",code:"boundary"}]},
    confirm:{title:"過夜邀約",items:[{label:"願意再確認",code:"accept"},{label:"不過夜",code:"decline"},{label:"改天",code:"later"},{label:"先談界線",code:"boundary"}]},
    boundary:{title:"彼此的界線",items:[{label:"我願意繼續",code:"accept"},{label:"取消",code:"decline"},{label:"改天再談",code:"later"},{label:"再談界線",code:"boundary"}]},
    night_check:{title:"最後確認：今晚真的過夜嗎？",items:[{label:"自願留下",code:"stay"},{label:"延後",code:"postpone"},{label:"今晚只聊天",code:"talk"},{label:"取消",code:"stop"}]},
    disclose:{title:"已有伴侶：需要向過夜對象說清楚",items:[{label:"坦白已有伴侶，詢問能否接受秘密關係",code:"secret_yes"},{label:"暫時不過夜",code:"postpone"},{label:"取消",code:"stop"},{label:"先談界線",code:"conditions"}]},
    commit:{title:"他要求轉為正式伴侶",items:[{label:"願意轉正",code:"date_yes"},{label:"先維持床伴",code:"stay_fwb"},{label:"考慮一下",code:"think"},{label:"結束床伴",code:"end_fwb"}]},
    suspect:{title:"伴侶開始懷疑",items:[{label:"保留私人安排細節",code:"cover"},{label:"否認",code:"deny"},{label:"以後再談",code:"later"},{label:"坦白真相",code:"truth"}]},
    showdown:{title:"秘密曝光後的修羅場",items:[{label:"道歉並嘗試修復",code:"repair"},{label:"提出分手",code:"break_up"},{label:"討論公開多戀",code:"open_after"},{label:"先冷靜",code:"cooldown"}]}
  };
  const result=four[stage];
  return result?{pending:true,...result}:{pending:false,title:"",items:[{label:"主動邀請他過夜",code:"invite"},{label:"談公開非排他關係",code:"ask_open"}]};
}
