# 📚 Websocket vs. SSE
## 🎯 학습 목표
- 이 내용을 왜 학습했는가?
  - 작성자가 작성하는 문서를 실시간으로 첨삭자가 확인할 수 있는 기술 구현을 위해 최적인 기술을 고민하고자 학습합니다.
- 학습 후 기대 결과:
  - SSE와 Websocket 장단점 및 기술 선택 이유 확정

## 📖 핵심 내용 요약
- 핵심 개념 1: Websocket이란
- 핵심 개념 2: STOMP
- 핵심 개념 3: SSE
- 핵심 개념 4: WebSocket vs. SSE

## ✍️ 상세 정리
### Websocket이란
HTTP의 Stateless, Connectionless한 특징 때문에 양방향 통신을 위해 제안되는 프로토콜
OSI 7계층의 Application Layer에 존재하며, TCP에 의존한다.

#### 웹소켓 연결의 Request와 Response 구조
<img width="635" height="476" alt="image" src="https://github.com/user-attachments/assets/14b7384a-89e8-44d4-8cc9-a98b593660bd" />
출처. Hudi.blog

`Request`
```
GET ws://{주소}:{포트번호}/ HTTP/1.1
Host: {서버 주소}
Connection: Upgrade 
Pragma: no-cache
Cache-Control: no-cache
Upgrade: websocket
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: b6gjhT32u488lpuRwKaOWs==
```
Connection: Upgrade / Upgrade: websocket 값이 없으면 cross-protocol attack이라고 간주하고 Websocket 접속과정을 중지한다.

`Response`
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: rG8wsswmHTJ85lJgAE3M5RTmcCE=
```
HTTP 요청 -> 웹소켓 업그레이드의 과정으로 인해 80번(HTTP), 443(HTTPS) 포트를 그대로 써서 방화벽 문제를 피할 수 있다.


과정
- 웹소켓 업그레이드 Request를 GET 요청으로 보내면, Sec-WebSocket-Key를 같이 보낸다.
- base64로 인코딩된 Key는 handshake 응답을 검증하기 위한 값으로 이루어져 있다.
- 서버로부터 온 Accept 값을 클라이언트에서 검증한 후, Accept되면 handshake를 종료하고 웹소켓을 통해 양방향 데이터 송수신을 한다.

#### Keep-Alive와의 차이
- Request-Response의 형식을 가지므로 서버가 클라이언트가 요청한 응답만 제공할 수 있다.
- Keep-Alive를 통해 연결을 유지하는 방식은 비표준이며, 미래에 호환성 문제가 생길 수 있다.

### HTTP와의 차이
- 웹소켓에서는 초기 연결에 URL이 하나만 존재한다.
  - 이후 모든 어플리케이션 메시지는 동일한 TCP 연결을 통해 전달된다.
- 따라서, 요청 구분을 논리적인 구분을 통해 구현한다.
  - 웹소켓은 저수준 전송 프로토콜로, HTTP와 달리 메시지 내용에 대한 의미를 규정하지 않는다.
  - Websocket 클라이언트와 서버는 HTTP 핸드셰이크 요청의 헤더를 통해 상위 레벨 메시징 프로토콜인 STOMP 사용을 협상할 수 있다.

### WebSocket에서의 데이터 마스킹
WebSocket에서 클라이언트가 서버로 보내는 모든 데이터는 마스킹되어야 한다.
프록시 서버가 WebSocket 프로토콜을 이해하지 못할 때, 마스킹 없이 클라이언트가 웹소켓으로 GET /script.js HTTP/1.1 같은 텍스트를 담아 보내면 중간에 있는 프록시 서버가 이를 새로운 HTTP 요청으로 착각하고 프록시 서버의 캐시를 오염시키거나 요청을 가로채는 공격이 가능해진다. 데이터를 마스킹해서 보내면, 프록시 서버 입장에서 의미를 알 수 없는 바이너리 쓰레기 값으로 보이게 만들어 이런 오해를 원천 차단할 수 있다.

따라서 WebSocket이 Http 표준 스펙이 아니기 때문에 추가적으로 발생되는 오버헤드이며, 서버가 클라이언트가 보낸 메시지를 받을 때마다 모든 바이트에 대해 O(N)의 XOR 연산을 수행하며 이러한 복호화 과정때문에 CPU를 더 사용하게 된다.

### STOMP
Simple Text Oriented Messaging Protocol

TCP, Websocket과 같은 신뢰할 수 있는 양방향 스트리밍 네트워크 프로토콜을 통해 사용 가능

#### 이점
- 사용자 정의 메시징 프로토콜이나 메시지 형식을 따로 고안할 필요가 없다
- Spring Framework의 Java 클라이언틀르 포함하여, 이미 제공되는 STOMP 클라이언트를 사용할 수 있다
- 구독을 관리하고 메시지를 브로드캐스트하기 위해 메시지 브로커를 선택적으로 사용할 수 있다.
- 연결당 하나의 WebsocketHandler로 raw Websocket 메시지를 처리하는 대신, 어플리케이션 로직을 여러 개의 @Controller 인스턴스로 구성하고 STOMP destination 헤더를 기반으로 메시지를 라우팅할 수 있다.

#### 웹소켓의 단점
- 초기 연결시 별도의 프로토콜 업그레이드를 위한 핸드셰이크 과정이 필요하다
- handshake, 프레임 구성, 마스킹, ping pong(연결이 끊긴 것을 확인하기 위해) 프로토콜 규약을 맞춰야 한다.
- 로드밸런서 뒤에서 웹소켓을 사용하려면, HTTP Upgrade 헤더를 인식하도록 별도의 설정 필요
- 웹소켓은 네트워크 종료시 직접 재연결 로직을 작성해야 함, 패킷 유실이나 순서 보장을 위해 어플리케이션 레벨에서 별도의 시쿼스 관리 로직을 짜야함
- SSE가 하나의 TCP 연결로 여러 데이터를 동시에 주고받을 수 있는 반면, 웹소켓은 탭 하나를 열 때마다 새로운 TCP 연결을 맺어야 함
- HTTP 프로토콜이 아니므로 에러 처리 표준을 제공하지 않는다.
- WebSocket에서는 클라이언트가 서버로 보내는 모든 데이터를 마스킹해야 한다. 따라서 서버는 클라이언트가 보낸 메시지를 받을 때마다 모든 바이트에 대해 O(N)의 XOR 연산을 수행해야 한다. SSE는 텍스트를 그대로 읽으면 되지만, WebSocket은 이 복호화 과정으로 인해 CPU 사용량이 더 있다.

## SSE
SSE는 HTTP 스트리밍 방식으로, 서버가 클라이언트에게 지속적으로 데이터를 푸시하는 단방향 통신

클라이언트는 EventSource 객체를 통해 서버에 연결하며, 서버는 text/event-stream MIME 타입으로 데이터를 전송한다.
자동 재연결을 제공한다.


## WebSocket vs.SSE

writer는 키보드 입력이 reviewer에게 전달되어야 하기 때문에 writer 측에서 websocket이라는 기술을 사용한다는 것을 어렵지 않게 선택할 수 있었다. 문제는 reviewer인데, reviewer는 서버로 보낼 데이터가 첨삭 댓글 작성이기 때문에, 어찌보면 단방향 통신인 SSE를 사용하고 댓글 작성은 API로 처리하는 것이 효율적일 수 있다. 
reviewer는 WebSocket, SSE 중 어떤 기술을 사용하는 것이 좋고 어떤 트레이드 오프가 존재할까?

### 성능
[WebSocket과 SSE 성능비교](https://www.timeplus.com/post/websocket-vs-sse)에 따르면 성능은 둘 다 거의 비슷하다고 한다. 단방향 통신은 SSE를 써야한다라고 보통 말을 하던데, 그건 성능보다는 구조적 단순함에 기인한 것으로 보인다.

### 개발 용이성
#### websocket
writer / reviewer 역할 구분 없이 동일한 인프라를 사용한다.
추후 Reviewer가 Writer에게 실시간 데이터 전송을 할 상황이 생길 경우 WebSocket을 사용하면 향후 기능 확장에 유리하다.

#### SSE
HTTP 표준 스펙이기 때문에 별도의 에러처리 및 ping pong을 하지 않아도 된다. 
SSE의 EventSource는 연결이 끊어지면 자동으로 다시 연결된다.
이미 알림을 SSE로 연결하기 때문에 reviewer 측에서 추가적인 websocket 연결 수립을 하지 않고 사용 가능하다.
웹소켓보다 연결 오버헤드가 적다.
HTTP/1.1 환경에서는 브라우저에서 최대 6개의 연결만 허용한다. (HTTP2는 기본으로 100개를 허용한다.)

## 결론
SSE에 비해 비교했을 때, WebSocket의 단점은 구현의 복잡성 및 별도의 에러처리와 ping pong 로직, 재연결 로직을 짜야한다는 문제이다. STOMP를 사용하게 된다면 이러한 단점을 해결할 수 있을 것이라고 생각했다.

또한, writer가 websocket을 사용하고 있기에 동일한 인프라를 사용할 수 있는 장점이 있다고 판단하였고, 추후 확장성에 있어서도 유리한 결정이라고 생각했다. websocket에 비해 SSE가 가지는 명확한 장점이 존재하지 않으므로 구현복잡성이 더 낮을 것이라고 판단되는 websocket으로 writer와 reviewer의 로직을 통일하기로 결정했다.
