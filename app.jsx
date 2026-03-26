// 1. 초기 설정 및 필요한 기능 불러오기
const { useState, useEffect, useRef } = React;

const firebaseConfig = {
  apiKey: "AIzaSyC04Ir2Jt7nZrrJGfGwSxUWOkd3sv7kwDA",
  authDomain: "hanlim-board.firebaseapp.com",
  databaseURL: "https://hanlim-board-default-rtdb.firebaseio.com",
  projectId: "hanlim-board",
  storageBucket: "hanlim-board.firebasestorage.app",
  messagingSenderId: "663569376513",
  appId: "1:663569376513:web:a3829d45c6d01bbfb1e700"
};

// 파이어베이스 초기화 (딱 한 번만 실행)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 2. 고정 데이터 (팀원 명단 및 스타일)
const DEFAULT_MEMBERS = [
  {name:"최근주",color:"#6366F1"},{name:"김건식",color:"#EC4899"},{name:"박종애",color:"#F59E0B"},
  {name:"장문식",color:"#10B981"},{name:"이수연",color:"#3B82F6"},{name:"손수현",color:"#EF4444"},
  {name:"전은진",color:"#8B5CF6"},{name:"정화연",color:"#14B8A6"},{name:"정소연",color:"#F97316"},
  {name:"신선옥",color:"#06B6D4"},{name:"이희수",color:"#84CC16"},{name:"김도현",color:"#A855F7"},
  {name:"최성희",color:"#0EA5E9"},{name:"송태호",color:"#D946EF"},{name:"김홍기",color:"#22C55E"},
  {name:"양희경",color:"#FB923C"},{name:"강선숙",color:"#64748B"},{name:"우희경",color:"#EAB308"}
];

const COLS = ["할 일", "진행 중", "완료"];
const TABS = ["홈", "칸반", "일정", "반복", "통계", "일지"];
const WEEKDAYS = ["일","월","화","수","목","금","토"];

const COL_STYLE = {
  "할 일": {dot:"#6366F1", light:"#EEF2FF", text:"#3730A3"},
  "진행 중": {dot:"#F59E0B", light:"#FFFBEB", text:"#92400E"},
  "완료": {dot:"#10B981", light:"#ECFDF5", text:"#065F46"}
};

const PRIORITY_STYLE = {
  "높음": {bg:"#FEE2E2", text:"#991B1B", bar:"#EF4444"},
  "중간": {bg:"#FEF3C7", text:"#92400E", bar:"#F59E0B"},
  "낮음": {bg:"#D1FAE5", text:"#065F46", bar:"#10B981"}
};

// 유틸리티 함수
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// --- UI 컴포넌트 시작 ---
function Avatar({name, members, size=26}){
  const m = members?.find(x=>x.name===name);
  const color = m?.color || "#6366F1";
  return (
    <div style={{width:size, height:size, borderRadius:"50%", background:color+"22", border:`1.5px solid ${color}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.4, fontWeight:700, color, flexShrink:0}}>
      {name ? name.slice(0,1) : "👥"}
    </div>
  );
}

function Pill({label, bg, color}){
  return <span style={{fontSize:11, padding:"2px 8px", borderRadius:999, background:bg, color, fontWeight:600}}>{label}</span>;
}

// --- 메인 앱 시작 ---
function App() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [tab, setTab] = useState("홈");
  const [loading, setLoading] = useState(true);

  // 데이터 실시간 동기화
  useEffect(() => {
    const ref = db.ref("hanlim");
    ref.on("value", (snap) => {
      const data = snap.val();
      if (data) {
        if (data.tasks) setTasks(Object.values(data.tasks));
        if (data.members) setMembers(data.members);
      }
      setLoading(false);
    });
    return () => ref.off();
  }, []);

  if (loading) return <div style={{padding:50, textAlign:"center", color:"#6366F1"}}>한림바이오팜 보드 로딩 중...</div>;

  return (
    <div style={{minHeight:"100vh", background:"#F8FAFC", fontFamily:"sans-serif", maxWidth:480, margin:"0 auto", paddingBottom:70}}>
      {/* 헤더 */}
      <div style={{background:"#6366F1", padding:"20px", color:"#fff"}}>
        <div style={{fontSize:12, opacity:0.8}}>한림바이오팜 업무 현황</div>
        <div style={{fontSize:22, fontWeight:700, marginTop:5}}>업무 보드 실시간 공유</div>
      </div>

      {/* 탭 버튼 */}
      <div style={{display:"flex", background:"#fff", borderBottom:"1px solid #E5E7EB"}}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:"15px 0", border:"none", background:"none", borderBottom:tab===t?"3px solid #6366F1":"none", color:tab===t?"#6366F1":"#9CA3AF", fontWeight:tab===t?700:400, cursor:"pointer"}}>
            {t}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div style={{padding:15}}>
        {tab === "홈" && (
          <div>
            <div style={{display:"flex", gap:10, marginBottom:20}}>
              {COLS.map(c => (
                <div key={c} style={{flex:1, background:"#fff", padding:15, borderRadius:12, border:"1px solid #E5E7EB", textAlign:"center"}}>
                  <div style={{fontSize:20, fontWeight:700, color:"#6366F1"}}>{tasks.filter(t=>t.col===c).length}</div>
                  <div style={{fontSize:11, color:"#6B7280"}}>{c}</div>
                </div>
              ))}
            </div>
            <h3>📋 전체 업무 리스트</h3>
            {tasks.map(task => {
              const ps = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE["중간"];
              return (
                <div key={task.id} style={{background:"#fff", padding:15, borderRadius:12, marginBottom:10, border:"1px solid #E5E7EB"}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                    <div style={{fontWeight:600}}>{task.title}</div>
                    <Pill label={task.priority} bg={ps.bg} color={ps.text} />
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <Avatar name={task.assignee} members={members} size={20} />
                    <span style={{fontSize:12, color:"#6B7280"}}>{task.assignee}</span>
                    <span style={{marginLeft:"auto"}}><Pill label={task.col} bg="#F3F4F6" color="#6B7280" /></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab !== "홈" && <div style={{textAlign:"center", color:"#9CA3AF", padding:50}}>{tab} 기능은 준비 중입니다.</div>}
      </div>

      {/* 하단 바 */}
      <div style={{position:"fixed", bottom:0, width:"100%", maxWidth:480, background:"#fff", borderTop:"1px solid #E5E7EB", display:"flex", justifyContent:"space-around", padding:"10px 0"}}>
         {TABS.slice(0,3).map(t => <div key={t} style={{fontSize:10, color:"#9CA3AF"}}>{t}</div>)}
      </div>
    </div>
  );
}
