package com.example.smart_mall_spring.Dtos.Products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VariantAttributeResponseDto {
    private UUID id;
    private String attributeName;
    private String attributeValue;
}