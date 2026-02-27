
## 들어가며

React 기반 **커스텀 텍스트 에디터**를 구현하면서, 단순 텍스트 입력이 아니라 **span 내부 텍스트 구조, 리뷰(highlight) 처리, Enter/Backspace, Undo/Redo**를 안정적으로 다루는 방법을 고민했습니다. 특히 `contentEditable` + React 구조에서 흔히 발생하는 **removeChild 에러와 DOM/React 불일치 문제**를 해결한 과정을 공유합니다.

---

## 1. 초기 구조와 접근

우리 에디터는 기본적으로 아래 구조를 가지고 있습니다.

- `contentRef` → 실제 `&lt;div contentEditable&gt;` DOM
- `text` → React state, 현재 에디터 텍스트
- `chunks` → `buildChunks`에서 만들어진 React element 배열, `text` 상태 기반 렌더링
- `processInput` → 사용자가 입력한 DOM 내용을 `text` 상태로 반영

즉 **DOM 자체보다 React state(`text`) 중심으로 에디터 상태를 관리**합니다.

이 구조 덕분에 span 구조나 highlight, 리뷰 영역을 안정적으로 관리할 수 있습니다.

---

## 2. Enter 기능 구현

### 문제 없이 동작한 이유

- 에디터는 이미 글이 `&lt;span&gt;`으로 감싸져 있다고 가정
- Enter 입력 시 기존 span 내부에서 **텍스트를 분할하고 줄바꿈 처리**하도록 직접 구현
- 줄바꿈 시 span 구조와 highlight 상태를 유지 → 안정적인 재렌더링 가능

즉 Enter 자체는 span 내부 구조만 고려하면 되므로 **직접 구현으로 잘 동작**했습니다.

---

## 3. Delete 처리 시 문제 발생

문제는 **Backspace/Delete를 브라우저 기본 동작에 맡겼을 때** 나타났습니다.

### 관찰된 현상

1. 모든 글을 지우는 경우 span 구조가 깨짐
2. Enter를 치면 기존 원본 span + 잘린 span이 함께 보이는 현상 발생
    
    예시:
    
    ```
    안녕(커서)하세요 -&gt; 엔터 -&gt; 안녕하세요 (빈줄) (하세요)
    ```

3. React에서 span을 제거하는 과정에서 `React removeChild` 에러 발생
    
    ```text
    installHook.js:1 
    NotFoundError: Failed to execute 'removeChild' on 'Node': 
    The node to be removed is not a child of this node. 
    at removeChild (react-dom_client.js:15916:24) 
    ...
    The above error occurred in the &lt;span&gt; component.
    ```

### 원인 분석

- Enter는 span 내부 기준으로 직접 구현했지만, Delete는 브라우저가 DOM을 직접 수정
- 브라우저가 텍스트 노드를 삭제하면 React Virtual DOM과 실제 DOM이 **불일치**
- React가 span 제거/재생성 시, 이미 삭제된 DOM을 참조하려고 하면서 removeChild 에러 발생

---

## 4. 개선 전략: 브라우저 기본 동작 차단 + 상태 기반 처리

문제 해결을 위해 핵심 원칙을 정했습니다.

### 핵심 아이디어

&gt; **Backspace/Delete 등 브라우저 자동 DOM 삭제를 막고, React state(`text`) 중심으로만 DOM 재구성**

### 구현 방식

```tsx
const handleKeyDown = (e: React.KeyboardEvent&lt;HTMLDivElement&gt;) =&gt; {
  if (e.key === 'Backspace') {
    e.preventDefault(); // 브라우저 기본 삭제 막음
    if (!contentRef.current || !onTextChange) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const { start, end } = rangeToTextIndices(contentRef.current, range);

    const newText = text.slice(0, start) + text.slice(end);

    caretOffsetRef.current = start;
    isInputtingRef.current = true;
    onTextChange(newText);
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    insertTextAtCaret('\n');
  }
};
```

<h3>장점</h3><ol><li><p>React 상태 중심으로만 span/fragment 재생성 → removeChild 오류 방지</p></li><li><p>모든 글 삭제 시에도 최소 <code inline="">&lt;span&gt;&amp;#8203;&lt;/span&gt;</code> 유지 → Enter 입력 시 항상 span 안에서 텍스트 작성</p></li><li><p>Undo/Redo와 연동 가능</p></li></ol><hr>

## 5. Undo/Redo 문제와 해결
### 발견된 문제
- Ctrl+A → Backspace 후 Undo 시, 텍스트가 복구되지 않음
- 원인: 브라우저 기반 Undo/Redo 스택이 React 상태와 연동되지 않음

### 해결 방법
- Undo/Redo 스택을 <strong>React 상태와 span 구조를 기반으로 직접 구현
- Enter, Delete, Undo, Redo 모두 상태 중심 처리
- 리뷰 영역(highlight span)도 정확히 복원

결과: Delete 후에도 Undo/Redo가 안정적으로 동작하며, span 구조, highlight, 리뷰 이벤트 모두 유지

## 6. 리뷰 영역 처리
- 리뷰(highlight) 영역이 있는 청크는 <strong>한 번 더 span으로 감싸 스타일 및 onClick 이벤트 부여</strong>
- React에서 span 중첩 구조 안정적 렌더링
- Enter/Delete/Undo/Redo 모두 리뷰 span 유지

## 7. 트러블슈팅 핵심 요약
문제 | 원인 | 해결 방법 | 결과
-- | -- | -- | --
Enter 시 span 내부 줄바꿈 | span 구조 가정 | 직접 구현 | 안정적
Delete 시 removeChild 오류 | 브라우저 기본 삭제 + React 상태 불일치 | preventDefault + 상태 기반 삭제 | span 유지, 오류 제거
Undo/Redo 미작동 | 브라우저 Undo/Redo와 React 상태 불일치 | 상태 기반 Undo/Redo 구현 | 안정적 복구 가능
리뷰 영역 클릭/스타일 깨짐 | span 구조와 highlight 미동기 | 리뷰 span 중첩, 상태 기반 렌더링 | 이벤트/스타일 유지

## 8. 핵심 교훈
1. contentEditable + React는 브라우저 기본 동작에 의존하면 안 된다
2. 모든 <strong>텍스트/span 구조는 상태 기반으로 직접 관리</strong>해야 예측 가능한 동작 가능
3. Undo/Redo, 리뷰(span) 등 부가 기능까지 포함하면, <strong>이벤트/스타일/DOM 구조</strong>를 모두 고려해야 함

덕분에 최종적으로 <strong>Enter/Delete/Undo/Redo</strong> 모두 React 상태 중심으로 안정적이고 예측 가능한 에디터 동작을 구현할 수 있었습니다.
