package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {

    Optional<ShareLink> findByShareId(String shareId);
}
