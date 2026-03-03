# 🤔 [Troubleshooting] 웹소켓 다중 서버 환경에서 Redis 분산락과 Pipelining으로 단일 접속 제어하기

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

Value가 `sessionId`로 바뀌면서 API 호출 시 유저 검증이 불가능해진 딜레마를 해결하기 위해, Redis에 `sessionId`와 `userId`를 매핑하는 구조를 고안했습니다.

이제 API 요청이 들어오면,
1. 첨삭 링크 ID와 Role을 조합해 Lock Key 유추
2. Redis에서 Lock Key로 sessionId 조회
3. Redis에서 sessionId로 userId 조회

이를 통해 해당 Lock을 쥐고 있는 `sessionId`와 `userId`를 $O(1)$ 로 검증할 수 있게 되었습니다.

또한, 이 매핑 정보를 특정 WAS의 로컬 메모리가 아닌 Redis에 저장했으므로, **A 서버에 접속한 유저의 상태를 B 서버에서도 즉시 알 수 있게 되었습니다.** 서버가 몇 대로 늘어나는 Scale-out 환경에서도 Redis를 중앙 저장소로 삼아 동일한 정합성을 보장할 수 있게 된 것입니다.

## 🚧 두 번째 난관: 좀비 락(Zombie Lock)과 락 생명주기 관리

락 구조를 잡고 나니 다음은 **만료 시간(TTL)** 이 문제였습니다.

초기에는 넉넉하게 TTL을 1시간으로 잡고 `SessionDisconnectEvent`을 받았을 때, 락을 해제하도록 구현했습니다. 하지만 클라이언트의 네트워크 단절 등으로 서버가 `SessionDisconnectEvent`를 받지 못할 경우, 최대 1시간 동안 다른 유저가 접속하지 못하는 **좀비 락** 문제가 발생했습니다.

그렇다고 TTL을 10초로 짧게 설정하면, 유저가 첨삭을 하고 있는 도중에 락이 풀려버리는 상황이 발생합니다. 결국 **"TTL을 짧게 유지하되, 서버가 활성 세션의 TTL을 주기적으로 연장해 주는 스케줄러 방식"** 을 도입했습니다.

하지만 여기서 더 치명적인 엣지 케이스를 만났습니다. 네트워크 단절로 `SessionDisconnectEvent`가 유실되면, 인메모리(`ShareLinkSessionRegistry`)에는 세션이 그대로 남아있게 됩니다. 결과적으로 스케줄러는 **이미 떠난 유저의 락 TTL을 무한정 연장해버리는 좀비 락**을 만들어내고 있었습니다.

### 💡 해결책: Heartbeat 기반의 Client 접속 시간(`lastActiveTime`) 추적

이 문제를 근본적으로 해결하려면 스케줄러가 **현재 진짜 살아있는 클라이언트**인지 식별할 수 있어야 했습니다. 따라서, 웹소켓 연결 시 로컬 메모리에 `SessionEntry(lockKey, userId, lastActiveTime)`를 저장하고, Spring WebSocket의 `ChannelInterceptor`를 활용하여 클라이언트가 STOMP 메시지나 하트비트를 보낼 때마다 `lastActiveTime`을 최신화하도록 구현했습니다.

```java
// StompChannelInterceptor.java 의 preSend 내부 로직 
if (accessor.getSessionId() != null) { 
	shareLinkService.updateActivity(accessor.getSessionId()); // lastActiveTime 갱신 
}
```

이제 스케줄러는 맹목적으로 TTL을 연장하지 않습니다. 클라이언트가 특정 시간동안 하트비트를 보내지 않는다면 "비정상 종료되었다"고 판단하여 로컬 메모리에서 세션을 삭제합니다. 스케줄러의 갱신이 멈추면 Redis의 락은 자연스럽게 TTL 만료로 소멸하므로, 이벤트 누락으로 인한 좀비 락 문제를 원천 차단할 수 있었습니다.

## 🚧 세 번째 난관: Redis I/O 부하와 스로틀링 최적화
좀비 락을 막았지만, 인프라 관점의 문제가 남아있었습니다. 기존에는 Lock TTL이 10초로 짧았기에 스케줄러도 매우 짧은 주기(4초)로 돌아야 했고, 이는 Redis에 많은 쓰기 연산 부하를 유발했습니다.

### 💡 해결책: TTL 확장 + Lua Script + Pipelining

시스템 부하를 대폭 낮추면서도 동시성을 완벽히 제어하기 위해 3단계로 아키텍처를 튜닝했습니다.
1. **TTL 30초, 스케줄러 10초로 스로틀링:** Redis 접근 횟수를 절반 이하로 줄였습니다. 만약 유저가 비정상 종료하더라도, 좀비 락의 최대 유지 시간은 30초 이내로 제한되므로 사용자 경험을 크게 해치지 않으면서 I/O 부하를 최적화할 수 있었습니다.
2. **Lua Script를 통한 원자성 보장:**
   TTL을 연장할 때 "내 락이 맞는지 확인" $\rightarrow$ "TTL 연장" 과정이 쪼개져서 실행되면 그 찰나에 락 탈취가 발생할 수 있습니다. 이를 단일 Lua Script로 묶어 원자성을 보장했습니다.
3. **Redis Pipelining:**
   활성화된 세션이 100개라면 매 주기마다 100번의 네트워크 IO가 발생합니다. Redis Pipelining을 도입하여 100개의 Lua Script 실행 명령을 단 한 번의 네트워크 I/O로 일괄 처리하도록 최적화했습니다.


```java
private static final byte[] RENEW_SCRIPT_BYTES = """  
        if redis.call('get', KEYS[1]) == ARGV[1] then
			redis.call('expire', KEYS[1], ARGV[2])            
			redis.call('expire', KEYS[2], ARGV[2])            
			return 1        
		else            
			return 0        
		end
		""".getBytes(StandardCharsets.UTF_8);
private static final byte[] LOCK_TIMEOUT_BYTES = String.valueOf(LOCK_TIMEOUT).getBytes(StandardCharsets.UTF_8);


public void renewAllLocks() {  
    if (sessionRegistry.isEmpty()) return;  
  
    long now = System.currentTimeMillis();  
  
    // 갱신할 유효 세션만 담을 리스트  
    List<Map.Entry<String, SessionEntry>> validEntries = new ArrayList<>();  
  
    // 좀비 세션 필터링  
    for (Map.Entry<String, SessionEntry> entry : sessionRegistry.getAllEntries()) {  
        String sessionId = entry.getKey();  
        SessionEntry sessionEntry = entry.getValue();  
  
        // 클라이언트가 20초 이상 활동이 없었다면 좀비로 간주하고 갱신 대상에서 제외  
        if (now - sessionEntry.getLastActiveTime() > ZOMBIE_THRESHOLD) {  
            log.warn("Zombie session detected. Stop renewing: sessionId={}, lockKey={}", sessionId, sessionEntry.getLockKey());  
            sessionRegistry.cleanUp(sessionId, sessionEntry); // 로컬에서 삭제  
            continue;  
        }  
        validEntries.add(entry);  
    }  
  
    if (validEntries.isEmpty()) return;  
  
    // 유효한 세션들만 Pipeline으로 일괄 갱신  
    List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {  
        for (Map.Entry<String, SessionEntry> entry : validEntries) {  
            String sessionId = entry.getKey();  
            String lockKey = entry.getValue().getLockKey();  
            String sessionKey = getSessionKey(sessionId);  
  
            connection.scriptingCommands().eval(  
                    RENEW_SCRIPT_BYTES,  
                    ReturnType.INTEGER,  
                    NUM_KEYS,  
                    lockKey.getBytes(StandardCharsets.UTF_8),    // KEYS[1] = lockKey  
                    sessionKey.getBytes(StandardCharsets.UTF_8), // KEYS[2] = sessionKey  
                    sessionId.getBytes(StandardCharsets.UTF_8),  // ARGV[1] = sessionId  
                    LOCK_TIMEOUT_BYTES                           // ARGV[2] = timeout  
            );  
        }  
        return null;  
    });  
  
    // Redis 연장 실패(이미 만료/유실된 락) 처리  
    for (int i = 0; i < validEntries.size(); i++) {  
        Long result = (Long) results.get(i);  
        if (!REDIS_TRUE.equals(result)) { // 갱신 실패: 락이 이미 만료되었거나 Redis에서 유실된 경우  
            Map.Entry<String, SessionEntry> entry = validEntries.get(i);  
            sessionRegistry.cleanUp(entry.getKey(), entry.getValue());  
            log.warn("Lock renewal failed (already expired in Redis), cleaned up: sessionId={}, lockKey={}"  
                    , entry.getKey(), entry.getValue().getLockKey());  
        }  
    }  
  
    log.debug("Lock TTLs renewed for {} sessions via pipeline", validEntries.size());  
}
```

## 🎯 결론

분산락 적용에서 시작된 고민이 **Redis 기반 다중 서버 환경 대응, 이벤트 유실에 대비한 좀비 락 방어(Heartbeat 추적), 그리고 네트워크 최적화(Lua Script & Pipelining)** 라는 아키텍처 개선으로 이어졌습니다.

결과적으로, 다중 유저 접속 환경에서도 네트워크 지연 시간의 낭비 없이 서버를 신뢰할 수 있는 단일 주체로 삼아 **1 Writer, 1 Reviewer**라는 비즈니스 요구사항을 제어할 수 있었습니다.

상태를 유지해야 하는 웹소켓 환경에서 분산 시스템의 데이터 정합성을 맞추는 것이 얼마나 까다로운 작업인지, 그리고 그 과정에서 발생하는 다양한 엣지 케이스들을 어떻게 풀어내야 하는지 배울 수 있었던 뜻깊은 경험이었습니다.