package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.JoinRequest;
import com.jackpot.narratix.domain.controller.request.LoginRequest;
import com.jackpot.narratix.domain.entity.UserAuth;
import com.jackpot.narratix.domain.exception.UserErrorCode;
import com.jackpot.narratix.domain.repository.UserAuthRepository;
import com.jackpot.narratix.global.auth.jwt.service.TokenService;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAuthService {

    private final UserAuthRepository userAuthRepository;
    private final TokenService tokenService;

    public TokenResponse login(LoginRequest loginRequest) {
        UserAuth auth = userAuthRepository.findById(loginRequest.getUserId())
                .orElseThrow(() -> new BaseException(UserErrorCode.INVALID_LOGIN));

        if (!auth.checkPassword(loginRequest.getPassword())) {
            throw new BaseException(UserErrorCode.INVALID_LOGIN);
        }
        return tokenService.issueToken(loginRequest.getUserId());
    }

    @Transactional
    public TokenResponse join(JoinRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new BaseException(UserErrorCode.PASSWORD_MISMATCH);
        }

        if (isIdDuplicated(request.getUserId())) {
            throw new BaseException(UserErrorCode.DUPLICATE_USER_ID);
        }

        userAuthRepository.save(UserAuth.joinNewUser(
                request.getUserId(),
                request.getNickname(),
                request.getPassword()
        ));

        return tokenService.issueToken(request.getUserId());
    }

    @Transactional(readOnly = true)
    public void checkIdAvailable(String userId) {
        if (isIdDuplicated(userId)) {
            throw new BaseException(UserErrorCode.DUPLICATE_USER_ID);
        }
    }

    private boolean isIdDuplicated(String id) {
        return userAuthRepository.existsById(id);
    }


}
