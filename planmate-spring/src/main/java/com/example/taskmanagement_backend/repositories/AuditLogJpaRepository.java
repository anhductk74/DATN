package com.example.taskmanagement_backend.repositories;
import com.example.taskmanagement_backend.entities.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogJpaRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);

}
