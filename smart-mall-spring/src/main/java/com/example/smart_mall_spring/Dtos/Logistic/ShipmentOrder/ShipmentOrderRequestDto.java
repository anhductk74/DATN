package com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder;


import com.example.smart_mall_spring.Enum.ShipmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentOrderRequestDto {

    private UUID orderId;
    private UUID shipperId;
    private UUID warehouseId;

    private String pickupAddress;
    private String deliveryAddress;

    private BigDecimal codAmount;
    private BigDecimal shippingFee;

    private ShipmentStatus status;
    private LocalDateTime estimatedDelivery;

    private Integer weight;
}
