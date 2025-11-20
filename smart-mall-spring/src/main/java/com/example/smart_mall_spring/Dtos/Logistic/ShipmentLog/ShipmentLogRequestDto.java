package com.example.smart_mall_spring.Dtos.Logistic.ShipmentLog;


import com.example.smart_mall_spring.Enum.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentLogRequestDto {
    private UUID shipmentOrderId;
    private UUID subShipmentOrderId;
    private ShipmentStatus status;
    private String location;
    private String note;
}