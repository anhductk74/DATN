package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.ShipperBalanceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ShipperBalanceHistoryRepository extends JpaRepository<ShipperBalanceHistory, UUID> {
    List<ShipperBalanceHistory> findByDateBetween(LocalDateTime start, LocalDateTime end);
    List<ShipperBalanceHistory> findByShipperId(UUID shipperId);
    List<ShipperBalanceHistory> findByShipperIdAndDateBetween(
            UUID shipperId, LocalDateTime start, LocalDateTime end);
    Page<ShipperBalanceHistory> findByShipperId(
            UUID shipperId, Pageable pageable);


}