package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface UserJpaRepository extends JpaRepository<User, String> {
    List<User> findAllByIdIn(Collection<String> userIds);
}
