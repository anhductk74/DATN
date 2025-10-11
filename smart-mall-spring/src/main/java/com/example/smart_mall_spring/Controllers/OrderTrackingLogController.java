package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderTrackingLog;
import com.example.smart_mall_spring.Services.Order.OrderTrackingLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-tracking")
@RequiredArgsConstructor
public class OrderTrackingLogController {

//    private final OrderRepository orderRepository;
//    private final OrderTrackingLogService trackingLogService;
//
//    @GetMapping("/{orderId}")
//    public List<OrderTrackingLog> getTrackingLogs(@PathVariable Long orderId) {
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//
//        return trackingLogService.getTrackingLogsByOrder(order);
//    }
//
//    // (Tùy chọn) API thêm log thủ công
//    @PostMapping("/{orderId}/add-log")
//    public void addTrackingLog(
//            @PathVariable Long orderId,
//            @RequestParam String carrier,
//            @RequestParam String trackingNumber,
//            @RequestParam String currentLocation,
//            @RequestParam String statusDescription) {
//
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//
//        trackingLogService.recordTrackingLog(order, carrier, trackingNumber, currentLocation, statusDescription);
//    }
}