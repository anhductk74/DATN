package com.example.smart_mall_spring.Dtos.UserAddress;

import com.example.smart_mall_spring.Enum.AddressType;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserAddressDto {

    private String recipient;

    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Invalid Vietnamese phone number format")
    private String phoneNumber;

    private AddressType addressType;

    private String street;
    private String commune;
    private String district;
    private String city;
    private Boolean isDefault;
}