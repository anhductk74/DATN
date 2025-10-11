package com.example.smart_mall_spring.Services.Order;


import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderTrackingLog;
import com.example.smart_mall_spring.Repositories.OrderTrackingLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderTrackingLogService {

    private final OrderTrackingLogRepository trackingLogRepository;

    //  Ghi log vận chuyển (khi đơn hàng di chuyển)
    public void recordTrackingLog(Order order, String carrier, String trackingNumber,
                                  String currentLocation, String statusDescription) {
        OrderTrackingLog log = new OrderTrackingLog();
        log.setOrder(order);
        log.setCarrier(carrier);
        log.setTrackingNumber(trackingNumber);
        log.setCurrentLocation(currentLocation);
        log.setStatusDescription(statusDescription);
        log.setUpdatedAt(LocalDateTime.now());

        trackingLogRepository.save(log);
    }

    //  Lấy danh sách tracking logs theo đơn hàng
    public List<OrderTrackingLog> getTrackingLogsByOrder(Order order) {
        return trackingLogRepository.findByOrderOrderByUpdatedAtAsc(order);
    }
}
