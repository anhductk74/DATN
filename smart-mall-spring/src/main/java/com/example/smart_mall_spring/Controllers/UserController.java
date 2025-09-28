package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Auth.UserInfoDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

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
                .isActive(userDetails.getUser().getIsActive())
                .roles(userDetails.getAuthorities().stream()
                       .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                       .toList())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userInfo));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> adminOnly() {
        return ResponseEntity.ok(ApiResponse.success("Admin access granted", "This is admin-only content"));
    }
}