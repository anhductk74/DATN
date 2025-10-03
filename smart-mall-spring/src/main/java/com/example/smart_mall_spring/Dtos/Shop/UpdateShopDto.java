package com.example.smart_mall_spring.Dtos.Shop;

import com.example.smart_mall_spring.Dtos.Address.CreateAddressDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateShopDto {
    private String name;
    private String description;
    private String phoneNumber;
    private String avatar;
    private UUID ownerId; // Có thể chuyển quyền sở hữu shop
    private CreateAddressDto address;
}