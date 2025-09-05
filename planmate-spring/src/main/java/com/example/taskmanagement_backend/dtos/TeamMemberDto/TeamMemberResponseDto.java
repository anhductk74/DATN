package com.example.taskmanagement_backend.dtos.TeamMemberDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponseDto {

    private Long id;

    private Long teamId;

    private Long userId;

    private LocalDateTime joinedAt;
}