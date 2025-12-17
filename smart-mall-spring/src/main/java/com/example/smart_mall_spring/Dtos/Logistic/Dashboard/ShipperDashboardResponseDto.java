package com.example.smart_mall_spring.Dtos.Logistic.Dashboard;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class ShipperDashboardResponseDto {

    private TodaySummary today;
    private CodSummary cod;
    private List<RecentDeliveryDto> recentDeliveries;

    @Data
    @AllArgsConstructor
    public static class TodaySummary {
        private long totalAssigned;
        private long delivered;
        private long inTransit;
        private long pending;
    }

    @Data
    @AllArgsConstructor
    public static class CodSummary {
        private BigDecimal totalCollected;
        private BigDecimal totalPaid;
        private BigDecimal codBalance;
        private BigDecimal totalBonus;
        private BigDecimal netIncome;


    }
}