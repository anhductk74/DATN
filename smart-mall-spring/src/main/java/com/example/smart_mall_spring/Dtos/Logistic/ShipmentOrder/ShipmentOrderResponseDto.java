package com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder;


import com.example.smart_mall_spring.Enum.ShipmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentOrderResponseDto {

    private UUID id;
    private String orderCode; // Mã đơn hàng (nếu Order có code)
    private String shipperName;
    private String warehouseName;

    private String pickupAddress;
    private String deliveryAddress;
    private String recipientName;     // thêm tên người nhận
    private String recipientPhone;    // thêm SĐT người nhận

    private BigDecimal codAmount;
    private BigDecimal shippingFee;

    private ShipmentStatus status;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime deliveredAt;
    private LocalDateTime returnedAt;
    private String trackingCode;
    private Integer weight;

    private List<Map<String, Object>> subShipments;
}