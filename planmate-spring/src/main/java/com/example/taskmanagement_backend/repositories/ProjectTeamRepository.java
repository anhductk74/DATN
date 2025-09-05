package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {

    // Tìm relationship giữa project và team
    Optional<ProjectTeam> findByProjectIdAndTeamId(Long projectId, Long teamId);

    // Lấy tất cả teams trong một project
    List<ProjectTeam> findByProjectId(Long projectId);

    // Lấy tất cả projects của một team
    List<ProjectTeam> findByTeamId(Long teamId);

    // Query để lấy team IDs trong project
    @Query("SELECT pt.team.id FROM ProjectTeam pt WHERE pt.project.id = :projectId")
    List<Long> findTeamIdsByProjectId(@Param("projectId") Long projectId);

    // Query để lấy project IDs của team
    @Query("SELECT pt.project.id FROM ProjectTeam pt WHERE pt.team.id = :teamId")
    List<Long> findProjectIdsByTeamId(@Param("teamId") Long teamId);
}