package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemRequestDto;
import com.example.smart_mall_spring.Enum.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {
    private UUID userId;
    private UUID shopId;
    private UUID shippingAddressId;
    private PaymentMethod paymentMethod;
    private Double shippingFee;
    private List<OrderItemRequestDto> items; // đã có sẵn
    private List<UUID> voucherIds; // áp dụng voucher
}