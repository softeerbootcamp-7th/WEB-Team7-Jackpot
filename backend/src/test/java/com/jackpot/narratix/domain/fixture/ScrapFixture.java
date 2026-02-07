package com.jackpot.narratix.domain.fixture;

import com.jackpot.narratix.domain.entity.Scrap;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;

public class ScrapFixture {

    public static ScrapBuilder builder() {
        return new ScrapBuilder();
    }

    public static class ScrapBuilder {
        private String userId = "testUser";
        private Long qnaId = 1L;
        private LocalDateTime createdAt;

        public ScrapBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public ScrapBuilder qnaId(Long qnaId) {
            this.qnaId = qnaId;
            return this;
        }

        public Scrap build() {
            Scrap scrap = Scrap.of(userId, qnaId);

            ReflectionTestUtils.setField(scrap, "id", scrap.getId());

            if (createdAt != null) {
                ReflectionTestUtils.setField(scrap, "createdAt", createdAt);
                ReflectionTestUtils.setField(scrap, "modifiedAt", createdAt);
            } else {
                setAuditFields(scrap);
            }

            return scrap;
        }
    }

}
