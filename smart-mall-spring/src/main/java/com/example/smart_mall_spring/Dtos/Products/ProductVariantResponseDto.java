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
public class ProductVariantResponseDto {
    private UUID id;
    private String sku;
    private Double price;
    private Integer stock;
    private Double weight;
    private String productName;
    private String productBrand;
    private String dimensions;
    private List<VariantAttributeResponseDto> attributes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Flash sale / Discount fields
    private Boolean isFlashSale;
    private Double flashSalePrice;
    private LocalDateTime flashSaleStart;
    private LocalDateTime flashSaleEnd;
    private Integer flashSaleQuantity;
    private Double effectivePrice;      // Giá hiệu dụng (có thể là giá sale hoặc giá gốc)
    private Boolean isFlashSaleActive;  // Flash sale có đang active không
    private Integer discountPercent;    // % discount
}