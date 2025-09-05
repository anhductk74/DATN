package com.example.taskmanagement_backend.dtos.ProcessDto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamProjectProgressResponseDto {
    
    private Long id;
    private Long teamId;
    private String teamName;
    private Long projectId;
    private String projectName;
    private Integer totalTasks;
    private Integer completedTasks;
    private Double completionPercentage;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}