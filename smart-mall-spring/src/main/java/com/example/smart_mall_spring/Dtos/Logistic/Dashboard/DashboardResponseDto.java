package com.example.smart_mall_spring.Dtos.Logistic.Dashboard;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDto {

    private DashboardSummaryDto summary;

    private List<DashboardChartPointDto> chart;

    private List<TopShipperDto> topShippers;
}
