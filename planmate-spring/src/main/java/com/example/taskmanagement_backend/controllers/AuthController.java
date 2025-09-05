package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.OAuth2Dto.RefreshTokenRequestDto;
import com.example.taskmanagement_backend.dtos.OAuth2Dto.TokenResponseDto;
import com.example.taskmanagement_backend.dtos.UserDto.LoginRequestDto;
import com.example.taskmanagement_backend.dtos.UserDto.LoginResponseDto;
import com.example.taskmanagement_backend.services.infrastructure.TokenRefreshService;
import com.example.taskmanagement_backend.services.infrastructure.TokenBlacklistService;
import com.example.taskmanagement_backend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
@Slf4j
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final UserService userService;
    private final TokenRefreshService tokenRefreshService;
    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Traditional login with email and password")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) throws Exception {
        LoginResponseDto result = this.userService.login(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Get new access token using refresh token")
    public ResponseEntity<TokenResponseDto> refreshToken(
            @Valid @RequestBody RefreshTokenRequestDto request,
            HttpServletRequest httpRequest) {
        
        log.info("Processing token refresh request");
        
        String deviceInfo = extractDeviceInfo(httpRequest);
        TokenResponseDto response = tokenRefreshService.refreshAccessToken(
                request.getRefreshToken(), 
                deviceInfo
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Revoke refresh token, blacklist access token, and logout user")
    public ResponseEntity<Void> logout(
            @Valid @RequestBody RefreshTokenRequestDto request,
            HttpServletRequest httpRequest) {
        
        log.info("Processing logout request");
        
        try {
            // 1. Revoke refresh token (existing functionality)
            tokenRefreshService.revokeRefreshToken(request.getRefreshToken());
            log.info("✅ Refresh token revoked successfully");
            
            // 2. Blacklist access token (new functionality for NextAuth integration)
            String accessToken = extractAccessTokenFromRequest(httpRequest);
            if (accessToken != null) {
                // Blacklist token with 24 hours TTL (safe default for most JWT configurations)
                tokenBlacklistService.blacklistToken(accessToken, 24 * 60); // 24 hours in minutes
                log.info("✅ Access token blacklisted successfully");
            } else {
                log.warn("⚠️ No access token found in Authorization header");
            }
            
            log.info("✅ Logout completed successfully");
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("❌ Error during logout process", e);
            // Still return success to avoid revealing internal errors
            return ResponseEntity.ok().build();
        }
    }
    
    /**
     * Extract access token from Authorization header for blacklisting
     */
    private String extractAccessTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7); // Remove "Bearer " prefix
        }
        
        return null;
    }

    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String clientIp = getClientIpAddress(request);
        return String.format("IP: %s, UserAgent: %s", clientIp, userAgent);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}