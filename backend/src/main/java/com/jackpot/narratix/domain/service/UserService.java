package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.dto.JoinRequest;
import com.jackpot.narratix.domain.controller.dto.LoginRequest;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.UserAuth;
import com.jackpot.narratix.domain.repository.UserAuthRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
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
        try {
            User user = createUser(request);
            userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException("이미 존재하는 아이디로, 회원가입 실패", e);
        }
    }

    private User createUser(JoinRequest request) {
        User user = User.builder()
                .id(request.getUserId())
                .nickname(request.getNickname())
                .build();

        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(11));

        UserAuth auth = UserAuth.builder()
                .password(hashedPassword)
                .build();

        user.setUserAuth(auth);
        return user;
    }

    public void login(LoginRequest loginRequest) {
        UserAuth auth = userAuthRepository.findById(loginRequest.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다"));

        if (!BCrypt.checkpw(loginRequest.getPassword(), auth.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다");
        }
    }
}

