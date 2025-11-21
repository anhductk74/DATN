package com.example.smart_mall_spring.Dtos.Logistic.Warehouse;

import com.example.smart_mall_spring.Enum.WarehouseStatus;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseRequestDto {

    private UUID shippingCompanyId;
    private String name;
    private String address;
    private String region;
    private String managerName;
    private String phone;
    private WarehouseStatus status;
    private String province;
    private String district;
    private String ward;

    private Integer capacity;
}
