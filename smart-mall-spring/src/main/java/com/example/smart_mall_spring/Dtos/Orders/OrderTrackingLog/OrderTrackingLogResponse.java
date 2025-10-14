package com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OrderTrackingLogResponse {
    private UUID id;
    private String carrier;
    private String trackingNumber;
    private String currentLocation;
    private String statusDescription;
    private LocalDateTime updatedAt;
}