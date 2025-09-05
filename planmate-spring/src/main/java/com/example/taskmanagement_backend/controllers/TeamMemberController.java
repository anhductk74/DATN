package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.TeamMemberDto.CreateTeamMemberRequestDto;
import com.example.taskmanagement_backend.dtos.TeamMemberDto.TeamMemberResponseDto;
import com.example.taskmanagement_backend.services.TeamMemberService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/team-members")
@RequiredArgsConstructor
public class TeamMemberController {
    private final TeamMemberService teamMemberService;

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TeamMemberResponseDto>> getMembersByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamMemberService.getMembersByTeam(teamId));
    }
    @PostMapping
    public ResponseEntity<TeamMemberResponseDto> createMember(@RequestBody CreateTeamMemberRequestDto dto){
        return ResponseEntity.ok(teamMemberService.createTeamMember(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id){
        return ResponseEntity.noContent().build();
    }

}
