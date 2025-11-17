package com.example.smart_mall_spring.Dtos.Wallet;

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
public class WalletResponse {
    private UUID id;
    private UUID shopId;
    private String shopName;
    private Double balance;
    private Double totalEarned;
    private Double totalWithdrawn;
    private Double pendingAmount;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
