package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.Orders.ShippingFee.ShippingFeeRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.ShippingFee.ShippingFeeResponseDto;
import com.example.smart_mall_spring.Services.Order.ShippingFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/shipping-fees")
@RequiredArgsConstructor
public class ShippingFeeController {

    private final ShippingFeeService shippingFeeService;

    //  Tạo phí vận chuyển cho đơn hàng
    @PostMapping
    public ShippingFeeResponseDto createShippingFee(@RequestBody ShippingFeeRequestDto dto) {
        return shippingFeeService.createShippingFee(dto);
    }

    //  Lấy phí vận chuyển theo orderId
    @GetMapping("/order/{orderId}")
    public ShippingFeeResponseDto getShippingFeeByOrder(@PathVariable UUID orderId) {
        return shippingFeeService.getShippingFeeByOrder(orderId);
    }

    //  Cập nhật phí vận chuyển
    @PutMapping("/order/{orderId}")
    public ShippingFeeResponseDto updateShippingFee(
            @PathVariable UUID orderId,
            @RequestBody ShippingFeeRequestDto dto
    ) {
        return shippingFeeService.updateShippingFee(orderId, dto);
    }
}