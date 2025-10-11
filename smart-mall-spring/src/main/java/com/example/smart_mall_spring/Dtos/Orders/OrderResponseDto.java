package com.example.smart_mall_spring.Dtos.Orders;


import com.example.smart_mall_spring.Enum.PaymentMethod;
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
public class OrderResponseDto {
    private UUID id;
    private UUID userId;
    private UUID shopId;
    private String shopName;
    private StatusOrder status;

    private Double totalAmount;
    private Double shippingFee;
    private Double discountAmount;
    private Double finalAmount;

    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;

    private List<OrderItemDto> items;
}