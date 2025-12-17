package com.example.smart_mall_spring.Repositories.Logistics;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.RecentDeliveryDto;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.ShipperDashboardResponseDto;
import com.example.smart_mall_spring.Entities.Logistics.SubShipmentOrder;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubShipmentOrderRepository extends JpaRepository<SubShipmentOrder, UUID> {

    List<SubShipmentOrder> findByShipmentOrder_Id(UUID shipmentOrderId);
    List<SubShipmentOrder> findByShipper_Id(UUID shipperId);
    List<SubShipmentOrder> findByShipper_IdAndStatus(UUID shipperId, ShipmentStatus status);
//    Optional<SubShipmentOrder> findByShipmentOrder_TrackingCode(String trackingCode);

    @Query("""
    SELECT s
    FROM SubShipmentOrder s
    WHERE s.shipmentOrder.trackingCode LIKE %:suffix
    ORDER BY s.sequence ASC
""")
    List<SubShipmentOrder> findAllByTrackingCodeSuffix(String suffix);



    // tổng số đơn được gán hôm nay (dùng createdAt trong ngày)
    @Query("""
        SELECT COUNT(s)
        FROM SubShipmentOrder s
        WHERE s.shipper.id = :shipperId
          AND FUNCTION('date', s.createdAt) = CURRENT_DATE
        """)
    long countAssignedToday(UUID shipperId);

    // tổng chặng hoàn thành hôm nay (DELIVERED với endTime thuộc ngày hôm nay)
    @Query("""
        SELECT COUNT(s)
        FROM SubShipmentOrder s
        WHERE s.shipper.id = :shipperId
          AND s.status = com.example.smart_mall_spring.Enum.ShipmentStatus.DELIVERED
        """)
    long countDeliveredToday(UUID shipperId);

    // số chặng đang vận chuyển (IN_TRANSIT)
    @Query("""
        SELECT COUNT(s)
        FROM SubShipmentOrder s
        WHERE s.shipper.id = :shipperId
          AND s.status = com.example.smart_mall_spring.Enum.ShipmentStatus.IN_TRANSIT
        """)
    long countInTransitToday(UUID shipperId);

    // số chặng chờ (PENDING)
    @Query("""
        SELECT COUNT(s)
        FROM SubShipmentOrder s
        WHERE s.shipper.id = :shipperId
          AND s.status = com.example.smart_mall_spring.Enum.ShipmentStatus.PENDING
        """)
    long countPendingToday(UUID shipperId);

    // recent deliveries: lấy chặng đã hoàn thành gần nhất (DELIVERED)
    @Query("""
    SELECT new com.example.smart_mall_spring.Dtos.Logistic.Dashboard.RecentDeliveryDto(
        s.shipmentOrder.trackingCode,
        s.endTime,
        s.shipmentOrder.order.user.profile.fullName,
        s.shipmentOrder.order.user.profile.phoneNumber,
        s.shipmentOrder.deliveryAddress,
        s.fromWarehouse.name,
        s.sequence,
        s.shipper.user.profile.fullName,
        CONCAT(s.shipper.vehicleType, ' - ', s.shipper.licensePlate)
    )
    FROM SubShipmentOrder s
    WHERE s.shipper.id = :shipperId
      AND s.status = com.example.smart_mall_spring.Enum.ShipmentStatus.DELIVERED
      AND s.sequence = 3
    ORDER BY s.endTime DESC
""")
    List<RecentDeliveryDto> findRecentDeliveries(UUID shipperId, Pageable pageable);



}