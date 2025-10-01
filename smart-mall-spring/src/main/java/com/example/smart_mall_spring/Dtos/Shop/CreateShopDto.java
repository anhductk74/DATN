package com.example.smart_mall_spring.Dtos.Shop;
import com.example.smart_mall_spring.Dtos.Address.CreateAddressDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateShopDto {
    private String name;
    private String description;
    private String phoneNumber;
    private String avatar;

    private CreateAddressDto address;
}
