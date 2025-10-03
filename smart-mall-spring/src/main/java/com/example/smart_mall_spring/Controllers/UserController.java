package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Auth.UserInfoDto;
import com.example.smart_mall_spring.Dtos.Users.UpdateUserProfileDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Users.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserInfoDto>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        
        UserInfoDto userInfo = UserInfoDto.builder()
                .id(userDetails.getUser().getId())
                .username(userDetails.getUser().getUsername())
                .fullName(userDetails.getUser().getProfile() != null ? 
                         userDetails.getUser().getProfile().getFullName() : null)
                .phoneNumber(userDetails.getUser().getProfile() != null ? 
                       userDetails.getUser().getProfile().getPhoneNumber() : null)
                .avatar(userDetails.getUser().getProfile() != null ? 
                       userDetails.getUser().getProfile().getAvatar() : null)
                .isActive(userDetails.getUser().getIsActive())
                .roles(userDetails.getAuthorities().stream()
                       .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                       .toList())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userInfo));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserInfoDto>> updateProfile(
            @RequestBody UpdateUserProfileDto updateProfileDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UUID userId = userDetails.getUser().getId();

            UserInfoDto updatedUser = userService.updateUserProfile(userId, updateProfileDto);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/profile/avatar", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserInfoDto>> updateProfileWithAvatar(
            @RequestParam("profileData") String profileDataJson,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UUID userId = userDetails.getUser().getId();

            UserInfoDto updatedUser = userService.updateUserProfileWithAvatar(userId, profileDataJson, avatarFile);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserInfoDto>> getUserProfileById(@PathVariable UUID userId) {
        try {
            UserInfoDto userInfo = userService.getUserProfile(userId);
            return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get user profile: " + e.getMessage()));
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> adminOnly() {
        return ResponseEntity.ok(ApiResponse.success("Admin access granted", "This is admin-only content"));
    }
}