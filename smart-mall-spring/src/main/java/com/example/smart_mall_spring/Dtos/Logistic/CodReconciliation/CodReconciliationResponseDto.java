package com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation;

import com.example.smart_mall_spring.Enum.ReconciliationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodReconciliationResponseDto {
    private UUID id;

    private UUID shipperId;
    private String shipperName;

    private BigDecimal totalCollected;
    private BigDecimal totalDeposited;
    private BigDecimal difference;

    private ReconciliationStatus status;
    private LocalDate date;
}
