package com.example.taskmanagement_backend.dtos.UserProfileDto;


import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponseDto {

    @NotBlank
    private Long id;

    private String firstName;

    private String lastName;

    private String status;

    private String avtUrl;

    private Long userId;

}
