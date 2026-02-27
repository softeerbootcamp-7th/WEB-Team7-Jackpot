해당 PR의 문제해결과정입니다.
https://github.com/softeerbootcamp-7th/WEB-Team7-Jackpot/issues/538

## 1. 에러 분석 및 원인 찾기

스크랩 검색을 전문 검색으로 최적화를 진행한 이후, 스크랩 검색 기능이 작동하지 않는 에러를 발견했습니다.

흥미로웠던 점은 에러가 두가지로 나뉜다는 점입니다.

검색을 테스트 하기 위해 답변에 포함되어 있는 단어들을 가지고 검색을 해보았는데,

어떨 때는 500에러가 발생하고, 어떤 경우에는 빈 리스트가 반환되는 것이었습니다. 

<img width="500" alt="image" src="https://github.com/user-attachments/assets/77467593-e5af-4eaa-b397-44650daeb402" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/17943d10-5701-4616-8318-295924b17efb" />

여러번의 테스트를 해본 결과,

- 한글의 경우에는 500에러가 나고

- 영어의 경우에는 빈 리스트가 반환되는 것 같다는 판단을 했습니다.

너무 기묘한 현상이라 매우 흥미로웠습니다.

500에러의 경우는, 에러의 원인을 금방 파악할 수 있었습니다. 로그를 보면 LazyInitializationException을 확인할 수 있었고, 아래 문제임을 추정했습니다.


> **DTO 변환 시 발생하는 `LazyInitializationException`** 
>
> - 이전 코드에서 JPQL(`findScraps`)은 `JOIN FETCH q.coverLetter`를 통해 연관된 데이터를 한 번에 가져왔습니다.
> - 하지만 Native Query(`searchQnAInScraps`)는 `SELECT q.* FROM ...`으로 `QnA` 테이블의 데이터만 가져옵니다.
> - 만약  `SearchScrapResponse.of(qnas.getContent(), ...)` 내부에서 `QnA` 엔티티의 `coverLetter` 정보에 접근하려고 시도한다면, 연관 데이터가 로딩되지 않았기 때문에 JPA 프록시 에러(500 에러)가 발생하게 됩니다.

그러나,

그렇다면, 영어(ai)를 검색했을 때 500에러가 반환되지 않고 빈 리스트가 반환되는 이유가 더욱 더 궁금해졌습니다. 

500에러가 뜨지 않는다는 건 아예 검색결과가 찾아지지 않는 다는 것이고, 쿼리 시작 지점부터 생각해본 결과, ngram 동작방식이 의심되었습니다..

ngram의 동작방식 중, stopword 를 본 순간에, 제가 검색한 ai라는 단어가 매우 간단한 단어라는 점이 떠올랐고, 설마 이게 불용어인가?라는 생각이 들었습니다.

따라서, 관련 설정을 찾아보고 불용어 제한을 없애는 방향으로 수정을 진행해보았습니다.

----

## 2. 불용어 문제 해결하기

```sql
// ai를 포함한 문항이 있음에도 검색결과가 뜨지 않는 현 상황입니다
mysql> SELECT * FROM qna 
    -> WHERE MATCH(question, answer) AGAINST('ai' IN BOOLEAN MODE);
Empty set (0.00 sec)

// 불용어 빈 테이블 생성 
mysql> CREATE TABLE my_stopwords(value VARCHAR(18)) ENGINE = INNODB;
Query OK, 0 rows affected (0.05 sec)

// 불용어를 빈테이블로 설정 (앞으로 불용어는 없다!)
mysql> SET GLOBAL innodb_ft_server_stopword_table = 'narratix/my_stopwords';
Query OK, 0 rows affected (0.00 sec)

// 전문검색에 사용되는 인덱스를 삭제 후
mysql> ALTER TABLE qna DROP INDEX idx_qna_fulltext;
Query OK, 0 rows affected (0.06 sec)
Records: 0  Duplicates: 0  Warnings: 0

// 전문검색에 사용되는 인덱스를 다시 생성!
mysql> CREATE FULLTEXT INDEX idx_qna_fulltext ON qna (question, answer) WITH PARSER ngram;
Query OK, 0 rows affected (0.41 sec)
Records: 0  Duplicates: 0  Warnings: 0

// 결과를 확인해보면 정상적으로 검색이 되는 것을 확인할 수 있습니다!
mysql> SELECT * FROM qna 
    -> WHERE MATCH(question, answer) AGAINST('ai' IN BOOLEAN MODE);
3 rows in set (0.00 sec)  --결과 생략

```

이렇게 수정을 통해서
ai 단어를 검색 시에도 빈리스트가 반환되는 에러에서 벗어나 500에러를 만날 수 있었습니다!

500에러가 반가운 최초의 경험이었습니다.

<img width="700" alt="image" src="https://github.com/user-attachments/assets/96c883ed-d4c0-4dff-b136-e22d552e861f" />


----

## 3. 500 에러 해결하기 ( 지연로딩 문제와 n+1 문제 해결)

이제 500에러를 해결해야합니다.

> **DTO 변환 시 발생하는 `LazyInitializationException`** 
>
> - 이전 코드에서 JPQL(`findScraps`)은 `JOIN FETCH q.coverLetter`를 통해 연관된 데이터를 한 번에 가져왔습니다.
> - 하지만 Native Query(`searchQnAInScraps`)는 `SELECT q.* FROM ...`으로 `QnA` 테이블의 데이터만 가져옵니다.
> - 만약  `SearchScrapResponse.of(qnas.getContent(), ...)` 내부에서 `QnA` 엔티티의 `coverLetter` 정보에 접근하려고 시도한다면, 연관 데이터가 로딩되지 않았기 때문에 JPA 프록시 에러(500 에러)가 발생하게 됩니다.

이 문제를 해결하기 위해 데이터를 변환하는 과정(`SearchScrapResponse.of()`)이 끝날 때까지 **DB와의 연결(영속성 컨텍스트)을 살려두어서, 지연 로딩(Lazy Loading)이 정상적으로 작동하게** 만들어야합니다.

3.1.

서비스 단의 `searchScrap` 메서드에 `@Transactional(readOnly = true)` 를 추가했습니다

3.2.

n+1 문제 해결

기존에는 JPQL의 `JOIN FETCH`를 사용하여 `QnA`와 연관된 `CoverLetter`를 한 번의 쿼리로 가져와 N+1 문제를 방지했습니다.
하지만 전문 검색(Full-Text Search) 도입을 위해 **Native 쿼리로 변경하면서, JPA가 연관된 객체를 한 번에 매핑(조립)해주지 못하는 문제가 다시 드러났습니다**. 이로 인해 조회된 `QnA` 데이터의 개수(N)만큼 `CoverLetter`를 개별적으로 추가 조회하는 **N+1 문제가 다시 발생**하게 되었습니다.

JPA 전역 설정(`default_batch_fetch_size`)을 변경할 경우 발생할 수 있는 부작용(예기치 못한 메모리 초과, 다른 기능의 쿼리 의도 방해 등)을 방지하기 위해, **애플리케이션 메모리 상에서 두 데이터를 직접 묶어주는 수동 조인 방식**을 채택했습니다.

**[작동 흐름]**

1. **QnA 조회 (쿼리 1):** Native 쿼리를 통해 조건에 맞는 `QnA` 목록만 먼저 가져옵니다. (이때 내부에 있는 CoverLetter는 가짜 객체인 '프록시' 상태입니다.)
2. **ID 추출:** 조회된 `QnA` 목록에서 프록시 에러를 발생시키지 않는 선에서 `CoverLetter`의 식별자(ID)만 추출하여 중복을 제거합니다.
3. **일괄 조회 (쿼리 2):** 추출한 ID 리스트를 `IN` 절로 넘겨, 필요한 `CoverLetter` 목록을 **단 한 번의 추가 쿼리로 일괄 조회**합니다.
4. **Map 변환 및 매핑:** 조회한 `CoverLetter` 목록을 매핑하기 쉽도록 `Map<Long, CoverLetter>` 형태로 변환한 뒤, DTO 조립 시 프록시 객체를 찌르는 대신 `Map`에서 안전하게 꺼내어 응답 객체를 완성합니다.

----

### ++) 진짜 “ai” 가 불용어였는지?

https://dev.mysql.com/doc/refman/8.4/en/fulltext-stopwords.html