(() => {
 'use strict';
 const DATA=window.KISH_DATA, C=window.KishCore, byId=new Map(DATA.map(a=>[a.id,a]));
 const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const FIELDS=[...new Set(DATA.flatMap(C.fields))].sort((a,b)=>a.localeCompare(b,'ko'));
 const COLORS=['#166654','#d2903d','#6179ac','#c66c60','#7e6da7','#73934b','#498b9a','#ae7662','#6d8892','#ac8b36','#b65e87','#677956','#8470c0','#be8250','#4a9180','#799ac0','#a39a69','#a26562','#586a94','#8d8090'];
 const color=f=>COLORS[Math.max(0,FIELDS.indexOf(f))%COLORS.length];
 const icons={'언어·문학':'文','외국어·국제교류':'↗','역사·철학·윤리':'◇','사회·정책·법':'⚖','경제·경영·창업':'↗','수학·통계·데이터':'∑','자연과학':'⚛','공학·기술':'⚙','컴퓨터·인공지능':'⌘','환경·지속가능성':'♧','의료·보건·안전':'+','교육·상담·심리':'♡','미술·디자인':'◒','미디어·콘텐츠':'▷','음악·공연':'♫','체육·스포츠':'◉','자치·리더십':'⚑','나눔·공동체':'✳','진로·학습설계':'↗','분야공통·주제미정':'✦'};
 const hints={'언어·문학':'읽고, 쓰고, 생각을 표현해요','외국어·국제교류':'언어와 문화를 넘어 만나요','역사·철학·윤리':'과거와 가치에 질문을 던져요','사회·정책·법':'함께 사는 사회를 탐구해요','경제·경영·창업':'새로운 아이디어를 기획해요','수학·통계·데이터':'숫자와 데이터로 발견해요','자연과학':'세상의 원리를 탐구해요','공학·기술':'문제를 해결하는 기술을 만들어요','컴퓨터·인공지능':'코드와 AI로 가능성을 넓혀요','환경·지속가능성':'지속 가능한 내일을 생각해요','의료·보건·안전':'건강하고 안전한 삶을 배워요','교육·상담·심리':'사람의 마음과 배움을 이해해요','미술·디자인':'색과 형태로 생각을 표현해요','미디어·콘텐츠':'나의 이야기를 콘텐츠로 만들어요','음악·공연':'소리와 무대에서 표현해요','체육·스포츠':'몸을 움직이며 함께 도전해요','자치·리더십':'우리의 일을 직접 만들어가요','나눔·공동체':'함께하고 나누는 경험을 쌓아요','진로·학습설계':'나의 다음 걸음을 계획해요','분야공통·주제미정':'주제를 자유롭게 탐색해요'};
 const KEY='kish-activity-basket-v1';
 let storageWarning=false,basket=new Set(),selected=new Set(),interest=new Set(),interestStep=1,view='list',mapField='',limit=24,tab='interest';
 const filters={q:'',category:'',period:'',method:''};
 try {const raw=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(raw))basket=new Set(raw.filter(id=>byId.has(id)));}catch{storageWarning=true;}
 function save(){try{localStorage.setItem(KEY,JSON.stringify([...basket]));}catch{storageWarning=true;toast('이 브라우저에서는 저장할 수 없어 현재 화면에서만 유지됩니다.');}updateCounts();}
 function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
 function updateCounts(){ $('#basket-count').textContent=basket.size;$('#selection-count').textContent=`${selected.size}개`;$('#add-basket').disabled=!selected.size;$('#selection-dock').hidden=tab==='basket'||(tab==='interest'&&interestStep===1); }
 const intro=(kicker,title,sub,extra='')=>`<section class="section-heading"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2><p>${sub}</p></div>${extra}</section>`;
 const pill=(text,kind='')=>`<span class="pill ${kind}">${esc(text)}</span>`;
 function render(){
   document.querySelectorAll('[data-tab]').forEach(a=>{const active=a.dataset.tab===tab;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
   if(tab==='interest'&&interestStep===1)renderInterest();else if(tab==='basket')renderBasket();else renderExplore();updateCounts();
 }
 function renderInterest(){
  $('#main').innerHTML=intro('FIND YOUR INTEREST','어떤 분야에 마음이 가나요?','여러 분야를 골라도 좋아요. 주분야와 연관분야가 함께 연결된 활동을 찾아드려요.',`<span class="step">STEP <b>01</b> / 02</span>`)+
   `<div class="field-grid">${FIELDS.map(f=>{const count=DATA.filter(a=>C.fields(a).includes(f)).length;return `<label class="field-card ${interest.has(f)?'chosen':''}" style="--field-color:${color(f)}"><input type="checkbox" name="field" value="${esc(f)}" ${interest.has(f)?'checked':''}><span class="field-icon" aria-hidden="true">${icons[f]||'✦'}</span><span class="field-name">${esc(f)}</span><span class="field-hint">${esc(hints[f]||'관심 있는 활동을 찾아보세요')}</span><span class="field-count">${count}개 활동 <span aria-hidden="true">↗</span></span></label>`;}).join('')}</div>`+
   `<div class="field-bottom"><div><strong id="interest-count">${interest.size}개 분야 선택</strong><p>아직 모르겠다면 ‘활동부터 골라보기’로 시작해 보세요.</p></div><button id="interest-next" class="button primary" ${interest.size?'':'disabled'}>관련 활동 보기 · 다음 <span aria-hidden="true">→</span></button></div>`;
 }
 function options(values,current){return values.map(v=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(v)}</option>`).join('');}
 function renderExplore(){
  const mode=tab==='interest';
  const title=mode?'나의 관심과 연결된 활동':tab==='discover'?'이름부터, 마음이 가는 활동을 골라보세요':'모든 활동을 한눈에 둘러보세요';
  $('#main').innerHTML=intro(mode?'YOUR NEXT ACTIVITY':tab==='discover'?'FOLLOW YOUR CURIOSITY':'EXPLORE ALL ACTIVITIES',title,mode?'선택한 분야 중 하나라도 연결되면 표시됩니다. 마음에 드는 활동을 체크해 주세요.':tab==='discover'?'가나다·ABC순으로 살펴보고, 궁금한 활동을 바구니에 담아보세요.':'범주, 진행 시기, 활동방식을 조합해 나에게 맞는 활동을 찾아보세요.',mode?'<button class="button ghost" id="change-fields">← 분야 다시 선택</button>':'')+
   (mode?`<div class="chosen-fields">${[...interest].map(f=>pill(f,'green')).join('')}</div>`:'')+
   `<div class="filterbar"><label class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="활동명, 분야, 담당 부서 검색" value="${esc(filters.q)}" aria-label="활동 검색"></label>${tab==='all'?`<label class="filter">범주<select id="category"><option value="">모든 범주</option>${options([...new Set(DATA.map(a=>a.category))].sort(),filters.category)}</select></label><label class="filter">시기<select id="period"><option value="">모든 시기</option>${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${filters.period===String(i+1)?'selected':''}>${i+1}월</option>`).join('')}<option value="ongoing" ${filters.period==='ongoing'?'selected':''}>상시·연중·수시</option><option value="unknown" ${filters.period==='unknown'?'selected':''}>월 미정·미명시</option></select></label><label class="filter">활동방식<select id="method"><option value="">모든 방식</option>${options([...new Set(DATA.flatMap(a=>a.methods))].sort(),filters.method)}</select></label>`:''}<button class="button reset" id="reset-filters">초기화</button></div>`+
   (tab==='all'?'<p class="filter-note">월별 결과에는 연중·상시 활동도 포함됩니다. 원자료에 적힌 일정은 각 활동에서 확인하세요.</p>':'')+
   `<div class="results-toolbar"><p id="results-count" role="status" aria-live="polite"></p><div><button class="text-button" id="select-visible">현재 표시된 활동 선택</button><button class="text-button" id="clear-selection">체크 해제</button></div></div><div id="results"></div>`;
  renderResults();
 }
 function filtered(){return DATA.filter(a=>C.matches(a,{q:filters.q,...(tab==='all'?{category:filters.category,period:filters.period,method:filters.method}:{}),selectedFields:tab==='interest'?[...interest]:[]})).sort(C.compare);}
 function card(a,index,basketMode=false){
  const saved=basket.has(a.id),checked=selected.has(a.id);
  return `<article class="activity-card ${checked&&!basketMode?'checked':''}" style="--field-color:${color(a.primary)}"><div class="activity-mark" aria-hidden="true">${icons[a.primary]||'✦'}</div><div class="activity-body"><div class="activity-top"><span class="category">${esc(a.category||'활동')}</span><span class="field-label">${esc(a.primary)}</span></div><button class="activity-title" data-detail="${a.id}">${esc(a.name)}</button><p class="activity-meta"><span class="meta-icon" aria-hidden="true">◷</span>${esc(a.schedule||'시기 미정')}</p><div class="method-tags">${a.methods.slice(0,3).map(m=>pill(m)).join('')}${a.methods.length>3?pill('+'+(a.methods.length-3)):''}</div></div><div class="activity-actions">${basketMode?`<button class="remove-button" data-remove="${a.id}" aria-label="${esc(a.name)} 바구니에서 삭제">삭제</button>`:saved?'<span class="saved">✓ 담긴 활동</span>':`<label class="select-activity"><input type="checkbox" data-select="${a.id}" ${checked?'checked':''} aria-label="${esc(a.name)} 선택"><span>선택</span></label>`}<button class="detail-link" data-detail="${a.id}" aria-label="${esc(a.name)} 자세히 보기">자세히 <span aria-hidden="true">↗</span></button></div></article>`;
 }
 function renderResults(){
  const items=filtered();$('#results-count').innerHTML=`<strong>${items.length}</strong>개 활동 <span>· 가나다·ABC순</span>`;
  $('#results').innerHTML=items.length?`<div class="activity-list">${items.slice(0,limit).map((a,i)=>card(a,i)).join('')}</div>${items.length>limit?`<button class="button load-more" id="load-more">활동 더 보기 <span>${Math.min(limit,items.length)} / ${items.length}</span> ↓</button>`:'<p class="list-end">모든 활동을 확인했어요.</p>'}`:empty('조건에 맞는 활동이 없어요','검색어를 줄이거나 필터를 초기화해 보세요.','필터 초기화','reset-empty-filters');
  updateCounts();
 }
 const empty=(title,desc,label,action)=>`<section class="empty"><span aria-hidden="true">✳</span><h3>${title}</h3><p>${desc}</p><button class="button primary" id="${action}">${label}</button></section>`;
 function renderBasket(){
  const items=[...basket].map(id=>byId.get(id)).filter(Boolean).sort(C.compare),groups=C.groups(items);
  $('#main').innerHTML=intro('MY ACTIVITY BASKET','내가 선택한 활동바구니','지금의 관심이 모여, 나만의 다음 걸음이 됩니다.',items.length?'<button class="button ghost" id="export-plan">계획 내려받기 ↓</button>':'')+
  (storageWarning?'<p class="storage-warning" role="alert">브라우저 저장이 제한되어 있습니다. 계획 내려받기로 선택 목록을 보관해 주세요.</p>':'')+
  `<div class="basket-summary"><div><span>담은 활동</span><strong>${items.length}<small>개</small></strong></div><div><span>선택한 주분야</span><strong>${groups.length}<small>개</small></strong></div><p>정답은 없어요.<br>호기심이 이끄는 대로 담아보세요.</p></div><div class="basket-toolbar"><div class="view-switch" role="group" aria-label="바구니 보기 방식">${[['list','☷','리스트'],['chart','◔','원그래프'],['map','⌘','마인드맵']].map(([v,icon,name])=>`<button data-view="${v}" aria-pressed="${view===v}" class="${view===v?'active':''}"><span aria-hidden="true">${icon}</span>${name}</button>`).join('')}</div>${items.length?'<button class="text-button danger" id="clear-basket">바구니 전체 비우기</button>':''}</div><div id="basket-content"></div>`;
  if(!items.length){$('#basket-content').innerHTML=empty('아직 바구니가 비어 있어요','마음이 가는 활동을 골라 첫 번째 계획을 시작해 보세요.','활동 둘러보기','start-exploring');return;}
  if(view==='list')$('#basket-content').innerHTML=`<div class="activity-list">${items.map((a,i)=>card(a,i,true)).join('')}</div>`;
  if(view==='chart')renderChart(items,groups);
  if(view==='map')renderMap(items,groups);
 }
 function renderChart(items,groups){
  let cumulative=0;const stops=groups.map(g=>{const start=cumulative;cumulative+=g.items.length/items.length*100;return `${color(g.field)} ${start}% ${cumulative}%`;}).join(',');
  $('#basket-content').innerHTML=`<section class="visual-panel"><div class="visual-title"><h3>내 관심은 어떤 모습일까요?</h3><p>활동마다 주분야 한 곳에만 집계해 중복 없이 보여드려요.</p></div><div class="chart-layout"><div class="donut" role="img" aria-label="${esc(groups.map(g=>g.field+' '+g.items.length+'개').join(', '))}" style="background:conic-gradient(${stops})"><div><span>나의 활동</span><strong>${items.length}</strong><small>${groups.length}개 주분야</small></div></div><div class="chart-legend">${groups.map(g=>`<div class="legend-row"><span class="swatch" style="background:${color(g.field)}"></span><span>${esc(g.field)}</span><strong>${g.items.length}개</strong><span>${(g.items.length/items.length*100).toFixed(1)}%</span></div>`).join('')}</div></div><p class="visual-footnote">선택한 활동의 분포이며, 진로 적합도나 능력 평가를 뜻하지 않습니다.</p></section>`;
 }
 function renderMap(items,groups){
  if(!groups.some(g=>g.field===mapField))mapField=groups[0].field;
  const active=groups.find(g=>g.field===mapField),h=Math.max(380,groups.length*60+40,active.items.length*62+40),rootY=h/2;
  const fieldY=i=>(h-groups.length*60)/2+i*60+30,activeIndex=groups.indexOf(active),selectedY=fieldY(activeIndex);
  const branches=groups.map((g,i)=>{const y=fieldY(i);return `<path d="M 175 ${rootY} C 220 ${rootY},210 ${y},260 ${y}" class="map-line"/><g role="button" tabindex="0" data-map-field="${esc(g.field)}" aria-label="${esc(g.field)} ${g.items.length}개 활동 보기"><rect x="260" y="${y-21}" width="228" height="42" rx="12" fill="${g.field===mapField?color(g.field):'#fff'}" stroke="${color(g.field)}"/><text x="275" y="${y+5}" fill="${g.field===mapField?'#fff':'#243d38'}">${esc(g.field)} · ${g.items.length}</text></g>`;}).join('');
  const leaves=active.items.map((a,i)=>{const y=(h-active.items.length*62)/2+i*62+31;const chars=[...a.name],lines=[chars.slice(0,24).join(''),chars.slice(24,47).join('')+(chars.length>47?'…':'')];return `<path d="M 488 ${selectedY} C 535 ${selectedY},530 ${y},580 ${y}" class="map-line selected"/><g role="button" tabindex="0" data-detail="${a.id}" aria-label="${esc(a.name)} 자세히 보기"><title>${esc(a.name)}${a.related.length?' · 연관: '+esc(a.related.join(', ')):''}</title><rect x="580" y="${y-25}" width="370" height="50" rx="10" fill="#fff" stroke="#d8e4de"/><text x="594" y="${y+(lines[1]?-4:5)}" class="leaf-text">${esc(lines[0])}${lines[1]?`<tspan x="594" dy="18">${esc(lines[1])}</tspan>`:''}</text></g>`;}).join('');
  $('#basket-content').innerHTML=`<section class="visual-panel"><div class="visual-title"><h3>활동으로 연결되는 나의 관심</h3><p>분야를 누르면 연결된 활동이 펼쳐집니다. 활동을 누르면 연관분야도 볼 수 있어요.</p></div><div class="map-focus"><label>펼쳐 볼 분야 <select id="map-field">${options(groups.map(g=>g.field),mapField)}</select></label><span>화면을 좌우·위아래로 스크롤할 수 있어요.</span></div><div class="map-scroll" tabindex="0" role="region" aria-label="주분야별 활동 마인드맵"><svg class="mindmap" viewBox="0 0 980 ${h}" width="980" height="${h}" aria-label="내 활동바구니에서 주분야와 활동으로 연결된 마인드맵">${branches}${leaves}<rect x="15" y="${rootY-37}" width="160" height="74" rx="18" fill="#166654"/><text x="95" y="${rootY-4}" text-anchor="middle" fill="white">내 활동바구니</text><text x="95" y="${rootY+19}" text-anchor="middle" fill="#cbe8db">${items.length}개의 가능성</text></svg></div></section>`;
 }
 function detail(id){
  const a=byId.get(id);if(!a)return;const saved=basket.has(id);
  $('#detail-content').innerHTML=`<div class="dialog-top"><span class="eyebrow">ACTIVITY DETAIL</span><button class="close" data-close aria-label="상세 닫기">×</button></div><span class="detail-icon" style="color:${color(a.primary)}" aria-hidden="true">${icons[a.primary]||'✦'}</span><h2>${esc(a.name)}</h2><div class="chosen-fields">${pill(a.primary,'green')}${a.related.map(f=>pill(f)).join('')}</div><dl>${[['범주',a.category],['소범주',a.subcategory],['계열구분',a.track],['진행 시기',a.schedule||'시기 미정'],['활동방식',a.methods.join(' / ')],['주관부서',a.department||'미정'],['근거 쪽수',a.pages]].filter(([,v])=>v).map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${a.note?`<div class="detail-note"><strong>분류 참고</strong><p>${esc(a.note)}</p></div>`:''}<p class="detail-disclaimer">일정과 참여 조건은 담당 부서에 확인해 주세요.</p><button class="button ${saved?'ghost':'primary'} full" ${saved?`data-remove="${id}"`:`data-direct-add="${id}"`}>${saved?'바구니에서 빼기':'활동 바구니에 담기'}</button>`;
  if(!$('#detail').open)$('#detail').showModal();
 }
 function add(ids){let n=0;for(const id of ids){if(byId.has(id)&&!basket.has(id)){basket.add(id);n++;}selected.delete(id);}save();render();toast(`${n}개 활동을 바구니에 담았어요.`);}
 function exportPlan(){
  const items=[...basket].map(id=>byId.get(id)).filter(Boolean).sort(C.compare);
  const text='KISH 활동바구니\n\n'+items.map((a,i)=>`${i+1}. ${a.name}\n   주분야: ${a.primary}\n   연관분야: ${a.related.join(', ')||'없음'}\n   시기: ${a.schedule}\n   활동방식: ${a.methods.join(', ')}\n   담당: ${a.department}`).join('\n\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='KISH_나의_활동계획.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 document.addEventListener('change',e=>{
  const t=e.target;
  if(t.name==='field'){t.checked?interest.add(t.value):interest.delete(t.value);t.closest('.field-card').classList.toggle('chosen',t.checked);$('#interest-count').textContent=`${interest.size}개 분야 선택`;$('#interest-next').disabled=!interest.size;}
  if(t.dataset.select){t.checked?selected.add(t.dataset.select):selected.delete(t.dataset.select);t.closest('.activity-card').classList.toggle('checked',t.checked);updateCounts();}
  if(['category','period','method'].includes(t.id)){filters[t.id]=t.value;limit=24;renderResults();}
  if(t.id==='map-field'){mapField=t.value;renderBasket();$('#map-field').focus();}
 });
 document.addEventListener('input',e=>{if(e.target.id==='search'){filters.q=e.target.value;limit=24;renderResults();}});
 document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-detail],[data-map-field]');if(!t)return;
  if(t.dataset.detail){detail(t.dataset.detail);return;}
  if(t.hasAttribute('data-close')){$('#detail').close();return;}
  if(t.dataset.directAdd){add([t.dataset.directAdd]);detail(t.dataset.directAdd);return;}
  if(t.dataset.remove){const id=t.dataset.remove;basket.delete(id);selected.delete(id);save();if($('#detail').open)$('#detail').close();render();toast('바구니에서 활동을 뺐어요.');return;}
  if(t.dataset.view){view=t.dataset.view;renderBasket();$(`[data-view="${view}"]`).focus();return;}
  if(t.dataset.mapField){mapField=t.dataset.mapField;renderBasket();return;}
  switch(t.id){
   case 'interest-next':if(interest.size){interestStep=2;filters.q='';limit=24;render();$('#main').focus();}break;
   case 'change-fields':interestStep=1;render();break;
   case 'reset-empty-filters':
   case 'reset-filters':Object.assign(filters,{q:'',category:'',period:'',method:''});limit=24;renderExplore();break;
   case 'load-more':limit+=24;renderResults();break;
   case 'select-visible':filtered().slice(0,limit).filter(a=>!basket.has(a.id)).forEach(a=>selected.add(a.id));renderResults();break;
   case 'clear-selection':selected.clear();renderResults();break;
   case 'add-basket':add([...selected]);break;
   case 'clear-basket':if(confirm('바구니에 담은 모든 활동을 비울까요?')){basket.clear();save();renderBasket();toast('활동바구니를 비웠어요.');}break;
   case 'start-exploring':location.hash='discover';break;
   case 'export-plan':exportPlan();break;
  }
 });
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('svg [role="button"]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 $('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=$('#detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#detail').close();}});
 function route(){const next=location.hash.slice(1);tab=['interest','discover','all','basket'].includes(next)?next:'interest';limit=24;render();}
 window.addEventListener('hashchange',route);
 window.addEventListener('storage',e=>{if(e.key===KEY){try{const raw=JSON.parse(e.newValue||'[]');if(Array.isArray(raw)){basket=new Set(raw.filter(id=>byId.has(id)));for(const id of basket)selected.delete(id);render();}}catch{}}});
 route();
})();
