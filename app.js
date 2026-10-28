(function(){
const S=localStorage,$=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cur=null,timer=null,breathT=null;
const STEPS=['상황','인지 왜곡','감정','테플론'];
function flash(){const e=$('#saved');e.textContent='저장됨 ✓';clearTimeout(e._t);e._t=setTimeout(()=>e.textContent='',1500);}
function save(){if(!cur)return;TR.upsert(S,cur);flash();}
function later(){clearTimeout(timer);timer=setTimeout(save,400);}
function go(h){location.hash=h;}
function confirmDlg(msg){return new Promise(res=>{const d=$('#dlg');$('#dlgMsg').textContent=msg;d.showModal();$('#dlgYes').onclick=()=>{d.close();res(true)};$('#dlgNo').onclick=()=>{d.close();res(false)};});}
function field(key,label,ph,hint){return `<label for="f_${key}">${label}</label>${hint?`<p class="hint">${hint}</p>`:''}<textarea id="f_${key}" data-k="${key}" placeholder="${esc(ph)}">${esc(cur[key])}</textarea>`;}
function list(){cur=null;$('#back').hidden=true;$('#title').textContent='마음 기록';
 const rs=TR.sorted(TR.load(S));
 app.innerHTML=`<div class="card"><h2>자신에 대한 판단과 평가를 줄이는 연습</h2><p class="sub">힘들었던 순간을 4단계로 천천히 적어 봐요. 1단계만 적고 나중에 이어 써도 괜찮아요.</p><button id="new" style="width:100%">+ 새 기록 시작</button></div>`+
 (rs.length?rs.map(r=>{const p=TR.progress(r);return `<div class="card rec" data-id="${r.id}"><div class="txt"><div class="t">${esc(r.situation.trim()||'(아직 비어 있는 기록)')}</div><div class="d">${TR.fmtDate(r.createdAt)}</div><div class="bar"><i style="width:${p*25}%"></i></div></div><span class="badge ${p===4?'done':''}">${p===4?'완료 4/4':p+'/4'}</span></div>
 <div class="row" style="margin:-8px 0 14px;justify-content:flex-end"><button class="ghost cont" data-id="${r.id}">${p===4?'다시 보기':'이어 쓰기 →'}</button><button class="ghost del" data-id="${r.id}" style="color:#b5654f">삭제</button></div>`}).join(''):`<div class="empty">아직 기록이 없어요.<br>마음이 무거웠던 순간 하나를 떠올려 보세요.</div>`)+
 `<div class="card"><h2 style="font-size:17px">백업</h2><p class="sub">기록은 이 휴대폰 브라우저에만 저장돼요. 가끔 백업 파일로 내보내 두세요.</p><div class="row"><button class="light" id="exp">내보내기</button><button class="light" id="imp">가져오기</button><input type="file" id="file" accept="application/json,.json" hidden></div></div>
 <p class="note">이 앱은 스스로 연습하는 도구이며 의료적 치료나 상담을 대신하지 않아요. 많이 힘들면 전문가의 도움을 받아 주세요. (정신건강 위기상담 ☎ 1577-0199)</p>`;
 $('#new').onclick=()=>{const r=TR.newRecord();TR.upsert(S,r);go(`#/r/${r.id}/1`);};
 app.querySelectorAll('.rec,.cont').forEach(e=>e.onclick=()=>{const r=TR.get(S,e.dataset.id);go(`#/r/${r.id}/${TR.isComplete(r)?1:TR.nextStep(r)}`);});
 app.querySelectorAll('.del').forEach(e=>e.onclick=async()=>{if(await confirmDlg('이 기록을 삭제할까요? 되돌릴 수 없어요.')){TR.remove(S,e.dataset.id);list();}});
 $('#exp').onclick=()=>{const b=new Blob([TR.exportJSON(S)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`마음기록_백업_${new Date().toISOString().slice(0,10)}.json`;a.click();};
 $('#imp').onclick=()=>$('#file').click();
 $('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const r=TR.importJSON(S,t);alert(`가져오기 완료: 새 기록 ${r.added}개, 갱신 ${r.updated}개`);list();}catch(err){alert(err.message);}});};}
function stepView(id,n){cur=TR.get(S,id);if(!cur)return go('#/');clearInterval(breathT);
 $('#back').hidden=false;$('#title').textContent=`${n}단계 / 4`;
 let h=`<div class="steps">${STEPS.map((s,i)=>`<button data-n="${i+1}" class="${i+1===n?'on':''} ${TR.stepDone(cur,i+1)?'ok':''}">${i+1}. ${s}</button>`).join('')}</div><div class="card">`;
 if(n===1)h+=`<h2>1단계 · 상황을 객관적으로 기록하기</h2><p class="sub">판단 없이, 카메라가 찍듯 있었던 일만 적어요. 떠오른 생각이나 마음도 자유롭게 같이 적어도 돼요.</p>`+field('situation','무슨 일이 있었나요?','예: 회의에서 발표했고 몇몇 동료가 집중하지 않는 모습이 보였다','예: 회의에서 발표했고 몇몇 동료가 집중하지 않는 모습이 보였다')+`<p class="sub" style="margin-top:10px">1단계만 저장하고 나중에 이어 써도 돼요. 쓰는 동안 자동 저장돼요.</p>`;
 if(n===2)h+=`<h2>2단계 · 인지 왜곡 확인</h2><p class="sub">내 생각에 이런 습관이 섞여 있나요? 해당하는 걸 눌러 보세요.</p><p class="hint">예: 흑백논리 '망쳤다 vs 성공했다', 마음 읽기 '사람들이 무능하다고 생각할 거야', 과잉 일반화 '한 번의 실수를 전체 능력으로 확대'</p><div class="chips dist">${TR.DISTORTIONS.map(([k,d])=>`<button class="chip ${cur.distortions.includes(k)?'on':''}" data-d="${esc(k)}">${k}<small>${d}</small></button>`).join('')}</div>`+field('distortionNote','메모','예: 발표 하나로 내 능력 전체를 판단하고 있었다')+field('balanced','균형 잡힌 대안적 사고','예: 긴장해서 말이 빨라졌지만 핵심은 잘 전달됐다. 일부는 집중하지 않았지만 다른 사람들은 잘 들었다.','예: 긴장해서 말이 빨라졌지만 핵심은 잘 전달됐다 · 일부는 집중하지 않았지만 다른 사람들은 잘 들었다 · 전체적으로 충분히 의미 있는 발표였다');
 if(n===3)h+=`<h2>3단계 · 감정 이름 붙이기</h2><p class="sub">감정에 이름을 붙이면 조금 거리를 둘 수 있어요.</p><p class="hint">예: 불안, 수치심, 약간의 실망</p><div class="chips">${TR.EMOTIONS.map(k=>`<button class="chip ${cur.emotions.includes(k)?'on':''}" data-e="${k}">${k}</button>`).join('')}</div>`+field('emotionText','내 말로 적어 보기','예: 불안, 수치심, 약간의 실망')+`<label for="inten">감정의 세기 <b id="iv">${cur.intensity==null?'-':cur.intensity}</b> / 100</label><input type="range" id="inten" min="0" max="100" step="5" value="${cur.intensity==null?50:cur.intensity}">`;
 if(n===4){const th=cur.letGo.trim();h+=`<h2>4단계 · 테플론 마인드 적용하기</h2><p class="sub">테플론 프라이팬처럼, 생각이 마음에 달라붙지 않고 미끄러져 가게 두는 연습이에요.</p>
 ${cur.situation.trim()?`<p class="sub">1단계에 적은 내용</p><div class="quote">${esc(cur.situation)}</div>`:''}`+field('letGo','흘려보낼 생각 하나','예: 나는 오늘 발표를 망쳤어')+
 `<p class="sub" style="margin-top:12px">① 거리 두기</p><div class="quote" id="noti">${esc(TR.noticing(th))||'위에 생각을 적으면 “지금 나는 …라는 생각을 하고 있다”로 바꿔 보여 드려요.'}</div>
 <p class="sub">② 흘려보내기 — 생각을 강물 위 잎사귀에 올려 두세요.</p><div class="thought"><div class="leaf" id="leaf">${esc(th||'떠오른 생각')}</div></div><button class="light" id="float" style="width:100%">🍃 흘려보내기</button>
 <p class="sub" style="margin-top:14px">③ 30초 숨 고르기</p><div class="breath" id="br">시작을 눌러요</div><button class="light" id="bstart" style="width:100%">30초 호흡 시작</button></div><div class="card">`+field('afterFeeling','지금 마음은 어떤가요?','예: 아직 조금 불안하지만, 생각이 나를 다 정의하진 않는다는 게 느껴진다');}
 h+=`</div>`;app.innerHTML=h+`<div class="nav">${n>1?`<button class="light" id="prev">‹ 이전</button>`:''}<button id="next">${n<4?(n===1?'저장하고 다음 →':'다음 →'):'완료 ✓'}</button></div>`;
 app.querySelectorAll('textarea').forEach(t=>t.oninput=()=>{cur[t.dataset.k]=t.value;later();if(t.dataset.k==='letGo'){$('#noti').textContent=TR.noticing(t.value)||'…';$('#leaf').textContent=t.value.trim()||'떠오른 생각';}});
 app.querySelectorAll('.steps button').forEach(b=>b.onclick=()=>{save();go(`#/r/${id}/${b.dataset.n}`);});
 app.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const k=b.dataset.d,a=cur.distortions;a.includes(k)?a.splice(a.indexOf(k),1):a.push(k);b.classList.toggle('on');save();});
 app.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const k=b.dataset.e,a=cur.emotions;a.includes(k)?a.splice(a.indexOf(k),1):a.push(k);b.classList.toggle('on');save();});
 const r=$('#inten');if(r)r.oninput=()=>{cur.intensity=+r.value;$('#iv').textContent=r.value;later();};
 const f=$('#float');if(f)f.onclick=()=>{const l=$('#leaf');l.classList.remove('away');void l.offsetWidth;l.classList.add('away');cur.teflonDone=true;save();setTimeout(()=>{l.style.transition='none';l.classList.remove('away');void l.offsetWidth;l.style.transition='';},6500);};
 const bs=$('#bstart');if(bs)bs.onclick=()=>{let s=30;const br=$('#br');clearInterval(breathT);const tick=()=>{const ph=(30-s)%8<4;br.classList.toggle('in',ph);br.textContent=`${ph?'들이쉬고':'내쉬고'} · ${s}초`;if(s--<=0){clearInterval(breathT);br.classList.remove('in');br.textContent='잘했어요 🌿';cur.teflonDone=true;save();}};tick();breathT=setInterval(tick,1000);};
 const p=$('#prev');if(p)p.onclick=()=>{save();go(`#/r/${id}/${n-1}`);};
 $('#next').onclick=()=>{save();n<4?go(`#/r/${id}/${n+1}`):go('#/');};
 window.scrollTo(0,0);}
function route(){save();const m=location.hash.match(/^#\/r\/([^/]+)\/([1-4])$/);m?stepView(m[1],+m[2]):list();}
$('#back').onclick=()=>{save();go('#/');};
window.addEventListener('hashchange',route);document.addEventListener('visibilitychange',()=>document.hidden&&save());
route();
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js');
})();
