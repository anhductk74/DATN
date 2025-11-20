package com.example.smart_mall_spring.Dtos.Logistic.ShipperBalanceHistory;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ShipperBalanceHistoryResponseDto {

    private UUID id;
    private UUID shipperId;
    private String shipperName;

    private BigDecimal openingBalance;
    private BigDecimal collected;
    private BigDecimal deposited;
    private BigDecimal bonus;
    private BigDecimal finalBalance;

    private LocalDateTime date;
}