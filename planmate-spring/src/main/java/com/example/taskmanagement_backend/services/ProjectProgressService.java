package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.ProcessDto.ProjectProgressResponseDto;
import com.example.taskmanagement_backend.dtos.ProcessDto.TeamProjectProgressResponseDto;
import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.entities.ProjectProgress;
import com.example.taskmanagement_backend.repositories.ProjectProgressRepository;
import com.example.taskmanagement_backend.repositories.ProjectJpaRepository;
import com.example.taskmanagement_backend.repositories.ProjectTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectProgressService {

    private final ProjectProgressRepository projectProgressRepository;
    private final ProjectJpaRepository projectRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final TeamProjectProgressService teamProjectProgressService;

    @Transactional(readOnly = true)
    public ProjectProgressResponseDto getProjectProgress(Long projectId) {
        // Verify project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Get or create project progress
        ProjectProgress progress = getOrCreateProjectProgress(projectId);
        
        // Get team-project progress details
        List<TeamProjectProgressResponseDto> teamProjectProgressList = teamProjectProgressService.getTeamProjectProgressByProjectId(projectId);
        
        return convertToDto(progress, teamProjectProgressList);
    }

    @Transactional
    public ProjectProgress getOrCreateProjectProgress(Long projectId) {
        Optional<ProjectProgress> existingProgress = projectProgressRepository.findByProjectId(projectId);
        
        if (existingProgress.isPresent()) {
            // Update existing progress
            ProjectProgress progress = existingProgress.get();
            updateProjectProgressData(progress, projectId);
            return projectProgressRepository.save(progress);
        } else {
            // Create new progress
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
            
            ProjectProgress newProgress = ProjectProgress.builder()
                    .project(project)
                    .build();
            
            updateProjectProgressData(newProgress, projectId);
            return projectProgressRepository.save(newProgress);
        }
    }

    private void updateProjectProgressData(ProjectProgress progress, Long projectId) {
        // Calculate totals from all tasks in the project (across all teams)
        Long totalTasks = projectProgressRepository.countTotalTasksByProject(projectId);
        Long completedTasks = projectProgressRepository.countCompletedTasksByProject(projectId);
        Long totalTeams = projectProgressRepository.countTeamsByProject(projectId);
        
        progress.setTotalTasks(totalTasks.intValue());
        progress.setCompletedTasks(completedTasks.intValue());
        progress.setTotalTeams(totalTeams.intValue());
        progress.calculateCompletionPercentage();
        progress.setLastUpdated(LocalDateTime.now());
    }

    private ProjectProgressResponseDto convertToDto(ProjectProgress progress, List<TeamProjectProgressResponseDto> teamProjectProgressList) {
        return ProjectProgressResponseDto.builder()
                .id(progress.getId())
                .projectId(progress.getProject().getId())
                .projectName(progress.getProject().getName())
                .totalTasks(progress.getTotalTasks())
                .completedTasks(progress.getCompletedTasks())
                .completionPercentage(progress.getCompletionPercentage())
                .totalTeams(progress.getTotalTeams())
                .lastUpdated(progress.getLastUpdated())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .teamProjectProgressList(teamProjectProgressList)
                .build();
    }

    // Method to refresh project progress data when task status changes
    @Transactional
    public void refreshProjectProgressData(Long projectId) {
        if (projectId != null) {
            getOrCreateProjectProgress(projectId);
        }
    }

    // Method to refresh all progress data when task changes
    @Transactional
    public void refreshAllProgressData(Long teamId, Long projectId) {
        if (teamId != null && projectId != null) {
            // Refresh team-project progress first
            teamProjectProgressService.refreshTeamProjectProgressData(teamId, projectId);
            // Then refresh project progress
            refreshProjectProgressData(projectId);
        }
    }
}