package com.example.smart_mall_spring.Repositories.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.DailyStatsProjection;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.DashboardChartPointDto;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.TopShipperDto;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.TopShipperProjection;
import com.example.smart_mall_spring.Entities.Logistics.ShipperTransaction;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShipperTransactionRepository extends JpaRepository<ShipperTransaction, UUID> {

    List<ShipperTransaction> findByShipper_Id(UUID shipperId);

    List<ShipperTransaction> findByShipmentOrder_Id(UUID shipmentOrderId);

    List<ShipperTransaction> findByTransactionType(ShipperTransactionType ShipperTransactionType);

    // Tổng COD thu được theo shipper
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM ShipperTransaction t
        WHERE t.shipper.id = :shipperId
          AND t.transactionType = com.example.smart_mall_spring.Enum.ShipperTransactionType.COLLECT_COD
    """)
    BigDecimal findTotalCollected(@Param("shipperId") UUID shipperId);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM ShipperTransaction t
        WHERE t.shipper.id = :shipperId
          AND t.transactionType = :type
    """)
    BigDecimal findTotalByType(
            @Param("shipperId") UUID shipperId,
            @Param("type") ShipperTransactionType type
    );

    boolean existsByShipmentOrder_IdAndTransactionType(UUID shipmentOrderId, ShipperTransactionType type);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM ShipperTransaction t
        WHERE t.shipper.id = :shipperId
          AND t.transactionType = :type
          AND DATE(t.createdAt) = :date
    """)
    BigDecimal sumByTypeAndShipperAndDate(
            @Param("shipperId") UUID shipperId,
            @Param("type") ShipperTransactionType type,
            @Param("date") LocalDate date
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM ShipperTransaction t
        WHERE t.transactionType = :type
          AND DATE(t.createdAt) = :date
    """)
    BigDecimal sumAllByTypeAndDate(
            @Param("type") ShipperTransactionType type,
            @Param("date") LocalDate date
    );

    // ---- SUMMARY ----
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM ShipperTransaction t
        WHERE t.transactionType = :type
          AND DATE(t.createdAt) BETWEEN :from AND :to
    """)
    BigDecimal sumAmountByTypeAndDate(
            @Param("type") ShipperTransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );


    // ---- CHART (không dùng CAST để tránh lỗi FULL_GROUP_BY) ----
    @Query("""
    SELECT 
        FUNCTION('DATE', t.createdAt) AS date,
        COALESCE(SUM(CASE WHEN t.transactionType = 'COLLECT_COD' THEN t.amount ELSE 0 END), 0) AS codCollected,
        COALESCE(SUM(CASE WHEN t.transactionType = 'DEPOSIT_COD' THEN t.amount ELSE 0 END), 0) AS codDeposited,
        COALESCE(SUM(CASE WHEN t.transactionType = 'COLLECT_COD' THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.transactionType = 'DEPOSIT_COD' THEN t.amount ELSE 0 END), 0) AS codRemaining
    FROM ShipperTransaction t
    WHERE t.createdAt BETWEEN :from AND :to
    GROUP BY FUNCTION('DATE', t.createdAt)
    ORDER BY FUNCTION('DATE', t.createdAt)
""")
    List<DailyStatsProjection> getDailyStats(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );


    // ---- TOP SHIPPERS ----
    @Query("""
    SELECT 
        t.shipper.user.profile.fullName AS fullName,
        COALESCE(SUM(CASE WHEN t.transactionType = 'COLLECT_COD' THEN t.amount ELSE 0 END), 0) AS codCollected,
        COALESCE(SUM(CASE WHEN t.transactionType = 'COLLECT_COD' THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.transactionType = 'DEPOSIT_COD' THEN t.amount ELSE 0 END), 0) AS codRemaining
    FROM ShipperTransaction t
    WHERE t.createdAt BETWEEN :from AND :to
    GROUP BY t.shipper.id, t.shipper.user.profile.fullName
    ORDER BY 
        COALESCE(SUM(CASE WHEN t.transactionType = 'COLLECT_COD' THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.transactionType = 'DEPOSIT_COD' THEN t.amount ELSE 0 END), 0) DESC
""")
    List<TopShipperProjection> getTopShippers(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

}
