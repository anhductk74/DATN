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
public class ShopResponseDto {
    private UUID id;
    private String name;
    private String description;
    private String numberPhone;
    private String avatar;
    private UUID ownerId;
    private String ownerName; // Tên của owner để hiển thị

    private CreateAddressDto address;
}
