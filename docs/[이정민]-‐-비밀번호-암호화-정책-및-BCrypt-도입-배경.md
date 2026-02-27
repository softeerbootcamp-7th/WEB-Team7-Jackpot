## 1. Encryption(암호화) vs Hashing(해싱)

Encryption :  데이터가 일반 텍스트로 전달되고 읽을 수 없는 암호화로 바꿀 수 있고, 이를 다시 해독하여 일반 텍스트로 읽을 수 있는 양방향 기능

Hashing : 단방향. 호화하면 다시 이를 평문화 시킬 수 없다. 대신 같은 문자열을 같은 해시 함수를 거치면 결과값은 늘 같다는 것을 이용하여 값이 일치하는지 확인할 수 있다.

비밀번호 암호화에는 hashing을 사용하는게 적절하다!

---

## 2. 주요 해싱 알고리즘 비교

알고리즘 | 특징 | 장점 | 단점
-- | -- | -- | --
Argon2 | 최신 표준  | 메모리/CPU 비용 설정 가능, GPU 공격에 매우 강함 | 라이브러리 추가 필요, 설정이 다소 복잡함
BCrypt | 가장 대중적인 방식 | 솔트(Salt) 자동 생성, 검증된 안정성 | GPU 연산 성능 향상으로 Argon2보다 보안성 낮음
PBKDF2 | 표준 라이브러리 활용 가능 | 별도 라이브러리 없이 JDK만으로 구현 가능 | 다른 알고리즘에 비해 상대적으로 느리고 보안 강도 낮음
SCrypt | 메모리 하드웨어 공격 방어 | 하드웨어 공격(ASIC)을 막는 데 특화됨 | 메모리 사용량이 많아 서버 리소스를 많이 차지함

---

## 3. BCrypt를 사용하자!
우리 서비스(자소서 아카이빙)의 성격과 서버 리소스를 종합적으로 고려하여 BCrypt를 최종 채택했다.

### 3.1. 서비스 성격에 적합한 보안 강도 (Risk vs. Effort)

개인정보 보호는 필수적이나, 금융권 수준의 보안 시스템(Argon2)을 도입하기 위한 추가 리소스(메모리 설정, 라이브러리 관리 등) 대비 실효성을 고려했다.
BCrypt만으로도 현재의 연산 능력(GPU 공격 등)을 충분히 방어할 수 있는 수준의 Work Factor(비용 설정) 조절이 가능하므로, 오버 엔지니어링을 피하고 효율적인 보안을 택했다.

### 3.2. 서버 리소스의 효율적 활용

Argon2나 SCrypt 같은 '메모리 하드(Memory-hard)' 방식은 서버 RAM 점유율이 높아 트래픽 몰림 시 서버에 부담을 줄 수 있다.
BCrypt는 CPU 기반으로 동작하며 메모리 사용량이 적어, 안정적인 응답 속도를 보장하면서도 충분한 보안성을 제공한다.

---

## 4. BCrypt 동작 원리 및 Workflow
### 📝 회원가입 프로세스
입력 비밀번호: "Test123!"

솔트(Salt) 생성: $2a$11$N9qo8uLOickgx2ZMRZoMye

해싱: 비밀번호(Test123!) + 솔트 결합 후 해싱

DB 저장: 생성된 60자 길이의 해시값 저장
👉 $2a$11$N9qo8uLOickgx2ZMRZoMye1J9FEWLvXQVJC7eAqG8fHEKPxFJOQa6

### 🔑 로그인 프로세스 (BCrypt.checkpw)
입력 비밀번호: "Test123!"

DB에서 솔트 추출: 저장된 해시값 앞부분에서 솔트($2a$11$N9qo8uLOickgx2ZMRZoMye)를 추출

해싱: 입력받은 비밀번호 + 추출한 솔트를 이용하여 해싱

결과 비교: DB에 저장된 전체 해시값과 새로 생성한 해시값이 일치하면 true 반환

---

## 5. Work Factor란?

Work factor는 해싱을 **얼마나 반복할지**를 결정합니다.

work factor = n

실제 반복 횟수 = 2^n

예시:

gensalt(10) → 2^10 = 1,024번 반복

gensalt(11) → 2^11 = 2,048번 반복

gensalt(12) → 2^12 = 4,096번 반복

**반복이 많을수록:**

- ✅ 보안 강화 (brute force 공격 어려움)
- ❌ 속도 느림 (서버 부하 증가)

**적절한 Work Factor를 찾기 위한 테스트 코드**

```java
public static void main(String[] args) {
    String password = "Test123!";
    
    // Work factor 10
    long start10 = System.currentTimeMillis();
    BCrypt.hashpw(password, BCrypt.gensalt(10));
    long time10 = System.currentTimeMillis() - start10;
    System.out.println("Factor 10: " + time10 + "ms");
    
    // Work factor 11
    long start11 = System.currentTimeMillis();
    BCrypt.hashpw(password, BCrypt.gensalt(11));
    long time11 = System.currentTimeMillis() - start11;
    System.out.println("Factor 11: " + time11 + "ms");
    
    // Work factor 12
    long start12 = System.currentTimeMillis();
    BCrypt.hashpw(password, BCrypt.gensalt(12));
    long time12 = System.currentTimeMillis() - start12;
    System.out.println("Factor 12: " + time12 + "ms");
}
```
---
