package com.example.taskmanagement_backend.dtos.ProcessDto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectProgressResponseDto {
    
    private Long id;
    private Long projectId;
    private String projectName;
    private Integer totalTasks;
    private Integer completedTasks;
    private Double completionPercentage;
    private Integer totalTeams;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Optional: Include team-project progress details
    private List<TeamProjectProgressResponseDto> teamProjectProgressList;
}