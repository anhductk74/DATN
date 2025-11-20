package com.example.smart_mall_spring.Dtos.Logistic.ShipmentReport;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ShipmentReportResponseDto {
    private UUID id;
    private LocalDate reportDate;
    private Integer totalOrders;
    private Integer deliveredOrders;
    private Integer returnedOrders;
    private BigDecimal totalCod;
    private BigDecimal totalShippingFee;
    private Double successRate;
}