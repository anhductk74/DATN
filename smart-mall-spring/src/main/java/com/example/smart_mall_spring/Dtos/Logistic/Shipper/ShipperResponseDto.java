package com.example.smart_mall_spring.Dtos.Logistic.Shipper;


import com.example.smart_mall_spring.Enum.ShipperStatus;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ShipperResponseDto {
    private UUID id;
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

    private UUID shippingCompanyId;
    private String shippingCompanyName;

    private UUID userId;
    private String username;
}
