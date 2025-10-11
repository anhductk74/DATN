package com.example.smart_mall_spring.Dtos.Orders.Payment;

import com.example.smart_mall_spring.Enum.PaymentMethod;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePaymentRequestDto {
    private UUID orderId;
    private PaymentMethod method; // COD, VNPAY, MOMO, etc.
}
