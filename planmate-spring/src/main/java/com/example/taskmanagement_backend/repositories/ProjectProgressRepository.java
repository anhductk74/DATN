package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.ProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectProgressRepository extends JpaRepository<ProjectProgress, Long> {

    // Lấy progress của project
    Optional<ProjectProgress> findByProjectId(Long projectId);

    // Query để tính toán số task hoàn thành của project (từ tất cả teams)
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.statusKey = 'DONE'")
    Long countCompletedTasksByProject(@Param("projectId") Long projectId);

    // Query để tính toán tổng số task của project (từ tất cả teams)
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countTotalTasksByProject(@Param("projectId") Long projectId);

    // Query để đếm số teams trong project
    @Query("SELECT COUNT(pt) FROM ProjectTeam pt WHERE pt.project.id = :projectId")
    Long countTeamsByProject(@Param("projectId") Long projectId);
}