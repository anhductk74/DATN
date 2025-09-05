package com.example.taskmanagement_backend.dtos.TaskDto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequestDto {

    private String title;

    private String description;

    private String status;

    private String priority;

    private LocalDate startDate;

    private LocalDate deadline;

    private List<Long> assignedToIds;

    private Long groupId;
}
