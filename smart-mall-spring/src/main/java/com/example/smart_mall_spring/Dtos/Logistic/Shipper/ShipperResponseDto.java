package com.example.smart_mall_spring.Dtos.Logistic.Shipper;


import com.example.smart_mall_spring.Enum.Gender;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ShipperResponseDto {
    private UUID id;
    
    // Thông tin từ UserProfile
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private Gender gender;
    private String dateOfBirth;
    
    private ShipperStatus status;
    
    // Vị trí real-time
    private Double currentLatitude;
    private Double currentLongitude;

    // Thông tin phương tiện
    private String vehicleType;
    private String licensePlate;
    private String vehicleBrand;
    private String vehicleColor;

    // Khu vực hoạt động
    private String operationalCommune;
    private String operationalDistrict;
    private String operationalCity;
    private String operationalRegionFull; // Địa chỉ đầy đủ của khu vực
    private Double maxDeliveryRadius;
    
    // Thông tin định danh
    private String idCardNumber;
    private String idCardFrontImage;
    private String idCardBackImage;
    private String driverLicenseNumber;
    private String driverLicenseImage;

    private UUID shippingCompanyId;
    private String shippingCompanyName;

    private UUID userId;
    private String username;
    
    // Địa chỉ
    private String address;
}
