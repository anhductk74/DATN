package com.example.smart_mall_spring.Dtos.Logistic.Shipper;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipperUpdateDto {

    // Company
    private String shippingCompanyId;

    // Vehicle
    private String vehicleType;
    private String licensePlate;
    private String vehicleBrand;
    private String vehicleColor;
    private String maxDeliveryRadius;

    // Operational region
    private String operationalCommune;
    private String operationalDistrict;
    private String operationalCity;

    // Legal info
    private String idCardNumber;
    private String driverLicenseNumber;
}
