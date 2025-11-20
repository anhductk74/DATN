package com.example.smart_mall_spring.Dtos.Logistic.Dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {

    private Integer totalShippers;
    private Integer totalShipmentOrders;

    private BigDecimal totalCodCollected;
    private BigDecimal totalCodDeposited;
    private BigDecimal totalCodRemaining;

    private BigDecimal totalBonus;
    private BigDecimal totalShippingFee;
}