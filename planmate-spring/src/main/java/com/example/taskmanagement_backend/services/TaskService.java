package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.TaskChecklistDto.TaskChecklistResponseDto;
import com.example.taskmanagement_backend.dtos.TaskDto.CreateTaskRequestDto;
import com.example.taskmanagement_backend.dtos.TaskDto.TaskResponseDto;
import com.example.taskmanagement_backend.dtos.TaskDto.UpdateTaskRequestDto;
import com.example.taskmanagement_backend.dtos.TaskDto.MyTaskSummaryDto;
import com.example.taskmanagement_backend.entities.*;
import com.example.taskmanagement_backend.enums.TaskPriority;
import com.example.taskmanagement_backend.enums.TaskStatus;
import com.example.taskmanagement_backend.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.example.taskmanagement_backend.dtos.TaskDto.MyTaskSummaryDto;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskJpaRepository taskRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final TeamJpaRepository teamJpaRepository;
    private final TasksAssigneeJpaRepository  tasksAssigneeJpaRepository;


    public TaskResponseDto createTask(CreateTaskRequestDto dto) {
        Project project = null;
        if (dto.getProjectId() != null) {
            project = projectJpaRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        }

        User creator = userJpaRepository.findById(dto.getCreatorId())
                .orElseThrow(() -> new EntityNotFoundException("Creator not found"));

        Team team = null;
        if (dto.getGroupId() != null) {
            team = teamJpaRepository.findById(dto.getGroupId())
                    .orElseThrow(() -> new EntityNotFoundException("Group (Team) not found"));
        }

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .statusKey(dto.getStatus())
                .priorityKey(dto.getPriority())
                .startDate(dto.getStartDate())
                .deadline(dto.getDeadline())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .creator(creator)
                .project(project)
                .team(team)
                .build();

        taskRepository.save(task);


        if (dto.getAssignedToIds() != null && !dto.getAssignedToIds().isEmpty()) {
            for (Long userId : dto.getAssignedToIds()) {
                User assignee = userJpaRepository.findById(userId)
                        .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

                TaskAssignee taskAssignee = TaskAssignee.builder()
                        .task(task)
                        .user(assignee)
                        .assignedAt(LocalDateTime.now())
                        .build();

                tasksAssigneeJpaRepository.save(taskAssignee);
            }
        }

        return mapToDto(task);
    }


    public List<TaskResponseDto> getAllTasks() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String currentUserEmail = userDetails.getUsername();

        // Find current user
        User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        // Check user role and return appropriate tasks
        boolean isAdminOrOwner = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") ||
                                auth.getAuthority().equals("ROLE_OWNER") ||
                                auth.getAuthority().equals("ROLE_PROJECT_MANAGER"));

        List<Task> tasks;

        if (isAdminOrOwner) {
            // ADMIN, OWNER, PROJECT_MANAGER can see all tasks in their organization
            if (currentUser.getOrganization() != null) {
                tasks = taskRepository.findByCreator_OrganizationOrProject_Organization(
                        currentUser.getOrganization(), currentUser.getOrganization());
            } else {
                // If no organization, see all tasks (for system admins)
                tasks = taskRepository.findAll();
            }
            System.out.println("🔒 Admin/Owner user " + currentUserEmail + " accessing " + tasks.size() + " tasks");
        } else {
            // MEMBER, LEADER can only see tasks they created or are assigned to
            tasks = taskRepository.findByCreatorOrAssignees(currentUser, currentUser);
            System.out.println("🔒 Regular user " + currentUserEmail + " accessing " + tasks.size() + " own tasks");
        }

        return tasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ✅ COMPREHENSIVE: All tasks user participates in with pagination
    public Page<TaskResponseDto> getMyTasks(int page, int size, String sortBy, String sortDir) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String currentUserEmail = userDetails.getUsername();

        // Find current user
        User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        // Create pageable with sorting
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // ✅ COMPREHENSIVE: Get all tasks user participates in
        Page<Task> myParticipatingTasks = taskRepository.findMyParticipatingTasks(currentUser, pageable);

        System.out.println("🎯 COMPREHENSIVE: User " + currentUserEmail + " accessing " +
                          myParticipatingTasks.getTotalElements() + " participating tasks " +
                          "(page " + (page + 1) + "/" + myParticipatingTasks.getTotalPages() + ")");

        // Convert to DTO
        return myParticipatingTasks.map(this::mapToDto);
    }

    // ✅ PROJECTION: Lightweight summary with participation info and pagination
    public Page<MyTaskSummaryDto> getMyTasksSummary(int page, int size, String sortBy, String sortDir) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String currentUserEmail = userDetails.getUsername();

        // Find current user
        User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        // Create pageable with sorting
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // ✅ TEMPORARY: Get full tasks and convert to summary (until projection query is fixed)
        Page<Task> myTasks = taskRepository.findMyParticipatingTasks(currentUser, pageable);

        // Convert to MyTaskSummaryDto manually
        List<MyTaskSummaryDto> summaryList = myTasks.getContent().stream()
                .map(task -> convertToMyTaskSummaryDto(task, currentUser))
                .collect(Collectors.toList());

        Page<MyTaskSummaryDto> myTasksSummary = new PageImpl<>(summaryList, pageable, myTasks.getTotalElements());

        System.out.println("⚡ MANUAL CONVERSION: User " + currentUserEmail + " accessing " +
                          myTasksSummary.getTotalElements() + " task summaries with participation info " +
                          "(page " + (page + 1) + "/" + myTasksSummary.getTotalPages() + ")");

        return myTasksSummary;
    }

    // ✅ STATISTICS: Get participation statistics
    public Map<String, Object> getMyTasksStats() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String currentUserEmail = userDetails.getUsername();

        User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        long totalParticipatingTasks = taskRepository.countMyParticipatingTasks(currentUser);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalParticipatingTasks", totalParticipatingTasks);
        stats.put("userEmail", currentUserEmail);
        stats.put("userId", currentUser.getId());

        System.out.println("📊 STATS: User " + currentUserEmail + " has " + totalParticipatingTasks + " participating tasks");

        return stats;
    }

    public TaskResponseDto getTaskById(Long id) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String currentUserEmail = userDetails.getUsername();

        User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        // Check if user has permission to view this task
        boolean hasPermission = canUserAccessTask(currentUser, task, userDetails);

        if (!hasPermission) {
            throw new SecurityException("Access denied: You don't have permission to view this task");
        }

        return mapToDto(task);
    }

    private boolean canUserAccessTask(User currentUser, Task task, UserDetails userDetails) {
        // Check if user is admin/owner/project manager
        boolean isAdminOrOwner = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") ||
                                auth.getAuthority().equals("ROLE_OWNER") ||
                                auth.getAuthority().equals("ROLE_PROJECT_MANAGER"));

        if (isAdminOrOwner) {
            // Admin/Owner can see tasks in their organization
            if (currentUser.getOrganization() != null) {
                return task.getCreator().getOrganization() != null &&
                       task.getCreator().getOrganization().equals(currentUser.getOrganization());
            }
            return true; // System admin can see all
        } else {
            // Regular users can only see tasks they created or are assigned to
            if (task.getCreator().equals(currentUser)) {
                return true; // User created this task
            }

            // Check if user is assigned to this task
            return task.getAssignees().stream()
                    .anyMatch(assignee -> assignee.getUser().equals(currentUser));
        }
    }

    public TaskResponseDto updateTask(Long id, UpdateTaskRequestDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) task.setStatusKey(dto.getStatus());
        if (dto.getPriority() != null) task.setPriorityKey(dto.getPriority());
        if (dto.getStartDate() != null) task.setStartDate(dto.getStartDate());
        if (dto.getDeadline() != null) task.setDeadline(dto.getDeadline());
        if (dto.getGroupId() != null) {
            Team team = teamJpaRepository.findById(dto.getGroupId())
                    .orElseThrow(() -> new EntityNotFoundException("Group (Team) not found"));
            task.setTeam(team);
        }

        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);
        return mapToDto(task);
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    // ✅ REUSABLE: Get all tasks in a project (across all teams)
    public List<TaskResponseDto> getTasksByProjectId(Long projectId) {
        // Verify project exists
        Project project = projectJpaRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        // Get current authenticated user for security check
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String currentUserEmail = userDetails.getUsername();

        User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        // Get tasks by project
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        // Filter tasks based on user permissions
        List<Task> accessibleTasks = tasks.stream()
                .filter(task -> canUserAccessTask(currentUser, task, userDetails))
                .collect(Collectors.toList());

        System.out.println("🎯 PROJECT TASKS: User " + currentUserEmail + " accessing " +
                          accessibleTasks.size() + " tasks in project " + projectId);

        return accessibleTasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ✅ REUSABLE: Get all tasks of a team (across all projects)
    public List<TaskResponseDto> getTasksByTeamId(Long teamId) {
        // Verify team exists
        Team team = teamJpaRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + teamId));

        // Get current authenticated user for security check
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String currentUserEmail = userDetails.getUsername();

        User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        // Get tasks by team
        List<Task> tasks = taskRepository.findByTeamId(teamId);

        // Filter tasks based on user permissions
        List<Task> accessibleTasks = tasks.stream()
                .filter(task -> canUserAccessTask(currentUser, task, userDetails))
                .collect(Collectors.toList());

        System.out.println("🎯 TEAM TASKS: User " + currentUserEmail + " accessing " +
                          accessibleTasks.size() + " tasks in team " + teamId);

        return accessibleTasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public TaskResponseDto mapToDto(Task task) {
        return TaskResponseDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatusKey())
                .priority(task.getPriorityKey())
                .startDate(task.getStartDate())
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .creatorId(task.getCreator() != null ? task.getCreator().getId().longValue() : null)

                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .groupId(task.getTeam() != null ? task.getTeam().getId() : null)

                .checklists(
                        task.getChecklists() != null
                                ? task.getChecklists().stream()
                                .map(c -> TaskChecklistResponseDto.builder()
                                        .id(c.getId())
                                        .item(c.getItem())
                                        .isCompleted(c.getIsCompleted())
                                        .createdAt(c.getCreatedAt())
                                        .taskId(task.getId())
                                        .build())
                                .collect(Collectors.toList())
                                : null
                )
                .build();




    }

    // ✅ HELPER: Convert Task entity to MyTaskSummaryDto
    private MyTaskSummaryDto convertToMyTaskSummaryDto(Task task, User currentUser) {
        // Determine participation type (simplified)
        String participationType = "OTHER";
        if (task.getCreator().equals(currentUser)) {
            participationType = "CREATOR";
        } else if (task.getAssignees().stream().anyMatch(ta -> ta.getUser().equals(currentUser))) {
            participationType = "ASSIGNEE";
        }
        // Note: PROJECT_MEMBER and TEAM_MEMBER checks would require additional repository queries

        // Get creator name
        String creatorName = "";
        if (task.getCreator().getUserProfile() != null) {
            String firstName = task.getCreator().getUserProfile().getFirstName();
            String lastName = task.getCreator().getUserProfile().getLastName();
            creatorName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
            creatorName = creatorName.trim();
        }

        return MyTaskSummaryDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatusKey())
                .priority(task.getPriorityKey())
                .startDate(task.getStartDate())
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .creatorId(task.getCreator().getId())
                .creatorName(creatorName)
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .projectName(task.getProject() != null ? task.getProject().getName() : null)
                .teamId(task.getTeam() != null ? task.getTeam().getId() : null)
                .teamName(task.getTeam() != null ? task.getTeam().getName() : null)
                .checklistCount((long) task.getChecklists().size())
                .assigneeCount((long) task.getAssignees().size())
                .participationType(participationType)
                .build();
    }

}