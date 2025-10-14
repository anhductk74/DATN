package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.Orders.Payment.CreatePaymentRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.Payment.PaymentResponseDto;
import com.example.smart_mall_spring.Enum.PaymentStatus;
import com.example.smart_mall_spring.Services.Order.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    //  Khởi tạo thanh toán
    @PostMapping
    public PaymentResponseDto createPayment(@RequestBody CreatePaymentRequestDto dto) {
        return paymentService.createPayment(dto);
    }

    //  Cập nhật trạng thái thanh toán (callback từ cổng VNPay / MoMo)
    @PutMapping("/{transactionId}/status")
    public PaymentResponseDto updatePaymentStatus(
            @PathVariable String transactionId,
            @RequestParam PaymentStatus status
    ) {
        return paymentService.updatePaymentStatus(transactionId, status);
    }

    //  Lấy thông tin thanh toán theo Order
    @GetMapping("/order/{orderId}")
    public PaymentResponseDto getPaymentByOrder(@PathVariable UUID orderId) {
        return paymentService.getPaymentByOrder(orderId);
    }
}