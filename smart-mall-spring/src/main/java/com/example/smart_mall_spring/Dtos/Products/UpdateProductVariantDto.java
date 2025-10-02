package com.example.smart_mall_spring.Dtos.Products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProductVariantDto {
    private UUID id; // If updating existing variant
    private String sku;
    private Double price;
    private Integer stock;
    private Double weight;
    private String dimensions;
    
    // Attributes like Color, Size, etc.
    private List<CreateVariantAttributeDto> attributes;
}