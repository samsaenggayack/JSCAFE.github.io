
let DATA=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const norm=s=>String(s??"").toLowerCase().replace(/\s+/g,"");
const fmt=s=>{const m=String(s||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[1]}. ${m[2]}. ${m[3]}`:String(s||"")};
const asset=s=>String(s||"").replace(/^\/+/,"");

async function loadData(){
  try{
    const names=["site","faq","members","schedule","posts"];
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
  quickFaqDescription.textContent=C.main?.quickFaqDescription||"카페 이용과 방문에 관한 자주 묻는 질문을 확인합니다.";
  quickMembersTitle.textContent=C.main?.quickMembersTitle||"협력물";
  quickMembersDescription.textContent=C.main?.quickMembersDescription||"카페와 함께하는 협력 및 참여 정보를 확인합니다.";
  quickScheduleTitle.textContent=C.main?.quickScheduleTitle||"일정";
  quickScheduleDescription.textContent=C.main?.quickScheduleDescription||"카페 진행 일정과 중요한 날짜를 확인합니다.";
  footerText.textContent=`${C.siteTitle||""} · ARCHIVE`;
  if(C.accentColor) document.documentElement.style.setProperty("--lav",C.accentColor);
  if(C.accentDark) document.documentElement.style.setProperty("--lav-dark",C.accentDark);
  if(C.heroHeight) document.documentElement.style.setProperty("--hero-height",`${Number(C.heroHeight)}px`);
  if(C.backgroundColor) document.body.style.backgroundColor=C.backgroundColor;
  hero.style.backgroundImage=`linear-gradient(to bottom,rgba(255,255,255,.03),rgba(247,246,244,.15)),url("${asset(C.heroImage||"assets/uploads/header.png")}")`;
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
function scheduleView(){
  timeline.innerHTML=[...DATA.schedule].sort((a,b)=>String(a.date).localeCompare(String(b.date))).map(x=>`<div class="event"><div class="when">${esc(fmt(x.date))}</div><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></div>`).join("");
}
function search(){
  const raw=globalSearch.value.trim(),q=norm(raw),out=[];showView("search");
  if(q){
    DATA.posts.forEach(x=>{if(norm([x.type,x.title,x.date,x.body].join(" ")).includes(q))out.push({type:"NOTICE",title:x.title,text:x.body})});
    DATA.faq.forEach(x=>{const k=x.keywords||[],h=norm([x.category,x.question,x.answer,...k].join(" "));if(h.includes(q)||k.some(v=>q.includes(norm(v))))out.push({type:"Q&A",title:x.question,text:x.answer})});
    DATA.members.forEach(x=>{if(norm([x.role,x.name,x.desc].join(" ")).includes(q))out.push({type:"협력물",title:x.name,text:`${x.role||""} · ${x.desc||""}`})});
    DATA.schedule.forEach(x=>{if(norm([x.date,x.title,x.desc].join(" ")).includes(q))out.push({type:"SCHEDULE",title:x.title,text:`${fmt(x.date)} · ${x.desc||""}`})});
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
  addMsg("안녕하세요. 등록된 Q&A를 기준으로 안내해드려요.\n예: “카페 장소는 어디인가요?”");
  chatForm.onsubmit=e=>{e.preventDefault();const val=chatInput.value.trim();if(!val)return;addMsg(val,"user");chatInput.value="";setTimeout(()=>{const r=DATA.faq.map(x=>({x,score:score(val,x)})).sort((a,b)=>b.score-a.score)[0];if(r&&r.score>=3)addMsg(`${r.x.answer}\n\n참고 Q&A · ${r.x.question}`);else{const em=DATA.site.contactEmail||"";const sub=encodeURIComponent(`[${DATA.site.siteTitle||"사이트"} 문의]`),body=encodeURIComponent(`문의 내용:\n${val}\n\n`);addMsg(`등록된 안내에서 해당 질문의 답을 찾지 못했습니다.<br><br>자세한 문의는 <a class="mail-link" href="mailto:${esc(em)}?subject=${sub}&body=${body}">${esc(em)}</a> 로 부탁드립니다.`,"bot",true)}},200)};
}
function init(){
  site();renderPosts();filters();renderFaq();members();scheduleView();chat();
  document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>showView(b.dataset.view));
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showView(b.dataset.go));
  searchBtn.onclick=search;globalSearch.onkeydown=e=>{if(e.key==="Enter")search()};
}
loadData();
