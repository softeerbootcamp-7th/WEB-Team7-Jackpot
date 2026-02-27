# 📚 [학습 주제] Selection API

## 🎯 학습 목표
- 이 내용을 왜 학습했는가? 종합 프로젝트의 첨삭 서비스에서 드래그를 통한 수정 제안이나 코멘트를 달기 위해 해당 위치 정보를 사용하기 위해 Selection API에 대해 공부했다.
- 학습 후 기대 결과: Selection API가 무엇인지 설명할 수 있다.

## 📖 핵심 내용 요약
- 핵심 개념 1: Selection API

## ✍️ 상세 정리
### 개념 1: Selection API
설명: 웹 브라우저에서 현재 선택된 텍스트 또는 커서의 위치에 관련된 정보 제공 및 선택된 텍스트와 커서의 위치를 조작할 수 있는 메서드들을 제공하는 Web API이다.
<img width="854" height="821" alt="image" src="https://github.com/user-attachments/assets/c5651c41-4d27-49af-902f-21aabc8d1e14" />

[사진 1. notion에서 텍스트 드래그 후 console에 window.getSelection()을 출력한 결과]

<img width="375" height="126" alt="image" src="https://github.com/user-attachments/assets/00d2a129-19da-49a1-a9d3-1ede96a8f673" />

[사진 2. 두 줄의 텍스트를 드래그한 모습]
- **anchorNode** / **focusNode**
  - 선택이 시작된 노드와 선택이 끝난 노드를 의미한다.
  - [사진 1] 속에 드래그된 시작인 `[`의 앞부분과 드래그가 끝인 `제` 뒷부분이 속한 노드를 가리키므로 둘 다 `"제목: [FE | BE/feat] - 제목한 줄 요약`이 된다.
- **anchorOffset** / **focusOffset**
  - 선택이 시작된 지점과 끝나는 지점을 의미한다.
  - [사진 1] 속에 `"제목: [FE | BE/feat] - 제목한 줄 요약`의 가장 앞 `제`의 앞이 offset 0이고 `약`의 뒤가 offset 29(텍스트의 길이)가 된다.
  - 이때 드래그가 시작된 `[` 앞은 offset이 4이므로 `anchorOffset`은 4가 되고 `제` 뒤는 offset 22이므로 `focusOffset`은 22가 된다.
  - Selection 이벤트는 반대로도 되므로 드래그를 오른쪽에서 왼쪽으로 하면 `anchorOffset`과 `focusOffset`은 반대로 된다.
- **base**~ / **extent**~
  - base는 anchor의 alias이고 extent는 focus의 alias이다.
  - `baseNode`는 `anchorNode`와 동일하고 `extentOffset`은 `focusOffset`과 동일하다.
- **isCollapsed**
  - `anchorOffset`과 `focusOffset`이 동일한 지점에 있는지 여부를 나타낸다.
  - 만약 드래그를 하지 않고 글자 사이를 클릭하면 isCollapsed는 true가 된다.
  - [사진 2] 경우 시작 `anchorOffset`도 2이고 `focusOffset`도 2여도 `isCollapsed`는 `false`가 된다.

<img width="720" height="265" alt="image" src="https://github.com/user-attachments/assets/40b6bc9f-aac9-4702-bb46-bbfe8b2a8bf2" />

[사진 3. 사진 2를 기준으로 range 객체를 확인한 결과]
- **rangeCount**
  - Selection 객체는 Range 객체를 포함하고 있다. Range 객체는 노드나 텍스트 노드의 일부분을 포함하는 문서의 조각(fragment)이며 Selection은 여러 개의 Range 객체를 가질 수 있다. `rangeCount`는 Selection 객체가 갖고 있는 Range 객체의 개수를 나타낸다.
  - 대부분의 브라우저는 선택을 한 번만 할 수 있기 때문에 Selection 객체가 1개의 Range 객체를 가지지만 여러 Selection을 할 수 있는 경우 Range 객체가 여러 개가 될 수 있다.
  - 각 Range에 `Selection.prototype.getRangeAt`을 통해 접근이 가능하다. 0번 인덱스부터 원하는 Range 객체를 선택하여 볼 수 있다.
- **type**
  - 처음에 아무런 선택 이벤트가 발생하지 않은 상태에는 `None`이다. `isCollapsed`가 `true`라면 `Caret`을 그렇지 않으면 `Range`를 반환한다.