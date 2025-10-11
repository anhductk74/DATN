package com.example.smart_mall_spring.Services.Order;


import com.example.smart_mall_spring.Entities.Orders.*;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ShippingFeeRepository shippingFeeRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderTrackingLogRepository orderTrackingLogRepository;
    private final OrderVoucherRepository orderVoucherRepository;

    /**
     * 🛒 Đặt hàng
     */
    @Transactional
    public Order createOrder(Order order, List<OrderItem> items,
                             Payment payment, ShippingFee shippingFee,
                             OrderVoucher voucher) {

        // 1️ Lưu đơn hàng chính
        order.setStatus(StatusOrder.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        // 2️ Lưu sản phẩm trong đơn
        for (OrderItem item : items) {
            item.setOrder(order);
            orderItemRepository.save(item);
        }

        // 3️ Lưu thanh toán
        if (payment != null) {
            payment.setOrder(order);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        // 4️ Lưu phí vận chuyển
        if (shippingFee != null) {
            shippingFee.setOrder(order);
            shippingFeeRepository.save(shippingFee);
        }

        // 5️ Lưu voucher nếu có
        if (voucher != null) {
            voucher.setOrder(order);
            orderVoucherRepository.save(voucher);
        }

        // 6️ Lưu lịch sử trạng thái
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(null);
        history.setChangedAt(LocalDateTime.now());
        orderStatusHistoryRepository.save(history);

        // 7️ Ghi log tracking
        OrderTrackingLog log = new OrderTrackingLog();
        log.setOrder(order);
        log.setStatusDescription("Order created successfully");
        log.setUpdatedAt(LocalDateTime.now());
        orderTrackingLogRepository.save(log);

        return order;
    }

    public Optional<Order> getOrderById(UUID orderId) {
        return orderRepository.findById(orderId);
    }


    public List<Order> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserId(userId);
    }


    @Transactional
    public boolean cancelOrder(UUID orderId) {
        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isEmpty()) return false;

        Order order = optionalOrder.get();

        if (order.getStatus() == StatusOrder.PENDING) {
            order.setStatus(StatusOrder.CANCELLED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            // Lưu lịch sử trạng thái
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrder(order);
            history.setFromStatus(order.getStatus());
            history.setToStatus(StatusOrder.CANCELLED);
            history.setChangedAt(LocalDateTime.now());
            orderStatusHistoryRepository.save(history);

            // Ghi log
            OrderTrackingLog log = new OrderTrackingLog();
            log.setOrder(order);
            log.setStatusDescription("The order was canceled by the user.");
            log.setUpdatedAt(LocalDateTime.now());
            orderTrackingLogRepository.save(log);

            return true;
        }

        return false;
    }
}