package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.TeamDto.CreateTeamResponseDto;
import com.example.taskmanagement_backend.dtos.TeamDto.TeamResponseDto;
import com.example.taskmanagement_backend.dtos.TeamDto.UpdateTeamResponseDto;
import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.entities.ProjectTeam;
import com.example.taskmanagement_backend.entities.Team;
import com.example.taskmanagement_backend.entities.User;
import com.example.taskmanagement_backend.repositories.ProjectJpaRepository;
import com.example.taskmanagement_backend.repositories.ProjectTeamRepository;
import com.example.taskmanagement_backend.repositories.TeamJpaRepository;
import com.example.taskmanagement_backend.repositories.UserJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
public class TeamService {
    @Autowired
    private TeamJpaRepository  teamJpaRepository;
    @Autowired
    UserJpaRepository userJpaRepository;
    @Autowired
    ProjectJpaRepository projectJpaRepository;
    @Autowired
    ProjectTeamRepository projectTeamRepository;

    public List<TeamResponseDto> getAllTeams() {
        return teamJpaRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public TeamResponseDto getTeamById(Long id) {
        return teamJpaRepository.findById(id).map(this::convertToDto).orElse(null);
    }
    public List<TeamResponseDto> findByProjectId(Long projectId) {
        return teamJpaRepository.findByProjectTeams_Project_Id(projectId).stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public TeamResponseDto createTeams(CreateTeamResponseDto dto){
        Team team = Team.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .leader(dto.getLeader_id() != null ? getUser(dto.getLeader_id()) : null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Team savedTeam = teamJpaRepository.save(team);
        
        // If project_id is provided, create the ProjectTeam relationship
        if (dto.getProject_id() != null) {
            Project project = getProject(dto.getProject_id());
            if (project != null) {
                ProjectTeam projectTeam = ProjectTeam.builder()
                        .project(project)
                        .team(savedTeam)
                        .build();
                projectTeamRepository.save(projectTeam);
            }
        }
        
        return convertToDto(savedTeam);
    }

    public TeamResponseDto updateTeams(Long id, UpdateTeamResponseDto dto){
        Optional<Team> teamOpt = teamJpaRepository.findById(id);
        if (!teamOpt.isPresent()) {
            return null;
        }
        
        Team team = teamOpt.get();
        if(dto.getName() != null) team.setName(dto.getName());
        if(dto.getDescription() != null) team.setDescription(dto.getDescription());
        if(dto.getLeaderId() != null) team.setLeader(getUser(dto.getLeaderId()));
        team.setUpdatedAt(LocalDateTime.now());
        
        Team savedTeam = teamJpaRepository.save(team);
        
        // Handle project relationship update if provided
        if(dto.getProjectId() != null) {
            Project project = getProject(dto.getProjectId());
            if (project != null) {
                // Check if relationship already exists
                Optional<ProjectTeam> existingRelation = projectTeamRepository.findByProjectIdAndTeamId(dto.getProjectId(), id);
                if (!existingRelation.isPresent()) {
                    // Create new relationship
                    ProjectTeam projectTeam = ProjectTeam.builder()
                            .project(project)
                            .team(savedTeam)
                            .build();
                    projectTeamRepository.save(projectTeam);
                }
            }
        }
        
        return convertToDto(savedTeam);
    }

    public boolean deleteTeamById(Long id) {
        Optional<Team> team = teamJpaRepository.findById(id);
        if(team.isPresent()) {
            teamJpaRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private TeamResponseDto convertToDto(Team team) {
        // Get the first project this team is associated with (for backward compatibility)
        List<ProjectTeam> projectTeams = projectTeamRepository.findByTeamId(team.getId());
        Long projectId = projectTeams.isEmpty() ? null : projectTeams.get(0).getProject().getId();
        
        return TeamResponseDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .projectId(projectId)
                .leaderId(team.getLeader() != null ? team.getLeader().getId() : null)
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
        .build();
    }

    private Team convertToEntity(TeamResponseDto dto) {
        return Team.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .leader(dto.getLeaderId() != null ? getUser(dto.getLeaderId()) : null)
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    private User getUser(Long id) {
        return id != null ? userJpaRepository.findById(id).orElse(null) : null;
    }

    private Project getProject(Long id) {
        return id != null ? projectJpaRepository.findById(id).orElse(null) : null;
    }
}
