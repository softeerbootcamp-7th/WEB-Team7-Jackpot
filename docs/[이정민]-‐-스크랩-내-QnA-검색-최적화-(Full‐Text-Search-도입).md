## <스크랩 내 검색> 성능 개선하기

### 1. `scrap` `qna`테이블의 인덱스를 확인해보자
<img width="2540" alt="image" src="https://github.com/user-attachments/assets/0f648cd0-eb87-48e4-bfeb-cbd30c3957d2" />
<img width="2540" alt="image" src="https://github.com/user-attachments/assets/335dc625-73d7-4aad-9f12-c3559d8555ac" />

### 2. `scrap`의 인덱스 설계
<p>scrap을 사용하는 메서드를 보면</p>

  | 대상 메서드 | 쿼리 조건 (WHERE / ORDER BY) | 특징
-- | -- | -- | --
단건 조회 | existsById | userId = ? AND qnaId = ? | 유저 ID와 QnA ID를 모두 사용하여 정확히 1건을 조회
카운트 조회 | countByUserId | userId = ? | 특정 유저의 전체 스크랩 개수 조회
페이징 & 정렬 (No-offset) | findScraps, findScrapsNext, searchQnAInScraps 등 | userId = ? |  
ORDER BY createdAt DESC, qnaId DESC | 유저의 스크랩 목록을 최신순으로 정렬하여 슬라이스(Slice) 조회 |   |  

현재 `Scrap` 테이블은 `@EmbeddedId`(또는 `@IdClass`)를 통한 복합키를 사용하고 있으며, DB에 생성된 기본키(PK) 인덱스는 **`(qna_id, user_id)`** 순서로 되어 있음

AS-IS

- **단건 조회 (`existsById`):** 기본키 인덱스를 타므로 빠름
- **카운트 및 검색 조회 :**
    - 검색 조건이 `userId`로 시작하지만, 인덱스는 `qna_id`가 선두에 있어 Leftmost Prefix Rule을 위배합니다.
    - 결과적으로 인덱스를 타지 못하고 Full Table Scan (`type: ALL)`이 발생합니다.
    - 정렬을 위한 인덱스 정보가 없어 메모리 상에서 강제 정렬을 수행하는 `Using filesort`가 발생하여 대용량 데이터 조회 시 치명적인 병목이 됩니다.

TO-BE

(user_id, created_at DESC, qna_id DESC)
```sql
CREATE INDEX idx_scrap_user_created_qna 
ON scrap (user_id, created_at DESC, qna_id DESC);
```

----
## Full-Text Search


### 1. testcode로 10만개의 데이터 생성 (`QnAAndScrapDataInitializerTest` )

### 2. 현재 쿼리는..?

```sql
EXPLAIN
SELECT q.* FROM scrap s
JOIN qna q ON s.qna_id = q.id
JOIN coverletter c ON q.coverletter_id = c.id
WHERE s.user_id = 'testuser'
  AND (q.question LIKE '%스프링%' OR q.answer LIKE '%스프링%')
  AND (
      s.created_at < (SELECT s2.created_at FROM scrap s2 WHERE s2.user_id = 'testuser' AND s2.qna_id = 50000)
      OR
      (s.created_at = (SELECT s2.created_at FROM scrap s2 WHERE s2.user_id = 'testuser' AND s2.qna_id = 50000) AND s.qna_id < 50000)
  )
ORDER BY s.created_at DESC, s.qna_id DESC;
```

```sql
-> Nested loop inner join  (cost=29065 rows=24557) (actual time=67..133 rows=5001 loops=1)
    -> Nested loop inner join  (cost=26391 rows=24557) (actual time=67..132 rows=5001 loops=1)
        -> Sort: s.created_at DESC, s.qna_id DESC  (cost=11084 rows=117017) (actual time=67..70 rows=49961 loops=1)
            -> Filter: ((s.user_id = 'testuser') and ((s.created_at < (select #2)) or ((s.created_at = (select #3)) and (s.qna_id < 50000))))  (cost=11084 rows=117017) (actual time=0.0728..55.4 rows=49961 loops=1)
                -> Table scan on s  (cost=11084 rows=117017) (actual time=0.0577..18.4 rows=111004 loops=1)
                -> Select #2 (subquery in condition; run only once)
                    -> Rows fetched before execution  (cost=0..0 rows=1) (actual time=167e-6..208e-6 rows=1 loops=1)
                -> Select #3 (subquery in condition; run only once)
                    -> Rows fetched before execution  (cost=0..0 rows=1) (actual time=41e-6..41e-6 rows=1 loops=1)
        -> Filter: ((q.question like '%스프링%') or (q.answer like '%스프링%'))  (cost=0.867 rows=0.21) (actual time=0.00117..0.00117 rows=0.1 loops=49961)
            -> Single-row index lookup on q using PRIMARY (id = s.qna_id)  (cost=0.867 rows=1) (actual time=881e-6..905e-6 rows=1 loops=49961)
    -> Single-row covering index lookup on c using PRIMARY (id = q.coverletter_id)  (cost=0.25 rows=1) (actual time=97.3e-6..121e-6 rows=1 loops=5001)

```
Table scan on s: 인덱스를 타지 못하고 Scrap 테이블에서 약 11만 건의 풀 테이블 스캔 발생.

Sort: s.created_at DESC, s.qna_id DESC: 스캔 된 데이터를 기반으로 약 5만 건의 데이터를 메모리에 올려 정렬(Filesort) 수행.

Filter: q.question like ... (loops=49961): 정렬된 데이터 약 5만 건을 순회하며 QnA 테이블과 조인 후, 일일이 LIKE 텍스트 매칭을 수행.

### 3. 인덱스 만들기

```sql
CREATE FULLTEXT INDEX idx_qna_fulltext ON qna (question, answer) WITH PARSER ngram;
```

### 4. 쿼리 수정

```sql
EXPLAIN ANALYZE
SELECT q.*
FROM scrap s
         JOIN qna q ON s.qna_id = q.id
WHERE s.user_id = 'testuser'
  AND MATCH(q.question, q.answer) AGAINST('스프링' IN BOOLEAN MODE)
  AND (
    s.created_at < (SELECT s2.created_at FROM scrap s2 WHERE s2.user_id = 'testuser' AND s2.qna_id = 50000)
        OR
    (
        s.created_at = (SELECT s2.created_at FROM scrap s2 WHERE s2.user_id = 'testuser' AND s2.qna_id = 50000)
            AND s.qna_id < 50000
        )
    )
ORDER BY s.created_at DESC, s.qna_id DESC;
```

### 5. 개선된 쿼리는?

```sql
-> Sort: s.created_at DESC, s.qna_id DESC  (actual time=41.1..42 rows=5001 loops=1)
    -> Stream results  (cost=1.32 rows=0.4) (actual time=1.1..38.5 rows=5001 loops=1)
        -> Nested loop inner join  (cost=1.32 rows=0.4) (actual time=1.09..35 rows=5001 loops=1)
            -> Filter: (match q.question,q.answer against ('스프링' in boolean mode))  (cost=0.967 rows=1) (actual time=1.08..17.6 rows=10205 loops=1)
                -> Full-text index search on q using idx_qna_fulltext (question = '스프링')  (cost=0.967 rows=1) (actual time=1.08..17 rows=10205 loops=1)
            -> Filter: ((s.created_at < (select #2)) or ((s.created_at = (select #3)) and (q.id < 50000)))  (cost=0.29 rows=0.4) (actual time=0.00157..0.0016 rows=0.49 loops=10205)
                -> Single-row index lookup on s using PRIMARY (qna_id = q.id, user_id = 'testuser')  (cost=0.29 rows=1) (actual time=0.00116..0.00119 rows=1 loops=10205)
                -> Select #2 (subquery in condition; run only once)
                    -> Rows fetched before execution  (cost=0..0 rows=1) (actual time=42e-6..84e-6 rows=1 loops=1)
                -> Select #3 (subquery in condition; run only once)
                    -> Rows fetched before execution  (cost=0..0 rows=1) (actual time=41e-6..82e-6 rows=1 loops=1)

```
Full-text index search on q: 조인의 시작점(Driving Table)이 Scrap에서 QnA 테이블로 변경됨. idx_qna_fulltext 전문 검색 인덱스를 타면서 '스프링' 키워드가 포함된 10,205건의 데이터를 단 17ms 만에 필터링.

Single-row index lookup on s: 필터링된 1만여 건의 데이터를 기준으로 Scrap 테이블의 기본키(PK)를 조회하여 사용자의 스크랩 여부를 판별 (loops=10205).

Sort ...: 최종적으로 필터링을 통과한 5,001건에 대해서만 정렬 수행.

### 6. 결론
텍스트 검색 방식을 테이블 풀 스캔 기반의 LIKE 연산에서 역인덱스 기반의 MATCH AGAINST로 전환하여 조인 횟수를 줄이고 효율적인 검색 성능을 확보했습니다.