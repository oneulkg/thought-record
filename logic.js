(function(root,f){const m=f();if(typeof module==='object'&&module.exports)module.exports=m;else root.TR=m;})(this,function(){
const KEY='thoughtRecords.v1';
const DISTORTIONS=[
 ['흑백논리','완전히 성공 아니면 실패, 중간이 없다고 봐요'],
 ['마음 읽기','증거 없이 남이 나를 나쁘게 생각한다고 단정해요'],
 ['과잉 일반화','한 번의 일을 "항상, 늘"로 넓혀요'],
 ['파국화','가장 나쁜 결과가 일어날 거라고 키워 생각해요'],
 ['감정적 추론','이렇게 느끼니까 사실일 거라고 여겨요'],
 ['당위 진술','"~해야만 해"로 나를 몰아세워요'],
 ['명명하기','"나는 무능해"처럼 나에게 꼬리표를 붙여요'],
 ['개인화','내 탓이 아닌 일까지 내 책임으로 돌려요'],
 ['긍정 무시하기','잘된 점은 "별거 아냐"라며 지워 버려요']];
const EMOTIONS=['불안','수치심','실망','슬픔','화남','죄책감','외로움','긴장','당황','무력감'];
const TEXT=['situation','distortionNote','balanced','emotionText','letGo','afterFeeling'];
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function newRecord(now){const t=now||Date.now();const r={id:uid(),createdAt:t,updatedAt:t,distortions:[],emotions:[],intensity:null,teflonDone:false};TEXT.forEach(k=>r[k]='');return r;}
const has=s=>typeof s==='string'&&s.trim().length>0;
function stepDone(r,n){
 if(n===1)return has(r.situation);
 if(n===2)return has(r.balanced)&&(r.distortions.length>0||has(r.distortionNote));
 if(n===3)return r.emotions.length>0||has(r.emotionText);
 if(n===4)return !!r.teflonDone||has(r.afterFeeling);
 return false;}
function progress(r){let k=0;while(k<4&&stepDone(r,k+1))k++;return k;}
function nextStep(r){return Math.min(progress(r)+1,4);}
function isComplete(r){return progress(r)===4;}
function normalize(o){if(!o||typeof o!=='object'||typeof o.id!=='string')return null;const r=newRecord(+o.createdAt||Date.now());r.id=o.id;r.updatedAt=+o.updatedAt||r.createdAt;
 TEXT.forEach(k=>{if(typeof o[k]==='string')r[k]=o[k];});
 r.distortions=Array.isArray(o.distortions)?o.distortions.filter(x=>typeof x==='string'):[];
 r.emotions=Array.isArray(o.emotions)?o.emotions.filter(x=>typeof x==='string'):[];
 const i=Number(o.intensity);r.intensity=(o.intensity===null||o.intensity===undefined||isNaN(i))?null:Math.max(0,Math.min(100,Math.round(i)));
 r.teflonDone=!!o.teflonDone;return r;}
function load(st){try{const a=JSON.parse(st.getItem(KEY)||'[]');return Array.isArray(a)?a.map(normalize).filter(Boolean):[];}catch(e){return [];}}
function saveAll(st,list){st.setItem(KEY,JSON.stringify(list));}
function sorted(list){return list.slice().sort((a,b)=>b.updatedAt-a.updatedAt);}
function upsert(st,rec,now){const list=load(st);rec.updatedAt=now||Date.now();const i=list.findIndex(x=>x.id===rec.id);if(i>=0)list[i]=rec;else list.push(rec);saveAll(st,list);return rec;}
function remove(st,id){const list=load(st).filter(x=>x.id!==id);saveAll(st,list);return list;}
function get(st,id){return load(st).find(x=>x.id===id)||null;}
function exportJSON(st){return JSON.stringify({app:'thought_record',version:1,exportedAt:new Date().toISOString(),records:load(st)},null,2);}
function importJSON(st,text){let d;try{d=JSON.parse(text);}catch(e){throw new Error('JSON 형식이 아니에요');}
 const arr=Array.isArray(d)?d:(d&&Array.isArray(d.records)?d.records:null);if(!arr)throw new Error('기록 백업 파일이 아니에요');
 const list=load(st);let added=0,updated=0;
 arr.map(normalize).filter(Boolean).forEach(r=>{const i=list.findIndex(x=>x.id===r.id);if(i<0){list.push(r);added++;}else if(r.updatedAt>list[i].updatedAt){list[i]=r;updated++;}});
 saveAll(st,list);return {added,updated};}
function fmtDate(t){const d=new Date(t);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}.${p(d.getMonth()+1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function noticing(thought){const t=(thought||'').trim().split(/\n/)[0].replace(/[.。!?]+$/,'');return t?`지금 나는 '${t}'라는 생각을 하고 있다.`:'';}
return {KEY,DISTORTIONS,EMOTIONS,newRecord,stepDone,progress,nextStep,isComplete,normalize,load,saveAll,sorted,upsert,remove,get,exportJSON,importJSON,fmtDate,noticing};});
