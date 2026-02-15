package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.exception.UserErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Optional<User> findById(String userId) {
        return userJpaRepository.findById(userId);
    }

    @Override
    public User findByIdOrElseThrow(String userId) {
        return this.findById(userId).orElseThrow(() -> new BaseException(UserErrorCode.USER_NOT_FOUND));
    }

    @Override
    public List<User> findAllByIdIn(Collection<String> reviewerIds) {
        return userJpaRepository.findAllByIdIn(reviewerIds);
    }
}
