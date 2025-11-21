package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.Warehouse;
import com.example.smart_mall_spring.Enum.WarehouseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    List<Warehouse> findByShippingCompany_Id(UUID shippingCompanyId);

    List<Warehouse> findByStatus(WarehouseStatus status);

    boolean existsByName(String name);
    long countByStatus(WarehouseStatus status);

    @Query("SELECT SUM(w.capacity) FROM Warehouse w")
    Integer getTotalCapacity();

    @Query("SELECT SUM(w.currentStock) FROM Warehouse w")
    Integer getTotalCurrentStock();
}