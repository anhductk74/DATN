package com.example.taskmanagement_backend.dtos.TaskDto;

import com.example.taskmanagement_backend.dtos.TaskChecklistDto.TaskChecklistResponseDto;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDto {

    private Long id;

    private String title;

    private String description;

    private String status;

    private String priority;

    private LocalDate startDate;

    private LocalDate deadline;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<Long> assignedToIds;

    private Long groupId;

    private Long projectId;

    private Long creatorId;
    private List<TaskChecklistResponseDto> checklists;

}
