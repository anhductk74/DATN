package com.example.smart_mall_spring.Dtos.Orders.OrderVoucher;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OrderVoucherResponseDto {
    private UUID id;
    private UUID orderId;
    private UUID voucherId;
    private String voucherCode;
    private Double discountAmount;
}