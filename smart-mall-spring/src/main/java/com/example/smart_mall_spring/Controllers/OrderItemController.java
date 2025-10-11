package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemResponseDto;
import com.example.smart_mall_spring.Services.Order.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    @GetMapping("/{orderId}")
    public List<OrderItemResponseDto> getOrderItemsByOrder(@PathVariable Long orderId) {
        return orderItemService.getOrderItemsByOrder(orderId);
    }
}