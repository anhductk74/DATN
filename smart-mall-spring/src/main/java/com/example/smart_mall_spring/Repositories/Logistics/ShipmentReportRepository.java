package com.example.smart_mall_spring.Repositories.Logistics;


import com.example.smart_mall_spring.Entities.Logistics.ShipmentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentReportRepository extends JpaRepository<ShipmentReport, UUID> {

    @Query("SELECT r FROM ShipmentReport r WHERE r.reportDate BETWEEN :start AND :end ORDER BY r.reportDate DESC")
    List<ShipmentReport> findReportsBetweenDates(LocalDate start, LocalDate end);

    Optional<ShipmentReport> findByReportDate(LocalDate reportDate);
}