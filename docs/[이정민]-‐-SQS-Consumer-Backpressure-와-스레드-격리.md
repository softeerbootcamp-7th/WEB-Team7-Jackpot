### 1. 배경

- **아키텍처**: AWS Lambda(PDF 텍스트 추출) → Amazon SQS → Spring Boot Server(@SqsListener).
- 메세지 유형 별 수행할 작업
    - **성공 메시지**: 텍스트 내용을 바탕으로 AI 라벨링 수행 (**High Latency, CPU/Memory Intensive**).
    - **실패 메시지**: DB 상태만 `FAILED`로 업데이트 (**Low Latency**).
- **요구 사항**:
    - AI 라벨링 작업은 오랜 시간이 걸리기에 서버가 감당 가능한 수준으로만 메시지를 처리해야 함.
    - 처리 속도가 느려지면 SQS에서 메시지 수신을 잠시 중단하거나 늦춰야한다.

***


### 2. BackPressure 란 ?

소비자(Consumer)가 처리할 수 있는 양보다 생산자(Producer)의 데이터 속도가 빠를 때, 소비자가 생산자에게 '속도 좀 줄여줘'라고 피드백을 보내는 매커니즘 → 흐름 제어 기법

SQS 기반 구조에서는 Producer(Lambda)의 속도를 직접 줄이기 어렵기 때문에, Consumer(Spring 서버)가  **수신량을 스스로 제한**해야 한다.

**2.1. maxConcurrentMessages**

`SqsMessageListenerContainerFactory`에서 다음 설정을 통해

**동시에 처리할 메시지 개수를 제한**할 수 있다.

- `maxConcurrentMessages = N`

이 값이 작으면:

- 동시에 처리되는 메시지 수가 제한되고
- 그 이상 메시지는 SQS에 남아 있다가
- consumer가 여유가 생겼을 때 다시 poll 된다.


**2.2. maxMessagesPerPoll**

SQS는 poll 할 때 한 번에 여러 개 메시지를 가져올 수 있다.

maxConcourrentMessage 보다 maxMessagesPerPoll 이 크다면 처리 중이 아닌 메세지들은 우리 서버 내부에서 대기하게 된다. 


***

### 3. ThreadPoolTaskExecutor

`maxConcurrentMessages`만으로도 BackPressure는 어느 정도 가능하다고 생각했지만, 아래의 이유들로 인해 `ThreadPoolTaskExecutor`를 같이 사용했다. 

**3.1. BackPressure를 더 명확하게 제어 가능**

ThreadPoolTaskExecutor는 다음을 명확히 통제할 수 있다.

- 최대 동시 작업 수
- 작업 대기 큐 크기(queueCapacity)
- 큐가 꽉 찼을 때 동작(rejection policy)

**3.2. 스레드 풀 격리**

AI 라벨링은 무거운 작업이므로, 이를 별도 스레드 풀로 분리하면 다음 효과가 있다.

- 라벨링 작업이 느려져도 다른 thread pool은 보호됨
- 라벨링이 CPU를 점유해도 polling/ack 흐름이 덜 영향을 받음
- 장애 시 영향 범위를 분리할 수 있음


***

### 4. 구현

 SqsConfig로 다음 설정을 구현하였다.

설정 항목 | 값 | 근거
-- | -- | --
Pool Size (Core/Max) | 3 | job의 단위가 최대 file 3개라서 설정한 값으로 ai 라벨링 테스트 후 적절한 값인지 검증이 필요하다.
Queue Capacity | 0 | 처리하지 못할 메시지를 서버 메모리에 쌓아두지 않는다. 대기열은 SQS가 담당하게 한다.
maxConcurrentMessages | 3 | Backpressure Trigger. 현재 처리 중인 메시지가 3개가 되면 리스너가 SQS Polling을 멈춤.
AbortPolicy | Abort | Fail Fast. 논리적으로 maxConcurrentMessages에 의해 차단되지만, 만약 이를 뚫고 스레드 풀에 진입하려 할 경우 예외를 발생시켜 시스템 이상을 즉시 감지함.
pollTimeout | 20 | Long Polling 적용


<!-- notionvc: 66ca778a-c1b8-426a-80d5-29233fe5a312 -->


***
