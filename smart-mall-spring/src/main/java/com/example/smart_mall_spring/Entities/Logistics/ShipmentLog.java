package com.example.smart_mall_spring.Entities.Logistics;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShipmentLog extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "shipment_order_id", nullable = false)
    private ShipmentOrder shipmentOrder;

    @ManyToOne
    @JoinColumn(name = "sub_shipment_order_id")
    private SubShipmentOrder subShipmentOrder;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String note;
    @Column(name = "message", columnDefinition = "TEXT")
    private String message; // Dòng bị thiếu

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp; // Dòng bị thiếu
}