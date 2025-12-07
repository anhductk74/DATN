package com.example.smart_mall_spring.Dtos.Auth;

import com.example.smart_mall_spring.Enum.ShipperStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShipperInfoDto {
    private UUID shipperId;
    private ShipperStatus status;
    private String vehicleType;
    private String licensePlate;
    private String vehicleBrand;
    private String vehicleColor;
    private Double currentLatitude;
    private Double currentLongitude;
    private Double maxDeliveryRadius;
    
    // Operational Region
    private String operationalCommune;
    private String operationalDistrict;
    private String operationalCity;
    private String operationalRegionFull;
    
    // Shipping Company
    private UUID shippingCompanyId;
    private String shippingCompanyName;
}
