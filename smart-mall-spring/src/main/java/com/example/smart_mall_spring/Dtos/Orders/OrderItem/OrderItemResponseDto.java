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
public class OrderItemResponseDto {
    private UUID id;
    private UUID orderId;
    private UUID variantId;
    private String variantName;
    private Integer quantity;
    private Double price;
    private Double totalPrice;
}
