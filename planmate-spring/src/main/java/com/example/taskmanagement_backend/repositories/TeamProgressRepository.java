package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.TeamProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamProgressRepository extends JpaRepository<TeamProgress, Long> {

    // Lấy progress của team (across all projects)
    Optional<TeamProgress> findByTeamId(Long teamId);

    // Query để tính toán số task hoàn thành của team (tất cả projects)
    @Query("SELECT COUNT(t) FROM Task t WHERE t.team.id = :teamId AND t.statusKey = 'DONE'")
    Long countCompletedTasksByTeam(@Param("teamId") Long teamId);

    // Query để tính toán tổng số task của team (tất cả projects)
    @Query("SELECT COUNT(t) FROM Task t WHERE t.team.id = :teamId")
    Long countTotalTasksByTeam(@Param("teamId") Long teamId);
}