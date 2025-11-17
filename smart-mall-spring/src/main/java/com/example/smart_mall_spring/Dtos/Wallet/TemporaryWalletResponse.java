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
public class TemporaryWalletResponse {
    private UUID id;
    private UUID shopId;
    private String shopName;
    private UUID orderId;
    private Double amount;
    private Boolean isTransferred;
    private LocalDateTime transferredAt;
    private String note;
    private LocalDateTime createdAt;
}
