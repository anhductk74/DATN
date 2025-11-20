package com.example.smart_mall_spring.Entities.Logistics;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "sub_shipment_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SubShipmentOrder  extends BaseEntity {

    @ManyToOne
    private ShipmentOrder shipmentOrder;

    @ManyToOne
    private Warehouse fromWarehouse;

    @ManyToOne
    private Warehouse toWarehouse;

    @ManyToOne
    private Shipper shipper;

    private ShipmentStatus status;

    private int sequence; // thứ tự chặng: 1, 2, 3
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
