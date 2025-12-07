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
public class ManagerRegisterDto {
    
    // Thông tin tài khoản Manager
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    // Thông tin công ty vận chuyển
    @NotBlank(message = "Company name is required")
    private String companyName;
    
    private String companyCode;
    
    @Email(message = "Company contact email must be valid")
    private String companyContactEmail;
    
    private String companyContactPhone;
    
    // Địa chỉ trụ sở công ty (đầy đủ: street, commune, district, city)
    @NotBlank(message = "Company street is required")
    private String companyStreet;
    
    @NotBlank(message = "Company commune is required")
    private String companyCommune;
    
    @NotBlank(message = "Company district is required")
    private String companyDistrict;
    
    @NotBlank(message = "Company city is required")
    private String companyCity;
}
