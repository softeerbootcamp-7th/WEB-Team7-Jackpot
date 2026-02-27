# 🤔 [고민한 주제] 중첩 라우팅 환경에서의 상태 관리 전략 (Memory vs URL)

## 📝 고민 배경
- **왜 이 고민을 하게 되었는가?**
  - 기업/문항 라이브러리 탭, 폴더 구조, 문서 뷰어, 검색/페이지네이션까지 4단계 이상의 깊은 중첩 라우팅 구조를 구현해야 함.
  - 사용자가 특정 문항을 보다가 '새로고침'을 하거나, 링크를 '공유'했을 때 동일한 화면(Context)이 유지되어야 하는 요구사항 존재.
- **전제 조건:**
  - Tech Stack: React, TypeScript, Tailwind CSS, TanStack Query, FSD Lite Architecture.
- **제약 사항:**
  - 개발 마감까지 약 2주 남은 시점.
  - 팀원 3명이 즉시 이해하고 유지보수할 수 있는 직관적인 코드 구조 필요 (복잡한 전역 상태 라이브러리 도입 지양).

## 🔄 고려한 선택지
### 선택지 1: React Memory State (useState + Props Drilling)
- **개념**: 상위 컴포넌트에서 모든 탭, 폴더, 검색어 상태를 `useState`로 관리하고 하위로 Props로 전달.
- **장점**: React의 기본 패턴이라 초기 구현이 직관적임.
- **단점**: 새로고침 시 상태가 증발함(휘발성). URL 공유 시 초기 화면으로 리셋되어 UX가 매우 나쁨.

### 선택지 2: State Syncing (useState + useEffect)
- **개념**: `useState`를 메인으로 쓰고, 상태 변경 시 `useEffect`를 통해 URL을 강제로 업데이트(`pushState`)하는 방식.
- **장점**: 상태 관리와 URL 반영을 동시에 하려는 시도.
- **단점**: 'State 변경 → 렌더링 → URL 변경 → (잠재적) 리렌더링'의 비효율적 사이클 발생. 상태 동기화 버그(Sync Hell) 발생 위험 높음.

### 선택지 3: URL as Single Source of Truth (useParams, useSearchParams)
- **개념**: `useState`를 제거하고, URL(Path, Query String) 자체를 유일한 상태 원천으로 사용. UI는 URL을 구독(Subscribe)하여 렌더링.
- **장점**: 별도의 동기화 로직 없이 새로고침/공유/뒤로가기 완벽 지원. 코드가 선언적(Declarative)으로 변함.
- **단점**: 상위 컴포넌트에서 URL을 구독할 경우 불필요한 리렌더링(Trade-off) 발생 가능성.

## ⚖️ 비교 정리
| 항목 | 선택지 1 (Memory State) | 선택지 2 (Syncing) | 선택지 3 (URL Driven) |
|------|-------------------------|--------------------|-----------------------|
| **구현 난이도** | 하 (초기) / 상 (유지보수) | 상 (동기화 로직 복잡) | **하 (Best)** |
| **유지보수** | 나쁨 (Props Hell) | 나쁨 (Bug Prone) | **좋음 (로직 간소화)** |
| **UX (공유/탐색)** | 불가능 | 보통 | **최상 (Native)** |
| **성능 (렌더링)** | 좋음 | 나쁨 (Double Render) | **보통 (최적화 필요)** |

## ✅ 최종 선택
- **선택한 방안**: **선택지 3 (URL as Single Source of Truth)**
- **선택 이유**:
  1.  **사용자 경험(UX) 극대화**: 팀장 및 동료에게 링크 공유 시 동일한 화면을 보장하는 것이 협업 툴(라이브러리)의 핵심 기능임.
  2.  **개발 효율성(DX)**: 남은 2주 동안 `useEffect` 의존성 배열과 싸우는 시간을 줄이고, 비즈니스 로직에 집중하기 위함.
  3.  **데이터 무결성**: URL이 곧 상태이므로, 데이터 불일치(Inconsistency)가 원천적으로 차단됨.

## 📉 아쉬운 점 & 트러블 슈팅
- **발생한 문제 (Side Effect)**:
  - `react-router-dom`의 Hook(`useParams`, `useSearchParams`)을 상위 레이아웃 컴포넌트에서 호출했더니, 하위의 모든 컴포넌트까지 불필요하게 리렌더링되는 현상 발생.
- **리스크**:
  - 최적화 없이 사용 시 앱의 전반적인 반응 속도 저하 우려.

## 🔮 이후 개선 방향 (Action Plan)
- **상태 위치 최적화 (Colocation)**:
  - 상위 `Layout` 컴포넌트는 URL을 구독하지 않도록(Pure Component) 수정.
  - URL 데이터가 필요한 **말단 컴포넌트(Leaf Node)로 Hook을 이동**시켜 리렌더링 범위 격리.
- **렌더링 방어 전략**:
  - **NavBar**: `useLocation` 대신 **`<NavLink>`** 컴포넌트를 사용하여 개별 버튼 단위로 리렌더링 제한.
  - **API Data**: 탭 개수(Count) 데이터는 URL 의존성을 제거하고 `React.memo`와 TanStack Query의 `staleTime`을 활용해 캐싱 처리.
- **구조적 개선**:
  - `children`과 `<Outlet />`을 활용한 **합성(Composition) 패턴**을 적극 도입하여 불필요한 리렌더링 전파 차단.

[[박소민] ‐ React Router NavLink의 매칭 원리와 `end` 속성 활용](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/wiki/%5B%EB%B0%95%EC%86%8C%EB%AF%BC%5D-%E2%80%90-React-Router-NavLink%EC%9D%98-%EB%A7%A4%EC%B9%AD-%EC%9B%90%EB%A6%AC%EC%99%80-%60end%60-%EC%86%8D%EC%84%B1-%ED%99%9C%EC%9A%A9)