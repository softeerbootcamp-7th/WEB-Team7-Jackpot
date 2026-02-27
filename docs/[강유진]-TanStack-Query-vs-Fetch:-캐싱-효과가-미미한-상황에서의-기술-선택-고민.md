> 이 문서는 홈 화면 API 연동 과정에서 "TanStack Query를 써야 할까, 일반 fetch를 써야 할까?"를 고민하며 정리한 내용입니다. 명확한 정답을 제시하기보다는, 고민의 과정과 각 선택지의 트레이드오프를 공유하고자 합니다.
> 

<aside>
💡

</aside>

---

## 1. TanStack Query란?

TanStack Query(구 React Query)는 서버 상태 관리 라이브러리로, 비동기 데이터 fetching, 캐싱, 동기화를 선언적으로 처리할 수 있게 해줍니다.

### 핵심 개념

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],           // 캐시 키
  queryFn: fetchTodos,            // 데이터 fetch 함수
  staleTime: 60 * 1000,          // 데이터 신선도 유지 시간
  gcTime: 5 * 60 * 1000,         // 가비지 컬렉션 시간
});
```

**캐싱 동작 방식:**

- `staleTime`: 이 시간 동안은 데이터를 "신선하다"고 판단하여 새로운 요청을 보내지 않음
- `gcTime`: 쿼리가 사용되지 않을 때 캐시를 메모리에 유지하는 시간
- 페이지 새로고침 시 캐시는 모두 초기화됨 (메모리 기반)

---

## 2. TanStack Query의 장점

### 2.1 자동 캐싱 및 중복 요청 제거

```tsx
// Component A
const { data } = useQuery({ queryKey: ['user'], queryFn: fetchUser });

// Component B (같은 시간에 마운트)
const { data } = useQuery({ queryKey: ['user'], queryFn: fetchUser });

// 👉 실제 API 요청은 1번만 발생, 두 번째는 캐시 사용
```

**이점이 있는 경우:**

- 여러 컴포넌트에서 같은 데이터를 참조할 때
- 페이지 이동 후 다시 돌아올 때 (gcTime 내)
- 같은 검색어를 반복 입력할 때

**이점이 없는 경우:**

- 컴포넌트 진입 시 1번만 호출되고 끝나는 경우
- 매번 다른 파라미터로 요청하는 경우 (검색어가 계속 바뀌는 경우)

### 2.2 백그라운드 자동 갱신

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,    // 탭 전환 후 돌아올 때 갱신
      refetchOnReconnect: true,       // 네트워크 재연결 시 갱신
      refetchInterval: 30000,         // 30초마다 자동 갱신
    },
  },
});
```

**주의:**

- 페이지에 가만히 있을 때는 갱신되지 않음 (refetchInterval 설정 시 제외)
- `refetchOnWindowFocus: false`로 설정 시 탭 전환해도 갱신 안 됨

### 2.3 로딩/에러 상태 자동 관리

```tsx
// ❌ 일반 fetch
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/data')
    .then(res => res.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// ✅ TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});
```

### 2.4 Suspense/ErrorBoundary 통합

```tsx
// useSuspenseQuery 사용
const { data } = useSuspenseQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

// 부모 컴포넌트
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <Component /> {/* 로딩/에러 처리 자동 */}
  </Suspense>
</ErrorBoundary>
```

**일반 fetch로 Suspense 구현:**

- Promise를 throw하는 패턴을 직접 구현해야 함
- 복잡도 증가, 실수 가능성 높음

### 2.5 Mutation과 쿼리 갱신 자동화

```tsx
const deleteMutation = useMutation({
  mutationFn: deleteCoverLetter,
  onSuccess: () => {
    // 목록만 자동 갱신, 다른 캐시는 유지
    queryClient.invalidateQueries({ queryKey: ['coverletter', 'list'] });
  },
});
```

### 2.6 자동 재시도 및 에러 복구

```tsx
{
  retry: 1,  // 실패 시 1번 재시도
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
}
```

---

## 3. TanStack Query의 단점

### 3.1 번들 사이즈 증가

- 약 13KB (gzipped)
- 단순 fetch만 쓰는 프로젝트에는 과도함

### 3.2 학습 곡선

- queryKey, staleTime, gcTime 등 개념 이해 필요
- 잘못 사용하면 오히려 복잡도 증가

### 3.3 과도한 추상화 가능성

- 간단한 API 호출에도 Query 설정 필요
- 캐싱 이점이 없는 경우 불필요한 오버헤드

### 3.4 디버깅 복잡성

- 캐시 상태, 백그라운드 갱신 등 추적이 어려울 수 있음
- DevTools 필요

---

## 4. 일반 Fetch의 장점

### 4.1 단순성

```tsx
const [data, setData] = useState(null);

useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(setData);
}, []);
```

- 추가 라이브러리 불필요
- 명확하고 직관적

### 4.2 번들 사이즈 최소화

- 브라우저 내장 API 사용
- 추가 의존성 없음

### 4.3 유연성

- 필요한 로직만 직접 구현
- 프로젝트 특성에 맞게 커스터마이징 가능

### 4.4 학습 비용 제로

- 기본 JavaScript/React 지식만으로 충분

---

## 5. 일반 Fetch의 단점

### 5.1 보일러플레이트 코드 증가

```tsx
// 매번 반복되는 패턴
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  setError(null);
  // ... fetch 로직
}, []);
```

### 5.2 캐싱 직접 구현 필요

- 중복 요청 제거
- 캐시 만료 관리
- 메모리 관리

### 5.3 Suspense 통합 복잡

```tsx
// Promise를 throw하는 패턴 직접 구현 필요
function wrapPromise(promise) {
  let status = 'pending';
  let result;
  let suspender = promise.then(
    (r) => { status = 'success'; result = r; },
    (e) => { status = 'error'; result = e; }
  );

  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw result;
      return result;
    }
  };
}
```

### 5.4 에러 처리 및 재시도 로직 직접 구현

```tsx
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** i));
    }
  }
};
```

---

## 6. 홈 화면 구현 시 발생한 고민

### 6.1 현재 상황

홈 화면에서 사용하는 4개의 API:

```tsx
// 1. 홈 화면 통계 (홈에서만 1번 호출)
const { data } = useHomeCount();

// 2. 다가오는 일정 (홈에서만 1번 호출)
const { data } = useUpcomingDeadlines(3, 2);

// 3. 캘린더 날짜 (홈에서만 1번 호출)
const { data } = useCalendarDates(startDate, endDate);

// 4. 작성 중인 자기소개서 목록 (검색 기능)
const { data } = useRecentCoverLetters(6);
```

**TanStack Query 설정:**

```tsx
{
  staleTime: 60 * 1000,           // 1분
  gcTime: 5 * 60 * 1000,          // 5분
  refetchOnWindowFocus: false,    // 탭 전환 시 갱신 안 함
}
```

### 6.2 캐싱 이점 분석

### API 1~3: 통계, 일정, 캘린더

**캐싱 이점: ❌ 없음**

- 홈 화면 진입 시 1번만 호출
- 다른 페이지에서 재사용 안 됨
- 같은 페이지 내에서 재호출 없음
- 백그라운드 갱신 비활성화 (`refetchOnWindowFocus: false`)

**결론:** 페이지 새로고침하면 어차피 캐시 날아가므로, 실질적인 캐싱 이점 전무

### API 4: 자기소개서 검색

**검색 시나리오:**

```tsx
// 초기 로드 (검색어 없음)
searchCoverLetters({ searchWord: '', size: 9, page: 1 }) // ✅ 캐시 저장

// 사용자가 "토" 입력 (debounce 후)
searchCoverLetters({ searchWord: '토', size: 9, page: 1 }) // 🆕 새 쿼리키, 새 요청

// 사용자가 "토스" 입력
searchCoverLetters({ searchWord: '토스', size: 9, page: 1 }) // 🆕 새 쿼리키, 새 요청

// 사용자가 지우고 다시 "토" 입력
searchCoverLetters({ searchWord: '토', size: 9, page: 1 }) // ✅ 캐시 사용!
```

**캐싱 이점: △ 매우 제한적**

- 사용자가 같은 검색어를 지웠다가 다시 입력할 때만 유효
- 실제로 이런 케이스가 얼마나 발생하는가?

**자기소개서 작성 페이지에서의 재사용:**

- 홈과 자기소개서 페이지 간 이동 시, 초기 데이터 캐싱의 이점은 존재

### 6.3 현재 TanStack Query의 실질적 이점

**✅ 확실한 이점:**

1. **Suspense/ErrorBoundary 통합**
    - `useSuspenseQuery`로 선언적 비동기 처리
    - 일반 fetch로 Suspense 구현 시 복잡한 패턴 필요
2. **자동 재시도**
    - `retry: 1` 설정으로 네트워크 일시 오류 대응
3. **코드 간소화**
    - useState, useEffect 보일러플레이트 제거
    - 로딩/에러 상태 자동 관리

**❌ 이점이 없는 부분:**

1. 캐싱 및 중복 요청 제거
2. 백그라운드 자동 갱신
3. 여러 컴포넌트 간 상태 공유

### 6.4 고민 포인트

### 질문 1: 캐싱 이점이 거의 없는데 TanStack Query를 써야 하는가?

**고민 포인트:**

- TanStack Query의 가장 큰 강점은 캐싱인데, 우리 케이스는 캐싱 효과가 거의 없음
- Suspense/ErrorBoundary 통합과 상태 관리 자동화만으로 도입을 정당화할 수 있을까?
- 번들 사이즈 13KB 증가를 감수할 만한 가치가 있을까?

**각 관점**

**TanStack Query 유지 관점:**

- Suspense/ErrorBoundary 통합이 개발 경험을 크게 향상시킴
- 직접 구현하면 복잡도가 높고 실수 가능성 있음
- 검증된 라이브러리로 안정성 확보
- 향후 요구사항 변경 가능성 대비

**일반 Fetch 전환 관점:**

- 과도한 추상화 제거
- 번들 사이즈 감소
- 필요한 기능만 직접 구현
- 코드 흐름이 더 명확하고 직관적

### 질문 2: "검색어 지웠다가 다시 입력" 정도의 캐싱도 의미 있는가?

**고민 포인트:**

- 실제로 사용자가 이런 행동을 얼마나 자주 하는가?
- 이 정도 빈도의 캐시 hit도 "캐싱 이점이 있다"고 봐야 하는가?

**의문사항:**

- 캐싱 이점의 기준선은 어디인가?
- 몇 퍼센트의 캐시 hit율부터 의미 있다고 봐야 하는가?

### 질문 3: 통일성 vs 최적화, 무엇이 더 중요한가?

**상황:**
홈 페이지에서 4개 API를 사용하는데, 각각의 캐싱 이점이 다름

**선택지들:**

**A안: 전부 TanStack Query**

```tsx
<ErrorBoundary>
  <Suspense><SummaryOverview /></Suspense>         {/* 캐싱 이점 없음 */}
  <Suspense><ScheduleOverview /></Suspense>        {/* 캐싱 이점 없음 */}
  <Suspense><CoverLetterOverview /></Suspense>     {/* 캐싱 이점 미미 */}
</ErrorBoundary>
```

---

## 7. 일반적인 선택 기준 제안

이번 고민을 통해, 향후 비슷한 상황에서 참고할 수 있는 기준을 생각해봤습니다. (절대적인 기준은 아니며, 프로젝트 상황에 따라 달라질 수 있습니다)

### 7.1 TanStack Query 사용 권장할만한 케이스

**필수 조건 (하나라도 해당)**

- 여러 컴포넌트/페이지에서 같은 데이터 재사용
- 페이지 이동 후 돌아올 때 캐시 활용 가능
- 백그라운드 자동 갱신 필요
- Mutation 후 관련 쿼리 자동 갱신 필요

**추가 고려사항:**

- Suspense/ErrorBoundary 패턴 사용 여부
- 자동 재시도 필요성
- 팀의 TanStack Query 숙련도

### 7.2 일반 Fetch 사용 권장할만한 케이스

**조건:**

- 페이지 진입 시 1번만 호출되고 끝
- 해당 페이지에서만 사용
- 캐싱/재사용 불필요
- 단순한 API 호출

**주의사항:**

- Suspense 사용 시 직접 구현 필요
- 에러 처리, 재시도 로직 직접 구현

### 7.3 혼용 시 가이드라인

**페이지 단위 통일:**

- 같은 페이지 내에서는 하나의 방식으로 통일
- 페이지별로 다른 전략 사용 가능 (단, 문서화 필수)

**API 재사용 시:**

- 여러 페이지에서 사용하는 API는 TanStack Query 권장
- 한 번만 구현하고 재재사용.

---

## 8. 마치며

이 문서는 정답을 제시하기보다는, 홈 화면 API 연동 과정에서 마주한 고민을 정리한 것입니다.
**느낀 점:**

- TanStack Query는 강력한 도구지만, 모든 상황에 최적은 아님
- 캐싱 이점이 명확하지 않은 경우, 선택이 어려움
- "무엇을 우선시하는가"에 따라 답이 달라질 수 있음

**다음 단계:**

1. 팀원들과 이 고민을 공유하고 의견 수렴
2. 우리 프로젝트의 우선순위 정리 (통일성 vs 최적화, 단순성 vs 확장성)
3. 실제 사용 패턴 데이터 확인
4. (가능하다면) 작은 범위에서 두 가지 방식 모두 시도해보고 비교

이 문서가 비슷한 고민을 하는 팀원들에게 도움이 되기를 바라며, 함께 논의하면서 더 나은 기준을 만들어갈 수 있기를 기대합니다.