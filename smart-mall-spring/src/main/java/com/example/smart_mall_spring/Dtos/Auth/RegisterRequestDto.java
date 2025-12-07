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
public class RegisterRequestDto {
    @NotBlank(message = "Username is required")
    @Email(message = "Username must be a valid email format")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String phoneNumber;
    
    private String role; // USER, MANAGER, SHIPPER (default: USER)
    
    // Thông tin công ty vận chuyển (bắt buộc khi role = MANAGER)
    private String companyName;
    private String companyCode;
    private String companyContactEmail;
    private String companyContactPhone;
    
    // Địa chỉ trụ sở công ty (kế thừa Address)
    private String companyStreet;
    private String companyCommune;
    private String companyDistrict;
    private String companyCity;
}