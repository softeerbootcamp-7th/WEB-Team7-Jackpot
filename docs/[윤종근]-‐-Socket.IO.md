# 📚 [학습 주제] Socket.IO

## 🎯 학습 목표
- 이 내용을 왜 학습했는가? Socket.IO를 프로젝트에 적용해야 할지 말아야 할지를 결정하기 위해 학습했다.
- 학습 후 기대 결과: Socket.IO를 적용했을 때 장점과 단점을 분석하고 최종 결정을 할 수 있다.

## 📖 핵심 내용 요약
- 핵심 개념 1: 신뢰성 있는 양방향 통신
- 핵심 개념 2: 이벤트 기반 아키텍처
- 핵심 개념 3: 네임스페이스와 룸

## ✍️ 상세 정리
### 개념 1: 신뢰성 있는 양방향 통신
설명: Socket.IO의 가장 큰 특징은 연결의 신뢰성이다. 모든 브라우저나 프록시가 WebSocket을 지원하지 않을 수 있기 때문에 우선적으로 HTTP Long-polling 방식으로 연결을 시도한다. 그 후 환경(기업 프록시, 방화벽, 브라우저 버전 등)이 허락한다면 자동으로 더 성능이 좋은 WebSocket으로 연결을 업그레이드한다. 이를 통해 방화벽이나 구형 브라우저 환경에서도 끊김 없는 실시간 통신을 보장한다.

### 개념 2: 이벤트 기반 통신
설명: 순수 WebSocket은 문자열이나 바이너리 데이터만 전송할 수 있어서 메시지의 유형을 파악하려면 내부 내용을 파싱해야하는 번거로움이 있다. 반면, Socket.IO는 이벤트명과 데이터를 분리하여 처리한다.

- `emit('이벤트명', 데이터)`: 이벤트를 발송(송신)한다.
- `on('이벤트명', 콜백함수)`: 특정 이벤트를 수신하고 로직을 처리한다. 또한 JSON 객체를 직렬화할 필요 없이 그대로 전송할 수 있어 개발 편의성이 높다.

```Javascript
// ws 라이브러리도 사용하지 않는 Websocket 구현 예시
const http = require('http');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket Server is running');
});

// HTTP Upgrade 요청 처리 (핸드셰이크)
server.on('upgrade', (req, socket, head) => {
  // 클라이언트가 보낸 키 확인
  const clientKey = req.headers['sec-websocket-key'];
  
  // RFC 6455 규격에 따른 매직 스트링 결합 및 해싱
  const MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const acceptKey = crypto
    .createHash('sha1')
    .update(clientKey + MAGIC_STRING)
    .digest('base64');

  // 응답 헤더 작성 (HTTP -> WebSocket 프로토콜 전환 승인)
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '\r\n'
  ];

  // 소켓에 헤더 전송
  socket.write(headers.join('\r\n'));

  // 데이터 수신 및 파싱 (바이너리 데이터 처리)
  socket.on('data', (buffer) => {
    // 첫 번째 바이트 분석 (Fin bit, Opcode 등)
    // 예: 1000 0001 (0x81) -> Fin: true, Opcode: 1 (Text)
    const firstByte = buffer.readUInt8(0);
    const opcode = firstByte & 0x0f; 

    // 클라이언트 메시지가 닫기 요청(Opcode 8)인 경우
    if (opcode === 8) {
        socket.end();
        return;
    }

    // 두 번째 바이트 분석 (Mask bit, Payload Length)
    const secondByte = buffer.readUInt8(1);
    const isMasked = Boolean((secondByte >>> 7) & 0x1);
    let payloadLength = secondByte & 0x7F;

    // 간소화를 위해 payloadLength가 125 이하인 경우만 처리하는 예시
    // (실제로는 126, 127일 때 추가 바이트를 읽어 길이를 계산하는 복잡한 로직 필요)
    
    // 헤더 이후 데이터 시작 위치
    let currentOffset = 2;
    let requestData = '';

    if (isMasked) {
      // 마스킹 키 (4바이트) 추출
      const maskingKey = buffer.slice(currentOffset, currentOffset + 4);
      currentOffset += 4;
      
      // 데이터 페이로드 추출 및 언마스킹 (XOR 연산)
      const payload = buffer.slice(currentOffset, currentOffset + payloadLength);
      const result = Buffer.alloc(payloadLength);
      
      for (let i = 0; i < payloadLength; ++i) {
        // 복호화 로직: 데이터 byte ^ 마스킹 키 byte
        result[i] = payload[i] ^ maskingKey[i % 4];
      }
      requestData = result.toString('utf8');
    }

    console.log('받은 메시지(해독됨):', requestData); // {"user":"User1"...}

    // 여기서 다시 JSON.parse() 등을 수행해야 함
  });
});

server.listen(8080, () => {
  console.log('Native WebSocket Server running on port 8080');
});
```

```Javascript
// Socket.IO를 활용한 구현 예시
// [Client] 클라이언트에서 서버로 메시지 전송
// 버튼 클릭 시 'chat message'라는 이벤트 이름으로 객체 전송
function sendMessage() {
  const messageData = { user: "Yoon", text: "안녕하세요!" };
  socket.emit('chat message', messageData); 
}

// [Server] 서버에서 해당 이벤트 수신
io.on('connection', (socket) => {
  // 'chat message' 이벤트를 기다림
  socket.on('chat message', (msg) => {
    console.log('받은 메시지:', msg); 
    // 출력: { user: "Yoon", text: "안녕하세요!" }
    
    // 받은 메시지를 보낸 사람을 포함한 '모든' 클라이언트에게 재전송 (브로드캐스트)
    io.emit('chat message', msg);
  });
});
```

### 개념 3: 네임스페이스와 룸 (Namespaces & Rooms)
설명: 하나의 서버에서 여러 종류의 실시간 서비스(채팅, 알림, 관리자 대시보드)를 운영하거나 특정 그룹(단톡방)에게만 메시지를 보내야 할 때 사용한다.

- 네임스페이스 (Namespace): 엔드포인트(URL)를 나누는 개념이다. (`/chat`, `/news`) 클라이언트는 특정 네임스페이스에만 연결할 수 있으며 리소스를 논리적으로 분리한다.
- 룸 (Room): 네임스페이스 안의 하위 채널이다. 서버 측에서만 관리되는 개념으로 소켓을 특정 방에 `join` 시키거나 `leave` 시킬 수 있다. 이를 통해 방에 있는 사람들에게만 메시지를 보내는 브로드캐스팅이 가능하다.

```Javascript
// [Server] 네임스페이스 기능 활용 예시
const { Server } = require("socket.io");
const io = new Server(3000);

// 일반 고객용 채팅 네임스페이스 ('/customer-chat')
const customerParams = io.of('/customer-chat');

customerParams.on('connection', (socket) => {
  console.log('고객이 채팅방에 접속함:', socket.id);

  socket.on('msg', (data) => {
    // 이 메시지는 '/customer-chat'에 접속한 사람들에게만 전송됨
    customerParams.emit('msg', `고객 문의: ${data}`);
  });
});

// 관리자 전용 네임스페이스 ('/admin-alert')
const adminParams = io.of('/admin-alert');

adminParams.on('connection', (socket) => {
  console.log('관리자가 접속함:', socket.id);
  
  // 인증 미들웨어 등을 여기에만 따로 적용 가능
  
  socket.on('order', (data) => {
    // 이 알림은 관리자들에게만 전송됨 (고객은 못 봄)
    adminParams.emit('new_order', '새로운 주문이 들어왔습니다!');
  });
});
```

```Javascript
// [Client] 네임스페이스 기능 활용 예시
// 일반 고객 페이지에서 접속 시 도메인 뒤에 네임스페이스 경로를 명시
const customerSocket = io('http://localhost:3000/customer-chat');

customerSocket.on('connect', () => {
  console.log('상담 채팅 서버 연결 성공');
  customerSocket.emit('msg', '배송 언제 되나요?');
});

// 고객 소켓은 관리자 채널의 소식을 들을 수 없음
customerSocket.on('new_order', () => {
  // 절대 실행되지 않음
});


// 관리자 대시보드 페이지에서 접속 시
const adminSocket = io('http://localhost:3000/admin-alert');

adminSocket.on('new_order', (msg) => {
  // "새로운 주문이 들어왔습니다!" 출력
  console.log('관리자 알림:', msg);
});
```

```Javascript
// [Server] 룸 기능 활용 예시

io.on('connection', (socket) => {
  
  // 특정 방(Room)에 입장
  socket.on('join room', (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id}님이 ${roomName}방에 입장했습니다.`);
    
    // 해당 방에 있는 다른 사람들에게만 알림 전송
    socket.to(roomName).emit('notice', '새로운 유저가 입장했습니다.');
  });

  // 특정 방에만 메시지 전송
  socket.on('send to room', (data) => {
    // data = { room: 'study-group', msg: '공부합시다' }
    
    // 'study-group' 방에 있는 모든 소켓(나 포함 혹은 제외 가능)에게 전송
    io.to(data.room).emit('new message', data.msg);
  });
});
```