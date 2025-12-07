package com.example.smart_mall_spring.Dtos.Logistic.Shipper;

import com.example.smart_mall_spring.Enum.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShipperRegisterDto {
    
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
    
    private String gender; // Changed to String to receive from FormData
    private String dateOfBirth;
    
    // Thông tin địa chỉ thường trú (đầy đủ)
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
    private String shippingCompanyId; // Changed to String to receive from FormData
    
    // Thông tin định danh
    private String idCardNumber;
    private MultipartFile idCardFrontImage;  // File ảnh mặt trước CCCD
    private MultipartFile idCardBackImage;   // File ảnh mặt sau CCCD
    private String driverLicenseNumber;
    private MultipartFile driverLicenseImage; // File ảnh bằng lái xe
    
    // Thông tin phương tiện
    private String vehicleType;
    private String licensePlate;
    private String vehicleBrand;
    private String vehicleColor;
    
    // Khu vực hoạt động (không cần street, chỉ cần commune/district/city)
    // Phải thuộc cùng district với địa chỉ công ty
    @NotBlank(message = "Operational commune is required")
    private String operationalCommune;
    
    @NotBlank(message = "Operational district is required")
    private String operationalDistrict;
    
    @NotBlank(message = "Operational city is required")
    private String operationalCity;
    
    private String maxDeliveryRadius; // Changed to String to receive from FormData
}
