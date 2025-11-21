package com.example.smart_mall_spring.Dtos.Logistic.WarehouseInventoryItem;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseStatisticsResponse {
    private int total;
    private int active;
    private int inactive;
    private int maintenance;
    private int full;
    private int temporarilyClosed;
    private int totalCapacity;
    private int totalCurrentStock;
}
