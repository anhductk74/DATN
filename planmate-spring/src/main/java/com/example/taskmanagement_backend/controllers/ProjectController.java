package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.ProjectDto.CreateProjectRequestDto;
import com.example.taskmanagement_backend.dtos.ProjectDto.ProjectResponseDto;
import com.example.taskmanagement_backend.dtos.ProjectDto.UpdateProjectRequestDto;
import com.example.taskmanagement_backend.dtos.ProcessDto.ProjectProgressResponseDto;
import com.example.taskmanagement_backend.dtos.TaskDto.TaskResponseDto;
import com.example.taskmanagement_backend.services.ProjectService;
import com.example.taskmanagement_backend.services.ProjectProgressService;
import com.example.taskmanagement_backend.services.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private ProjectProgressService projectProgressService;
    
    @Autowired
    private TaskService taskService;

    @GetMapping
    public List<ProjectResponseDto> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> getProjectById(@Valid @PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectResponseDto> createProject(@Valid @RequestBody CreateProjectRequestDto projectDto) {
        return ResponseEntity.ok(projectService.createProject(projectDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> updateProject(@PathVariable Long id, @Valid @RequestBody UpdateProjectRequestDto projectDto) {
        return ResponseEntity.ok(projectService.updateProject(id,projectDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> deleteProject(@PathVariable Long id) {
        projectService.deleteProjectById(id);
        return ResponseEntity.ok().build();
    }

    // Project Progress Endpoints
    @GetMapping("/{id}/progress")
    public ResponseEntity<ProjectProgressResponseDto> getProjectProgress(@PathVariable Long id) {
        try {
            ProjectProgressResponseDto progress = projectProgressService.getProjectProgress(id);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<ProjectProgressResponseDto> refreshProjectProgress(@PathVariable Long id) {
        try {
            ProjectProgressResponseDto progress = projectProgressService.getProjectProgress(id);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Project Tasks Endpoint
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskResponseDto>> getProjectTasks(@PathVariable Long id) {
        try {
            List<TaskResponseDto> tasks = taskService.getTasksByProjectId(id);
            return ResponseEntity.ok(tasks);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
