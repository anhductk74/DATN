package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemResponseDto;
import com.example.smart_mall_spring.Enum.StatusOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDto {
    private UUID id;
   private UUID shopId;
    private String shopName;
    private String shopAvatar;
    private StatusOrder status;
    private Double totalAmount;
    private Double shippingFee;
    private LocalDateTime createdAt;
    private LocalDateTime estimatedDelivery;
    private String trackingNumber;
    private UUID addressId;
    private List<OrderItemResponseDto> items;
}
