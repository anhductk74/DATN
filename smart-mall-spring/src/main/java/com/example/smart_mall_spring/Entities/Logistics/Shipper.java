package com.example.smart_mall_spring.Entities.Logistics;


import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shippers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"user", "shippingCompany"})
public class Shipper extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_company_id", nullable = false)
    @JsonIgnore
    private ShippingCompany shippingCompany;

    // Sử dụng User để truy cập UserProfile (fullName, phoneNumber, avatar, gender, dateOfBirth)
    // và UserAddress (địa chỉ thường trú)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipperStatus status = ShipperStatus.ACTIVE;

    // Thông tin vị trí real-time (không lưu trong UserProfile vì dynamic)
    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

    // Thông tin phương tiện (đặc thù của shipper)
    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "license_plate", unique = true, length = 20)
    private String licensePlate;

    @Column(name = "vehicle_brand", length = 50)
    private String vehicleBrand;

    @Column(name = "vehicle_color", length = 30)
    private String vehicleColor;

    // Khu vực hoạt động (đặc thù của shipper) - không cần street, chỉ cần commune/district/city
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operational_region_id")
    private Address operationalRegion;


    @Column(name = "max_delivery_radius")
    private Double maxDeliveryRadius; // Bán kính giao hàng tối đa (km)

    // Thông tin định danh bổ sung (đặc thù của shipper, cần cho xác minh)
    @Column(name = "id_card_number", unique = true, length = 20)
    private String idCardNumber;

    @Column(name = "id_card_front_image")
    private String idCardFrontImage;

    @Column(name = "id_card_back_image")
    private String idCardBackImage;

    @Column(name = "driver_license_number", length = 20)
    private String driverLicenseNumber;

    @Column(name = "driver_license_image")
    private String driverLicenseImage;

    // Thông tin tài chính được quản lý trong ShipperWallet
    
    // Ghi chú
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}