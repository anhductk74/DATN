package com.example.smart_mall_spring.Dtos.Logistic.Shipper;


import com.example.smart_mall_spring.Enum.ShipperStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class ShipperListResponseDto {
    private UUID id;
    private String fullName;
    private String phoneNumber;
    private ShipperStatus status;
    private String vehicleType;
    private String licensePlate;
    private String region;

}