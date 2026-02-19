package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Reviewer의 인덱스를 커밋된 델타 목록을 통해 현재 버전 기준으로 변환한다.
 *
 * <p>delta.version()은 push 직전 서버 버전이므로,
 * delta.version() >= fromVersion 인 델타를 version 오름차순으로 전달받아 OT를 수행한다.</p>
 */
@Component
public class OTTransformer {

    /**
     * Reviewer 버전 기준의 (startIdx, endIdx)를 현재 버전 기준으로 변환한다.
     *
     * @param start  Reviewer 버전 기준 시작 인덱스
     * @param end    Reviewer 버전 기준 끝 인덱스 (exclusive)
     * @param deltas Reviewer 버전 이후 적용된 델타 (version 오름차순)
     * @return 현재 버전 기준 {transformedStart, transformedEnd}
     * @throws BaseException REVIEW_TEXT_MISMATCH — 변환 후 start > end (범위가 완전 삭제됨)
     */
    public int[] transformRange(int start, int end, List<TextUpdateRequest> deltas) {
        int s = start;
        int e = end;
        for (TextUpdateRequest delta : deltas) {
            int dStart = delta.startIdx();
            int dEnd = delta.endIdx();
            int replacedLength = delta.replacedText().length();
            int lengthChange = replacedLength - (dEnd - dStart);

            s = transformIndex(s, dStart, dEnd, lengthChange, replacedLength, true);
            e = transformIndex(e, dStart, dEnd, lengthChange, replacedLength, false);
        }
        if (s > e) {
            throw new BaseException(ReviewErrorCode.REVIEW_TEXT_MISMATCH);
        }
        return new int[]{s, e};
    }

    /**
     * 단일 인덱스를 하나의 델타 기준으로 변환한다.
     */
    private static int transformIndex(int index, int dStart, int dEnd, int lengthChange, int replacedLength, boolean isStartBound) {
        // start 경계: 삽입/교체가 정확히 start 위치에서 발생하면 start도 밀어서 원본 텍스트만 추적
        // end 경계: 삽입이 정확히 end 위치에서 발생하면 end는 고정 (범위 확장 방지)
        if (isStartBound ? index < dStart : index <= dStart) { // 델타 이전 위치 → 영향 없음
            return index;
        }
        if (index >= dEnd) { // 델타 이후 위치 → 길이 변화만큼 이동
            return index + lengthChange;
        }
        // Writer가 originText와 replacedText를 동일하게 변경했을 때도 고려해야 하기 때문에 오류를 발생시키지 않는다.
        return dStart + replacedLength; // 델타 범위 내부 → 삽입 텍스트 끝으로 밀려남
    }
}