package com.example.smart_mall_spring.Dtos.Products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateVariantAttributeDto {
    private String attributeName; // e.g., "Color", "Size", "Storage"
    private String attributeValue; // e.g., "Red", "Large", "256GB"
}