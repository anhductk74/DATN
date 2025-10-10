package com.example.smart_mall_spring.Dtos.UserAddress;

import com.example.smart_mall_spring.Enum.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressRequestDto {

    @NotBlank(message = "Recipient name is required")
    private String recipient;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Invalid Vietnamese phone number format")
    private String phoneNumber;

    @NotNull(message = "Address type is required")
    private AddressType addressType;

    @NotBlank(message = "Street address is required")
    private String street;

    @NotBlank(message = "Commune/Ward is required")
    private String commune;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "City/Province is required")
    private String city;

    @NotNull(message = "Default status is required")
    private Boolean isDefault;
}