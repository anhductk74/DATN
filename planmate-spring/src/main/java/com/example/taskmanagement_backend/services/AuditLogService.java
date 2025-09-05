package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.AuditLogDto.*;
import com.example.taskmanagement_backend.entities.AuditLog;
import com.example.taskmanagement_backend.entities.User;
import com.example.taskmanagement_backend.repositories.AuditLogJpaRepository;
import com.example.taskmanagement_backend.repositories.UserJpaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogJpaRepository auditRepo;

    @Autowired
    private UserJpaRepository userRepo;

    public AuditLogResponseDto create(CreateAuditLogRequestDto dto) {
        User user = null;
        if (dto.getUserId() != null) {
            user = userRepo.findById(dto.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
        }

        AuditLog log = AuditLog.builder()
                .user(user)
                .action(dto.getAction())
                .createdAt(LocalDateTime.now())
                .build();

        return toDto(auditRepo.save(log));
    }

    public AuditLogResponseDto getById(Long id) {
        return auditRepo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("AuditLog not found"));
    }

    public List<AuditLogResponseDto> getAll() {
        return auditRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        if (!auditRepo.existsById(id)) {
            throw new EntityNotFoundException("AuditLog not found");
        }
        auditRepo.deleteById(id);
    }

    private AuditLogResponseDto toDto(AuditLog log) {
        return AuditLogResponseDto.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .action(log.getAction())
                .createdAt(log.getCreatedAt())
                .build();
    }
    // Find AuditLog by id user
    public List<AuditLogResponseDto> findByUserId(Long userId) {
        return auditRepo.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

}
