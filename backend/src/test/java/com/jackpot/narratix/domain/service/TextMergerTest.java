package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TextMerger 테스트")
class TextMergerTest {

    private final TextMerger textMerger = new TextMerger();

    @Test
    @DisplayName("빈 델타 목록이면 원본 텍스트를 그대로 반환한다")
    void merge_EmptyDeltas_ReturnsOriginalText() {
        String result = textMerger.merge("Hello World", List.of());

        assertThat(result).isEqualTo("Hello World");
    }

    @Test
    @DisplayName("dbText가 null이면 빈 문자열로 처리한다")
    void merge_NullDbText_TreatedAsEmptyString() {
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 0, 0, "Hello")
        );

        String result = textMerger.merge(null, deltas);

        assertThat(result).isEqualTo("Hello");
    }

    @Test
    @DisplayName("단일 교체 델타가 해당 범위의 텍스트를 교체한다")
    void merge_SingleReplaceDelta_ReplacesText() {
        // "Hello World" → replace "World"[6,11) with "Java" → "Hello Java"
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 6, 11, "Java")
        );

        String result = textMerger.merge("Hello World", deltas);

        assertThat(result).isEqualTo("Hello Java");
    }

    @Test
    @DisplayName("여러 델타가 순서대로 누적 적용된다")
    void merge_MultipleDeltas_AppliedInOrder() {
        // "ABCDE"
        // delta1: replace "B"[1,2) with "X" → "AXCDE"
        // delta2: replace "D"[3,4) with "Y" → "AXCYE"
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 1, 2, "X"),
                new TextUpdateRequest(1L, 3, 4, "Y")
        );

        String result = textMerger.merge("ABCDE", deltas);

        assertThat(result).isEqualTo("AXCYE");
    }

    @Test
    @DisplayName("삭제 델타(replacedText가 빈 문자열)는 해당 범위를 제거한다")
    void merge_DeletionDelta_RemovesText() {
        // "Hello World" → delete " World"[5,11) → "Hello"
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 5, 11, "")
        );

        String result = textMerger.merge("Hello World", deltas);

        assertThat(result).isEqualTo("Hello");
    }

    @Test
    @DisplayName("삽입 델타(startIdx == endIdx)는 해당 위치에 텍스트를 삽입한다")
    void merge_InsertionDelta_InsertsText() {
        // "HelloWorld" → insert " "[5,5) → "Hello World"
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 5, 5, " ")
        );

        String result = textMerger.merge("HelloWorld", deltas);

        assertThat(result).isEqualTo("Hello World");
    }

    @Test
    @DisplayName("텍스트 앞부분에 삽입하면 인덱스가 올바르게 적용된다")
    void merge_InsertionAtStart_PrependText() {
        // "World" → insert "Hello "[0,0) → "Hello World"
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 0, 0, "Hello ")
        );

        String result = textMerger.merge("World", deltas);

        assertThat(result).isEqualTo("Hello World");
    }

    @Test
    @DisplayName("텍스트 끝부분에 삽입하면 올바르게 추가된다")
    void merge_InsertionAtEnd_AppendsText() {
        // "Hello" → insert "!"[5,5) → "Hello!"
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 5, 5, "!")
        );

        String result = textMerger.merge("Hello", deltas);

        assertThat(result).isEqualTo("Hello!");
    }

    @Test
    @DisplayName("전체 텍스트를 교체하는 델타가 올바르게 동작한다")
    void merge_FullReplaceDelta_ReplacesEntireText() {
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 0, 5, "World")
        );

        String result = textMerger.merge("Hello", deltas);

        assertThat(result).isEqualTo("World");
    }
}