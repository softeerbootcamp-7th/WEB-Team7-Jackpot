## ✨ 한 줄 요약 
> 사용자가 채용 공고를 등록하여 일정을 관리하고, 항목별 자기소개서를 작성·저장하며, 지원 현황을 통계와 캘린더로 한눈에 파악할 수 있도록 설계된 웹 서비스의 전체 구조도입니다.

<img width="1000" height="300" alt="image" src="https://github.com/user-attachments/assets/a86dfe42-a2fa-4502-8c28-8297a7fb6fbf" />


## 🎯 등장 배경
- **복잡한 채용 일정 관리:** 여러 기업의 서류 마감일, 면접 일정 등을 개별적으로 관리하기 어려운 취준생들의 고충 해결.
- **파편화된 자소서 데이터:** 기업마다 다른 자소서 문항과 작성 내용을 한곳에서 체계적으로 관리하고 재사용할 필요성 대두.
- **해결하고자 하는 문제:** 공고 일정 누락 방지, 자소서 버전 관리의 어려움 해결, 지원 현황의 시각화.

## 🔑 핵심 개념
- **메인 대시보드 (Main Screen):** '통계 카드뷰'를 통해 완료된 자소서/답변 수와 지원한 공고 수를 보여주고, '나의 지원 캘린더'와 '다가오는 일정'을 통해 시급한 할 일을 노출합니다.
- **커스텀 캘린더 (Custom Calendar):** 단순 일정 표시를 넘어, 공고 등록(Step 1: 기업/직무 정보)과 해당 공고에 쓰일 자소서 매핑(Step 2: 자소서 연결)을 단계별로 수행하는 기능입니다.
- **자소서 에디터 (Resume Editor):** 질문(문항)과 답변을 구분하여 작성하고, 팁(Tip)을 제공하거나 글자 수를 확인하며, PDF 저장 및 미리보기를 지원하는 작성 도구입니다.

## ⚙️ 동작 방식
1. **진입 및 인증:** 비회원은 랜딩 페이지(밀어서 잠금 해제 컨셉)를 거쳐 로그인/회원가입(아이디 중복 확인 등)을 수행하여 서비스에 접속합니다.
2. **일정 및 공고 등록:** '나의 채용 공고 화면' 또는 '캘린더'에서 새 공고를 등록합니다. 이때 기업명, 직무, 채용 시기 등을 입력하고(Step 1), 해당 공고에 제출할 자소서를 선택하거나 새로 등록합니다(Step 2).
3. **자소서 작성 및 관리:** '자기소개서 화면'에서 문항별로 내용을 작성합니다. 작성된 내용은 '자소서 프리뷰'로 확인하거나 수정할 수 있으며, 메인 화면의 통계에 반영됩니다.

## 👍 장점
- **올인원 관리:** 일정 관리(캘린더)와 문서 작성(자소서)이 긴밀하게 연결되어 있어, 특정 기업 마감일에 맞춰 어떤 자소서를 써야 하는지 명확히 파악 가능합니다.
- **사용자 편의성:** '실시간 알림', '마감 임박 공고 라벨링', '작성 팁 제공' 등 취업 준비생의 패턴에 맞춘 UX 요소가 배치되어 있습니다.
- **데이터 시각화:** 지원 현황을 단순히 텍스트 리스트가 아닌 '통계 카드뷰'와 '캘린더' 형태로 시각화하여 동기 부여를 제공합니다.

## 👎 단점
- **초기 입력 비용:** 자동 크롤링 기능이 명시되어 있지 않아, 사용자가 직접 기업명, 직무, 마감일 등을 수동으로 입력해야 하는 번거로움이 있을 수 있습니다.
- **복잡한 계층 구조:** 기능이 많아(헤더, 섹션 헤더, 컨텐츠 등이 중첩됨) 처음 사용하는 사용자에게는 메뉴 탐색이 다소 복잡하게 느껴질 수 있습니다.

## 🧩 언제 사용하면 좋은가?
- **사용하기 좋은 상황:** 여러 기업에 동시 지원하여 일정과 자소서 관리가 꼬이기 시작한 취업 준비생, 이직 준비생의 포트폴리오 및 일정 정리용.
- **피해야 할 상황:** 단순히 메모장 기능만 필요하거나, 기업 공고를 자동으로 긁어오는 기능(채용 플랫폼)을 주력으로 원하는 경우(이 구조도는 '관리'에 초점이 맞춰져 있음).

## 📎 참고 자료
- **기반 자료:** 업로드된 IA(정보 구조도) 및 UI 플로우 차트 이미지 10장 (로그인, 메인, 캘린더, 자소서 작성, 공고 관리 등)
[Jackpot UI 설계](https://www.figma.com/board/pqxdgz0QnD3e6Rp7I9KlzS/Jackpot?node-id=1-2&t=14Y1kzWBsaMv1UQr-1)

<details>
<ul>
<li>
공통 컴포넌트 설계
<br />
<img width="754" height="2302" alt="image" src="https://github.com/user-attachments/assets/d1aecee9-46f0-4403-b74d-d232fb91a959" />
</li>
<li>
메인 화면 설계
<br />
<img width="802" height="962" alt="image" src="https://github.com/user-attachments/assets/392e88d1-265e-4d65-9172-985e6a046891" />
</li>
<li>
자료 업로드 화면 설계
<br />
<img width="802" height="962" alt="image" src="https://github.com/user-attachments/assets/a568b1cc-124b-4101-917d-1e1062c0623c" />
</li>
<li>
라이브러리 화면 설계
<br />
<img width="1050" height="2731" alt="image" src="https://github.com/user-attachments/assets/5c4479cc-1735-402c-bd7d-e13e5610cf45" />
</li>
<li>
자기소개서 작성 화면 설계
<br />
<img width="874" height="2826" alt="image" src="https://github.com/user-attachments/assets/c42c6007-76bf-4de6-9fd4-e91dbb35497a" />
</li>
<li>
첨삭 댓글 등록 화면 설계
<br />
<img width="1162" height="1191" alt="image" src="https://github.com/user-attachments/assets/c85b5c53-de80-4e8d-b4fe-6170b945e0a6" />
</li>
<li>
나의 채용 공고 화면 설계
<br />
<img width="602" height="686" alt="image" src="https://github.com/user-attachments/assets/b1663949-e51d-45c3-ba93-c70d09e1526d" />
<br />
- 커스텀 캘린더 화면 설계
<br />
<img width="862" height="1526" alt="image" src="https://github.com/user-attachments/assets/e3dd1689-ee0b-40a2-af1a-8e65739ca435" />
</li>
<li>
비회원 랜딩 화면 설계
<br />
<img width="690" height="858" alt="image" src="https://github.com/user-attachments/assets/9d2c8261-105e-40ca-87e0-a5ce09d3ccb9" />
</li>
<li>
로그인 회원가입 화면 설계
<br />
<img width="778" height="746" alt="image" src="https://github.com/user-attachments/assets/c2f6f1e9-2e71-436e-916e-a957878c9bae" />
</li>
</details>

