package com.example.smart_mall_spring.Dtos.Logistic.ShipperTransaction;

import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipperTransactionResponseDto {
    private UUID id;
    private UUID shipperId;
    private String shipperName;
    private UUID shipmentOrderId;
    private String shipmentOrderCode;
    private BigDecimal amount;
    private ShipperTransactionType transactionType;
    private LocalDateTime createdAt;
    private UUID subShipmentOrderId;
}
