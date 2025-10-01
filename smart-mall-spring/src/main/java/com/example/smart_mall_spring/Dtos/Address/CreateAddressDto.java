package com.example.smart_mall_spring.Dtos.Address;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAddressDto {
    private String street;

    private String commune; // phường/xã

    private String district;

    private String city;
}
