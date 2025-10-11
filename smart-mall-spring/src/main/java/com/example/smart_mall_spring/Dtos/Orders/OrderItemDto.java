package com.example.smart_mall_spring.Dtos.Orders;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    private UUID variantId;
    private String variantName;
    private Integer quantity;
    private Double price;
}