package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Auth.*;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Auth.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@Valid @RequestBody LoginRequestDto request) {
        try {
            AuthResponseDto response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(@Valid @RequestBody RegisterRequestDto request) {
        try {
            // Lấy thông tin user hiện tại (nếu đăng nhập)
            User currentUser = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                    && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                currentUser = userDetails.getUser();
            }
            
            AuthResponseDto response = authService.register(request, currentUser);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> googleLogin(@Valid @RequestBody GoogleLoginRequestDto request) {
        try {
            AuthResponseDto response = authService.loginWithGoogle(request);
            return ResponseEntity.ok(ApiResponse.success("Google login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponseDto>> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        try {
            AuthResponseDto response = authService.refreshToken(request);
            return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // In a stateless JWT implementation, logout is typically handled on the client side
        // by removing the token from storage. However, you could implement a token blacklist
        // if needed for additional security.
        return ResponseEntity.ok(ApiResponse.success("Logout successful", "Token invalidated"));
    }

    // Mobile app email login - Step 1: Send verification code
    @PostMapping("/mobile/send-login-code")
    public ResponseEntity<ApiResponse<String>> sendMobileLoginCode(@Valid @RequestBody MobileEmailLoginRequestDto request) {
        try {
            authService.sendMobileLoginCode(request);
            return ResponseEntity.ok(ApiResponse.success("Verification code sent to your email", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Mobile app email login - Step 2: Verify code and login
    @PostMapping("/mobile/verify-login-code")
    public ResponseEntity<ApiResponse<AuthResponseDto>> verifyMobileLoginCode(@Valid @RequestBody MobileVerifyCodeRequestDto request) {
        try {
            AuthResponseDto response = authService.verifyMobileLoginCode(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Đăng ký Manager (chỉ ADMIN)
    @PostMapping("/register-manager")
    public ResponseEntity<ApiResponse<ManagerRegisterResponseDto>> registerManager(@Valid @RequestBody ManagerRegisterDto request) {
        try {
            // Lấy thông tin user hiện tại (phải là ADMIN)
            User currentUser = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                    && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                currentUser = userDetails.getUser();
            }
            
            ManagerRegisterResponseDto response = authService.registerManager(request, currentUser);
            return ResponseEntity.ok(ApiResponse.success("Manager registered successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}