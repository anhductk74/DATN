package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Enum.StatusOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    //  Lấy đơn hàng theo user
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserId(UUID userId);

    //  Lấy đơn hàng theo shop (dành cho người bán)
    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId ORDER BY o.createdAt DESC")
    List<Order> findByShopId(UUID shopId);

    //  Lọc theo trạng thái
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByUserIdAndStatus(UUID userId, StatusOrder status);

    //  Lấy chi tiết đơn hàng
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    Optional<Order> findOrderDetail(UUID orderId);
}