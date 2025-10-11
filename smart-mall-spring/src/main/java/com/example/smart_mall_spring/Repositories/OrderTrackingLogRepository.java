package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderTrackingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderTrackingLogRepository extends JpaRepository<OrderTrackingLog, Long> {
    List<OrderTrackingLog> findByOrderOrderByUpdatedAtAsc(Order order);
}
