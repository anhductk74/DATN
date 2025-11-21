package com.example.smart_mall_spring.Dtos.Logistic.ShipmentLog;

import com.example.smart_mall_spring.Enum.ShipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ShipmentLogResponseDto {
    private UUID id;
    private UUID shipmentOrderId;
    private UUID subShipmentOrderId;
    private ShipmentStatus status;
    private String location;
    private String note;
    private LocalDateTime createdAt;
    private String message;
    private LocalDateTime timestamp;
}
