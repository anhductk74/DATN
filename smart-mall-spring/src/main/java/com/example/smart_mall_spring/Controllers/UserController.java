package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Auth.UserInfoDto;
import com.example.smart_mall_spring.Dtos.Users.ChangePasswordDto;
import com.example.smart_mall_spring.Dtos.Users.UpdateUserProfileDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Users.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    
    @Autowired
    private ObjectMapper objectMapper;

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
                .gender(userDetails.getUser().getProfile() != null ? 
                       userDetails.getUser().getProfile().getGender() : null)
                .dateOfBirth(userDetails.getUser().getProfile() != null ? 
                       userDetails.getUser().getProfile().getDateOfBirth() : null)
                .isActive(userDetails.getUser().getIsActive())
                .roles(userDetails.getAuthorities().stream()
                       .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                       .toList())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userInfo));
    }

    @PutMapping(value = "/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserInfoDto>> updateProfile(
            @RequestParam("profileData") String profileDataJson,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UUID userId = userDetails.getUser().getId();

            // Parse profile data from JSON string
            UpdateUserProfileDto profileDto = objectMapper.readValue(profileDataJson, UpdateUserProfileDto.class);
            
            // Update profile with optional avatar
            UserInfoDto updatedUser = userService.updateUserProfileWithAvatar(userId, profileDto, avatarFile);
            
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserInfoDto>> getUserProfileById(@PathVariable UUID userId) {
        try {
            UserInfoDto userInfo = userService.getUserProfile(userId);
            return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody ChangePasswordDto changePasswordDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UUID userId = userDetails.getUser().getId();

            userService.changePassword(
                userId, 
                changePasswordDto.getCurrentPassword(),
                changePasswordDto.getNewPassword(),
                changePasswordDto.getConfirmPassword()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Your password has been updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to change password: " + e.getMessage()));
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> adminOnly() {
        return ResponseEntity.ok(ApiResponse.success("Admin access granted", "This is admin-only content"));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserInfoDto>>> getAllUsersByRole(
            @RequestParam(defaultValue = "USER") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        try {
            Pageable pageable;
            
            if (sort != null && !sort.isEmpty()) {
                // Parse sort parameter (e.g., "username,asc" or "isActive,desc")
                String[] sortParams = sort.split(",");
                String sortField = sortParams[0];
                Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc") 
                    ? Sort.Direction.DESC 
                    : Sort.Direction.ASC;
                pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
            } else {
                pageable = PageRequest.of(page, size);
            }
            
            Page<UserInfoDto> usersPage = userService.getUsersByRole(role, pageable);
            return ResponseEntity.ok(ApiResponse.success("Get users by role success", usersPage));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get users: " + e.getMessage()));
        }
    }
}