### 문제 상황

실시간 협업(Writer/Reviewer) 화면에서, 서버가 `TEXT_REPLACE_ALL` 이벤트를 정상적으로 내려주고 클라이언트도 해당 메시지를 정상 수신했다.

즉, 소켓 연결/구독 자체는 문제가 없었고 `received message` 로그도 확인됐다.

그런데 사용자 입장에서는 다음 현상이 발생했다.

- 상대 변경 이벤트를 받았는데 화면 텍스트가 그대로 보임
- 기대했던 컴포넌트(`CoverLetterLiveMode`, `CoverLetterContent`)의 업데이트 로그가 추가로 찍히지 않음
- 결과적으로 “메시지는 왔는데 UI는 안 바뀌는” 상태로 보임

---

### 목표: `TEXT_REPLACE_ALL` 수신 시, 해당 QnA의 화면이 최신 상태로 반영되도록 한다.

당시 기대 동작은 명확했다.

1. `TEXT_REPLACE_ALL` 수신
2. 수신 payload(`version`, `content`)로 상태 갱신
3. 해당 상태를 구독하는 컴포넌트 리렌더
4. 화면 텍스트가 최신 내용으로 교체

하지만 실제로는 1번까지만 확인되고 2~4번이 체감상 일어나지 않아,

초기에는 “소켓은 받았는데 반영이 안 된다”는 이슈로 인지되었다.

---

### 당시 구현 방식

`TEXT_REPLACE_ALL` 수신 시, UI state를 직접 바꾸는 대신 React Query 캐시를 갱신하는 방식으로 처리했다.

핵심 아이디어는 “해당 query key 캐시를 바꾸면, 그 key를 구독 중인 컴포넌트가 자동으로 최신값을 받는다”였다.

실제 흐름은 아래와 같았다.

1. `useSocketSubscribe`에서 메시지 수신
2. 수신 payload를 `useSocketMessage.handleMessage`로 전달
3. `TEXT_REPLACE_ALL` 분기에서 아래 캐시 키를 직접 업데이트
    - `['share', shareId, 'qna', qnAId]`
4. updater에서 기존 `oldData`를 기반으로
    - `version = message.payload.version`
    - `answer = message.payload.content`
    로 덮어쓴 새 객체를 반환
5. 이 키를 쓰는 `useShareQnA` 구독 컴포넌트가 리렌더되기를 기대

즉, 당시 구현은 “WebSocket 수신값 → React Query 캐시 반영 → 구독 컴포넌트 자동 업데이트”라는 캐시 중심 동기화 전략이었다.

---

### 관찰된 현상

- `received message` 로그는 정상 출력
- 하지만 메시지 직후 `CoverLetterLiveMode` 커밋 로그가 추가로 찍히지 않음
- 즉, 수신은 됐지만 화면 업데이트는 안 된 케이스가 존재

---

### 원인 분석

디버그 로그에서 아래가 확인됐다.

- `sameVersion: true`
- `sameAnswer: true`

즉, **기존 캐시 데이터와 수신 데이터가 완전히 동일**했다.

→ 최초 데이터 fetch 후 첫 텍스트 변경에서 바로 `TEXT_REPLACE_ALL` 가 발생할 떄, 문제가 생기기 이전 버전으로 돌아가야하기 때문에 최초에 fetch해온 데이터로 돌아가야 했다. 따라서 이때 기존에 가지고 있던 데이터와 덮어쓰기 하고자 하는 데이터가 동일했던 것이었다.

이 경우 React Query는 실질 변경이 없다고 판단하므로 컴포넌트 업데이트(리렌더/커밋)가 발생하지 않는 것이 정상이다.

---

### 어떻게 확인했는가

`useSocketMessage`에 진단 로그를 추가해 before/after를 비교했다.

- before: 기존 캐시의 `version`, `answer`
- incoming: 수신 payload의 `version`, `content`
- after: setQueryData 이후 캐시 값

결과적으로 before와 incoming이 동일했다.

---

### 결론

이번 이슈의 핵심 원인은

**“소켓 수신 실패”가 아니라 “같은 데이터 재수신”으로 인해 상태 변화가 없었던 것**이다.

---

### 대응

이번 케이스의 대응은 `queryClient` 최적화가 아니라, **상태 소스 단일화**로 잡는다.

- 기존: WebSocket 수신 시 React Query 캐시(`setQueryData`/`invalidateQueries`) 갱신에 의존
- 변경: 초기 1회 fetch 이후에는 `queryClient`를 경유하지 않고, WebSocket 수신값을 **실제 UI state**에 직접 반영

구체적으로

1. 초기 진입 시점에만 fetch로 state 초기화
2. 이후 `TEXT_UPDATE`, `TEXT_REPLACE_ALL` 등 모든 변경은 WebSocket 이벤트로만 state 갱신
3. 화면은 해당 state만 구독하도록 구성 (`single source of truth`)
4. 재연결/복구 시에는 스냅샷 재동기화(재fetch 또는 full-sync 이벤트)로 정합성 보장

이렇게 변경하면 “캐시는 바뀌는데 화면은 안 바뀌는” 문제를 구조적으로 제거할 수 있다.

---

### 한 줄 요약

컴포넌트가 안 바뀐 이유는 `setQueryData` 실패가 아니라, **갱신 전/후 데이터가 동일해서 변경 이벤트 자체가 없었기 때문**이다.