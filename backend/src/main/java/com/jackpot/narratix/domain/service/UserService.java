package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.dto.JoinRequest;
import com.jackpot.narratix.domain.controller.dto.LoginRequest;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.UserAuth;
import com.jackpot.narratix.domain.repository.UserAuthRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;

    public boolean isIdDuplicated(String id) {
        return userAuthRepository.existsById(id);
    }

    @Transactional
    public void join(JoinRequest request) {
        if (isIdDuplicated(request.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디");
        }

        User user = User.builder()
                .id(request.getUserId())
                .nickname(request.getNickname())
                .build();
        userRepository.save(user);

        UserAuth auth = UserAuth.builder()
                .userId(request.getUserId())
                .password(request.getPassword())
                .build();
        userAuthRepository.save(auth);
    }

    public void login(LoginRequest loginRequest) {
        UserAuth auth = userAuthRepository.findById(loginRequest.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디"));
        if (!auth.getPassword().equals(loginRequest.getPassword())) {
            throw new IllegalArgumentException("비밀번호 틀림");
        }
    }
}

