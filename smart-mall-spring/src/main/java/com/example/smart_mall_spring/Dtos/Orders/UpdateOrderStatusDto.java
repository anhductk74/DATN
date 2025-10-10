package com.example.smart_mall_spring.Dtos.Orders;

import com.example.smart_mall_spring.Enum.StatusOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusDto {
    private UUID orderId;
    private StatusOrder status;
}