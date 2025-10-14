package com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingLogRequest {
    private String carrier;          // Hãng vận chuyển (GHN, GHTK,...)
    private String trackingNumber;   // Mã vận đơn
    private String currentLocation;  // Vị trí hiện tại
    private String statusDescription; // Mô tả trạng thái (đang giao, đã đến kho,...)
}
