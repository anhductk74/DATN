package com.example.smart_mall_spring.Dtos.Logistic.Shipper;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for shipper registration info (JSON part)
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShipperInfoDto {
    
    // Thông tin tài khoản
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    // Thông tin cá nhân
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    private String gender; // MALE, FEMALE, OTHER
    private String dateOfBirth; // yyyy-MM-dd
    
    // Thông tin địa chỉ thường trú
    @NotBlank(message = "Street is required")
    private String street;
    
    @NotBlank(message = "Commune is required")
    private String commune;
    
    @NotBlank(message = "District is required")
    private String district;
    
    @NotBlank(message = "City is required")
    private String city;
    
    // Thông tin công ty vận chuyển
    @NotNull(message = "Shipping company is required")
    private UUID shippingCompanyId;
    
    // Thông tin định danh
    private String idCardNumber;
    private String driverLicenseNumber;
    
    // Thông tin phương tiện
    private String vehicleType;
    private String licensePlate;
    private String vehicleBrand;
    private String vehicleColor;
    
    // Khu vực hoạt động
    @NotBlank(message = "Operational commune is required")
    private String operationalCommune;
    
    @NotBlank(message = "Operational district is required")
    private String operationalDistrict;
    
    @NotBlank(message = "Operational city is required")
    private String operationalCity;
    
    private Double maxDeliveryRadius;
}
