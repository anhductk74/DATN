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
    private String dimensions;
    private List<VariantAttributeResponseDto> attributes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}