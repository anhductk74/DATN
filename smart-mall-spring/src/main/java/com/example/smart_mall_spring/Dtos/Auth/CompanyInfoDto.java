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
public class CompanyInfoDto {
    private UUID companyId;
    private String companyName;
    private String companyCode;
    private String contactEmail;
    private String contactPhone;
    private String street;
    private String commune;
    private String district;
    private String city;
    private String fullAddress;
}
