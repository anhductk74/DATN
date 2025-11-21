package com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder;

import com.example.smart_mall_spring.Enum.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubShipmentOrderUpdateDto {
    private ShipmentStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
