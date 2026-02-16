package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadFileRepository extends JpaRepository<UploadFile, String> {
}
