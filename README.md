# 📝 Narratix

<div align="center">

**취준생의 경험을 아카이빙하고, 자기소개서를 빠르게 완성하는 플랫폼**

**현대자동차 소프티어 부트캠프 7기 - Team 7. Jackpot**

<strong><a href="https://narratix.site">서비스 바로가기: narratix.site</a></strong>

<p>
<a href="https://www.notion.so/2ea14885339b80f6b2d0fe64b05460ed?pvs=21"><img src="https://img.shields.io/badge/팀_노션-000000?style=for-the-badge&logo=notion&logoColor=white" alt="Notion" /></a>
<a href="https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki"><img src="https://img.shields.io/badge/팀_위키-181717?style=for-the-badge&logo=github&logoColor=white" alt="Wiki" /></a>
<a href="https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/issues"><img src="https://img.shields.io/badge/이슈_트래커-181717?style=for-the-badge&logo=github&logoColor=white" alt="Issue" /></a>
</p>

</div>

---

## 🏠 랜딩 페이지

<img 
  src="https://github.com/user-attachments/assets/1c7ebf79-c4d1-4145-9328-1e58e5c5bfe8"
  alt="Landing Page" 
  width="100%" 
/>

<div align="center">
취준생의 경험 정리부터 자기소개서 완성까지, Narratix의 핵심 가치를 랜딩에서 한눈에 보여줍니다.
</div>

---

## 📸 핵심 기능 시연

### 1) 자료 업로드 + AI 라벨링

![Upload Demo](https://placehold.co/1200x675?text=Upload+Flow)

### 2) 채용 일정 캘린더 관리

![Calendar Demo](https://placehold.co/1200x675?text=Recruit+Calendar)

### 3) 자기소개서 작성/첨삭 에디터

![Editor Demo](https://placehold.co/1200x675?text=Cover+Letter+Editor)

### 4) 기업별/문항별 라이브러리 관리

![Library Demo](https://placehold.co/1200x675?text=Library+Management)

### 전체 기능

- `홈 대시보드`: 작성 통계, 시즌 지원 현황, 임박 일정 확인
- `채용공고 관리`: 캘린더 기반 공고 등록/수정/삭제
- `자료 업로드`: 자기소개서 파일 업로드 후 AI 라벨링 및 저장
- `자기소개서 작성`: 문항 단위 작성, 검색/필터 기반 문서 탐색
- `친구 첨삭`: 공유된 자기소개서 코멘트 작성 및 반영
- `라이브러리`: 기업별/문항별 아카이빙, 스크랩 기반 재활용
- `인증`: 로그인/회원가입 및 보호 라우팅

---

## 🎯 프로젝트 소개

> **Narratix는 취준생들이 흩어진 경험을 모으고, 자기소개서를 효율적으로 작성/관리할 수 있도록 돕는 플랫폼입니다.**

### 해결하고자 한 문제

- 자소서 초안, 문항, 경험 메모가 여러 곳에 흩어져 재활용이 어렵다
- 지원 일정과 작성 진행도를 함께 관리하기 어렵다
- 첨삭 과정이 메시지/문서로 분산되어 피드백 반영이 비효율적이다

### 핵심 가치

- `경험 아카이빙`: 업로드한 자료를 구조화해 기업/문항 단위로 재활용
- `작성 생산성`: 문항 중심 편집 + 검색/필터로 빠른 작성 흐름 지원
- `피드백 루프`: 공유 기반 첨삭으로 수정 사이클 단축

---

## 🧭 사용자 플로우

1. 자료 업로드 (파일/텍스트)
2. AI 라벨링 및 라이브러리 저장
3. 문항별 초안 작성/수정
4. 공유 링크 기반 첨삭 진행
5. 채용 캘린더와 함께 지원 일정 관리

- IA 문서: [Narratix IA](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/Narratix-%EC%B7%A8%EC%97%85-%EC%A4%80%EB%B9%84-%EB%B0%8F-%EC%9E%90%EC%86%8C%EC%84%9C-%EA%B4%80%EB%A6%AC-%EC%84%9C%EB%B9%84%EC%8A%A4-IA)

---

## 🏗 아키텍처

![System Architecture](https://placehold.co/1200x500?text=Architecture+Diagram)

---

## 📁 프로젝트 구조

```text
.
├─ frontend/   # React + TypeScript + Vite
│  ├─ src/pages                # 페이지 라우트 진입점
│  ├─ src/features             # 도메인별 기능 모듈
│  └─ src/shared               # 공통 컴포넌트/API/훅/유틸
└─ backend/    # Spring Boot
   ├─ src/main/java            # API/도메인 로직
   └─ script                   # 배포 스크립트
```

---

## 🛠 기술 스택

### Frontend

<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white"/> <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=TailwindCSS&logoColor=white"/>
<br>
<img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=ReactQuery&logoColor=white"/> <img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=ReactRouter&logoColor=white"/>
<br>
<img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white"/> <img src="https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=ESLint&logoColor=white"/> <img src="https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=Prettier&logoColor=white"/>

### Backend

<img src="https://img.shields.io/badge/Java-007396?style=flat-square&logo=Java&logoColor=white"/> <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=SpringBoot&logoColor=white"/> <img src="https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=flat-square&logo=Spring&logoColor=white"/> <img src="https://img.shields.io/badge/QueryDSL-007396?style=flat-square&logo=Java&logoColor=white"/>
<br>
<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white"/> <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/>
<br>
<img src="https://img.shields.io/badge/AWS_EC2-FF9900?style=flat-square&logo=AmazonEC2&logoColor=white"/> <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white"/> <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=GitHubActions&logoColor=white"/>

---

## 👥 팀 구성

<div align="center">
  <table>
    <tr valign="top">
      <td>
        <table align="center">
          <thead>
            <tr><th style="text-align: center;" colspan="2">🛠️ Backend</th></tr>
          </thead>
          <tbody>
            <tr>
              <td align="center" width="200">
                <a href="https://github.com/kseysh">
                  <img src="https://github.com/kseysh.png" alt="김승환" width="120" style="border-radius: 50%;" />
                  <br />
                  <sub><b>김승환</b></sub>
                </a>
              </td>
              <td align="center" width="200">
                <a href="https://github.com/livebylee">
                  <img src="https://github.com/livebylee.png" alt="이정민" width="120" style="border-radius: 50%;" />
                  <br />
                  <sub><b>이정민</b></sub>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
      <td>
        <table align="center">
          <thead>
            <tr><th style="text-align: center;" colspan="3">💻 Frontend</th></tr>
          </thead>
          <tbody>
            <tr>
              <td align="center" width="200">
                <a href="https://github.com/using2">
                  <img src="https://github.com/using2.png" alt="강유진" width="120" style="border-radius: 50%;" />
                  <br />
                  <sub><b>강유진</b></sub>
                </a>
              </td>
              <td align="center" width="200">
                <a href="https://github.com/Sminp">
                  <img src="https://github.com/Sminp.png" alt="박소민" width="120" style="border-radius: 50%;" />
                  <br />
                  <sub><b>박소민</b></sub>
                </a>
              </td>
              <td align="center" width="200">
                <a href="https://github.com/hi2242">
                  <img src="https://github.com/hi2242.png" alt="윤종근" width="120" style="border-radius: 50%;" />
                  <br />
                  <sub><b>윤종근</b></sub>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </table>
</div>

---

## 🧑‍💻 역할 및 주요 기여

| 이름       | 포지션          | 담당 도메인                                                                         | 주요 구현/기여                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 관련 문서 |
| :--------- | :-------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| 강유진     | Frontend        | -                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | -         |
| **박소민** | **Frontend**    | **- 라이브러리(기업/문항)**<br>**- 나의 채용공고(캘린더)**<br>**- 자기소개서 작성** | **- 아키텍처 설계:** FSD Lite 구조 도입을 통한 프로젝트 응집도 향상 및 리팩토링 주도<br>**- 핵심 도메인 구현:** 라이브러리 중첩 라우팅, 검색, 스크랩 기능 및 전용 API 연동<br>**- 커스텀 캘린더:** `date-fns` 기반 순수 함수 및 `useCalendar` 훅을 활용한 일정 관리 시스템 구축<br>**- 공통 시스템:** 토스트 메시지, 접근성(ARIA)을 고려한 드롭다운/모달 등 재사용 컴포넌트 개발<br>**- 최적화:** TanStack Query를 이용한 데이터 캐싱 및 API 캡슐화, Tree-shaking 최적화 | -         |
| 윤종근     | Frontend        | -                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | -         |
| 김승환     | Backend & Infra | -                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | -         |
| 이정민     | Backend & Infra | -                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | -         |

---

## 🚀 기술적 도전 (Top Picks)

### Frontend

- **[[트러블슈팅] React + contentEditable 에디터의 네이티브 동작 제어](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/%5B%EA%B0%95%EC%9C%A0%EC%A7%84%5D-React---contentEditable-%EC%97%90%EB%94%94%ED%84%B0%EC%97%90%EC%84%9C-Enter-Delete-Undo-Redo-%EA%B5%AC%ED%98%84%EA%B3%BC-%ED%8A%B8%EB%9F%AC%EB%B8%94%EC%8A%88%ED%8C%85)**
  - `contentEditable`의 예측 불가능한 동작을 제어하고, 직접 Undo/Redo 스택을 구현하며 문제를 해결한 과정입니다.
- **[[고민] TypeScript 제너릭을 활용한 타입 안전성 높은 재사용 탭 컴포넌트 구현](<https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/%5B%EB%B0%95%EC%86%8C%EB%AF%BC%5D-%E2%80%90-TypeScript-%EC%A0%9C%EB%84%88%EB%A6%AD(Generic)%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%9C-%ED%83%80%EC%9E%85-%EC%95%88%EC%A0%84%EC%84%B1-%EB%86%92%EC%9D%80-%EC%9E%AC%EC%82%AC%EC%9A%A9-%ED%83%AD-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EA%B5%AC%ED%98%84>)**
  - `as` 타입 단언 없이도 타입 안정성을 보장하는 유연한 컴포넌트를 설계하며 겪은 고민을 담았습니다.
- **[[고민] 중첩 라우팅 환경에서의 상태 관리 전략 (Memory vs URL)](<https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/%5B%EB%B0%95%EC%86%8C%EB%AF%BC%5D-%E2%80%90-%EC%A4%91%EC%B2%A9-%EB%9D%BC%EC%9A%B0%ED%8C%85-%ED%99%98%EA%B2%BD%EC%97%90%EC%84%9C%EC%9D%98-%EC%83%81%ED%83%9C-%EA%B4%80%EB%A6%AC-%EC%A0%84%EB%9E%B5-(Memory-vs-URL)>)**
  - 복잡한 UI 상태를 메모리(State)로 관리할지, URL로 관리할지에 대한 트레이드오프를 고려하여 최적의 방식을 선택했습니다.

### Backend & Infra

- **[[고민] Refresh Token Rotation (RTR) 및 보안 전략](<https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/%5B%EC%9D%B4%EC%A0%95%EB%AF%BC%5D-%E2%80%90-Refresh-Token-Rotation-(RTR)-%EB%B0%8F-%EB%B3%B4%EC%95%88-%EC%A0%84%EB%9E%B5>)**
  - 토큰 탈취 공격에 대응하기 위해 RTR 전략을 도입하고, 동시 요청 시 발생하는 Race Condition 문제를 해결하며 시스템 보안을 강화했습니다.
- **[[고민] 비동기 이벤트 아키텍처 개선기](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/%5B%EA%B9%80%EC%8A%B9%ED%99%98%5D-%EB%B9%84%EB%8F%99%EA%B8%B0-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EA%B0%9C%EC%84%A0%EA%B8%B0)**
  - 시스템 간 결합도를 낮추고 확장성을 높이기 위해 이벤트 기반 비동기 처리 방식을 도입하고, 메시지 큐(SQS)를 활용하여 안정성을 확보한 과정입니다.
- **[[고민] 업로드 Timeout 처리 및 Zombie Task 방지 전략](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/%5B%EC%9D%B4%EC%A0%95%EB%AF%BC%5D-%EC%97%85%EB%A1%9C%EB%93%9C-Timeout-%EC%B2%98%EB%A6%AC-%EB%B0%8F-Zombie-Task-%EB%B0%A9%EC%A7%80-%EC%A0%84%EB%9E%B5)**
  - 비동기 처리 중 타임아웃과 고아 작업(Zombie Task)을 방지해 운영 안정성을 높인 전략을 정리했습니다.

---

## 📚 문서 허브

- [프로젝트 Wiki](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki)
- [Notion](https://www.notion.so/2ea14885339b80f6b2d0fe64b05460ed?pvs=21)
- [Github Project](https://github.com/orgs/softeerbootcamp-7th/projects/10)
- [GitHub Issues](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/issues)
- [Figma](https://www.figma.com/design/tmnkAiYrglgXoB241iWfU0/-%EC%9E%AD%ED%8C%9F-Handoff_%EC%86%8C%ED%94%84%ED%8B%B0%EC%96%B4-7%EA%B8%B0--Copy-?node-id=11741-36906&t=qCoco8TWfcQwOBbl-1)

---

## ⚙️ 로컬 실행

### Prerequisites

- Node.js 20+
- `pnpm` 9+
- Java 17

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

환경 변수 (`frontend/.env`)

```bash
VITE_API_BASE_URL=<YOUR_API_BASE_URL>
VITE_SOCKET_URL=<YOUR_SOCKET_URL>
VITE_SERVICE_BASE_URL=<YOUR_SERVICE_BASE_URL>
VITE_DEV_BASE_URL=<YOUR_DEV_BASE_URL>
```

### Backend

```bash
cd backend
./gradlew bootRun
```
