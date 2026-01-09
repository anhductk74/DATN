package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.OrderReturnRequest;
import com.example.smart_mall_spring.Enum.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderReturnRequestRepository extends JpaRepository<OrderReturnRequest, UUID> {

    @Query("SELECT r FROM OrderReturnRequest r WHERE r.order.id = :orderId")
    List<OrderReturnRequest> findByOrderId(UUID orderId);

    @Query("SELECT r FROM OrderReturnRequest r WHERE r.user.id = :userId")
    List<OrderReturnRequest> findByUserId(UUID userId);

    @Query("SELECT r FROM OrderReturnRequest r WHERE r.status = 'PENDING'")
    List<OrderReturnRequest> findPendingRequests();
    boolean existsByOrderIdAndStatus(UUID orderId, ReturnStatus status);

    @Query("SELECT r FROM OrderReturnRequest r WHERE r.order.shop.id = :shopId")
    List<OrderReturnRequest> findByShopId(UUID shopId);
    
    // === Dashboard Queries ===
    
    // Count pending return requests
    @Query("SELECT COUNT(r) FROM OrderReturnRequest r WHERE r.status = 'PENDING'")
    Long countPendingRequests();

}