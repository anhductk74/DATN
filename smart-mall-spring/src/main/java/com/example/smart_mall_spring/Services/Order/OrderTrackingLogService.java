package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog.OrderTrackingLogRequest;
import com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog.OrderTrackingLogResponse;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderTrackingLog;
import com.example.smart_mall_spring.Repositories.OrderTrackingLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderTrackingLogService {

    private final OrderTrackingLogRepository trackingLogRepository;

    //  Tạo log vận chuyển mới
    public OrderTrackingLogResponse recordTrackingLog(Order order, OrderTrackingLogRequest request) {
        OrderTrackingLog log = new OrderTrackingLog();
        log.setOrder(order);
        log.setCarrier(request.getCarrier());
        log.setTrackingNumber(request.getTrackingNumber());
        log.setCurrentLocation(request.getCurrentLocation());
        log.setStatusDescription(request.getStatusDescription());
        log.setUpdatedAt(LocalDateTime.now());

        OrderTrackingLog saved = trackingLogRepository.save(log);
        return toResponse(saved);
    }

    //  Lấy danh sách tracking logs của một đơn hàng
    public List<OrderTrackingLogResponse> getTrackingLogsByOrder(Order order) {
        List<OrderTrackingLog> logs = trackingLogRepository.findByOrderOrderByUpdatedAtAsc(order);
        return logs.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Chuyển entity → DTO response
    private OrderTrackingLogResponse toResponse(OrderTrackingLog log) {
        OrderTrackingLogResponse dto = new OrderTrackingLogResponse();
        dto.setId(log.getId());
        dto.setCarrier(log.getCarrier());
        dto.setTrackingNumber(log.getTrackingNumber());
        dto.setCurrentLocation(log.getCurrentLocation());
        dto.setStatusDescription(log.getStatusDescription());
        dto.setUpdatedAt(log.getUpdatedAt());
        return dto;
    }
}