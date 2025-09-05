package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectJpaRepository extends JpaRepository<Project,Long> {


}
