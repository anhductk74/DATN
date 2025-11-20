package com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder;


import com.example.smart_mall_spring.Enum.ShipmentStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubShipmentOrderRequestDto {
    private UUID shipmentOrderId;
    private UUID fromWarehouseId;
    private UUID toWarehouseId;
    private UUID shipperId;

    private ShipmentStatus status;
    private int sequence;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}