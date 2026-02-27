# [Troubleshooting] WebSocket과 달리, SSE에서는 onCompletion이 왜 바로 호출되지 않았을까?

## 1. 문제의 발단: 새로고침 시 발생하는 500 에러

현재 개발 중인 Narratix 서비스에서는 서버 리소스 보호를 위해 유저당 SSE(Server-Sent Events) 연결을 최대 5개로 제한하는 로직이 적용되어 있습니다. 제한을 초과하면 `SHARE_LINK_ACCESS_LIMIT_EXCEEDED` (400 Bad Request) 에러를 반환하도록 설계했습니다.

그런데 클라이언트에서 브라우저 새로고침을 할 때마다 500 에러가 발생하는 이슈가 발생했습니다.

로그를 확인해 보니 원인은 의외로 간단했습니다. 새로고침으로 인해 순간적으로 연결 제한(5개)을 초과하여 커스텀 에러가 발생했는데, 이를 처리하는 `GlobalExceptionHandler`가 에러 응답을 `application/json` 형태로 내려주려 했기 때문입니다. SSE 통신을 위해 `text/event-stream`을 기대하고 있는 클라이언트와 미디어 타입이 맞지 않아 `HttpMediaTypeNotAcceptableException`이 발생하며 500 에러로 번진 것이죠.

이를 해결하기 위해 SSE 관련 예외를 처리하는 전용 Exception Handler를 추가하여, SSE 규격에 맞는 포맷으로 에러를 반환하도록 수정했습니다.

```java
@ExceptionHandler(SseException.class)  
protected ResponseEntity<String> handleSseException(SseException e) {  
    ErrorCode errorCode = e.getErrorCode();  
    log.warn("SSE connection error: {}", errorCode.getMessage());  
  
    return ResponseEntity  
            .status(errorCode.getStatus())  
            .contentType(MediaType.TEXT_EVENT_STREAM)  
            .body(SSE_ERROR_EVENT_PREFIX + errorCode.getMessage() + SSE_EVENT_SUFFIX);
}
```

## 2. 500 에러는 잡았지만, 진짜 문제는 지금부터
위의 조치로 새로고침 시 500 에러 대신 의도했던 400 에러가 정상적으로 반환되었습니다.

처음에는 이 현상이 단순한 동시성 문제라고 생각했습니다. 클라이언트가 기존 연결을 끊고 새로고침을 통해 새 연결을 맺는 과정에서, 서버의 `onCompletion` 콜백(종료 처리)이 미세하게 늦게 동작하여 순간적으로 연결 초과 에러가 발생한 것이라 여겼습니다. 클라이언트 측에 3초 후 재시도 로직이 있었기 때문에, 3초 뒤면 서버에서도 이전 연결이 정리되어 정상 복구될 것이라 예상했습니다.

**하지만 재연결은 3초 만에 이루어지지 않았고, 무려 20초 이상이 걸렸습니다.**

"왜 SSE 연결 종료 콜백은 이렇게 늦게 호출되는 걸까?"라는 의문이 생겼습니다. 웹소켓(WebSocket)의 경우 클라이언트가 연결을 끊으면 즉시 `SessionDisconnectEvent`를 발생시켜 `EventListener`가 자원을 곧바로 정리해주었었기 때문입니다. WebSocket이 이를 지원하는데, SSE도 이러한 로직을 지원할 것이라고 생각했습니다.

## 3. 패킷은 거짓말을 하지 않는다 (`tcpdump` 분석)

네트워크 단에서 실제로 종료 신호가 오고 있는지 확인하기 위해 서버 8080 포트의 TCP 패킷을 캡처해 보았습니다.
```bash
tcpdump -i any -nn tcp port 8080
```

> **참고:**
> - `-i any` : 모든 네트워크 인터페이스에서 캡쳐
> - `-nn` : IP를 DNS로, 포트를 서비스 이름으로 변환하지 않음 (순수 포트/IP 확인용)

확인 결과, 클라이언트가 새로고침을 하여 브라우저 연결이 끊어지는 순간, 운영체제(OS)의 네트워크 스택을 통해 서버로 **TCP RST(Reset) 패킷이 명확하게 도착**하는 것을 확인할 수 있었습니다.

패킷이 정상적으로 도착했다면, Spring은 왜 웹소켓처럼 연결 종료를 즉각적으로 알아채지 못한 걸까요?

## 4. 왜 SSE는 RST 패킷을 즉시 감지하지 못할까?

이 문제의 핵심은 **웹소켓과 SSE의 통신 방식 차이**, 그리고 서블릿 컨테이너(Tomcat)의 동작 구조에 있었습니다.
웹소켓은 양방향 통신이 지속적으로 유지되며 소켓 레벨의 제어가 가능해 단절을 즉시 핸들러로 전달합니다. 반면, **SSE는 단방향(서버 → 클라이언트)으로 길게 열어둔 HTTP 응답에 불과합니다.**

Spring 서버가 클라이언트의 연결 종료를 즉각 알아채지 못하는 이유는 다음과 같습니다.
### ① '읽기(Read)'와 '쓰기(Write)' 상태의 차이
서버가 클라이언트의 요청을 읽고 있는(Read) 상태라면, RST 패킷 도착 시 서블릿 컨테이너가 즉시 `EOF`나 `SocketException`을 감지합니다. 하지만 SSE는 요청을 이미 다 읽고, 언제든 데이터를 보내기 위해 응답 스트림(OutputStream)을 열어두고 대기(Idle)하는 상태입니다.

### ② 서블릿 컨테이너의 수동적인 예외 전파
Tomcat 등의 컨테이너는 OS로부터 RST 신호를 받아 소켓이 닫혔다는 것을 알고 있습니다. 하지만 이 요청은 비동기 상태로 '쓰기 대기' 중이므로, Tomcat이 굳이 Spring 애플리케이션에게 이 사실을 먼저 알려주지 않습니다.

Spring 서버가 끊어진 클라이언트에게 `SseEmitter.send()`를 호출하여 새로운 데이터를 쓰려고(Write) 시도할 때 비로소 `ClientAbortException`이나 `IOException`이 발생합니다. 이 예외가 터져야 비로소 비동기 컨텍스트가 에러 상태로 종료되며 `onError` → `onCompletion` 콜백이 순차적으로 실행되는 것입니다.

_(추가로, 실무 환경처럼 Nginx나 ALB 같은 리버스 프록시가 앞에 있다면 클라이언트의 RST 패킷은 프록시까지만 도달하므로 Spring 서버는 연결 단절을 알기가 더욱 힘들어집니다.)_

## 5. 해결책: 적극적인 Heartbeat와 점진적 재시도(Exponential Backoff)

결론적으로, SSE 구조상 서버가 '쓰기(Write)' 작업을 시도하지 않는 이상 끊어진 연결(Dead Connection)을 즉각 찾아낼 방법이 없었습니다.
따라서 다음과 같이 아키텍처를 개선했습니다.

1. **Heartbeat 주기 단축 (서버 측)**
    - 기존 25초였던 더미 데이터(Heart beat) 전송 주기를 **4초**로 대폭 줄였습니다.
    - 이를 통해 연결이 끊긴 후 최대 4초 안에는 서버가 `send()`를 시도하다 예외를 뱉게 되어, 죽은 연결을 신속하게 정리(`onCompletion` 호출)할 수 있게 되었습니다.
        
2. **지수 백오프(Exponential Backoff) 적용 (클라이언트 측)**
    - 클라이언트의 재시도 주기를 고정 3초에서 **2초, 4초, 8초, 16초 단위로 늘려가며 요청**하도록 변경했습니다.
    - 이렇게 하면 서버가 4초 안에 Heartbeat를 통해 끊어진 세션을 정리할 수 있는 충분한 시간을 확보하게 되며, 무의미한 400 에러 폭주를 방지할 수 있습니다.

결과적으로 살아있는 유효한 연결 5개만 안정적으로 유지하면서, 새로고침 시 발생하는 연결 지연 및 에러 문제를 성공적으로 해결할 수 있었습니다.