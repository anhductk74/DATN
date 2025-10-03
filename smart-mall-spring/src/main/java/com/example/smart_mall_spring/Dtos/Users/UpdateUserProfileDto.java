package com.example.smart_mall_spring.Dtos.Users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserProfileDto {
    private String fullName;
    private String phoneNumber;
    // Avatar sẽ được xử lý qua MultipartFile
}