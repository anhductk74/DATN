package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Auth.GoogleLoginRequestDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Auth.GoogleOAuth2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private GoogleOAuth2Service googleOAuth2Service;

    @PostMapping("/google-token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testGoogleToken(@RequestBody GoogleLoginRequestDto request) {
        try {
            var payload = googleOAuth2Service.verifyIdToken(request.getIdToken());
            
            Map<String, Object> result = new HashMap<>();
            result.put("email", payload.getEmail());
            result.put("name", payload.get("name"));
            result.put("picture", payload.get("picture"));
            result.put("audience", payload.getAudience());
            result.put("issuer", payload.getIssuer());
            result.put("issuedAt", payload.getIssuedAtTimeSeconds());
            result.put("expiration", payload.getExpirationTimeSeconds());
            
            return ResponseEntity.ok(ApiResponse.success("Token verification successful", result));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("tokenLength", request.getIdToken() != null ? request.getIdToken().length() : 0);
            error.put("tokenPrefix", request.getIdToken() != null ? request.getIdToken().substring(0, Math.min(50, request.getIdToken().length())) : "null");
            
            return ResponseEntity.badRequest().body(ApiResponse.error("Token verification failed", error));
        }
    }
}