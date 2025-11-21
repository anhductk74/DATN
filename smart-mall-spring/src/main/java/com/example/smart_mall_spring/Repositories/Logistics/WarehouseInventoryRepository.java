package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.WarehouseInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, UUID> {
    List<WarehouseInventory> findByWarehouse_Id(UUID warehouseId);
    Optional<WarehouseInventory> findByProduct_IdAndWarehouse_Id(UUID productId, UUID warehouseId);

}