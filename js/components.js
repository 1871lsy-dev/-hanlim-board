// 렌더 헬퍼
function re(){render();}
function chkAnim(){S.chk=true;re();setTimeout(()=>{S.chk=false;re();},1200);}
function cm(){S.modal=null;S.detTask=null;S.viewJ=null;re();}

// DOM 빌더
function el(tag,attrs,...ch){
  const e=document.createElement(tag);
  for(const[k,v]of Object.entries(attrs||{})){
    if(k==="cls")e.className=v;
    else if(k==="style"&&typeof v==="object")Object.assign(e.style,v);
    else if(k.startsWith("on")&&typeof v==="function")e.addEventListener(k.slice(2).toLowerCase(),v);
    else e.setAttribute(k,v);
  }
  for(const c of ch){if(c==null||c===false)continue;e.appendChild(typeof c==="string"?document.createTextNode(c):c);}
  return e;
}

// UI 컴포넌트
function av(name,size=26){
  if(!name||name==="모두")return el("div",{cls:"av",style:{width:size+"px",height:size+"px",background:"#E5E7EB",fontSize:(size*.4)+"px"}},"👥");
  const color=mc(name);
  return el("div",{cls:"av",style:{width:size+"px",height:size+"px",background:color+"22",border:"1.5px solid "+color+"66",fontSize:(size*.42)+"px",color,fontWeight:700}},name[0]);
}
function pill(label,bg,color){return el("span",{cls:"pill",style:{background:bg,color}},label);}
function modal(title,body){
  const ov=el("div",{cls:"ov",onClick:cm});
  ov.appendChild(el("div",{cls:"sht",onClick:e=>e.stopPropagation()},el("div",{cls:"hdl"}),el("div",{cls:"shtitle"},title),body));
  return ov;
}
function asel(selected,onChange){
  const isAll=!selected||selected==="모두"||(Array.isArray(selected)&&selected.includes("모두"));
  const wrap=el("div",{cls:"asel"});
  wrap.appendChild(el("button",{style:{padding:"5px 14px",borderRadius:999,border:"none",background:isAll?"#6366F1":"#E2E8F0",color:isAll?"#fff":"#374151",fontWeight:isAll?700:400,fontSize:13,marginBottom:"4px",cursor:"pointer"},onClick:()=>onChange("모두")},"👥 모두"));
  const grid=el("div",{cls:"agrid"});
  S.members.forEach(m=>{
    const chk=!isAll&&Array.isArray(selected)&&selected.includes(m.name);
    grid.appendChild(el("button",{cls:"abtn",style:{borderColor:chk?m.color:"#E5E7EB",background:chk?m.color+"22":"#fff",color:chk?m.color:"#374151",fontWeight:chk?700:400},
      onClick:()=>{const cur=isAll?[]:(Array.isArray(selected)?[...selected]:[]);const nxt=cur.includes(m.name)?cur.filter(x=>x!==m.name):[...cur,m.name];onChange(nxt.length===0?"모두":nxt);}
    },el("div",{style:{width:"8px",height:"8px",borderRadius:"50%",background:m.color,flexShrink:0}}),m.name));
  });
  wrap.appendChild(grid);return wrap;
}
function tcard(task){
  const p=PS[task.priority],d=dueStatus(task.due,task.col),c=CS[task.col];
  const first=Array.isArray(task.assignee)?task.assignee[0]:task.assignee;
  return el("div",{cls:"card"+(d?" urg":""),onClick:()=>{S.detTask=task;S.modal="detail";re();}},
    el("div",{style:{display:"flex",justifyContent:"space-between",gap:"8px",marginBottom:"8px",alignItems:"flex-start"}},
      el("div",{style:{fontSize:"14px",fontWeight:500,lineHeight:1.4,flex:1}},task.title),pill(task.priority,p.bg,p.text)
    ),
    el("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"}},
      el("div",{style:{display:"flex",alignItems:"center",gap:"5px"}},av(first,20),el("span",{style:{fontSize:"11px",color:"#6B7280"}},al(task.assignee))),
      el("div",{style:{display:"flex",gap:"5px"}},...(d?[pill(d.label,d.bg,d.color)]:[]),pill(task.col,c.light,c.text))
    )
  );
}
function ticon(name,active){
  const c=active?"#6366F1":"#9CA3AF";
  const paths={홈:`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,칸반:`<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="11" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>`,일정:`<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,반복:`<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>`,통계:`<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,일지:`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`};
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("width","20");svg.setAttribute("height","20");svg.setAttribute("viewBox","0 0 24 24");
  svg.setAttribute("fill","none");svg.setAttribute("stroke",c);svg.setAttribute("stroke-width","2");
  svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
  svg.innerHTML=paths[name]||"";return svg;
}

// 주간 달력
function weekCal(){
  const wrap=el("div",{cls:"wc"});
  const days=[];for(let i=0;i<7;i++){const d=new Date(now);d.setDate(now.getDate()+i);days.push(d);}
  const months=[...new Set(days.map(d=>d.getMonth()))].map(m=>(m+1)+"월").join("·");
  wrap.appendChild(el("div",{style:{fontSize:"12px",fontWeight:700,color:"#6B7280",marginBottom:"10px"}},months+" 주간"));
  const row=el("div",{cls:"wr"}),detArea=el("div",null);
  days.forEach(d=>{
    const dstr=d.toISOString().split("T")[0];
    const isSel=dstr===S.calDay,isToday=dstr===TODAY,dow=d.getDay();
    const tc=S.tasks.filter(t=>t.due===dstr&&t.col!=="완료").length;
    const sc=S.schedules.filter(s=>s.date===dstr).length;
    const rc=S.recurring.filter(r=>r.days.includes(dow)).length;
    const tot=tc+sc+rc;
    const wdC=isSel?"rgba(255,255,255,.8)":isToday?"#6366F1":dow===0?"#EF4444":dow===6?"#3B82F6":"#9CA3AF";
    const ddC=isSel?"#fff":isToday?"#6366F1":dow===0?"#EF4444":dow===6?"#3B82F6":"#111827";
    const cell=el("div",{cls:"wcel"+(isSel?" sel":isToday?" tday":""),onClick:()=>{S.calDay=dstr;renderDet();}});
    cell.appendChild(el("div",{cls:"wd",style:{color:wdC}},DAYS[dow]));
    cell.appendChild(el("div",{cls:"wdd",style:{color:ddC}},String(d.getDate())));
    const dots=el("div",{cls:"dots"});
    for(let i=0;i<Math.min(tot,3);i++)dots.appendChild(el("div",{cls:"dot"}));
    cell.appendChild(dots);row.appendChild(cell);
  });
  wrap.appendChild(row);wrap.appendChild(detArea);
  function renderDet(){
    detArea.innerHTML="";
    const dstr=S.calDay,sd=new Date(dstr+"T00:00:00"),sdow=sd.getDay();
    const selT=S.tasks.filter(t=>t.due===dstr&&t.col!=="완료");
    const selS=S.schedules.filter(s=>s.date===dstr);
    const selR=S.recurring.filter(r=>r.days.includes(sdow));
    const tot=selT.length+selS.length+selR.length;
    const box=el("div",{cls:"wdet"});
    box.appendChild(el("div",{style:{fontSize:"12px",fontWeight:700,color:dstr===TODAY?"#6366F1":"#374151",marginBottom:"8px"}},(sd.getMonth()+1)+"월 "+sd.getDate()+"일 ("+DAYS[sdow]+")"+(dstr===TODAY?" · 오늘":"")+" — "+tot+"건"));
    if(tot===0){box.appendChild(el("div",{style:{fontSize:"12px",color:"#9CA3AF",textAlign:"center",padding:"8px 0"}},"일정 없음"));detArea.appendChild(box);return;}
    selT.forEach(t=>{const p=PS[t.priority];box.appendChild(el("div",{cls:"det-item",style:{background:"#F8FAFC",border:"1px solid #E5E7EB"}},el("div",{style:{width:"6px",height:"6px",borderRadius:"50%",background:p.text,flexShrink:0}}),el("div",{style:{fontSize:"12px",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},t.title),pill(t.priority,p.bg,p.text)));});
    selS.forEach(s=>{box.appendChild(el("div",{cls:"det-item",style:{background:"#F5F3FF",border:"1px solid #EDE9FE"}},el("div",{style:{width:"6px",height:"6px",borderRadius:"50%",background:"#8B5CF6",flexShrink:0}}),el("div",{style:{fontSize:"12px",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},s.member+" · "+s.content),el("span",{style:{fontSize:"10px",color:"#8B5CF6"}},"일정")));});
    selR.forEach(r=>{box.appendChild(el("div",{cls:"det-item",style:{background:"#FFF7ED",border:"1px solid #FED7AA"}},el("div",{style:{width:"6px",height:"6px",borderRadius:"50%",background:"#F97316",flexShrink:0}}),el("div",{style:{fontSize:"12px",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},r.title),el("span",{style:{fontSize:"10px",color:"#F97316"}},"🔁")));});
    detArea.appendChild(box);
  }
  renderDet();return wrap;
}
