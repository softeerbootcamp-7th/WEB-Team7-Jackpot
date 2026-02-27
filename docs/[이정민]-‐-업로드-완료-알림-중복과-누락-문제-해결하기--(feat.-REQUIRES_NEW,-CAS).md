
## 0. 발견한 에러

파일을 여러 개 동시에 업로드할 경우, 동일한 업로드 Job에 대해 SSE 알림이 여러 번 전송되는 현상을 발견했습니다.

정책 상 업로드 한 번당, 하나의 알림이 와야합니다.

---

## 1. 문제 분석

파일 업로드 Job은 여러 개의 `UploadFile`을 포함합니다.

각 파일이 처리 완료(성공 또는 실패)될 때마다 Job의 전체 완료 여부를 확인하고, 완료 시 SSE 알림을 전송합니다.

```java
// 기존 구조
long totalCount = ...
long failCount = ...
long successCount = ...

if (failCount + successCount == totalCount) {
    notificationService.sendLabelingCompleteNotification(...);
}
```

### `문제 1 : 트랜잭션 내부에서 SSE 호출`

기존 구조에서는 다음 문제가 발생할 수 있었습니다.

> 시나리오
> 
> 1. 파일 상태 변경
> 2. Job 완료 판단
> 3. 알림 전송
> 4. 이후 예외 발생 → 트랜잭션 rollback

> 결과:
> 
> - DB는 rollback됨
> - 하지만 알림은 이미 클라이언트로 전송됨
> - 이후 다른 스레드가 다시 완료 판단 → 알림 재전송 가능

### `문제 2 : Race Condition`

> 여러 파일이 거의 동시에 완료되는 경우:
> 
> - 여러 스레드가 동시에 `fail + success == total` 조건을 만족
> - 각각 알림 전송 수행
> - 동일 Job에 대해 알림 중복 발생

이는 전형적인 race condition 입니다.

---

## 2. 해결 목표

1. 알림 **중복 전송 방지**
2. 알림 누락 방지 (알림을 통해서만, 업로드된 결과화면으로 이동할 수 있기에 알림이 누락되면 안 됩니다.)

---

## 3. 트랜잭션 범위에 대한 고민

`processUploadedFile()` 및 `processFailedFile()`는 `@Transactional`로 동작합니다.

파일 상태 변경과 Job 완료 체크는 동일 트랜잭션 내에서 수행됩니다.

그러나, 알림 발송은 트랜잭션 범위내에서 보장해주지 않습니다.  (즉, 롤백 될 때 같이 롤백되지 않습니다.)

따라서 알림은 **commit 이후에만 전송되도록 보장해야 합니다.**

---

## 4. afterCommit ( 문제1 해결 )

```java
TransactionSynchronizationManager.registerSynchronization(
newTransactionSynchronization() {
        @Override
				public void afterCommit() {
				notificationService.sendLabelingCompleteNotification(...);
        }
    }
);
```

- 알림전송은 트랜잭션 commit 이후에만 실행됩니다.
- rollback 발생 시 알림은 실행되지 않습니다.
- DB 상태와 외부 알림 간 정합성 확보할 수 있습니다.

---

## 5. 상태 필드 추가와 CAS 적용 ( 문제 2 해결 )

```java
//기존 방식
long totalCount = uploadFileRepository.countByUploadJobId(job.getId());
long failCount = uploadFileRepository.countByUploadJobIdAndStatus(job.getId(), UploadStatus.FAILED);
long successCount = uploadFileRepository.countByUploadJobIdAndStatus(job.getId(), UploadStatus.COMPLETED);

if (failCount + successCount == totalCount) {
     notificationService.sendLabelingCompleteNotification(job.getUserId(), job.getId(), successCount, failCount);
}
```

개수를 조회 한 후, fail과 success 를 합친 완료된 파일 개수가 전체 개수와 같으면, 알림을 호출하는 방식입니다.

여러개의 스레드가 파일 처리를 하는 상황에서 race condition이 발생할 수 있습니다.

이 문제를 해결하기 위해 알림 발송 여부를 저장하는 상태플래그가 필요했습니다.

```sql
@Column(nullable = false)
private boolean notificationSent = false;
```

UploadJob entity에 해당 필드를 추가했습니다. 이미 알림이 발송되었는지를 나타냅니다.

notificationSent를 확인하고, 상태를 변경한 후 알림을 보내는 로직이 필요합니다.

```sql
if (failCount + successCount == totalCount) {
    int updated = uploadJobRepository.markNotificationSentIfNotYet(job.getId());

    if (updated == 1) {
        executeAfterCommit(() -> notificationService.sendLabelingCompleteNotification(
                job.getUserId(), job.getId(), successCount, failCount
        ));
    }
}
```

`failCount + successCount == totalCount` 이후에 `notificationSent` 를 확인하고 해당 필드를 변경하는데 성공한 경우만 알림 발송을 할 수 있도록 구현했습니다. 한 번의 알림이 보장됩니다.

락을 써도 이 문제를 해결할 수 있었습니다.

그러나 현재 상태 boolean 플래그 하나를 확인하고 업데이트하는 과정이기에 락을 쓰지 않고도 해결이 가능하다고 생각했습니다.

데이터베이스의 원자적 연산을 보장하는 `markNotificationSentIfNotYet` 입니다.

```sql
@Modifying
@Query("""
            UPDATE UploadJob j
            SET j.notificationSent = true
            WHERE j.id = :jobId
              AND j.notificationSent = false
        """)
int markNotificationSentIfNotYet(@Param("jobId") String uploadJobId);
```

`WHERE` 절의 조건 검사와 `SET` 업데이트가 DB 내부에서 하나의 트랜잭션 단위로 묶여 일어납니다.

notificationSent가 false인 경우에만 true로 변경하는 Compare-And-Swap (CAS) 방식입니다.

`notificationSent`가 `false`인 시점을 선점한 단 하나의 트랜잭션만 업데이트에 성공(`updated == 1`)하게 됩니다.

---

### 6. 트랜잭션 격리수준으로 인한 누락 가능성과 구조 개선

위와 같이 수정을 했으나, 한가지 간과한 것이 있었습니다.

> `failCount + successCount == totalCount` 판정과 `markNotificationSentIfNotYet()`가 커밋 전에 실행되면, READ_COMMITTED 기준에서 각 트랜잭션은 상대 트랜잭션의 커밋하지 않은 변경을 관찰할 수 없습니다. 둘 다 “아직 미완료”로 판단합니다. 이 경우 최종적으로 알림이 영구 누락될 수 있습니다.
> 

따라서 한 트랜잭션 내에서 failCount successCount 조회와 비교를 수행하기 위해 아래와 같이 구조를 변경했습니다.

```java
private void checkJobCompletionAndNotify(UploadJob job) {
    String jobId = job.getId();
    executeAfterCommit(() -> jobCompletionService.checkAndNotify(jobId));
}

private void executeAfterCommit(Runnable runnable) {
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override
        public void afterCommit() {
            runnable.run();
        }
    });
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void checkAndNotify(String jobId) {

    long totalCount = uploadFileRepository.countByUploadJobId(jobId);
    long failCount = uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.FAILED);
    long successCount = uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.COMPLETED);

    if (failCount + successCount == totalCount) {

        int updated = uploadJobRepository.markNotificationSentIfNotYet(jobId);

        if (updated == 1) {
            notificationService.sendLabelingCompleteNotification();
        }
    }
}
```

---
### 7. SQS 중복 수신과 파일 단위 비관적 락

SQS는 at-least-once delivery를 보장하기 때문에 동일한 메시지(동일 fileId)가 중복 전달될 수 있습니다.

다음과 같은 시나리오가 발생할 수 있습니다:

> 1. SQS가 동일한 fileId 메시지를 두 번 전달
> 2. 두 개의 트랜잭션이 동시에 processUploadedFile(fileId) 실행
> 3. 락이 없다면 두 트랜잭션 모두 isFinalized() == false를 읽음
> 4. 각각 addLabeledQnA() 호출
> 5. 중복 데이터 생성 가능

이를 방지하기 위해 파일 조회 시 비관적 쓰기 락(PESSIMISTIC_WRITE) 을 사용하고 있습니다.

---

### 8. 한계 및 보완 아이디어

현재의 `afterCommit` 방식은 데이터베이스 롤백 시 알림이 오발송되는 것을 완벽히 방지합니다. 하지만 트랜잭션 커밋 직후 SSE 호출 구간에서 네트워크 장애 등이 발생해 알림 발송이 실패한다면, DB에는 이미 `notificationSent = true`로 기록되어 있어 알림이 영구 누락될 수 있는 맹점이 존재합니다.

"알림이 절대 누락되면 안 된다"는 정책을 100% 보장하기 위해서는 향후 **Outbox Pattern(아웃박스 패턴)**의 도입을 고려할 수 있습니다.

- *Outbox Pattern:* 알림 발송 자체를 외부 API로 바로 쏘는 것이 아니라, 동일 트랜잭션 내에서 `Notification_Outbox` 같은 별도 DB 테이블에 발송할 이벤트(메시지)를 저장해두고, 별도의 배치 스케줄러나 메시지 릴레이가 이 테이블을 읽어 확실하게 알림을 발송(성공할 때까지 재시도)하는 구조.
- 동작방식은 다음과 같이 구상했습니다 :
    
    aftercommit 로직만 아래와 같이 수정하면 되기에 현재 구조에서 확장이 가능합니다.
    
    ```java
    1. 트랜잭션 내에서 Outbox에 이벤트 저장
    2. commit 성공
    3. 별도의 워커(스케줄러, 메시지 릴레이)가
    4. Outbox에서 PENDING 이벤트 조회
    5. SSE 전송
    6. 성공 시 SENT로 상태 변경
    7. 실패 시 재시도
    ```
    

그러나,
애플리케이션 레벨의 동시성 및 예외 처리는 현재 구조로 모두 해결되었으며, 커밋 직후 프로세스 크래시와 같은 상황은 인프라 레벨의 장애 시나리오에 가깝습니다. 근본적인 문제는 '결과 조회 접근 경로가 알림에 종속되어 있다는 점'이므로, 알림 외에도 업로드 결과를 볼 수 있도록 UX를 개선하는 것이 더 나은 방향이라 판단하여 현재 시점에서는 해당 패턴을 도입하지 않았습니다.

---

참고 : https://adjh54.tistory.com/378