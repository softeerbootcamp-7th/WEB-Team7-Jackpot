## 1. @SqsListener 내부 동작 원리

스프링 부트 애플리케이션이 실행되면 `SimpleMessageListenerContainer`가 백그라운드 스레드를 생성하여 무한 루프를 통해 SQS 서버를 폴링(Polling)한다.

실제 스프링 내부에서는 스레드 풀(TaskExecutor)을 사용하여 비동기로 동작하지만, 논리적인 흐름은 아래와 같다.
``` java
// 애플리케이션 실행 중 계속 반복 (Daemon Thread)
while (applicationIsRunning) {
    try {
        // 1. AWS SQS에 메시지 요청 (Long Polling 설정 적용)
        // -> 메시지가 없으면 설정된 시간(예: 20초)만큼 응답을 대기하며 Block 됨
        ReceiveMessageRequest request = new ReceiveMessageRequest()
                .withWaitTimeSeconds(20); // 롱 폴링 
        
        List<Message> messages = sqsClient.receiveMessage(request).getMessages();

        if (!messages.isEmpty()) {
            // 2. 메시지 수신 시 @SqsListener 메서드(Consumer) 실행
            for (Message message : messages) {
                processMessage(message);
            }
            // 3. 처리 성공 시 SQS에서 메시지 삭제 (Acknowledge)
            deleteMessage(message);
        }
    } catch (Exception e) {
        // 에러 핸들링 및 재시도 로직
    }
}
```

## 2. 무한루프가 괜찮나..? (Long Polling)

`while(true)` 형태의 무한 루프가 돌기 때문에 CPU 사용량이 너무 많지 않나라는 의문이 들었다. 그러나 **Long Polling** 방식을 사용하므로 문제가 없었다. 

구분 | Short Polling | Long Polling 
-- | -- | --
동작 방식 | SQS에 요청 즉시 응답을 받음. (메시지 없으면 바로 빈 응답) | SQS에 요청 후, 메시지가 없으면 최대 20초간 연결을 유지하며 대기.
네트워크 | 1초에도 수십 번 요청/응답 발생 (오버헤드 큼) | 메시지가 없을 경우 20초에 1번만 통신 발생.
스레드 상태 | Busy Waiting (계속 일함) | Blocking (I/O Wait)
리소스 | CPU 및 네트워크 대역폭 낭비 심함 | CPU 사용량 거의 0% (대기 상태)


### 왜 CPU를 안 쓰는가? (Blocking I/O)

- **Blocking 상태:** `sqsClient.receiveMessage()`를 호출하면, AWS 서버가 응답을 줄 때까지 해당 스레드는 **WAIT(I/O Blocking)** 상태가 된다.
- **OS의 처리:** 운영체제(OS)는 I/O 작업을 기다리는 스레드를 스케줄링에서 제외하고 재운다(Sleep). 즉, CPU 사이클을 소모하지 않고 단순히 네트워크 패킷이 오기만을 기다리는 상태다.
- **결론:** 무한 루프가 돌고 있지만, 실제로는 대부분의 시간을 **"AWS의 응답을 기다리며 자는 상태"**로 보내기 때문에 애플리케이션 부하가 극히 적다.

## 3. 요약

1. **동작:** `@SqsListener`는 내부적으로 루프를 돌며 SQS에 폴링을 수행한다.
2. **효율:** `WaitTimeSeconds`(보통 20초) 설정을 통한 **Long Polling**을 사용한다.
3. **리소스:** 메시지가 없을 때 스레드는 **Blocking** 상태가 되어 CPU를 거의 사용하지 않으므로, 무한 루프에 의한 성능 저하 걱정은 하지 않아도 된다.


