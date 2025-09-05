package com.example.taskmanagement_backend.repositories;


import com.example.taskmanagement_backend.entities.Task;
import com.example.taskmanagement_backend.entities.TaskAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TasksAssigneeJpaRepository extends JpaRepository<TaskAssignee, Long> {

}
