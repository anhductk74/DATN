package com.example.smart_mall_spring.Dtos.Logistic.Manager;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ManagerResponseDto {
    
    // Manager info
    private UUID managerId;
    
    // User info
    private UUID userId;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private Integer isActive;
    
    // Company info
    private UUID companyId;
    private String companyName;
    private String companyCode;
    private String companyContactEmail;
    private String companyContactPhone;
    
    // Company address
    private String companyStreet;
    private String companyCommune;
    private String companyDistrict;
    private String companyCity;
    private String companyFullAddress;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
