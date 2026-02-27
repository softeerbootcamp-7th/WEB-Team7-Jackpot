# 📘 React Router NavLink의 매칭 원리와 `end` 속성 활용
관련[커밋](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/pull/379/changes/46a25498f51ce3ba4f2a374b703af2bdac52cd7e)입니다.

## 📝 작성 배경
- **왜 이 가이드가 필요한가?**
  - 네비게이션 바(GNB, LNB)의 하이라이팅 처리를 위해 불필요한 `useState`나 `useEffect`를 사용하는 안티 패턴을 방지하기 위함.
  - 중첩 라우팅(Nested Routing) 환경에서 상위 탭과 하위 메뉴의 활성화 상태가 겹치거나, 의도치 않게 꺼지는 문제를 해결해야 함.
- **전제 조건:**
  - `react-router-dom` v6 이상 사용.
  - `<NavLink>` 컴포넌트 사용을 표준으로 함.

## 🔄 동작 원리 (Matching Logic)
`NavLink`는 내부적으로 현재 URL(`location.pathname`)과 `to` props를 비교하여 `isActive` 상태를 반환합니다. 이때 비교 방식은 **`end` 속성**에 따라 두 가지로 나뉩니다.

### 옵션 1: `end={false}` (Default) - 접두사 매칭 (Prefix Match)
- **개념**: "나로 시작하는 모든 경로는 내 식구다."
- **동작**: 자바스크립트의 `string.startsWith()`와 유사.
- **비유**: **폴더 (Directory)**. 폴더 안에 파일이 있어도 폴더는 여전히 선택된 상태임.
- **예시**: `to="/library"` 설정 시
  - `/library` (O)
  - `/library/company` (O)
  - `/library/qna/123` (O)

### 옵션 2: `end={true}` - 정확한 매칭 (Exact Match)
- **개념**: "정확히 나랑 똑같은 경로만 인정한다."
- **동작**: 자바스크립트의 `string === string` (일치 연산자)와 유사.
- **비유**: **파일 (File)**. 파일은 그 자체로 끝임.
- **예시**: `to="/library"` 설정 시
  - `/library` (O)
  - `/library/` (O) - (Trailing Slash는 보통 무시됨)
  - `/library/company` (X) - 뒤에 더 있어서 탈락

## ⚖️ 비교 정리

| 속성 설정 | 매칭 논리 | 프로그래밍 비유 | 현실 비유 | 추천 사용처 |
| :--- | :--- | :--- | :--- | :--- |
| **`end={false}`** (기본값) | **Prefix Match** (포함) | `current.startsWith(target)` | **상위 폴더** | 대분류 탭 (라이브러리 등), 하위 메뉴가 있는 상위 메뉴 |
| **`end={true}`** | **Exact Match** (일치) | `current === target` | **개별 파일** | **홈 화면(`/`)**, 더 이상 하위 메뉴가 없는 말단 링크 |

## ✅ 실전 적용 가이드 (Best Practice)

### 1. 홈 버튼에는 반드시 `end`를 붙일 것
모든 URL은 `/`로 시작하므로, `end`가 없으면 **어떤 페이지를 가도 홈 버튼에 불이 들어오는 버그**가 발생함.

```tsx
// ❌ (Bad) 항상 켜져 있음
<NavLink to="/">Home</NavLink>

// ✅ (Good) 홈에서만 켜짐
<NavLink to="/" end>Home</NavLink>
```

### 2. 상위 탭(Tab)에는 `end`를 쓰지 말 것
하위 메뉴(`/library/company`)를 보고 있어도 상위 탭(`라이브러리`)은 활성화되어 있어야 함.

```tsx
// ✅ (Good) 하위 메뉴 진입 시에도 탭 활성화 유지
<NavLink to="/library">라이브러리</NavLink>
```

### 3. 스타일링 패턴 (Tailwind CSS)
`className`에 함수를 사용하여 `isActive` 상태에 따라 스타일을 분기 처리함.

```tsx
<NavLink
  to="/library/company"
  className={({ isActive }) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-blue-600 text-white font-bold" // Active Style
        : "text-gray-600 hover:bg-gray-100"  // Inactive Style
    }`
  }
>
  기업 라이브러리
</NavLink>
```

## 📉 주의사항 (Pitfalls)
- **Trailing Slash(`/`) 이슈**: React Router v6부터는 `/library`와 `/library/`를 동일하게 취급하므로 신경 쓰지 않아도 됨.
- **쿼리 스트링 무시**: `/library?page=2&search=hello` 처럼 뒤에 쿼리 파라미터가 붙어도, 경로(Path)만 일치하면 `isActive`는 `true`가 됨. (이는 의도된 동작이며 올바른 UX임).

## 🔮 요약
> **"부모(상위 메뉴)는 너그럽게(`end=false`), 홈 버튼은 엄격하게(`end=true`) 관리하자."**