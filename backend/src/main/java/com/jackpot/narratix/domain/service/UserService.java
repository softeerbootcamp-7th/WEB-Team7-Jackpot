package com.jackpot.narratix.domain.service;

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
        return userRepository.existsById(id);
    }

    @Transactional
    public void join(String id, String password, String nickname) {
        if (isIdDuplicated(id)) {
            throw new IllegalArgumentException("이미 존재하는 아이디");
        }

        User user = User.builder()
                .id(id)
                .nickname(nickname)
                .build();
        userRepository.save(user);

        UserAuth auth = UserAuth.builder()
                .userId(id)
                .password(password)
                .build();
        userAuthRepository.save(auth);
    }
}
