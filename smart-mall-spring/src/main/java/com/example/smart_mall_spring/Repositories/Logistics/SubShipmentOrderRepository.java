package com.example.smart_mall_spring.Repositories.Logistics;
import com.example.smart_mall_spring.Entities.Logistics.SubShipmentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubShipmentOrderRepository extends JpaRepository<SubShipmentOrder, UUID> {
    List<SubShipmentOrder> findByShipmentOrder_Id(UUID shipmentOrderId);
    List<SubShipmentOrder> findByShipper_Id(UUID shipperId);
}