package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.User;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository {

    User getReferenceById(String userId);

    boolean existsById(String userId);
}
