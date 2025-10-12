package com.example.smart_mall_spring.Controllers;
import com.example.smart_mall_spring.Dtos.Orders.OrderVoucher.ApplyVoucherRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderVoucher.OrderVoucherResponseDto;
import com.example.smart_mall_spring.Services.Order.OrderVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/order-vouchers")
public class OrderVoucherController {

    @Autowired
    private OrderVoucherService orderVoucherService;

    @PostMapping("/apply")
    public OrderVoucherResponseDto applyVoucher(@RequestBody ApplyVoucherRequestDto dto) {
        return orderVoucherService.applyVoucher(dto);
    }

    @GetMapping("/{orderId}")
    public List<OrderVoucherResponseDto> getVouchersByOrder(@PathVariable UUID orderId) {
        return orderVoucherService.getVouchersByOrder(orderId);
    }

    @DeleteMapping("/{orderVoucherId}")
    public void removeVoucher(@PathVariable UUID orderVoucherId) {
        orderVoucherService.removeVoucher(orderVoucherId);
    }
}