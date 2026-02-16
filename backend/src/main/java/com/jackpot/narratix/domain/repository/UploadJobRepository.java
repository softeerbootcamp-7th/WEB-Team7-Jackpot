package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadJob;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadJobRepository extends JpaRepository<UploadJob, String> {
}
