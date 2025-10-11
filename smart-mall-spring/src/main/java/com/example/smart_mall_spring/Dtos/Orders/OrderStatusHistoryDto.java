package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Enum.StatusOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryDto {
    private StatusOrder fromStatus;
    private StatusOrder toStatus;
    private String note;
    private LocalDateTime changedAt;
}