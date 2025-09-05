package com.example.taskmanagement_backend.dtos.TaskAttachmentDto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAttachmentResponseDto {

    private Long id;

    private Long taskId;

    private String fileUrl;

    private Long uploadedById;

    private LocalDateTime createdAt;
}
