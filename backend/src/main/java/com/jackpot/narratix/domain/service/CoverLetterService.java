package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

        List<QnA> qnAs = createCoverLetterRequest.getQuestions()
                .stream()
                .map(question -> QnA.newQnA(coverLetter, question))
                .toList();

        CoverLetter newCoverLetter = coverLetterRepository.save(coverLetter);
        qnARepository.saveAll(qnAs);

        return new CreateCoverLetterResponse(newCoverLetter.getId());
    }

}
