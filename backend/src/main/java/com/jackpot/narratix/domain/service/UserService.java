package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public boolean isIdDuplicated(String id) {
        return userRepository.existsById(id);
    }

    @Transactional
    public void join(User user) {
        userRepository.save(user);
    }
}
