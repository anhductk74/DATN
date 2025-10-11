package com.example.smart_mall_spring.Dtos.Orders.Payment;

import com.example.smart_mall_spring.Enum.PaymentMethod;
import com.example.smart_mall_spring.Enum.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentResponseDto {
    private UUID id;
    private UUID orderId;
    private PaymentMethod method;
    private PaymentStatus status;
    private Double amount;
    private String transactionId;
    private LocalDateTime paidAt;
}