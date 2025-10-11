package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query("SELECT i FROM OrderItem i WHERE i.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);


    @Query("SELECT SUM(i.price * i.quantity) FROM OrderItem i WHERE i.order.id = :orderId")
    Double calculateTotalAmount(@Param("orderId") Long orderId);


    @Query("SELECT i FROM OrderItem i WHERE i.order.shop.id = :shopId")
    List<OrderItem> findByShopId(@Param("shopId") Long shopId);


    @Query("SELECT i FROM OrderItem i WHERE i.order.user.id = :userId")
    List<OrderItem> findByUserId(@Param("userId") Long userId);
}
