package com.example.smart_mall_spring.Dtos.Shop;

import com.example.smart_mall_spring.Dtos.Address.CreateAddressDto;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateShopDto {
    private String name;
    
    @Pattern(regexp = "^\\d{12}$", message = "CCCD phải có đúng 12 chữ số")
    private String cccd;
    
    private String description;
    private String phoneNumber;
    private String avatar;
    private UUID ownerId; // ID của user sở hữu shop

    private CreateAddressDto address;
}
