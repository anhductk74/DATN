package com.example.smart_mall_spring.Dtos.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

import com.example.smart_mall_spring.Enum.Gender;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoDto {
    private UUID id;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private Gender gender;
    private String dateOfBirth;
    private int isActive;
    private List<String> roles;
    private CompanyInfoDto company; // Thông tin công ty cho Manager
    private ShipperInfoDto shipper; // Thông tin shipper cho Shipper
}