package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.Orders.OrderRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderSummaryDto;
import com.example.smart_mall_spring.Dtos.Orders.UpdateOrderStatusDto;
import com.example.smart_mall_spring.Entities.Orders.*;
import com.example.smart_mall_spring.Services.Order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    //  Tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(@RequestBody OrderRequestDto dto) {
        OrderResponseDto response = orderService.createOrder(dto);
        return ResponseEntity.ok(response);
    }

    //  Lấy chi tiết đơn hàng
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable UUID id) {
        OrderResponseDto response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    //  Lấy danh sách đơn hàng theo user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderSummaryDto>> getOrdersByUser(@PathVariable UUID userId) {
        List<OrderSummaryDto> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    //  Cập nhật trạng thái đơn hàng
    @PutMapping("/status")
    public ResponseEntity<String> updateStatus(@RequestBody UpdateOrderStatusDto dto) {
        boolean updated = orderService.updateOrderStatus(dto);
        return updated
                ? ResponseEntity.ok("Order status updated successfully")
                : ResponseEntity.badRequest().body("Failed to update order status");
    }
}
