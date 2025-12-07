package com.example.smart_mall_spring.Dtos.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ManagerRegisterResponseDto {
    
    // Thông tin Manager
    private UUID userId;
    private String username;
    private String fullName;
    private String phoneNumber;
    
    // Thông tin công ty
    private UUID companyId;
    private String companyName;
    private String companyCode;
    private String companyContactEmail;
    private String companyContactPhone;
    
    // Địa chỉ công ty
    private String companyStreet;
    private String companyCommune;
    private String companyDistrict;
    private String companyCity;
    private String companyFullAddress;
    
    // Manager entity ID
    private UUID managerId;
    
    // JWT token (optional - nếu muốn tự động login sau khi đăng ký)
    private String accessToken;
    private String refreshToken;
}
