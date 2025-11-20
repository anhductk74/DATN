package com.example.smart_mall_spring.Dtos.Logistic.Shipper;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShipperStatisticsResponse {
    private long total;
    private long active;
    private long busy;
    private long inactive;
    private long onLeave;
    private long suspended;
}