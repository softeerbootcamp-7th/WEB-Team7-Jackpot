package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.UserNicknameResponse;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.exception.UserErrorCode;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserNicknameResponse getNickname(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(UserErrorCode.USER_NOT_FOUND));
        return new UserNicknameResponse(user.getNickname());
    }
}