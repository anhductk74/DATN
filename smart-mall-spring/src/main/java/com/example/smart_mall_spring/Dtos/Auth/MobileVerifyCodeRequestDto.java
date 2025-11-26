package com.example.smart_mall_spring.Dtos.Auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MobileVerifyCodeRequestDto {
    @NotBlank(message = "Username is required")
    @Email(message = "Username must be a valid email format")
    private String username;
    
    @NotBlank(message = "Code is required")
    private String code;
}
