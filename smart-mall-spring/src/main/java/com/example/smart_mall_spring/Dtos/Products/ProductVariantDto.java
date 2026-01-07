package com.example.smart_mall_spring.Dtos.Products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantDto {
    private UUID id;
    private String sku;
    private Double price;
    private Integer stock;
    private Double weight;
    private String dimensions;
    private List<VariantAttributeDto> attributes;
    private UUID productId;
    private String productName;
    private String productBrand;
    private String productImage;
    
    // Flash Sale fields
    private Boolean isFlashSale;
    private Double flashSalePrice;
    private LocalDateTime flashSaleStart;
    private LocalDateTime flashSaleEnd;
    private Integer flashSaleQuantity;
    private Double effectivePrice;
    private Boolean isFlashSaleActive;
    private Integer discountPercent;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}