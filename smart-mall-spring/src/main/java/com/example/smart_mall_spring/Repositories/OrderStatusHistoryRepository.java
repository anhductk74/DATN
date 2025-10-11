package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.OrderStatusHistory;
import com.example.smart_mall_spring.Entities.Orders.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
    List<OrderStatusHistory> findByOrderOrderByChangedAtAsc(Order order);
}