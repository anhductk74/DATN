package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.ProjectDto.CreateProjectRequestDto;
import com.example.taskmanagement_backend.dtos.ProjectDto.ProjectResponseDto;
import com.example.taskmanagement_backend.dtos.ProjectDto.UpdateProjectRequestDto;
import com.example.taskmanagement_backend.dtos.TeamDto.TeamResponseDto;
import com.example.taskmanagement_backend.entities.Organization;
import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.entities.User;
import com.example.taskmanagement_backend.enums.ProjectStatus;
import com.example.taskmanagement_backend.repositories.OrganizationJpaRepository;
import com.example.taskmanagement_backend.repositories.ProjectJpaRepository;
import com.example.taskmanagement_backend.repositories.TeamJpaRepository;
import com.example.taskmanagement_backend.repositories.UserJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectJpaRepository projectJpaRepository;

    @Autowired
    UserJpaRepository userRepo;
    @Autowired
    OrganizationJpaRepository orgRepo;

    public List<ProjectResponseDto> getAllProjects() {
        return projectJpaRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public ProjectResponseDto getProjectById(Long id) {
        return projectJpaRepository.findById(id).map(this::convertToDto).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public ProjectResponseDto createProject(CreateProjectRequestDto dto) {
        User pmUser = userRepo.findByEmail(dto.getEmailPm())
                .orElseThrow(() -> new RuntimeException("Project Manager not found with email: " + dto.getEmailPm()));
        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .owner(dto.getOwnerId() != null ? getUser(dto.getOwnerId()) : null)
                .projectManager(pmUser)
                .organization(dto.getOrganizationId() != null ? getOrg(dto.getOrganizationId()) : null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .status(ProjectStatus.PLANNED)
                .build();
        return convertToDto(projectJpaRepository.save(project));
    }

    public  ProjectResponseDto updateProject(Long id,UpdateProjectRequestDto dto) {
        Project project = convertToEntity(getProjectById(id));
        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) project.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) project.setEndDate(dto.getEndDate());
        if (dto.getOwnerId() != null) project.setOwner(getUser(dto.getOwnerId()));
        if (dto.getEmailPm() != null) {
            User pmUser = userRepo.findByEmail(dto.getEmailPm())
                    .orElseThrow(() -> new RuntimeException("Project Manager not found with email: " + dto.getEmailPm()));
            project.setProjectManager(pmUser);
        }
        if (dto.getOrganizationId() != null) project.setOrganization(getOrg(dto.getOrganizationId()));
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());
        project.setUpdatedAt(LocalDateTime.now());
        return convertToDto(projectJpaRepository.save(project));
    }

    public void deleteProjectById(Long id) {
        projectJpaRepository.deleteById(id);
    }

    private ProjectResponseDto convertToDto(Project project) {
        return ProjectResponseDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus() != null ? project.getStatus() : null)
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .ownerId(Long.valueOf(project.getOwner() != null ? project.getOwner().getId() : null))
                .pmId(Long.valueOf(project.getProjectManager() != null ? project.getProjectManager().getId() : null))
                .organizationId(project.getOrganization() != null ? project.getOrganization().getId() : null)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }



    private Project convertToEntity(ProjectResponseDto dto) {
        return Project.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .owner(getUser(dto.getOwnerId()))
                .projectManager(getUser(dto.getPmId()))
                .organization(getOrg(dto.getOrganizationId()))
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    private User getUser(Long id) {
        return id != null ? userRepo.findById(id).orElse(null) : null;
    }

    private Organization getOrg(Long id) {
        return id != null ? orgRepo.findById(id).orElse(null) : null;
    }
}
