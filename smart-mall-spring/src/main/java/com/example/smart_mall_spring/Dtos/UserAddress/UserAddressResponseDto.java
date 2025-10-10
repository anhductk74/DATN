package com.example.smart_mall_spring.Dtos.UserAddress;

import com.example.smart_mall_spring.Enum.AddressType;
import com.example.smart_mall_spring.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressResponseDto {

    private UUID id;
    private String recipient;
    private String phoneNumber;
    private AddressType addressType;
    
    // Address information
    private String street;
    private String commune;
    private String district;
    private String city;
    private String fullAddress; // Combined address for display
    
    private boolean isDefault;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}