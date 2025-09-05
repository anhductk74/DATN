package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.UserProfileDto.UpdateUserProfileRequestDto;
import com.example.taskmanagement_backend.dtos.UserProfileDto.UserProfileResponseDto;
import com.example.taskmanagement_backend.services.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/userprofile")
@RequiredArgsConstructor
public class UserProfileController {
    @Autowired
    private final UserProfileService userProfileService;

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponseDto> getUserProfiles(@PathVariable Long id) {
        return ResponseEntity.ok(userProfileService.getUserProfile(id));
    }

    @PutMapping("/{id}")
    private ResponseEntity<UserProfileResponseDto> updateProfile(@Valid @RequestBody UpdateUserProfileRequestDto dto,@PathVariable Long id){
        return ResponseEntity.ok(userProfileService.updateUserProfile(id, dto));
    }

}
