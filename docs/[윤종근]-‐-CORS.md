# 📚 [학습 주제] CORS

## 🎯 학습 목표
- 이 내용을 왜 학습했는가? CORS에 대해 팀원이 물어보았는데 쉽게 설명할 방법이 떠오르지 않았다.
- 학습 후 기대 결과: CORS가 무엇인지 남에게 설명할 수 있다.

## 📖 핵심 내용 요약
- 핵심 개념 1: SOP vs CORS
- 핵심 개념 2: 예비 요청 (Preflight Request)
- 핵심 개념 3: 프론트엔드 Proxy 해결책

## ✍️ 상세 정리
### 개념 1 SOP vs CORS
설명: CORS 에러를 마주했을 때 가장 먼저 확인할 것은 `Postman이나 cURL에서는 잘 되는데 왜 브라우저에서만 안 되는가`이다. 브라우저는 기본적으로 동일 출처 정책(SOP)를 따른다. 즉 출처(프로토콜 + 호스트 + 포트)가 다르면 브라우저가 응답을 가린다.

<img width="686" height="424" alt="image" src="https://github.com/user-attachments/assets/03e969ce-a794-497e-a451-267190dc1178" />

하지만 CORS는 서버가 특정 HTTP 헤더를 통해 타 출처의 리소스 접근 차단을 예외적으로 허용하는 표준 메커니즘이다.

### 개념 2 예비 요청(Preflight Request) 메커니즘
설명: 브라우저는 요청의 안전성을 보장하기 위해 특정 조건에서 실제 요청(Actual Request)을 보내기 전 `OPTIONS` 메서드를 사용하여 서버에 사전 질의를 수행한다. 이 사전 질의 과정을 Preflight Request라 한다. 이 과정은 현재 페이지가 다른 출처의 서버에 바로 실제 요청을 보내면 DB에 대한 변경 등을 할 수도 있기 때문에 사전에 차단 여부를 결정해야 해서 필요하다.

### 개념 3 개발 환경의 Proxy 설정
설명: CORS 정책은 브라우저와 서버 간의 통신에만 적용되며 서버 대 서버 통신에는 적용되지 않는다. 프론트엔드 개발 환경(localhost)에서는 이 점을 이용하여 개발 서버(Vite, Webpack 등)가 중계자 역할을 하는 Proxy 기능을 설정하여 CORS를 우회한다. (브라우저 -> 프론트엔드 개발 서버 (Proxy) -> API 서버: CORS 검사 발생 X)

- 예시
  - 프론트엔드: `http://localhost:5173`
  - 백엔드: `https://api.example.com`
  - 브라우저: `fetch('http://api.example.com/users')` -> SOP 위배, CORS 검사 대상 -> 서버가 CORS 헤더 안주면 차단 (Proxy 설정을 통해 CORS 우회)