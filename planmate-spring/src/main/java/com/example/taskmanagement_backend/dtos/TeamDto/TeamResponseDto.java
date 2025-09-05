package com.example.taskmanagement_backend.dtos.TeamDto;

import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.entities.User;
import jakarta.persistence.Column;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponseDto {
    private Long id;

    private String name;

    private String description;

    private Long projectId;

    private Long leaderId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
