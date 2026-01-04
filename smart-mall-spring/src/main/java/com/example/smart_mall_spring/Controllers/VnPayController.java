package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Orders.Transaction.VnPayPaymentResponseDto;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Services.Order.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vnpay")
@RequiredArgsConstructor
@Slf4j
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
            @RequestParam UUID userId,
            @RequestParam String platform
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return vnPayService.createPaymentUrl(
                request,
                amount,
                orderInfo,
                user,
                platform
        );
    }

    /**
     * VNPay callback (xử lý logic)
     */
    @GetMapping("/payment-return")
    public VnPayPaymentResponseDto paymentReturn(
            @RequestParam Map<String, String> params
    ) {
        return vnPayService.handlePaymentReturn(params);
    }

    /**
     * Redirect cho MOBILE (KHÔNG dùng deep link)
     */
    @GetMapping("/mobile-redirect")
    public void mobileRedirect(
            @RequestParam Map<String, String> params,
            HttpServletResponse response
    ) throws IOException {

        VnPayPaymentResponseDto result =
                vnPayService.handlePaymentReturn(params);

        boolean success =
                result.getStatus() == 1 &&
                        "00".equals(result.getResponseCode());

        String redirectUrl = String.format(
                "http://152.42.244.64:8080/payment-result" +
                        "?success=%s&transactionCode=%s&message=%s",
                success,
                result.getTransactionCode(),
                URLEncoder.encode(
                        result.getMessage(),
                        StandardCharsets.UTF_8
                )
        );

        response.sendRedirect(redirectUrl);
    }

    /**
     * API hoàn tiền
     */
    @PostMapping("/refund")
    public VnPayPaymentResponseDto refundPayment(
            @RequestParam String transactionCode,
            @RequestParam double amount,
            @RequestParam UUID userId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return vnPayService.refundPayment(
                transactionCode,
                amount,
                user
        );
    }
}
