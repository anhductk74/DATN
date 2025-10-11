package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.Orders.OrderRequest;
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

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request) {

        Order order = request.getOrder();
        List<OrderItem> items = request.getItems();
        Payment payment = request.getPayment();
        ShippingFee shippingFee = request.getShippingFee();
        OrderVoucher voucher = request.getVoucher();

        Order createdOrder = orderService.createOrder(order, items, payment, shippingFee, voucher);
        return ResponseEntity.ok(createdOrder);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable UUID id) {
        boolean success = orderService.cancelOrder(id);
        if (success) {
            return ResponseEntity.ok("The order has been canceled successfully.");
        } else {
            return ResponseEntity.badRequest().body("Cannot cancel order (order is confirmed or does not exist)");
        }
    }
}