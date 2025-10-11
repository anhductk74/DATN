package com.example.smart_mall_spring.Dtos.Orders.ShippingFee;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ShippingFeeRequestDto {
    private UUID orderId;
    private String shippingMethod;
    private Double feeAmount;
    private LocalDateTime estimatedDeliveryDate;
}