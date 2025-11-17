package com.example.smart_mall_spring.Dtos.Wallet;

import com.example.smart_mall_spring.Enum.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private UUID id;
    private UUID walletId;
    private TransactionType type;
    private Double amount;
    private Double balanceBefore;
    private Double balanceAfter;
    private UUID orderId;
    private UUID withdrawalRequestId;
    private String description;
    private String referenceCode;
    private LocalDateTime createdAt;
}
