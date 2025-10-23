package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Orders.Transaction.VnPayPaymentResponseDto;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Services.Order.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vnpay")
@RequiredArgsConstructor
public class VnPayController {

    private final VnPayService vnPayService;
    private final UserRepository userRepository;

    /**
     * API tạo URL thanh toán VNPay
     */
    @PostMapping("/create")
    public String createPayment(
            HttpServletRequest request,
            @RequestParam double amount,
            @RequestParam String orderInfo,
            @RequestParam UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // ⚙️ Gọi service tạo URL thanh toán
        return vnPayService.createPaymentUrl(request, amount, orderInfo, user);
    }

    /**
     * API callback khi VNPay redirect về
     */
    @GetMapping("/payment-return")
    public VnPayPaymentResponseDto paymentReturn(@RequestParam Map<String, String> params) {
        return vnPayService.handlePaymentReturn(params);
    }

    /**
     * API hoàn tiền (refund)
     */
    @PostMapping("/refund")
    public VnPayPaymentResponseDto refundPayment(
            @RequestParam String transactionCode,
            @RequestParam double amount,
            @RequestParam UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return vnPayService.refundPayment(transactionCode, amount, user);
    }
}
