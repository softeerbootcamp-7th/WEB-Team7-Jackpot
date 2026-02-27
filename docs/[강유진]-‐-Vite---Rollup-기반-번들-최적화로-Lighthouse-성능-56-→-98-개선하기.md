## 들어가며

React + Vite 기반 SPA 프로젝트를 개발하면서, 기능 구현과 사용자 흐름은 어느 정도 안정화되었지만 **초기 로딩 성능이 체감상 느리다**는 피드백을 받았습니다.

Lighthouse로 성능을 측정해보니, 단순히 “느리다”가 아니라 **번들 구조와 로딩 전략 자체를 다시 살펴봐야 하는 상황**이라는 점이 드러났습니다.

이번 글에서는 단순히 설정을 나열하기보다는,

- Vite와 Rollup이 각각 무엇을 담당하는지
- 번들링이 내부적으로 어떻게 이루어지는지
- chunk 분리 전략이 성능에 어떤 영향을 미치는지
- 그 이해를 바탕으로 실제 Lighthouse 성능을 개선한 과정

을 순서대로 정리합니다.

<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin:32px 0;">
  <img src="https://github.com/user-attachments/assets/b1aa8b95-b61c-4220-8026-51342882adb4" />
  <img src="https://github.com/user-attachments/assets/1210cc2e-a043-4fce-8aa0-c27ee7688a18" />
</div>

---

## 1. Vite는 무엇이고, 왜 빠를까?

### Vite의 역할

Vite는 단순한 번들러라기보다는,

> **개발 서버 + 빌드 도구를 포함한 프론트엔드 개발 환경**
> 

에 가깝습니다.

Vite가 빠르다고 느껴지는 가장 큰 이유는 **개발 모드에서 번들링을 하지 않기 때문**입니다.

---

### 개발 모드에서의 동작 방식

- 브라우저의 **Native ES Module**을 그대로 사용
- 필요한 파일만 요청되었을 때 변환
- 전체 앱을 하나로 묶지 않음

즉,

> “개발 중에는 번들을 만들지 않고,
> 
> 
> 브라우저가 import 요청한 파일만 즉시 제공”
> 

하는 구조입니다.

---

### 그렇다면 프로덕션 빌드는?

프로덕션에서는 수백 개의 JS 파일을 그대로 서빙할 수 없기 때문에,

Vite는 **빌드 단계에서 Rollup을 사용**합니다.

---

## 2. Rollup은 무엇인가?

Rollup은 **ES Module 기반 번들러**입니다.

역할을 단순화하면

1. 모든 import/export 관계를 분석해
2. **모듈 그래프(Module Graph)** 를 만들고
3. 사용되지 않는 코드를 제거(tree-shaking)하며
4. 하나 또는 여러 개의 chunk로 묶어 출력

합니다.

특히 Rollup은 **정적 분석에 강점**이 있어, tree-shaking 정확도가 높습니다.

---

## 3. Vite와 Rollup의 관계

정리하면 구조는 다음과 같습니다.

- **개발 모드**
    - Vite + esbuild
    - 번들링 없음, 빠른 HMR
- **빌드 모드**
    - Vite → 내부적으로 Rollup 사용
    - chunk 생성, tree-shaking, 최적화 수행

그래서 Vite 설정 안에 `rollupOptions`가 존재합니다.

---

## 4. 번들링은 내부적으로 어떻게 이루어질까?

### 1. 모듈 그래프 (Module Graph)

Rollup은 entry 파일부터 시작해 모든 import를 따라가며 그래프를 만듭니다.

```
entry
 ├─ App
 │   ├─ PageA
 │   ├─ PageB
 │   └─ Component
 └─ node_modules
```

이 그래프를 기반으로

- 어떤 코드가 항상 필요한지
- 어떤 코드는 특정 시점에만 필요한지

를 판단합니다.

---

### 2. Chunk Graph

그 다음 단계는 **어떤 모듈들을 하나의 파일로 묶을지**를 결정하는 과정입니다.

- static import → 같은 chunk로 묶일 가능성 큼
- dynamic import → 자동으로 별도 chunk 생성

이때 만들어지는 구조가 **chunk graph**입니다.

---

### 3. dynamic import의 역할

```tsx
const Page = lazy(() => import('./Page'));
```

이런 코드가 의미하는 것은

> “이 코드는 초기 번들에 포함하지 말고,
> 
> 
> 실제 접근 시점에 로드하라”
> 

즉, **런타임 기준의 코드 분리**입니다.

---

### 4. HTTP/2 환경에서의 의미

HTTP/1.1 시대에는

- 요청 개수 제한
- 파일을 많이 쪼개면 오히려 느림

그래서 “하나로 묶는 전략”이 유리했습니다.

하지만 HTTP/2 환경에서는

- multiplexing 지원
- 여러 파일을 동시에 전송 가능

따라서,

> **변경 빈도와 로딩 시점을 기준으로 적절히 분리하는 전략**
> 

이 더 유리해졌습니다.

---

## 5. Lighthouse 측정 결과와 문제 인식

프로덕션 환경에서 Lighthouse를 측정한 결과는 다음과 같았습니다.

- Performance: **56**
- FCP: **5.8s**
- LCP: **6.4s**
- TBT: **0ms**
- CLS: **0**

즉,

> **JS 실행은 빠르지만, 초기 화면이 늦게 표시되고 있었다**
> 

는 점이 핵심 문제였습니다.

---

## 6. 1차 접근: Route 기반 Dynamic Import

앞서 말한 **Route 기반 Dynamic Import**는 개념적으로는 단순하지만,

실제 프로젝트에서는 **라우터 구조 + 레이아웃 + 가드 컴포넌트**가 얽혀 있어

어디까지를 분리할지 기준을 세우는 것이 중요했습니다.

우리 프로젝트의 `App.tsx`는 다음과 같은 역할을 가지고 있었습니다.

- Public / Private Route 분리
- Layout 단위 중첩
- 기능별(Upload, Library, Cover Letter 등) 라우팅
- Guard 컴포넌트(PublicGuard / PrivateGuard)

즉, **초기 진입 시 반드시 필요한 것과 그렇지 않은 것이 명확히 구분 가능한 구조**였습니다.

---

### 기존 문제점

초기 구조에서는

- 페이지 컴포넌트
- 레이아웃 컴포넌트
- 가드 컴포넌트

모두가 **정적 import** 되어 있었고,

결과적으로 **로그인 여부와 상관없이 모든 페이지 코드가 초기 번들에 포함**되었습니다.

이는 곧,

> **“라우트는 분기되지만, 코드 자체는 분기되지 않는다”**
> 

는 상태였습니다.

### 적용 전략

App.tsx에서 세운 기준은 다음과 같습니다.

1. **Route 단위 컴포넌트는 모두 lazy**
2. **Layout / Guard도 route 진입 시점에 로드**
3. Suspense boundary는 **라우터 최상단에 하나만 유지**

### 왜 Layout과 Guard까지 lazy 했을까?

처음에는 페이지 컴포넌트만 lazy 처리했지만,

실제로 네트워크 탭을 확인해보면

- `RootLayout`
- `PrivateGuard`
- 각 feature layout

역시 **초기 번들에 포함되어 있었습니다**.

하지만 이 컴포넌트들은 공통 컴포넌트이지,

**초기 진입(특히 비로그인 상태)** 에 반드시 필요한 코드는 아니었습니다.

따라서

- Public Route 접근 시 → Private 영역 코드 로드 X
- 인증 이후 → 필요한 layout만 로드

가 가능해졌습니다.

### Suspense boundary를 하나로 둔 이유

각 Route마다 Suspense를 둘 수도 있었지만,

이번 구조에서는 다음을 우선했습니다.

- 전역 로딩 UI를 일관되게 유지
- chunk 로딩 중 화면 전환 최소화
- fallback 상태 관리 단순화

즉,

> **“라우트 전환 중 로딩 경험을 하나의 UX로 통제”**
> 

하는 쪽을 선택했습니다.

### 결과

이 구조를 적용한 뒤, 빌드 결과를 확인해보면:

- 초기 로딩 시 다운로드되는 JS 파일 수 감소
- Public 진입 시 Private feature chunk 미로딩
- route 이동 시 필요한 chunk만 네트워크 요청

이라는 변화가 명확하게 나타났습니다.

즉,

> **“라우터 구조가 곧 chunk 로딩 전략이 되도록 만든 것”**
> 

이 핵심이었습니다.

하지만 여전히 Lighthouse 점수는 기대만큼 오르지 않았고,

**vendor 번들이 여전히 크다**는 점이 눈에 띄었습니다.

---

## 7. 2차 문제: vendor chunk 과대화

Vite 기본 설정에서는

- `node_modules` 전체가 하나의 vendor chunk로 묶입니다.

우리 프로젝트에서는

- React
- React Router
- React Query
- Validation(zod)
- WebSocket 관련 라이브러리

가 **모두 초기 로딩 시 함께 다운로드**되고 있었습니다.

---

## 8. Rollup manualChunks로 chunk 전략 재설계

이 문제를 해결하기 위해 **빌드 시점의 chunk 분리 전략**을 조정했습니다.

```tsx
manualChunks(id) {
  if (!id.includes('node_modules')) return;

  if (id.includes('react-router')) return 'router';
  if (id.includes('@tanstack')) return 'react-query';
  if (id.includes('zod')) return 'zod';
  if (id.includes('sockjs-client') || id.includes('@stomp/stompjs')) return 'socket';

  return 'vendor';
}
```

---

### React는 왜 분리하지 않았나?

- 모든 페이지에서 항상 필요
- 가장 먼저 로드되어야 함
- 잘못 분리하면 오히려 waterfall 발생

→ **프레임워크 코어는 안정적으로 유지**

---

## 9. Tree-Shaking과 sideEffects 이해의 중요성

### Rollup Tree-Shaking 내부 원리

Rollup은

1. entry부터 시작해
2. 실제 사용되는 export만 mark
3. 참조되지 않는 코드는 제거

하는 방식으로 동작합니다.

---

### sideEffects 옵션이 중요한 이유

라이브러리가 `sideEffects: true`로 설정되어 있으면:

- “혹시 import만으로도 부작용이 있을 수 있음”
- → tree-shaking 보수적으로 동작

따라서 **라이브러리 선택과 설정이 번들 크기에 직접적인 영향**을 줍니다.

---

## 10. React + Vite에서 최적 chunk 전략 정리

이번 경험을 통해 정리한 기준은 다음과 같습니다.

- **항상 필요한 것**: React core → 분리하지 않음
- **페이지 진입 시 필요한 것**: router → 별도 chunk
- **특정 기능에서만 사용**: socket, validation → 분리
- **변경 빈도 낮음**: 캐싱 고려

즉,

> **“언제 필요한가” + “얼마나 자주 바뀌는가”**
> 

를 기준으로 chunk를 나누는 것이 핵심이었습니다.

---

## 11. 결과

- Performance: **56 → 98**
- FCP: **5.8s → 0.4s**
- LCP: **6.4s → 1.2s**

체감 성능과 Lighthouse 지표 모두 개선되었고,

특히 초기 진입 시 화면이 표시되기까지의 대기 시간이 크게 줄었습니다.

---

## 12. App.tsx 코드 스플리팅과 manualChunks의 역할 분리

이 시점에서 역할이 명확해졌습니다.

- **App.tsx (React.lazy)**
    - 언제 로드할지 결정
    - 런타임 기준 분리
- **Rollup manualChunks**
    - 무엇을 묶을지 결정
    - 빌드 타임 기준 분리

이 둘이 결합되면서

- 초기 로딩 시 필요한 코드 최소화
- 라이브러리 캐싱 전략 개선
- Lighthouse FCP / LCP 개선

으로 이어졌습니다.

---

## 마무리

이번 개선 작업을 통해,

번들 최적화는 단순한 설정 튜닝이 아니라

**도구의 역할과 동작 방식을 이해한 뒤 내리는 설계 선택**이라는 점을 다시 한 번 느꼈습니다.

번들 구조를 이해하고 나니 성능 문제를 바라보는 기준 자체가 달라졌고,

어디를 나누고 어디를 유지해야 할지도 보다 명확해졌습니다.

다만 모든 프로젝트에 동일한 전략이 정답은 아니며,

서비스 규모와 특성에 따라 적절한 수준의 분리가 필요하다는 점은 항상 함께 고려해야 할 것 같습니다.