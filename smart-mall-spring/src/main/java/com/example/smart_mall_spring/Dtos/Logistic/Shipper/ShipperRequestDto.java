package com.example.smart_mall_spring.Dtos.Logistic.Shipper;


import com.example.smart_mall_spring.Enum.ShipperStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class ShipperRequestDto {
    private UUID userId;
    private UUID shippingCompanyId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private ShipperStatus status;
    private Double latitude;
    private Double longitude;

    // Thông tin phương tiện
    private String vehicleType;
    private String licensePlate;

    // Khu vực hoạt động
    private String region;
}