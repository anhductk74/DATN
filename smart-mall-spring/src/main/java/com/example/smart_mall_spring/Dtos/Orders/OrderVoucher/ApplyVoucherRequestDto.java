package com.example.smart_mall_spring.Dtos.Orders.OrderVoucher;

import lombok.Data;
import java.util.UUID;

@Data
public class ApplyVoucherRequestDto {
    private UUID orderId;
    private UUID voucherId;
}