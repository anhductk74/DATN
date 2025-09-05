package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.ProjectMember;
import com.example.taskmanagement_backend.entities.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberJpaRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamId(Long teamId);
}
