package com.example.smart_mall_spring.Entities.Logistics;


import com.example.smart_mall_spring.Entities.BaseEntity;

import com.example.smart_mall_spring.Enum.ReconciliationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cod_reconciliation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodReconciliation extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "shipper_id", nullable = false)
    private Shipper shipper;

    private BigDecimal totalCollected;   // Tổng COD shipper thu
    private BigDecimal totalDeposited;   // Tổng COD shipper đã nộp
    private BigDecimal difference;       // Chênh lệch (shipper còn giữ)

    @Enumerated(EnumType.STRING)
    private ReconciliationStatus status; // PENDING / PROCESSING / DONE

    private LocalDate date;              // Ngày đối soát
}