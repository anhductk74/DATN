package com.example.smart_mall_spring.Dtos.Logistic.ShipmentReport;


import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ShipmentReportRequestDto {
    private LocalDate reportDate;
    private Integer totalOrders;
    private Integer deliveredOrders;
    private Integer returnedOrders;
    private BigDecimal totalCod;
    private BigDecimal totalShippingFee;
    private Double successRate;
}
