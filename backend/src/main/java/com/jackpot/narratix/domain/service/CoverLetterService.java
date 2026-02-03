package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    @Transactional
    public void deleteCoverLetterById(String userId, Long coverLetterId) {
        Optional<CoverLetter> coverLetterOptional = coverLetterRepository.findById(coverLetterId);
        if(coverLetterOptional.isEmpty()) return;
        if(!coverLetterOptional.get().getUser().getId().equals(userId)){
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }

        coverLetterRepository.deleteById(coverLetterId);
    }
}
