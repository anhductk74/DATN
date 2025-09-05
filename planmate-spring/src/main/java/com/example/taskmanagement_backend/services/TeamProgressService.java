package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.ProcessDto.TeamProgressResponseDto;
import com.example.taskmanagement_backend.entities.Team;
import com.example.taskmanagement_backend.entities.TeamProgress;
import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.repositories.TeamProgressRepository;
import com.example.taskmanagement_backend.repositories.TeamJpaRepository;
import com.example.taskmanagement_backend.repositories.ProjectJpaRepository;
import com.example.taskmanagement_backend.repositories.ProjectTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamProgressService {

    private final TeamProgressRepository teamProgressRepository;
    private final TeamJpaRepository teamRepository;
    private final ProjectJpaRepository projectRepository;
    private final ProjectTeamRepository projectTeamRepository;

    @Transactional(readOnly = true)
    public TeamProgressResponseDto getTeamProgressByTeamId(Long teamId) {
        // Verify team exists
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Get or create team progress (across all projects)
        TeamProgress progress = getOrCreateTeamProgress(teamId);
        return convertToDto(progress);
    }

    @Transactional(readOnly = true)
    public List<TeamProgressResponseDto> getAllTeamsProgressByProjectId(Long projectId) {
        // Verify project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Get all teams in this project
        List<Long> teamIds = projectTeamRepository.findTeamIdsByProjectId(projectId);
        
        return teamIds.stream()
                .map(this::getTeamProgressByTeamId)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamProgress getOrCreateTeamProgress(Long teamId) {
        Optional<TeamProgress> existingProgress = teamProgressRepository.findByTeamId(teamId);
        
        if (existingProgress.isPresent()) {
            // Update existing progress
            TeamProgress progress = existingProgress.get();
            updateTeamProgressData(progress, teamId);
            return teamProgressRepository.save(progress);
        } else {
            // Create new progress
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
            
            TeamProgress newProgress = TeamProgress.builder()
                    .team(team)
                    .build();
            
            updateTeamProgressData(newProgress, teamId);
            return teamProgressRepository.save(newProgress);
        }
    }

    private void updateTeamProgressData(TeamProgress progress, Long teamId) {
        Long totalTasks = teamProgressRepository.countTotalTasksByTeam(teamId);
        Long completedTasks = teamProgressRepository.countCompletedTasksByTeam(teamId);
        
        progress.setTotalTasks(totalTasks.intValue());
        progress.setCompletedTasks(completedTasks.intValue());
        progress.calculateCompletionPercentage();
        progress.setLastUpdated(LocalDateTime.now());
    }

    private TeamProgressResponseDto convertToDto(TeamProgress progress) {
        return TeamProgressResponseDto.builder()
                .id(progress.getId())
                .teamId(progress.getTeam().getId())
                .teamName(progress.getTeam().getName())
                .totalTasks(progress.getTotalTasks())
                .completedTasks(progress.getCompletedTasks())
                .completionPercentage(progress.getCompletionPercentage())
                .lastUpdated(progress.getLastUpdated())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }

    // Method to refresh team progress data when task status changes
    @Transactional
    public void refreshTeamProgressData(Long teamId) {
        if (teamId != null) {
            getOrCreateTeamProgress(teamId);
        }
    }
}