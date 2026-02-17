package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.User;

public interface UserRepository {

    User getReferenceById(String userId);
}
