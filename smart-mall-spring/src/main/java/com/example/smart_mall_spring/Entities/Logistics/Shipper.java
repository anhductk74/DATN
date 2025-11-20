package com.example.smart_mall_spring.Entities.Logistics;


import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shippers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Shipper extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "shipping_company_id", nullable = false)
    private ShippingCompany shippingCompany;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone_number", unique = true, length = 20)
    private String phoneNumber;

    @Column(length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    private ShipperStatus status = ShipperStatus.ACTIVE;

    // Nếu bạn cần lưu vị trí (latitude, longitude)
    private Double latitude;
    private Double longitude;

    @Column(length = 50)
    private String vehicleType;

    @Column(length = 20)
    private String licensePlate;

    // Khu vực hoạt động
    @Column(length = 100)
    private String region;
}