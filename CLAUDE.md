# 한림바이오팜 업무 현황 보드

## 프로젝트 개요
- 한림바이오팜 팀원 18명이 함께 사용하는 업무 현황 보드
- Firebase Realtime Database 연동 (실시간 팀원 공유)
- Vercel 배포 (hanlim-board-3u7f.vercel.app)
- GitHub 저장소: hanlim-board

## 기술 스택
- 순수 HTML/CSS/JavaScript (프레임워크 없음)
- Firebase v10 (ES Module 방식)
- 단일 파일: index.html

## Firebase 설정
- 데이터 경로: hanlim2/
- DB URL: https://hanlim-board-default-rtdb.firebaseio.com
- 보안 규칙: read/write 모두 true (공개)

## 주요 기능
- 홈: 주간 달력, 오늘 업무/일정, 팀원 명단
- 칸반: 할 일/진행 중/완료 보드, 담당자 필터
- 일정: 날짜별 일정 관리
- 반복: 요일별 반복 일정
- 통계: 완료율, 멤버별 현황
- 일지: 업무 일지 작성/조회
- ⚙️ 팀원 설정: 이름/색상 변경, 추가/삭제

## 팀원 목록 (18명)
최근주, 김건식, 박종애, 장문식, 이수연, 손수현, 전은진, 정화연, 정소연, 신선옥, 이희수, 김도현, 최성희, 송태호, 김흥기, 양희경, 강선숙, 우희경

## 현재 문제 및 해결 중
- Vercel 배포 후 하얀 화면 → Firebase ES Module 방식으로 전환 중
- Firebase 보안 규칙 확인 필요 (read/write: true 설정)

## 다음 작업
1. GitHub index.html을 최신 코드로 교체
2. Firebase 보안 규칙 열기
3. Vercel 재배포 확인
4. 팀원들에게 URL 공유
