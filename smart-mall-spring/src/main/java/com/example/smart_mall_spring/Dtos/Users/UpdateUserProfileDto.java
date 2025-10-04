package com.example.smart_mall_spring.Dtos.Users;

import com.example.smart_mall_spring.Enum.Gender;
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
    private Gender gender;
    private String dateOfBirth;
    // Avatar sẽ được xử lý qua MultipartFile
}