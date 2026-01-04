package com.example.smart_mall_spring.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentResultController {

    @GetMapping("/payment-result")
    public String paymentResult(
            @RequestParam boolean success,
            @RequestParam(required = false) String message
    ) {
        return success
                ? "Thanh toán thành công"
                : "Thanh toán thất bại";
    }
}