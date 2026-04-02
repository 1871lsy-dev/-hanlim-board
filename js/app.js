// 메인 렌더 함수
function render(){
  const app=document.getElementById("app");
  app.innerHTML="";
  if(!S.loaded){
    app.appendChild(el("div",{cls:"loading"},el("div",{style:{fontSize:"32px"}},"⏳"),el("div",{style:{fontSize:"15px",fontWeight:600}},"데이터 불러오는 중...")));
    return;
  }
  if(S.chk){app.appendChild(el("div",{cls:"ca"},el("div",{style:{background:"#fff",borderRadius:"24px",padding:"28px 36px",boxShadow:"0 8px 32px rgba(0,0,0,.15)",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px"}},el("div",{style:{width:"56px",height:"56px",borderRadius:"50%",background:"#ECFDF5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px"}},"✅"),el("div",{style:{fontSize:"15px",fontWeight:700,color:"#065F46"}},"완료!"))));}
  app.appendChild(el("div",{cls:"sync-dot",title:"Firebase 연결됨"}));
  app.appendChild(el("div",{cls:"hdr"},el("div",{cls:"hdr-sub"},"한림바이오팜 업무 보드"),el("div",{cls:"hdr-date"},DATE_STR),el("button",{cls:"btn-gear",onClick:()=>{S.modal="settings";re();}},"⚙️"),el("div",{cls:"hdr-stats"},...COLS.map(c=>{const emoji={"할 일":"📋","진행 중":"⏳","완료":"✅"}[c];return el("div",{cls:"sbox"},el("div",{cls:"snum"},emoji+" "+S.tasks.filter(t=>t.col===c).length),el("div",{cls:"slbl"},c));}))));
  app.appendChild(el("div",{cls:"ttabs"},...TABS.map(t=>el("button",{cls:"ttab"+(S.tab===t?" on":""),onClick:()=>{S.tab=t;re();}},t))));
  const cnt=el("div",{cls:"cnt"});
  if(S.tab==="홈")cnt.appendChild(tabHome());
  else if(S.tab==="칸반")cnt.appendChild(tabKanban());
  else if(S.tab==="일정")cnt.appendChild(tabSchedule());
  else if(S.tab==="반복")cnt.appendChild(tabRecurring());
  else if(S.tab==="통계")cnt.appendChild(tabStats());
  else if(S.tab==="일지")cnt.appendChild(tabJournal());
  app.appendChild(cnt);
  app.appendChild(el("div",{cls:"btabs"},...TABS.map(t=>{const btn=el("button",{cls:"btab"+(S.tab===t?" on":""),onClick:()=>{S.tab=t;re();}});btn.appendChild(ticon(t,S.tab===t));btn.appendChild(el("span",null,t));return btn;})));
  let m=null;
  if(S.modal==="settings")m=mSettings();
  else if(S.modal==="detail"&&S.detTask)m=mDetail();
  else if(S.modal==="addTask")m=mAddTask();
  else if(S.modal==="addSch")m=mAddSch();
  else if(S.modal==="addRec")m=mAddRec();
  else if(S.modal==="addJournal")m=mAddJournal();
  else if(S.modal==="viewJournal"&&S.viewJ)m=mViewJournal();
  if(m)app.appendChild(m);
}

// Firebase 실시간 리스너
db.ref("hanlim").on("value", snap => {
  const d = snap.val();
  if (d) {
    if (d.members) S.members = Array.isArray(d.members) ? d.members : Object.values(d.members);
    if (d.tasks) S.tasks = Object.values(d.tasks);
    else S.tasks = [];
    if (d.schedules) S.schedules = Object.values(d.schedules);
    else S.schedules = [];
    if (d.recurring) S.recurring = Object.values(d.recurring).map(r=>({...r,days:Array.isArray(r.days)?r.days:[]}));
    else S.recurring = [];
    if (d.journals) S.journals = Object.values(d.journals).sort((a,b)=>b.date.localeCompare(a.date));
    else S.journals = [];
  } else {
    db.ref("hanlim").set({
      members: DEFAULT.members,
      tasks: toObj(DEFAULT.tasks),
      schedules: toObj(DEFAULT.schedules),
      recurring: toObj(DEFAULT.recurring),
      journals: toObj(DEFAULT.journals),
    });
  }
  S.loaded = true;
  re();
});

render();
