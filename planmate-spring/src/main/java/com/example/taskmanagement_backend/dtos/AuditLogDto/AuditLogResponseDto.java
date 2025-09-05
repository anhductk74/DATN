package com.example.taskmanagement_backend.dtos.AuditLogDto;


import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponseDto {

    private Long id;

    private Long userId;

    private String action;

    private LocalDateTime createdAt;
}