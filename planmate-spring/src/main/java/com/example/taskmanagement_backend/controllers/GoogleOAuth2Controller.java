package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.OAuth2Dto.GoogleAuthUrlResponseDto;
import com.example.taskmanagement_backend.dtos.OAuth2Dto.TokenResponseDto;
import com.example.taskmanagement_backend.services.infrastructure.GoogleOAuth2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/google")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Google OAuth2 Authentication", description = "Google OAuth2 authentication endpoints with frontend redirect")
public class GoogleOAuth2Controller {

    private final GoogleOAuth2Service googleOAuth2Service;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @GetMapping("/url")
    @Operation(summary = "Get Google OAuth2 authorization URL", 
               description = "Returns the Google OAuth2 authorization URL with state parameter for CSRF protection")
    public ResponseEntity<GoogleAuthUrlResponseDto> getGoogleAuthUrl() {
        log.info("Generating Google OAuth2 authorization URL");
        GoogleAuthUrlResponseDto response = googleOAuth2Service.generateAuthUrl();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/callback")
    @Operation(summary = "Handle Google OAuth2 callback", 
               description = "Processes the authorization code from Google, generates JWT tokens, and redirects to frontend")
    public void handleGoogleCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        
        try {
            log.info("Processing Google OAuth2 callback for state: {}", state);
            
            // Extract device info for security tracking
            String deviceInfo = extractDeviceInfo(request);
            
            // Process OAuth2 callback and get JWT tokens
            TokenResponseDto tokenResponse = googleOAuth2Service.handleCallback(code, state, deviceInfo);
            
            log.info("Successfully authenticated user via Google OAuth2: {}", tokenResponse.getUserInfo().getEmail());
            
            // Build frontend callback URL with tokens as query parameters
            String frontendCallbackUrl = buildFrontendCallbackUrl(tokenResponse);
            
            log.info("Redirecting to frontend: {}", frontendCallbackUrl);
            log.info("Frontend URL length: {} characters", frontendCallbackUrl.length());
            
            // Redirect to frontend with tokens
            response.sendRedirect(frontendCallbackUrl);
            
        } catch (Exception e) {
            log.error("OAuth2 callback failed: {}", e.getMessage(), e);
            
            // Redirect to frontend auth error page with error message
            String errorUrl = frontendUrl + "/auth/error?message=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect(errorUrl);
        }
    }

    @PostMapping("/callback")
    @Operation(summary = "Handle Google OAuth2 callback (API)", 
               description = "Processes the authorization code from Google and returns JWT tokens as JSON (for API clients)")
    public ResponseEntity<TokenResponseDto> handleGoogleCallbackApi(
            @RequestParam("code") String code,
            @RequestParam("state") String state,
            HttpServletRequest request) {
        
        log.info("Processing Google OAuth2 callback API for state: {}", state);
        
        // Extract device info for security tracking
        String deviceInfo = extractDeviceInfo(request);
        
        TokenResponseDto response = googleOAuth2Service.handleCallback(code, state, deviceInfo);
        
        log.info("Successfully authenticated user via Google OAuth2 API: {}", response.getUserInfo().getEmail());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token", 
               description = "Validates a JWT token and returns user info if valid")
    public ResponseEntity<?> validateToken(@RequestParam("token") String token) {
        
        log.info("Validating token for frontend");
        
        try {
            // This endpoint helps frontend validate if the token is working
            // You can add JWT validation logic here
            return ResponseEntity.ok().body(Map.of(
                "valid", true,
                "message", "Token validation endpoint - implement JWT validation logic here"
            ));
        } catch (Exception e) {
            log.error("Error validating token: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "message", "Invalid token"
            ));
        }
    }

    private String buildFrontendCallbackUrl(TokenResponseDto tokenResponse) {
        StringBuilder urlBuilder = new StringBuilder();
        urlBuilder.append(frontendUrl).append("/auth/callback");
        
        // Add query parameters
        urlBuilder.append("?access_token=").append(URLEncoder.encode(tokenResponse.getAccessToken(), StandardCharsets.UTF_8));
        urlBuilder.append("&refresh_token=").append(URLEncoder.encode(tokenResponse.getRefreshToken(), StandardCharsets.UTF_8));
        urlBuilder.append("&expires_in=").append(tokenResponse.getExpiresIn());
        urlBuilder.append("&token_type=").append(URLEncoder.encode(tokenResponse.getTokenType(), StandardCharsets.UTF_8));
        
        // Add user info
        TokenResponseDto.UserInfoDto userInfo = tokenResponse.getUserInfo();
        urlBuilder.append("&user_id=").append(userInfo.getId());
        urlBuilder.append("&email=").append(URLEncoder.encode(userInfo.getEmail(), StandardCharsets.UTF_8));
        urlBuilder.append("&first_name=").append(URLEncoder.encode(userInfo.getFirstName(), StandardCharsets.UTF_8));
        urlBuilder.append("&last_name=").append(URLEncoder.encode(userInfo.getLastName(), StandardCharsets.UTF_8));
        urlBuilder.append("&is_first_login=").append(userInfo.isFirstLogin());
        
        if (userInfo.getAvatarUrl() != null && !userInfo.getAvatarUrl().isEmpty()) {
            urlBuilder.append("&avatar_url=").append(URLEncoder.encode(userInfo.getAvatarUrl(), StandardCharsets.UTF_8));
        }
        
        return urlBuilder.toString();
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