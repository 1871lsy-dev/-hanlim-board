import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";

// 1. 파이어베이스 설정 (Vercel 환경 변수 사용)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 2. 파이어베이스 초기화
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);

// 3. 고정 상수 설정
const DEFAULT_MEMBERS = [
  {name:"최근주",color:"#6366F1"},{name:"김건식",color:"#EC4899"},{name:"박종애",color:"#F59E0B"},
  {name:"장문식",color:"#10B981"},{name:"이수연",color:"#3B82F6"},{name:"손수현",color:"#EF4444"},
  {name:"전은진",color:"#8B5CF6"},{name:"정화연",color:"#14B8A6"},{name:"정소연",color:"#F97316"},
  {name:"신선옥",color:"#06B6D4"},{name:"이희수",color:"#84CC16"},{name:"김도현",color:"#A855F7"},
  {name:"최성희",color:"#0EA5E9"},{name:"송태호",color:"#D946EF"},{name:"김홍기",color:"#22C55E"},
  {name:"양희경",color:"#FB923C"},{name:"강선숙",color:"#64748B"},{name:"우희경",color:"#EAB308"}
];

const COLS = ["할 일", "진행 중", "완료"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const TABS = ["홈", "칸반", "일정", "반복", "통계", "일지"];

// 유틸리티 함수
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("홈");

  // 데이터 실시간 동기화
  useEffect(() => {
    const hanlimRef = ref(database, 'hanlim');
    
    // 파이어베이스에서 데이터 읽어오기
    const unsubscribe = onValue(hanlimRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.tasks) setTasks(Object.values(data.tasks));
        if (data.members) setMembers(data.members);
        if (data.schedules) setSchedules(Object.values(data.schedules));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 태스크 추가 함수 예시
  const addTask = (taskForm) => {
    const id = uid();
    const newTask = { ...taskForm, id };
    set(ref(database, `hanlim/tasks/${id}`), newTask);
  };

  if (loading) return <div style={{padding: 20}}>한림바이오팜 보드 로딩 중...</div>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* 여기에 사용자님의 나머지 UI 코드가 들어갑니다 */}
      <h1 style={{ textAlign: 'center', color: '#6366F1' }}>한림바이오팜 업무 보드</h1>
      
      {/* 탭 메뉴 */}
      <div style={{ display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #ddd' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: 10, border: 'none', background: 'none', color: tab === t ? '#6366F1' : '#999' }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        {tab === "홈" && (
          <div>
            <h3>현재 업무 현황</h3>
            <p>전체 업무: {tasks.length}건</p>
            {/* 업무 리스트 반복 출력 */}
          </div>
        )}
        {/* 나머지 탭 내용들... */}
      </div>
    </div>
  );
}
