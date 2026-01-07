package com.example.smart_mall_spring.Dtos.FlashSale;

import com.example.smart_mall_spring.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleResponseDto {
    
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Status status;
    private String bannerImage;
    private UUID shopId;
    private String shopName;
    private Integer displayPriority;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<FlashSaleItemResponseDto> items;
    
    // Computed fields
    private Boolean isActive;
    private Boolean isUpcoming;
    private Boolean isExpired;
    private Long timeUntilStart; // seconds
    private Long timeUntilEnd;   // seconds
    private Integer totalItems;
    private Integer activeItems;
}
