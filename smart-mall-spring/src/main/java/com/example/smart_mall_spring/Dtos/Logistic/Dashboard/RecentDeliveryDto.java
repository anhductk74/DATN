package com.example.smart_mall_spring.Dtos.Logistic.Dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RecentDeliveryDto {
    private String trackingCode;
    private LocalDateTime deliveredAt;

    private String recipientName;
    private String recipientPhone;
    private String deliveryAddress;

    private String warehouseName;
    private int sequence;
    private String shipperName;
    private String vehicleInfo; // ví dụ: licensePlate + vehicleType
}