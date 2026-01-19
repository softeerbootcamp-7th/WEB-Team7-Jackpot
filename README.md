# 📝 Narratix

<div align="center">

**취준생의 경험을 아카이빙하고, 자기소개서를 빠르게 완성하는 플랫폼**

**현대자동차 소프티어 부트캠프 7기 - Team 7. Jackpot**

<p>
<a href="https://www.notion.so/2ea14885339b80f6b2d0fe64b05460ed?pvs=21"><img src="https://img.shields.io/badge/잭팟_팀_노션-000000?style=flat&logo=notion&logoColor=white" alt="Notion" /></a>
  |  
<a href="https://github.com/softeerbootcamp-7th/Team7-Jackpot/wiki"><img src="https://img.shields.io/badge/잭팟_Wiki-181717?style=flat&logo=github&logoColor=white" alt="Wiki" /></a>
  |  
<a href="https://github.com/softeerbootcamp-7th/Team7-Jackpot/issues"><img src="https://img.shields.io/badge/잭팟_Issues-181717?style=flat&logo=github&logoColor=white" alt="Issue" /></a>
</p>

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [팀 구성](#-팀-구성)
- [기술 스택](#-기술-스택)
- [아키텍처](#-아키텍처)
- [협업 프로세스](#-협업-프로세스)
- [개발 컨벤션](#-개발-컨벤션)

---

## 🎯 프로젝트 소개

> 추후 업데이트 예정

**프로젝트 문서**
- [📐 기획서](https://www.figma.com/design/T5zH4La7onBz2nEJmKWTWG/7%EF%B8%8F%E2%83%A37%ED%8C%80-%EA%B8%B0%ED%9A%8D--%EC%A0%9C%EC%B6%9C-?node-id=0-1&t=V8IYseiDgGsp0s5I-1)
- [🎨 디자인](https://www.figma.com/design/vljpCxD8chnZKuxCRDqPv3/%F0%9F%94%8B-7%ED%8C%80-%EB%94%94%EC%9E%90%EC%9D%B8?node-id=61-8&t=myWoMyh9J4hC6pK6-1)

---

## 👥 팀 구성

<table>
  <thead>
    <tr>
      <th align="center" colspan="2">🛠️ Backend</th>
      <th align="center" colspan="3">💻 Frontend</th>
    </tr>
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

---

## 🛠 기술 스택

### Frontend

```
Node.js 24.13.0 • pnpm • React 19 • TypeScript • Vite
TailwindCSS • React Router DOM • TanStack Query • Context API
WebSocket • SSE • Fetch API
ESLint • Prettier • Jest • React Testing Library
```

### Backend

```
Java 17 • Spring Boot • Spring Data JPA • QueryDSL
MySQL • Redis • WebSocket • SSE
RabbitMQ / Redis Stream • Python
AWS EC2 • AWS Lambda • Docker • GitHub Actions
```

> 📝 기술 스택 상세 선정 이유는 [Wiki](https://github.com/softeerbootcamp-7th/Team7-Jackpot/wiki)를 참고해주세요.

---

## 🏗 아키텍처

> 추후 업데이트 예정

---

## 🤝 협업 프로세스

### 개발 워크플로우

```
Issue 생성 → Branch 생성 → 개발 → PR 생성
→ CodeRabbit 리뷰 → 동료 리뷰 → Merge → 배포
```

### 브랜치 전략

```
main
  ├── BE ─── feat/be-feature-name
  └── FE ─── feat/fe-feature-name
```

- `main`: 프로덕션 배포
- `BE/FE`: 통합 테스트
- `feat/*`: 기능 개발

### 코드 리뷰

- 필수 리뷰 후 수정, 전체 승인 후 merge (긴급 시 1인)
- **도구**: CodeRabbit, [PN 룰](https://blog.banksalad.com/tech/banksalad-code-review-culture/#커뮤니케이션-비용을-줄이기-위한-pn-룰) 적용

### 프로젝트 관리

- **일정, 스프린트 & Backlog**: [GitHub Projects](https://github.com/orgs/softeerbootcamp-7th/projects/10)
- **데일리 스크럼**: 매일 오전 (전체 → FE/BE)
- **스프린트**: 화/금 퇴근 전
- **회고**: 금요일 KPT

### 문서화

- **GitHub**: README, Wiki, Projects
- **Notion**: 보안 정보만 별도 노션으로 관리, 이외 모든 자료 repository와 동기화

---

## 📝 개발 컨벤션

### Commit Message

```
[TYPE] commit message (#ISSUE_NUMBER)
```

| **Type** | **설명** |
| --- | --- |
| [feat] | 새로운 기능 추가 |
| [fix] | 버그 수정 또는 typo |
| [refactor] | 리팩토링 |
| [design] | CSS 등 사용자 UI 디자인 변경 |
| [comment] | 필요한 주석 추가 및 변경 |
| [style] | 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우 |
| [test] | 테스트(테스트 코드 추가, 수정, 삭제, 비즈니스 로직에 변경이 없는 경우) |
| [chore] | 위에 걸리지 않는 기타 변경사항(빌드 스크립트 수정, assets image, 패키지 매니저 등) |
| [init] | 프로젝트 초기 생성 |
| [rename] | 파일 혹은 폴더명 수정하거나 옮기는 경우 |
| [remove] | 파일을 삭제하는 작업만 수행하는 경우 |
| [infra] | ci/cd 및 시스템 또는 외부 종속성에 영향을 미치는 변경사항 (npm, gulp, yarn 레벨) |
| [docs] | 코드와 관련 없는 문서 작업만 수정하는 경우 |

### Branch Naming & PR Title

- Branch 명: `작업성격` / `작업한_내용`
- Git Pull Request 제목: [`역할`/`작업성격`] `작업한 내용`

---

## 📌 그라운드 룰

- 💬 일정 및 개발 공수 적극 공유
- 🔍 설계/학습 함께, 구현 후 공유
- 📖 명확한 문서화
- 🤖 AI 활용 (검증 필수): Gemini, Claude, CodeRabbit
- ⏰ 데일리 스크럼 및 스프린트 참여

**상세 내용**
- [전체 팀 그라운드 룰](https://www.notion.so/bside/2d322020273581c38e36f2959fed76b6)
- [개발 팀 그라운드 룰](https://www.notion.so/2ed14885339b80cfa077c9dc4871c3e1?pvs=21)


