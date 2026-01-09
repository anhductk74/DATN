package com.example.smart_mall_spring.Dtos.Dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Recent activity in the system
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {
    private UUID id;
    private String type; // "SHOP_REGISTERED", "ORDER_CREATED", "REPORT", "REVIEW", etc.
    private String title;
    private String description;
    private String icon; // emoji or icon name
    private LocalDateTime timestamp;
    private UUID referenceId;
    private String referenceType;
}
