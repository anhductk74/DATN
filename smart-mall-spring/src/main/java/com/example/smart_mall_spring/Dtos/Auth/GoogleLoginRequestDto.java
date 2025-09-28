package com.example.smart_mall_spring.Dtos.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GoogleLoginRequestDto {
    @NotBlank(message = "Google ID token is required")
    private String idToken;
}