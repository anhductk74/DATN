package com.example.smart_mall_spring.Dtos.Users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordDto {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}