package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Enum.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderDto {
    private UUID shippingAddressId;
    private PaymentMethod paymentMethod;
    private List<OrderItemDto> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private UUID variantId;
        private Integer quantity;
        private Double price;
    }
}