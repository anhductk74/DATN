package com.example.taskmanagement_backend.dtos.NotificationDto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {

    private Long id;

    private Long userId;

    private String content;

    private Boolean isRead;

    private LocalDateTime createdAt;
}
