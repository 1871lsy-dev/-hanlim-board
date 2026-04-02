// 모달
function mSettings(){
  const box=el("div",{style:{background:"#F8FAFC",borderRadius:"12px",border:"1px solid #E5E7EB",padding:"10px"}});
  S.members.forEach((m,idx)=>{
    const ni=el("input",{cls:"ni",value:m.name});
    ni.addEventListener("change",e=>{
      const nv=e.target.value.trim();if(!nv)return;
      const nm=[...S.members];nm[idx]={...nm[idx],name:nv};
      fbSave("members",nm);
    });
    const dot=el("div",{cls:"cd",style:{background:m.color,border:"2px solid "+m.color+"99"},onClick:()=>{S.palIdx=S.palIdx===idx?null:idx;re();}});
    const del=el("button",{style:{border:"none",background:"none",fontSize:"15px",color:"#EF4444",padding:"0 4px",flexShrink:0},onClick:()=>{const nm=S.members.filter((_,i)=>i!==idx);fbSave("members",nm);if(S.palIdx===idx)S.palIdx=null;}},"🗑");
    box.appendChild(el("div",{cls:"sr"},av(m.name,24),ni,dot,del));
    if(S.palIdx===idx){
      const pal=el("div",{cls:"pal"});
      COLORS.forEach(c=>{pal.appendChild(el("div",{cls:"pd"+(c===m.color?" sel":""),style:{background:c,borderColor:c===m.color?"#111827":c},onClick:()=>{const nm=[...S.members];nm[idx]={...nm[idx],color:c};fbSave("members",nm);S.palIdx=null;}});});
      box.appendChild(pal);
    }
  });
  return modal("⚙️ 팀원 설정",el("div",null,el("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:"10px"}},el("button",{cls:"badd",onClick:()=>{fbSave("members",[...S.members,{name:"새팀원"+(S.members.length+1),color:"#6366F1"}]);}},"+ 추가")),box));
}
function mDetail(){
  const task=S.detTask;
  function mv(col){fbSave("tasks/"+task.id,{...task,col});S.detTask={...task,col};if(col==="완료")chkAnim();else re();}
  function addC(){if(!S.newCmt.trim())return;const u={...task,comments:[...(task.comments||[]),S.newCmt.trim()]};fbSave("tasks/"+task.id,u);S.detTask=u;S.newCmt="";re();}
  const inp=el("input",{cls:"inp",style:{flex:1},placeholder:"댓글 입력..."});
  inp.value=S.newCmt;inp.addEventListener("input",e=>{S.newCmt=e.target.value;});inp.addEventListener("keydown",e=>{if(e.key==="Enter")addC();});
  return modal(task.title,el("div",null,
    el("div",{cls:"cbtns"},...COLS.map(c=>el("button",{cls:"cbtn",style:{background:task.col===c?"#6366F1":"#F3F4F6",color:task.col===c?"#fff":"#374151",fontWeight:task.col===c?700:400},onClick:()=>mv(c)},c))),
    el("div",{style:{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"center"}},av(Array.isArray(task.assignee)?task.assignee[0]:task.assignee,32),el("div",null,el("div",{style:{fontSize:"13px",fontWeight:600}},al(task.assignee)),el("div",{style:{fontSize:"11px",color:"#6B7280"}},"마감: "+task.due))),
    pill(task.priority,PS[task.priority].bg,PS[task.priority].text),
    el("div",{style:{marginTop:"14px",fontSize:"13px",fontWeight:600,color:"#374151"}},"💬 댓글 ("+((task.comments||[]).length)+")"),
    ...(task.comments||[]).map(c=>el("div",{style:{background:"#F8FAFC",borderRadius:"8px",padding:"8px 10px",marginTop:"6px",fontSize:"13px"}},c)),
    el("div",{style:{display:"flex",gap:"6px",marginTop:"10px"}},inp,el("button",{style:{padding:"10px 14px",borderRadius:"10px",background:"#6366F1",color:"#fff",border:"none",fontSize:"13px"},onClick:addC},"등록")),
    el("button",{cls:"bd",onClick:()=>{fbRemove("tasks/"+task.id);cm();}},"🗑 업무 삭제")
  ));
}
function mAddTask(){
  const f=S.tf;
  const ti=el("input",{cls:"inp",placeholder:"업무명 입력"});ti.value=f.title;ti.addEventListener("input",e=>{S.tf.title=e.target.value;});
  const cs=el("select",{cls:"inp"},...COLS.map(c=>el("option",{value:c},c)));cs.value=f.col;cs.addEventListener("change",e=>{S.tf.col=e.target.value;});
  const di=el("input",{type:"date",cls:"inp"});di.value=f.due;di.addEventListener("change",e=>{S.tf.due=e.target.value;});
  const aw=el("div");function rA(){aw.innerHTML="";aw.appendChild(asel(S.tf.assignee,v=>{S.tf.assignee=v;rA();}));}rA();
  return modal("업무 추가",el("div",null,
    el("label",{cls:"fl"},"업무명"),ti,el("label",{cls:"fl"},"담당자"),aw,
    el("label",{cls:"fl"},"우선순위"),el("div",{cls:"pbtns"},...["높음","중간","낮음"].map(p=>el("button",{cls:"pbtn"+(f.priority===p?" on":""),onClick:()=>{S.tf.priority=p;re();}},p))),
    el("label",{cls:"fl"},"열"),cs,el("label",{cls:"fl"},"마감일"),di,
    el("button",{cls:"bp",onClick:()=>{if(!S.tf.title.trim())return;const t={...S.tf,id:uid(),comments:[]};fbSave("tasks/"+t.id,t);S.tf={title:"",assignee:"모두",priority:"중간",due:TODAY,col:"할 일"};S.modal=null;chkAnim();}},"추가하기")
  ));
}
function mAddSch(){
  const f=S.sf;
  const ms=el("select",{cls:"inp"},...S.members.map(m=>el("option",{value:m.name},m.name)));ms.value=f.member;ms.addEventListener("change",e=>{S.sf.member=e.target.value;});
  const di=el("input",{type:"date",cls:"inp"});di.value=f.date;di.addEventListener("change",e=>{S.sf.date=e.target.value;});
  const ta=el("textarea",{cls:"inp",style:{height:"80px"},placeholder:"일정 내용"});ta.value=f.content;ta.addEventListener("input",e=>{S.sf.content=e.target.value;});
  return modal("일정 추가",el("div",null,
    el("label",{cls:"fl"},"담당자"),ms,el("label",{cls:"fl"},"날짜"),di,el("label",{cls:"fl"},"내용"),ta,
    el("button",{cls:"bp",onClick:()=>{if(!S.sf.content.trim())return;const s={...S.sf,id:uid()};fbSave("schedules/"+s.id,s);S.sf={member:"최근주",date:TODAY,content:""};S.modal=null;chkAnim();}},"추가하기")
  ));
}
function mAddRec(){
  const f=S.rf;
  const ti=el("input",{cls:"inp",placeholder:"반복 일정 제목"});ti.value=f.title;ti.addEventListener("input",e=>{S.rf.title=e.target.value;});
  function hs(val,cb){const s=el("select",{cls:"inp"},...HOURS.map(h=>el("option",{value:h},h+"시")));s.value=val;s.addEventListener("change",e=>cb(e.target.value));return s;}
  function ms(val,cb){const s=el("select",{cls:"inp"},...MINS.map(m=>el("option",{value:m},m+"분")));s.value=val;s.addEventListener("change",e=>cb(e.target.value));return s;}
  const ta=el("textarea",{cls:"inp",style:{height:"60px"},placeholder:"일정 내용"});ta.value=f.content;ta.addEventListener("input",e=>{S.rf.content=e.target.value;});
  const aw=el("div");function rA(){aw.innerHTML="";aw.appendChild(asel(S.rf.assignee,v=>{S.rf.assignee=v;rA();}));}rA();
  return modal("반복 일정 추가",el("div",null,
    el("label",{cls:"fl"},"제목"),ti,
    el("label",{cls:"fl"},"반복 요일"),el("div",{cls:"dbtns"},...DAYS.map((d,i)=>el("button",{cls:"dbtn"+(f.days.includes(i)?" on":""),onClick:()=>{S.rf.days=f.days.includes(i)?f.days.filter(x=>x!==i):[...f.days,i];re();}},d))),
    el("label",{cls:"fl"},"시작 시간"),el("div",{cls:"tr"},hs(f.startH,v=>{S.rf.startH=v;}),ms(f.startM,v=>{S.rf.startM=v;})),
    el("label",{cls:"fl"},"종료 시간"),el("div",{cls:"tr"},hs(f.endH,v=>{S.rf.endH=v;}),ms(f.endM,v=>{S.rf.endM=v;})),
    el("label",{cls:"fl"},"담당자"),aw,el("label",{cls:"fl"},"내용"),ta,
    el("button",{cls:"bp",onClick:()=>{if(!S.rf.title.trim()||S.rf.days.length===0)return;const r={...S.rf,id:uid()};fbSave("recurring/"+r.id,r);S.rf={title:"",days:[],startH:"09",startM:"00",endH:"10",endM:"00",content:"",assignee:"모두"};S.modal=null;chkAnim();}},"추가하기")
  ));
}
function mAddJournal(){
  const f=S.jf;
  const as=el("select",{cls:"inp"},...S.members.map(m=>el("option",{value:m.name},m.name)));as.value=f.author;as.addEventListener("change",e=>{S.jf.author=e.target.value;});
  const ta=el("textarea",{cls:"inp",style:{height:"120px"},placeholder:"오늘의 업무 내용을 기록하세요..."});ta.value=f.memo;ta.addEventListener("input",e=>{S.jf.memo=e.target.value;});
  return modal("업무 일지 작성",el("div",null,
    el("label",{cls:"fl"},"작성자"),as,el("label",{cls:"fl"},"내용"),ta,
    el("button",{cls:"bp",onClick:()=>{if(!S.jf.memo.trim())return;const j={id:uid(),date:TODAY,...S.jf};fbSave("journals/"+j.id,j);S.jf={author:"최근주",memo:""};S.modal=null;chkAnim();}},"💾 저장")
  ));
}
function mViewJournal(){
  const j=S.viewJ;
  return modal("업무 일지",el("div",null,
    el("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}},av(j.author,36),el("div",null,el("div",{style:{fontSize:"14px",fontWeight:700}},j.author),el("div",{style:{fontSize:"12px",color:"#9CA3AF"}},j.date))),
    el("div",{style:{fontSize:"14px",color:"#374151",lineHeight:"1.7",whiteSpace:"pre-wrap"}},j.memo),
    el("button",{cls:"bd",onClick:()=>{fbRemove("journals/"+j.id);cm();}},"🗑 삭제")
  ));
}
