package com.example.smart_mall_spring.Entities.Logistics;


import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShipmentOrder extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "shipper_id")
    @JsonIgnore
    private Shipper shipper;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    @JsonIgnore
    private Warehouse warehouse;

    private String pickupAddress;
    private String deliveryAddress;

    private BigDecimal codAmount = BigDecimal.ZERO;
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status = ShipmentStatus.PENDING;

    private LocalDateTime estimatedDelivery;
    private LocalDateTime deliveredAt;
    private LocalDateTime returnedAt;

    @Column(name = "tracking_code")
    private String trackingCode;

    @Column(nullable = false)
    private Integer weight = 1000;
}
