// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyC04Ir2Jt7nZrrJGfGwSxUWOkd3sv7kwDA",
  authDomain: "hanlim-board.firebaseapp.com",
  databaseURL: "https://hanlim-board-default-rtdb.firebaseio.com",
  projectId: "hanlim-board",
  storageBucket: "hanlim-board.firebasestorage.app",
  messagingSenderId: "663569376513",
  appId: "1:663569376513:web:a3829d45c6d01bbfb1e700"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();
