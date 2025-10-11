package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Entities.Orders.*;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private Order order;
    private List<OrderItem> items;
    private Payment payment;
    private ShippingFee shippingFee;
    private OrderVoucher voucher;
}