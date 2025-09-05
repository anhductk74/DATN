package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.AuditLogDto.*;
import com.example.taskmanagement_backend.services.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping
    public AuditLogResponseDto create(@Valid @RequestBody CreateAuditLogRequestDto dto) {
        return auditLogService.create(dto);
    }

    @GetMapping
    public List<AuditLogResponseDto> getAll() {
        return auditLogService.getAll();
    }

    @GetMapping("/{id}")
    public AuditLogResponseDto getById(@PathVariable Long id) {
        return auditLogService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        auditLogService.delete(id);
    }

    @GetMapping("/user/{userId}")
    public List<AuditLogResponseDto> getByUserId(@PathVariable Long userId) {

        return auditLogService.findByUserId(userId);
    }

}
