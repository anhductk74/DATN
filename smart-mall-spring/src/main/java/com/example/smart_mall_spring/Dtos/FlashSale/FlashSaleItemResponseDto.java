package com.example.smart_mall_spring.Dtos.FlashSale;

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
public class FlashSaleItemResponseDto {
    
    private UUID id;
    private UUID flashSaleId;
    private UUID productId;
    private String productName;
    private String productBrand;
    private List<String> productImages;
    private UUID productVariantId;
    private String variantSku;
    private Double originalPrice;
    private Double flashSalePrice;
    private Double discountAmount;
    private Integer discountPercent;
    private Integer totalQuantity;
    private Integer remainingQuantity;
    private Integer soldQuantity;
    private Integer maxQuantityPerUser;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    private Double savingsPercent;
    private Boolean hasStock;
    private Integer stockPercent;
}
