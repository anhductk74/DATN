package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.CodReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CodReconciliationRepository extends JpaRepository<CodReconciliation, UUID> {

    List<CodReconciliation> findByDate(LocalDate date);

    Optional<CodReconciliation> findByShipper_IdAndDate(UUID shipperId, LocalDate date);
}