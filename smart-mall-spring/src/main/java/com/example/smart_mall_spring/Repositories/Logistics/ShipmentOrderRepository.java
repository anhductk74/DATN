package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.ShipmentOrder;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShipmentOrderRepository extends JpaRepository<ShipmentOrder, UUID> {

    @Query("SELECT s FROM ShipmentOrder s WHERE s.status = :status")
    List<ShipmentOrder> findByStatus(@Param("status") ShipmentStatus status);

    @Query("SELECT s FROM ShipmentOrder s WHERE s.shipper.id = :shipperId")
    List<ShipmentOrder> findByShipper(@Param("shipperId") UUID shipperId);

    @Query("SELECT s FROM ShipmentOrder s WHERE s.order.id = :orderId")
    ShipmentOrder findByOrderId(@Param("orderId") UUID orderId);

    @Query("SELECT s FROM ShipmentOrder s WHERE s.warehouse.id = :warehouseId")
    List<ShipmentOrder> findByWarehouse(@Param("warehouseId") UUID warehouseId);

    Optional<ShipmentOrder> findByTrackingCode(String trackingCode);

    @Query("""
        SELECT s FROM ShipmentOrder s
        WHERE (:status IS NULL OR s.status = :status)
        AND (:shipperId IS NULL OR s.shipper.id = :shipperId)
        AND (:warehouseId IS NULL OR s.warehouse.id = :warehouseId)
        AND (:search IS NULL OR 
             LOWER(s.deliveryAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR 
             LOWER(s.pickupAddress) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<ShipmentOrder> findWithFilters(
            @Param("status") ShipmentStatus status,
            @Param("search") String search,
            @Param("shipperId") UUID shipperId,
            @Param("warehouseId") UUID warehouseId,
            Pageable pageable
    );
    boolean existsByOrder_Id(UUID orderId);
    Optional<ShipmentOrder> findByOrder_Id(UUID orderId);

    @Query("SELECT COUNT(s) FROM ShipmentOrder s WHERE s.shipper.id = :shipperId")
    long countByShipperId(@Param("shipperId") UUID shipperId);

    @Query("SELECT COUNT(s) FROM ShipmentOrder s WHERE s.shipper.id = :shipperId AND s.status = :status")
    long countByShipperIdAndStatus(@Param("shipperId") UUID shipperId, @Param("status") ShipmentStatus status);

    @Query("SELECT s FROM ShipmentOrder s WHERE DATE(s.createdAt) = :date")
    List<ShipmentOrder> findByReportDate(@Param("date") LocalDate date);

    List<ShipmentOrder> findByShipper_Id(UUID shipperId);

    @Query("""
    SELECT s FROM ShipmentOrder s
    WHERE s.shipper.id = :shipperId
      AND s.status = :status
      AND s.deliveredAt BETWEEN :start AND :end
""")
    List<ShipmentOrder> findDeliveredByShipperAndDate(
            @Param("shipperId") UUID shipperId,
            @Param("status") ShipmentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT s FROM ShipmentOrder s WHERE s.status = :status AND s.deliveredAt BETWEEN :start AND :end")
    List<ShipmentOrder> findDeliveredOrdersBetween(
            @Param("status") ShipmentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT COUNT(s) FROM ShipmentOrder s WHERE DATE(s.createdAt) BETWEEN :from AND :to")
    Integer countByDateRange(LocalDate from, LocalDate to);

    @Query("SELECT SUM(s.shippingFee) FROM ShipmentOrder s WHERE DATE(s.createdAt) BETWEEN :from AND :to")
    BigDecimal sumShippingFee(LocalDate from, LocalDate to);
}