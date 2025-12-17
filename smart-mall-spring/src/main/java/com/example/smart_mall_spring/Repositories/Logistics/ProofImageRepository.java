package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.ProofImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProofImageRepository extends JpaRepository<ProofImage, UUID> {
    List<ProofImage> findBySubShipmentOrderId(UUID subId);
}
