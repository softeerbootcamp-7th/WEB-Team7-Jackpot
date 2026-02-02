package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.dto.JoinRequest;
import com.jackpot.narratix.domain.controller.dto.LoginRequest;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.UserAuth;
import com.jackpot.narratix.domain.exception.UserErrorCode;
import com.jackpot.narratix.domain.repository.UserAuthRepository;
import com.jackpot.narratix.global.auth.jwt.service.TokenService;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserAuthRepository userAuthRepository;
    private final TokenService tokenService;
    private final EntityManager entityManager;

    private static final int BCRYPT_SALT_ROUNDS = 11;

    public boolean isIdDuplicated(String id) {
        return userAuthRepository.existsById(id);
    }

    public void checkIdAvailable(String userId) {
        if (isIdDuplicated(userId)) {
            throw new BaseException(UserErrorCode.DUPLICATE_USER_ID);
        }
    }

    @Transactional
    public TokenResponse join(JoinRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new BaseException(UserErrorCode.PASSWORD_MISMATCH);
        }

        if (isIdDuplicated(request.getUserId())) {
            throw new BaseException(UserErrorCode.DUPLICATE_USER_ID);
        }

        try {
            User user = createUser(request);
            entityManager.persist(user);
            entityManager.flush();
            return tokenService.issueToken(request.getUserId());

        } catch (DataIntegrityViolationException e) {
            throw new BaseException(UserErrorCode.DUPLICATE_USER_ID);
        } catch (Exception e) {
            throw new BaseException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    private User createUser(JoinRequest request) {
        User user = User.builder()
                .id(request.getUserId())
                .nickname(request.getNickname())
                .build();

        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(BCRYPT_SALT_ROUNDS));

        user.addAuth(hashedPassword);

        return user;
    }

    public TokenResponse login(LoginRequest loginRequest) {
        UserAuth auth = userAuthRepository.findById(loginRequest.getUserId())
                .orElseThrow(() -> new BaseException(UserErrorCode.INVALID_LOGIN));

        if (!BCrypt.checkpw(loginRequest.getPassword(), auth.getPassword())) {
            throw new BaseException(UserErrorCode.INVALID_LOGIN);
        }
        return tokenService.issueToken(loginRequest.getUserId());
    }
}

