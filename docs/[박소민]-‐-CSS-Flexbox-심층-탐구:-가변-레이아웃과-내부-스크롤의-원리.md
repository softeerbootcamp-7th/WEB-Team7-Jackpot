# 📚 CSS Flexbox 심층 탐구: 가변 레이아웃과 내부 스크롤의 원리
관련 [커밋](https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/pull/282/changes/de56bc319d6fa8b56b12824b185777cd9627d265)입니다.

## 1. 배경 (Context)
화면 전체 높이(`h-screen`)는 고정되어 있고, 상단에는 높이가 가변적인 헤더(Dynamic Header)가 존재한다. 이때 헤더를 제외한 **남은 공간을 모두 차지**하면서, 내용이 넘칠 경우 **전체 스크롤이 아닌 해당 영역 내부에서만 스크롤**이 발생하는 레이아웃을 구현해야 했다.

기존의 `height: calc(100vh - 60px)` 방식은 헤더 높이가 변할 때마다 수치를 수정해야 하는 하드코딩 문제가 있어, **Flexbox의 공간 분배 알고리즘**을 활용한 근본적인 해결책을 적용했다.

---

## 2. 브라우저의 레이아웃 계산 과정 (The Layout Negotiation)

Flexbox 레이아웃은 단순히 스타일을 입히는 것이 아니라, 부모와 자식 간의 **"크기 협상(Negotiation)"** 과정을 통해 결정된다. 이 과정을 이해해야 레이아웃 깨짐 현상을 방지할 수 있다.

### 2.1. Top-Down: 제약 조건 전달 (Constraint Passing)
브라우저는 가장 먼저 최상위 부모 컨테이너의 크기를 확정하고 자식들에게 제약 조건을 내린다.

* **Parent (`h-screen overflow-hidden`)**:
    * "나는 뷰포트 높이(예: 1000px)로 고정한다."
    * "자식들은 내 크기를 넘어서 렌더링될 수 없다(Clip)."

### 2.2. Inflexible Allocation: 고정 요소 계산
Flex 엔진은 자식 요소 중 크기가 변하지 않는(`flex-none`, 고정 높이) 요소들의 공간을 먼저 배정한다.

* **Header (`flex-none`)**: "나는 내부 콘텐츠 때문에 높이 60px이 필요해."
* **Browser**: "승인. 1000px 중 60px 할당. **남은 공간(Available Space)은 940px.**"

### 2.3. Flexible Allocation: 유연한 요소 분배
남은 공간(940px)을 `flex-grow` 속성을 가진 자식들에게 분배한다.

* **Body (`flex-1`)**: "남은 공간 다 주세요."
* **Browser**: "남은 940px을 너에게 할당한다."

### 2.4. Bottom-Up Conflict: 자식의 반란과 `min-height: 0`
**여기서 대부분의 레이아웃 버그가 발생한다.** Flex 아이템은 기본적으로 **`min-height: auto`** 속성을 가진다. 이는 "내용물이 크면 줄어들지 않겠다"는 성질이다.

* **상황**: Body 안에 높이 5000px짜리 리스트가 들어있음.
* **충돌 발생**:
    * **Browser**: "너는 940px만 써야 해."
    * **Body**: "내용물이 5000px이라는데요? `min-height: auto` 규칙에 따라 5000px 아래로는 못 줄어듭니다."
* **결과**: 부모의 제약(940px)을 무시하고 자식이 부모를 뚫고 나가버림 (레이아웃 파괴).

### 🔑 해결책: `min-height: 0` (The Reset)
Body 요소에 `min-h-0`을 부여하면 Flex 아이템의 기본 고집(`auto`)을 초기화한다.

> **"내용물 크기는 무시하고, 부모가 할당해 준 크기(940px)로 강제 축소(Shrink)하라."**

이 명령이 있어야 비로소 Body는 940px로 고정되고, 그 안에서 `overflow-y-auto`가 동작할 수 있는 환경이 조성된다.

---

## 3. 구현 전략: `flex-none` vs `flex-1`

무작위로 `flex` 속성을 사용하는 것을 막기 위해, 역할에 따른 명확한 속성 사용 규칙을 정의한다.

### 3.1. `flex-none` (The Rock 🪨)
* **CSS**: `flex: none;` (grow: 0, shrink: 0, basis: auto)
* **역할**: 외부 환경(화면 크기, 남은 공간)에 영향받지 않고 **자신의 고유 크기를 절대적으로 사수**한다.
* **사용처**:
    * Header (높이 고정)
    * Sidebar Wrapper (너비 고정)
    * Search Input (찌그러짐 방지)

### 3.2. `flex-1` (The Balloon 🎈)
* **CSS**: `flex: 1 1 0%;` (grow: 1, shrink: 1, basis: 0%)
* **역할**: 형제 요소들이 자리를 잡고 **남은 공간을 모두 흡수**하여 채운다. 공간이 부족하면 줄어들기도 한다.
* **사용처**:
    * Main Content Area
    * List Wrapper (스크롤 영역)

### 🧩 최종 코드 아키텍처 (React/Tailwind)

```tsx
// 부모: 전체 틀 고정 (기준점)
<div className="h-screen flex flex-col overflow-hidden">

  {/* 1. 고정 영역: 크기 사수 (flex-none) */}
  <header className="flex-none">
    {/* 가변적인 높이의 헤더 내용 */}
  </header>

  {/* 2. 가변 영역: 남은 공간 차지 (flex-1) */}
  {/* min-h-0: 내용물 크기 무시하고 부모 크기에 맞춤 (필수) */}
  <main className="flex-1 min-h-0 flex flex-row">
    
    {/* 3. 사이드바 & 본문: 각자 h-full로 높이 상속 후 내부 스크롤 */}
    <aside className="h-full overflow-y-auto justify-start">
        {/* ... */}
    </aside>
    <section className="h-full overflow-y-auto">
        {/* ... */}
    </section>

  </main>
</div>
```

## 4. 트러블슈팅: 스크롤 시 상단 잘림 (Clipping) 이슈

### 문제 현상
`flex-1` 영역 내부에서 스크롤은 동작하지만, 스크롤을 최상단으로 올려도 **콘텐츠의 윗부분이 잘려서 보이지 않는 현상**이 발생했다.

### 원인: `justify-center`의 동작 방식
Flexbox 컨테이너에 `justify-center`(수직/수평 중앙 정렬)가 적용된 상태에서 내용물이 컨테이너보다 커지면(Overflow), 브라우저는 **중앙을 유지하기 위해 위아래(Start/End)를 공평하게 잘라버린다.**

이때 위쪽(Start 방향)으로 넘어간 영역은 **"스크롤로 도달할 수 없는 영역(Unreachable Area)"**이 되어버린다.

### 해결 방법: Safe Layout
스크롤이 발생할 가능성이 있는 컨테이너(`flex-1`) 내부에서는 **반드시 시작점 정렬(`justify-start`)**을 사용해야 한다.

| 정렬 방식 | 공간 충분할 때 | 공간 부족할 때 (스크롤) | 비고 |
| :--- | :--- | :--- | :--- |
| `justify-center` | 중앙 정렬 | **위아래 모두 잘림** | 스크롤 불가 영역 발생 (Unsafe) |
| `justify-start` | 상단 정렬 | **아래쪽만 넘침** | 정상적으로 스크롤 가능 (Safe) |

### 적용
`pt`(padding-top)로 억지로 여백을 주는 대신, `justify-start`를 적용하고 자식 요소간의 간격은 `gap`이나 `margin`으로 처리하여 레이아웃의 안전성을 확보했다.