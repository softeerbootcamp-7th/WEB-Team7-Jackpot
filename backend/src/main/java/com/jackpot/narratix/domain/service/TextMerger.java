package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DBText와 Redis에 쌓인 델타 목록을 병합해 새로운 DBText를 계산한다.
 */
@Component
public class TextMerger {

    /**
     * DBText에 델타 목록을 순서대로 적용해 새로운 텍스트를 반환한다.
     *
     * @param dbText 현재 DB에 저장된 answer
     * @param deltas Redis List에서 가져온 순서 있는 델타 목록
     * @return 델타가 모두 적용된 새로운 answer
     */
    public String merge(String dbText, List<TextUpdateRequest> deltas) {
        StringBuilder sb = new StringBuilder(dbText != null ? dbText : "");

        for (TextUpdateRequest delta : deltas) {
            sb.replace(delta.startIdx(), delta.endIdx(), delta.replacedText());
        }

        return sb.toString();
    }
}