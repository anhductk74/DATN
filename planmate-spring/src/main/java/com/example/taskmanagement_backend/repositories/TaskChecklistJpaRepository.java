package com.example.taskmanagement_backend.repositories;// package com.example.taskmanagement_backend.repositories;

 import com.example.taskmanagement_backend.entities.TaskChecklist;
 import org.springframework.data.jpa.repository.JpaRepository;
 import org.springframework.stereotype.Repository;

 import java.util.List;

@Repository
 public interface TaskChecklistJpaRepository extends JpaRepository<TaskChecklist, Long> {
  List<TaskChecklist> findByTaskId(Long taskId);

 }
