package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final QnARepository qnARepository;
    private final UserRepository userRepository;

    @Transactional
    public CreateCoverLetterResponse createNewCoverLetter(String userId, CreateCoverLetterRequest createCoverLetterRequest) {
        User userReference = userRepository.getReferenceById(userId);
        CoverLetter coverLetter = CoverLetter.from(userReference, createCoverLetterRequest);

        List<QnA> qnAs = createCoverLetterRequest.questions()
                .stream()
                .map(question -> QnA.newQnA(coverLetter, question))
                .toList();

        CoverLetter newCoverLetter = coverLetterRepository.save(coverLetter);
        qnARepository.saveAll(qnAs);

        return new CreateCoverLetterResponse(newCoverLetter.getId());
    }

    @Transactional(readOnly = true)
    public TotalCoverLetterCountResponse getTotalCoverLetterCount(String userId, LocalDate date) {
        ApplyHalfType applyHalf = ApplyHalfType.caculateApplyHalfType(date);
        int applyYear = date.getYear();

        return TotalCoverLetterCountResponse.builder()
                .coverLetterCount(coverLetterRepository.countByUserId(userId))
                .qnaCount(qnARepository.countByUserId(userId))
                .seasonCoverLetterCount(coverLetterRepository.countByUserIdAndApplyYearAndApplyHalf(userId, applyYear, applyHalf))
                .build();
    }
}
