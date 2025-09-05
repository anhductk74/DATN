package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.TeamProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamProjectProgressRepository extends JpaRepository<TeamProjectProgress, Long> {

    // Lấy progress của team trong một project cụ thể
    Optional<TeamProjectProgress> findByTeamIdAndProjectId(Long teamId, Long projectId);

    // Lấy tất cả team progress trong một project
    List<TeamProjectProgress> findByProjectId(Long projectId);

    // Lấy tất cả project progress của một team
    List<TeamProjectProgress> findByTeamId(Long teamId);

    // Query để tính toán số task hoàn thành của team trong project
    @Query("SELECT COUNT(t) FROM Task t WHERE t.team.id = :teamId AND t.project.id = :projectId AND t.statusKey = 'DONE'")
    Long countCompletedTasksByTeamAndProject(@Param("teamId") Long teamId, @Param("projectId") Long projectId);

    // Query để tính toán tổng số task của team trong project
    @Query("SELECT COUNT(t) FROM Task t WHERE t.team.id = :teamId AND t.project.id = :projectId")
    Long countTotalTasksByTeamAndProject(@Param("teamId") Long teamId, @Param("projectId") Long projectId);
}