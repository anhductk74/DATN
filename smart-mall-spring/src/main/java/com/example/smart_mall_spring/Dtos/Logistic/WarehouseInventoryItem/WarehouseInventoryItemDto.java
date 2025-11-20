package com.example.smart_mall_spring.Dtos.Logistic.WarehouseInventoryItem;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseInventoryItemDto {
    private UUID id;
    private UUID productId;
    private String productName;
    private String category;
    private Integer quantity;
    private String unit;
    private String location;
    private LocalDateTime lastUpdated; // lấy từ BaseEntity
}