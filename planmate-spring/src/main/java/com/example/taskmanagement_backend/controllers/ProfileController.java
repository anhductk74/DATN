package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.ProfileDto.TaskPriorityDto;
import com.example.taskmanagement_backend.dtos.ProfileDto.TaskStatusDto;
import com.example.taskmanagement_backend.dtos.ProfileDto.UpdateTaskPriorityRequestDto;
import com.example.taskmanagement_backend.dtos.ProfileDto.UpdateTaskStatusRequestDto;
import com.example.taskmanagement_backend.services.UserTaskConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User profile customization APIs")
public class ProfileController {

    private final UserTaskConfigService userTaskConfigService;

    @GetMapping("/task-status")
    @Operation(summary = "Get user's task statuses", 
               description = "Get user's customized task statuses. If not customized, returns default statuses.")
    public ResponseEntity<List<TaskStatusDto>> getUserTaskStatuses(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<TaskStatusDto> statuses = userTaskConfigService.getUserTaskStatuses(userId);
        return ResponseEntity.ok(statuses);
    }

    @PutMapping("/task-status")
    @Operation(summary = "Update user's task statuses", 
               description = "Update user's task status configuration (add, remove, change colors, etc.)")
    public ResponseEntity<List<TaskStatusDto>> updateUserTaskStatuses(
            Authentication authentication,
            @Valid @RequestBody UpdateTaskStatusRequestDto request) {
        Long userId = getUserIdFromAuth(authentication);
        List<TaskStatusDto> updatedStatuses = userTaskConfigService.updateUserTaskStatuses(userId, request);
        return ResponseEntity.ok(updatedStatuses);
    }

    @DeleteMapping("/task-status")
    @Operation(summary = "Reset user's task statuses to defaults", 
               description = "Reset user's task status configuration back to system defaults")
    public ResponseEntity<List<TaskStatusDto>> resetUserTaskStatuses(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<TaskStatusDto> defaultStatuses = userTaskConfigService.resetUserTaskStatuses(userId);
        return ResponseEntity.ok(defaultStatuses);
    }

    @GetMapping("/task-priority")
    @Operation(summary = "Get user's task priorities", 
               description = "Get user's customized task priorities. If not customized, returns default priorities.")
    public ResponseEntity<List<TaskPriorityDto>> getUserTaskPriorities(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<TaskPriorityDto> priorities = userTaskConfigService.getUserTaskPriorities(userId);
        return ResponseEntity.ok(priorities);
    }

    @PutMapping("/task-priority")
    @Operation(summary = "Update user's task priorities", 
               description = "Update user's task priority configuration (add, remove, change colors, etc.)")
    public ResponseEntity<List<TaskPriorityDto>> updateUserTaskPriorities(
            Authentication authentication,
            @Valid @RequestBody UpdateTaskPriorityRequestDto request) {
        Long userId = getUserIdFromAuth(authentication);
        List<TaskPriorityDto> updatedPriorities = userTaskConfigService.updateUserTaskPriorities(userId, request);
        return ResponseEntity.ok(updatedPriorities);
    }

    @DeleteMapping("/task-priority")
    @Operation(summary = "Reset user's task priorities to defaults", 
               description = "Reset user's task priority configuration back to system defaults")
    public ResponseEntity<List<TaskPriorityDto>> resetUserTaskPriorities(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<TaskPriorityDto> defaultPriorities = userTaskConfigService.resetUserTaskPriorities(userId);
        return ResponseEntity.ok(defaultPriorities);
    }

    private Long getUserIdFromAuth(Authentication authentication) {
        // Assuming the authentication principal contains user ID
        // This might need to be adjusted based on your authentication implementation
        return Long.valueOf(authentication.getName());
    }
}