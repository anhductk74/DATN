package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.ShipmentLog;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShipmentLogRepository extends JpaRepository<ShipmentLog, UUID> {

    List<ShipmentLog> findByShipmentOrder_Id(UUID shipmentOrderId);

    List<ShipmentLog> findByStatus(ShipmentStatus status);

    @Query("SELECT l FROM ShipmentLog l WHERE l.shipmentOrder.id = :shipmentOrderId ORDER BY l.createdAt DESC")
    List<ShipmentLog> findRecentLogsByShipmentOrder(UUID shipmentOrderId);
}