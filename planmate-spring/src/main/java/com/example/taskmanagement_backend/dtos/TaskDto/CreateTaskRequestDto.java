package com.example.taskmanagement_backend.dtos.TaskDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Priority is required")
    private String priority;

    private LocalDate startDate;

    private LocalDate deadline;

    // Không bắt buộc nữa
    private Long projectId;

    private Long groupId;

    private List<Long> assignedToIds;

    @NotNull(message = "Creator ID is required")
    private Long creatorId;
}
