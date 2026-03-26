import { db } from "./firebase"; 
import { ref, onValue, set, push, remove, update } from "firebase/database"; 

const { useState, useEffect, useRef } = React;

// 여기서부터는 건드리지 마세요 (기존 코드 시작)
const DEFAULT_MEMBERS = [
  {name:"최근주",color:"#6366F1"},{name:"김건식",color:"#EC4899"}, ...
const DEFAULT_MEMBERS = [
  {name:"최근주",color:"#6366F1"},{name:"김건식",color:"#EC4899"},{name:"박종애",color:"#F59E0B"},
  {name:"장문식",color:"#10B981"},{name:"이수연",color:"#3B82F6"},{name:"손수현",color:"#EF4444"},
  {name:"전은진",color:"#8B5CF6"},{name:"정화연",color:"#14B8A6"},{name:"정소연",color:"#F97316"},
  {name:"신선옥",color:"#06B6D4"},{name:"이희수",color:"#84CC16"},{name:"김도현",color:"#A855F7"},
  {name:"최성희",color:"#0EA5E9"},{name:"송태호",color:"#D946EF"},{name:"김흥기",color:"#22C55E"},
  {name:"양희경",color:"#FB923C"},{name:"강선숙",color:"#64748B"},{name:"우희경",color:"#EAB308"},
];
const COLOR_OPTIONS = ["#6366F1","#EC4899","#F59E0B","#10B981","#3B82F6","#EF4444","#8B5CF6","#14B8A6","#F97316","#06B6D4","#84CC16","#A855F7","#0EA5E9","#D946EF","#22C55E","#FB923C","#64748B","#EAB308","#E11D48","#0891B2","#16A34A","#CA8A04","#7C3AED","#DB2777"];
const COLS = ["할 일","진행 중","완료"];
const WEEKDAYS = ["일","월","화","수","목","금","토"];
const WEEKDAY_FULL = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
const HOURS = Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
const MINUTES = ["00","10","20","30","40","50"];
const TABS = ["홈","칸반","일정","반복","통계","일지"];
const COL_STYLE = {"할 일":{dot:"#6366F1",light:"#EEF2FF",text:"#3730A3",border:"#C7D2FE"},"진행 중":{dot:"#F59E0B",light:"#FFFBEB",text:"#92400E",border:"#FDE68A"},"완료":{dot:"#10B981",light:"#ECFDF5",text:"#065F46",border:"#A7F3D0"}};
const PRIORITY_STYLE = {"높음":{bg:"#FEE2E2",text:"#991B1B",bar:"#EF4444"},"중간":{bg:"#FEF3C7",text:"#92400E",bar:"#F59E0B"},"낮음":{bg:"#D1FAE5",text:"#065F46",bar:"#10B981"}};
const DAY_COLORS = [{bg:"#FEE2E2",text:"#991B1B",border:"#FCA5A5"},{bg:"#EEF2FF",text:"#3730A3",border:"#A5B4FC"},{bg:"#FFFBEB",text:"#92400E",border:"#FCD34D"},{bg:"#ECFDF5",text:"#065F46",border:"#6EE7B7"},{bg:"#EFF6FF",text:"#1E40AF",border:"#93C5FD"},{bg:"#F5F3FF",text:"#5B21B6",border:"#C4B5FD"},{bg:"#FDF4FF",text:"#86198F",border:"#E879F9"}];

const DEFAULT_TASKS = [{id:"t1",title:"신제품 원료 수급 검토",assignee:"최근주",priority:"높음",due:"2026-03-25",col:"할 일",comments:[]},{id:"t2",title:"품질 관리 보고서 작성",assignee:"김건식",priority:"중간",due:"2026-03-28",col:"진행 중",comments:[]},{id:"t3",title:"GMP 감사 준비",assignee:"박종애",priority:"높음",due:"2026-03-30",col:"진행 중",comments:[]},{id:"t4",title:"거래처 미팅 자료 준비",assignee:"장문식",priority:"낮음",due:"2026-04-05",col:"할 일",comments:[]},{id:"t5",title:"1분기 생산 실적 집계",assignee:"이수연",priority:"중간",due:"2026-03-20",col:"완료",comments:[]},{id:"t6",title:"포장재 발주 확인",assignee:"손수현",priority:"높음",due:"2026-03-21",col:"할 일",comments:[]}];
const DEFAULT_SCHEDULES = [{id:"s1",member:"최근주",date:"2026-03-21",content:"오전 원료팀 회의"},{id:"s2",member:"김건식",date:"2026-03-21",content:"품질 점검 현장 방문"}];
const DEFAULT_RECURRING = [{id:"r1",title:"주간 팀 미팅",days:[1],startH:"09",startM:"00",endH:"10",endM:"00",content:"전체 업무 현황 공유",assignee:"모두",exceptions:[]},{id:"r2",title:"품질 점검 회의",days:[3],startH:"14",startM:"00",endH:"15",endM:"00",content:"품질 이슈 검토",assignee:"김건식",exceptions:[]}];
const DEFAULT_NOTICES = [{id:"n1",text:"한림바이오팜 업무 현황 보드에 오신 것을 환영합니다 🎉",active:true}];

const EMPTY_REC = {title:"",days:[],startH:"09",startM:"00",endH:"10",endM:"00",content:"",assignee:"모두",exceptions:[]};
const EMPTY_TASK = {title:"",priority:"중간",due:"",col:"할 일"};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function safeRec(r){return{...r,startH:r.startH||"09",startM:r.startM||"00",endH:r.endH||"10",endM:r.endM||"00",assignee:r.assignee||"모두",days:Array.isArray(r.days)?r.days:[],exceptions:Array.isArray(r.exceptions)?r.exceptions:[]};}
function timeLabel(h,m){return `${h}:${m}`;}
function dueStatus(due,col){
  if(!due||col==="완료")return null;
  const today=new Date();today.setHours(0,0,0,0);
  const d=new Date(due);d.setHours(0,0,0,0);
  const diff=Math.round((d-today)/86400000);
  if(diff<0)return{label:"마감 초과",color:"#EF4444",bg:"#FEF2F2"};
  if(diff===0)return{label:"오늘 마감",color:"#F59E0B",bg:"#FFFBEB"};
  if(diff<=2)return{label:`D-${diff}`,color:"#F97316",bg:"#FFF7ED"};
  return null;
}

function Avatar({name,members,size=26}){
  if(!name||name==="모두")return <div style={{width:size,height:size,borderRadius:"50%",background:"#E5E7EB",border:"1.5px solid #D1D5DB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.4,flexShrink:0}}>👥</div>;
  const m=members?.find(x=>x.name===name);const color=m?.color||"#6366F1";
  return <div style={{width:size,height:size,borderRadius:"50%",background:color+"22",border:`1.5px solid ${color}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.42,fontWeight:700,color,flexShrink:0}}>{name.slice(0,1)}</div>;
}
function Pill({label,bg,color}){return <span style={{fontSize:11,padding:"2px 8px",borderRadius:999,background:bg,color,fontWeight:600}}>{label}</span>;}
function Field({label,children}){return <div><div style={{fontSize:12,color:"#6B7280",fontWeight:600,marginBottom:5}}>{label}</div>{children}</div>;}
function SheetModal({title,onClose,children}){
  return <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={onClose}><div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"20px 20px 36px",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{width:36,height:4,borderRadius:999,background:"#E5E7EB",margin:"0 auto 16px"}}/><h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700,color:"#111827"}}>{title}</h3>{children}</div></div>;
}
function TimePicker({hVal,mVal,onH,onM}){return <div style={{display:"flex",gap:8}}><select value={hVal} onChange={e=>onH(e.target.value)} style={{flex:1,borderRadius:10,border:"1px solid #D1D5DB",padding:"10px 12px",fontSize:14}}>{HOURS.map(h=><option key={h} value={h}>{h}시</option>)}</select><select value={mVal} onChange={e=>onM(e.target.value)} style={{flex:1,borderRadius:10,border:"1px solid #D1D5DB",padding:"10px 12px",fontSize:14}}>{MINUTES.map(m=><option key={m} value={m}>{m}분</option>)}</select></div>;}
function MiniBar({value,max,color}){const pct=max>0?Math.round(value/max*100):0;return <div style={{flex:1,height:6,background:"#F3F4F6",borderRadius:999,overflow:"hidden"}}><div style={{height:6,width:`${pct}%`,background:color,borderRadius:999}}/></div>;}
function CheckAnim({onDone}){useEffect(()=>{const t=setTimeout(onDone,1200);return()=>clearTimeout(t);},[]);return <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,pointerEvents:"none"}}><div style={{background:"#fff",borderRadius:24,padding:"28px 36px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><div style={{width:56,height:56,borderRadius:"50%",background:"#ECFDF5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>✅</div><div style={{fontSize:15,fontWeight:700,color:"#065F46"}}>완료!</div></div></div>;}

function TabIcon({name,active}){
  const c=active?"#6366F1":"#9CA3AF";
  const icons={
    홈:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    칸반:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="11" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>,
    일정:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    반복:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    통계:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    일지:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  };
  return icons[name]||null;
}

const iS={width:"100%",boxSizing:"border-box",borderRadius:10,border:"1px solid #D1D5DB",padding:"10px 12px",fontSize:14};

 function App(){
  const now=new Date();
  const TODAY=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const todayDow=now.getDay();
  const dateStr=`${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 (${WEEKDAYS[todayDow]})`;

  const [fbReady,setFbReady]=useState(false);
  const [members,setMembers]=useState(null);
  const [tasks,setTasks]=useState(null);
  const [schedules,setSchedules]=useState(null);
  const [recurring,setRecurring]=useState(null);
  const [notices,setNotices]=useState(null);
  const [journals,setJournals]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [tab,setTab]=useState("홈");
  const [activeCol,setActiveCol]=useState("할 일");
  const [filterMember,setFilterMember]=useState("전체");
  const [filterDay,setFilterDay]=useState(null);
  const [search,setSearch]=useState("");
  const [filterOpen,setFilterOpen]=useState(false);
  const [filterPriority,setFilterPriority]=useState([]);
  const [filterCol,setFilterCol]=useState([]);
  const [filterDueFrom,setFilterDueFrom]=useState("");
  const [filterDueTo,setFilterDueTo]=useState("");
  const [checkAnim,setCheckAnim]=useState(false);
  const [modal,setModal]=useState(null);
  const [detailTask,setDetailTask]=useState(null);
  const [editMode,setEditMode]=useState(false);
  const [editForm,setEditForm]=useState(null);
  const [taskForm,setTaskForm]=useState(EMPTY_TASK);
  const [schForm,setSchForm]=useState({member:"",date:TODAY,content:""});
  const [recForm,setRecForm]=useState(EMPTY_REC);
  const [newComment,setNewComment]=useState("");
  const [editingMember,setEditingMember]=useState(null);
  const [newMemberName,setNewMemberName]=useState("");
  const [noticeForm,setNoticeForm]=useState("");
  const [confirmReset,setConfirmReset]=useState(false);
  const [journalMemo,setJournalMemo]=useState("");
  const [journalAuthor,setJournalAuthor]=useState("");
  const [journalSaved,setJournalSaved]=useState(false);
  const [viewingJournalId,setViewingJournalId]=useState(null);

  // Firebase 로드 및 데이터 실시간 구독
  useEffect(()=>{
    loadFirebase(()=>{
      setFbReady(true);
      const db=getDb();
      const ref=db.ref("hanlim");
      ref.once("value",snap=>{
        const d=snap.val();
        if(d){
          setMembers(d.members||DEFAULT_MEMBERS);
          setTasks(Object.values(d.tasks||{}).sort((a,b)=>a.id>b.id?1:-1)||DEFAULT_TASKS);
          setSchedules(Object.values(d.schedules||{})||DEFAULT_SCHEDULES);
          setRecurring((Object.values(d.recurring||{})).map(safeRec)||DEFAULT_RECURRING.map(safeRec));
          setNotices(Object.values(d.notices||{})||DEFAULT_NOTICES);
          setJournals(Object.values(d.journals||{}).sort((a,b)=>b.date.localeCompare(a.date))||[]);
        } else {
          // 최초 접속 시 기본값 저장
          const init={
            members:DEFAULT_MEMBERS,
            tasks:DEFAULT_TASKS.reduce((a,t)=>{a[t.id]=t;return a;},{}),
            schedules:DEFAULT_SCHEDULES.reduce((a,s)=>{a[s.id]=s;return a;},{}),
            recurring:DEFAULT_RECURRING.reduce((a,r)=>{a[r.id]=r;return a;},{}),
            notices:DEFAULT_NOTICES.reduce((a,n)=>{a[n.id]=n;return a;},{}),
            journals:{},
          };
          ref.set(init);
          setMembers(DEFAULT_MEMBERS);setTasks(DEFAULT_TASKS);setSchedules(DEFAULT_SCHEDULES);
          setRecurring(DEFAULT_RECURRING.map(safeRec));setNotices(DEFAULT_NOTICES);setJournals([]);
        }
        setLoading(false);
      });
      // 실시간 구독
      ref.on("value",snap=>{
        const d=snap.val();
        if(!d)return;
        setMembers(d.members||DEFAULT_MEMBERS);
        setTasks(Object.values(d.tasks||{}).sort((a,b)=>a.id>b.id?1:-1));
        setSchedules(Object.values(d.schedules||{}));
        setRecurring(Object.values(d.recurring||{}).map(safeRec));
        setNotices(Object.values(d.notices||{}));
        setJournals(Object.values(d.journals||{}).sort((a,b)=>b.date.localeCompare(a.date)));
      });
      return ()=>ref.off();
    });
  },[]);

  const db=()=>getDb().ref("hanlim");
  const setFb=(path,val)=>{setSaving(true);db().child(path).set(val).finally(()=>setSaving(false));};
  const updateFb=(path,val)=>{setSaving(true);db().child(path).update(val).finally(()=>setSaving(false));};
  const removeFb=(path)=>{setSaving(true);db().child(path).remove().finally(()=>setSaving(false));};

  const memberNames=members?members.map(m=>m.name):[];
  const hasFilter=filterPriority.length>0||filterCol.length>0||filterDueFrom||filterDueTo;
  const toggleArr=(arr,setArr,val)=>setArr(arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]);
  const clearFilter=()=>{setFilterPriority([]);setFilterCol([]);setFilterDueFrom("");setFilterDueTo("");};
  const applyFilter=list=>list.filter(t=>{
    if(filterPriority.length>0&&!filterPriority.includes(t.priority))return false;
    if(filterCol.length>0&&!filterCol.includes(t.col))return false;
    if(filterDueFrom&&t.due&&t.due<filterDueFrom)return false;
    if(filterDueTo&&t.due&&t.due>filterDueTo)return false;
    return true;
  });

  const addTask=()=>{
    if(!taskForm.title?.trim())return;
    const id=uid();
    const t={...taskForm,id,comments:[]};
    setFb(`tasks/${id}`,t);
    setModal(null);
  };
  const delTask=id=>{removeFb(`tasks/${id}`);setDetailTask(null);setModal(null);};
  const moveTask=(id,dir,toComplete)=>{
    const t=tasks.find(x=>x.id===id);if(!t)return;
    const newCol=COLS[Math.max(0,Math.min(COLS.length-1,COLS.indexOf(t.col)+dir))];
    if(toComplete&&newCol==="완료")setCheckAnim(true);
    updateFb(`tasks/${id}`,{col:newCol});
  };
  const saveEdit=()=>{
    if(!editForm?.title?.trim())return;
    updateFb(`tasks/${editForm.id}`,editForm);
    setDetailTask(f=>({...f,...editForm}));setEditMode(false);
  };
  const addComment=()=>{
    if(!newComment.trim()||!detailTask)return;
    const t=tasks.find(x=>x.id===detailTask.id);
    const comments=[...(t?.comments||[]),newComment.trim()];
    updateFb(`tasks/${detailTask.id}`,{comments});
    setDetailTask(f=>({...f,comments}));setNewComment("");
  };
  const addSch=()=>{if(!schForm.content?.trim())return;const id=uid();setFb(`schedules/${id}`,{...schForm,id});setModal(null);};
  const delSch=id=>removeFb(`schedules/${id}`);
  const addRec=()=>{if(!recForm.title?.trim()||recForm.days.length===0)return;const id=uid();setFb(`recurring/${id}`,{...recForm,id});setModal(null);};
  const delRec=id=>removeFb(`recurring/${id}`);
  const toggleDay=d=>setRecForm(f=>({...f,days:f.days.includes(d)?f.days.filter(x=>x!==d):[...f.days,d].sort()}));
  const excludeToday=id=>{const r=recurring.find(x=>x.id===id);if(!r)return;updateFb(`recurring/${id}`,{exceptions:[...(r.exceptions||[]),TODAY]});};
  const saveMemberEdit=()=>{
    if(!editingMember?.name?.trim())return;
    const newMs=members.map(m=>m.name===editingMember.origName?{name:editingMember.name,color:editingMember.color}:m);
    setFb("members",newMs);
    if(editingMember.name!==editingMember.origName){
      tasks.filter(t=>t.assignee===editingMember.origName).forEach(t=>updateFb(`tasks/${t.id}`,{assignee:editingMember.name}));
      schedules.filter(s=>s.member===editingMember.origName).forEach(s=>updateFb(`schedules/${s.id}`,{member:editingMember.name}));
      recurring.filter(r=>r.assignee===editingMember.origName).forEach(r=>updateFb(`recurring/${r.id}`,{assignee:editingMember.name}));
    }
    setEditingMember(null);
  };
  const addMember=()=>{if(!newMemberName.trim())return;const newMs=[...members,{name:newMemberName.trim(),color:COLOR_OPTIONS[members.length%COLOR_OPTIONS.length]}];setFb("members",newMs);setNewMemberName("");};
  const delMember=name=>{setFb("members",members.filter(m=>m.name!==name));};
  const addNotice=()=>{if(!noticeForm.trim())return;const id=uid();setFb(`notices/${id}`,{id,text:noticeForm.trim(),active:true});setNoticeForm("");};
  const delNotice=id=>removeFb(`notices/${id}`);
  const saveJournal=()=>{
    if(!journalAuthor.trim())return;
    const id=uid();
    const entry={id,date:TODAY,author:journalAuthor.trim(),memo:journalMemo,
      doneTasks:tasks.filter(t=>t.col==="완료"&&t.due===TODAY).map(t=>({title:t.title,assignee:t.assignee,priority:t.priority})),
      schedules:schedules.filter(s=>s.date===TODAY).map(s=>({member:s.member,content:s.content})),
      recurring:recurring.filter(r=>r.days.includes(todayDow)&&!(r.exceptions||[]).includes(TODAY)).map(r=>({title:r.title,time:`${timeLabel(r.startH,r.startM)}~${timeLabel(r.endH,r.endM)}`,assignee:r.assignee})),
      taskStats:{total:tasks.length,done:tasks.filter(t=>t.col==="완료").length,inProgress:tasks.filter(t=>t.col==="진행 중").length,todo:tasks.filter(t=>t.col==="할 일").length},
      createdAt:new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"}),
    };
    setFb(`journals/${id}`,entry);
    setJournalMemo("");setJournalSaved(true);setTimeout(()=>setJournalSaved(false),2000);
    setViewingJournalId(id);
  };

  if(loading||!tasks||!schedules||!recurring||!members||!notices||!journals){
    return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#6366F1",fontSize:14,fontFamily:"sans-serif"}}>
      <div style={{width:40,height:40,border:"3px solid #E0E7FF",borderTop:"3px solid #6366F1",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span>한림바이오팜 업무 현황 로딩 중...</span>
    </div>;
  }

  const todayTasks=tasks.filter(t=>t.due===TODAY&&t.col!=="완료");
  const todaySchedules=schedules.filter(s=>s.date===TODAY);
  const todayRecurring=recurring.filter(r=>r.days.includes(todayDow)&&!(r.exceptions||[]).includes(TODAY));
  const filteredRec=filterDay!==null?recurring.filter(r=>r.days.includes(filterDay)):recurring;
  const kanbanTasks=tasks.filter(t=>t.col===activeCol&&(filterMember==="전체"||t.assignee===filterMember));
  const urgentTasks=tasks.filter(t=>dueStatus(t.due,t.col)&&t.col!=="완료");
  const urgentCount=urgentTasks.length;
  const totalDone=tasks.filter(t=>t.col==="완료").length;
  const doneRate=tasks.length>0?Math.round(totalDone/tasks.length*100):0;
  const prioStats=["높음","중간","낮음"].map(p=>({p,total:tasks.filter(t=>t.priority===p).length,done:tasks.filter(t=>t.priority===p&&t.col==="완료").length}));
  const memberStats=memberNames.map(m=>({m,active:tasks.filter(t=>t.assignee===m&&t.col!=="완료").length,done:tasks.filter(t=>t.assignee===m&&t.col==="완료").length})).filter(x=>x.active+x.done>0).sort((a,b)=>b.active-a.active);
  const maxMemberTotal=Math.max(...memberStats.map(x=>x.active+x.done),1);
  const activeNotices=notices.filter(n=>n.active);
  const journalsByDate=journals.reduce((acc,j)=>{if(!acc[j.date])acc[j.date]=[];acc[j.date].push(j);return acc;},{});
  const journalDates=Object.keys(journalsByDate).sort((a,b)=>b.localeCompare(a));
  const searchActive=search.trim()||hasFilter;
  const searchResults=applyFilter(tasks.filter(t=>!search.trim()||(t.title.includes(search.trim())||t.assignee.includes(search.trim()))));

  const renderTaskCard=(task,onClick)=>{
    const p=PRIORITY_STYLE[task.priority];const ds=dueStatus(task.due,task.col);const cs=COL_STYLE[task.col];
    return <div key={task.id} onClick={()=>onClick(task)} style={{background:"#fff",borderRadius:12,border:`1px solid ${ds?"#FED7AA":"#E5E7EB"}`,padding:"12px 14px",marginBottom:8,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}><div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:8}}><div style={{fontSize:14,fontWeight:500,color:"#111827",lineHeight:1.4}}>{task.title}</div><Pill label={task.priority} bg={p.bg} color={p.text}/></div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:5}}><Avatar name={task.assignee} members={members} size={20}/><span style={{fontSize:11,color:"#6B7280"}}>{task.assignee}</span></div><div style={{display:"flex",gap:5}}>{ds&&<Pill label={ds.label} bg={ds.bg} color={ds.color}/>}<Pill label={task.col} bg={cs.light} color={cs.text}/></div></div></div>;
  };

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:"'Inter','Pretendard',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:72}}>
      {checkAnim&&<CheckAnim onDone={()=>setCheckAnim(false)}/>}

      {activeNotices.map(n=>(
        <div key={n.id} style={{background:"#1E1B4B",padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13}}>📢</span>
          <span style={{flex:1,fontSize:12,color:"#E0E7FF",lineHeight:1.5}}>{n.text}</span>
          <button onClick={()=>updateFb(`notices/${n.id}`,{active:false})} style={{background:"none",border:"none",color:"#818CF8",cursor:"pointer",fontSize:16,padding:0}}>✕</button>
        </div>
      ))}

      <div style={{background:"#6366F1",padding:"16px 18px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
          <div style={{fontSize:11,color:"#C7D2FE",fontWeight:500}}>한림바이오팜 업무 현황 {saving&&<span style={{opacity:0.7}}>· 저장 중...</span>}</div>
          <button onClick={()=>setModal("settings")} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"4px 10px",color:"#E0E7FF",fontSize:12,cursor:"pointer"}}>⚙ 설정</button>
        </div>
        <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>{dateStr}</div>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {COLS.map(col=>(
            <div key={col} style={{flex:1,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>{tasks.filter(t=>t.col===col).length}</div>
              <div style={{fontSize:10,color:"#E0E7FF",fontWeight:500}}>{col}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"#C7D2FE"}}>전체 진행률</span><span style={{fontSize:11,color:"#fff",fontWeight:700}}>{doneRate}%</span></div>
          <div style={{height:5,background:"rgba(255,255,255,0.2)",borderRadius:999}}><div style={{height:5,background:"#fff",borderRadius:999,width:`${doneRate}%`,transition:"width 0.5s ease"}}/></div>
        </div>
      </div>

      <div style={{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"10px 14px"}}>
        <div style={{display:"flex",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#F3F4F6",borderRadius:12,padding:"9px 14px",flex:1}}>
            <span style={{fontSize:14,color:"#9CA3AF"}}>🔍</span>
            <input placeholder="태스크 또는 팀원 검색..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,border:"none",background:"none",fontSize:13,color:"#111827",outline:"none"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#9CA3AF",padding:0}}>✕</button>}
          </div>
          <button onClick={()=>setFilterOpen(f=>!f)} style={{padding:"9px 12px",borderRadius:12,border:`1.5px solid ${hasFilter?"#6366F1":"#E5E7EB"}`,background:hasFilter?"#EEF2FF":"#F9FAFB",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:hasFilter?"#6366F1":"#6B7280",flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            필터{hasFilter&&<span style={{background:"#6366F1",color:"#fff",borderRadius:999,fontSize:10,padding:"1px 5px"}}>{filterPriority.length+filterCol.length+(filterDueFrom?1:0)+(filterDueTo?1:0)}</span>}
          </button>
        </div>
        {filterOpen&&(
          <div style={{marginTop:10,padding:"14px",background:"#F8FAFC",borderRadius:12,border:"1px solid #E5E7EB",display:"flex",flexDirection:"column",gap:12}}>
            <div><div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:6}}>우선순위</div><div style={{display:"flex",gap:6}}>{["높음","중간","낮음"].map(p=>{const ps=PRIORITY_STYLE[p];const on=filterPriority.includes(p);return <button key={p} onClick={()=>toggleArr(filterPriority,setFilterPriority,p)} style={{padding:"5px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:`1.5px solid ${on?ps.text+"66":"#E5E7EB"}`,background:on?ps.bg:"#fff",color:on?ps.text:"#9CA3AF",cursor:"pointer"}}>{p}</button>;})}</div></div>
            <div><div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:6}}>상태</div><div style={{display:"flex",gap:6}}>{COLS.map(c=>{const cs=COL_STYLE[c];const on=filterCol.includes(c);return <button key={c} onClick={()=>toggleArr(filterCol,setFilterCol,c)} style={{padding:"5px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:`1.5px solid ${on?cs.dot+"66":"#E5E7EB"}`,background:on?cs.light:"#fff",color:on?cs.text:"#9CA3AF",cursor:"pointer"}}>{c}</button>;})}</div></div>
            <div><div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:6}}>마감일 범위</div><div style={{display:"flex",alignItems:"center",gap:6}}><input type="date" value={filterDueFrom} onChange={e=>setFilterDueFrom(e.target.value)} style={{flex:1,borderRadius:8,border:"1px solid #D1D5DB",padding:"7px 10px",fontSize:12}}/><span style={{fontSize:11,color:"#9CA3AF"}}>~</span><input type="date" value={filterDueTo} onChange={e=>setFilterDueTo(e.target.value)} style={{flex:1,borderRadius:8,border:"1px solid #D1D5DB",padding:"7px 10px",fontSize:12}}/></div></div>
            {hasFilter&&<button onClick={clearFilter} style={{padding:"8px",borderRadius:8,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>필터 초기화</button>}
          </div>
        )}
      </div>

      <div style={{background:"#fff",borderBottom:"1px solid #E5E7EB",display:"flex"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"11px 2px",border:"none",cursor:"pointer",background:"none",borderBottom:tab===t?"2.5px solid #6366F1":"2.5px solid transparent",color:tab===t?"#6366F1":"#9CA3AF",fontSize:11,fontWeight:tab===t?700:400,position:"relative"}}>
            {t}{t==="홈"&&urgentCount>0&&<span style={{position:"absolute",top:5,right:"10%",width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{urgentCount}</span>}
          </button>
        ))}
      </div>

      <div style={{padding:"14px 14px 0"}}>
        {searchActive&&!["통계","일지"].includes(tab)&&(
          <div style={{marginBottom:8}}>
            <div style={{fontSize:12,color:"#9CA3AF",fontWeight:600,marginBottom:10}}>{search.trim()?"검색":"필터"} 결과 {searchResults.length}건</div>
            {searchResults.length===0?<div style={{textAlign:"center",padding:"30px 0",color:"#D1D5DB",fontSize:13}}>결과가 없습니다</div>:searchResults.map(task=>renderTaskCard(task,t=>{setDetailTask(t);setEditMode(false);}))}
          </div>
        )}

        {!searchActive&&tab==="홈"&&(
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {urgentTasks.length>0&&(<section style={{marginBottom:24}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12,paddingBottom:8,borderBottom:"2px solid #FEE2E2"}}><span style={{fontSize:14}}>⚠️</span><span style={{fontSize:14,fontWeight:700,color:"#111827"}}>마감 임박 / 초과</span><Pill label={urgentTasks.length} bg="#FEF2F2" color="#EF4444"/></div>{urgentTasks.map(task=>{const ds=dueStatus(task.due,task.col);return <div key={task.id} onClick={()=>{setDetailTask(task);setEditMode(false);}} style={{background:ds.bg,borderRadius:12,border:`1px solid ${ds.color}33`,padding:"11px 14px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:32,borderRadius:999,background:ds.color,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#111827"}}>{task.title}</div><div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><Avatar name={task.assignee} members={members} size={16}/><span style={{fontSize:11,color:"#6B7280"}}>{task.assignee}</span><span style={{fontSize:11,fontWeight:700,color:ds.color,marginLeft:"auto"}}>{ds.label}</span></div></div></div>;})}</section>)}
            {todayRecurring.length>0&&(<section style={{marginBottom:24}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12,paddingBottom:8,borderBottom:"2px solid #E9D5FF"}}><div style={{width:9,height:9,borderRadius:"50%",background:"#8B5CF6"}}/><span style={{fontSize:14,fontWeight:700,color:"#111827"}}>오늘 반복 일정</span><Pill label={todayRecurring.length} bg="#F5F3FF" color="#5B21B6"/></div>{todayRecurring.map(r=><div key={r.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E9D5FF",padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:36,borderRadius:999,background:"#8B5CF6",flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#111827"}}>{r.title}</div><div style={{fontSize:12,color:"#8B5CF6",marginTop:2,fontWeight:500}}>{timeLabel(r.startH,r.startM)} ~ {timeLabel(r.endH,r.endM)} · 매주 {r.days.map(d=>WEEKDAYS[d]+"요일").join(", ")}</div><div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}><Avatar name={r.assignee} members={members} size={18}/><span style={{fontSize:11,color:"#6B7280"}}>{r.assignee==="모두"?"전체 팀원":r.assignee}</span></div>{r.content&&<div style={{fontSize:12,color:"#6B7280",marginTop:3}}>{r.content}</div>}</div><button onClick={()=>excludeToday(r.id)} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",flexShrink:0}}>오늘 제외</button></div>)}</section>)}
            <section style={{marginBottom:24}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"2px solid #FEE2E2"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:"50%",background:"#EF4444"}}/><span style={{fontSize:14,fontWeight:700,color:"#111827"}}>오늘 꼭 해야 할 일</span><Pill label={todayTasks.length} bg="#FEE2E2" color="#991B1B"/></div><button onClick={()=>{setTaskForm({...EMPTY_TASK,priority:"높음",due:TODAY,assignee:memberNames[0]||""});setModal("add-task");}} style={{fontSize:12,padding:"5px 12px",borderRadius:8,background:"#EEF2FF",color:"#6366F1",border:"none",cursor:"pointer",fontWeight:600}}>+ 추가</button></div>{todayTasks.length===0?<div style={{textAlign:"center",padding:"20px 0",color:"#D1D5DB",fontSize:13}}>오늘 예정된 업무가 없습니다</div>:todayTasks.map(task=>renderTaskCard(task,t=>{setDetailTask(t);setEditMode(false);}))}</section>
            <section style={{marginBottom:24}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"2px solid #C7D2FE"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:"50%",background:"#6366F1"}}/><span style={{fontSize:14,fontWeight:700,color:"#111827"}}>오늘 팀원 일정</span><Pill label={todaySchedules.length} bg="#EEF2FF" color="#3730A3"/></div><button onClick={()=>{setSchForm({member:memberNames[0]||"",date:TODAY,content:""});setModal("add-sch");}} style={{fontSize:12,padding:"5px 12px",borderRadius:8,background:"#EEF2FF",color:"#6366F1",border:"none",cursor:"pointer",fontWeight:600}}>+ 추가</button></div>{todaySchedules.length===0?<div style={{textAlign:"center",padding:"20px 0",color:"#D1D5DB",fontSize:13}}>오늘 등록된 일정이 없습니다</div>:todaySchedules.map(s=>{const mc=members.find(m=>m.name===s.member);return <div key={s.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:36,borderRadius:999,background:mc?.color||"#6366F1",flexShrink:0}}/><Avatar name={s.member} members={members} size={30}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{s.member}</div><div style={{fontSize:13,color:"#111827",marginTop:1}}>{s.content}</div></div><button onClick={()=>delSch(s.id)} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer"}}>삭제</button></div>;})}</section>
            <section style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"2px solid #A7F3D0"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:"50%",background:"#10B981"}}/><span style={{fontSize:14,fontWeight:700,color:"#111827"}}>팀원 현황</span><span style={{fontSize:11,color:"#9CA3AF"}}>{members.length}명</span></div><span style={{fontSize:11,color:"#9CA3AF",background:"#F3F4F6",borderRadius:6,padding:"3px 8px"}}>숫자 = 진행 중인 업무 수</span></div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{members.map(m=>{const cnt=tasks.filter(t=>t.assignee===m.name&&t.col!=="완료").length;return <div key={m.name} style={{display:"flex",alignItems:"center",gap:5,background:"#fff",borderRadius:999,padding:"4px 10px 4px 5px",border:"1px solid #E5E7EB"}}><Avatar name={m.name} members={members} size={22}/><span style={{fontSize:12,color:"#374151",fontWeight:500}}>{m.name}</span>{cnt>0&&<Pill label={cnt} bg="#EEF2FF" color="#6366F1"/>}</div>;})}</div></section>
          </div>
        )}

        {!searchActive&&tab==="칸반"&&(
          <div>
            <div style={{display:"flex",marginBottom:10,background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",overflow:"hidden"}}>{COLS.map(col=>{const isA=col===activeCol;const s=COL_STYLE[col];return <button key={col} onClick={()=>setActiveCol(col)} style={{flex:1,padding:"11px 4px",border:"none",cursor:"pointer",background:isA?s.light:"#fff",borderBottom:isA?`2.5px solid ${s.dot}`:"2.5px solid transparent",color:isA?s.dot:"#9CA3AF",fontSize:13,fontWeight:isA?700:400}}>{col} <span style={{fontSize:11}}>{tasks.filter(t=>t.col===col).length}</span></button>;})}</div>
            <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>{["전체",...memberNames].map(m=>{const isA=m===filterMember;const mc=members.find(x=>x.name===m);const color=m==="전체"?"#6366F1":mc?.color||"#6366F1";return <button key={m} onClick={()=>setFilterMember(m)} style={{flexShrink:0,display:"flex",alignItems:"center",gap:4,padding:"5px 10px 5px 5px",borderRadius:999,fontSize:11,fontWeight:600,border:`1.5px solid ${isA?color+"66":"#E5E7EB"}`,cursor:"pointer",background:isA?color+"11":"#fff",color:isA?color:"#9CA3AF"}}>{m==="전체"?<span style={{fontSize:13}}>👥</span>:<Avatar name={m} members={members} size={18}/>}{m}</button>;})}</div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><button onClick={()=>{setTaskForm({...EMPTY_TASK,col:activeCol,assignee:memberNames[0]||""});setModal("add-task");}} style={{fontSize:12,padding:"7px 14px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>+ 태스크 추가</button></div>
            {kanbanTasks.length===0?<div style={{textAlign:"center",padding:"40px 0",color:"#D1D5DB",fontSize:13}}>태스크가 없습니다</div>:kanbanTasks.map(task=>{const p=PRIORITY_STYLE[task.priority];const ds=dueStatus(task.due,task.col);const ci=COLS.indexOf(task.col);const nextIsDone=COLS[ci+1]==="완료";return <div key={task.id} onClick={()=>{setDetailTask(task);setEditMode(false);}} style={{background:"#fff",borderRadius:12,border:`1px solid ${ds?"#FED7AA":"#E5E7EB"}`,padding:"13px 14px",marginBottom:10,cursor:"pointer"}}><div style={{fontSize:14,fontWeight:500,color:"#111827",marginBottom:8,lineHeight:1.4}}>{task.title}</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={task.assignee} members={members} size={22}/><span style={{fontSize:12,color:"#6B7280"}}>{task.assignee}</span></div><div style={{display:"flex",gap:5}}><Pill label={task.priority} bg={p.bg} color={p.text}/>{ds&&<Pill label={ds.label} bg={ds.bg} color={ds.color}/>}</div></div>{task.due&&<div style={{marginTop:7,fontSize:11,color:ds?ds.color:"#9CA3AF"}}>마감 {task.due}</div>}<div style={{display:"flex",gap:6,marginTop:10,borderTop:"1px solid #F3F4F6",paddingTop:8}}>{ci>0&&<button onClick={e=>{e.stopPropagation();moveTask(task.id,-1,false);}} style={{fontSize:11,padding:"4px 10px",borderRadius:8,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",color:"#6B7280"}}>← 이전</button>}{ci<COLS.length-1&&<button onClick={e=>{e.stopPropagation();moveTask(task.id,1,nextIsDone);}} style={{fontSize:11,padding:"4px 10px",borderRadius:8,background:nextIsDone?"#ECFDF5":"#F9FAFB",border:`1px solid ${nextIsDone?"#A7F3D0":"#E5E7EB"}`,cursor:"pointer",color:nextIsDone?"#065F46":"#6B7280",marginLeft:"auto",fontWeight:nextIsDone?600:400}}>{nextIsDone?"✓ 완료":"다음 →"}</button>}</div></div>;})}
          </div>
        )}

        {!searchActive&&tab==="일정"&&(()=>{
          const sorted=[...schedules].sort((a,b)=>a.date.localeCompare(b.date)||a.member.localeCompare(b.member));
          const grouped=sorted.reduce((acc,s)=>{const key=s.date<TODAY?"지난 일정":s.date===TODAY?"오늘":s.date;if(!acc[key])acc[key]=[];acc[key].push(s);return acc;},{});
          const keys=Object.keys(grouped).sort((a,b)=>{if(a==="지난 일정")return -1;if(b==="지난 일정")return 1;if(a==="오늘")return -1;if(b==="오늘")return 1;return a.localeCompare(b);});
          return <div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button onClick={()=>{setSchForm({member:memberNames[0]||"",date:TODAY,content:""});setModal("add-sch");}} style={{fontSize:12,padding:"7px 14px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>+ 일정 추가</button></div>{schedules.length===0?<div style={{textAlign:"center",padding:"40px 0",color:"#D1D5DB",fontSize:13}}>등록된 일정이 없습니다</div>:keys.map(dk=>{const isToday=dk==="오늘";const isPast=dk==="지난 일정";return <div key={dk} style={{marginBottom:18}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:isToday?"#6366F1":isPast?"#D1D5DB":"#10B981",flexShrink:0}}/><span style={{fontSize:12,fontWeight:700,color:isToday?"#6366F1":isPast?"#9CA3AF":"#065F46"}}>{dk}</span><div style={{flex:1,height:"1px",background:"#F3F4F6"}}/><span style={{fontSize:11,color:"#9CA3AF"}}>{grouped[dk].length}건</span></div>{grouped[dk].map(s=>{const mc=members.find(m=>m.name===s.member);return <div key={s.id} style={{background:"#fff",borderRadius:12,border:`1px solid ${isToday?"#C7D2FE":isPast?"#F3F4F6":"#E5E7EB"}`,padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10,opacity:isPast?0.6:1}}><div style={{width:3,height:36,borderRadius:999,background:mc?.color||"#6366F1",flexShrink:0}}/><Avatar name={s.member} members={members} size={28}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{s.member}</div><div style={{fontSize:13,color:"#111827",marginTop:2}}>{s.content}</div></div><button onClick={()=>delSch(s.id)} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",flexShrink:0}}>삭제</button></div>;})};</div>;})}</div>;
        })()}

        {!searchActive&&tab==="반복"&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}><button onClick={()=>setFilterDay(null)} style={{flexShrink:0,padding:"6px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",background:filterDay===null?"#6366F1":"#F3F4F6",color:filterDay===null?"#fff":"#6B7280"}}>전체</button>{WEEKDAYS.map((d,i)=>{const dc=DAY_COLORS[i];const isA=filterDay===i;return <button key={i} onClick={()=>setFilterDay(filterDay===i?null:i)} style={{flexShrink:0,padding:"6px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:`1.5px solid ${isA?dc.border:"#E5E7EB"}`,cursor:"pointer",background:isA?dc.bg:"#fff",color:isA?dc.text:"#6B7280"}}>{d}요일</button>;})}</div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button onClick={()=>{setRecForm({...EMPTY_REC,assignee:memberNames[0]||"모두"});setModal("add-rec");}} style={{fontSize:12,padding:"7px 14px",borderRadius:10,background:"#8B5CF6",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>+ 반복 일정 추가</button></div>
            {filteredRec.length===0?<div style={{textAlign:"center",padding:"40px 0",color:"#D1D5DB",fontSize:13}}>반복 일정이 없습니다</div>:filteredRec.map(r=><div key={r.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E9D5FF",padding:"14px",marginBottom:10}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}><div style={{fontSize:14,fontWeight:600,color:"#111827"}}>{r.title}</div><button onClick={()=>delRec(r.id)} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",flexShrink:0}}>삭제</button></div><div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>{r.days.map(d=>{const dc=DAY_COLORS[d];return <span key={d} style={{fontSize:11,padding:"3px 9px",borderRadius:999,background:dc.bg,color:dc.text,border:`1px solid ${dc.border}`,fontWeight:600}}>{WEEKDAY_FULL[d]}</span>;})} <span style={{fontSize:11,padding:"3px 9px",borderRadius:999,background:"#F5F3FF",color:"#5B21B6",fontWeight:600}}>⏰ {timeLabel(r.startH,r.startM)} ~ {timeLabel(r.endH,r.endM)}</span></div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:r.content?6:0}}><Avatar name={r.assignee} members={members} size={20}/><span style={{fontSize:12,color:"#6B7280"}}>{r.assignee==="모두"?"전체 팀원":r.assignee}</span></div>{r.content&&<div style={{fontSize:12,color:"#6B7280",lineHeight:1.5,marginTop:4}}>{r.content}</div>}</div>)}
          </div>
        )}

        {tab==="통계"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16,paddingBottom:8}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{[["전체",tasks.length,"#6366F1","#EEF2FF"],["진행 중",tasks.filter(t=>t.col!=="완료").length,"#F59E0B","#FFFBEB"],["완료",totalDone,"#10B981","#ECFDF5"]].map(([l,v,c,bg])=><div key={l} style={{background:bg,borderRadius:12,padding:"12px 8px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:11,color:c,fontWeight:500,marginTop:2}}>{l}</div></div>)}</div>
            <section><div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:10}}>우선순위별 현황</div>{prioStats.map(({p,total,done})=>{const ps=PRIORITY_STYLE[p];const rate=total>0?Math.round(done/total*100):0;return <div key={p} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"12px 14px",marginBottom:8}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><Pill label={p} bg={ps.bg} color={ps.text}/><span style={{fontSize:12,color:"#6B7280"}}>{done}/{total}건 완료 ({rate}%)</span></div><div style={{height:7,background:"#F3F4F6",borderRadius:999,overflow:"hidden"}}><div style={{height:7,width:`${rate}%`,background:ps.bar,borderRadius:999}}/></div></div>;})}</section>
            <section style={{marginBottom:8}}><div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:10}}>팀원별 업무 현황</div>{memberStats.length===0?<div style={{textAlign:"center",padding:"20px 0",color:"#D1D5DB",fontSize:13}}>데이터가 없습니다</div>:memberStats.map(({m,active,done})=><div key={m} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"10px 14px",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><Avatar name={m} members={members} size={22}/><span style={{fontSize:13,fontWeight:500,color:"#374151",flex:1}}>{m}</span><span style={{fontSize:11,color:"#6B7280"}}>{active+done}건</span></div><div style={{display:"flex",flexDirection:"column",gap:4}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,color:"#9CA3AF",minWidth:36}}>진행</span><MiniBar value={active} max={maxMemberTotal} color="#6366F1"/><span style={{fontSize:11,fontWeight:600,color:"#6366F1",minWidth:20,textAlign:"right"}}>{active}</span></div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,color:"#9CA3AF",minWidth:36}}>완료</span><MiniBar value={done} max={maxMemberTotal} color="#10B981"/><span style={{fontSize:11,fontWeight:600,color:"#10B981",minWidth:20,textAlign:"right"}}>{done}</span></div></div></div>)}</section>
          </div>
        )}

        {tab==="일지"&&(
          <div style={{paddingBottom:8}}>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #E5E7EB",padding:"16px",marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:9,height:9,borderRadius:"50%",background:"#6366F1"}}/><span style={{fontSize:14,fontWeight:700,color:"#111827"}}>오늘 일지 작성</span><span style={{fontSize:11,color:"#9CA3AF",marginLeft:"auto"}}>{TODAY}</span></div>
              <div style={{background:"#F8FAFC",borderRadius:12,padding:"12px 14px",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",marginBottom:2}}>자동 수집 내용</div>
                {[["✅ 완료 태스크",`${tasks.filter(t=>t.col==="완료"&&t.due===TODAY).length}건`,"#065F46"],["📅 팀원 일정",`${todaySchedules.length}건`,"#3730A3"],["🔄 반복 일정",`${todayRecurring.length}건`,"#5B21B6"],["📊 전체 현황",`할 일 ${tasks.filter(t=>t.col==="할 일").length} · 진행 중 ${tasks.filter(t=>t.col==="진행 중").length} · 완료 ${totalDone}`,"#374151"]].map(([l,v,c])=><div key={l} style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:"#6B7280",minWidth:80}}>{l}</span><span style={{fontSize:12,fontWeight:600,color:c}}>{v}</span></div>)}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Field label="작성자"><select value={journalAuthor} onChange={e=>setJournalAuthor(e.target.value)} style={iS}><option value="">작성자 선택</option>{memberNames.map(m=><option key={m}>{m}</option>)}</select></Field>
                <Field label="특이사항 / 메모 (선택)"><textarea placeholder="오늘의 특이사항, 공유사항, 내일 계획 등..." value={journalMemo} onChange={e=>setJournalMemo(e.target.value)} style={{...iS,minHeight:90,resize:"vertical",lineHeight:1.6}}/></Field>
                <button onClick={saveJournal} style={{padding:"13px",borderRadius:12,background:journalSaved?"#ECFDF5":"#6366F1",color:journalSaved?"#065F46":"#fff",border:journalSaved?"1px solid #A7F3D0":"none",cursor:"pointer",fontSize:14,fontWeight:700}}>{journalSaved?"✓ 일지 저장됨!":"📝 오늘 일지 저장"}</button>
              </div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:12}}>지난 일지 ({journals.length}개)</div>
            {journalDates.length===0?<div style={{textAlign:"center",padding:"30px 0",color:"#D1D5DB",fontSize:13}}>저장된 일지가 없습니다</div>:journalDates.map(date=>journalsByDate[date].map(j=>(
              <div key={j.id} onClick={()=>setViewingJournalId(prev=>prev===j.id?null:j.id)} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"14px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:viewingJournalId===j.id?12:0}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:7,height:7,borderRadius:"50%",background:"#6366F1"}}/><span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{j.date}</span><span style={{fontSize:11,color:"#9CA3AF"}}>{j.createdAt}</span></div><div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={j.author} members={members} size={20}/><span style={{fontSize:11,color:"#6B7280"}}>{j.author}</span><span style={{fontSize:12,color:"#9CA3AF"}}>{viewingJournalId===j.id?"▲":"▼"}</span></div></div>
                {viewingJournalId===j.id&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>{[["할 일",j.taskStats?.todo,"#6366F1","#EEF2FF"],["진행 중",j.taskStats?.inProgress,"#F59E0B","#FFFBEB"],["완료",j.taskStats?.done,"#10B981","#ECFDF5"]].map(([l,v,c,bg])=><div key={l} style={{background:bg,borderRadius:8,padding:"8px 4px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:10,color:c,fontWeight:500}}>{l}</div></div>)}</div>
                  {j.doneTasks?.length>0&&<div><div style={{fontSize:11,fontWeight:700,color:"#065F46",marginBottom:6}}>✅ 완료된 태스크</div>{j.doneTasks.map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"#ECFDF5",borderRadius:8,marginBottom:4}}><Avatar name={t.assignee} members={members} size={18}/><span style={{fontSize:12,color:"#065F46",flex:1}}>{t.title}</span><Pill label={t.priority} bg={PRIORITY_STYLE[t.priority]?.bg} color={PRIORITY_STYLE[t.priority]?.text}/></div>)}</div>}
                  {j.schedules?.length>0&&<div><div style={{fontSize:11,fontWeight:700,color:"#3730A3",marginBottom:6}}>📅 팀원 일정</div>{j.schedules.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"#EEF2FF",borderRadius:8,marginBottom:4}}><Avatar name={s.member} members={members} size={18}/><span style={{fontSize:12,color:"#3730A3"}}>{s.member}</span><span style={{fontSize:12,color:"#374151",flex:1}}>— {s.content}</span></div>)}</div>}
                  {j.memo&&<div><div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:6}}>📝 메모</div><div style={{padding:"10px 12px",background:"#F9FAFB",borderRadius:8,fontSize:13,color:"#374151",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{j.memo}</div></div>}
                  <button onClick={e=>{e.stopPropagation();removeFb(`journals/${j.id}`);setViewingJournalId(null);}} style={{padding:"8px",borderRadius:8,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>삭제</button>
                </div>}
              </div>
            )))}
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #E5E7EB",display:"flex"}}>
        {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 2px 8px",border:"none",cursor:"pointer",background:"none",color:tab===t?"#6366F1":"#9CA3AF",fontSize:10,fontWeight:tab===t?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}><TabIcon name={t} active={tab===t}/>{t}{t==="홈"&&urgentCount>0&&<span style={{position:"absolute",top:5,right:"10%",width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{urgentCount}</span>}</button>)}
      </div>

      {modal==="add-task"&&<SheetModal title="태스크 추가" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><Field label="제목"><input placeholder="업무 내용" value={taskForm.title||""} onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))} style={iS}/></Field><Field label="담당자"><select value={taskForm.assignee||""} onChange={e=>setTaskForm(f=>({...f,assignee:e.target.value}))} style={iS}>{memberNames.map(m=><option key={m}>{m}</option>)}</select></Field><Field label="우선순위"><select value={taskForm.priority||"중간"} onChange={e=>setTaskForm(f=>({...f,priority:e.target.value}))} style={iS}>{"높음 중간 낮음".split(" ").map(p=><option key={p}>{p}</option>)}</select></Field><Field label="마감일"><input type="date" value={taskForm.due||""} onChange={e=>setTaskForm(f=>({...f,due:e.target.value}))} style={iS}/></Field><Field label="컬럼"><select value={taskForm.col||"할 일"} onChange={e=>setTaskForm(f=>({...f,col:e.target.value}))} style={iS}>{COLS.map(c=><option key={c}>{c}</option>)}</select></Field><button onClick={addTask} style={{marginTop:6,padding:"13px",borderRadius:12,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}}>추가하기</button></div></SheetModal>}

      {detailTask&&(()=>{
        const task=tasks.find(t=>t.id===detailTask.id)||detailTask;
        const p=PRIORITY_STYLE[task.priority];const cs=COL_STYLE[task.col];const ci=COLS.indexOf(task.col);const ds=dueStatus(task.due,task.col);const nextIsDone=COLS[ci+1]==="완료";
        return <SheetModal title={editMode?"태스크 수정":task.title} onClose={()=>{setDetailTask(null);setEditMode(false);}}>
          {!editMode?(<><div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}><Pill label={task.priority} bg={p.bg} color={p.text}/><Pill label={task.col} bg={cs.light} color={cs.text}/>{ds&&<Pill label={ds.label} bg={ds.bg} color={ds.color}/>}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,fontSize:13,marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#9CA3AF",fontWeight:600,minWidth:44}}>담당자</span><div style={{display:"flex",alignItems:"center",gap:7}}><Avatar name={task.assignee} members={members} size={22}/><span>{task.assignee}</span></div></div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#9CA3AF",fontWeight:600,minWidth:44}}>마감일</span><span style={{color:"#111827"}}>{task.due||"없음"}</span></div></div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>{ci>0&&<button onClick={()=>{moveTask(task.id,-1,false);setDetailTask(t=>({...t,col:COLS[COLS.indexOf(t.col)-1]}));}} style={{flex:1,padding:"9px",borderRadius:10,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13,color:"#374151"}}>← 이전 단계</button>}{ci<COLS.length-1&&<button onClick={()=>{moveTask(task.id,1,nextIsDone);setDetailTask(t=>({...t,col:COLS[COLS.indexOf(t.col)+1]}));}} style={{flex:1,padding:"9px",borderRadius:10,background:nextIsDone?"#ECFDF5":"#EEF2FF",border:`1px solid ${nextIsDone?"#A7F3D0":"#C7D2FE"}`,cursor:"pointer",fontSize:13,color:nextIsDone?"#065F46":"#3730A3",fontWeight:600}}>{nextIsDone?"✓ 완료로 이동":"다음 단계 →"}</button>}</div>
          <button onClick={()=>{setEditForm({id:task.id,title:task.title,assignee:task.assignee,priority:task.priority,due:task.due,col:task.col});setEditMode(true);}} style={{width:"100%",padding:"10px",borderRadius:10,background:"#F5F3FF",color:"#5B21B6",border:"1px solid #E9D5FF",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:12}}>✏️ 수정하기</button>
          <div style={{borderTop:"1px solid #F3F4F6",paddingTop:14}}><div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:8}}>댓글 {(task.comments||[]).length}개</div>{(task.comments||[]).map((c,i)=><div key={i} style={{fontSize:13,padding:"9px 12px",background:"#F9FAFB",borderRadius:8,marginBottom:6,color:"#374151"}}>{c}</div>)}<div style={{display:"flex",gap:8,marginTop:8}}><input placeholder="댓글 입력..." value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComment()} style={{...iS,flex:1}}/><button onClick={addComment} style={{padding:"10px 14px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>작성</button></div></div>
          <button onClick={()=>delTask(task.id)} style={{marginTop:14,width:"100%",padding:"11px",borderRadius:10,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>태스크 삭제</button></>
          ):(<div style={{display:"flex",flexDirection:"column",gap:10}}><Field label="제목"><input value={editForm.title||""} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))} style={iS}/></Field><Field label="담당자"><select value={editForm.assignee||""} onChange={e=>setEditForm(f=>({...f,assignee:e.target.value}))} style={iS}>{memberNames.map(m=><option key={m}>{m}</option>)}</select></Field><Field label="우선순위"><select value={editForm.priority||"중간"} onChange={e=>setEditForm(f=>({...f,priority:e.target.value}))} style={iS}>{"높음 중간 낮음".split(" ").map(p=><option key={p}>{p}</option>)}</select></Field><Field label="마감일"><input type="date" value={editForm.due||""} onChange={e=>setEditForm(f=>({...f,due:e.target.value}))} style={iS}/></Field><Field label="컬럼"><select value={editForm.col||"할 일"} onChange={e=>setEditForm(f=>({...f,col:e.target.value}))} style={iS}>{COLS.map(c=><option key={c}>{c}</option>)}</select></Field><div style={{display:"flex",gap:8,marginTop:4}}><button onClick={()=>setEditMode(false)} style={{flex:1,padding:"11px",borderRadius:10,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13,color:"#374151"}}>취소</button><button onClick={saveEdit} style={{flex:2,padding:"11px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}}>저장하기</button></div></div>)}
        </SheetModal>;
      })()}

      {modal==="add-sch"&&<SheetModal title="일정 추가" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><Field label="팀원"><select value={schForm.member||""} onChange={e=>setSchForm(f=>({...f,member:e.target.value}))} style={iS}>{memberNames.map(m=><option key={m}>{m}</option>)}</select></Field><Field label="날짜"><input type="date" value={schForm.date||""} onChange={e=>setSchForm(f=>({...f,date:e.target.value}))} style={iS}/></Field><Field label="일정 내용"><input placeholder="일정 내용 입력" value={schForm.content||""} onChange={e=>setSchForm(f=>({...f,content:e.target.value}))} style={iS}/></Field><button onClick={addSch} style={{marginTop:6,padding:"13px",borderRadius:12,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}}>추가하기</button></div></SheetModal>}

      {modal==="add-rec"&&<SheetModal title="반복 일정 추가" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:12}}><Field label="일정 제목"><input placeholder="예: 주간 팀 미팅" value={recForm.title||""} onChange={e=>setRecForm(f=>({...f,title:e.target.value}))} style={iS}/></Field><Field label="반복 요일"><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{WEEKDAYS.map((d,i)=>{const isOn=recForm.days.includes(i);const dc=DAY_COLORS[i];return <button key={i} onClick={()=>toggleDay(i)} style={{padding:"7px 12px",borderRadius:999,fontSize:13,fontWeight:600,border:`1.5px solid ${isOn?dc.border:"#E5E7EB"}`,cursor:"pointer",background:isOn?dc.bg:"#F9FAFB",color:isOn?dc.text:"#9CA3AF"}}>{d}</button>;})}</div></Field><Field label="시작 시간"><TimePicker hVal={recForm.startH} mVal={recForm.startM} onH={v=>setRecForm(f=>({...f,startH:v}))} onM={v=>setRecForm(f=>({...f,startM:v}))}/></Field><Field label="마감 시간"><TimePicker hVal={recForm.endH} mVal={recForm.endM} onH={v=>setRecForm(f=>({...f,endH:v}))} onM={v=>setRecForm(f=>({...f,endM:v}))}/></Field><Field label="담당자"><select value={recForm.assignee||"모두"} onChange={e=>setRecForm(f=>({...f,assignee:e.target.value}))} style={iS}>{[...memberNames,"모두"].map(m=><option key={m}>{m}</option>)}</select></Field><Field label="메모 (선택)"><input placeholder="예: 회의실 A" value={recForm.content||""} onChange={e=>setRecForm(f=>({...f,content:e.target.value}))} style={iS}/></Field><button onClick={addRec} style={{marginTop:4,padding:"13px",borderRadius:12,background:"#8B5CF6",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}}>추가하기</button></div></SheetModal>}

      {modal==="settings"&&<SheetModal title="설정" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}>{[{label:"👥 팀원 관리",desc:"팀원 추가·삭제·색상 변경",action:()=>setModal("manage-members")},{label:"📢 공지사항 관리",desc:"상단 배너 공지 추가·삭제",action:()=>setModal("manage-notices")},].map(({label,desc,action})=><button key={label} onClick={action} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:12,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",textAlign:"left"}}><div><div style={{fontSize:14,fontWeight:600,color:"#111827"}}>{label}</div><div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{desc}</div></div><span style={{color:"#9CA3AF",fontSize:16}}>›</span></button>)}<div style={{borderTop:"1px solid #F3F4F6",paddingTop:10,marginTop:4}}>{!confirmReset?<button onClick={()=>setConfirmReset(true)} style={{width:"100%",padding:"12px",borderRadius:12,background:"#FEF2F2",color:"#991B1B",border:"1px solid #FEE2E2",cursor:"pointer",fontSize:13,fontWeight:600}}>🗑 전체 데이터 초기화</button>:<div><div style={{fontSize:13,color:"#991B1B",marginBottom:10,textAlign:"center",fontWeight:500}}>정말 초기화하시겠어요?</div><div style={{display:"flex",gap:8}}><button onClick={()=>setConfirmReset(false)} style={{flex:1,padding:"11px",borderRadius:10,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13}}>취소</button><button onClick={()=>{getDb().ref("hanlim").remove();setConfirmReset(false);setModal(null);}} style={{flex:1,padding:"11px",borderRadius:10,background:"#EF4444",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}}>초기화</button></div></div>}</div></div></SheetModal>}

      {modal==="manage-members"&&<SheetModal title="팀원 관리" onClose={()=>setModal(null)}>
        <div style={{display:"flex",gap:8,marginBottom:16}}><input placeholder="새 팀원 이름" value={newMemberName} onChange={e=>setNewMemberName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMember()} style={{...iS,flex:1}}/><button onClick={addMember} style={{padding:"10px 16px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600,fontSize:13}}>추가</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{members.map(m=><div key={m.name} style={{display:"flex",alignItems:"center",gap:10,background:"#F9FAFB",borderRadius:12,padding:"10px 12px",border:"1px solid #E5E7EB"}}><div style={{width:30,height:30,borderRadius:"50%",background:m.color+"22",border:`2px solid ${m.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:m.color}}>{m.name.slice(0,1)}</div><span style={{flex:1,fontSize:13,fontWeight:500,color:"#374151"}}>{m.name}</span><button onClick={()=>setEditingMember({name:m.name,color:m.color,origName:m.name})} style={{fontSize:11,padding:"4px 10px",borderRadius:8,background:"#EEF2FF",color:"#3730A3",border:"none",cursor:"pointer"}}>수정</button><button onClick={()=>delMember(m.name)} style={{fontSize:11,padding:"4px 10px",borderRadius:8,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer"}}>삭제</button></div>)}</div>
        {editingMember&&<div style={{marginTop:16,padding:"14px",background:"#F5F3FF",borderRadius:12,border:"1px solid #E9D5FF"}}><div style={{fontSize:13,fontWeight:700,color:"#5B21B6",marginBottom:10}}>팀원 수정</div><Field label="이름"><input value={editingMember.name} onChange={e=>setEditingMember(f=>({...f,name:e.target.value}))} style={iS}/></Field><div style={{marginTop:10}}><div style={{fontSize:12,color:"#6B7280",fontWeight:600,marginBottom:8}}>아바타 색상</div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{COLOR_OPTIONS.map(c=><button key={c} onClick={()=>setEditingMember(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,border:editingMember.color===c?"3px solid #1E1B4B":"2px solid transparent",cursor:"pointer",padding:0}}/>)}</div></div><div style={{display:"flex",gap:8,marginTop:12}}><button onClick={()=>setEditingMember(null)} style={{flex:1,padding:"9px",borderRadius:10,background:"#fff",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13}}>취소</button><button onClick={saveMemberEdit} style={{flex:2,padding:"9px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}}>저장</button></div></div>}
      </SheetModal>}

      {modal==="manage-notices"&&<SheetModal title="공지사항 관리" onClose={()=>setModal(null)}>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}><Field label="새 공지 내용"><textarea placeholder="공지 내용..." value={noticeForm} onChange={e=>setNoticeForm(e.target.value)} style={{...iS,minHeight:72,resize:"vertical"}}/></Field><button onClick={addNotice} style={{padding:"11px",borderRadius:12,background:"#1E1B4B",color:"#fff",border:"none",cursor:"pointer",fontSize:14,fontWeight:700}}>공지 등록</button></div>
        {notices.map(n=><div key={n.id} style={{background:"#F9FAFB",borderRadius:10,border:"1px solid #E5E7EB",padding:"10px 12px",marginBottom:8,display:"flex",alignItems:"flex-start",gap:8}}><div style={{flex:1,fontSize:13,color:"#374151",lineHeight:1.5}}>{n.text}</div><div style={{display:"flex",flexDirection:"column",gap:4}}><button onClick={()=>updateFb(`notices/${n.id}`,{active:!n.active})} style={{fontSize:10,padding:"3px 7px",borderRadius:6,background:n.active?"#ECFDF5":"#F3F4F6",color:n.active?"#065F46":"#6B7280",border:"none",cursor:"pointer"}}>{n.active?"표시중":"숨김"}</button><button onClick={()=>delNotice(n.id)} style={{fontSize:10,padding:"3px 7px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer"}}>삭제</button></div></div>)}
      </SheetModal>}
    </div>
  );
}


