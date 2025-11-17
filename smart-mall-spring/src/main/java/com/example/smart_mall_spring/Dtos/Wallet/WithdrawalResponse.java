package com.example.smart_mall_spring.Dtos.Wallet;

import com.example.smart_mall_spring.Enum.WithdrawalStatus;
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
public class WithdrawalResponse {
    private UUID id;
    private UUID shopId;
    private String shopName;
    private UUID walletId;
    private Double amount;
    private WithdrawalStatus status;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountName;
    private String note;
    private String adminNote;
    private String processedBy;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
