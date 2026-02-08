package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.ScrapId;
import com.jackpot.narratix.domain.fixture.ScrapFixture;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataJpaTest
class ScrapJpaRepositoryTest {

    @Autowired
    private ScrapJpaRepository scrapJpaRepository;

    @Test
    @DisplayName("countByUserId - 특정 userId의 스크랩 개수를 정확히 반환")
    void countByUserId_ReturnsCorrectCount() {
        // given
        String userId = "user123";
        String userId2 = "user456";

        scrapJpaRepository.save(ScrapFixture.builder().userId(userId).qnaId(1L).build());
        scrapJpaRepository.save(ScrapFixture.builder().userId(userId).qnaId(2L).build());
        scrapJpaRepository.save(ScrapFixture.builder().userId(userId).qnaId(3L).build());

        scrapJpaRepository.save(ScrapFixture.builder().userId(userId2).qnaId(4L).build());

        // when
        Long count = scrapJpaRepository.countByUserId(userId);

        // then
        assertThat(count).isEqualTo(3L);
        assertThat(scrapJpaRepository.countByUserId(userId2)).isEqualTo(1L);
    }

    @Test
    @DisplayName("existsById - 복합키(userId, qnaId) 기준으로 존재 여부를 반환")
    void existsById_ReturnsTrueIfExists() {
        // given
        String userId = "user123";
        Long qnaId = 10L;

        scrapJpaRepository.save(ScrapFixture.builder().userId(userId).qnaId(qnaId).build());
        ScrapId id = new ScrapId(userId, qnaId);

        // when
        boolean exists = scrapJpaRepository.existsById(id);

        // then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsById - 존재하지 않는 복합키면 false를 반환")
    void existsById_ReturnsFalseIfNotExists() {
        // given
        ScrapId id = new ScrapId("user123", 999L);

        // when
        boolean exists = scrapJpaRepository.existsById(id);

        // then
        assertThat(exists).isFalse();
    }
}