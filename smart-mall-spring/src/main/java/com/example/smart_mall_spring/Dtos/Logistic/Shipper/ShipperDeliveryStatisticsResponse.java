package com.example.smart_mall_spring.Dtos.Logistic.Shipper;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShipperDeliveryStatisticsResponse {
    private long totalDeliveries;
    private long successfulDeliveries;
    private long failedDeliveries;
    private double successRate;
}
