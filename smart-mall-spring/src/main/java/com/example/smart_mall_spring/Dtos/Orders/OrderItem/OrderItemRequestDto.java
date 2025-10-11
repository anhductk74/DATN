package com.example.smart_mall_spring.Dtos.Orders.OrderItem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequestDto {
    private UUID variantId;     // ID của ProductVariant
    private Integer quantity;   // Số lượng đặt
}