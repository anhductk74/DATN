package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.TeamDto.CreateTeamResponseDto;
import com.example.taskmanagement_backend.dtos.TeamDto.TeamResponseDto;
import com.example.taskmanagement_backend.dtos.TeamDto.UpdateTeamResponseDto;
import com.example.taskmanagement_backend.dtos.ProcessDto.TeamProgressResponseDto;
import com.example.taskmanagement_backend.dtos.TaskDto.TaskResponseDto;
import com.example.taskmanagement_backend.services.TeamService;
import com.example.taskmanagement_backend.services.TeamProgressService;
import com.example.taskmanagement_backend.services.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
    @Autowired
    private TeamService teamService;
    
    @Autowired
    private TeamProgressService teamProgressService;
    
    @Autowired
    private TaskService taskService;

    @GetMapping
    public List<TeamResponseDto> findAll() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public TeamResponseDto findOne(@PathVariable Long id) {
        return teamService.getTeamById(id);
    }

    @PostMapping
    public TeamResponseDto createTeam(@Valid @RequestBody CreateTeamResponseDto dto) {
        return teamService.createTeams(dto);
    }

    @PutMapping("/{id}")
    public TeamResponseDto updateTeam(@PathVariable Long id, @Valid @RequestBody UpdateTeamResponseDto dto) {
        return teamService.updateTeams(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTeam(@PathVariable Long id) {
        if(teamService.deleteTeamById(id)){
            return ResponseEntity.ok("Delete Team Successfully Id: "+id);
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/project/{projectId}")
    public List<TeamResponseDto> getTeamsByProjectId(@PathVariable Long projectId) {
        return teamService.findByProjectId(projectId);
    }

    // Team Progress Endpoints
    @GetMapping("/{id}/progress")
    public ResponseEntity<TeamProgressResponseDto> getTeamProgress(@PathVariable Long id) {
        try {
            TeamProgressResponseDto progress = teamProgressService.getTeamProgressByTeamId(id);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<TeamProgressResponseDto> refreshTeamProgress(@PathVariable Long id) {
        try {
            TeamProgressResponseDto progress = teamProgressService.getTeamProgressByTeamId(id);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Team Tasks Endpoint
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskResponseDto>> getTeamTasks(@PathVariable Long id) {
        try {
            List<TaskResponseDto> tasks = taskService.getTasksByTeamId(id);
            return ResponseEntity.ok(tasks);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
