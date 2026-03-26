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

// 파이어베이스 초기화 (중복 실행 방지)
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
const PRIORITY_STYLE = {
  "높음": {bg:"#FEE2E2", text:"#991B1B"},
  "중간": {bg:"#FEF3C7", text:"#92400E"},
  "낮음": {bg:"#D1FAE5", text:"#065F46"}
};

// --- UI 컴포넌트 ---
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

  useEffect(() => {
    const ref = db.ref("hanlim/tasks");
    ref.on("value", (snap) => {
      const data = snap.val();
      if (data) {
        setTasks(Object.values(data));
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
        <div style={{fontSize:22, fontWeight:700, marginTop:5}}>실시간 업무 공유 보드</div>
      </div>

      {/* 탭 메뉴 */}
      <div style={{display:"flex", background:"#fff", borderBottom:"1px solid #E5E7EB"}}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:"15px 0", border:"none", background:"none", borderBottom:tab===t?"3px solid #6366F1":"none", color:tab===t?"#6366F1":"#9CA3AF", fontWeight:tab===t?700:400}}>
            {t}
          </button>
        ))}
      </div>

      {/* 업무 리스트 */}
      <div style={{padding:15}}>
        {tab === "홈" && (
          <div>
            <h3 style={{fontSize:15, marginBottom:15}}>📋 현재 업무 현황</h3>
            {tasks.length === 0 ? <div style={{textAlign:"center", color:"#9CA3AF", padding:"40px 0"}}>등록된 업무가 없습니다.</div> : 
              tasks.map(task => (
                <div key={task.id} style={{background:"#fff", padding:15, borderRadius:12, marginBottom:10, border:"1px solid #E5E7EB", boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                    <div style={{fontWeight:600}}>{task.title}</div>
                    <Pill label={task.priority} bg={PRIORITY_STYLE[task.priority]?.bg || "#F3F4F6"} color={PRIORITY_STYLE[task.priority]?.text || "#6B7280"} />
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <Avatar name={task.assignee} members={members} size={20} />
                    <span style={{fontSize:12, color:"#6B7280"}}>{task.assignee}</span>
                    <span style={{marginLeft:"auto"}}><Pill label={task.col} bg="#EEF2FF" color="#6366F1" /></span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
        {tab !== "홈" && <div style={{textAlign:"center", color:"#9CA3AF", padding:50}}>{tab} 기능은 준비 중입니다.</div>}
      </div>
    </div>
  );
}
// --- 렌더링 실행 (이 두 줄을 파일 맨 끝에 꼭 추가하세요!) ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
