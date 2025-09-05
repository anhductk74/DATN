package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.ProcessDto.TeamProjectProgressResponseDto;
import com.example.taskmanagement_backend.entities.Team;
import com.example.taskmanagement_backend.entities.TeamProjectProgress;
import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.repositories.TeamProjectProgressRepository;
import com.example.taskmanagement_backend.repositories.TeamJpaRepository;
import com.example.taskmanagement_backend.repositories.ProjectJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamProjectProgressService {

    private final TeamProjectProgressRepository teamProjectProgressRepository;
    private final TeamJpaRepository teamRepository;
    private final ProjectJpaRepository projectRepository;

    @Transactional(readOnly = true)
    public List<TeamProjectProgressResponseDto> getTeamProjectProgressByTeamId(Long teamId) {
        // Verify team exists
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        return teamProjectProgressRepository.findByTeamId(teamId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamProjectProgressResponseDto> getTeamProjectProgressByProjectId(Long projectId) {
        // Verify project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        return teamProjectProgressRepository.findByProjectId(projectId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamProjectProgress getOrCreateTeamProjectProgress(Long teamId, Long projectId) {
        Optional<TeamProjectProgress> existingProgress = teamProjectProgressRepository.findByTeamIdAndProjectId(teamId, projectId);
        
        if (existingProgress.isPresent()) {
            // Update existing progress
            TeamProjectProgress progress = existingProgress.get();
            updateTeamProjectProgressData(progress, teamId, projectId);
            return teamProjectProgressRepository.save(progress);
        } else {
            // Create new progress
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
            
            TeamProjectProgress newProgress = TeamProjectProgress.builder()
                    .team(team)
                    .project(project)
                    .build();
            
            updateTeamProjectProgressData(newProgress, teamId, projectId);
            return teamProjectProgressRepository.save(newProgress);
        }
    }

    private void updateTeamProjectProgressData(TeamProjectProgress progress, Long teamId, Long projectId) {
        Long totalTasks = teamProjectProgressRepository.countTotalTasksByTeamAndProject(teamId, projectId);
        Long completedTasks = teamProjectProgressRepository.countCompletedTasksByTeamAndProject(teamId, projectId);
        
        progress.setTotalTasks(totalTasks.intValue());
        progress.setCompletedTasks(completedTasks.intValue());
        progress.calculateCompletionPercentage();
        progress.setLastUpdated(LocalDateTime.now());
    }

    private TeamProjectProgressResponseDto convertToDto(TeamProjectProgress progress) {
        return TeamProjectProgressResponseDto.builder()
                .id(progress.getId())
                .teamId(progress.getTeam().getId())
                .teamName(progress.getTeam().getName())
                .projectId(progress.getProject().getId())
                .projectName(progress.getProject().getName())
                .totalTasks(progress.getTotalTasks())
                .completedTasks(progress.getCompletedTasks())
                .completionPercentage(progress.getCompletionPercentage())
                .lastUpdated(progress.getLastUpdated())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }

    // Method to refresh team-project progress data when task status changes
    @Transactional
    public void refreshTeamProjectProgressData(Long teamId, Long projectId) {
        if (teamId != null && projectId != null) {
            getOrCreateTeamProjectProgress(teamId, projectId);
        }
    }
}