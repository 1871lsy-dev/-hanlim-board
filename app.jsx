
const { useState, useEffect } = React;

// ── Firebase 설정 ──
const firebaseConfig = {
  apiKey: "AIzaSyC04Ir2Jt7nZrrJGfGwSxUWOkd3sv7kwDA",
  authDomain: "hanlim-board.firebaseapp.com",
  databaseURL: "https://hanlim-board-default-rtdb.firebaseio.com",
  projectId: "hanlim-board",
  storageBucket: "hanlim-board.firebasestorage.app",
  messagingSenderId: "663569376513",
  appId: "1:663569376513:web:a3829d45c6d01bbfb1e700"
};
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// ── 상수 ──
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

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
function safeRec(r){return{...r,startH:r.startH||"09",startM:r.startM||"00",endH:r.endH||"10",endM:r.endM||"00",assignee:r.assignee||"모두",days:Array.isArray(r.days)?r.days:[],exceptions:Array.isArray(r.exceptions)?r.exceptions:[]};}
function timeLabel(h,m){return h+":"+m;}
function dueStatus(due,col){
  if(!due||col==="완료")return null;
  var today=new Date();today.setHours(0,0,0,0);
  var d=new Date(due);d.setHours(0,0,0,0);
  var diff=Math.round((d-today)/86400000);
  if(diff<0)return{label:"마감 초과",color:"#EF4444",bg:"#FEF2F2"};
  if(diff===0)return{label:"오늘 마감",color:"#F59E0B",bg:"#FFFBEB"};
  if(diff<=2)return{label:"D-"+diff,color:"#F97316",bg:"#FFF7ED"};
  return null;
}

function Avatar(props){
  var name=props.name,members=props.members,size=props.size||26;
  if(!name||name==="모두")return React.createElement("div",{style:{width:size,height:size,borderRadius:"50%",background:"#E5E7EB",border:"1.5px solid #D1D5DB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.4,flexShrink:0}},"👥");
  var m=members&&members.find(function(x){return x.name===name;});
  var color=(m&&m.color)||"#6366F1";
  return React.createElement("div",{style:{width:size,height:size,borderRadius:"50%",background:color+"22",border:"1.5px solid "+color+"66",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.42,fontWeight:700,color:color,flexShrink:0}},name.slice(0,1));
}
function Pill(props){return React.createElement("span",{style:{fontSize:11,padding:"2px 8px",borderRadius:999,background:props.bg,color:props.color,fontWeight:600}},props.label);}
function Field(props){return React.createElement("div",null,React.createElement("div",{style:{fontSize:12,color:"#6B7280",fontWeight:600,marginBottom:5}},props.label),props.children);}

function SheetModal(props){
  return React.createElement("div",{style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"flex-end",zIndex:300},onClick:props.onClose},
    React.createElement("div",{style:{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"20px 20px 36px",maxHeight:"90vh",overflowY:"auto"},onClick:function(e){e.stopPropagation();}},
      React.createElement("div",{style:{width:36,height:4,borderRadius:999,background:"#E5E7EB",margin:"0 auto 16px"}}),
      React.createElement("h3",{style:{margin:"0 0 16px",fontSize:16,fontWeight:700,color:"#111827"}},props.title),
      props.children
    )
  );
}

function TimePicker(props){
  return React.createElement("div",{style:{display:"flex",gap:8}},
    React.createElement("select",{value:props.hVal,onChange:function(e){props.onH(e.target.value);},style:{flex:1,borderRadius:10,border:"1px solid #D1D5DB",padding:"10px 12px",fontSize:14}},
      HOURS.map(function(h){return React.createElement("option",{key:h,value:h},h+"시");})),
    React.createElement("select",{value:props.mVal,onChange:function(e){props.onM(e.target.value);},style:{flex:1,borderRadius:10,border:"1px solid #D1D5DB",padding:"10px 12px",fontSize:14}},
      MINUTES.map(function(m){return React.createElement("option",{key:m,value:m},m+"분");}))
  );
}

function MiniBar(props){
  var pct=props.max>0?Math.round(props.value/props.max*100):0;
  return React.createElement("div",{style:{flex:1,height:6,background:"#F3F4F6",borderRadius:999,overflow:"hidden"}},
    React.createElement("div",{style:{height:6,width:pct+"%",background:props.color,borderRadius:999}}));
}

function CheckAnim(props){
  useEffect(function(){var t=setTimeout(props.onDone,1200);return function(){clearTimeout(t);};},[]);
  return React.createElement("div",{style:{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,pointerEvents:"none"}},
    React.createElement("div",{style:{background:"#fff",borderRadius:24,padding:"28px 36px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",alignItems:"center",gap:10}},
      React.createElement("div",{style:{width:56,height:56,borderRadius:"50%",background:"#ECFDF5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}},"✅"),
      React.createElement("div",{style:{fontSize:15,fontWeight:700,color:"#065F46"}},"완료!")
    )
  );
}

function TabIcon(props){
  var c=props.active?"#6366F1":"#9CA3AF";
  var icons={
    홈:React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),React.createElement("polyline",{points:"9 22 9 12 15 12 15 22"})),
    칸반:React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("rect",{x:3,y:3,width:5,height:18,rx:1}),React.createElement("rect",{x:10,y:3,width:5,height:11,rx:1}),React.createElement("rect",{x:17,y:3,width:5,height:15,rx:1})),
    일정:React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("rect",{x:3,y:4,width:18,height:18,rx:2}),React.createElement("line",{x1:16,y1:2,x2:16,y2:6}),React.createElement("line",{x1:8,y1:2,x2:8,y2:6}),React.createElement("line",{x1:3,y1:10,x2:21,y2:10})),
    반복:React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("polyline",{points:"17 1 21 5 17 9"}),React.createElement("path",{d:"M3 11V9a4 4 0 0 1 4-4h14"}),React.createElement("polyline",{points:"7 23 3 19 7 15"}),React.createElement("path",{d:"M21 13v2a4 4 0 0 1-4 4H3"})),
    통계:React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("line",{x1:18,y1:20,x2:18,y2:10}),React.createElement("line",{x1:12,y1:20,x2:12,y2:4}),React.createElement("line",{x1:6,y1:20,x2:6,y2:14})),
    일지:React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),React.createElement("polyline",{points:"14 2 14 8 20 8"}),React.createElement("line",{x1:16,y1:13,x2:8,y2:13}),React.createElement("line",{x1:16,y1:17,x2:8,y2:17})),
  };
  return icons[props.name]||null;
}

var iS={width:"100%",boxSizing:"border-box",borderRadius:10,border:"1px solid #D1D5DB",padding:"10px 12px",fontSize:14};

function App(){
  var now=new Date();
  var TODAY=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  var todayDow=now.getDay();
  var dateStr=now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일 ("+WEEKDAYS[todayDow]+")";

  var s=useState(null),members=s[0],setMembers=s[1];
  var s2=useState(null),tasks=s2[0],setTasks=s2[1];
  var s3=useState(null),schedules=s3[0],setSchedules=s3[1];
  var s4=useState(null),recurring=s4[0],setRecurring=s4[1];
  var s5=useState(null),notices=s5[0],setNotices=s5[1];
  var s6=useState(null),journals=s6[0],setJournals=s6[1];
  var s7=useState(true),loading=s7[0],setLoading=s7[1];
  var s8=useState(false),saving=s8[0],setSaving=s8[1];
  var s9=useState("홈"),tab=s9[0],setTab=s9[1];
  var s10=useState("할 일"),activeCol=s10[0],setActiveCol=s10[1];
  var s11=useState("전체"),filterMember=s11[0],setFilterMember=s11[1];
  var s12=useState(null),filterDay=s12[0],setFilterDay=s12[1];
  var s13=useState(""),search=s13[0],setSearch=s13[1];
  var s14=useState(false),filterOpen=s14[0],setFilterOpen=s14[1];
  var s15=useState([]),filterPriority=s15[0],setFilterPriority=s15[1];
  var s16=useState([]),filterCol=s16[0],setFilterCol=s16[1];
  var s17=useState(""),filterDueFrom=s17[0],setFilterDueFrom=s17[1];
  var s18=useState(""),filterDueTo=s18[0],setFilterDueTo=s18[1];
  var s19=useState(false),checkAnim=s19[0],setCheckAnim=s19[1];
  var s20=useState(null),modal=s20[0],setModal=s20[1];
  var s21=useState(null),detailTask=s21[0],setDetailTask=s21[1];
  var s22=useState(false),editMode=s22[0],setEditMode=s22[1];
  var s23=useState(null),editForm=s23[0],setEditForm=s23[1];
  var s24=useState(EMPTY_TASK),taskForm=s24[0],setTaskForm=s24[1];
  var s25=useState({member:"",date:TODAY,content:""}),schForm=s25[0],setSchForm=s25[1];
  var s26=useState(EMPTY_REC),recForm=s26[0],setRecForm=s26[1];
  var s27=useState(""),newComment=s27[0],setNewComment=s27[1];
  var s28=useState(null),editingMember=s28[0],setEditingMember=s28[1];
  var s29=useState(""),newMemberName=s29[0],setNewMemberName=s29[1];
  var s30=useState(""),noticeForm=s30[0],setNoticeForm=s30[1];
  var s31=useState(false),confirmReset=s31[0],setConfirmReset=s31[1];
  var s32=useState(""),journalMemo=s32[0],setJournalMemo=s32[1];
  var s33=useState(""),journalAuthor=s33[0],setJournalAuthor=s33[1];
  var s34=useState(false),journalSaved=s34[0],setJournalSaved=s34[1];
  var s35=useState(null),viewingJournalId=s35[0],setViewingJournalId=s35[1];

  useEffect(function(){
    var ref=db.ref("hanlim");
    ref.once("value",function(snap){
      var d=snap.val();
      if(d){
        setMembers(d.members||DEFAULT_MEMBERS);
        setTasks(d.tasks?Object.values(d.tasks).sort(function(a,b){return a.id>b.id?1:-1;}):DEFAULT_TASKS);
        setSchedules(d.schedules?Object.values(d.schedules):DEFAULT_SCHEDULES);
        setRecurring(d.recurring?Object.values(d.recurring).map(safeRec):DEFAULT_RECURRING.map(safeRec));
        setNotices(d.notices?Object.values(d.notices):DEFAULT_NOTICES);
        setJournals(d.journals?Object.values(d.journals).sort(function(a,b){return b.date.localeCompare(a.date);}):[] );
      } else {
        var init={members:DEFAULT_MEMBERS,
          tasks:DEFAULT_TASKS.reduce(function(a,t){a[t.id]=t;return a;},{}),
          schedules:DEFAULT_SCHEDULES.reduce(function(a,s){a[s.id]=s;return a;},{}),
          recurring:DEFAULT_RECURRING.reduce(function(a,r){a[r.id]=r;return a;},{}),
          notices:DEFAULT_NOTICES.reduce(function(a,n){a[n.id]=n;return a;},{}),
          journals:{}};
        ref.set(init);
        setMembers(DEFAULT_MEMBERS);setTasks(DEFAULT_TASKS);setSchedules(DEFAULT_SCHEDULES);
        setRecurring(DEFAULT_RECURRING.map(safeRec));setNotices(DEFAULT_NOTICES);setJournals([]);
      }
      setLoading(false);
    });
    ref.on("value",function(snap){
      var d=snap.val();if(!d)return;
      setMembers(d.members||DEFAULT_MEMBERS);
      setTasks(d.tasks?Object.values(d.tasks).sort(function(a,b){return a.id>b.id?1:-1;}):[] );
      setSchedules(d.schedules?Object.values(d.schedules):[] );
      setRecurring(d.recurring?Object.values(d.recurring).map(safeRec):[] );
      setNotices(d.notices?Object.values(d.notices):[] );
      setJournals(d.journals?Object.values(d.journals).sort(function(a,b){return b.date.localeCompare(a.date);}):[] );
    });
    return function(){ref.off();};
  },[]);

  if(loading||!tasks||!schedules||!recurring||!members||!notices||!journals){
    return React.createElement("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#6366F1",fontSize:14}},
      React.createElement("style",null,"@keyframes spin{to{transform:rotate(360deg)}}"),
      React.createElement("div",{style:{width:40,height:40,border:"3px solid #E0E7FF",borderTop:"3px solid #6366F1",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),
      "한림바이오팜 데이터 연결 중..."
    );
  }

  var dbRef=function(){return db.ref("hanlim");};
  var setFb=function(path,val){setSaving(true);dbRef().child(path).set(val).then(function(){setSaving(false);}).catch(function(){setSaving(false);});};
  var updateFb=function(path,val){setSaving(true);dbRef().child(path).update(val).then(function(){setSaving(false);}).catch(function(){setSaving(false);});};
  var removeFb=function(path){setSaving(true);dbRef().child(path).remove().then(function(){setSaving(false);}).catch(function(){setSaving(false);});};

  var memberNames=members.map(function(m){return m.name;});
  var hasFilter=filterPriority.length>0||filterCol.length>0||filterDueFrom||filterDueTo;

  function toggleArr(arr,setArr,val){setArr(arr.includes(val)?arr.filter(function(x){return x!==val;}):[...arr,val]);}
  function clearFilter(){setFilterPriority([]);setFilterCol([]);setFilterDueFrom("");setFilterDueTo("");}
  function applyFilter(list){return list.filter(function(t){
    if(filterPriority.length>0&&!filterPriority.includes(t.priority))return false;
    if(filterCol.length>0&&!filterCol.includes(t.col))return false;
    if(filterDueFrom&&t.due&&t.due<filterDueFrom)return false;
    if(filterDueTo&&t.due&&t.due>filterDueTo)return false;
    return true;
  });}

  function addTask(){if(!taskForm.title||!taskForm.title.trim())return;var id=uid();setFb("tasks/"+id,Object.assign({},taskForm,{id:id,comments:[]}));setModal(null);}
  function delTask(id){removeFb("tasks/"+id);setDetailTask(null);setModal(null);}
  function moveTask(id,dir,toComplete){var t=tasks.find(function(x){return x.id===id;});if(!t)return;var nc=COLS[Math.max(0,Math.min(COLS.length-1,COLS.indexOf(t.col)+dir))];if(toComplete&&nc==="완료")setCheckAnim(true);updateFb("tasks/"+id,{col:nc});}
  function saveEdit(){if(!editForm||!editForm.title||!editForm.title.trim())return;updateFb("tasks/"+editForm.id,editForm);setDetailTask(function(f){return Object.assign({},f,editForm);});setEditMode(false);}
  function addComment(){if(!newComment.trim()||!detailTask)return;var t=tasks.find(function(x){return x.id===detailTask.id;});var comments=[].concat((t&&t.comments)||[],[newComment.trim()]);updateFb("tasks/"+detailTask.id,{comments:comments});setDetailTask(function(f){return Object.assign({},f,{comments:comments});});setNewComment("");}
  function addSch(){if(!schForm.content||!schForm.content.trim())return;var id=uid();setFb("schedules/"+id,Object.assign({},schForm,{id:id}));setModal(null);}
  function delSch(id){removeFb("schedules/"+id);}
  function addRec(){if(!recForm.title||!recForm.title.trim()||recForm.days.length===0)return;var id=uid();setFb("recurring/"+id,Object.assign({},recForm,{id:id}));setModal(null);}
  function delRec(id){removeFb("recurring/"+id);}
  function toggleDay(d){setRecForm(function(f){return Object.assign({},f,{days:f.days.includes(d)?f.days.filter(function(x){return x!==d;}):f.days.concat([d]).sort()});});}
  function excludeToday(id){var r=recurring.find(function(x){return x.id===id;});if(!r)return;updateFb("recurring/"+id,{exceptions:(r.exceptions||[]).concat([TODAY])});}
  function saveMemberEdit(){
    if(!editingMember||!editingMember.name||!editingMember.name.trim())return;
    var newMs=members.map(function(m){return m.name===editingMember.origName?{name:editingMember.name,color:editingMember.color}:m;});
    setFb("members",newMs);
    if(editingMember.name!==editingMember.origName){
      tasks.filter(function(t){return t.assignee===editingMember.origName;}).forEach(function(t){updateFb("tasks/"+t.id,{assignee:editingMember.name});});
      schedules.filter(function(s){return s.member===editingMember.origName;}).forEach(function(s){updateFb("schedules/"+s.id,{member:editingMember.name});});
      recurring.filter(function(r){return r.assignee===editingMember.origName;}).forEach(function(r){updateFb("recurring/"+r.id,{assignee:editingMember.name});});
    }
    setEditingMember(null);
  }
  function addMember(){if(!newMemberName.trim())return;var newMs=members.concat([{name:newMemberName.trim(),color:COLOR_OPTIONS[members.length%COLOR_OPTIONS.length]}]);setFb("members",newMs);setNewMemberName("");}
  function delMember(name){setFb("members",members.filter(function(m){return m.name!==name;}));}
  function addNotice(){if(!noticeForm.trim())return;var id=uid();setFb("notices/"+id,{id:id,text:noticeForm.trim(),active:true});setNoticeForm("");}
  function delNotice(id){removeFb("notices/"+id);}
  function saveJournal(){
    if(!journalAuthor.trim())return;
    var id=uid();
    var entry={id:id,date:TODAY,author:journalAuthor.trim(),memo:journalMemo,
      doneTasks:tasks.filter(function(t){return t.col==="완료"&&t.due===TODAY;}).map(function(t){return{title:t.title,assignee:t.assignee,priority:t.priority};}),
      schedules:schedules.filter(function(s){return s.date===TODAY;}).map(function(s){return{member:s.member,content:s.content};}),
      recurring:recurring.filter(function(r){return r.days.includes(todayDow)&&!(r.exceptions||[]).includes(TODAY);}).map(function(r){return{title:r.title,time:timeLabel(r.startH,r.startM)+"~"+timeLabel(r.endH,r.endM),assignee:r.assignee};}),
      taskStats:{total:tasks.length,done:tasks.filter(function(t){return t.col==="완료";}).length,inProgress:tasks.filter(function(t){return t.col==="진행 중";}).length,todo:tasks.filter(function(t){return t.col==="할 일";}).length},
      createdAt:new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})};
    setFb("journals/"+id,entry);
    setJournalMemo("");setJournalSaved(true);setTimeout(function(){setJournalSaved(false);},2000);
    setViewingJournalId(id);
  }

  var todayTasks=tasks.filter(function(t){return t.due===TODAY&&t.col!=="완료";});
  var todaySchedules=schedules.filter(function(s){return s.date===TODAY;});
  var todayRecurring=recurring.filter(function(r){return r.days.includes(todayDow)&&!(r.exceptions||[]).includes(TODAY);});
  var filteredRec=filterDay!==null?recurring.filter(function(r){return r.days.includes(filterDay);}):recurring;
  var kanbanTasks=tasks.filter(function(t){return t.col===activeCol&&(filterMember==="전체"||t.assignee===filterMember);});
  var urgentTasks=tasks.filter(function(t){return dueStatus(t.due,t.col)&&t.col!=="완료";});
  var urgentCount=urgentTasks.length;
  var totalDone=tasks.filter(function(t){return t.col==="완료";}).length;
  var doneRate=tasks.length>0?Math.round(totalDone/tasks.length*100):0;
  var prioStats=["높음","중간","낮음"].map(function(p){return{p:p,total:tasks.filter(function(t){return t.priority===p;}).length,done:tasks.filter(function(t){return t.priority===p&&t.col==="완료";}).length};});
  var memberStats=memberNames.map(function(m){return{m:m,active:tasks.filter(function(t){return t.assignee===m&&t.col!=="완료";}).length,done:tasks.filter(function(t){return t.assignee===m&&t.col==="완료";}).length};}).filter(function(x){return x.active+x.done>0;}).sort(function(a,b){return b.active-a.active;});
  var maxMemberTotal=Math.max.apply(null,memberStats.map(function(x){return x.active+x.done;}).concat([1]));
  var activeNotices=notices.filter(function(n){return n.active;});
  var journalsByDate=journals.reduce(function(acc,j){if(!acc[j.date])acc[j.date]=[];acc[j.date].push(j);return acc;},{});
  var journalDates=Object.keys(journalsByDate).sort(function(a,b){return b.localeCompare(a);});
  var searchActive=search.trim()||hasFilter;
  var searchResults=applyFilter(tasks.filter(function(t){return !search.trim()||(t.title.includes(search.trim())||t.assignee.includes(search.trim()));}));

  function renderTaskCard(task,onClick){
    var p=PRIORITY_STYLE[task.priority];var ds=dueStatus(task.due,task.col);var cs=COL_STYLE[task.col];
    return React.createElement("div",{key:task.id,onClick:function(){onClick(task);},style:{background:"#fff",borderRadius:12,border:"1px solid "+(ds?"#FED7AA":"#E5E7EB"),padding:"12px 14px",marginBottom:8,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",gap:8,marginBottom:8}},
        React.createElement("div",{style:{fontSize:14,fontWeight:500,color:"#111827",lineHeight:1.4}},task.title),
        React.createElement(Pill,{label:task.priority,bg:p.bg,color:p.text})),
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5}},
          React.createElement(Avatar,{name:task.assignee,members:members,size:20}),
          React.createElement("span",{style:{fontSize:11,color:"#6B7280"}},task.assignee)),
        React.createElement("div",{style:{display:"flex",gap:5}},
          ds&&React.createElement(Pill,{label:ds.label,bg:ds.bg,color:ds.color}),
          React.createElement(Pill,{label:task.col,bg:cs.light,color:cs.text}))));
  }

  return React.createElement("div",{style:{minHeight:"100vh",background:"#F8FAFC",fontFamily:"'Inter','Pretendard',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:72}},
    checkAnim&&React.createElement(CheckAnim,{onDone:function(){setCheckAnim(false);}}),

    // 공지 배너
    activeNotices.map(function(n){
      return React.createElement("div",{key:n.id,style:{background:"#1E1B4B",padding:"10px 16px",display:"flex",alignItems:"center",gap:10}},
        React.createElement("span",{style:{fontSize:13}},"📢"),
        React.createElement("span",{style:{flex:1,fontSize:12,color:"#E0E7FF",lineHeight:1.5}},n.text),
        React.createElement("button",{onClick:function(){updateFb("notices/"+n.id,{active:false});},style:{background:"none",border:"none",color:"#818CF8",cursor:"pointer",fontSize:16,padding:0}},"✕"));
    }),

    // 헤더
    React.createElement("div",{style:{background:"#6366F1",padding:"16px 18px 14px"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}},
        React.createElement("div",{style:{fontSize:11,color:"#C7D2FE",fontWeight:500}},"한림바이오팜 업무 현황 ",saving&&React.createElement("span",{style:{opacity:0.7}},"· 저장 중...")),
        React.createElement("button",{onClick:function(){setModal("settings");},style:{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"4px 10px",color:"#E0E7FF",fontSize:12,cursor:"pointer"}},"⚙ 설정")),
      React.createElement("div",{style:{fontSize:20,fontWeight:700,color:"#fff"}},dateStr),
      React.createElement("div",{style:{display:"flex",gap:8,marginTop:12}},
        COLS.map(function(col){return React.createElement("div",{key:col,style:{flex:1,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 6px",textAlign:"center"}},
          React.createElement("div",{style:{fontSize:20,fontWeight:700,color:"#fff"}},tasks.filter(function(t){return t.col===col;}).length),
          React.createElement("div",{style:{fontSize:10,color:"#E0E7FF",fontWeight:500}},col));})),
      React.createElement("div",{style:{marginTop:12}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:4}},
          React.createElement("span",{style:{fontSize:11,color:"#C7D2FE"}},"전체 진행률"),
          React.createElement("span",{style:{fontSize:11,color:"#fff",fontWeight:700}},doneRate+"%")),
        React.createElement("div",{style:{height:5,background:"rgba(255,255,255,0.2)",borderRadius:999}},
          React.createElement("div",{style:{height:5,background:"#fff",borderRadius:999,width:doneRate+"%"}})))),

    // 검색 + 필터
    React.createElement("div",{style:{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"10px 14px"}},
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,background:"#F3F4F6",borderRadius:12,padding:"9px 14px",flex:1}},
          React.createElement("span",{style:{fontSize:14,color:"#9CA3AF"}},"🔍"),
          React.createElement("input",{placeholder:"태스크 또는 팀원 검색...",value:search,onChange:function(e){setSearch(e.target.value);},style:{flex:1,border:"none",background:"none",fontSize:13,color:"#111827",outline:"none"}}),
          search&&React.createElement("button",{onClick:function(){setSearch("");},style:{border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#9CA3AF",padding:0}},"✕")),
        React.createElement("button",{onClick:function(){setFilterOpen(function(f){return !f;});},style:{padding:"9px 12px",borderRadius:12,border:"1.5px solid "+(hasFilter?"#6366F1":"#E5E7EB"),background:hasFilter?"#EEF2FF":"#F9FAFB",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:hasFilter?"#6366F1":"#6B7280",flexShrink:0}},
          "필터",hasFilter&&React.createElement("span",{style:{background:"#6366F1",color:"#fff",borderRadius:999,fontSize:10,padding:"1px 5px"}},filterPriority.length+filterCol.length+(filterDueFrom?1:0)+(filterDueTo?1:0)))),
      filterOpen&&React.createElement("div",{style:{marginTop:10,padding:"14px",background:"#F8FAFC",borderRadius:12,border:"1px solid #E5E7EB",display:"flex",flexDirection:"column",gap:12}},
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:6}},"우선순위"),
          React.createElement("div",{style:{display:"flex",gap:6}},
            ["높음","중간","낮음"].map(function(p){var ps=PRIORITY_STYLE[p];var on=filterPriority.includes(p);return React.createElement("button",{key:p,onClick:function(){toggleArr(filterPriority,setFilterPriority,p);},style:{padding:"5px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:"1.5px solid "+(on?ps.text+"66":"#E5E7EB"),background:on?ps.bg:"#fff",color:on?ps.text:"#9CA3AF",cursor:"pointer"}},p);}))),
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:6}},"상태"),
          React.createElement("div",{style:{display:"flex",gap:6}},
            COLS.map(function(c){var cs=COL_STYLE[c];var on=filterCol.includes(c);return React.createElement("button",{key:c,onClick:function(){toggleArr(filterCol,setFilterCol,c);},style:{padding:"5px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:"1.5px solid "+(on?cs.dot+"66":"#E5E7EB"),background:on?cs.light:"#fff",color:on?cs.text:"#9CA3AF",cursor:"pointer"}},c);}))),
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:6}},"마감일 범위"),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
            React.createElement("input",{type:"date",value:filterDueFrom,onChange:function(e){setFilterDueFrom(e.target.value);},style:{flex:1,borderRadius:8,border:"1px solid #D1D5DB",padding:"7px 10px",fontSize:12}}),
            React.createElement("span",{style:{fontSize:11,color:"#9CA3AF"}},"~"),
            React.createElement("input",{type:"date",value:filterDueTo,onChange:function(e){setFilterDueTo(e.target.value);},style:{flex:1,borderRadius:8,border:"1px solid #D1D5DB",padding:"7px 10px",fontSize:12}}))),
        hasFilter&&React.createElement("button",{onClick:clearFilter,style:{padding:"8px",borderRadius:8,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}},"필터 초기화"))),

    // 탭
    React.createElement("div",{style:{background:"#fff",borderBottom:"1px solid #E5E7EB",display:"flex"}},
      TABS.map(function(t){return React.createElement("button",{key:t,onClick:function(){setTab(t);},style:{flex:1,padding:"11px 2px",border:"none",cursor:"pointer",background:"none",borderBottom:tab===t?"2.5px solid #6366F1":"2.5px solid transparent",color:tab===t?"#6366F1":"#9CA3AF",fontSize:11,fontWeight:tab===t?700:400,position:"relative"}},
        t,
        t==="홈"&&urgentCount>0&&React.createElement("span",{style:{position:"absolute",top:5,right:"10%",width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}},urgentCount));})),

    React.createElement("div",{style:{padding:"14px 14px 0"}},

      // 검색/필터 결과
      searchActive&&!["통계","일지"].includes(tab)&&React.createElement("div",{style:{marginBottom:8}},
        React.createElement("div",{style:{fontSize:12,color:"#9CA3AF",fontWeight:600,marginBottom:10}},(search.trim()?"검색":"필터")+" 결과 "+searchResults.length+"건"),
        searchResults.length===0?React.createElement("div",{style:{textAlign:"center",padding:"30px 0",color:"#D1D5DB",fontSize:13}},"결과가 없습니다"):
        searchResults.map(function(task){return renderTaskCard(task,function(t){setDetailTask(t);setEditMode(false);});})),

      // 홈
      !searchActive&&tab==="홈"&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:0}},
        urgentTasks.length>0&&React.createElement("section",{style:{marginBottom:24}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:12,paddingBottom:8,borderBottom:"2px solid #FEE2E2"}},
            React.createElement("span",{style:{fontSize:14}},"⚠️"),
            React.createElement("span",{style:{fontSize:14,fontWeight:700,color:"#111827"}},"마감 임박 / 초과"),
            React.createElement(Pill,{label:urgentTasks.length,bg:"#FEF2F2",color:"#EF4444"})),
          urgentTasks.map(function(task){var ds=dueStatus(task.due,task.col);return React.createElement("div",{key:task.id,onClick:function(){setDetailTask(task);setEditMode(false);},style:{background:ds.bg,borderRadius:12,border:"1px solid "+ds.color+"33",padding:"11px 14px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10}},
            React.createElement("div",{style:{width:3,height:32,borderRadius:999,background:ds.color,flexShrink:0}}),
            React.createElement("div",{style:{flex:1}},
              React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#111827"}},task.title),
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4}},
                React.createElement(Avatar,{name:task.assignee,members:members,size:16}),
                React.createElement("span",{style:{fontSize:11,color:"#6B7280"}},task.assignee),
                React.createElement("span",{style:{fontSize:11,fontWeight:700,color:ds.color,marginLeft:"auto"}},ds.label))));})),

        todayRecurring.length>0&&React.createElement("section",{style:{marginBottom:24}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:12,paddingBottom:8,borderBottom:"2px solid #E9D5FF"}},
            React.createElement("div",{style:{width:9,height:9,borderRadius:"50%",background:"#8B5CF6"}}),
            React.createElement("span",{style:{fontSize:14,fontWeight:700,color:"#111827"}},"오늘 반복 일정"),
            React.createElement(Pill,{label:todayRecurring.length,bg:"#F5F3FF",color:"#5B21B6"})),
          todayRecurring.map(function(r){return React.createElement("div",{key:r.id,style:{background:"#fff",borderRadius:12,border:"1px solid #E9D5FF",padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}},
            React.createElement("div",{style:{width:3,height:36,borderRadius:999,background:"#8B5CF6",flexShrink:0}}),
            React.createElement("div",{style:{flex:1}},
              React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#111827"}},r.title),
              React.createElement("div",{style:{fontSize:12,color:"#8B5CF6",marginTop:2,fontWeight:500}},timeLabel(r.startH,r.startM)+" ~ "+timeLabel(r.endH,r.endM)+" · 매주 "+r.days.map(function(d){return WEEKDAYS[d]+"요일";}).join(", ")),
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5,marginTop:5}},
                React.createElement(Avatar,{name:r.assignee,members:members,size:18}),
                React.createElement("span",{style:{fontSize:11,color:"#6B7280"}},r.assignee==="모두"?"전체 팀원":r.assignee)),
              r.content&&React.createElement("div",{style:{fontSize:12,color:"#6B7280",marginTop:3}},r.content)),
            React.createElement("button",{onClick:function(){excludeToday(r.id);},style:{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",flexShrink:0}},"오늘 제외"));})),

        React.createElement("section",{style:{marginBottom:24}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"2px solid #FEE2E2"}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
              React.createElement("div",{style:{width:9,height:9,borderRadius:"50%",background:"#EF4444"}}),
              React.createElement("span",{style:{fontSize:14,fontWeight:700,color:"#111827"}},"오늘 꼭 해야 할 일"),
              React.createElement(Pill,{label:todayTasks.length,bg:"#FEE2E2",color:"#991B1B"})),
            React.createElement("button",{onClick:function(){setTaskForm(Object.assign({},EMPTY_TASK,{priority:"높음",due:TODAY,assignee:memberNames[0]||""}));setModal("add-task");},style:{fontSize:12,padding:"5px 12px",borderRadius:8,background:"#EEF2FF",color:"#6366F1",border:"none",cursor:"pointer",fontWeight:600}},"+ 추가")),
          todayTasks.length===0?React.createElement("div",{style:{textAlign:"center",padding:"20px 0",color:"#D1D5DB",fontSize:13}},"오늘 예정된 업무가 없습니다"):
          todayTasks.map(function(task){return renderTaskCard(task,function(t){setDetailTask(t);setEditMode(false);});})),

        React.createElement("section",{style:{marginBottom:24}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"2px solid #C7D2FE"}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
              React.createElement("div",{style:{width:9,height:9,borderRadius:"50%",background:"#6366F1"}}),
              React.createElement("span",{style:{fontSize:14,fontWeight:700,color:"#111827"}},"오늘 팀원 일정"),
              React.createElement(Pill,{label:todaySchedules.length,bg:"#EEF2FF",color:"#3730A3"})),
            React.createElement("button",{onClick:function(){setSchForm({member:memberNames[0]||"",date:TODAY,content:""});setModal("add-sch");},style:{fontSize:12,padding:"5px 12px",borderRadius:8,background:"#EEF2FF",color:"#6366F1",border:"none",cursor:"pointer",fontWeight:600}},"+추가")),
          todaySchedules.length===0?React.createElement("div",{style:{textAlign:"center",padding:"20px 0",color:"#D1D5DB",fontSize:13}},"오늘 등록된 일정이 없습니다"):
          todaySchedules.map(function(s){var mc=members.find(function(m){return m.name===s.member;});return React.createElement("div",{key:s.id,style:{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}},
            React.createElement("div",{style:{width:3,height:36,borderRadius:999,background:(mc&&mc.color)||"#6366F1",flexShrink:0}}),
            React.createElement(Avatar,{name:s.member,members:members,size:30}),
            React.createElement("div",{style:{flex:1}},
              React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#374151"}},s.member),
              React.createElement("div",{style:{fontSize:13,color:"#111827",marginTop:1}},s.content)),
            React.createElement("button",{onClick:function(){delSch(s.id);},style:{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer"}},"삭제"));})),

        React.createElement("section",{style:{marginBottom:16}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"2px solid #A7F3D0"}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
              React.createElement("div",{style:{width:9,height:9,borderRadius:"50%",background:"#10B981"}}),
              React.createElement("span",{style:{fontSize:14,fontWeight:700,color:"#111827"}},"팀원 현황"),
              React.createElement("span",{style:{fontSize:11,color:"#9CA3AF"}},members.length+"명")),
            React.createElement("span",{style:{fontSize:11,color:"#9CA3AF",background:"#F3F4F6",borderRadius:6,padding:"3px 8px"}},"숫자 = 진행 중인 업무 수")),
          React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:7}},
            members.map(function(m){var cnt=tasks.filter(function(t){return t.assignee===m.name&&t.col!=="완료";}).length;return React.createElement("div",{key:m.name,style:{display:"flex",alignItems:"center",gap:5,background:"#fff",borderRadius:999,padding:"4px 10px 4px 5px",border:"1px solid #E5E7EB"}},
              React.createElement(Avatar,{name:m.name,members:members,size:22}),
              React.createElement("span",{style:{fontSize:12,color:"#374151",fontWeight:500}},m.name),
              cnt>0&&React.createElement(Pill,{label:cnt,bg:"#EEF2FF",color:"#6366F1"}));})))) ,

      // 칸반
      !searchActive&&tab==="칸반"&&React.createElement("div",null,
        React.createElement("div",{style:{display:"flex",marginBottom:10,background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",overflow:"hidden"}},
          COLS.map(function(col){var isA=col===activeCol;var s=COL_STYLE[col];return React.createElement("button",{key:col,onClick:function(){setActiveCol(col);},style:{flex:1,padding:"11px 4px",border:"none",cursor:"pointer",background:isA?s.light:"#fff",borderBottom:isA?"2.5px solid "+s.dot:"2.5px solid transparent",color:isA?s.dot:"#9CA3AF",fontSize:13,fontWeight:isA?700:400}},col+" ",React.createElement("span",{style:{fontSize:11}},tasks.filter(function(t){return t.col===col;}).length));})),
        React.createElement("div",{style:{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}},
          ["전체"].concat(memberNames).map(function(m){var isA=m===filterMember;var mc=members.find(function(x){return x.name===m;});var color=m==="전체"?"#6366F1":((mc&&mc.color)||"#6366F1");return React.createElement("button",{key:m,onClick:function(){setFilterMember(m);},style:{flexShrink:0,display:"flex",alignItems:"center",gap:4,padding:"5px 10px 5px 5px",borderRadius:999,fontSize:11,fontWeight:600,border:"1.5px solid "+(isA?color+"66":"#E5E7EB"),cursor:"pointer",background:isA?color+"11":"#fff",color:isA?color:"#9CA3AF"}},
            m==="전체"?React.createElement("span",{style:{fontSize:13}},"👥"):React.createElement(Avatar,{name:m,members:members,size:18}),m);})),
        React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:10}},
          React.createElement("button",{onClick:function(){setTaskForm(Object.assign({},EMPTY_TASK,{col:activeCol,assignee:memberNames[0]||""}));setModal("add-task");},style:{fontSize:12,padding:"7px 14px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}},"+태스크 추가")),
        kanbanTasks.length===0?React.createElement("div",{style:{textAlign:"center",padding:"40px 0",color:"#D1D5DB",fontSize:13}},"태스크가 없습니다"):
        kanbanTasks.map(function(task){var p=PRIORITY_STYLE[task.priority];var ds=dueStatus(task.due,task.col);var ci=COLS.indexOf(task.col);var nextIsDone=COLS[ci+1]==="완료";return React.createElement("div",{key:task.id,onClick:function(){setDetailTask(task);setEditMode(false);},style:{background:"#fff",borderRadius:12,border:"1px solid "+(ds?"#FED7AA":"#E5E7EB"),padding:"13px 14px",marginBottom:10,cursor:"pointer"}},
          React.createElement("div",{style:{fontSize:14,fontWeight:500,color:"#111827",marginBottom:8,lineHeight:1.4}},task.title),
          React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},React.createElement(Avatar,{name:task.assignee,members:members,size:22}),React.createElement("span",{style:{fontSize:12,color:"#6B7280"}},task.assignee)),
            React.createElement("div",{style:{display:"flex",gap:5}},React.createElement(Pill,{label:task.priority,bg:p.bg,color:p.text}),ds&&React.createElement(Pill,{label:ds.label,bg:ds.bg,color:ds.color}))),
          task.due&&React.createElement("div",{style:{marginTop:7,fontSize:11,color:ds?ds.color:"#9CA3AF"}},"마감 "+task.due),
          React.createElement("div",{style:{display:"flex",gap:6,marginTop:10,borderTop:"1px solid #F3F4F6",paddingTop:8}},
            ci>0&&React.createElement("button",{onClick:function(e){e.stopPropagation();moveTask(task.id,-1,false);},style:{fontSize:11,padding:"4px 10px",borderRadius:8,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",color:"#6B7280"}},"← 이전"),
            ci<COLS.length-1&&React.createElement("button",{onClick:function(e){e.stopPropagation();moveTask(task.id,1,nextIsDone);},style:{fontSize:11,padding:"4px 10px",borderRadius:8,background:nextIsDone?"#ECFDF5":"#F9FAFB",border:"1px solid "+(nextIsDone?"#A7F3D0":"#E5E7EB"),cursor:"pointer",color:nextIsDone?"#065F46":"#6B7280",marginLeft:"auto",fontWeight:nextIsDone?600:400}},nextIsDone?"✓ 완료":"다음 →")));})),

      // 일정
      !searchActive&&tab==="일정"&&(function(){
        var sorted=[].concat(schedules).sort(function(a,b){return a.date.localeCompare(b.date)||a.member.localeCompare(b.member);});
        var grouped=sorted.reduce(function(acc,s){var key=s.date<TODAY?"지난 일정":s.date===TODAY?"오늘":s.date;if(!acc[key])acc[key]=[];acc[key].push(s);return acc;},{});
        var keys=Object.keys(grouped).sort(function(a,b){if(a==="지난 일정")return -1;if(b==="지난 일정")return 1;if(a==="오늘")return -1;if(b==="오늘")return 1;return a.localeCompare(b);});
        return React.createElement("div",null,
          React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:12}},
            React.createElement("button",{onClick:function(){setSchForm({member:memberNames[0]||"",date:TODAY,content:""});setModal("add-sch");},style:{fontSize:12,padding:"7px 14px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}},"+일정 추가")),
          schedules.length===0?React.createElement("div",{style:{textAlign:"center",padding:"40px 0",color:"#D1D5DB",fontSize:13}},"등록된 일정이 없습니다"):
          keys.map(function(dk){var isToday=dk==="오늘";var isPast=dk==="지난 일정";return React.createElement("div",{key:dk,style:{marginBottom:18}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8}},
              React.createElement("div",{style:{width:8,height:8,borderRadius:"50%",background:isToday?"#6366F1":isPast?"#D1D5DB":"#10B981",flexShrink:0}}),
              React.createElement("span",{style:{fontSize:12,fontWeight:700,color:isToday?"#6366F1":isPast?"#9CA3AF":"#065F46"}},dk),
              React.createElement("div",{style:{flex:1,height:"1px",background:"#F3F4F6"}}),
              React.createElement("span",{style:{fontSize:11,color:"#9CA3AF"}},grouped[dk].length+"건")),
            grouped[dk].map(function(s){var mc=members.find(function(m){return m.name===s.member;});return React.createElement("div",{key:s.id,style:{background:"#fff",borderRadius:12,border:"1px solid "+(isToday?"#C7D2FE":isPast?"#F3F4F6":"#E5E7EB"),padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10,opacity:isPast?0.6:1}},
              React.createElement("div",{style:{width:3,height:36,borderRadius:999,background:(mc&&mc.color)||"#6366F1",flexShrink:0}}),
              React.createElement(Avatar,{name:s.member,members:members,size:28}),
              React.createElement("div",{style:{flex:1}},
                React.createElement("div",{style:{fontSize:12,fontWeight:600,color:"#374151"}},s.member),
                React.createElement("div",{style:{fontSize:13,color:"#111827",marginTop:2}},s.content)),
              React.createElement("button",{onClick:function(){delSch(s.id);},style:{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",flexShrink:0}},"삭제"));}););}));
      })(),

      // 반복
      !searchActive&&tab==="반복"&&React.createElement("div",null,
        React.createElement("div",{style:{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}},
          React.createElement("button",{onClick:function(){setFilterDay(null);},style:{flexShrink:0,padding:"6px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",background:filterDay===null?"#6366F1":"#F3F4F6",color:filterDay===null?"#fff":"#6B7280"}},"전체"),
          WEEKDAYS.map(function(d,i){var dc=DAY_COLORS[i];var isA=filterDay===i;return React.createElement("button",{key:i,onClick:function(){setFilterDay(filterDay===i?null:i);},style:{flexShrink:0,padding:"6px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:"1.5px solid "+(isA?dc.border:"#E5E7EB"),cursor:"pointer",background:isA?dc.bg:"#fff",color:isA?dc.text:"#6B7280"}},d+"요일");})),
        React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:12}},
          React.createElement("button",{onClick:function(){setRecForm(Object.assign({},EMPTY_REC,{assignee:memberNames[0]||"모두"}));setModal("add-rec");},style:{fontSize:12,padding:"7px 14px",borderRadius:10,background:"#8B5CF6",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}},"+반복 일정 추가")),
        filteredRec.length===0?React.createElement("div",{style:{textAlign:"center",padding:"40px 0",color:"#D1D5DB",fontSize:13}},"반복 일정이 없습니다"):
        filteredRec.map(function(r){return React.createElement("div",{key:r.id,style:{background:"#fff",borderRadius:12,border:"1px solid #E9D5FF",padding:"14px",marginBottom:10}},
          React.createElement("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}},
            React.createElement("div",{style:{fontSize:14,fontWeight:600,color:"#111827"}},r.title),
            React.createElement("button",{onClick:function(){delRec(r.id);},style:{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",flexShrink:0}},"삭제")),
          React.createElement("div",{style:{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}},
            r.days.map(function(d){var dc=DAY_COLORS[d];return React.createElement("span",{key:d,style:{fontSize:11,padding:"3px 9px",borderRadius:999,background:dc.bg,color:dc.text,border:"1px solid "+dc.border,fontWeight:600}},WEEKDAY_FULL[d]);}),
            React.createElement("span",{style:{fontSize:11,padding:"3px 9px",borderRadius:999,background:"#F5F3FF",color:"#5B21B6",fontWeight:600}},"⏰ "+timeLabel(r.startH,r.startM)+" ~ "+timeLabel(r.endH,r.endM))),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:r.content?6:0}},
            React.createElement(Avatar,{name:r.assignee,members:members,size:20}),
            React.createElement("span",{style:{fontSize:12,color:"#6B7280"}},r.assignee==="모두"?"전체 팀원":r.assignee)),
          r.content&&React.createElement("div",{style:{fontSize:12,color:"#6B7280",lineHeight:1.5,marginTop:4}},r.content));})),

      // 통계
      tab==="통계"&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:16,paddingBottom:8}},
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}},
          [["전체",tasks.length,"#6366F1","#EEF2FF"],["진행 중",tasks.filter(function(t){return t.col!=="완료";}).length,"#F59E0B","#FFFBEB"],["완료",totalDone,"#10B981","#ECFDF5"]].map(function(x){return React.createElement("div",{key:x[0],style:{background:x[3],borderRadius:12,padding:"12px 8px",textAlign:"center"}},React.createElement("div",{style:{fontSize:22,fontWeight:700,color:x[2]}},x[1]),React.createElement("div",{style:{fontSize:11,color:x[2],fontWeight:500,marginTop:2}},x[0]));})),
        React.createElement("section",null,
          React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#111827",marginBottom:10}},"우선순위별 현황"),
          prioStats.map(function(x){var ps=PRIORITY_STYLE[x.p];var rate=x.total>0?Math.round(x.done/x.total*100):0;return React.createElement("div",{key:x.p,style:{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"12px 14px",marginBottom:8}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}},React.createElement(Pill,{label:x.p,bg:ps.bg,color:ps.text}),React.createElement("span",{style:{fontSize:12,color:"#6B7280"}},x.done+"/"+x.total+"건 완료 ("+rate+"%)")),
            React.createElement("div",{style:{height:7,background:"#F3F4F6",borderRadius:999,overflow:"hidden"}},React.createElement("div",{style:{height:7,width:rate+"%",background:ps.bar,borderRadius:999}})));}))),

      // 일지
      tab==="일지"&&React.createElement("div",{style:{paddingBottom:8}},
        React.createElement("div",{style:{background:"#fff",borderRadius:16,border:"1px solid #E5E7EB",padding:"16px",marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14}},
            React.createElement("div",{style:{width:9,height:9,borderRadius:"50%",background:"#6366F1"}}),
            React.createElement("span",{style:{fontSize:14,fontWeight:700,color:"#111827"}},"오늘 일지 작성"),
            React.createElement("span",{style:{fontSize:11,color:"#9CA3AF",marginLeft:"auto"}},TODAY)),
          React.createElement("div",{style:{background:"#F8FAFC",borderRadius:12,padding:"12px 14px",marginBottom:12,display:"flex",flexDirection:"column",gap:8}},
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#9CA3AF",marginBottom:2}},"자동 수집 내용"),
            [["✅ 완료 태스크",tasks.filter(function(t){return t.col==="완료"&&t.due===TODAY;}).length+"건","#065F46"],
             ["📅 팀원 일정",todaySchedules.length+"건","#3730A3"],
             ["🔄 반복 일정",todayRecurring.length+"건","#5B21B6"],
             ["📊 전체 현황","할 일 "+tasks.filter(function(t){return t.col==="할 일";}).length+" · 진행 중 "+tasks.filter(function(t){return t.col==="진행 중";}).length+" · 완료 "+totalDone,"#374151"]
            ].map(function(x){return React.createElement("div",{key:x[0],style:{display:"flex",alignItems:"center",gap:8}},React.createElement("span",{style:{fontSize:11,color:"#6B7280",minWidth:80}},x[0]),React.createElement("span",{style:{fontSize:12,fontWeight:600,color:x[2]}},x[1]));})),
          React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
            React.createElement(Field,{label:"작성자"},
              React.createElement("select",{value:journalAuthor,onChange:function(e){setJournalAuthor(e.target.value);},style:iS},
                React.createElement("option",{value:""},"작성자 선택"),
                memberNames.map(function(m){return React.createElement("option",{key:m},m);}))),
            React.createElement(Field,{label:"특이사항 / 메모 (선택)"},
              React.createElement("textarea",{placeholder:"오늘의 특이사항, 공유사항, 내일 계획 등...",value:journalMemo,onChange:function(e){setJournalMemo(e.target.value);},style:Object.assign({},iS,{minHeight:90,resize:"vertical",lineHeight:1.6})})),
            React.createElement("button",{onClick:saveJournal,style:{padding:"13px",borderRadius:12,background:journalSaved?"#ECFDF5":"#6366F1",color:journalSaved?"#065F46":"#fff",border:journalSaved?"1px solid #A7F3D0":"none",cursor:"pointer",fontSize:14,fontWeight:700}},journalSaved?"✓ 일지 저장됨!":"📝 오늘 일지 저장"))),
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#111827",marginBottom:12}},"지난 일지 ("+journals.length+"개)"),
        journalDates.length===0?React.createElement("div",{style:{textAlign:"center",padding:"30px 0",color:"#D1D5DB",fontSize:13}},"저장된 일지가 없습니다"):
        journalDates.map(function(date){return journalsByDate[date].map(function(j){return React.createElement("div",{key:j.id,onClick:function(){setViewingJournalId(function(prev){return prev===j.id?null:j.id;});},style:{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"14px",marginBottom:8,cursor:"pointer"}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:viewingJournalId===j.id?12:0}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
              React.createElement("div",{style:{width:7,height:7,borderRadius:"50%",background:"#6366F1"}}),
              React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#111827"}},j.date),
              React.createElement("span",{style:{fontSize:11,color:"#9CA3AF"}},j.createdAt)),
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
              React.createElement(Avatar,{name:j.author,members:members,size:20}),
              React.createElement("span",{style:{fontSize:11,color:"#6B7280"}},j.author),
              React.createElement("span",{style:{fontSize:12,color:"#9CA3AF"}},viewingJournalId===j.id?"▲":"▼"))),
          viewingJournalId===j.id&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:12}},
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}},
              [["할 일",(j.taskStats&&j.taskStats.todo)||0,"#6366F1","#EEF2FF"],["진행 중",(j.taskStats&&j.taskStats.inProgress)||0,"#F59E0B","#FFFBEB"],["완료",(j.taskStats&&j.taskStats.done)||0,"#10B981","#ECFDF5"]].map(function(x){return React.createElement("div",{key:x[0],style:{background:x[3],borderRadius:8,padding:"8px 4px",textAlign:"center"}},React.createElement("div",{style:{fontSize:16,fontWeight:700,color:x[2]}},x[1]),React.createElement("div",{style:{fontSize:10,color:x[2],fontWeight:500}},x[0]));})),
            j.memo&&React.createElement("div",null,
              React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#374151",marginBottom:6}},"📝 메모"),
              React.createElement("div",{style:{padding:"10px 12px",background:"#F9FAFB",borderRadius:8,fontSize:13,color:"#374151",lineHeight:1.7,whiteSpace:"pre-wrap"}},j.memo)),
            React.createElement("button",{onClick:function(e){e.stopPropagation();removeFb("journals/"+j.id);setViewingJournalId(null);},style:{padding:"8px",borderRadius:8,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}},"삭제")));});}))
    ),

    // 하단 탭바
    React.createElement("div",{style:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #E5E7EB",display:"flex"}},
      TABS.map(function(t){return React.createElement("button",{key:t,onClick:function(){setTab(t);},style:{flex:1,padding:"10px 2px 8px",border:"none",cursor:"pointer",background:"none",color:tab===t?"#6366F1":"#9CA3AF",fontSize:10,fontWeight:tab===t?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}},
        React.createElement(TabIcon,{name:t,active:tab===t}),t,
        t==="홈"&&urgentCount>0&&React.createElement("span",{style:{position:"absolute",top:5,right:"10%",width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}},urgentCount));})),

    // 모달들
    modal==="add-task"&&React.createElement(SheetModal,{title:"태스크 추가",onClose:function(){setModal(null);}},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        React.createElement(Field,{label:"제목"},React.createElement("input",{placeholder:"업무 내용",value:taskForm.title||"",onChange:function(e){setTaskForm(function(f){return Object.assign({},f,{title:e.target.value});});},style:iS})),
        React.createElement(Field,{label:"담당자"},React.createElement("select",{value:taskForm.assignee||"",onChange:function(e){setTaskForm(function(f){return Object.assign({},f,{assignee:e.target.value});});},style:iS},memberNames.map(function(m){return React.createElement("option",{key:m},m);}))),
        React.createElement(Field,{label:"우선순위"},React.createElement("select",{value:taskForm.priority||"중간",onChange:function(e){setTaskForm(function(f){return Object.assign({},f,{priority:e.target.value});});},style:iS},["높음","중간","낮음"].map(function(p){return React.createElement("option",{key:p},p);}))),
        React.createElement(Field,{label:"마감일"},React.createElement("input",{type:"date",value:taskForm.due||"",onChange:function(e){setTaskForm(function(f){return Object.assign({},f,{due:e.target.value});});},style:iS})),
        React.createElement(Field,{label:"컬럼"},React.createElement("select",{value:taskForm.col||"할 일",onChange:function(e){setTaskForm(function(f){return Object.assign({},f,{col:e.target.value});});},style:iS},COLS.map(function(c){return React.createElement("option",{key:c},c);}))),
        React.createElement("button",{onClick:addTask,style:{marginTop:6,padding:"13px",borderRadius:12,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}},"추가하기"))),

    detailTask&&(function(){
      var task=tasks.find(function(t){return t.id===detailTask.id;})||detailTask;
      var p=PRIORITY_STYLE[task.priority];var cs=COL_STYLE[task.col];var ci=COLS.indexOf(task.col);var ds=dueStatus(task.due,task.col);var nextIsDone=COLS[ci+1]==="완료";
      return React.createElement(SheetModal,{title:editMode?"태스크 수정":task.title,onClose:function(){setDetailTask(null);setEditMode(false);}},
        !editMode?React.createElement("div",null,
          React.createElement("div",{style:{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}},
            React.createElement(Pill,{label:task.priority,bg:p.bg,color:p.text}),
            React.createElement(Pill,{label:task.col,bg:cs.light,color:cs.text}),
            ds&&React.createElement(Pill,{label:ds.label,bg:ds.bg,color:ds.color})),
          React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8,fontSize:13,marginBottom:14}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},React.createElement("span",{style:{color:"#9CA3AF",fontWeight:600,minWidth:44}},"담당자"),React.createElement("div",{style:{display:"flex",alignItems:"center",gap:7}},React.createElement(Avatar,{name:task.assignee,members:members,size:22}),React.createElement("span",null,task.assignee))),
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},React.createElement("span",{style:{color:"#9CA3AF",fontWeight:600,minWidth:44}},"마감일"),React.createElement("span",{style:{color:"#111827"}},task.due||"없음"))),
          React.createElement("div",{style:{display:"flex",gap:6,marginBottom:12}},
            ci>0&&React.createElement("button",{onClick:function(){moveTask(task.id,-1,false);setDetailTask(function(t){return Object.assign({},t,{col:COLS[COLS.indexOf(t.col)-1]});});},style:{flex:1,padding:"9px",borderRadius:10,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13,color:"#374151"}},"← 이전 단계"),
            ci<COLS.length-1&&React.createElement("button",{onClick:function(){moveTask(task.id,1,nextIsDone);setDetailTask(function(t){return Object.assign({},t,{col:COLS[COLS.indexOf(t.col)+1]});});},style:{flex:1,padding:"9px",borderRadius:10,background:nextIsDone?"#ECFDF5":"#EEF2FF",border:"1px solid "+(nextIsDone?"#A7F3D0":"#C7D2FE"),cursor:"pointer",fontSize:13,color:nextIsDone?"#065F46":"#3730A3",fontWeight:600}},nextIsDone?"✓ 완료로 이동":"다음 단계 →")),
          React.createElement("button",{onClick:function(){setEditForm({id:task.id,title:task.title,assignee:task.assignee,priority:task.priority,due:task.due,col:task.col});setEditMode(true);},style:{width:"100%",padding:"10px",borderRadius:10,background:"#F5F3FF",color:"#5B21B6",border:"1px solid #E9D5FF",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:12}},"✏️ 수정하기"),
          React.createElement("div",{style:{borderTop:"1px solid #F3F4F6",paddingTop:14}},
            React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#374151",marginBottom:8}},"댓글 "+((task.comments&&task.comments.length)||0)+"개"),
            (task.comments||[]).map(function(c,i){return React.createElement("div",{key:i,style:{fontSize:13,padding:"9px 12px",background:"#F9FAFB",borderRadius:8,marginBottom:6,color:"#374151"}},c);}),
            React.createElement("div",{style:{display:"flex",gap:8,marginTop:8}},
              React.createElement("input",{placeholder:"댓글 입력...",value:newComment,onChange:function(e){setNewComment(e.target.value);},onKeyDown:function(e){if(e.key==="Enter")addComment();},style:Object.assign({},iS,{flex:1})}),
              React.createElement("button",{onClick:addComment,style:{padding:"10px 14px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}},"작성"))),
          React.createElement("button",{onClick:function(){delTask(task.id);},style:{marginTop:14,width:"100%",padding:"11px",borderRadius:10,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}},"태스크 삭제")):
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
          React.createElement(Field,{label:"제목"},React.createElement("input",{value:editForm.title||"",onChange:function(e){setEditForm(function(f){return Object.assign({},f,{title:e.target.value});});},style:iS})),
          React.createElement(Field,{label:"담당자"},React.createElement("select",{value:editForm.assignee||"",onChange:function(e){setEditForm(function(f){return Object.assign({},f,{assignee:e.target.value});});},style:iS},memberNames.map(function(m){return React.createElement("option",{key:m},m);}))),
          React.createElement(Field,{label:"우선순위"},React.createElement("select",{value:editForm.priority||"중간",onChange:function(e){setEditForm(function(f){return Object.assign({},f,{priority:e.target.value});});},style:iS},["높음","중간","낮음"].map(function(p){return React.createElement("option",{key:p},p);}))),
          React.createElement(Field,{label:"마감일"},React.createElement("input",{type:"date",value:editForm.due||"",onChange:function(e){setEditForm(function(f){return Object.assign({},f,{due:e.target.value});});},style:iS})),
          React.createElement(Field,{label:"컬럼"},React.createElement("select",{value:editForm.col||"할 일",onChange:function(e){setEditForm(function(f){return Object.assign({},f,{col:e.target.value});});},style:iS},COLS.map(function(c){return React.createElement("option",{key:c},c);}))),
          React.createElement("div",{style:{display:"flex",gap:8,marginTop:4}},
            React.createElement("button",{onClick:function(){setEditMode(false);},style:{flex:1,padding:"11px",borderRadius:10,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13,color:"#374151"}},"취소"),
            React.createElement("button",{onClick:saveEdit,style:{flex:2,padding:"11px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}},"저장하기"))));
    })(),

    modal==="add-sch"&&React.createElement(SheetModal,{title:"일정 추가",onClose:function(){setModal(null);}},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        React.createElement(Field,{label:"팀원"},React.createElement("select",{value:schForm.member||"",onChange:function(e){setSchForm(function(f){return Object.assign({},f,{member:e.target.value});});},style:iS},memberNames.map(function(m){return React.createElement("option",{key:m},m);}))),
        React.createElement(Field,{label:"날짜"},React.createElement("input",{type:"date",value:schForm.date||"",onChange:function(e){setSchForm(function(f){return Object.assign({},f,{date:e.target.value});});},style:iS})),
        React.createElement(Field,{label:"일정 내용"},React.createElement("input",{placeholder:"일정 내용 입력",value:schForm.content||"",onChange:function(e){setSchForm(function(f){return Object.assign({},f,{content:e.target.value});});},style:iS})),
        React.createElement("button",{onClick:addSch,style:{marginTop:6,padding:"13px",borderRadius:12,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}},"추가하기"))),

    modal==="add-rec"&&React.createElement(SheetModal,{title:"반복 일정 추가",onClose:function(){setModal(null);}},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:12}},
        React.createElement(Field,{label:"일정 제목"},React.createElement("input",{placeholder:"예: 주간 팀 미팅",value:recForm.title||"",onChange:function(e){setRecForm(function(f){return Object.assign({},f,{title:e.target.value});});},style:iS})),
        React.createElement(Field,{label:"반복 요일"},
          React.createElement("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
            WEEKDAYS.map(function(d,i){var isOn=recForm.days.includes(i);var dc=DAY_COLORS[i];return React.createElement("button",{key:i,onClick:function(){toggleDay(i);},style:{padding:"7px 12px",borderRadius:999,fontSize:13,fontWeight:600,border:"1.5px solid "+(isOn?dc.border:"#E5E7EB"),cursor:"pointer",background:isOn?dc.bg:"#F9FAFB",color:isOn?dc.text:"#9CA3AF"}},d);}))),
        React.createElement(Field,{label:"시작 시간"},React.createElement(TimePicker,{hVal:recForm.startH,mVal:recForm.startM,onH:function(v){setRecForm(function(f){return Object.assign({},f,{startH:v});});},onM:function(v){setRecForm(function(f){return Object.assign({},f,{startM:v});});}})),
        React.createElement(Field,{label:"마감 시간"},React.createElement(TimePicker,{hVal:recForm.endH,mVal:recForm.endM,onH:function(v){setRecForm(function(f){return Object.assign({},f,{endH:v});});},onM:function(v){setRecForm(function(f){return Object.assign({},f,{endM:v});});}})),
        React.createElement(Field,{label:"담당자"},React.createElement("select",{value:recForm.assignee||"모두",onChange:function(e){setRecForm(function(f){return Object.assign({},f,{assignee:e.target.value});});},style:iS},memberNames.concat(["모두"]).map(function(m){return React.createElement("option",{key:m},m);}))),
        React.createElement(Field,{label:"메모 (선택)"},React.createElement("input",{placeholder:"예: 회의실 A",value:recForm.content||"",onChange:function(e){setRecForm(function(f){return Object.assign({},f,{content:e.target.value});});},style:iS})),
        React.createElement("button",{onClick:addRec,style:{marginTop:4,padding:"13px",borderRadius:12,background:"#8B5CF6",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}},"추가하기"))),

    modal==="settings"&&React.createElement(SheetModal,{title:"설정",onClose:function(){setModal(null);}},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        [{label:"👥 팀원 관리",desc:"팀원 추가·삭제·색상 변경",action:function(){setModal("manage-members");}},{label:"📢 공지사항 관리",desc:"상단 배너 공지 추가·삭제",action:function(){setModal("manage-notices");}}].map(function(x){return React.createElement("button",{key:x.label,onClick:x.action,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:12,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",textAlign:"left"}},React.createElement("div",null,React.createElement("div",{style:{fontSize:14,fontWeight:600,color:"#111827"}},x.label),React.createElement("div",{style:{fontSize:12,color:"#9CA3AF",marginTop:2}},x.desc)),React.createElement("span",{style:{color:"#9CA3AF",fontSize:16}},"›"));}),
        React.createElement("div",{style:{borderTop:"1px solid #F3F4F6",paddingTop:10,marginTop:4}},
          !confirmReset?React.createElement("button",{onClick:function(){setConfirmReset(true);},style:{width:"100%",padding:"12px",borderRadius:12,background:"#FEF2F2",color:"#991B1B",border:"1px solid #FEE2E2",cursor:"pointer",fontSize:13,fontWeight:600}},"🗑 전체 데이터 초기화"):
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:13,color:"#991B1B",marginBottom:10,textAlign:"center",fontWeight:500}},"정말 초기화하시겠어요?"),
            React.createElement("div",{style:{display:"flex",gap:8}},
              React.createElement("button",{onClick:function(){setConfirmReset(false);},style:{flex:1,padding:"11px",borderRadius:10,background:"#F9FAFB",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13}},"취소"),
              React.createElement("button",{onClick:function(){db.ref("hanlim").remove();setConfirmReset(false);setModal(null);},style:{flex:1,padding:"11px",borderRadius:10,background:"#EF4444",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}},"초기화")))))),

    modal==="manage-members"&&React.createElement(SheetModal,{title:"팀원 관리",onClose:function(){setModal(null);}},
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:16}},
        React.createElement("input",{placeholder:"새 팀원 이름",value:newMemberName,onChange:function(e){setNewMemberName(e.target.value);},onKeyDown:function(e){if(e.key==="Enter")addMember();},style:Object.assign({},iS,{flex:1})}),
        React.createElement("button",{onClick:addMember,style:{padding:"10px 16px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600,fontSize:13}},"추가")),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8}},
        members.map(function(m){return React.createElement("div",{key:m.name,style:{display:"flex",alignItems:"center",gap:10,background:"#F9FAFB",borderRadius:12,padding:"10px 12px",border:"1px solid #E5E7EB"}},
          React.createElement("div",{style:{width:30,height:30,borderRadius:"50%",background:m.color+"22",border:"2px solid "+m.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:m.color}},m.name.slice(0,1)),
          React.createElement("span",{style:{flex:1,fontSize:13,fontWeight:500,color:"#374151"}},m.name),
          React.createElement("button",{onClick:function(){setEditingMember({name:m.name,color:m.color,origName:m.name});},style:{fontSize:11,padding:"4px 10px",borderRadius:8,background:"#EEF2FF",color:"#3730A3",border:"none",cursor:"pointer"}},"수정"),
          React.createElement("button",{onClick:function(){delMember(m.name);},style:{fontSize:11,padding:"4px 10px",borderRadius:8,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer"}},"삭제"));})),
      editingMember&&React.createElement("div",{style:{marginTop:16,padding:"14px",background:"#F5F3FF",borderRadius:12,border:"1px solid #E9D5FF"}},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#5B21B6",marginBottom:10}},"팀원 수정"),
        React.createElement(Field,{label:"이름"},React.createElement("input",{value:editingMember.name,onChange:function(e){setEditingMember(function(f){return Object.assign({},f,{name:e.target.value});});},style:iS})),
        React.createElement("div",{style:{marginTop:10}},
          React.createElement("div",{style:{fontSize:12,color:"#6B7280",fontWeight:600,marginBottom:8}},"아바타 색상"),
          React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:7}},
            COLOR_OPTIONS.map(function(c){return React.createElement("button",{key:c,onClick:function(){setEditingMember(function(f){return Object.assign({},f,{color:c});});},style:{width:28,height:28,borderRadius:"50%",background:c,border:editingMember.color===c?"3px solid #1E1B4B":"2px solid transparent",cursor:"pointer",padding:0}});}))),
        React.createElement("div",{style:{display:"flex",gap:8,marginTop:12}},
          React.createElement("button",{onClick:function(){setEditingMember(null);},style:{flex:1,padding:"9px",borderRadius:10,background:"#fff",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13}},"취소"),
          React.createElement("button",{onClick:saveMemberEdit,style:{flex:2,padding:"9px",borderRadius:10,background:"#6366F1",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}},"저장")))),

    modal==="manage-notices"&&React.createElement(SheetModal,{title:"공지사항 관리",onClose:function(){setModal(null);}},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:16}},
        React.createElement(Field,{label:"새 공지 내용"},React.createElement("textarea",{placeholder:"공지 내용...",value:noticeForm,onChange:function(e){setNoticeForm(e.target.value);},style:Object.assign({},iS,{minHeight:72,resize:"vertical"})})),
        React.createElement("button",{onClick:addNotice,style:{padding:"11px",borderRadius:12,background:"#1E1B4B",color:"#fff",border:"none",cursor:"pointer",fontSize:14,fontWeight:700}},"공지 등록")),
      notices.map(function(n){return React.createElement("div",{key:n.id,style:{background:"#F9FAFB",borderRadius:10,border:"1px solid #E5E7EB",padding:"10px 12px",marginBottom:8,display:"flex",alignItems:"flex-start",gap:8}},
        React.createElement("div",{style:{flex:1,fontSize:13,color:"#374151",lineHeight:1.5}},n.text),
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4}},
          React.createElement("button",{onClick:function(){updateFb("notices/"+n.id,{active:!n.active});},style:{fontSize:10,padding:"3px 7px",borderRadius:6,background:n.active?"#ECFDF5":"#F3F4F6",color:n.active?"#065F46":"#6B7280",border:"none",cursor:"pointer"}},n.active?"표시중":"숨김"),
          React.createElement("button",{onClick:function(){delNotice(n.id);},style:{fontSize:10,padding:"3px 7px",borderRadius:6,background:"#FEE2E2",color:"#991B1B",border:"none",cursor:"pointer"}},"삭제")));}))
  );
}

// 렌더링
var root=ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
