package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog.OrderTrackingLogRequest;
import com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog.OrderTrackingLogResponse;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Services.Order.OrderTrackingLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/order-tracking")
@RequiredArgsConstructor
public class OrderTrackingLogController {

    private final OrderRepository orderRepository;
    private final OrderTrackingLogService trackingLogService;

    // 🟢 Lấy danh sách log của một đơn hàng
    @GetMapping("/{orderId}")
    public ResponseEntity<List<OrderTrackingLogResponse>> getTrackingLogs(@PathVariable UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));


        List<OrderTrackingLogResponse> logs = trackingLogService.getTrackingLogsByOrder(order);
        return ResponseEntity.ok(logs);
    }

    // 🟢 Thêm log mới cho đơn hàng
    @PostMapping("/{orderId}/add-log")
    public ResponseEntity<OrderTrackingLogResponse> addTrackingLog(
            @PathVariable UUID orderId,
            @RequestBody OrderTrackingLogRequest request
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderTrackingLogResponse response = trackingLogService.recordTrackingLog(order, request);
        return ResponseEntity.ok(response);
    }
}