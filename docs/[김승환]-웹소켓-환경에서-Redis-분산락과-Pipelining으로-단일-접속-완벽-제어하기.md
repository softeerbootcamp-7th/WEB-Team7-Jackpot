# 🤔 [Troubleshooting] 웹소켓 환경에서 Redis 분산락과 Pipelining으로 단일 접속 완벽 제어하기

## 📌 고민의 시작: 1:1 매칭 구조를 어떻게 강제할 것인가?

Narratix 서비스의 실시간 첨삭 기능은 **하나의 자기소개서에 단 한 명의 작성자(Writer)와 단 한 명의 첨삭자(Reviewer)만 접속**할 수 있는 정책을 가지고 있습니다. 그 이상의 인원이 동시에 접속하여 데이터를 수정하는 것을 원천적으로 차단해야 했기 때문에, 다중 서버 환경에서도 원자적인 동시성 제어가 가능한 **Redis 분산락(Distributed Lock)**을 도입하기로 결정했습니다.

락의 구조는 직관적으로 설계했습니다.
- **Lock Key:** `share-link:lock:{첨삭 링크 ID}:{Role}`
- **Lock Value:** 접속한 유저를 식별하기 위한 값

하지만 이 단순해 보이는 락 구조를 웹소켓 환경에 적용하면서 연쇄적인 문제들을 마주하게 되었습니다.

## 🚧 첫 번째 난관: Lock Value의 딜레마 (`userId` vs `sessionId`)

처음에는 Lock의 Value로 `userId`를 사용했습니다. 첨삭 도중 클라이언트가 리뷰에 대한 CRUD API를 호출할 때, "현재 락을 쥐고 있는(웹소켓에 정상 접속 중인) 유저가 맞는지"를 검증하려면 `userId`가 필요했기 때문입니다.

하지만 **웹소켓 연결 종료(Disconnect) 시점**이 발목을 잡았습니다.

유저가 브라우저를 닫아 웹소켓 연결이 끊어지면, 서버는 `SessionDisconnectEvent`를 받아 즉시 Redis 락을 해제해야 합니다. 그러나 이 이벤트 객체가 항상 유저의 식별자(`userId`)를 온전히 가지고 있다고 보장하기 어려웠습니다. 이벤트가 확실하게 보장하는 식별자는 오직 웹소켓의 **`sessionId`** 뿐이었습니다.

결국 락을 안전하게 해제하기 위해 **Lock Value를 `sessionId`로 변경**해야만 했습니다.

### 💡 해결책: `ShareLinkSessionRegistry` 도입

Value가 `sessionId`로 바뀌면서, 역으로 API 호출 시 `userId`를 통한 락 소유권 검증이 불가능해지는 딜레마에 빠졌습니다.
이를 해결하기 위해 애플리케이션 메모리 단에 `ShareLinkSessionRegistry`라는 세션 관리 객체를 구현했습니다.

- `lockKey` $\rightarrow$ `sessionId` 매핑
- `sessionId` $\rightarrow$ `SessionEntry(lockKey, userId)` 매핑

이제 API 요청이 들어오면, 
1. 첨삭 링크 ID와 Role을 조합해 Lock Key 유추
2. Registry 조회

이를 통해 해당 Lock을 쥐고 있는 `sessionId`와 `userId`를 $O(1)$ 로 교차 검증할 수 있게 되었습니다.

## 🚧 두 번째 난관: 좀비 락(Zombie Lock)과 TTL 갱신 문제

락 구조를 잡고 나니 다음은 **만료 시간(TTL)** 이 문제였습니다.

처음에는 넉넉하게 TTL을 1시간으로 잡았습니다. 하지만 웹소켓이 비정상적으로 종료되어 서버가 Disconnect 이벤트를 받지 못할 경우, 최대 1시간 동안 다른 유저가 접속하지 못하는 **좀비 락** 문제가 발생했습니다.

반대로 TTL을 짧게(예: 10초) 설정하면 유저가 첨삭을 하고 있는 도중에 락이 풀려버리는 아찔한 상황이 발생합니다. 결국 **"TTL을 짧게 유지하되, 연결이 살아있다면 주기적으로 Heartbeat를 보내 TTL을 갱신(Renew)하는 방식"**이 최선이었습니다.

그러나 Spring WebSocket이 기본 제공하는 Heartbeat 메커니즘에는 커스텀 콜백을 붙여 Redis 락을 갱신하는 로직을 추가하기가 까다로웠습니다.

## ✨ 최종 아키텍처: Scheduler + Lua Script + Pipelining

결국 서버 측에 별도의 스케줄러를 두어, 앞서 만든 `ShareLinkSessionRegistry`에 등록된 활성 세션들을 대상으로 주기적으로 락의 TTL을 갱신하도록 아키텍처를 구성했습니다.

이 과정에서 **동시성 문제**와 **네트워크 성능 문제**를 해결하기 위해 두 가지 핵심 기술을 적용했습니다.

### 1. 동시성 제어: Lua Script를 통한 원자적(Atomic) 실행

TTL을 갱신하려면 "현재 Redis에 저장된 sessionId가 내 sessionId와 일치하는가?(소유권 확인)" $\rightarrow$ "일치한다면 TTL을 연장한다"는 두 단계의 과정을 거쳐야 합니다. 이 두 명령어가 쪼개져서 실행되면, 그 찰나의 순간에 락을 탈취당하는 동시성 이슈가 발생할 수 있습니다.

따라서 이 두 과정을 단일 명령어로 원자성 있게 처리하도록 **Lua Script**를 작성했습니다.

### 2. 성능 최적화: Redis Pipelining

만약 현재 접속 중인 세션이 100개라면, 스케줄러가 돌 때마다 Redis와 100번의 네트워크 통신(RTT)이 발생하게 됩니다. 이는 심각한 오버헤드입니다.

이를 해결하기 위해 **Redis Pipelining**을 활용하여 100개의 Lua Script 실행 명령을 하나의 파이프라인에 담아 단 한 번의 네트워크 I/O로 일괄 처리하도록 구현했습니다.

```java
// 내 락인 경우에만 원자적으로 TTL을 갱신하는 Lua Script
// KEYS[1]: lockKey, 
// ARGV[1]: sessionId, ARGV[2]: timeout
private static final byte[] RENEW_SCRIPT_BYTES = """
    if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('expire', KEYS[1], ARGV[2])
    else
        return 0
    end
    """.getBytes(StandardCharsets.UTF_8);


/**
 * 모든 활성 세션의 분산락 TTL 갱신 (예: 4초마다 호출)
 * Pipeline + Lua Script로 단일 네트워크 I/O에 소유권 검증 후 TTL 갱신
 */
public void renewAllLocks() {
    if (sessionRegistry.isEmpty()) return;

    // 1. 순서 보존을 위해 현재 인메모리 세션 엔트리의 스냅샷(List) 생성
    List<Map.Entry<String, ShareLinkSessionRegistry.SessionEntry>> entries = sessionRegistry.getAllEntries();

    // 2. Redis Pipelining을 통한 일괄 처리
    List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
        for (Map.Entry<String, ShareLinkSessionRegistry.SessionEntry> entry : entries) {
            connection.scriptingCommands().eval(
                    RENEW_SCRIPT_BYTES,
                    ReturnType.INTEGER,
                    1, // KEYS 배열의 크기 (이후 인자 중 첫 번째가 KEYS[1], 나머지는 ARGV로 매핑)
                    entry.getValue().lockKey().getBytes(StandardCharsets.UTF_8), 
                    entry.getKey().getBytes(StandardCharsets.UTF_8),              
                    LOCK_TIMEOUT_BYTES                                            
            );
        }
        return null; // 파이프라인 내에서는 null을 반환해야 함
    });

    // 3. 실행 결과 매핑 및 갱신 실패 세션(좀비 세션) 정리
    for (int i = 0; i < entries.size(); i++) {
        Long result = (Long) results.get(i);
        if (result == null || result == 0L) {
            // Lua Script에서 0을 반환 = 내 세션이 락을 잃었거나 만료됨
            Map.Entry<String, ShareLinkSessionRegistry.SessionEntry> entry = entries.get(i);
            sessionRegistry.cleanUp(entry.getKey(), entry.getValue());
            log.warn("Lock renewal failed, cleaned up in-memory state: sessionId={}, lockKey={}", 
                     entry.getKey(), entry.getValue().lockKey());
        }
    }
    
    log.debug("Lock TTLs renewed for {} sessions via pipeline", entries.size());
}
```

> **💡 List 스냅샷을 뜨는 이유?**
> 
> Redis Pipelining의 응답은 실행했던 명령어의 순서대로 `List<Object>` 형태로 반환됩니다. 요청을 보낸 세션 객체들(`entries`)을 List로 스냅샷 떠두면, 응답 리스트의 인덱스(`i`)와 1:1로 매칭시켜 **어떤 세션의 갱신이 실패했는지 정확히 파악하여 인메모리 찌꺼기를 안전하게 정리(`cleanUp`)할 수 있습니다.**

## 🎯 결론

이로써 서버를 신뢰할 수 있는 단일 주체로 삼아, 다중 유저 접속 환경에서도 네트워크 지연 시간(Latency)의 낭비 없이 완벽하게 단일 접속(1 Writer, 1 Reviewer)을 제어할 수 있는 견고한 동시성 제어 아키텍처를 완성할 수 있었습니다. 분산 환경에서 상태를 관리하는 것이 얼마나 까다롭고 많은 고민을 요구하는지 다시 한번 배울 수 있는 좋은 경험이었습니다.