
let DATA=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const norm=s=>String(s??"").toLowerCase().replace(/\s+/g,"");
const fmt=s=>{const m=String(s||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[1]}. ${m[2]}. ${m[3]}`:String(s||"")};
const asset=s=>String(s||"").replace(/^\/+/,"");

async function loadData(){
  try{
    const names=["site","faq","members","schedule","posts","progress","place"];
    const vals=await Promise.all(names.map(async n=>{
      const r=await fetch(`data/${n}.json?v=${Date.now()}`,{cache:"no-store"});
      if(!r.ok) throw new Error(n);
      return r.json();
    }));
    DATA=Object.fromEntries(names.map((n,i)=>[n,vals[i]]));
  }catch(e){
    DATA=window.FALLBACK_DATA;
    if(location.protocol==="file:"){
      const el=document.getElementById("loadError");
      el.hidden=false;
      el.innerHTML="<b>로컬 미리보기 모드</b><br>현재 ZIP에 포함된 초기 데이터로 표시됩니다. Pages CMS에서 저장한 최신 내용은 배포된 GitHub Pages 주소에서 확인하세요.";
    }
  }
  init();
}

function site(){
  const C=DATA.site;
  document.title=C.browserTitle||C.siteTitle;
  siteTitle.textContent=C.siteTitle||"";
  siteSubtitle.textContent=C.siteSubtitle||"";
  mainEyebrow.textContent=C.main?.eyebrow||"";
  mainTitle.textContent=C.main?.title||"";
  mainDescription.textContent=C.main?.description||"";
  noticeTitle.textContent=C.main?.noticeTitle||"";
  noticeText.textContent=C.main?.noticeText||"";
  quickFaqTitle.textContent=C.main?.quickFaqTitle||"자주 묻는 질문";
  quickFaqDescription.textContent=C.main?.quickFaqDescription||"답변한 문의 내용 등을 확인할 수 있습니다.";
  quickMembersTitle.textContent=C.main?.quickMembersTitle||"협력물";
  quickMembersDescription.textContent=C.main?.quickMembersDescription||"협력진과 협력물을 확인할 수 있습니다.";
  quickScheduleTitle.textContent=C.main?.quickScheduleTitle||"일정";
  quickScheduleDescription.textContent=C.main?.quickScheduleDescription||"행사 진행 일정을 확인할 수 있습니다.";
  if(document.getElementById("faqPageDescription")) faqPageDescription.textContent=C.main?.quickFaqDescription||"답변한 문의 내용 등을 확인할 수 있습니다.";
  if(document.getElementById("membersPageDescription")) membersPageDescription.textContent=C.main?.quickMembersDescription||"협력진과 협력물을 확인할 수 있습니다.";
  if(document.getElementById("schedulePageDescription")) schedulePageDescription.textContent=C.main?.quickScheduleDescription||"행사 진행 일정을 확인할 수 있습니다.";
  if(document.getElementById("contactEmailLink")){
    contactEmailLink.textContent=C.contactEmail||"";
    contactEmailLink.href=`mailto:${C.contactEmail||""}`;
  }
  footerText.textContent=`${C.siteTitle||""} · ARCHIVE`;
  if(C.accentColor) document.documentElement.style.setProperty("--lav",C.accentColor);
  if(C.accentDark) document.documentElement.style.setProperty("--lav-dark",C.accentDark);
  if(C.heroHeight) document.documentElement.style.setProperty("--hero-height",`${Number(C.heroHeight)}px`);
  if(C.backgroundColor) document.body.style.backgroundColor=C.backgroundColor;
  const heroImageEl=document.getElementById("heroImage");
  if(heroImageEl){
    heroImageEl.src=asset(C.heroImage||"assets/uploads/header.png");
    heroImageEl.alt=C.siteTitle||"三生佳約";
  }
}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
}
function renderPosts(){
  postList.innerHTML=DATA.posts.map(x=>`<div class="post-row"><span class="badge">${esc(x.type)}</span><span title="${esc(x.body)}">${esc(x.title)}</span><span class="date">${esc(fmt(x.date))}</span></div>`).join("");
}
function renderFaq(cat="전체"){
  const rows=cat==="전체"?DATA.faq:DATA.faq.filter(x=>x.category===cat);
  faqList.innerHTML=rows.map(x=>`<div class="faq"><button class="faq-q"><span><b style="color:var(--lav-dark);margin-right:7px">Q.</b>${esc(x.question)}</span><span class="plus">＋</span></button><div class="faq-a"><b style="color:var(--lav-dark);margin-right:7px">A.</b>${esc(x.answer)}</div></div>`).join("");
  faqList.querySelectorAll(".faq-q").forEach(q=>q.onclick=()=>q.parentElement.classList.toggle("open"));
}
function filters(){
  const cats=["전체",...new Set(DATA.faq.map(x=>x.category).filter(Boolean))];
  faqFilters.innerHTML=cats.map((c,i)=>`<button class="filter ${i===0?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  faqFilters.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{faqFilters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderFaq(b.dataset.cat)});
}
function members(){
  memberList.innerHTML=DATA.members.map(x=>`<div class="member"><div class="role">${esc(x.role)}</div><h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p></div>`).join("");
}

function scheduleLabel(x){
  const value=String(x?.date||"").trim();
  if(!value) return "미정";
  // 예전 ISO 형식 데이터는 보기 좋게 변환하고,
  // 직접 입력한 텍스트는 그대로 표시합니다.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? fmt(value) : value;
}

function scheduleView(){
  timeline.innerHTML=[...DATA.schedule]
    .map(x=>`<div class="event"><div class="when">${esc(scheduleLabel(x))}</div><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></div>`)
    .join("");
}
function search(){
  const raw=globalSearch.value.trim(),q=norm(raw),out=[];showView("search");
  if(q){
    DATA.posts.forEach(x=>{if(norm([x.type,x.title,x.date,x.body].join(" ")).includes(q))out.push({type:"NOTICE",title:x.title,text:x.body})});
    DATA.faq.forEach(x=>{const k=x.keywords||[],h=norm([x.category,x.question,x.answer,...k].join(" "));if(h.includes(q)||k.some(v=>q.includes(norm(v))))out.push({type:"질의응답",title:x.question,text:x.answer})});
    DATA.members.forEach(x=>{if(norm([x.role,x.name,x.desc].join(" ")).includes(q))out.push({type:"협력물",title:x.name,text:`${x.role||""} · ${x.desc||""}`})});
    DATA.schedule.forEach(x=>{if(norm([x.date,x.title,x.desc,"미정"].join(" ")).includes(q))out.push({type:"일정",title:x.title,text:`${scheduleLabel(x)} · ${x.desc||""}`})});
    const p=DATA.place||{};
    if(norm([p.status,p.area,p.name,p.address,p.note].join(" ")).includes(q))out.push({type:"장소",title:p.name||p.area||"장소 안내",text:[p.status,p.address||p.area,p.note].filter(Boolean).join(" · ")});
  }
  searchSummary.textContent=raw?`"${raw}" 검색 결과 ${out.length}건`:"검색어를 입력해주세요.";
  searchResults.innerHTML=out.length?out.map(x=>`<div class="result"><div class="type">${esc(x.type)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join(""):`<div class="empty">${raw?"일치하는 내용을 찾지 못했습니다.":"상단 검색창에 검색어를 입력해주세요."}</div>`;
}
function addMsg(text,who="bot",html=false){
  const r=document.createElement("div"),b=document.createElement("div");r.className=`msg ${who}`;b.className="bubble";html?b.innerHTML=text:b.textContent=text;r.appendChild(b);messages.appendChild(r);messages.scrollTop=messages.scrollHeight;
}
function score(input,item){
  const q=norm(input);let s=0,qq=norm(item.question);if(qq.includes(q)||q.includes(qq))s+=8;(item.keywords||[]).forEach(k=>{if(q.includes(norm(k)))s+=3});input.toLowerCase().split(/[\s?!.~,]+/).filter(x=>x.length>1).forEach(t=>{if((item.question+" "+item.answer).toLowerCase().includes(t))s++});return s;
}
function chat(){
  chatFab.onclick=()=>chatbox.classList.toggle("open");chatClose.onclick=()=>chatbox.classList.remove("open");
  addMsg("안녕하세요. 등록된 질의응답을 기준으로 안내해드려요.\n예: “카페 장소는 어디인가요?”");
  chatForm.onsubmit=e=>{e.preventDefault();const val=chatInput.value.trim();if(!val)return;addMsg(val,"user");chatInput.value="";setTimeout(()=>{const r=DATA.faq.map(x=>({x,score:score(val,x)})).sort((a,b)=>b.score-a.score)[0];if(r&&r.score>=3)addMsg(`${r.x.answer}\n\n참고 질의응답 · ${r.x.question}`);else{const em=DATA.site.contactEmail||"";const sub=encodeURIComponent(`[${DATA.site.siteTitle||"사이트"} 문의]`),body=encodeURIComponent(`문의 내용:\n${val}\n\n`);addMsg(`등록된 안내에서 해당 질문의 답을 찾지 못했습니다.<br><br>자세한 문의는 <a class="mail-link" href="mailto:${esc(em)}?subject=${sub}&body=${body}">${esc(em)}</a> 로 부탁드립니다.`,"bot",true)}},200)};
}


function renderProgress(){
  const rows=Array.isArray(DATA.progress)?DATA.progress:[];
  const listEl=document.getElementById("progressList");
  const countEl=document.getElementById("progressCount");
  const fillEl=document.getElementById("progressFill");
  if(!listEl || !countEl || !fillEl) return;

  const done=rows.filter(x=>x.done===true).length;
  const percent=rows.length?Math.round(done/rows.length*100):0;

  countEl.textContent=`${done} / ${rows.length}`;
  fillEl.style.width=`${percent}%`;
  listEl.innerHTML=rows.length
    ? rows.map(x=>`
      <div class="progress-item ${x.done===true?"done":""}">
        <span class="progress-check" aria-hidden="true">${x.done===true?"✓":"○"}</span>
        <span>${esc(x.title)}</span>
      </div>
    `).join("")
    : '<div class="widget-empty">등록된 진행 항목이 없습니다.</div>';
}

function renderPlace(){
  const p=DATA.place||{};
  const statusEl=document.getElementById("placeStatus");
  const areaEl=document.getElementById("placeArea");
  const nameEl=document.getElementById("placeName");
  const addressEl=document.getElementById("placeAddress");
  const noteEl=document.getElementById("placeNote");
  const mapEl=document.getElementById("placeMapBtn");
  if(!statusEl || !areaEl || !nameEl || !addressEl || !noteEl || !mapEl) return;

  statusEl.textContent=p.status||"상세 장소 추후 공개";
  areaEl.textContent=p.area||"홍대 인근";

  const hasName=Boolean(String(p.name||"").trim());
  nameEl.hidden=!hasName;
  nameEl.textContent=hasName?p.name:"";

  const hasAddress=Boolean(String(p.address||"").trim());
  addressEl.hidden=!hasAddress;
  addressEl.textContent=hasAddress?p.address:"";

  noteEl.textContent=p.note||"";

  const mapUrl=String(p.mapUrl||"").trim();
  mapEl.hidden=!mapUrl;
  if(mapUrl) mapEl.href=mapUrl;
}

function parseIsoDate(value){
  const m=String(value||"").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return null;
  return {y:Number(m[1]),m:Number(m[2]),d:Number(m[3])};
}
function calendarDate(value){
  const d=parseIsoDate(value);
  return d?`${String(d.y).padStart(4,"0")}${String(d.m).padStart(2,"0")}${String(d.d).padStart(2,"0")}`:"";
}
function calendarDayAfter(value){
  const d=parseIsoDate(value);
  if(!d) return "";
  const date=new Date(Date.UTC(d.y,d.m-1,d.d+1));
  return `${date.getUTCFullYear()}${String(date.getUTCMonth()+1).padStart(2,"0")}${String(date.getUTCDate()).padStart(2,"0")}`;
}
function icsEscape(value){
  return String(value||"")
    .replace(/\\/g,"\\\\")
    .replace(/\r?\n/g,"\\n")
    .replace(/,/g,"\\,")
    .replace(/;/g,"\\;");
}
function renderCalendarRange(){
  const el=document.getElementById("calendarRange");
  if(!el) return;
  const s=parseIsoDate(DATA?.site?.eventDate);
  const e=parseIsoDate(DATA?.site?.eventEndDate||DATA?.site?.eventDate);
  if(!s){
    el.textContent="행사 일정 미정";
    return;
  }
  const sy=String(s.y),sm=String(s.m).padStart(2,"0"),sd=String(s.d).padStart(2,"0");
  if(e && s.y===e.y && s.m===e.m){
    el.textContent=`${sy}.${sm}.${sd} — ${String(e.m).padStart(2,"0")}.${String(e.d).padStart(2,"0")}`;
  }else if(e){
    el.textContent=`${sy}.${sm}.${sd} — ${e.y}.${String(e.m).padStart(2,"0")}.${String(e.d).padStart(2,"0")}`;
  }else{
    el.textContent=`${sy}.${sm}.${sd}`;
  }
}
function saveCalendar(){
  const start=calendarDate(DATA?.site?.eventDate);
  const endExclusive=calendarDayAfter(DATA?.site?.eventEndDate||DATA?.site?.eventDate);
  if(!start || !endExclusive){
    alert("저장할 행사 날짜가 아직 설정되지 않았습니다.");
    return;
  }

  const place=DATA.place||{};
  const location=[place.name,place.address||place.area].filter(Boolean).join(" · ");
  const summary=DATA?.site?.siteTitle||"三生佳約";
  const description="2027 자하설영 CP 카페 · 2027년 12월 18일~19일";
  const now=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");

  const lines=[
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Samsaeng Gayak//JSCAFE//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:samsaenggayak-${start}@samsaenggayack.github.io`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${endExclusive}`,
    `SUMMARY:${icsEscape(summary)}`,
    `LOCATION:${icsEscape(location)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="samsaenggayak-2027.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function renderDday(){
  const startRaw=String(DATA?.site?.eventDate||"2027-12-18").trim();
  const endRaw=String(DATA?.site?.eventEndDate||"2027-12-19").trim();
  const countEl=document.getElementById("ddayCount");
  const dateEl=document.getElementById("ddayDate");
  const noteEl=document.getElementById("ddayNote");
  if(!countEl || !dateEl) return;

  const parseDate=value=>{
    const m=String(value||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return null;
    return {y:Number(m[1]),m:Number(m[2]),d:Number(m[3])};
  };
  const start=parseDate(startRaw),end=parseDate(endRaw);

  if(!start){
    countEl.textContent="날짜 미정";
    dateEl.textContent=startRaw||"미정";
    if(noteEl) noteEl.textContent="";
    return;
  }

  const startUtc=Date.UTC(start.y,start.m-1,start.d);
  const endDate=end||start;
  const endUtc=Date.UTC(endDate.y,endDate.m-1,endDate.d);
  const now=new Date();
  const today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
  const untilStart=Math.round((startUtc-today)/86400000);

  if(today<startUtc) countEl.textContent=`D-${untilStart}`;
  else if(today===startUtc) countEl.textContent="D-DAY";
  else if(today<=endUtc) countEl.textContent=`DAY ${Math.round((today-startUtc)/86400000)+1}`;
  else countEl.textContent="CLOSED";

  const sy=String(start.y),sm=String(start.m).padStart(2,"0"),sd=String(start.d).padStart(2,"0");
  const ey=String(endDate.y),em=String(endDate.m).padStart(2,"0"),ed=String(endDate.d).padStart(2,"0");
  dateEl.textContent=(start.y===endDate.y && start.m===endDate.m)
    ? `${sy}.${sm}.${sd} — ${em}.${ed}`
    : `${sy}.${sm}.${sd} — ${ey}.${em}.${ed}`;
  if(noteEl) noteEl.textContent="三生佳約 · 2 DAYS";
}

function init(){
  renderDday();
  site();renderPosts();filters();renderFaq();members();scheduleView();renderProgress();renderPlace();renderCalendarRange();chat();
  document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>showView(b.dataset.view));
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showView(b.dataset.go));
  searchBtn.onclick=search;globalSearch.onkeydown=e=>{if(e.key==="Enter")search()};
  const calendarBtn=document.getElementById("calendarSaveBtn");
  if(calendarBtn) calendarBtn.onclick=saveCalendar;
}
loadData();
