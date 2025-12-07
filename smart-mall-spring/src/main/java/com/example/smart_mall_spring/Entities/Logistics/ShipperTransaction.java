package com.example.smart_mall_spring.Entities.Logistics;


import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipper_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShipperTransaction extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "shipper_id", nullable = false)
    @JsonIgnore
    private Shipper shipper;

    @ManyToOne
    @JoinColumn(name = "shipment_order_id", nullable = true)
    @JsonIgnore
    private ShipmentOrder shipmentOrder;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipperTransactionType transactionType;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "sub_shipment_order_id", nullable = true)
    @JsonIgnore
    private SubShipmentOrder subShipmentOrder;
}
