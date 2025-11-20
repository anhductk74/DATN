package com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder;

import com.example.smart_mall_spring.Enum.ShipmentStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubShipmentOrderResponseDto {
    private UUID id;
    private UUID shipmentOrderId;
    private String shipmentOrderCode;

    private UUID fromWarehouseId;
    private String fromWarehouseName;

    private UUID toWarehouseId;
    private String toWarehouseName;

    private UUID shipperId;
    private String shipperName;

    private ShipmentStatus status;
    private int sequence;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}