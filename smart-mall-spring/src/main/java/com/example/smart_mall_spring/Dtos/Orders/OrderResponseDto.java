package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Dtos.Address.AddressResponseDto;
import com.example.smart_mall_spring.Dtos.Auth.UserInfoDto;
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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private UUID id;
    private UserInfoDto user;
    private StatusOrder status;
    private Double totalAmount;
    private AddressResponseDto shippingAddress;
    private PaymentMethod paymentMethod;
    private List<OrderItemResponseDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}