### Keyword : User 엔티티 설계 / User-UserAuth 분리 / cascade를 활용한 개선
<br>

### 1. 왜 User와 UserAuth를 굳이 나누었나?

- 비밀번호는 로그인이나 회원가입 때만 필요하다. 자소서를 쓰거나 닉네임을 바꿀 때 굳이 비밀번호 데이터까지 메모리에 들고 다닐 필요가 없다고 생각했다.
- 유저의 '프로필(User)'과 '인증 수단(UserAuth)'을 분리해두면, 나중에 소셜 로그인이 추가되더라도 `User` 엔티티를 크게 수정하지 않고 대응할 수 있을 것으로 판단했다.

그래서 결론적으로 User(아이디, 닉네임)과  UserAuth(아이디,비밀번호)를 별도의 테이블과 엔티티로 나누게 되었다.

<br>

### 2. 문제 : 유저 한 명이 가입하는데, 저장은 두 번?

```java
// 초기 코드
User user = new User(...);
userRepository.save(user); 

UserAuth auth = new UserAuth(...);
userAuthRepository.save(auth);
```

논리적으로는 한 명의 유저를 저장하는 과정인데, `save()`를 두 번 호출하는 것이 이상하게 느껴졌다.  

+ 승환님의 피드백)

만약 `user`는 저장 성공했는데 `auth` 는 실패한다면? 

물론 `@Transactional`이 있지만,  구조적으로 안전해보이지 않았다.

<br>


### 3. 문제 해결 1 : 메서드 분리

`createUser()` 와 같은 메서드를 만들고, 그 내부에서 user 와 userAuth 를 모두 생성하는 설계를 구상하였다. 회원가입 메서드 안에서 `createUser()` 로 한 번만 호출하게 되니 깔끔하겠지만, 근본적인 문제는 그대로라는 것을 깨달았다. 여전히 Repository는 두 번 호출되었고 user와 userAuth의 관계를 유추할 수 없었다.

<br>


### 4. 문제 해결 2 : Cascade

검색과 ai를 활용해 얻은 해결책은 **JPA의 연관관계 매핑**과 **Cascade** 이었다. 다음과 같은 방법으로 문제를 해결할 수 있었다.

- **연관관계 설정:** `User`가 `UserAuth`를 가지도록 `@OneToOne` 관계를 맺는다.
- **Cascade 적용:** `CascadeType.ALL`을 설정해 `User`가 저장될 때 `UserAuth`도 **자동으로** 함께 저장되게 만든다.

```java
@Transactional
public void join(JoinRequest request) {
    // 1. 유저와 인증 정보를 하나의 Aggregate로 묶기
    User user = User.builder()...build();
    UserAuth auth = UserAuth.builder()...build();
    user.setAuth(auth); //

    // 2. 한 번의 save
    userRepository.save(user); 
}
```

`Cascade`는 잘못 사용하면 의도치 않은 데이터 삭제 등의 side effect가 발생 할 수 있지만 `UserAuth`는 오직 `User`만 사용한다. 소유주가 명확하며 `User` 와 `UserAuth` 의 생명주기가 같기에 casecade 를 쓰기에 적합하다고 생각했다.

### 5. 결과

- `User`만 저장해도 `UserAuth`가 함께 영속화되며, 코드의 의도가 "유저는 인증 정보를 포함하는 하나의 단위"임이 명확해짐
- `User`를 중심(Aggregate Root)으로 두고 `UserAuth`가 그 생명주기를 따르게 함으로써, 외부 로직에서 인증 정보를 따로 저장해야 하는 번거로움과 실수 가능성을 제거했다.
- `CascadeType.ALL` 덕분에 유저가 생성될 때 인증 정보도 함께 생성되고, 나중에 유저가 삭제될 때 인증 정보만 남는 데이터 파편화 문제도 자연스럽게 해결할 수 있게 되었다.