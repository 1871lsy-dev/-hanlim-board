const { useState, useEffect } = React;

// 1. 파이어베이스 설정 (중복 실행 방지)
const firebaseConfig = {
  apiKey: "AIzaSyC04Ir2Jt7nZrrJGfGwSxUWOkd3sv7kwDA",
  authDomain: "hanlim-board.firebaseapp.com",
  databaseURL: "https://hanlim-board-default-rtdb.firebaseio.com",
  projectId: "hanlim-board",
  storageBucket: "hanlim-board.firebasestorage.app",
  messagingSenderId: "663569376513",
  appId: "1:663569376513:web:a3829d45c6d01bbfb1e700"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 2. 메인 앱 화면
function App() {
  const [loading, setLoading] = useState(true);

  // 데이터 로딩 테스트
  useEffect(() => {
    const ref = db.ref("hanlim/test");
    ref.once("value", () => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{padding: 50, textAlign: "center", color: "#6366F1"}}>한림바이오팜 데이터 연결 중...</div>;
  }

  return (
    <div style={{padding: 30, maxWidth: 480, margin: "0 auto"}}>
      <h1 style={{color: "#6366F1", fontSize: 24}}>🎉 성공입니다!</h1>
      <p style={{color: "#374151", marginTop: 10}}>
        드디어 데이터베이스 연결과 화면 렌더링이 정상적으로 작동합니다.<br/>
        이제 원래 작성하셨던 칸반 보드 코드를 여기에 넣으시면 완벽하게 돌아갑니다.
      </p>
    </div>
  );
}

// 3. 화면 렌더링 (이 부분이 파일 맨 끝에 꼭 있어야 합니다!)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
