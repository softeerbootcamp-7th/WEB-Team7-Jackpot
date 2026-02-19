package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.LabeledQnA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LabeledQnARepository extends JpaRepository<LabeledQnA, Long> {

    @Query("SELECT lq FROM LabeledQnA lq JOIN FETCH lq.uploadFile uf WHERE uf.uploadJob.id = :uploadJobId")
    List<LabeledQnA> findAllByUploadJobId(@Param("uploadJobId") String uploadJobId);
}
