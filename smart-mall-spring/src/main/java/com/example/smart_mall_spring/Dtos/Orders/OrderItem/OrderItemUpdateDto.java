package com.example.smart_mall_spring.Dtos.Orders.OrderItem;

import lombok.Data;

@Data
public class OrderItemUpdateDto {
    private Integer quantity;
    private Double price;
}