package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository userJpaRepository;

    @Override
    public User getReferenceById(String userId) {
        return userJpaRepository.getReferenceById(userId);
    }

    @Override
    public boolean existsById(String userId) {
        return userJpaRepository.existsById(userId);
    }
}
