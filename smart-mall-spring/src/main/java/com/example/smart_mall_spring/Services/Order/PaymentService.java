package com.example.smart_mall_spring.Services.Order;


import com.example.smart_mall_spring.Dtos.Orders.Payment.CreatePaymentRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.Payment.PaymentResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderStatusHistory;
import com.example.smart_mall_spring.Entities.Orders.Payment;
import com.example.smart_mall_spring.Enum.PaymentStatus;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Repositories.OrderStatusHistoryRepository;
import com.example.smart_mall_spring.Repositories.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    //  Khởi tạo thanh toán
    public PaymentResponseDto createPayment(CreatePaymentRequestDto dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Nếu đã tồn tại thanh toán cho đơn hàng này
        paymentRepository.findByOrderId(order.getId())
                .ifPresent(p -> { throw new RuntimeException("Payment already exists for this order"); });

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(dto.getMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(order.getFinalAmount() != null ? order.getFinalAmount() : order.getTotalAmount());
        payment.setPaidAt(null);

        paymentRepository.save(payment);

        // Lưu lịch sử trạng thái
        saveStatusHistory(order, null, StatusOrder.PENDING, "Create payment for order");

        return toResponse(payment);
    }

    //  Cập nhật trạng thái thanh toán (dành cho callback từ VNPay/MoMo)
    public PaymentResponseDto updatePaymentStatus(String transactionId, PaymentStatus newStatus) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(newStatus);
        Order order = payment.getOrder();

        StatusOrder oldStatus = order.getStatus();

        switch (newStatus) {
            case SUCCESS -> {
                payment.setPaidAt(LocalDateTime.now());
                order.setStatus(StatusOrder.CONFIRMED);
                saveStatusHistory(order, oldStatus, StatusOrder.CONFIRMED, "Payment Successfully");
            }
            case FAILED -> {
                order.setStatus(StatusOrder.CANCELLED);
                saveStatusHistory(order, oldStatus, StatusOrder.CANCELLED, "Payment Failed, order cancelled");
            }
            case REFUNDED -> {
                order.setStatus(StatusOrder.RETURNED); // 💸 Hoàn tiền → trả hàng
                saveStatusHistory(order, oldStatus, StatusOrder.RETURNED, "Refund for order");
            }
            default -> {
                order.setStatus(StatusOrder.PENDING);
                saveStatusHistory(order, oldStatus, StatusOrder.PENDING, "Payment status unknown");
            }
        }

        paymentRepository.save(payment);
        orderRepository.save(order);

        return toResponse(payment);
    }

    //  Lấy thông tin thanh toán theo Order ID
    public PaymentResponseDto getPaymentByOrder(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return toResponse(payment);
    }
    private void saveStatusHistory(Order order, StatusOrder from, StatusOrder to, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setNote(note);
        history.setChangedAt(LocalDateTime.now());
        orderStatusHistoryRepository.save(history);
    }

    private PaymentResponseDto toResponse(Payment payment) {
        return PaymentResponseDto.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .build();
    }
}