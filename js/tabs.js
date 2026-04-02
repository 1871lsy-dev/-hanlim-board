// 탭 컨텐츠
function tabHome(){
  const todayT=S.tasks.filter(t=>t.due===TODAY&&t.col!=="완료");
  const urgT=S.tasks.filter(t=>dueStatus(t.due,t.col));
  const todayS=S.schedules.filter(s=>s.date===TODAY);
  const todayR=S.recurring.filter(r=>r.days.includes(DOW));
  const f=document.createDocumentFragment();
  f.appendChild(weekCal());
  if(urgT.length>0){f.appendChild(el("div",{cls:"ubox"},el("div",{style:{fontSize:"12px",fontWeight:700,color:"#991B1B",marginBottom:"8px"}},"⚠️ 긴급 업무 "+urgT.length+"건"),...urgT.map(t=>{const d=dueStatus(t.due,t.col);return el("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",fontSize:"13px"}},el("span",null,"• "+t.title),pill(d.label,d.bg,d.color));})));}
  f.appendChild(el("div",{cls:"sh"},el("div",{cls:"stitle"},"📋 오늘의 업무 ("+todayT.length+"건)"),el("button",{cls:"badd",onClick:()=>{S.modal="addTask";re();}},"+ 추가")));
  if(todayT.length===0)f.appendChild(el("div",{cls:"empty"},"오늘 예정된 업무가 없습니다 🎉"));
  todayT.forEach(t=>f.appendChild(tcard(t)));
  f.appendChild(el("div",{cls:"sh",style:{marginTop:"16px"}},el("div",{cls:"stitle"},"📅 오늘의 일정 ("+(todayS.length+todayR.length)+"건)"),el("button",{cls:"badd",onClick:()=>{S.modal="addSch";re();}},"+ 추가")));
  [...todayR.map(r=>({...r,isRec:true})),...todayS].forEach(s=>{f.appendChild(el("div",{cls:"si"},av(s.assignee||s.member,22),el("div",{style:{flex:1}},el("div",{style:{fontSize:"13px",fontWeight:500}},s.content||s.title),...(s.isRec?[el("span",{style:{fontSize:"11px",color:"#8B5CF6"}},"🔁 반복")]:[])),  ...(s.startH?[el("span",{style:{fontSize:"11px",color:"#6B7280"}},s.startH+":"+s.startM)]:[])));});
  f.appendChild(el("div",{cls:"sh",style:{marginTop:"20px"}},el("div",{cls:"stitle"},"👥 팀원 명단")));
  const chips=el("div",{cls:"chips"});
  S.members.forEach(m=>chips.appendChild(el("div",{cls:"chip"},el("div",{style:{width:"9px",height:"9px",borderRadius:"50%",background:m.color,flexShrink:0}}),el("span",null,m.name))));
  f.appendChild(chips);return f;
}
function tabKanban(){
  const kt=S.tasks.filter(t=>t.col===S.activeCol&&(S.filterM==="전체"||t.assignee===S.filterM||(Array.isArray(t.assignee)&&t.assignee.includes(S.filterM))));
  const f=document.createDocumentFragment();
  f.appendChild(el("div",{cls:"cbtns"},...COLS.map(c=>el("button",{cls:"cbtn",style:{background:S.activeCol===c?"#6366F1":"#E2E8F0",color:S.activeCol===c?"#fff":"#64748B",fontWeight:S.activeCol===c?700:400},onClick:()=>{S.activeCol=c;re();}},c+" ("+S.tasks.filter(t=>t.col===c).length+")"))));
  f.appendChild(el("div",{cls:"mf"},...["전체",...S.members.map(m=>m.name)].map(n=>el("button",{cls:"mfb"+(S.filterM===n?" on":""),onClick:()=>{S.filterM=n;re();}},n))));
  f.appendChild(el("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:"10px"}},el("button",{cls:"badd",onClick:()=>{S.modal="addTask";re();}},"+ 업무 추가")));
  if(kt.length===0)f.appendChild(el("div",{cls:"empty"},"해당 업무가 없습니다"));
  kt.forEach(t=>f.appendChild(tcard(t)));return f;
}
function tabSchedule(){
  const list=S.schedules.filter(s=>s.date===S.schedDay);
  const f=document.createDocumentFragment();
  f.appendChild(el("div",{cls:"sh"},el("div",{cls:"stitle"},"📅 일정 관리"),el("button",{cls:"badd",onClick:()=>{S.modal="addSch";re();}},"+ 추가")));
  const di=el("input",{type:"date",cls:"inp",style:{marginBottom:"12px"},value:S.schedDay});
  di.addEventListener("change",e=>{S.schedDay=e.target.value;re();});f.appendChild(di);
  if(list.length===0){f.appendChild(el("div",{cls:"empty"},"선택한 날짜에 일정이 없습니다"));return f;}
  list.forEach(s=>f.appendChild(el("div",{cls:"si"},av(s.member,26),el("div",{style:{flex:1}},el("div",{style:{fontSize:"13px",fontWeight:600}},s.member),el("div",{style:{fontSize:"13px",color:"#374151",marginTop:"2px"}},s.content)),el("button",{style:{border:"none",background:"none",fontSize:"16px",color:"#EF4444",padding:"4px"},onClick:()=>{fbRemove("schedules/"+s.id);}},"🗑"))));
  return f;
}
function tabRecurring(){
  const f=document.createDocumentFragment();
  f.appendChild(el("div",{cls:"sh"},el("div",{cls:"stitle"},"🔁 반복 일정"),el("button",{cls:"badd",onClick:()=>{S.modal="addRec";re();}},"+ 추가")));
  if(S.recurring.length===0){f.appendChild(el("div",{cls:"empty"},"등록된 반복 일정이 없습니다"));return f;}
  S.recurring.forEach(r=>f.appendChild(el("div",{cls:"rc"},el("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"6px"}},el("div",{style:{fontSize:"14px",fontWeight:600}},r.title),el("button",{style:{border:"none",background:"none",fontSize:"14px",color:"#EF4444"},onClick:()=>{fbRemove("recurring/"+r.id);}},"✕")),el("div",{style:{display:"flex",gap:"4px",marginBottom:"6px"}},...DAYS.map((d,i)=>el("span",{style:{width:"24px",height:"24px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,background:r.days.includes(i)?"#6366F1":"#F3F4F6",color:r.days.includes(i)?"#fff":"#9CA3AF"}},d))),el("div",{style:{fontSize:"12px",color:"#6B7280"}},r.startH+":"+r.startM+" ~ "+r.endH+":"+r.endM+" • "+al(r.assignee)),...(r.content?[el("div",{style:{fontSize:"12px",color:"#374151",marginTop:"4px"}},r.content)]:[]))));
  return f;
}
function tabStats(){
  const total=S.tasks.length,done=S.tasks.filter(t=>t.col==="완료").length,pct=Math.round(done/Math.max(total,1)*100);
  const f=document.createDocumentFragment();
  f.appendChild(el("div",{style:{fontSize:"15px",fontWeight:700,marginBottom:"12px"}},"📊 업무 통계"));
  f.appendChild(el("div",{style:{background:"#fff",borderRadius:"12px",border:"1px solid #E5E7EB",padding:"16px",marginBottom:"12px"}},el("div",{style:{fontSize:"13px",fontWeight:600,marginBottom:"10px"}},"전체 현황"),el("div",{style:{display:"flex",gap:"8px",marginBottom:"10px"}},...COLS.map(c=>{const cc=CS[c],cnt=S.tasks.filter(t=>t.col===c).length;return el("div",{style:{flex:1,background:cc.light,borderRadius:"10px",padding:"12px 8px",textAlign:"center"}},el("div",{style:{fontSize:"22px",fontWeight:700,color:cc.text}},String(cnt)),el("div",{style:{fontSize:"11px",color:cc.text,marginTop:"2px"}},c));})),el("div",{cls:"pb"},el("div",{cls:"pbar",style:{width:pct+"%",background:"#10B981"}})),el("div",{style:{fontSize:"11px",color:"#6B7280",textAlign:"right",marginTop:"4px"}},"완료율 "+pct+"%")));
  const byM=S.members.map(m=>{const mine=S.tasks.filter(t=>t.assignee===m.name||(Array.isArray(t.assignee)&&t.assignee.includes(m.name)));return{...m,total:mine.length,done:mine.filter(t=>t.col==="완료").length};}).filter(x=>x.total>0);
  if(byM.length>0)f.appendChild(el("div",{style:{background:"#fff",borderRadius:"12px",border:"1px solid #E5E7EB",padding:"16px"}},el("div",{style:{fontSize:"13px",fontWeight:600,marginBottom:"10px"}},"멤버별 현황"),...byM.map(s=>el("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}},av(s.name,28),el("div",{style:{flex:1}},el("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"13px",marginBottom:"3px"}},el("span",{style:{fontWeight:600}},s.name),el("span",{style:{color:"#6B7280",fontSize:"12px"}},s.done+"/"+s.total)),el("div",{cls:"pb",style:{height:"6px"}},el("div",{cls:"pbar",style:{width:Math.round(s.done/Math.max(s.total,1)*100)+"%",background:s.color}})))))));
  return f;
}
function tabJournal(){
  const f=document.createDocumentFragment();
  f.appendChild(el("div",{cls:"sh"},el("div",{cls:"stitle"},"📝 업무 일지"),el("button",{cls:"badd",onClick:()=>{S.modal="addJournal";re();}},"+ 작성")));
  if(S.journals.length===0){f.appendChild(el("div",{cls:"empty"},"작성된 일지가 없습니다"));return f;}
  S.journals.forEach(j=>f.appendChild(el("div",{cls:"card",onClick:()=>{S.viewJ=j;S.modal="viewJournal";re();}},el("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}},el("div",{style:{display:"flex",alignItems:"center",gap:"8px"}},av(j.author,22),el("span",{style:{fontSize:"13px",fontWeight:600}},j.author)),el("span",{style:{fontSize:"11px",color:"#9CA3AF"}},j.date)),el("div",{style:{fontSize:"13px",color:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},j.memo))));
  return f;
}
