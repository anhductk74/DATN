package com.example.smart_mall_spring.Dtos.Dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Revenue chart data for dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueChartDto {
    private List<DataPoint> dataPoints;
    private Double totalRevenue;
    private Double averagePerDay;
    private Double percentChange;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        private LocalDate date;
        private String label; // "Mon", "Tue", etc or "Jan", "Feb"
        private Double revenue;
        private Long orderCount;
    }
}
