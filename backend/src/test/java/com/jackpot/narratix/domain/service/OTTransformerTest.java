package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

@DisplayName("OTTransformer 테스트")
class OTTransformerTest {

    private final OTTransformer otTransformer = new OTTransformer();

    @Test
    @DisplayName("델타 목록이 비어있으면 start·end를 그대로 반환한다")
    void transformRange_NoDeltas_ReturnsSameRange() {
        int[] result = otTransformer.transformRange(3, 7, List.of());

        assertThat(result).containsExactly(3, 7);
    }

    @Test
    @DisplayName("선택 범위가 델타 이전에 있으면 변화 없다")
    void transformRange_SelectionBeforeDelta_NoChange() {
        // delta: [10, 15) → "X" | selection: [3, 7) — 완전히 델타 앞
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 10, 15, "X")
        );

        int[] result = otTransformer.transformRange(3, 7, deltas);

        assertThat(result).containsExactly(3, 7);
    }

    @Test
    @DisplayName("선택 범위가 델타 이후에 있으면 삽입 길이만큼 오른쪽으로 이동한다")
    void transformRange_SelectionAfterInsertion_ShiftsRight() {
        // "ABCDE" → insert "XY" at [2,2) → "ABXYCDE"
        // selection [3, 5) → [5, 7)
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 2, 2, "XY")
        );

        int[] result = otTransformer.transformRange(3, 5, deltas);

        assertThat(result).containsExactly(5, 7);
    }

    @Test
    @DisplayName("선택 범위가 델타 이후에 있으면 삭제 길이만큼 왼쪽으로 이동한다")
    void transformRange_SelectionAfterDeletion_ShiftsLeft() {
        // "ABCDEFGH" → delete [2,5) → "ABFGH" (shrink by 3)
        // selection [6, 8) → [3, 5)
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 2, 5, "")
        );

        int[] result = otTransformer.transformRange(6, 8, deltas);

        assertThat(result).containsExactly(3, 5);
    }

    @Test
    @DisplayName("start가 델타 수정 구간 내부에 있으면 삽입 텍스트 끝으로 밀려난다")
    void transformRange_StartInsideDelta_PushedToReplacedEnd() {
        // delta: [2, 8) → "X" (replacedLength=1) | start=5 — 델타 범위 내부
        // s: dStart < 5 < dEnd → dStart + replacedLength = 2 + 1 = 3
        // e: 10 >= dEnd(8)     → 10 + (1 - 6) = 5
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 2, 8, "X")
        );

        int[] result = otTransformer.transformRange(5, 10, deltas);

        assertThat(result).containsExactly(3, 5);
    }

    @Test
    @DisplayName("end가 델타 수정 구간 내부에 있으면 삽입 텍스트 끝으로 밀려난다")
    void transformRange_EndInsideDelta_PushedToReplacedEnd() {
        // delta: [5, 10) → "X" (replacedLength=1) | end=7 — 델타 범위 내부
        // s: 2 <= dStart(5)    → 2
        // e: dStart < 7 < dEnd → dStart + replacedLength = 5 + 1 = 6
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 5, 10, "X")
        );

        int[] result = otTransformer.transformRange(2, 7, deltas);

        assertThat(result).containsExactly(2, 6);
    }

    @Test
    @DisplayName("초기 start > end이면 REVIEW_TEXT_MISMATCH 예외를 던진다")
    void transformRange_WhenStartExceedsEnd_ThrowsException() {
        // transformIndex는 단조 비감소 함수이므로 start <= end인 초기 입력에서는
        // 변환 후에도 s > e가 수학적으로 불가능하다.
        // s > e 가드는 초기 입력 자체가 start > end인 잘못된 입력을 방어한다.
        assertThatThrownBy(() -> otTransformer.transformRange(5, 3, List.of()))
                .isInstanceOf(BaseException.class);
    }

    @Test
    @DisplayName("여러 델타가 순서대로 누적 적용된다")
    void transformRange_MultipleDeltas_AppliedInOrder() {
        // "Hello World today" → Reviewer selects "World" at [6, 11)
        // delta1(v5): replace "Hello"[0,5) with "Hi" → "Hi World today"
        //   start: 6 >= 5(dEnd) → 6 + (2-5) = 3
        //   end:  11 >= 5      → 11 + (2-5) = 8
        // "Hi World today".substring(3, 8) = "World" ✓
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(5L, 0, 5, "Hi")
        );

        int[] result = otTransformer.transformRange(6, 11, deltas);

        assertThat(result).containsExactly(3, 8);
    }

    @Test
    @DisplayName("start가 델타 시작점과 동일하면 변화 없다 (경계: index <= dStart)")
    void transformRange_StartEqualsDeltaStart_NoChange() {
        // delta: [3, 6) → "XXXXX" | start=3 (dStart와 동일 → 첫 번째 분기)
        // end=9 >= 6(dEnd) → 9 + (5-3) = 11
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 3, 6, "XXXXX")
        );

        int[] result = otTransformer.transformRange(3, 9, deltas);

        assertThat(result).containsExactly(3, 11);
    }

    @Test
    @DisplayName("end가 델타 종료점과 동일하면 길이 변화만큼 이동한다 (경계: index >= dEnd)")
    void transformRange_EndEqualsDeltaEnd_ShiftsCorrectly() {
        // delta: [2, 6) → "XY" (shrink by 2) | start=0 ≤ dStart(2) → 0, end=6 >= dEnd(6) → 4
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 2, 6, "XY")
        );

        int[] result = otTransformer.transformRange(0, 6, deltas);

        assertThat(result).containsExactly(0, 4);
    }

    @Test
    @DisplayName("두 델타가 모두 선택 범위 이전에 있으면 누적 이동이 적용된다")
    void transformRange_TwoDeltasBeforeSelection_CumulativeShift() {
        // delta1: insert "AB" at [0,0) → +2
        // delta2: insert "CD" at [2,2) → +2
        // selection [5, 8) → [5+2+2, 8+2+2) = [9, 12)
        List<TextUpdateRequest> deltas = List.of(
                new TextUpdateRequest(0L, 0, 0, "AB"),
                new TextUpdateRequest(1L, 2, 2, "CD")
        );

        int[] result = otTransformer.transformRange(5, 8, deltas);

        assertThat(result).containsExactly(9, 12);
    }
}