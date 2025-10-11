package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Enum.StatusOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDto {
    private UUID id;
    private String shopName;
    private StatusOrder status;
    private Double finalAmount;
    private LocalDateTime createdAt;
}
