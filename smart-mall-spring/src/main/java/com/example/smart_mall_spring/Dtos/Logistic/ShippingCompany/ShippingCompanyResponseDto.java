package com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany;

import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.Warehouse.WarehouseResponseDto;
import com.example.smart_mall_spring.Enum.ShippingCompanyStatus;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingCompanyResponseDto {
    private UUID id;
    private String name;
    private String code;
    private String contactEmail;
    private String contactPhone;
    
    // Địa chỉ trụ sở
    private String street;
    private String commune;
    private String district;
    private String city;
    private String fullAddress; // Địa chỉ đầy đủ (tổng hợp)
    
    private ShippingCompanyStatus status;
    private List<ShipperResponseDto> shippers;
    private List<WarehouseResponseDto> warehouses;
}
