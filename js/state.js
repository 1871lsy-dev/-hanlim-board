// 상수
const COLORS=["#6366F1","#EC4899","#F59E0B","#10B981","#3B82F6","#EF4444","#8B5CF6","#14B8A6","#F97316","#06B6D4","#84CC16","#A855F7","#0EA5E9","#D946EF","#22C55E","#FB923C","#64748B","#EAB308","#E11D48","#0891B2","#16A34A","#CA8A04"];
const COLS=["할 일","진행 중","완료"];
const TABS=["홈","칸반","일정","반복","통계","일지"];
const DAYS=["일","월","화","수","목","금","토"];
const HOURS=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
const MINS=["00","10","20","30","40","50"];
const CS={"할 일":{light:"#EEF2FF",text:"#3730A3"},"진행 중":{light:"#FFFBEB",text:"#92400E"},"완료":{light:"#ECFDF5",text:"#065F46"}};
const PS={"높음":{bg:"#FEE2E2",text:"#991B1B"},"중간":{bg:"#FEF3C7",text:"#92400E"},"낮음":{bg:"#D1FAE5",text:"#065F46"}};

// 날짜
const now=new Date(),TODAY=now.toISOString().split("T")[0],DOW=now.getDay();
const DATE_STR=now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일 ("+DAYS[DOW]+")";

// 기본 데이터
const DEFAULT={
  members:[
    {name:"최근주",color:"#6366F1"},{name:"김건식",color:"#EC4899"},{name:"박종애",color:"#F59E0B"},
    {name:"장문식",color:"#10B981"},{name:"이수연",color:"#3B82F6"},{name:"손수현",color:"#EF4444"},
    {name:"전은진",color:"#8B5CF6"},{name:"정화연",color:"#14B8A6"},{name:"정소연",color:"#F97316"},
    {name:"신선옥",color:"#06B6D4"},{name:"이희수",color:"#84CC16"},{name:"김도현",color:"#A855F7"},
    {name:"최성희",color:"#0EA5E9"},{name:"송태호",color:"#D946EF"},{name:"김흥기",color:"#22C55E"},
    {name:"양희경",color:"#FB923C"},{name:"강선숙",color:"#64748B"},{name:"우희경",color:"#EAB308"}
  ],
  tasks:[
    {id:"t1",title:"신제품 원료 수급 검토",assignee:"최근주",priority:"높음",due:TODAY,col:"할 일",comments:[]},
    {id:"t2",title:"품질 관리 보고서 작성",assignee:"김건식",priority:"중간",due:TODAY,col:"진행 중",comments:[]},
    {id:"t3",title:"GMP 감사 준비",assignee:"박종애",priority:"높음",due:"2026-04-05",col:"진행 중",comments:[]},
    {id:"t4",title:"거래처 미팅 자료 준비",assignee:"장문식",priority:"낮음",due:"2026-04-10",col:"할 일",comments:[]},
    {id:"t5",title:"1분기 생산 실적 집계",assignee:"이수연",priority:"중간",due:"2026-03-20",col:"완료",comments:[]},
    {id:"t6",title:"포장재 발주 확인",assignee:"손수현",priority:"높음",due:TODAY,col:"할 일",comments:[]},
  ],
  schedules:[
    {id:"s1",member:"최근주",date:TODAY,content:"오전 원료팀 회의"},
    {id:"s2",member:"김건식",date:TODAY,content:"품질 점검 현장 방문"},
  ],
  recurring:[
    {id:"r1",title:"주간 팀 미팅",days:[1],startH:"09",startM:"00",endH:"10",endM:"00",content:"전체 업무 현황 공유",assignee:"모두"},
    {id:"r2",title:"품질 점검 회의",days:[3],startH:"14",startM:"00",endH:"15",endM:"00",content:"품질 이슈 검토",assignee:"김건식"},
  ],
  journals:[{id:"j1",date:TODAY,author:"최근주",memo:"오늘 원료팀 회의에서 신규 원료 수급 일정 확정."}],
};

// 전역 상태
const S={
  tab:"홈",activeCol:"할 일",filterM:"전체",schedDay:TODAY,
  modal:null,detTask:null,viewJ:null,newCmt:"",
  chk:false,palIdx:null,calDay:TODAY,loaded:false,
  tf:{title:"",assignee:"모두",priority:"중간",due:TODAY,col:"할 일"},
  sf:{member:"최근주",date:TODAY,content:""},
  rf:{title:"",days:[],startH:"09",startM:"00",endH:"10",endM:"00",content:"",assignee:"모두"},
  jf:{author:"최근주",memo:""},
  members:[],tasks:[],schedules:[],recurring:[],journals:[],
};

// 유틸 함수
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
function dueStatus(d,col){
  if(!d||col==="완료")return null;
  const diff=Math.round((new Date(d)-new Date(TODAY))/86400000);
  if(diff<0)return{label:"마감 초과",color:"#EF4444",bg:"#FEF2F2"};
  if(diff===0)return{label:"오늘 마감",color:"#F59E0B",bg:"#FFFBEB"};
  if(diff<=3)return{label:"D-"+diff,color:"#F97316",bg:"#FFF7ED"};
  return null;
}
function mc(name){const m=S.members.find(x=>x.name===name);return m?m.color:"#6366F1";}
function al(a){if(!a||a==="모두")return"모두";if(Array.isArray(a))return a.length===1?a[0]:a.join(", ");return a;}
function toObj(arr){return arr.reduce((o,v)=>{o[v.id]=v;return o;},{});}

// Firebase CRUD
function fbSave(path,val){db.ref("hanlim/"+path).set(val);}
function fbRemove(path){db.ref("hanlim/"+path).remove();}
