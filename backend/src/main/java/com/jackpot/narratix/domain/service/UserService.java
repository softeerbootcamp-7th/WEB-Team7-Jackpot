package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.dto.JoinRequest;
import com.jackpot.narratix.domain.controller.dto.LoginRequest;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.UserAuth;
import com.jackpot.narratix.domain.repository.UserAuthRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.auth.jwt.service.TokenService;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
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
    private final TokenService tokenService;

    public boolean isIdDuplicated(String id) {
        return userAuthRepository.existsById(id);
    }

    public void checkIdAvailable(String userId) {
        if (isIdDuplicated(userId)) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다");
        }
    }

    @Transactional
    public TokenResponse join(JoinRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다");
        }

        if (isIdDuplicated(request.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디");
        }

        try {
            User user = createUser(request);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("이미 존재하는 아이디로, 회원가입 실패", e);
        }
        return tokenService.issueToken(request.getUserId());
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

    public TokenResponse login(LoginRequest loginRequest) {
        UserAuth auth = userAuthRepository.findById(loginRequest.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다"));

        if (!BCrypt.checkpw(loginRequest.getPassword(), auth.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다");
        }
        return tokenService.issueToken(loginRequest.getUserId());
    }
}

