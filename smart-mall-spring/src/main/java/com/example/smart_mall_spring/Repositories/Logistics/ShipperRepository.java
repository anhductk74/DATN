package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShipperRepository extends JpaRepository<Shipper, UUID> {

    List<Shipper> findByShippingCompany_Id(UUID companyId);

    List<Shipper> findByStatus(com.example.smart_mall_spring.Enum.ShipperStatus status);

    boolean existsByPhoneNumber(String phoneNumber);

    long countByStatus(ShipperStatus status);

    @Query("SELECT COUNT(s) FROM Shipper s")
    long countAllShippers();

    @Query("SELECT COUNT(s) FROM Shipper s WHERE s.status = 'ACTIVE'")
    Integer countActiveShippers();
}