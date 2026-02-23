package com.jackpot.narratix.data;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@SpringBootTest
class QnAAndScrapDataInitializerTest {

    @PersistenceContext
    EntityManager entityManager;

    @Autowired
    TransactionTemplate transactionTemplate;

    static final int BULK_INSERT_SIZE = 1000;
    static final int EXECUTE_COUNT = 100;
    CountDownLatch latch = new CountDownLatch(EXECUTE_COUNT);

    @Test
    @Disabled
    @Rollback(false)
    void initializeQnAAndScrap() throws InterruptedException {
        Long dummyCoverLetterId = transactionTemplate.execute(status -> {
            CoverLetter coverLetter = CoverLetter.builder()
                    .userId("testuser")
                    .companyName("Narratix")
                    .applyYear(2026)
                    .applyHalf(ApplyHalfType.values()[0])
                    .jobPosition("백엔드 개발자")
                    .deadline(LocalDate.now().plusDays(30))
                    .build();
            entityManager.persist(coverLetter);
            return coverLetter.getId();
        });

        ExecutorService executorService = Executors.newFixedThreadPool(10);
        long startTime = System.currentTimeMillis();

        for (int i = 0; i < EXECUTE_COUNT; i++) {
            int batchIndex = i;
            executorService.submit(() -> {
                insertData(batchIndex, dummyCoverLetterId);
                latch.countDown();
                System.out.println("남은 배치 작업 수: " + latch.getCount());
            });
        }

        latch.await();
        executorService.shutdown();

        long endTime = System.currentTimeMillis();
        System.out.println(" 데이터 삽입 완료! 소요 시간: " + (endTime - startTime) + "ms");
    }

    void insertData(int batchIndex, Long coverLetterId) {
        transactionTemplate.executeWithoutResult(status -> {
            String testUserId = "testuser";

            CoverLetter coverLetter = entityManager.getReference(CoverLetter.class, coverLetterId);

            for (int i = 0; i < BULK_INSERT_SIZE; i++) {
                int currentIdx = (batchIndex * BULK_INSERT_SIZE) + i;

                boolean hasKeyword = (currentIdx % 10 == 0);
                String questionText = hasKeyword ? "스프링 부트 N+1 문제 해결 방법 " + currentIdx : "일반적인 CS 면접 질문 " + currentIdx;
                String answerText = hasKeyword ? "스프링 데이터 JPA에서 fetch join을 씁니다." : "열심히 공부해서 답변하겠습니다.";

                QnA qna = QnA.builder()
                        .coverLetter(coverLetter)
                        .userId(testUserId)
                        .questionCategory(QuestionCategoryType.values()[0])
                        .question(questionText)
                        .answer(answerText)
                        .build();

                entityManager.persist(qna);

                Scrap scrap = Scrap.of(testUserId, qna.getId());

                entityManager.persist(scrap);
            }
        });
    }
}