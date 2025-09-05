package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.Organization;
import com.example.taskmanagement_backend.entities.Task;
import com.example.taskmanagement_backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskJpaRepository extends JpaRepository<Task, Long> {
    
    // Find tasks by creator or where user is assigned
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN t.assignees ta " +
           "WHERE t.creator = :user OR ta.user = :assignedUser")
    List<Task> findByCreatorOrAssignees(@Param("user") User user, @Param("assignedUser") User assignedUser);


    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.creator " +
           "LEFT JOIN FETCH t.project " +
           "LEFT JOIN FETCH t.team " +
           "LEFT JOIN FETCH t.checklists " +
           "LEFT JOIN t.assignees ta " +
           "WHERE t.creator = :user OR ta.user = :assignedUser")
    List<Task> findMyTasksOptimized(@Param("user") User user);


    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN t.assignees ta " +
           "WHERE t.creator = :user OR ta.user = :user")
    List<Task> findMyTasksSummary(@Param("user") User user);
    
    // Find tasks by organization (for admin/owner access)
    @Query("SELECT DISTINCT t FROM Task t " +
           "WHERE t.creator.organization = :creatorOrg OR t.project.organization = :projectOrg")
    List<Task> findByCreator_OrganizationOrProject_Organization(
            @Param("creatorOrg") Organization creatorOrg, 
            @Param("projectOrg") Organization projectOrg);
    
    // Find tasks by creator only
    List<Task> findByCreator(User creator);
    
    // Find tasks by project
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId")
    List<Task> findByProjectId(@Param("projectId") Long projectId);
    
    // Find tasks by team
    @Query("SELECT t FROM Task t WHERE t.team.id = :teamId")
    List<Task> findByTeamId(@Param("teamId") Long teamId);

    // ✅ COMPREHENSIVE: All tasks user participates in with pagination
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN t.assignees ta " +
           "WHERE t.creator = :user " +                    // Tasks user created
           "OR ta.user = :user " +                         // Tasks user is assigned to
           "OR EXISTS(SELECT 1 FROM ProjectMember pm WHERE pm.project = t.project AND pm.user = :user) " +     // Tasks in projects user is member of
           "OR EXISTS(SELECT 1 FROM TeamMember tm WHERE tm.team = t.team AND tm.user = :user)")    // Tasks in teams user is member of
    org.springframework.data.domain.Page<Task> findMyParticipatingTasks(
            @Param("user") User user, 
            org.springframework.data.domain.Pageable pageable);

    // ✅ COUNT: Total participating tasks for statistics
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
           "LEFT JOIN t.assignees ta " +
           "WHERE t.creator = :user " +
           "OR ta.user = :user " +
           "OR EXISTS(SELECT 1 FROM ProjectMember pm WHERE pm.project = t.project AND pm.user = :user) " +
           "OR EXISTS(SELECT 1 FROM TeamMember tm WHERE tm.team = t.team AND tm.user = :user)")
    long countMyParticipatingTasks(@Param("user") User user);
}
