package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMemberJpaRepository extends JpaRepository<ProjectMember, Long> {
   List<ProjectMember> findByProjectId(Long projectId);
}
