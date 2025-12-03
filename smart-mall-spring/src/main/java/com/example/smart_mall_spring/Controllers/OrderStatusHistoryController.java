package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderStatusHistory;
import com.example.smart_mall_spring.Exception.ResourceNotFoundException;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Services.Order.OrderStatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderStatusHistoryController {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryService historyService;

    @GetMapping("/{orderId}/history")
    public List<OrderStatusHistory> getOrderHistory(@PathVariable UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return historyService.getHistoryByOrder(order);
    }
}