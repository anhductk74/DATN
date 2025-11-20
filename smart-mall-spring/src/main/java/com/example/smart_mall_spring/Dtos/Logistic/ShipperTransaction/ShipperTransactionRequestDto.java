package com.example.smart_mall_spring.Dtos.Logistic.ShipperTransaction;

import com.example.smart_mall_spring.Enum.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipperTransactionRequestDto {
    private UUID shipperId;
    private UUID shipmentOrderId;
    private BigDecimal amount;
    private TransactionType transactionType;
    private UUID subShipmentOrderId;

}