package com.jackpot.narratix.domain.fixture;

import com.jackpot.narratix.domain.entity.Review;
import org.springframework.test.util.ReflectionTestUtils;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;

public class ReviewFixture {

    public static ReviewFixtureBuilder builder() {
        return new ReviewFixtureBuilder();
    }

    public static class ReviewFixtureBuilder {
        private Long id;
        private Long qnaId = 1L;
        private String reviewerId = "reviewer123";
        private String comment;
        private String suggest;
        private boolean isApproved = false;

        public ReviewFixtureBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ReviewFixtureBuilder qnaId(Long qnaId) {
            this.qnaId = qnaId;
            return this;
        }

        public ReviewFixtureBuilder reviewerId(String reviewerId) {
            this.reviewerId = reviewerId;
            return this;
        }

        public ReviewFixtureBuilder comment(String comment) {
            this.comment = comment;
            return this;
        }

        public ReviewFixtureBuilder suggest(String suggest) {
            this.suggest = suggest;
            return this;
        }

        public ReviewFixtureBuilder isApproved(boolean isApproved) {
            this.isApproved = isApproved;
            return this;
        }

        public Review build() {
            Review review = Review.builder()
                    .qnaId(qnaId)
                    .reviewerId(reviewerId)
                    .comment(comment)
                    .suggest(suggest)
                    .build();

            if (id != null) {
                ReflectionTestUtils.setField(review, "id", id);
            }
            ReflectionTestUtils.setField(review, "isApproved", isApproved);
            setAuditFields(review);

            return review;
        }
    }
}