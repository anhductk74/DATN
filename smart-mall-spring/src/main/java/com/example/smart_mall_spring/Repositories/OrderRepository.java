package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Enum.StatusOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    //  Lấy đơn hàng theo user
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserId(UUID userId);

    //  Lấy đơn hàng theo shop (dành cho người bán)
    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByShopIdAndStatus(UUID shopId, StatusOrder status, Pageable pageable);

    // --- Lấy đơn hàng theo shop (phân trang) ---
    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId ORDER BY o.createdAt DESC")
    Page<Order> findByShopId(UUID shopId, Pageable pageable);

    //  Lọc theo trạng thái
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByUserIdAndStatus(UUID userId, StatusOrder status);

    //  Lấy tất cả đơn hàng theo trạng thái (dành cho admin)
    @Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByStatus(StatusOrder status, Pageable pageable);

    //  Lấy tất cả đơn hàng theo trạng thái (không phân trang)
    List<Order> findByStatus(StatusOrder status);

    //  Lấy chi tiết đơn hàng
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    Optional<Order> findOrderDetail(UUID orderId);
    
    // === Dashboard Queries ===
    
    // Sum revenue by date range (completed orders)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    Double sumRevenueByDateRange(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
    
    // Count orders by date range
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
    
    // Count orders by status
    Long countByStatus(StatusOrder status);
    
    // Count distinct users who have placed orders
    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o")
    Long countDistinctUsers();
    
    // Sum revenue by shop and date range
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.shop.id = :shopId AND o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    Double sumRevenueByShop(@Param("shopId") UUID shopId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
    
    // Count orders by shop
    @Query("SELECT COUNT(o) FROM Order o WHERE o.shop.id = :shopId")
    Long countByShopId(@Param("shopId") UUID shopId);
    
    // Get recent orders
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findTopByOrderByCreatedAtDesc(Pageable pageable);
    
    default List<Order> findTopByOrderByCreatedAtDesc(int limit) {
        return findTopByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(0, limit));
    }
}