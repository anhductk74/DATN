package com.example.smart_mall_spring.Dtos.Products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateProductVariantDto {
    private String sku;
    private Double price;
    private Integer stock;
    private Double weight;
    private String dimensions;
    
    // Attributes like Color, Size, etc.
    private List<CreateVariantAttributeDto> attributes;
}