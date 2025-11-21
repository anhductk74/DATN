package com.example.smart_mall_spring.Entities.Logistics;
import com.example.smart_mall_spring.Entities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "shipment_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShipmentReport extends BaseEntity {

    private LocalDate reportDate;

    private Integer totalOrders;
    private Integer deliveredOrders;
    private Integer returnedOrders;

    private BigDecimal totalCod;
    private BigDecimal totalShippingFee;

    private Double successRate;

    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}
