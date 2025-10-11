package com.example.smart_mall_spring.Dtos.Orders.ShippingFee;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ShippingFeeResponseDto {
    private UUID id;
    private UUID orderId;
    private String shippingMethod;
    private Double feeAmount;
    private LocalDateTime estimatedDeliveryDate;
}
